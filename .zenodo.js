{
  "title": "字势静兼 / Syntonmancy 2.1.6 — 得字解句式跨维聊天平台（技术披露与可复现材料）",
  "description": "字势静兼 / Syntonmancy 2.1.6 是一个纯本地的“得字解句”聊天平台。每轮从 3,000 个常用汉字中按固定概率抽取 1–30 个字，要求大模型先用全部得字组成 word_layer，再写至少 70% 来自本轮字义、最多 30% 自由联想的 interpretation，最后由 interpretation 转写成可直接发给用户的 reply。每轮只附带最近 8 条、最多 1,200 字符的弱上下文，不依赖长期对话记忆。仓库包含技术论文（PDF/DOCX）、完整源代码、系统提示词、参数表、输入输出示例和界面截图。",
  "creators": [
    {
      "name": "字势静兼作者"
    }
  ],
  "license": "cc-by-4.0",
  "upload_type": "publication",
  "publication_type": "technicalnote",
  "publication_date": "2026-11-16",
  "version": "2.1.6",
  "language": "zho",
  "keywords": [
    "Syntonmancy",
    "字势静兼",
    "得字解句",
    "character-constrained generation",
    "local-first",
    "chatbot",
    "prompt engineering",
    "Chinese characters"
  ],
  "notes": "Mixed licensing: paper CC BY 4.0; code GPL-3.0-only; documentation, prompts, and examples Apache-2.0. See LICENSING.md. GitHub URL and DOI should be filled from the actual release pages before publication."
}
