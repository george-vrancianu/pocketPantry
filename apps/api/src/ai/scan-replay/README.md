# Scan replay

Resends recorded Scans (the debug captures `SCAN_DEBUG_DIR` writes) to a chosen model and reasoning effort, so you can judge a model change on real photos. Requests go through `StructuredOutputAiService`, so they are built exactly as in production, reasoning headroom included.

```sh
cd apps/api
npm run scan:replay -- --model gpt-6-luna --effort low --repeat 3
```

| Option                   | Default               |                                                                                                      |
| ------------------------ | --------------------- | ---------------------------------------------------------------------------------------------------- |
| `--debug-captures <dir>` | `.scan-debug`         | Folder of debug captures, as `SCAN_DEBUG_DIR` writes them                                            |
| `--model <name>`         | `AI_VISION_MODEL`     | Model to replay on                                                                                   |
| `--effort <e>`           | `AI_REASONING_EFFORT` | `none`, `minimal`, `low`, `medium`, `high`, `xhigh`, or `unset` (no effort sent, as for gpt-4o-mini) |
| `--repeat <n>`           | `1`                   | Runs per debug capture; above 1 the report shows where runs disagree                                 |
| `--only <a,b>`           | all                   | Debug capture folder names to replay                                                                 |
| `--limit <n>`            | all                   | Replay at most this many debug captures                                                              |
| `--out <dir>`            | `.scan-replay`        | Where the report goes (git-ignored)                                                                  |

The key and provider come from the shell, then `.env.local`, `.env` and `../../.env`, like the API (`KEY=` counts as unset). The script never writes new debug captures.

Each run writes `<out>/<time>-<model>-<effort>/`:

- `report.md`: per debug capture, a table of lines, matched Ingredients, input, cached, output and reasoning tokens, estimated cost and latency for the recorded answer and each run. Then each run's differences from the recorded answer (merchant, date, lines found or missing, line type, Ingredient, quantity, expiry date, dish guesses) and, with `--repeat` above 1, where the runs disagree with each other.
- `answers.json`: every replayed answer, for a closer look.

Debug captures that recorded an error or lost a photo, and folders that are not debug captures, are skipped and listed at the top. Voice Note captures are skipped too; replay those with `voice:replay` below.

Notes:

- Receipt lines are paired by similar text, since a model reads the same line slightly differently between runs. A line read very differently shows up as one line missing and another found.
- Cost uses the list prices in `scan-replay.ts` (gpt-6-luna and gpt-4o-mini). Other models show `-`. A failed run is billed but has no token counts in the report.
- Every run is a billed API call: start with `--limit 2 --repeat 2`.
- **Debug captures and reports are personal data** (receipts, photos). They stay local and git-ignored. Never commit or share them, and delete them when you're done.

# Voice Note replay

`npm run voice:replay` replays Voice Note **cases** against real providers, so a prompt, model or effort change can be compared before release. It reuses the production code: transcription goes through `TranscriptionService`, and the transcript read is built by `buildVoiceReadRequest` (the same function `VoiceReaderService` calls) and sent through `StructuredOutputAiService`. Run it only on your machine with your own key. Nothing in CI or the unit tests calls a provider.

> **The committed cases are not real Voice Notes.** `voice-cases/*.json` is a seed set of hand-written transcripts (`"source": "synthetic"`), at least 10 per Scan Language (en, ro, da), with no audio. They replay the transcript read only and say nothing about transcription or real speech. Real recordings still need capturing, with the steps below, before the transcription half or an accuracy claim means anything. No accuracy, latency or cost figures are recorded here: run the replay to get them.

## Capturing real Voice Notes

