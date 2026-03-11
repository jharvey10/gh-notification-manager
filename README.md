# GitHub Notification Manager

GitHub Notification Manager is an Electron desktop app for reviewing and managing GitHub
notifications outside the browser.

It uses GitHub's GraphQL API to poll notification threads, display them in a desktop UI, and support
actions like marking items read, unread, done, saved, and unsubscribed. The app also includes
settings for OS notifications, older-item filtering, and automatic cleanup of stale notifications.

## The Problem

GitHub's web notification UI is built around a single "reason" for why a thread is in your inbox. In
practice, that is often too flat to be useful once a thread gets busy.

You might get a notification because you were directly mentioned, assigned, or asked for review.
That notification rises to the top, but then twenty more comments happen afterward. In the GitHub
UI, that thread still largely looks like another notification with the same broad reason, even
though there is a big difference between "this thread once involved me directly" and "something new
just happened for me personally again."

## What This App Fixes

This project treats GitHub's reason field as a starting point, not the whole story.

Instead of just mirroring the inbox, it pulls in richer subject and timeline context and then runs
every changed notification through a processing pipeline. The goal is to build a local model of the
inbox that is more specific, more filterable, and more useful for deciding what deserves attention.

That means the app can describe a thread with multiple overlapping pieces of meaning instead of a
single coarse label.

## Direct Events Matter

One of the more important pieces is that the app cross-checks direct-event timeline data instead of
trusting only the top-level GitHub reason.

If a thread contains mention, assignment, or review-request activity aimed at you, that gets tracked
separately from the generic notification reason. This helps recover cases where GitHub surfaces only
one "most important" reason even though the thread has other important direct signals hidden inside
it.

## Smarter Push Notifications

That same model drives desktop notifications.

The app does not send an OS notification for every changed thread unless you want it to. It
distinguishes between a truly new direct mention, assignment, or personal review request. It can
notify on general activity for threads you chose to save. And you can also enable the catch-all mode
to get alerted for everything.

Under the hood, the first poll seeds an in-memory cache. Later polls compare hashes to detect actual
changes, and direct-event timestamps are compared against the previously seen state. That makes "you
were mentioned at some point in this thread" different from "you were mentioned again just now,"
which is the distinction the default GitHub inbox does not really expose.

## Better Filtering

Those tags are not just for display. They also power local filtering in the UI, so the inbox can be
searched and narrowed by detailed tags, repositories, and unread state instead of relying only on
GitHub's flatter built-in categories.

## Developing

- Node.js 22 or newer
- npm
- A GitHub token with `notifications` and `repo` scopes, or access to a token from `gh auth token`

```bash
npm install
```

```bash
npm run dev
```

This starts the Vite renderer and Electron main process together. On first launch, enter a GitHub
token in the app. You can get one from:

```bash
gh auth token
```

Other useful scripts:

- `npm run dev` starts the renderer and Electron app in development mode
- `npm run build` builds the renderer bundle
- `npm run start` launches the Electron app
- `npm run typecheck` runs TypeScript type checking
- `npm run dist:mac` builds a macOS release package
- `npm run dist:win` builds a Windows release package
- `npm run dist:linux` builds a Linux release package

The repo uses Electron, React, Vite, Tailwind CSS, and DaisyUI. Releases are automated with Release
Please.

## License

Apache 2.0
