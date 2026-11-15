# Zenodo metadata — ready to paste

Fill the bracketed fields from the actual release pages. Do not publish a DOI placeholder as if it were assigned.

## Record

- **Title:** 字势静兼 / Syntonmancy 2.1.6 — 得字解句式跨维聊天平台（技术披露与可复现材料）
- **Upload type:** Publication → Technical note (or Software, if the deposit is presented primarily as code)
- **Publication date:** 2026-11-16
- **Version:** 2.1.6
- **Language:** Chinese (zh) with English abstract
- **License:** CC BY 4.0 for the publication record; see `LICENSING.md` for the mixed file-level licenses
- **Access:** Open

## Creators

```text
字势静兼作者 (the Syntonmancy author)
```

Affiliation and ORCID can be added if available.

## Description

```text
字势静兼 / Syntonmancy 2.1.6 是一个纯本地的“得字解句”聊天平台。每轮从 3,000 个常用汉字中按固定概率抽取 1–30 个字，要求大模型先用全部得字组成 word_layer，再写至少 70% 来自本轮字义、最多 30% 自由联想的 interpretation，最后由 interpretation 转写成可直接发给用户的 reply。每轮只附带最近 8 条、最多 1,200 字符的弱上下文，不依赖长期对话记忆。仓库包含技术论文（PDF/DOCX）、完整源代码、系统提示词、参数表、输入输出示例和界面截图。

Syntonmancy 2.1.6 is a local-first chat platform built on a character-drawing interpretation rule. Each turn draws 1–30 characters from a 3,000-character bank, requires the model to use every drawn character in a word_layer, writes an interpretation that is at least 70% grounded in the word layer and at most 30% free association, and derives the user-facing reply from that interpretation. Only the last 8 messages / 1,200 characters are provided as weak context. The deposit contains the technical paper (PDF/DOCX), complete source code, system prompt, parameter table, input/output examples, and UI screenshots.
```

## Keywords

```text
Syntonmancy
字势静兼
得字解句
character-constrained generation
local-first
chatbot
prompt engineering
creative writing
Chinese characters
GPL-3.0-only
CC BY 4.0
```

## Related identifiers

Replace with the actual URLs after publishing:

```text
GitHub repository: [https://github.com/...]
Paper DOI:         [10.5281/zenodo....]
Code archive DOI:  [10.5281/zenodo....]
```

Suggested relations:

- GitHub repository → `isSupplementedBy` / URL
- Paper → `isVersionOf` or `isPartOf` the code record
- Previous 2.1.5 report → `isVersionOf` (if uploaded)

## Notes / acknowledgements

```text
The paper is licensed CC BY 4.0. The code is GPL-3.0-only. Documentation, prompts, and examples are Apache-2.0. The app is for adults; age confirmation is self-attested, not identity-verified. The “defense string” is an integrity constant and artistic device, not a proven security mechanism. The screenshots are fixed example data rendered in the 2.1.6 UI, not raw outputs from a named model.
```

## File order for upload

1. `paper/字势静兼-技术披露-v2.1.6.pdf`
2. `paper/字势静兼-技术披露-v2.1.6.docx`
3. `code/syntonmancy-2.1.6-source.zip`
4. `prompts/SYSTEM-PROMPT.md`
5. `examples/`
6. `docs/PARAMETER-TABLE.md`
7. `README.md`, `LICENSING.md`, license files
8. `CHECKSUMS.txt`

Zenodo accepts a ZIP; uploading the outer ZIP as one file is also acceptable. If individual files are preferred, upload the contents of `repo/`.
