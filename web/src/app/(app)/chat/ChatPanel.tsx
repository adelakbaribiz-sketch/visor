"use client";

import Link from "next/link";
import { useState } from "react";
import { searchUpdates } from "@/lib/data/client";
import { IMMIGRATION_UPDATES } from "@/lib/data/fixtures";
import type { ChatMessage } from "@/lib/data/types";

const SUGGESTIONS = [
  "H-1B fee changes",
  "UK salary threshold",
  "Canada express entry draw",
  "EU Blue Card Germany",
];

function id() {
  return Math.random().toString(36).slice(2, 10);
}

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: id(),
      role: "assistant",
      text:
        "Ask about a country, visa type, or keyword — e.g. \"H-1B fee\" or \"UK skilled worker\". I search your tracked update records by keyword; I don't call an external AI model in this demo.",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);

  async function send(text: string) {
    if (!text.trim() || pending) return;
    const userMsg: ChatMessage = {
      id: id(),
      role: "user",
      text,
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setPending(true);

    const results = await searchUpdates(text);
    const reply: ChatMessage = {
      id: id(),
      role: "assistant",
      text:
        results.length === 0
          ? "No tracked updates matched that search. Try a broader term, or a country/visa-type name."
          : `Found ${results.length} matching update${results.length === 1 ? "" : "s"}:`,
      matchedUpdateIds: results.map((r) => r.id),
      createdAt: new Date().toISOString(),
    };
    // Keep the matched titles alongside ids so the render doesn't need a
    // second data fetch.
    setMessages((m) => [...m, reply]);
    setPending(false);
  }

  return (
    <div className="flex flex-1 flex-col rounded-lg border border-border bg-surface">
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.map((m) => (
          <ChatBubble key={m.id} message={m} />
        ))}
        {pending && (
          <p className="text-xs text-foreground-muted">Searching…</p>
        )}
      </div>
      <div className="border-t border-border p-3">
        <div className="mb-2 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-border px-3 py-1 text-xs text-foreground-muted hover:bg-surface-muted"
            >
              {s}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a rule change…"
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-navy-700"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-md rounded-lg px-4 py-2.5 text-sm ${
          isUser
            ? "bg-navy-900 text-white"
            : "bg-surface-muted text-foreground"
        }`}
      >
        <p>{message.text}</p>
        {message.matchedUpdateIds && message.matchedUpdateIds.length > 0 && (
          <MatchedUpdates ids={message.matchedUpdateIds} />
        )}
      </div>
    </div>
  );
}

function MatchedUpdates({ ids }: { ids: string[] }) {
  const items = ids
    .map((i) => IMMIGRATION_UPDATES.find((u) => u.id === i))
    .filter((u): u is NonNullable<typeof u> => Boolean(u))
    .map((u) => ({ id: u.id, title: u.title }));
  return (
    <ul className="mt-2 space-y-1 border-t border-border/50 pt-2">
      {items.map((u) => (
        <li key={u.id}>
          <Link
            href={`/updates/${u.id}`}
            className="text-xs underline underline-offset-2"
          >
            {u.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}
