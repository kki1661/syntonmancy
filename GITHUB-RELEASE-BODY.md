# Syntonmancy 2.9.10

**A private, local-first world for text, photos, and the people who live between them.**

This release focuses on the Suiying reading and editing experience, the Moments multi-image workflow, 14-language UI coverage, and backup reliability.

## Highlights

### Moments

- Up to 9 images per Moment, each with its own shoot brief
- 3×3 clickable grid
- Per-image briefs are saved with the Moment and included in backups

### Suiying

- Friend reactions are now grouped in a chapter-bottom **Comments** area, separate from the story and friend continuations
- Replies to friend reactions, with the same 30% continue / 70% close rule as Moments
- Each image can be positioned before or after friend continuations from the same position dropdown
- Clicking an image in the editor opens a large preview with Save / Close, without closing the editor
- Reference images no longer clear the title, chapter title, location, or story
- Add a section between two existing sections
- Choose and remember the friend invited to continue a section
- Delete friend continuations and reactions
- Common-reference add button in the Suiying composer
- Photo books follow the same chapter-comment and image-position layout

### Reliability

- Fixed backup import failing on backups containing Suiying series (`Cannot read properties of undefined (reading 'push')`)
- Added defensive array normalization during backup merge
- Fixed repeated Ningzi Moments entry causing comment toggles to fail every other visit

### Language and guidance

- In-app usage guide
- New UI copy translated across 14 languages
- Calmer, non-aggressive wording in the guide
- New-account cold start: one friend, one welcome Moment, one sample Suiying entry

## Downloads

| Platform | File | Size |
|---|---|---|
| Windows portable | `Syntonmancy-2.9.10-Windows-Portable.zip` | ~161 MB |
| Windows installer | `Syntonmancy-2.9.10-Windows-Setup.exe` | ~161 MB |
| Android | `Syntonmancy-2.9.10-Android-release.apk` | ~1.3 MB |
| Web | `Syntonmancy-2.9.10-Web.zip` | ~1.2 MB |

## Install notes

- **Windows portable:** unblock the ZIP before extracting (Properties → Unblock), then extract and run `字势静兼.exe`.
- **Windows installer:** unsigned; SmartScreen may show “Unknown publisher”.
- **Android:** release signed, `versionCode 27`, `versionName 2.9.10`; uninstall old debug builds before installing.
- **Web:** open `index.html`; browser storage is limited, export JSON backups regularly.

## Checksums

```text
1975c941ecd598d71d4ad7260bafb06f84ee992d8e105e7edb928f485f79715b  Syntonmancy-2.9.10-Windows-Portable.zip
68c0a382f09b30d5f9e3dd350ed2dc473f8436a60bfe8e98be23c28af9c4643c  Syntonmancy-2.9.10-Windows-Setup.exe
104e3e39675bb595ea679e3de3fcadfae6289e25280a7c0889b605d7a2ffdb63  Syntonmancy-2.9.10-Android-release.apk
5a8391e453c380098e9d2ddfb312ed3d817d4984937da839cc355062f0eb7fa7  Syntonmancy-2.9.10-Web.zip
```

## Notes

- The app does not include API keys or model credit. Users supply their own text/image provider keys.
- All content is local. Back up regularly; browser storage has a quota.
- This is not a real social network, not a mediumship tool, and not a substitute for professional care.
- Windows builds are unsigned.
- macOS and iOS are not officially built in this release.

Full notes: `RELEASE-NOTES-2.9.10.md`
