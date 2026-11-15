# Example 01 — landing + bridge

![Screenshot of example 01 in the 2.1.6 UI](example-01.png)

> The screenshot uses fixed example data in the 2.1.6 interface. It is not a raw output from a named model.

## Input

```text
今天下班很晚，回家路上还在下雨。有点累，但也有点安心。
```

Drawn characters:

```text
山 风 夜 雨 灯 归 人 门
```

Photos: none.

## Output

```json
{
  "interpretation": "夜雨落在山风里，灯下的人刚从外面回来，身上的凉意还在；门内的灯还亮着。字面有晚归的凉意，也有被留灯等候的安稳。",
  "landing": "你到家了，身上的凉意还在。",
  "word_layer": "夜雨山风，灯下归人；门内灯亮。",
  "reply": "你到家了，身上的凉意还在。夜雨落在山风里，灯下的人刚从外面回来；门内的灯还亮着，像有人替你留着一盏。"
}
```

## Why it is valid

- `word_layer` uses every drawn character at least once.
- Borrowed characters: `下`, `内`, `亮` (3 distinct). Eight characters were drawn, so the borrow limit is unlimited.
- `interpretation` is grounded in the word layer; the free-association part is the “被留灯等候” reading.
- `landing` is a direct acknowledgement, not a disclaimer.
- `reply` starts with the landing and then bridges through the lamp imagery. It does not add advice, a question, or a new fact.

## Character coverage

| Drawn | Appears in `word_layer` |
| --- | --- |
| 山 | yes |
| 风 | yes |
| 夜 | yes |
| 雨 | yes |
| 灯 | yes (twice) |
| 归 | yes |
| 人 | yes |
| 门 | yes |

```text
word_layer: 夜雨山风，灯下归人；门内灯亮。
unique characters in word_layer: 11
borrowed: 下 内 亮
drawn: 8 -> borrow limit: none
```

## What this example is not

- It is not a claim that the model will produce these exact words.
- It is not a claim that the 70/30 split can be measured by a simple string counter. The split is a prompt-level semantic budget; the code enforces character coverage, not the percentage.
- The screenshot is a UI demonstration; timestamps and chat list are illustrative.
