## 🧠 System Design

<details>
<summary>Click to view Mermaid diagram code</summary>

```mermaid
flowchart TD
  subgraph Frontend [Frontend - Next.js App]
    A[Home Page Sections]
    B[Chatbot UI]
    C[VisitorTracker Script]
  end

  subgraph API [Serverless API Routes]
    D[/api/contact/email]
    E[/api/contact/meeting]
    F[/api/chatbot/message]
    G[/api/track-visitor-location]
    H[/api/track-button-click]
  end

  subgraph Services
    I[(Firebase Firestore)]
    J[(OpenAI API)]
    K[(Google Calendar API)]
    L[(Resend Email API)]
  end

  A --> D
  A --> E
  A --> F
  C --> G
  A --> H
  D --> L
  E --> K
  F --> J
  G --> I
  H --> I
```

</details>
