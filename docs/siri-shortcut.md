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
2. **Dictate Text**. Leave Language at its default (the device language) or pick one specific language; do not use "Ask Each Time", which breaks the hands-free flow under Siri. Dictate Text takes one language per action and one link is shared with every Member, so Members who say items in another language change it after installing (see "After installing" below). Stop Listening: "After Pause" (or "On Tap" if pauses cut dictation short). Prompt: `What should I add?` (the Siri question spoken before listening).
3. **Date**. Leave it on Current Date.
4. **Format Date**. Date: the **Date** variable from step 3. Date Format: **Custom**, format string `yyyy-MM-dd`. This gives the Member's local date in ISO form (`YYYY-MM-DD`), which the API needs to resolve words like "tomorrow".
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
7. **If**. Input: the **Dictionary Value** from step 6, condition **has any value**.
   - In the If branch: **Speak Text**, text = the **Dictionary Value** from step 6.
   - In the **Otherwise** branch: **Speak Text**, text = `Pocket Pantry didn't answer. Try again, or check your Assistant Token in Settings.` (a fixed English fallback).
8. **End If**.

The If is needed because some failures have no `speech`: a revoked, unknown or missing token gets HTTP 401, a text over 2000 characters or an invalid body gets HTTP 400, and an unexpected server error gets HTTP 500, all with no `speech`; a network failure returns nothing at all. Without the If, Speak Text would say nothing. As far as we know, Get Contents of URL returns the error body on non-2xx statuses rather than stopping the Shortcut, which is what lets the Otherwise branch run; verify this on a device with a revoked token.

Finally, rename the Shortcut to exactly `Pantry add` (Shortcut name field at the top of the editor, or Rename in the menu). Shortcuts can be run by saying the name after "Hey Siri".

## Sharing it

1. In the Shortcut's settings, confirm the Import Question from step 1 is listed under Setup.
2. Set the first **Text** action back to the placeholder `Assistant Token`. Never share with a real token in it: the action's current value is shared as the Import Question's default answer, so a real token would travel in the iCloud link to everyone who imports it.
3. Share > **Copy iCloud Link**. The link carries the actions and the import question (with the placeholder as its default). An iCloud link is a snapshot: after any edit, copy a new link and update `VITE_SIRI_SHORTCUT_URL` in each environment.
4. Build the web app with `VITE_SIRI_SHORTCUT_URL=<the iCloud link>` (documented in [apps/web/README.md](../apps/web/README.md)). Settings > Siri then shows the link in its setup steps; while the variable is unset or empty the link is hidden.

## After installing

To dictate in another language (for example Romanian or Danish; Siri's phrase stays English), open the Shortcut in the Shortcuts app, tap **Dictate Text**, and set **Language** to the language items are said in. The reply comes back in the language you spoke, so also tap **Speak Text**, open Show More, and set its **Language** to the same one; otherwise a Romanian reply is read by an English voice.

## When something goes wrong

- A revoked, unknown or mistyped token gets HTTP 401, an invalid body (for example text over 2000 characters) gets HTTP 400, and an unexpected server error gets HTTP 500; none carry `speech`, so the Shortcut speaks the fixed fallback from step 7. Revoke and create tokens in Settings > Siri; to change the token in an installed Shortcut, edit its first Text action.
- Cap reached (429), provider failure (502), nothing understood (200) and "not configured" (503) are answered with a `speech` reply, which the Shortcut speaks as normal.
- With no network there is no response, so the Otherwise branch speaks the fallback (or Shortcuts shows its own error).
