const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");

// GitHub-compatible slugify function
function githubSlugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/ /g, "-") // Replace each space with hyphen
    .replace(/[^\w-]/g, ""); // Remove non-word chars except hyphens
}

// Chapter slug for the implementation guide: "/build/guide/" -> "welcome",
// "/build/guide/client/pairing/" -> "client-pairing". Used to namespace ids on
// the one-page print view.
function guideSlug(url) {
  const rest = url.replace(/^\/build\/guide\/?/, "").replace(/\/$/, "");
  return rest ? rest.replace(/\//g, "-") : "welcome";
}

function sortedGuideChapters(api) {
  const items = api.getFilteredByTag("guide");
  const seen = new Map();
  for (const item of items) {
    const order = item.data.order;
    if (typeof order !== "number") {
      throw new Error(`${item.inputPath}: guide chapters need a numeric 'order'`);
    }
    if (seen.has(order)) {
      throw new Error(`${item.inputPath}: guide order ${order} is also used by ${seen.get(order)}`);
    }
    seen.set(order, item.inputPath);
  }
  return items.sort((a, b) => a.data.order - b.data.order);
}

module.exports = function (eleventyConfig) {
  // Map every file in public/ to the dist root (e.g. public/style.css -> dist/style.css).
  // Eleventy's --watch picks up edits automatically; no `cp -r public dist` needed in scripts.
  eleventyConfig.addPassthroughCopy({ public: "/" });

  // Implementation guide: chapters are the pages tagged `guide`, ordered by
  // `order` and grouped into sidebar sections by `section` (first appearance wins).
  eleventyConfig.addCollection("guideChapters", sortedGuideChapters);
  eleventyConfig.addCollection("guideSections", (api) => {
    const sections = [];
    for (const item of sortedGuideChapters(api)) {
      const name = item.data.section || "Guide";
      let section = sections.find((s) => s.name === name);
      if (!section) sections.push((section = { name, chapters: [] }));
      section.chapters.push(item);
    }
    return sections;
  });

  eleventyConfig.addFilter("guideSlug", guideSlug);

  // H2 headings of a rendered chapter, for the "on this page" list in the sidebar.
  eleventyConfig.addFilter("guideHeadings", (html) => {
    const headings = [];
    const re = /<h2[^>]*\sid="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/g;
    let match;
    while ((match = re.exec(html))) {
      const text = match[2].replace(/<[^>]+>/g, "").replace(/^#\s*/, "").trim();
      headings.push({ id: match[1], text });
    }
    return headings;
  });

  // Prepare a chapter for the one-page view: demote headings one level so the
  // chapter title can be the h2, namespace ids so chapters cannot collide, and
  // turn links between chapters into in-page anchors.
  eleventyConfig.addFilter("guidePrintContent", (html, url) => {
    const prefix = guideSlug(url);
    return html
      .replace(/<(\/?)h([1-5])\b/g, (m, slash, level) => `<${slash}h${Number(level) + 1}`)
      .replace(/\sid="([^"]+)"/g, (m, id) => ` id="${prefix}--${id}"`)
      .replace(/href="#([^"]+)"/g, (m, id) => `href="#${prefix}--${id}"`)
      .replace(
        /href="\/build\/guide\/(?!all\/)([^"#]*?)\/?(?:#([^"]+))?"/g,
        (m, path, hash) =>
          `href="#${guideSlug(`/build/guide/${path}`)}${hash ? `--${hash}` : ""}"`
      );
  });

  const md = markdownIt({ html: true }).use(markdownItAnchor, {
    slugify: githubSlugify,
    permalink: markdownItAnchor.permalink.ariaHidden({
      class: "heading-anchor",
      symbol: "#",
      placement: "before",
      space: false,
    }),
  });

  // Convert ```mermaid blocks to <pre class="mermaid">
  const defaultFence = md.renderer.rules.fence;
  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    if (token.info === "mermaid") {
      return `<pre class="mermaid">\n${token.content}</pre>\n`;
    }
    return defaultFence(tokens, idx, options, env, self);
  };

  // Wrap tables in a scroll container. body has overflow-x: hidden, so a table
  // wider than the viewport is clipped with no way to reach the rest of it.
  md.renderer.rules.table_open = () =>
    '<div class="table-scroll" tabindex="0">\n<table>\n';
  md.renderer.rules.table_close = () => "</table>\n</div>\n";

  eleventyConfig.setLibrary("md", md);

  return {
    dir: {
      input: "src",
      output: "dist",
    },
  };
};
