# invest-js Migration Plan

Branch: `migration/invest-js`

## Baseline

- Current SDK usage is limited to `server/src/common/api.ts`, `server/src/common/buildBondsData.ts`, `server/src/services/bonds.service.ts`, and server-side shared interfaces under `server/src/common/interfaces`.
- Baseline verification on this branch passes:
  - `cd server && bun test`
  - `cd server && bun run build`
- Current automated coverage is too small for a package swap. First migration steps must add characterization tests before changing runtime behavior.

## Rules For This Migration

- Do not swap SDKs in one commit.
- Every step must preserve a green `bun test` and `bun run build` in `server/`.
- Every behavior-changing step must add or update tests in same commit.
- Use Conventional Commits for every commit.
- Only mark a commit as breaking with `!` plus `BREAKING CHANGE:` footer if it changes public/runtime contract.

Public/runtime contract changes that require breaking marker:

- API response shape changes for existing frontend or external consumers.
- Required env vars or auth configuration change.
- Runtime/Bun/Node support policy change.
- Removal of legacy fallback path after a transition period.

## Planned Commit Sequence

### 1. Document roadmap

- Commit: `docs(server): add invest-js migration roadmap`
- Scope: add this file only.
- Tests: none required beyond existing baseline already run.

### 2. Add characterization tests for current bond normalization

- Commit: `test(server): cover bond normalization and coupon mapping`
- Add tests for:
  - money-like values converted with current numeric helper behavior
  - price lookup and MOEX merge behavior in `buildBondsData`
  - duration fallback from `buyBackDate` or `maturityDate`
  - coupon payout mapping and filtering in `bonds.service`
- Preferred new test files:
  - `server/src/common/buildBondsData.test.ts`
  - `server/src/services/bonds.service.test.ts`
- Test gate:
  - `cd server && bun test`
  - `cd server && bun run build`

### 3. Introduce SDK-agnostic local types and numeric helpers

- Commit: `refactor(server): decouple domain types from legacy sdk`
- Replace direct interface inheritance from legacy SDK types with local DTO-like interfaces for only fields actually used by this app.
- Move numeric conversion logic behind local helpers so business code stops importing `Helpers`, `Quotation`, `MoneyValue`, `Bond`, and `Coupon` from SDK internals.
- Goal: `buildBondsData` and `bonds.service` should no longer depend on package-internal paths like `cjs/generated/*` or `src/generated/*`.
- Test gate:
  - extend tests from step 2 to prove output parity
  - `cd server && bun test`
  - `cd server && bun run build`

### 4. Introduce an internal API facade over current SDK

- Commit: `refactor(server): add invest api facade`
- Add one internal adapter module that exposes only operations this app needs:
  - list bonds
  - fetch last prices
  - fetch bond coupons
- First implementation should still use current legacy SDK.
- Business logic should depend on facade interface, not SDK client shape.
- Test gate:
  - add facade contract tests with mocked responses
  - `cd server && bun test`
  - `cd server && bun run build`

### 5. Add `@tinkoff/invest-js` implementation behind feature flag

- Commit: `feat(server): add invest-js adapter behind driver flag`
- Install `@tinkoff/invest-js` while keeping legacy SDK temporarily.
- Implement same facade with new SDK.
- Add env switch like `TINKOFF_API_DRIVER=legacy|invest-js`.
- Keep default on legacy for one commit so parity can be tested safely.
- Test gate:
  - adapter tests for both implementations
  - focused parity tests for bonds, prices, and coupons mapping
  - `cd server && bun test`
  - `cd server && bun run build`

### 6. Switch default driver to `invest-js`

- Commit: `feat(server): switch default tinkoff client to invest-js`
- Keep legacy fallback available for one release cycle if possible.
- Only mark as breaking if config or response contract changes.
- If breaking marker is required, use:
  - subject: `feat(server)!: switch default tinkoff client to invest-js`
  - footer: `BREAKING CHANGE: <exact config or response change>`
- Test gate:
  - full `server` test suite
  - `cd server && bun run build`
  - optional smoke call in local/dev env if token available

### 7. Remove legacy SDK and fallback path

- Commit: `chore(server)!: remove legacy tinkoff invest sdk`
- Remove `@psqq/tinkoff-invest-api` dependency and any fallback code.
- Remove driver flag only after new adapter is stable.
- Required breaking footer:
  - `BREAKING CHANGE: removed legacy @psqq/tinkoff-invest-api adapter and fallback configuration`
- Test gate:
  - `cd server && bun test`
  - `cd server && bun run build`
  - container build if release candidate is being cut

## Implementation Notes

- Favor extracting pure mapping functions early. They are easiest to test and lowest-risk to migrate.
- Keep transport/client code thin. All field renaming and shape normalization should live in mapper layer.
- Do not expose raw new SDK response types outside adapter layer.
- Do not mix package swap, DTO rewrite, and behavior changes in same commit.
- If new SDK lacks exact helper parity, keep local helper behavior compatible with existing frontend expectations.

## Release Strategy

- Steps 2 through 5 should be non-breaking releases unless a public contract changes.
- Step 6 may be non-breaking if facade preserves behavior and config remains compatible.
- Step 7 is expected to be breaking unless legacy fallback is retained indefinitely.
