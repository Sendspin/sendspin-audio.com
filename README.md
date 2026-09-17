# Sendspin Protocol Website

Official website for the Sendspin music experience protocol, built with [Eleventy](https://www.11ty.dev/).

## Development

### Prerequisites

- Node.js (version pinned in `.nvmrc`)
- npm

### Setup

```bash
npm install
```

### Local Development

To run a local development server:

```bash
./script/develop
```

The site will be available at http://localhost:5005

### Build

To build the site for production:

```bash
./script/build
```

The built site will be in the `dist/` directory.

### Updating the specification

The website publishes a stable specification, while
[Sendspin/spec](https://github.com/Sendspin/spec) also contains development work.
Choose a release tag or commit explicitly when syncing the website. For example:

```bash
./script/sync-spec 1.0.0-rc1
```

The script preserves the page's front matter and copies the specification body
exactly, omitting only the upstream generated-file notice and top-level title
(the website supplies its own title). It resolves the chosen revision to a full
commit ID and records a link to that commit in an HTML comment immediately after
the front matter. Check mode verifies both this comment and the specification
body. Edit the specification in the upstream repository, then run this script
to update the website copy.

To verify that the page matches that same release without changing any files:

```bash
./script/sync-spec 1.0.0-rc1 --check
```

Both commands require network access. Check mode exits nonzero on a mismatch or
a fetch error. Neither command runs in CI or during the production build; the
build uses the checked-in specification. Syncing is an explicit step before
committing a release update.

## Deployment

The site deploys automatically to Netlify when changes are pushed to the `main` branch. Netlify's Git integration runs the build; there is no workflow file or `netlify.toml` in the repo, so the build command and publish directory are set in the Netlify dashboard.

Redirects live in `public/_redirects`, which ships to the site root.

## Project Structure

```
.
├── src/                       # Source files
│   ├── _data/                 # Footer links, allowed referrers
│   ├── _includes/             # Layout, brand markup, SVG icons
│   │   └── base.html          # Main layout template
│   ├── build/                 # Builder section, served at /build/
│   │   ├── index.md           # Section hub
│   │   ├── manufacturers.md   # Why build on Sendspin
│   │   ├── guide.md           # Client implementation guide
│   │   ├── sdks.md            # SDKs and libraries
│   │   └── spec.md            # Protocol specification
│   ├── index.html             # Homepage
│   └── 404.html
├── public/                    # Static assets, copied to the site root
│   ├── style.css              # Tokens, chrome, and shared primitives
│   ├── homepage.css           # Homepage section styles
│   ├── _redirects             # Netlify redirects
│   ├── js/                    # Live demo card, mermaid
│   └── images/                # Images and partner logos
├── script/                    # Build scripts
│   ├── build                  # Production build
│   ├── develop                # Development server
│   └── sync-spec              # Sync or check the upstream specification
└── dist/                      # Built site (generated)
```

## Built With

- [Eleventy](https://www.11ty.dev/) - Static site generator
- Netlify - Hosting

## License

TODO: Add license information
