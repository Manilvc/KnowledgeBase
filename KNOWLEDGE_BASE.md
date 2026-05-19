# EveryCRED Knowledge Base

> Complete documentation for the EveryCRED platform — a production-grade digital credentialing solution for issuing, managing, and verifying W3C Verifiable Credentials.

---

## Introduction

EveryCRED is a comprehensive platform that provides organizations with a complete stack for implementing digital credentials. The knowledge base is organized into 9 sections covering everything from core concepts and platform architecture to API documentation, practical guides, and product roadmap.

**Key Features:**
- Full W3C Verifiable Credentials support
- Multiple deployment options (SaaS and On-Premises)
- Complete workflow engine for credential management
- Mobile-first holder wallet application
- White-label verifier capabilities
- Role-based access control (RBAC)
- Field-level encryption
- Blockchain anchoring support

---

## Navigation & Content Structure

### 1. Overview
Getting started with EveryCRED and foundational platform information.

| Article | Description |
|---------|-------------|
| **Introduction** | EveryCRED platform overview, capabilities, and the complete stack (issuer portal, approval workflows, holder wallet, verification API) |
| **Platform Architecture** | Interactive system map and detailed architecture diagram showing system components and their interactions |
| **How It Works** | Complete ecosystem view explaining credential flows, roles, and end-to-end processes |
| **Credential Lifecycle** | Detailed walkthrough of credential states and transitions from issuance through verification |

---

### 2. Deployment
Deployment options and regional coverage information.

| Article | Description |
|---------|-------------|
| **SaaS vs On-Premises** | Comparison of deployment models, capabilities, and considerations for choosing the right deployment option |
| **Regional Coverage** | Global regions supported and data residency information |

---

### 3. Core Concepts
Fundamental concepts and standards underlying W3C Verifiable Credentials.

| Article | Description |
|---------|-------------|
| **Verifiable Credentials** | W3C standard for cryptographically verifiable digital credentials with claims about subjects |
| **Credential Formats** | Supported credential formats, serialization methods, and format specifications |
| **Decentralized Identifiers (DIDs)** | DID standards, resolution, and usage in credential verification and issuer identification |
| **Selective Disclosure** | Mechanism for credential holders to prove claims without revealing complete credential data |
| **Blockchain Anchoring** | Process for anchoring credential metadata on blockchain for tamper-evidence and audit trails |
| **Roles & Permissions (RBAC)** | Role-based access control system, permission hierarchy, and organizational access management |

---

### 4. Platform
Core platform components and applications.

| Article | Description |
|---------|-------------|
| **DCS — Overview** | Digital Credentialing Solution overview and core capabilities |
| **Contributor Application** | Application for organizations to contribute credentialing data and participate in the ecosystem |
| **Holder Web Application** | Browser-based holder interface for managing credentials and participating in verification flows |
| **Wallet App (Mobile)** | Mobile-first holder wallet application for iOS and Android |
| **Verifier (White-Label + Own)** | Verification platform with white-label and custom deployment options |
| **DID Methods & Resolver** | DID method support and resolver service for credential verification |
| **SDK & Developer Tools** | Developer SDKs, libraries, and tools for platform integration |

---

### 5. Workflow Engine
Credential workflow creation and management system.

| Article | Description |
|---------|-------------|
| **Overview** | Workflow engine capabilities, state machines, and workflow-driven issuance |
| **Building a Workflow** | Step-by-step guide to creating credential workflows with conditions, approvals, and automation |
| **End-to-End Flows** | Real-world workflow examples: issuer-driven, holder-initiated, and complete lifecycle flows |
| **API Reference** | Workflow API endpoints for creating, updating, executing, and monitoring workflows |

---

### 6. API Reference
Complete REST API documentation for all platform services.

| Article | Description |
|---------|-------------|
| **OpenAPI (live)** | Interactive OpenAPI documentation with live Swagger UI and endpoint exploration |
| **Authentication API** | User authentication, session management, and token-based access control |
| **Issuer API** | Credential issuance, issuer profile management, and issuer configuration |
| **Subject Templates API** | Subject template definition and management for credential subjects |
| **Records API** | Credential record storage, retrieval, and lifecycle management |
| **Credentials API** | Credential operations including creation, revocation, and status management |
| **Holder API** | Holder wallet operations, credential acceptance, and presentation workflows |
| **Verifier API** | Credential verification, proof validation, and public verification endpoints |
| **RBAC API** | Role and permission management, user assignments, and access control configuration |

