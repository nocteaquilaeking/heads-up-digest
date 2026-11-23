# Heads-Up Digest

Heads-Up Digest is a glanceable Telegram highlights feed and read-only crypto watchlist for Even Realities G2 glasses. It runs as a web app in the Even phone app's WebView, with a responsive browser interface when the glasses bridge is unavailable.

**Hackathon track:** Messaging & News. **Candidate:** Best Telegram Integration.

**Project history:** Heads-Up Digest was first built on 20 November 2026 — this project and its repository existed before the Even Realities submission window opened on 23 November 2026, as the commit history shows.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL in a browser. The app starts in Demo Mode and needs no API keys, Telegram account, or bot. The Vite server listens on port 5173. For the Even desktop simulator, point it at `http://localhost:5173`.

The watchlist tries the OKX public spot ticker every 30 seconds. If the request fails, it clearly labels and uses bundled demo prices. Prices are information only.

## Demo Mode

The Digest page uses eight bundled realistic sample messages in `app/src/data/demo.ts`; `app/public/demo-feed.json` is also included as a portable sample feed. Open a row for its source, time, full summary, and why it matters. The Watchlist shows BTC, ETH, SOL, REACT, and UNDOS, with an example `BTC above 100k` threshold card. Nothing in Demo Mode needs the companion bot.

The SDK bridge is isolated in `app/src/sdk.ts`; outside Even Hub its calls are skipped and the phone-width UI remains fully interactive.

## Privacy and live Telegram

The companion bot in `bot/` is an optional Node stub. Users add it only to channels or groups they control, or forward selected messages to it. The bot can only see messages in chats where it is a member (subject to Telegram privacy settings) and messages forwarded to it; it cannot read private chats. Its in-memory `/feed` endpoint is not connected to the web UI yet; Demo Mode is the complete judging path. Set `TELEGRAM_BOT_TOKEN` in the environment to run the stub. No token is included in this repository.

## Demo video plan

Show the app in the Even mobile app simulator (or the desktop Even Hub simulator): start at the Digest menu, open a time-sensitive UNDOS highlight and its context, return to the ranked list, then open Market Watch to show five prices and the threshold example. Close by showing the bundled Demo Mode and explaining that the bot only reads chats it is invited into or messages forwarded to it. Keep the phone-width browser as a fallback if the glasses simulator is unavailable.
