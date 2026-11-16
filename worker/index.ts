import catalogFile from '../.cache/livedin-catalog.json' with { type: 'json' };
import {
  SYSTEM_PROMPT,
  loadCatalog,
  parseBody,
  parseModelOutput,
  plan,
  resolve,
  toClient,
} from './recommend.ts';

// @cf/meta/llama-3.1-8b-instruct-fast is no longer in the Workers AI catalog.
// Gemma 4 26B A4B (4B active) is the small instruct model in the current
// Workers AI getting-started guide, and it accepts response_format json_schema.
const MODEL = '@cf/google/gemma-4-26b-a4b-it';
const MAX_BODY = 4096;

const catalog = loadCatalog(catalogFile);

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname !== '/api/livedin/recommend') {
      return new Response('not found', { status: 404 });
    }
    if (request.method !== 'POST') {
      return json({ error: 'post only' }, 405);
    }
    if (crossSite(request)) {
      return json({ error: 'nope' }, 403);
    }

    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const { success } = await env.RECOMMEND_LIMIT.limit({ key: ip });
    if (!success) {
      console.log(JSON.stringify({ message: 'livedin rate limited' }));
      return json({ error: 'slow down a second' }, 429);
    }

    const type = request.headers.get('content-type') || '';
    if (!type.includes('application/json')) {
      return json({ error: 'send json' }, 415);
    }

    const bytes = await readBody(request, MAX_BODY);
    if (!bytes) return json({ error: 'keep it short' }, 413);

    let payload: unknown;
    try {
      payload = JSON.parse(new TextDecoder().decode(bytes));
    } catch {
      return json({ error: 'that was not json' }, 400);
    }

    const parsed = parseBody(payload);
    if (!parsed.ok) return json({ error: parsed.error }, 400);
    if (!catalog.length) return json({ error: 'the list is empty' }, 500);

    const planned = plan(catalog, parsed.value);
    if (!planned.candidates.length) {
      return json({ error: "that's every spot that fits — try a different mood" }, 422);
    }

    const model = await askModel(env, planned.prompt);
    const picked = resolve(planned.candidates, parsed.value, model);
    if (!picked) {
      return json({ error: "that's every spot that fits — try a different mood" }, 422);
    }

    console.log(JSON.stringify({
      message: 'livedin recommend',
      candidates: planned.candidates.length,
      source: picked.source,
      adjust: parsed.value.adjust,
    }));

    return json(toClient(picked));
  },
} satisfies ExportedHandler<Env>;

async function askModel(env: Env, prompt: string): Promise<{ id: string; reason: string } | null> {
  try {
    const result = await withTimeout(env.AI.run(MODEL, {
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'livedin_pick',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              id: { type: 'string' },
              reason: { type: 'string' },
            },
            required: ['id', 'reason'],
          },
        },
      },
      chat_template_kwargs: { enable_thinking: false },
      max_tokens: 180,
      temperature: 0.4,
    }), 12000);
    return parseModelOutput(result);
  } catch (error) {
    console.error(JSON.stringify({
      message: 'livedin ai failed',
      error: error instanceof Error ? error.message : 'unknown',
    }));
    return null;
  }
}

function withTimeout<T>(work: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('ai timeout')), ms);
  });
  return Promise.race([work, timeout]).finally(() => clearTimeout(timer));
}

function crossSite(request: Request): boolean {
  const site = request.headers.get('sec-fetch-site');
  if (site && site !== 'same-origin' && site !== 'none') return true;
  const origin = request.headers.get('origin');
  if (!origin) return false;
  return origin !== new URL(request.url).origin;
}

async function readBody(request: Request, max: number): Promise<Uint8Array | null> {
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    received += value.byteLength;
    if (received > max) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const buf = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    buf.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return buf;
}

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: { 'cache-control': 'no-store' },
  });
}
