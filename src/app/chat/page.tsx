"use client";

import { Chatbot } from "@/components/chatbot";

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Chatbot isOpen={true} onClose={() => {}} />
    </div>
  );
}