1. In `.env` set `NODE_ENV=development` and `SCAN_DEBUG_DIR=.scan-debug`, restart the API and record Voice Notes in the app (a real phone over HTTPS covers iOS Safari). Speak naturally: filler, self-corrections, units, dates, mixed lists, unsupported requests.
2. Each Voice Note leaves two folders in `apps/api/.scan-debug/`, tied by the same `captureId`:
   - `<time>-voice_transcription-<id>/`: `audio.<webm|mp4|ogg>` (the recording as sent), and `transcription.json` (model, language, prompt hint, mime type, the transcript, outcome).
   - `<time>-voice_note_actions-<id>/`: `request.json` (the full transcript-read prompt and schema, with the same `captureId`) and `response.json` (the raw answer and token usage).
3. Captures are **personal data** (voice, and your list contents). They are git-ignored (`.scan-debug/`, `.scan-replay/`, `.voice-cases/`). Never commit or share them; delete them when done.

## Turning a capture into a case

Make a private case folder, `apps/api/.voice-cases/` (git-ignored). Copy each `audio.*` to `.voice-cases/audio/` and write a case file such as `.voice-cases/en.json`:

```json
{
  "source": "recorded",
  "cases": [
    {
      "id": "en-rec-01",
      "scanLanguage": "en",
      "tags": ["correction", "units"],
      "transcript": "Add two, no, three litres of milk and a dozen eggs",
      "audio": "audio/en-rec-01.webm",
      "defaultTarget": "shopping",
      "today": "2026-10-14",
      "shoppingList": ["Milk"],
      "pantry": [],
      "expected": {
        "actions": [
          {
            "target": "shopping",
            "op": "add",
            "ingredient": "Milk",
            "quantity": 3,
            "unit": "l"
          },
          {
            "target": "shopping",
            "op": "add",
            "ingredient": "Eggs",
            "quantity": 12,
            "unit": "pcs"
          }
        ],
        "unsupported": 0
      }
    }
  ]
}
```

- `transcript` is what was really said, typed by hand (copy it from `transcription.json` and correct it). Transcription replay scores against it as word error rate; the transcript read replays from it.
- `today`, `defaultTarget`, `locale` (defaults to `scanLanguage`), `shoppingList` and `pantry` (names already on the lists) come from the `voice_note_actions` capture's prompt ("Today is ...", "targets the ... list", the two "Names currently ..." lines). `today` should be a fixed date so relative dates have one right answer.
- `tags` (at least one): `basic`, `filler`, `correction`, `units`, `relative-date`, `unsupported`, `mixed-lists`, `sound-alike`, `off-page`.
- `expected.actions` lists the Voice Actions that should come back, in any order. Per action: `target` (`shopping`/`pantry`, or `null` for a bare add or remove with no list, which `defaultTarget: "none"` cases expect), `op` (`add`, `remove`, `check`, `uncheck`, `setQuantity`, `runningLow`), `ingredient` (the name Review shows: the seed Catalog name in the case's locale (`src/catalog/seed`, the whole seed Catalog is what every read is sent, built as the app builds a Member's Catalog), or the generic name when Unmatched; an array lists acceptable alternatives), and the fields that matter. `quantity`, `unit` (a quantity needs one, except for `check`), `expiresOn` and `noExpiry` default to none/false, so an invented amount or date is a miss. `scope` and `location` are checked only when you write them. A bare number is read as pieces (`pcs`), as in the app.
- `off-page` cases use `"defaultTarget": "none"` (a Voice Note recorded off the Shopping List and the Pantry, ADR 0021). They check the `none` branch of the read prompt: a bare add or remove has `target: null`; a named list, a Location or expiry date (pantry), "need"/"buy" (shopping), check, uncheck and quantity (shopping) and Running low (pantry) have a target. Pantry Questions are not covered (not implemented yet).
- `expected.unsupported` is how many phrases should come back as Didn't understand (questions, chat, recipes). Only the count is compared.

## Running it

