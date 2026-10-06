# Optional chatbot

The UI sends messages to `/api/chatbot`. The server uses `OPENAI_API_KEY` and derives portfolio context from `src/config/site.ts`. Without a key, the API returns a clear unavailable response. Keep provider keys server-only.

Calendar scheduling and file-processing controls need additional backend integration before enabling them for visitors.
