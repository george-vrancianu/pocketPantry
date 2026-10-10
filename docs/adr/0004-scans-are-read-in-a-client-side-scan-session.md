# Scans are read in a client-side Scan Session

A Scan used to be taken, awaited and reviewed one at a time: the Member photographed something, waited for the read, and landed on Review before the camera was usable again. Shopping home with a receipt, a few products and a counter of loose ingredients meant several round trips through the camera and Review. The Scan screen redesign (#120) takes Scans without waiting and reviews them together.

## Decision

- A **Scan Session** is the Scans taken from opening the camera until they are added or discarded. It lives in the client, in memory, as a pure reducer (`enqueue`, `start`, `read`, `remove`) behind a small module store, the same way the Review draft is held.
- Each Scan is read over the existing synchronous `/scan/*` endpoints, in the Scan Mode and Scan Language it was taken in. At most 2 reads run at a time; the rest wait in the order the Scans were taken. A read carries on after the Member leaves the Scan screen.
- The Review screen becomes an overview with one card per Scan. A card opens the existing line editor for that Scan at `/scan/review/:scanId`.
- **Saving commits one card.** It goes through the endpoint its Scan Mode already used (the bulk Batch endpoint, or Receipt confirm with its Shopping Item ticking) and removes only that card.
- A Scan whose read fails is dropped for now and the reason is shown on the Scan screen. Retry and the Scan Cap state follow in #115.
- Plate Scans and gallery photos keep their earlier flows until their own slices (#117, #119).

## Alternatives considered

- **Server-side jobs.** The API would take the photo, return a job id and the client would poll. Rejected: it needs a job store, a worker and cleanup, and it would keep photos on the server, which the API never does (it forwards images to the provider and stores nothing).
- **A persisted Scan Session** (local storage or IndexedDB). Rejected: photos as data URLs are large, a half-reviewed session that resurfaces on the next visit is more confusing than useful, and Scans are cheap to retake.
- **One combined commit** for the whole Scan Session. Rejected: the modes save through different endpoints with different follow-ups (Receipt ticks Shopping Items), and one failing card would hold back all the others. Per-card commits keep a saved card saved.

## Consequences

- A reload or closed tab loses every Scan in the Scan Session that has not been saved. Close asks before throwing Scans away (#116).
- Every read counts against the Scan Cap on its own, so a long session can reach the cap part-way; the cards read before that stay usable.
- The images of the Scans in the Scan Session stay in memory until the card is saved or removed, so the session is limited in size (#116).
- Leaving `/scan` unmounts the camera, which stops the stream. Returning with the Camera link starts it again; the Scan Session is untouched.
- Review has two shapes: the per-card editor for a Scan Session, and the single draft of the earlier flow for Plate and gallery photos (`/scan/review/draft`).
