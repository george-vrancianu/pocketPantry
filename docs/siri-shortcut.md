# Building the "Pantry add" Shortcut

"Pantry add" is an Apple Shortcut that lets a Member say "Hey Siri, Pantry add", dictate what to add, and hear a one-sentence reply. It sends the dictated text to the API as an Assistant Request (see [ADR 0019](adr/0019-assistant-requests-apply-safe-voice-actions-without-review.md)). Build it on an iPhone or iPad in the Shortcuts app, then share it as an iCloud link.

The name of the Shortcut is the Siri phrase, so it is "Pantry add" in every language. Siri's phrase is English; the dictated items can be in any language Pocket Pantry supports.

## The API contract

```
POST <API origin>/api/assistant/requests
Authorization: Bearer <Assistant Token>
Content-Type: application/json

{ "text": string, "today"?: "YYYY-MM-DD" }
```

Response: `{ "outcomes": [...], "speech": string }`. The Shortcut only uses `speech`. `<API origin>` is the deployment's API origin (the same one the web app uses, `VITE_API_URL`, or its own origin when that is unset).

## Actions, in order

1. **Text** (the token). Add a Text action and put the placeholder `Assistant Token` in it. Open the Shortcut's settings (the "i" button) and choose **Setup > Add Import Question** on this Text action. Question: `Paste your Assistant Token`. A Member creates the token in Settings > Siri; the question is asked once, when they add the Shortcut, and the answer is stored in this action.
2. **Dictate Text**. Language: choose the language most items will be said in, or leave it on "Ask Every Time" if you want to be asked (Dictate Text takes one language per action, so a Member who speaks Romanian should set Romanian). Stop Listening: "After Pause" (or "On Tap" if pauses cut dictation short). Prompt: `What should I add?` (the Siri question spoken before listening).
3. **Current Date**.
4. **Format Date**. Date: Current Date. Date Format: **Custom**, format string `yyyy-MM-dd`. This gives the Member's local date in ISO form (`YYYY-MM-DD`), which the API needs to resolve words like "tomorrow".
5. **Get Contents of URL**.
   - URL: `<API origin>/api/assistant/requests`
   - Show More > Method: **POST**
   - Headers:
     - `Authorization` = `Bearer ` followed by the **Text** variable from step 1 (one space after `Bearer`)
     - `Content-Type` = `application/json`
   - Request Body: **JSON**, with two fields:
     - `text` (Text) = the **Dictated Text** variable from step 2
     - `today` (Text) = the **Formatted Date** variable from step 4
6. **Get Dictionary Value**. Get **Value** for key `speech` in the **Contents of URL** result.
7. **Speak Text**. Text: the **Dictionary Value** from step 6.

Finally, rename the Shortcut to exactly `Pantry add` (Shortcut name field at the top of the editor, or Rename in the menu). Shortcuts can be run by saying the name after "Hey Siri".

## Sharing it

1. In the Shortcut's settings, confirm the Import Question from step 1 is listed under Setup.
2. Share > **Copy iCloud Link**. The link carries the actions and the import question but not the answer, so no token is shared. Re-share (a new link or an updated one) after any change.
3. Build the web app with `VITE_SIRI_SHORTCUT_URL=<the iCloud link>` (documented in [apps/web/README.md](../apps/web/README.md)). Settings > Siri then shows the link in its setup steps; while the variable is unset or empty the link is hidden.

## When something goes wrong

- A revoked or mistyped token is refused by the API. Revoke and create tokens in Settings > Siri; to change the token in an installed Shortcut, edit its first Text action.
- Where the API answers with a `speech` reply (including for refused or failed requests), the Shortcut speaks it as normal. If there is no network or the response has no `speech`, Shortcuts shows its own error; the Shortcut has no extra error handling.
