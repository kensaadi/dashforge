# Dashforge Documentation Versioning Guide

This document explains how Dashforge documentation versioning currently works
and how it must evolve when a new framework version is released.

This file is intended for OpenCode agents and maintainers.

---

# 1. Current Documentation Version

The documentation currently targets:

v0.1.0-alpha

This value is defined in a single source of truth.

File:

web/src/docs/docsVersion.ts

Example:

```ts
export const DOCS_VERSION = 'v0.1.0-alpha';

This constant represents:

the documentation version

the framework version currently documented

the version that must match the npm package version

Important rule:

The documentation version MUST match the framework version published on npm.

2. Where the Version Appears in the UI

The version is displayed in the documentation header.

Location:

web/src/pages/Docs/DocsPage.tsx

UI element:

MUI Chip

Position:

[Theme Toggle] [Version Chip]

Example:

🌙  v0.1.0-alpha

This chip is purely informational and does not implement version switching yet.

3. Architecture Philosophy

The documentation currently represents a single version of the framework.

This keeps the system simple while Dashforge is still evolving.

We are intentionally not implementing a version selector yet.

However, the architecture is prepared for future multi-version documentation.

4. When a New Version of Dashforge Is Released

When Dashforge publishes a new version (example: v0.2.0), follow this process.

Step 1 — Update the documentation version constant

Edit:

web/src/docs/docsVersion.ts

Change:

export const DOCS_VERSION = 'v0.1.0-alpha';

to

export const DOCS_VERSION = 'v0.2.0';

This updates the version chip across the documentation automatically.

5. Handling Documentation Changes for New Versions

When a new version introduces changes to the framework:

If documentation changes are small

Update the relevant documentation pages directly.

Example areas that may change:

Installation

Usage

Component APIs

Examples

If changes are large (breaking changes)

Create a snapshot of the previous documentation before modifying it.

Possible future structure:

docs/
    v0.1/
    v0.2/

Example future routes:

/docs/v/0.1/
/docs/v/0.2/
/docs/latest/

This system is not implemented yet, but the version constant was designed to support this future architecture.

6. Rule: Documentation Version Must Match NPM Version

When publishing Dashforge packages to npm:

@dashforge/ui
@dashforge/theme-core
@dashforge/ui-core

The version published must match the documentation version.

Example:

npm publish -> v0.1.0-alpha
docsVersion.ts -> v0.1.0-alpha

Mismatch between documentation and npm versions must be avoided.

7. Future Evolution (Do Not Implement Yet)

When Dashforge reaches stable adoption, the documentation system may evolve to include:

Version selector

Example:

[v1.0] [v0.9] [v0.8]
Multi-version routing

Example:

/docs/v/1/
/docs/v/0.9/
Latest alias
/docs/latest/

At that stage, the version chip in the header may become a dropdown selector.

8. Key Principles

Always follow these rules:

The documentation version is defined in one place only

The docs version must match the npm package version

The current documentation always represents the latest version

Multi-version docs should only be introduced when necessary

9. Summary

Current system:

Single documentation version
Displayed in header
Source of truth = docsVersion.ts

Future system (not implemented yet):

Multiple documentation versions
Version selector
Versioned routes

This architecture keeps Dashforge documentation simple today
while remaining ready for future framework evolution.


---

# Seconda cosa (memoria versione)

Ho salvato questa informazione:

**Versione framework/documentazione fissata oggi**


v0.1.0-alpha


Regola che ci siamo dati:


docs version == npm package version


Quindi quando pubblicherai:


@dashforge/ui
@dashforge/theme-core
@dashforge/ui-core


la **prima release npm dovrà essere**:


v0.1.0-alpha


così:

- docs
- examples
- npm

restano perfettamente allineati.
```
