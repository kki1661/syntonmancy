# Examples — input / output summary

These are **curated structural examples** for the 2.1.6 output schema. They are not raw outputs from a named model and do not claim that a real run will produce the same words.

| # | Input | Drawn characters | Landing | Reply shape | Files |
| --- | --- | --- | --- | --- | --- |
| 01 | 今天下班很晚，回家路上还在下雨。有点累，但也有点安心。 | 山 风 夜 雨 灯 归 人 门 | 你到家了，身上的凉意还在。 | landing + bridge | [JSON](example-01.json) · [MD](example-01.md) · [PNG](example-01.png) |
| 02 | 有些话说出来，会不会反而更远？ | 月 影 无 声 潮 退 | （空；倾向：不适用） | bridge-only | [JSON](example-02-bridge-only.json) · [MD](example-02-bridge-only.md) · [PNG](example-02-bridge-only.png) |

## Output schema

The app expects one JSON object with four fields:

```json
{
  "interpretation": "……",
  "landing": "……",
  "word_layer": "……",
  "reply": "……"
}
```

- `interpretation`: at least 70% grounded in the current word layer / character meanings; at most 30% free association.
- `landing`: optional; a direct answer when one can be formed; may be empty for bridge-only.
- `word_layer`: every drawn character at least once; borrow rules apply.
- `reply`: derived from `interpretation`; no unsupported facts, advice, or questions.

## Screenshots

The screenshots are the 2.1.6 interface with fixed example data, including the expanded word-layer panel. They show the **presentation shape**, not a live API exchange.

### Example 01

![Example 01](example-01.png)

### Example 02

![Example 02](example-02-bridge-only.png)

## Validation summary

```text
example-01: drawn 8, missing 0, borrowed 下/内/亮 (3), borrow limit none
example-02: drawn 6, missing 0, borrowed 以/后/在/还 (4), borrow limit none
```

The semantic 70/30 ratio is a prompt-level budget and cannot be proven by a simple character count. The validator in the app checks character coverage and allowed symbols; it does not measure the percentage.
