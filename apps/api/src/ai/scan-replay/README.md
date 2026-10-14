# Scan replay

Resends recorded Scans (the `SCAN_DEBUG_DIR` captures) to a chosen model and reasoning effort, so you can judge a model change on real photos. Requests go through `StructuredOutputAiService`, so they are built exactly as in production, reasoning headroom included.

```sh
cd apps/api
npm run scan:replay -- --model gpt-6-luna --effort low --repeat 3
```

| Option | Default | |
|---|---|---|
| `--captures <dir>` | `.scan-debug` | Folder of captures, as `SCAN_DEBUG_DIR` writes them |
| `--model <name>` | `AI_VISION_MODEL` | Model to replay on |
| `--effort <e>` | `AI_REASONING_EFFORT` | `none`, `minimal`, `low`, `medium`, `high`, `xhigh`, or `unset` (no effort sent, as for gpt-4o-mini) |
| `--repeat <n>` | `1` | Runs per capture; above 1 the report shows where runs disagree |
| `--only <a,b>` | all | Capture folder names to replay |
| `--limit <n>` | all | Replay at most this many captures |
| `--out <dir>` | `.scan-replay` | Where the report goes (git-ignored) |

The key and provider come from the shell, then `.env.local`, `.env` and `../../.env`, like the API. The script never writes new captures.

Each run writes `<out>/<time>-<model>-<effort>/`:

- `report.md`: per capture, a table of lines, matched Ingredients, input, cached, output and reasoning tokens, estimated cost and latency for the recorded answer and each run. Then each run's differences from the recorded answer (merchant, date, lines found or missing, line type, Ingredient, quantity, expiry date, dish guesses) and, with `--repeat` above 1, where the runs disagree with each other.
- `answers.json`: every replayed answer, for a closer look.

Captures that recorded an error, lost a photo, or are not captures are skipped and listed at the top.

Notes:

- Receipt lines are paired by similar text, since a model reads the same line slightly differently between runs. A line read very differently shows up as one line missing and another found.
- Cost uses the list prices in `scan-replay.ts` (gpt-6-luna and gpt-4o-mini). Other models show `-`. A failed run is billed but has no token counts in the report.
- Every run is a billed API call: start with `--limit 2 --repeat 2`.
- **Captures and reports are personal data** (receipts, photos). They stay local and git-ignored. Never commit or share them, and delete them when you're done.
