# 字势静兼 / Syntonmancy — Technical Disclosure

**Version:** 2.1.6  
**Disclosure date:** 2026-11-16  
**Author:** 字势静兼作者 / the Syntonmancy author  
**Paper:** CC BY 4.0  
**Code:** GPL-3.0-only  
**Documentation, prompts, examples:** Apache-2.0

## Abstract (中文)

字势静兼是一个纯本地的“得字解句”聊天应用。它不要求大模型维持长期对话记忆，而是每一轮从 3,000 个常用汉字中按固定概率分布抽取 1–30 个字；模型必须先使用全部得字组成 `word_layer`，再写 `interpretation`，其中至少 70% 来自本轮字义，最多 30% 可用于自由联想；最后由 `interpretation` 转写成可直接发给用户的 `reply`。每轮只附带最近 8 条、最多 1,200 字符的弱上下文，仅用于指代和语言衔接，不进入 reply 语义。应用把聊天、日记、用字草稿、图片弱参考、备份、本地账户与 16 种界面语言封装在单文件 HTML 中，并提供 Electron 桌面包装与 Android WebView 包装。

## Abstract (English)

Syntonmancy is a local-first chat application built around a character-drawing interpretation rule. Instead of relying on long multi-turn memory, each turn draws 1–30 characters from a 3,000-character bank and requires the model to use every drawn character in a `word_layer`, write an `interpretation` that is at least 70% grounded in that word layer and at most 30% free association, and then derive the user-facing `reply` from the interpretation. Only the last 8 messages / 1,200 characters are supplied as weak context, and only for reference resolution and language continuity, not for reply semantics. The whole client—chat, diary, word-layer display, weak image reference, backups, local accounts, and 16 UI languages—is implemented in a single HTML file, with Electron and Android WebView wrappers.

## 1. What is disclosed

1. A character-constrained generation pipeline: draw → `word_layer` → `interpretation` → `landing` / `bridge` → `reply`.
2. A fixed 70/30 semantic budget: at least 70% of `interpretation` from the current `word_layer` / character meanings; at most 30% free association.
3. A character-coverage validator:
   - all drawn characters must appear at least once in `word_layer`;
   - drawn characters may repeat;
   - borrowed characters are limited to 5 distinct characters when fewer than 5 are drawn, and unlimited when 5 or more are drawn;
   - only Chinese punctuation and whitespace are allowed in `word_layer`.
4. A 1–30 draw distribution and a weak 8-message / 1,200-character context policy.
5. A three-way `landing` policy (明确肯定 / 明确否定 / 明确不确定), with an explicit `倾向：不适用` path and bridge-only replies.
6. A weak-reference photo policy: at most 3 chat images; photos may inform at most the 30% free-association budget and must not become the main subject.
7. A local-only client architecture: single-file HTML, localStorage/IndexedDB backup, Electron and Android WebView wrappers.
8. A deterministic 14%-alpha abstract background texture generated from the 岁旦剑咒 text and the numeric string `913812674491207760151306651087`. It is non-semantic and is not used in model semantics.
9. A fixed 30-digit integrity constant (the “防御串”) read at three points: before drawing, before model generation, and before result delivery. It is not a security mechanism and is not sent to the model.

## 2. Pipeline

```text
user input (+ up to 3 images)
        │
        ▼
draw 1–30 characters from a 3,000-character bank
        │
        ▼
model writes JSON:
  interpretation  (≥70% word layer / ≤30% free association)
  landing         (optional; three-way tendency or 不适用)
  word_layer      (all drawn characters; borrow rules)
  reply           (derived only from interpretation)
        │
        ▼
local validation / up to 4 total attempts
        │
        ▼
render reply + optional word-layer details
```

### 2.1 Character bank and draw distribution

- Bank: 3,000 unique CJK characters (frequency-oriented common simplified set).
- Draw counts:

| Count | Probability |
| --- | --- |
| 1 | 15% |
| 2 | 25% |
| 3 | 20% |
| 4 | 13% |
| 5 | 10% |
| 6–10 | 10% |
| 11–20 | 5% |
| 21–30 | 2% |

### 2.2 Word-layer rules

- Every drawn character must appear at least once.
- Repeated draws of the same character need only one occurrence.
- Borrowed characters:
  - fewer than 5 drawn: at most 5 distinct borrowed characters;
  - 5 or more drawn: no numeric limit.
- Borrowed characters are intended only for grammatical connection; the prompt forbids adding nouns, actions, imagery, facts, advice, judgments, or emotions through borrowings.
- `word_layer` may use Chinese punctuation, line breaks, and spaces; Arabic digits, Latin letters, and other scripts are rejected.

**Important:** the “borrowed characters must be grammatical only” rule is a prompt-level constraint. The current code enforces count and character set, not the semantic role of each borrowed character.

