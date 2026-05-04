# Changelog

All notable changes to @dashforge/forms will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Resolver Pass-Through**: Added `resolver` prop to `DashFormProvider` to enable schema-based validation via React Hook Form's resolver contract
  - Supports validation libraries like Zod, Yup, Joi, etc. (via `@hookform/resolvers`)
  - Pure pass-through pattern - no validation libraries bundled
  - 100% backward compatible - existing field-level validation continues to work
  - When resolver provided, it becomes the primary validation source per React Hook Form behavior
  - See README.md for usage examples

## [0.1.4-alpha] - 2024-xx-xx

_Initial alpha release - earlier changes not documented_
