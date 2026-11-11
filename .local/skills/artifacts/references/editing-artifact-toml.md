### verifyAndReplaceArtifactToml({ tempFilePath, artifactTomlPath })

Replace an existing `artifact.toml` through a validated temp file. Do not edit `artifact.toml` directly.

**Parameters:**

- `tempFilePath` (str, required): Absolute path to the temporary TOML file you wrote and edited.
- `artifactTomlPath` (str, required): Absolute path to the real `artifact.toml` file to replace. Must point to a real `.replit-artifact/artifact.toml` inside the repl.

**Flow:**

1. Read the current `artifact.toml`, then write a sibling temp file such as `/absolute/path/to/artifacts/my-app/.replit-artifact/artifact.edit.toml`.
2. Make all edits against the temp file. The temp file must contain the full final TOML, not a partial patch.
3. Call `verifyAndReplaceArtifactToml()` with absolute paths. If validation fails, the temp file is left in place so you can inspect and fix it.

**When to use:** changing artifact metadata such as `title` or `previewPath`; changing service definitions, paths, commands, ports, rewrites, or env blocks; or making multiple coordinated TOML edits at once.

**Do not:** edit `artifact.toml` in place, call this with paths outside `.replit-artifact/artifact.toml`, or use it to change immutable fields such as `id`, `kind`, `version`, `integratedSkills`, or `pageMetadata`.

**Returns:** Dict with:

- `success` (bool): Whether the replacement succeeded

**Example:**

```javascript
await verifyAndReplaceArtifactToml({
    tempFilePath: "/absolute/path/to/artifacts/my-website/.replit-artifact/artifact.edit.toml",
    artifactTomlPath: "/absolute/path/to/artifacts/my-website/.replit-artifact/artifact.toml"
});
```
