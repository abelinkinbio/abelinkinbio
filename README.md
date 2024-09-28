## Cactus

A hugo theme for personal blog. Fork from hexo theme [cactus](https://github.com/probberechts/hexo-theme-cactus) created by @probberechts.

[Live demo on github pages](https://www.takuzen.me/hugo-theme-cactus/).

Some works are still in progress. See [TODOS](#todos) below.

```
hugo server
```

5. publish your site in your prefered way. See hugo's doc: [Hosting & Deployment](https://gohugo.io/hosting-and-deployment/)

## Config (config/default/params.toml)

### Color themes

```toml
  colortheme = "white" # dark, light, white, or classic
```

### Custom CSS

```toml
  css = ["css/custom.css"]
```

You can add multiple custom stylesheets which will be loaded after the main theme css.
For example, the above line will load the CSS-file placed at `/static/css/custom.css`.

### Navigation ( config/default/menus.en.toml )

```toml
# Main menu which appears below site header.
[[main]]
name = "Home"
url = "/"
weight = 1

[[main]]
name = "All posts"
url = "/posts"
weight = 2

[[main]]
name = "Tags"
url = "/tags"
weight = 3

[[main]]
name = "About"
url = "/about"
weight = 4
```

### Homepage settings (config/default/params.toml)

* description: description will be displayed in the homepage. Markdown syntax is supported in the description string.

```toml
description = "Hugo is a general-purpose website framework. Technically speaking, Hugo is a static site generator. Unlike systems that dynamically build a page with each visitor request, Hugo builds pages when you create or update your content. Since websites are viewed far more often than they are edited, Hugo is designed to provide an optimal viewing experience for your website’s end users and an ideal writing experience for website authors."
```

* set your main section (used as the link for the "writings" title on the homepage)

```toml
  mainSection = "posts"
```

* change the default main section title from Writings, to something else:

```toml
  mainSectionTitle = "Blog"
```

* Show only the 5 most recent posts (default)

```toml
  showAllPostsOnHomePage = false
  postsOnHomePage = 5
```

* show all posts

```toml
  showAllPostsOnHomePage = true
  postsOnHomePage = 5 # this option will be ignored
```

* show tagsoverview (default) or not
*

```toml
  tagsOverview = true
```

* display the table of contents inline on blog posts, rather than as part of the navigation menu:

```toml
  tocInline = true
```

* show projects list (default) or not.

```toml
  showProjectsList = true
  projectsUrl = "https://github.com/monkeyWzr"
```

Projects section will not be shown if no data file is detected. See [Projects list](#projects-list) below.

### Projects list

Create your projects data file `data/projects.yaml|toml|json`. Hugo support yaml, toml and json formats.
for former hexo cactus users: please assign your json array to a `list` key.

for example, `data/projects.json`:

```json
{
   "list": [
      {
         "name":"Hexo",
         "url":"https://hexo.io/",
         "desc":"A fast, simple & powerful blog framework"
      },
      {
         "name":"Font Awesome",
         "url":"http://fontawesome.io/",
         "desc":"The iconic font and CSS toolkit"
      }
   ]
}
```

### Social media links (config/default/params.toml)

```toml
[[social]]
  name = "github"
  link = "https://github.com/monkeyWzr"

[[social]]
  name = "email"
  link = "monkeywzr@gmail.com" # no need for "mailto:" at the start

[[social]]
  name = "linkedin"
  link = "https://www.linkedin.com/in/monkeywzr/"
```

The `name` key expects the name of a [Font Awesome icon](https://fontawesome.com/icons?d=gallery&s=brands).

### Copyright (hugo.toml)

Assign your copy right to `.Site.Copyright`. Cactus will append current year to the head.

TODO: Customizable copyright year

```toml
copyright = "Zeran Wu" # cactus theme will use site title if copyright is not set
```

### Comments (config/default/params.toml)

Comments is disabled by default. Enable comments in your `.Site.Params`.

```toml
[comments]
  enabled = true
  # engine = "disqus" # in progress
```

You can also enable/disable comments per post. in your posts' front matter, add:

```yaml
comments: true
```

The site config is ignored when `comments` option exists in front matter.

The default engine is disqus. **By now only disqus is supported in cactus.** I will add more options sooner or later. See [Comments Alternatives](https://gohugo.io/content-management/comments/#comments-alternatives)

Before using disqus, you need to register and get your [disqus shortname](https://help.disqus.com/en/articles/1717111-what-s-a-shortname). Assign your shortname in `.Site.disqusShortname`, or cactus will use `.Site.Title` by default.

```toml
disqusShortname = "wzr" # cactus will use site title if not set
```

### highlight (hugo.toml)

Use hugo's built-in [syntax highlighting](https://gohugo.io/getting-started/configuration-markup#highlight).

default config:

```toml
[markup]
  [markup.highlight]
    codeFences = true
    guessSyntax = false
    hl_Lines = ""
    lineNoStart = 1
    lineNos = false
    lineNumbersInTable = true
    noClasses = true
    style = "monokai"
    tabWidth = 4
```

### Analytics (config/default/params.toml)

Cactus uses hugo's bulit in analytics templates. Check [hugo's documents](https://gohugo.io/templates/internal#google-analytics) for details.

Set you tracking id in your site config.

```toml
googleAnalytics = "UA-XXXXXXXX-XX" # or G-XXXXXXXX if you are using Google Analytics v4 (gtag.js)
```

If you are using Google Analytics v3 (analytics.js), you can switch to asynchronous tracking by set `params.googleAnalyticsAsync` to `true`.

```toml
googleAnalyticsAsync = true # not required
```

### RSS (config/default/params.toml)

The rss feed is not generated by default. you can enable it in your site config:

```toml
  rss = true
```

The rss link will be `https://example.com/index.xml` assuming your `baseURL` is set to `https://example.com/`

Please also check [Configure RSS](https://gohugo.io/templates/rss/#configure-rss)

### Mathjax (config/default/params.toml)

Cactus supports mathjax. Just add `mathjax` option in your site config:

```toml
  mathjax = true  # not required
```

You can also enable/disable mathjax per post. In your posts' front matter, add:

```yaml
mathjax: true # or false
```

The site config will be ignored when `mathjax` option exists in front matter.

### Archive (config/default/params.toml)

Pagination on posts archive can be disabled to show all posts in chronological order

```toml
  showAllPostsArchive = true # or false (default)
```
