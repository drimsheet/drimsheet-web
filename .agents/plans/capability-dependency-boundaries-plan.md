# Capability Dependency Boundaries Plan

## Goal

Replace individual dependency exceptions with responsibility-based permissions
for consuming feature-owned capabilities. This plan is implementation-ready;
preserve unrelated staged and working-tree changes.

## Context

The dependency rules currently prohibit most cross-feature imports, then grant
13 named exceptions for composition and data access. The neighboring folder
and file responsibility rules already distinguish pure views, orchestration,
reusable logic, and private page/dialog/component implementations.

## Confirmed Findings

1. Most exceptions allow pages to combine public capabilities while providers
   retain domain logic and transport ownership.
2. Feature hooks and a reusable container also consume another feature's
   services; a pages-only permission would leave these cases uncovered.
3. The working-tree addition for transaction account creation requires pages
   to retain continuation/navigation ownership while consuming an account dialog.

## Scope

- `.agents/rules/dependency-rules.md` — replace named exceptions with general
  capability ownership, responsibility permissions, and explicit API boundaries.
- Application implementation and other rule files remain outside this change.

## Proposed Approach

1. Define feature ownership separately from import isolation, with permissions
   determined by the importing module's responsibility.
2. Define public UI barrels and explicit reusable hook/lib entry points;
   preserve private owner boundaries and provider-owned transport.
3. Retain side-effect, shared, test-support, and barrel restrictions. Check all
   former exception cases against the replacement rules.

## Test Plan

- Documentation-only change: no new automated application tests are warranted.
- Manually check all 13 former permissions and their ownership restrictions.

## Verification

- Read the final rules against the folder and file responsibility rules.
- Confirm no named exception lists remain and inspect the scoped diff.
- Run `git diff --check` on the changed documentation files.

## Completion Criteria

- Every former exception is covered by a general responsibility permission.
- Public entry points, private support files, pure views, shared code, and
  transport ownership have explicit boundaries.
- No individual feature/path allowlist remains in the dependency rules.
- Documentation checks pass and unrelated work remains unchanged.
