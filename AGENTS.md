# AGENTS

## Project Context

This repository contains automation rules for Wiren Board.

Rules are authored in TypeScript and then compiled to ES5 JavaScript for execution in the `wb-rules` runtime.

The rules project is located in `wb/rules/`.

Source files are located in `wb/rules/src/`.
Compiled output is located in `wb/rules/dist/es5/`.
Project config files such as `package.json`, `tsconfig.json`, and `mirta.config.json` are also under `wb/rules/`.

## Guidance For AI Agents

When working with rules in this repository:

- Treat `wb/rules/src/wb-rules/**/*.ts` and `wb/rules/src/wb-rules-modules/**/*.ts` as the source of truth.
- Do not manually edit files in `wb/rules/dist/es5/`. They are compiled artifacts and should only change as a result of the build process.
- Keep compatibility with ES5/Duktape in mind. Do not rely on modern runtime features unless they are transpiled safely and supported in the target environment.
- Run package scripts from `wb/rules/`, for example `pnpm build` or `pnpm test`.
- If you add helper functions or change rule logic, verify that the generated JavaScript in `wb/rules/dist/es5/` remains compatible with the Wiren Board runtime.
- When you need documentation for writing or maintaining Wiren Board rules, use the official `wb-rules` repository: https://github.com/wirenboard/wb-rules

## Practical Notes

- Runtime scripts executed on the controller are JavaScript, not TypeScript.
- TypeScript in this project is a development convenience layer; deployment target is ES5 JavaScript.
- Prefer implementation patterns that are simple, explicit, and safe for the `wb-rules` engine.