---

### 7. Guides
Practical step-by-step guides for common tasks and workflows.

| Article | Description |
|---------|-------------|
| **Issue Your First Credential** | Getting started guide for issuers — create first credential and verify functionality |
| **Bulk Issuance via CSV** | Batch credential issuance using CSV file import and processing |
| **Verify a Credential** | Step-by-step verification process using the public verifier API and holder flows |
| **Set Up a Workflow** | Complete workflow creation guide with examples and best practices |
| **Field-Level Encryption** | Implementing encryption for sensitive credential fields and decryption workflows |

---

### 8. Roadmap
Product roadmap and feature status for 2026.

| Article | Description |
|---------|-------------|
| **2026 Roadmap Overview** | High-level roadmap priorities and strategic initiatives for 2026 |
| **Q1 2026** | Features, improvements, and deliverables planned for Q1 2026 |
| **Q2–Q4 2026** | Features, improvements, and deliverables planned for remaining quarters of 2026 |
| **Module Completion Status** | Detailed status tracking of all modules, features, and components |

---

### 9. Reference
Additional reference materials and supporting documentation.

| Article | Description |
|---------|-------------|
| **Glossary** | Comprehensive glossary of terms, acronyms, and concepts used throughout the platform |
| **Standards & Compliance** | Standards compliance information (W3C, ISO, regulatory), certifications, and compliance matrix |
| **Changelog** | Release notes, version history, and breaking changes documentation |

---

## Content Export & Download

The knowledge base supports multiple export formats accessible via the **Download** button:

### Per-Page Exports
- **Markdown (.md)** — Page title and content in Markdown format
- **JSON (.json)** — Structured data including page ID, title, section, badge, and metadata
- **Word (.doc)** — HTML formatted for Microsoft Word compatibility

### Full Knowledge Base Exports
- **Markdown (.md)** — `everycred-knowledge-base.md` — All pages in navigation order, separated by `---`
- **JSON (.json)** — `everycred-knowledge-base.json` — Complete navigation tree and all pages
- **Word (.doc)** — `everycred-knowledge-base.doc` — All pages in a single Word-compatible document

### Export Notes
- All exports resolve environment variables (`{{API_BASE}}`, `{{API_DOCS}}`) based on the currently selected environment
- Interactive architecture diagrams are replaced with references to `assets/platform-architecture-diagram.html`
- Word documents use HTML formatting compatible with Microsoft Word and LibreOffice
- For `.docx` format, convert the `.md` export using Pandoc: `pandoc everycred-knowledge-base.md -o everycred-knowledge-base.docx`

---

## Using the Knowledge Base

### Local Hosting
Serve the documentation locally over HTTP (recommended for iframes and embedded assets):

```bash
npx --yes serve .
```

Open `http://localhost:3000` (or the displayed port).

### Environment Selection
Use the environment picker in the top bar to switch between deployment environments. This updates:
- API base URLs in examples and documentation links
- Export file contents (environment-specific values are resolved)
- Live API documentation links

### Content Management
All pages are stored in the `PAGES` object within `index.html`. To add a new page:

1. Define a new entry: `PAGES["page-id"] = {title:"Page Title", badge:"Category", body:` ... `}`
2. Add a navigation entry under the `NAV` array with appropriate section and grouping
3. Refresh to view the new page

---

## Total Pages & Coverage

**Total Pages:** 48 articles across 9 sections

- **Overview:** 4 pages
- **Deployment:** 2 pages
- **Core Concepts:** 6 pages
- **Platform:** 7 pages
- **Workflow Engine:** 4 pages
- **API Reference:** 9 pages
- **Guides:** 5 pages
- **Roadmap:** 4 pages
- **Reference:** 3 pages

---

## Technology Stack

- **Frontend:** HTML5, CSS3, JavaScript (vanilla)
- **Standards:** W3C Verifiable Credentials, OpenAPI/Swagger
- **Hosting:** Static site (HTTP-served)
- **Architecture:** Client-side navigation with embedded diagrams and interactive tools

---

## Related Resources

- **OpenAPI Documentation:** Live, interactive API explorer (linked from API Reference section)
- **Platform Architecture Diagram:** Interactive system map showing component relationships and data flows
- **External Standards:** W3C VC Data Model, DID Specification, OpenID Connect

---

*Last Updated: 2026-05-19 | Source: Knowledge Base Directory (index.html, README.md)*
