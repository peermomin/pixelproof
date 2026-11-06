# Security Policy

## Supported versions

| Version | Supported |
| --- | --- |
| 1.0.x | Yes |
| < 1.0 | No |

## Reporting a vulnerability

Please do **not** open a public issue for security vulnerabilities. Report
privately through GitHub's "Report a vulnerability" option on the
[Security tab](../../security) of this repository, or contact the maintainer
directly through their GitHub profile.

Include:

- A description of the vulnerability and its potential impact.
- Steps to reproduce or a proof of concept.
- The affected version or commit.

## Response expectations

- You can expect an acknowledgement within a few days.
- Critical issues will be prioritized; please allow reasonable time for a fix
  before public disclosure.
- Fixes will be released as soon as possible and credited (unless you prefer
  to remain anonymous).

## Scope notes

Pixelproof stores credentials and review data; the most sensitive surfaces are
authentication (`/api/auth/*`), workspace authorization on project and asset
routes, and screenshot upload validation. Deployment-specific concerns (TLS,
reverse proxy, database network exposure) are covered in the README's
production deployment section.
