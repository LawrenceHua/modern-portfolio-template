# API routes

- `POST /api/chatbot`: optional OpenAI portfolio assistant.
- `POST /api/contact`: optional Resend email delivery; returns 503 when unconfigured.
- `GET /api/rss`: podcast channel metadata from the site config.
- `/api/analytics/*`: optional Firebase analytics views and AI insights.

Keep credentials in deployment environment variables. Public analytics collection rules and administrative access controls must be configured for your deployment. Meeting scheduling is an integration point, not a bundled calendar service.
