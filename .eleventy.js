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

module.exports = function (eleventyConfig) {
  // Map every file in public/ to the dist root (e.g. public/style.css -> dist/style.css).
  // Eleventy's --watch picks up edits automatically; no `cp -r public dist` needed in scripts.
  eleventyConfig.addPassthroughCopy({ public: "/" });

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

  eleventyConfig.setLibrary("md", md);

  return {
    dir: {
      input: "src",
      output: "dist",
    },
  };
};