### 2.3 Semantic budget

- `interpretation` is the middle layer. At least 70% of its content must come from the current `word_layer` / character meanings; at most 30% may be free association.
- `reply` is a faithful rendering of `interpretation`; it must not add facts, advice, questions, or assumptions not present in `interpretation`.
- The 30% is a budget for free association, **not** “the current user sentence counts for 30%.” The current user message is always the input; old context is limited to the last 8 messages / 1,200 characters and is only for reference and language continuity.

### 2.4 Landing and bridge

- If a direct answer can be formed, `interpretation` ends with one of:
  - `倾向：明确肯定`
  - `倾向：明确否定`
  - `倾向：明确不确定`
- `landing` is the direct, non-imagery answer.
- `reply` starts with `landing`, then bridges via “就像…… / 像……那样 / 这就像……” into the interpretation's imagery.
- If no landing can be formed, `interpretation` writes `倾向：不适用`; `landing` may be empty; `reply` is bridge-only.
- The code does **not** require `landing` to be non-empty. A valid result needs `reply`, `interpretation`, a valid `word_layer`, and a non-empty readable reply.

### 2.5 Context and images

- Current turn: current user text, current photos, drawn characters.
- Weak old context: last 8 user/assistant messages, at most 1,200 characters; used only for reference resolution and language continuity.
- No long-term summary, embedding memory, or cross-chat memory.
- Chat images: at most 3; diary images: at most 12.
- Photos are a weak reference within the 30% free-association budget; the reply must not become a photo description or invent facts outside the photo.

## 3. Validation and failure behavior

- The model is asked for a JSON object with `interpretation`, `landing`, `word_layer`, and `reply`.
- Up to 4 total attempts (1 initial + 3 correction retries) are made for JSON, field, and word-layer errors.
- API/network/authentication/quota errors are not format-retried.
- Empty content, non-JSON, truncated JSON, missing fields, missing drawn characters, excess borrowings, and illegal symbols are detected locally.
- If all attempts fail, the round is marked failed and the user sees a localized error.

What the code does **not** hard-enforce:

- whether borrowed characters are truly grammatical;
- whether `reply` adds unsupported facts or advice;
- a minimum reply length beyond “non-empty after punctuation stripping”;
- a strict 300-character cap on `interpretation` (300 is a prompt target; storage allows 12,000 characters).

## 4. Client architecture

- `hanzi-oracle.html`: single-file HTML/CSS/JS client. No backend.
- Local account: PBKDF2-SHA256, 120,000 iterations, 16-byte salt, 32-byte hash. Accounts are local; passwords cannot be recovered.
- Data: chats, rounds, collections, diary, settings, backups; localStorage with IndexedDB backup path.
- Desktop: Electron wrapper; per-user NSIS installer.
- Android: Java WebView wrapper; local `assets/index.html`.
- UI languages: 16; the UI dictionary is embedded in the HTML.
- Background texture: deterministic abstract strokes generated from the 岁旦剑咒 text and numeric model, embedded at 14% alpha. No swords, seals, trigrams, text, deities, or other figurative symbols.

## 5. Reproduction artifacts

- Paper PDF/DOCX: `paper/`
- Source ZIP: `code/syntonmancy-2.1.6-source.zip`
- System prompt template: `prompts/SYSTEM-PROMPT.md`
- Examples: `examples/`
- Parameter table: `docs/PARAMETER-TABLE.md`
- Checksums: `CHECKSUMS.txt`

The canonical app file hash is in `CHECKSUMS.txt` and the paper's parameter table. At the time of this disclosure it is:

```text
ef21b81c7726ee2c44d0613904b005408d8fff65ce25388b4f90feac135f29cc
```

## 6. Scope and limitations

- The examples are curated to show the JSON shape and semantic budget; they are not presented as raw outputs from a named model.
- The “防御串” is an integrity constant and artistic device; no controlled experiment demonstrates a security or spiritual effect.
- A separate presentation-editing pass was discussed during development but is **not implemented** in 2.1.6. The only related code is `rewriteReplyOnly`, called when `reply` duplicates `word_layer`.
- The project is for adults; age confirmation is self-attested, not identity-verified.
- The code is GPL-3.0-only; the paper is CC BY 4.0; documentation is Apache-2.0. See `LICENSING.md`.

## 7. Prior-art and citation

This document and the paper are intended as a defensive technical disclosure. They do not constitute legal advice or a guarantee of patent status.

```text
字势静兼作者. (2026). 字势静兼 / Syntonmancy 2.1.6:
得字解句式跨维聊天平台（技术披露与可复现材料）.
Zenodo. https://doi.org/[to be assigned]
```

GitHub and Zenodo identifiers should be filled from the actual release pages; see `ZENODO-METADATA.md`.
