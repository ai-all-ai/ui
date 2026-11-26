# Security policy

## Supported versions

Only the latest 0.x release receives security fixes.

## Reporting a vulnerability

Do not open a public issue. Use GitHub's private vulnerability reporting: open the **Security** tab of this repository and choose **Report a vulnerability**. The maintainer aims to reply within 7 days.

## In scope

- A component that renders user input as HTML, or a pattern in the brandbook that would lead to an insecure page if copied as written.
- The `ui` CLI writing files outside the project, or following symbolic links to unexpected places.

## Out of scope

- A specific site built with `@ai.all/ui`. Report those to the site's owner.
