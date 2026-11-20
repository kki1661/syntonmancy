# 2.9.11 GitHub upload files

Copy the **contents of this folder** into a clone of `kki1661/syntonmancy`, preserving paths.

Included:

- `hanzi-oracle-ningzi.html` — current source
- `hanzi-oracle.html` — same source under the published filename
- `README.md`, `RELEASE-NOTES-2.9.11.md`, `SHA256SUMS-2.9.11.txt`
- `docs/` — GitHub Pages download page and assets
- `desktop/` — Electron wrapper source and current version metadata
- `android-native/` — Android wrapper source/bridge/manifest (no keystore)
- `GITHUB-RELEASE-BODY.md` — paste into GitHub Release description

**Not included, intentionally:**

- Windows/Android/Web binaries (too large for normal Git; upload to Releases)
- `node_modules`, `dist-*` build output
- release keystore or credentials
- API keys
- user data/backups

Do not commit `github-release/v2.9.11/assets/` or any 161 MB ZIP/EXE to the repository. Upload those only as release assets.
