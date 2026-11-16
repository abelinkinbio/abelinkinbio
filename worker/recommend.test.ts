import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  type AskInput,
  type CatalogPlace,
  buildPrompt,
  parseBody,
  parseModelOutput,
  resolve,
  selectCandidates,
  timePhrase,
  toClient,
} from './recommend.ts';

const SAMPLE = "it's midnight and i want a quick bite on my way home to principe real";

function place(partial: Pick<CatalogPlace, 'id' | 'name' | 'category' | 'city'> & Partial<CatalogPlace>): CatalogPlace {
  return {
    emoji: '📍',
    tags: [],
    description: 'SECRET_BODY_TEXT',
    ...partial,
  };
}

function ask(partial: Partial<AskInput> = {}): AskInput {
  return {
    mood: '',
    hour: 21,
    weekday: 5,
    city: null,
    from: null,
    exclude: [],
    adjust: null,
    ...partial,
  };
}

test('time phrase matches a friday night', () => {
  assert.equal(timePhrase(23, 5), "it's 11pm on a friday");
  assert.equal(timePhrase(0, 0), "it's 12am on a sunday");
  assert.equal(timePhrase(12, 1), "it's 12pm on a monday");
});

test('morning keeps coffee and drops dinner', () => {
  const places = [
    ...Array.from({ length: 6 }, (_, i) => place({
      id: `atx/coffee-${i}`,
      name: `Coffee ${i}`,
      category: 'coffee',
      city: 'atx',
    })),
    ...Array.from({ length: 6 }, (_, i) => place({
      id: `atx/dinner-${i}`,
      name: `Dinner ${i}`,
      category: 'dinner',
      city: 'atx',
    })),
  ];
  const picked = selectCandidates(places, ask({ hour: 9, weekday: 2 }));
  assert.ok(picked.length >= 4);
  assert.ok(picked.every((item) => item.category === 'coffee'));
});

test('late night keeps late-nite, delivery, and drinks', () => {
  const places = [
    place({ id: 'dc/copycat', name: 'Copycat Co.', category: 'late-nite', city: 'dc', tags: ['late-nite'] }),
    place({ id: 'dc/wise', name: 'Wise Guys', category: 'delivery', city: 'dc' }),
    place({ id: 'dc/chaplains', name: 'Chaplains', category: 'drinks', city: 'dc' }),
    place({ id: 'dc/lunch', name: 'Lunch Spot', category: 'lunch', city: 'dc' }),
  ];
  const picked = selectCandidates(places, ask({ hour: 23, city: 'dc' }));
  assert.deepEqual(picked.map((item) => item.id).sort(), ['dc/chaplains', 'dc/copycat', 'dc/wise']);
});

test('lunch in the text is kept in the morning', () => {
  const places = [
    ...Array.from({ length: 6 }, (_, i) => place({
      id: `atx/coffee-${i}`,
      name: `Coffee ${i}`,
      category: 'coffee',
      city: 'atx',
    })),
    place({ id: 'atx/lunch', name: 'Lunch Spot', category: 'lunch', city: 'atx' }),
  ];
  const picked = selectCandidates(places, ask({ hour: 8, mood: 'lunch please', city: 'atx' }));
  assert.deepEqual(picked.map((item) => item.id), ['atx/lunch']);
});

test('a named area tag narrows the list to that city', () => {
  const places = [
    place({ id: 'lisbon/calmo', name: 'Calmo', category: 'coffee', city: 'lisbon', tags: ['lapa'] }),
    place({ id: 'lisbon/da-noi', name: 'Da Noi', category: 'dinner', city: 'lisbon', tags: ['lapa', 'late-nite'] }),
    place({ id: 'atx/cenote', name: 'Cenote', category: 'coffee', city: 'atx', tags: ['east'] }),
  ];
  const picked = selectCandidates(places, ask({ mood: 'something in lapa', hour: 12 }));
  assert.ok(picked.every((item) => item.city === 'lisbon'));
  assert.ok(picked.some((item) => item.id === 'lisbon/calmo'));
});

const LATE = new Set(['late-nite', 'delivery', 'drinks']);

function samplePlaces(): CatalogPlace[] {
  return [
    place({ id: 'atx/easy-tiger', name: 'Easy Tiger', category: 'drinks', city: 'atx', tags: ['drinks'] }),
    place({ id: 'dc/copycat', name: 'Copycat Co.', category: 'late-nite', city: 'dc', tags: ['late-nite'] }),
    place({ id: 'lisbon/buna', name: 'Buna', category: 'coffee', city: 'lisbon', tags: ['coffee', 'são-bento'] }),
    place({ id: 'lisbon/da-noi', name: 'Da Noi', category: 'late-nite', city: 'lisbon', tags: ['late-nite', 'lapa'] }),
    place({ id: 'lisbon/skizzo', name: 'Skizzo', category: 'drinks', city: 'lisbon', tags: ['late-nite', 'lapa'] }),
    place({ id: 'lisbon/bite', name: 'Quick Bite', category: 'delivery', city: 'lisbon', tags: ['delivery'] }),
  ];
}

