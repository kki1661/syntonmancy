# Architecture — Syntonmancy 2.1.6

## 1. Shape of the system

```text
┌──────────────────────────────────────────────────────────────┐
│ Single-file client: hanzi-oracle.html                        │
│                                                              │
│  UI shell (chat / diary / settings / collections)            │
│  Local account + PBKDF2                                      │
│  Character bank + draw engine                                │
│  Prompt builder                                              │
│  OpenAI-compatible API adapter                               │
│  JSON parser + word-layer validator + correction retries     │
│  Message / word-layer renderer                               │
│  Backup / restore                                            │
│  16-language UI dictionary                                   │
│  14%-alpha abstract background texture (embedded PNG)        │
└──────────────────────────────────────────────────────────────┘
            │                              │
            │ Electron IPC                 │ Android JS bridge
            ▼                              ▼
┌───────────────────────┐      ┌──────────────────────────────┐
│ desktop/              │      │ android-native/              │
│ main.js, preload.js   │      │ MainActivity.java, WebView   │
│ NSIS installer        │      │ local assets/index.html      │
└───────────────────────┘      └──────────────────────────────┘
```

There is no application server, account server, database server, or cloud sync. The only network calls are to the model provider selected by the user.

## 2. Main data flow

1. **Input.** The user types text and may attach up to 3 images. Images are compressed client-side and stored as data URLs.
2. **Draw.** `drawCharacters()` selects 1–30 characters from the 3,000-character bank using `secureRandomInt` (Web Crypto when available).
3. **Prompt.** `buildSystemPrompt()` interpolates:
   - character name and optional user nickname root;
   - current time;
   - weak context (last 8 messages, ≤1,200 chars);
   - drawn characters;
   - target reply language;
   - optional MOD declarations.
4. **Model call.** `callModelApiWithMessages()` sends an OpenAI-compatible `/chat/completions` request.
5. **Parse.** `parseModelJson()` accepts the four canonical fields (and a few legacy aliases), strips code fences, and extracts the first/last braces if needed.
6. **Validate.** `validateWordLayer()` checks coverage, borrowing, and allowed symbols. `wordLayerStats()` and `patchWordLayer()` support repair.
7. **Retry.** JSON/field/word-layer failures may be corrected up to 4 total attempts. API/network errors are not format-retried.
8. **Render.** `makeAssistantMessage()` stores reply, interpretation, word layer, and source metadata. The UI renders the reply immediately and the word layer in a collapsible details block.
9. **Persist.** State is written to localStorage; backups can be exported as JSON.

## 3. Key modules in `hanzi-oracle.html`

| Area | Representative functions / constants |
| --- | --- |
| Character bank | `BANK`, `DRAW_WEIGHT_TABLE`, `drawCharacters`, `randomDrawCount` |
| Prompt | `buildSystemPrompt`, `buildModelMessages`, `buildWeakContext` |
| API | `providerChatEndpoint`, `callModelApiWithMessages`, `fetchProviderModels` |
| Validation | `parseModelJson`, `validateWordLayer`, `patchWordLayer`, `isReadableReply` |
| Round lifecycle | `runRound`, `rewriteReplyOnly`, `makeAssistantMessage` |
| Diary | `generateDiaryComment`, diary normalization and rendering |
| Backup | `buildBackupEnvelope`, `applyBackupEnvelope`, import/export |
| Auth | PBKDF2 account record, local session, legal consent |
| i18n | `UI_TEXT`, `applyUiLanguage`, 16-language dictionary |
| Visual texture | embedded 14%-alpha PNG, CSS background layers |

## 4. Storage model

- Primary: `localStorage` under an account-specific state key.
- Backup/fallback: IndexedDB envelope, when available.
- Backup JSON format: `format: "zijian-backup"`, `schemaVersion: 3`.
- Chat images: compressed data URLs; chat limit 3, diary limit 12.
- Local accounts: username + salt + PBKDF2-SHA256 hash; no password reset path.
- Sensitive data is **not** encrypted per account. Anyone with access to the local disk/profile may read chats and diaries.

## 5. Desktop wrapper

- `desktop/main.js`: BrowserWindow, menu, IPC for backup sharing, app lifecycle.
- `desktop/preload.js`: narrow `window.zijianDesktop` bridge.
- `desktop/installer.nsi`: per-user NSIS installer; no UAC; closes old app before upgrade.
- Data path: `%APPDATA%\字势静兼`.

## 6. Android wrapper

- `android-native/src/.../MainActivity.java`: WebView, file chooser, back handling, JS bridge.
- `android-native/assets/index.html`: the same single-file client, plus `android-bridge.js`.
- Package: `com.syntonmancy.app`; minSdk 24; targetSdk 34.
- Data remains in the WebView's local storage.

## 7. Design boundaries

- The client does not host or proxy models. Users bring their own API keys.
- The app is local-first, not end-to-end encrypted.
- The 30-digit “defense string” is a fixed integrity constant and artistic device, checked before draw/model/result. It is not a cryptographic security control.
- The 70/30 rule is a prompt-level semantic budget plus a validator for character coverage; it is not a semantic proof.
- The 14%-alpha texture is non-semantic; it is not used by the model and does not encode good/evil, spirits, or entities.
- A separate presentation-editing pass is a design discussion, not implemented in 2.1.6.

## 8. Reproduction

The source ZIP contains the complete client and wrappers. The paper PDF/DOCX documents the design and parameter table. See `README.md` for the quick start and `CHECKSUMS.txt` for hashes.
