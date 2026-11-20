# Companion bot stub

Install dependencies with `npm install`, set `TELEGRAM_BOT_TOKEN` in your environment, then run `npm start`. The bot exposes `GET /feed` on port 8787 and keeps the latest 50 messages in memory. It is a small local/demo stub; it has no persistence or authentication yet.

## Honest privacy model

Users add the bot only to channels or groups they control, or forward individual messages to it. Telegram bots can only see messages in chats where they are members (subject to Telegram group privacy settings) and messages forwarded or sent to them. This bot cannot read a user's private Telegram chats. No message is sent to an AI service by this stub.

The scoring TODO is next to message ingestion in `src/index.js`. Keep the bot token in an environment variable; never commit it.