```sh
cd apps/api
# Transcript read: resend each case's transcript to the text model
npm run voice:replay -- --mode read --model gpt-5-mini --effort low --repeat 3
# Transcription: resend each case's recording (cases with audio only) to the transcription model
npm run voice:replay -- --mode transcribe --cases .voice-cases --model gpt-transcribe
```

| Option                      | Default                                 |                                                                                                                                  |
| --------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `--mode <read\|transcribe>` | `read`                                  | Which half to replay                                                                                                             |
| `--cases <dir>`             | `src/ai/scan-replay/voice-cases`        | Folder with the case files (`*.json`; subfolders are ignored)                                                                    |
| `--model <name>`            | `AI_TEXT_MODEL` / `AI_TRANSCRIBE_MODEL` | Model to replay on (defaults `gpt-5-mini` / `gpt-transcribe`)                                                                    |
| `--effort <e>`              | `AI_TEXT_REASONING_EFFORT`              | Read mode only: `none`, `minimal`, `low`, `medium`, `high`, `xhigh`, or `unset`. Unset env: `low` for `gpt-5-mini`, else `unset` |
| `--price <in,cached,out>`   | none                                    | Read mode: USD per 1M tokens for the model, to estimate cost. Without it a model with no list price in the code shows `-`        |
| `--repeat <n>`              | `1`                                     | Runs per case                                                                                                                    |
| `--language <en\|ro\|da>`   | all                                     | Only cases in this Scan Language                                                                                                 |
| `--only <a,b>`              | all                                     | Case ids to replay                                                                                                               |
| `--limit <n>`               | all                                     | Replay at most this many cases                                                                                                   |
| `--out <dir>`               | `.scan-replay`                          | Where the report goes (git-ignored)                                                                                              |

The key and provider come from the shell, then `.env.local`, `.env` and `../../.env`, like the API (`AI_API_KEY`, `AI_PROVIDER`, `AI_BASE_URL`). The script never writes new debug captures. Every run is a billed call: start with `--limit 3`.

Read mode writes `<out>/<time>-voice-read-<model>-<effort>/report.md` and `answers.json`. The report totals passed runs, tokens, estimated cost (and per run) and mean latency; then breaks results down by Scan Language (actions matched, mismatched, missing, extra) and by tag; then lists every miss with the field that differs. A run **passes** when every expected action was read exactly, nothing extra was read, and the unsupported count matches. A model's matched Ingredient counts only at or above `SCAN_MATCH_CONFIDENCE_THRESHOLD` (default 0.6), as in the app; Matching is approximated: a confident proposed Ingredient wins, otherwise an exact name or Synonym hit on the fallback name or spoken text (as `CatalogMatchService` does), over the shared seed Catalog only. The date sanity check (`sensibleDate`) and list state are not applied.

Transcription mode writes `<out>/<time>-voice-transcribe-<model>/report.md` and `results.json`: per case the latency, word errors against the typed transcript and what was heard when it differs, with word error rate per Scan Language. Cost is not estimated (audio is not billed per token). The recording's extension (`.webm`, `.mp4`/`.m4a`, `.ogg`) sets the mime type sent.

## Comparing `gpt-5-mini` and `gpt-5-nano`

Same cases, same effort, several runs each, then compare the two reports (passed runs, misses by tag, tokens, latency, cost):

```sh
npm run voice:replay -- --mode read --model gpt-5-mini --effort low --repeat 3
npm run voice:replay -- --mode read --model gpt-5-nano --effort low --price <in>,<cached>,<out> --repeat 3
```

Pass `--price` with the current list prices from the provider's pricing page for models the code has no price for (none are built in for these two). Run the seed set for a first look, then recorded cases (a stand-in for production speech) before changing `AI_TEXT_MODEL`. Writing up the comparison and the default recommendation needs these real runs; this repository does not claim any result before then. The same goes for what gpt-transcribe does with Romanian and Danish, iOS Safari recordings (`audio/mp4`) and its file size limit: check them with `--mode transcribe` on real recordings and the provider's documentation.