test('the sample prompt picks a Lisbon late-nite-appropriate place', () => {
  const places = samplePlaces();
  const input = ask({ mood: SAMPLE, hour: 15, weekday: 1, city: 'atx' });
  const candidates = selectCandidates(places, input);
  assert.ok(candidates.every((item) => item.city === 'lisbon'));
  assert.ok(candidates.every((item) => LATE.has(item.category)));
  const first = resolve(candidates, input, null);
  assert.equal(first?.place.city, 'lisbon');
  assert.ok(LATE.has(first?.place.category ?? ''));
  assert.notEqual(first?.place.id, 'atx/easy-tiger');
  assert.notEqual(first?.place.id, 'dc/copycat');

  const again = ask({
    ...input,
    adjust: 'closer',
    exclude: [first!.place.id],
  });
  const next = resolve(selectCandidates(places, again), again, null);
  assert.equal(next?.place.city, 'lisbon');
  assert.notEqual(next?.place.id, first?.place.id);
  assert.ok(LATE.has(next?.place.category ?? ''));
});

test('the sample line is conversation, with tags and no distance', () => {
  const places = [
    place({
      id: 'lisbon/da-noi',
      name: 'Da Noi',
      category: 'dinner',
      city: 'lisbon',
      tags: ['late-nite', 'lapa'],
      description: 'SECRET_BODY_TEXT',
    }),
    place({ id: 'atx/lunch', name: 'Lunch', category: 'lunch', city: 'atx' }),
  ];
  const input = ask({
    mood: SAMPLE,
    hour: 15,
    weekday: 2,
    from: '/blog/how-i-wind-down',
  });
  const prompt = buildPrompt(selectCandidates(places, input), input);
  assert.match(prompt, /Local time: it's 3pm on a tuesday\./);
  assert.match(prompt, /They wrote: it's midnight and i want a quick bite on my way home to principe real/);
  assert.match(prompt, /Came from: \/blog\/how-i-wind-down/);
  assert.match(prompt, /tags=late-nite,lapa/);
  assert.match(prompt, /area=Lisbon/);
  assert.equal(prompt.includes('SECRET_BODY_TEXT'), false);
  assert.equal(/\bkm\b|coords|latitude|longitude/.test(prompt), false);
});

test('too far is a conversational follow-up', () => {
  const places = [
    place({ id: 'lisbon/da-noi', name: 'Da Noi', category: 'dinner', city: 'lisbon', tags: ['lapa'] }),
    place({ id: 'lisbon/buna', name: 'Buna', category: 'coffee', city: 'lisbon', tags: ['são-bento'] }),
  ];
  const input = ask({ mood: SAMPLE, adjust: 'closer', exclude: ['lisbon/da-noi'] });
  const candidates = selectCandidates(places, input);
  assert.equal(candidates.some((item) => item.id === 'lisbon/da-noi'), false);
  const prompt = buildPrompt(candidates, input);
  assert.match(prompt, /too far from the area they mentioned/);
  assert.match(prompt, /area tags/);
  assert.match(prompt, /Skip these ids: lisbon\/da-noi/);
  assert.equal(/kilometers|coords/.test(prompt), false);
});

test('an invalid model id falls back to a real candidate', () => {
  const places = [
    place({ id: 'atx/a', name: 'A', category: 'bar', city: 'atx' }),
    place({ id: 'atx/b', name: 'B', category: 'bar', city: 'atx' }),
  ];
  const input = ask({ hour: 23 });
  const candidates = selectCandidates(places, input);
  const first = resolve(candidates, input, null);
  const again = resolve(candidates, input, null);
  assert.equal(first?.place.id, again?.place.id);
  assert.equal(first?.source, 'fallback');

  const invalid = resolve(candidates, input, { id: 'nope/nope', reason: 'invented' });
  assert.equal(invalid?.source, 'fallback');
  assert.ok(candidates.some((item) => item.id === invalid?.place.id));

  const valid = resolve(candidates, input, { id: 'b', reason: 'Line one.\n<script>' });
  assert.equal(valid?.source, 'model');
  assert.equal(valid?.place.id, 'atx/b');
  assert.equal(valid?.reason, 'Line one. script');
});

test('model payloads parse from json mode and chat completions', () => {
  assert.deepEqual(parseModelOutput({ response: { id: 'atx/a', reason: 'Yes' } }), { id: 'atx/a', reason: 'Yes' });
  assert.deepEqual(parseModelOutput({
    choices: [{ message: { content: '{"id":"dc/royal","reason":"Go"}' } }],
  }), { id: 'dc/royal', reason: 'Go' });
});

test('the client card omits tags', () => {
  const places = [place({ id: 'atx/a', name: "Whisler's", category: 'drinks', city: 'atx', tags: ['east'] })];
  const input = ask({ hour: 23 });
  const resolved = resolve(selectCandidates(places, input), input, { id: 'atx/a', reason: 'Tonight.' });
  const client = toClient(resolved!);
  assert.equal('tags' in client.place, false);
  assert.equal('distanceKm' in client.place, false);
  assert.equal(client.place.area, 'ATX');
  assert.match(client.place.mapsUrl, /google\.com\/maps/);
  assert.match(client.place.appleMapsUrl, /maps\.apple\.com/);
  assert.match(decodeURIComponent(client.place.mapsUrl), /Whisler's, Austin/);
});

test('parseBody caps mood and drops a bad referrer', () => {
  const ok = parseBody({
    mood: '  cozy   spot ',
    time: { hour: 23, weekday: 5 },
    from: 'https://example.com/secret',
    exclude: ['atx/ok', 'not an id'],
    adjust: 'closer',
  });
  assert.equal(ok.ok, true);
  if (!ok.ok) return;
  assert.equal(ok.value.mood, 'cozy spot');
  assert.equal(ok.value.from, null);
  assert.deepEqual(ok.value.exclude, ['atx/ok']);

  const long = parseBody({ mood: 'x'.repeat(241), time: { hour: 1, weekday: 1 } });
  assert.equal(long.ok, false);
});
