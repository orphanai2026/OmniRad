# Feature Flags — OmniRad Platform

> Single source of truth: `omnirad-redesign/modules/feature-flags.js`
> All runtime toggles are declared there and frozen at load time.

## Active flags

| Flag | State | Since | Owner | Rationale |
|---|---|---|---|---|
| `AUTOGEN` | `false` | 2026-07-12 | Platform | fal.ai/FLUX/Gemini failed anatomical accuracy tests. Manual ChatGPT workflow adopted. |

## How to read a flag

```js
if (window.OmniRadFeatures?.AUTOGEN) {
  // legacy auto-generation path
}
```

The object is frozen (`Object.freeze`) — cannot be tampered with at runtime.

## How to add a flag

1. Edit `omnirad-redesign/modules/feature-flags.js` — add a new key with a comment block explaining rationale + date + linked docs.
2. Add a row to the table above.
3. Reference the flag with `window.OmniRadFeatures?.YOUR_FLAG` (optional-chain — never crash if bundle missing).
4. Include `feature-flags.js` **before** any script that reads it (order matters).

## How to retire a flag

1. Remove all reader sites in code.
2. Delete the key from `feature-flags.js`.
3. Move the row from "Active flags" to "Retired flags" (below) with the retirement date.

## Retired flags

_(none yet)_

## Related deprecations

### Studio auto-generation (2026-07-12)

- **Frontend:** `FEATURE_AUTOGEN` guards `doGenerate()` in `studio-app.js`.
- **Supabase:** RPCs dropped via `supabase/studio-autogen-deprecate.sql`. Archived table: `generation_sessions_archived_2026_07`.
- **Vault:** `fal_api_key` and `gemini_api_key` retained (marked deprecated 2026-07-12) for restore.
- **Test pages:** archived to `omnirad-redesign/pages/_archived/` with `noindex` meta.
- **Restore:** run `supabase/studio-autogen-restore.sql` + set `AUTOGEN: true`.

## Standards references

- Feature flag pattern: Martin Fowler · "Feature Toggles" (2017)
- Defense in depth: OWASP ASVS 4.0 §14.2.3 (client-side integrity)
- Reproducibility: ISO/IEC 25010 §Maintainability
