# AGENTS

## Project Context

This repository contains automation rules for Wiren Board.

Rules are authored in TypeScript and then compiled to ES5 JavaScript for execution in the `wb-rules` runtime.

The rules project is located in `wirenboard/rules/`.

Source files are located in `wirenboard/rules/src/`.
Tests are located in `wirenboard/rules/tests/`.
Compiled output is located in `wirenboard/rules/dist/es5/`.
Project config files such as `package.json`, `tsconfig.json`, and `mirta.config.json` are also under `wirenboard/rules/`.

## Guidance For AI Agents

When working with rules in this repository:

- Treat `wirenboard/rules/src/wb-rules/**/*.ts` and `wirenboard/rules/src/wb-rules-modules/**/*.ts` as the source of truth.
- Do not manually edit files in `wirenboard/rules/dist/es5/`. They are compiled artifacts and should only change as a result of the build process.
- Keep compatibility with ES5/Duktape in mind. Do not rely on modern runtime features unless they are transpiled safely and supported in the target environment.
- Run package scripts from `wirenboard/rules/`, for example `pnpm build` or `pnpm test`.
- Use Node.js `24.12.0` or a compatible version matching `wirenboard/rules/.node-version` and `package.json`.
- Do not run `pnpm wb:deploy` unless deployment to the controller was explicitly requested.
- If you add helper functions or change rule logic, verify that the generated JavaScript in `wirenboard/rules/dist/es5/` remains compatible with the Wiren Board runtime.
- When you need documentation for writing or maintaining Wiren Board rules, use the official `wb-rules` repository: https://github.com/wirenboard/wb-rules
- When you need documentation for Mirta-specific build, test, or deploy behavior, use the project config and the Mirta package documentation.

## wb-rules Runtime Notes

- Prefer modern `defineRule()` forms with `whenChanged` or `when: cron(...)`; avoid deprecated `when` and `asSoonAs` rule types when adding new rules.
- Keep rule handlers small and non-blocking. Use `setTimeout()` and `setInterval()` for delayed or periodic work instead of busy waits or long synchronous loops.
- Use `getDevice(...).getControl(...)` or `getControl(...)` for actual control values. Prefer `.getValue()` and `.setValue(...)` over low-level `dev[...]` access.
- Do not use `publish()` to change a control value; `publish()` is for sending MQTT messages and can desynchronize control state.
- Assigning a control value publishes an MQTT message, even if the value did not change. Prefer checking the current value first when repeated writes are possible.
- Remember that `whenChanged` receives a `newValue` argument, and it can watch one control or an array of controls.
- When a rule changes the same control it watches, guard against feedback loops by checking the current value or making the write idempotent.
- Use `PersistentStorage(name, { global: true })` for state that must survive controller reboots. Store plain objects through `new StorableObject(...)`; keep persisted data small and explicit.
- Put reusable code in `wirenboard/rules/src/wb-rules-modules/` and import it from rules instead of duplicating helper logic.
- If a rule creates timers or keeps module/global state, ensure the logic remains safe when the rule file is reloaded by `wb-rules`; the runtime may preserve global ECMAScript state until the service is restarted.
- For debugging, use `log()`/`debug()` style runtime logging where appropriate, but avoid noisy logs in frequently triggered rules.

## Practical Notes

- Runtime scripts executed on the controller are JavaScript, not TypeScript.
- TypeScript in this project is a development convenience layer; deployment target is ES5 JavaScript.
- Prefer implementation patterns that are simple, explicit, and safe for the `wb-rules` engine.
