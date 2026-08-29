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
│   └── develop                # Development server
└── dist/                      # Built site (generated)
```

## Built With

- [Eleventy](https://www.11ty.dev/) - Static site generator
- Netlify - Hosting

## License

TODO: Add license information
