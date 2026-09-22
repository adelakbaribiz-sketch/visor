import { DemoDataBadge } from "@/components/Badge";
import { ChatPanel } from "./ChatPanel";

export default function ChatPage() {
  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-navy-900 dark:text-foreground">
            Ask Visor
          </h1>
          <p className="text-sm text-foreground-muted">
            Keyword search over your tracked updates, in a chat-style
            interface.
          </p>
        </div>
        <DemoDataBadge label="Keyword search — no LLM call" />
      </div>
      <ChatPanel />
    </div>
  );
}
