# EveryCRED Knowledge Base

Static documentation site (`index.html`) with sidebar navigation, environment-aware API URLs, and embedded architecture diagrams.

## Run locally

Serve over HTTP (required for ZIP exports that bundle images and the architecture diagram):

```bash
npx --yes serve .
```

Open `http://localhost:3000` (or the port shown). Do not use `file://` — asset bundling in ZIP exports will fail.

## Download / export

Use the **Download** button in the top bar.

### Full knowledge base (ZIP) — recommended

| Option | Contents |
|--------|----------|
| **Complete bundle** | Everything below in one ZIP |
| **ZIP — Markdown only** | Per-page `.md` + combined `.md` + `assets/` (images + architecture HTML) |
| **ZIP — JSON only** | Per-page `.json` + combined `manifest` / full JSON |

**Complete bundle ZIP structure** (matches the **sidebar navigation**):

```
everycred-knowledge-base-{env}-{date}.zip
└── everycred-knowledge-base/
    ├── README.md
    ├── manifest.json
    ├── combined/
    │   ├── everycred-knowledge-base.md
    │   ├── everycred-knowledge-base.json
    │   └── everycred-knowledge-base.doc
    ├── assets/
    │   ├── platform-architecture-diagram.html
    │   └── … (diagrams & images)
    ├── 01 - Overview/
    │   ├── README.md
    │   ├── Introduction.md · .json · .doc
    │   ├── Platform Architecture.md · …
    │   ├── How It Works.md · …
    │   └── Credential Lifecycle.md · …
    ├── 02 - Deployment/
    ├── 03 - Core Concepts/
    │   ├── Selective Disclosure.md · …
    │   └── …
    ├── 04 - Platform/
    ├── 05 - Workflow Engine/
    ├── 06 - API Reference/
    ├── 07 - Guides/
    ├── 08 - Roadmap/
    └── 09 - Reference/
```

Each section folder lists its pages in `README.md` (same order as the docs menu). File names use the **sidebar page titles** (e.g. `Introduction.md`, not `intro.md`).

Includes **Platform Architecture** (interactive HTML), all flow diagrams, and every doc page from Introduction through Changelog.

### Single files

| Option | Format |
|--------|--------|
| This page | `.md`, `.json`, or `.doc` |
| Full KB | `everycred-knowledge-base.md`, `.json`, or `.doc` |

Notes:

- Exports use the **selected environment** (`{{API_BASE}}`, `{{API_DOCS}}` resolved).
- Export logic: `assets/docs-export.js` (ZIP uses [JSZip](https://stuk.github.io/jszip/) from CDN).

## Content source

All pages live in the `PAGES` object inside `index.html`. To add a page, define `PAGES["your-id"]` and add an entry under `NAV`.
