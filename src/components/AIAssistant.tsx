import { useEffect, useRef, useState } from "react";
import { Bot, Send, X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildApiUrl } from "@/config/api";
import { setAiCollapsed } from "@/lib/ai-assistant-state";

type Msg = { role: "user" | "assistant"; content: string };

export const AI_CONTEXT_EVENT = "ai-assistant:add-context";

export function addAiContext(label: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(AI_CONTEXT_EVENT, { detail: label }));
}

export function AIAssistant() {
  const [collapsed, setCollapsedState] = useState(false);
  const setCollapsed = (v: boolean) => {
    setCollapsedState(v);
    setAiCollapsed(v);
  };
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your Nexus AI Assistant. Ask me about KPIs, portfolio companies, or click a KPI card to add it as context.",
    },
  ]);
  const [input, setInput] = useState("");
  const [contexts, setContexts] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (!detail) return;
      setCollapsed(false);
      setContexts((prev) => (prev.includes(detail) ? prev : [...prev, detail]));
    };
    window.addEventListener(AI_CONTEXT_EVENT, handler);
    return () => window.removeEventListener(AI_CONTEXT_EVENT, handler);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    const prefix = contexts.length ? `[Context: ${contexts.join(", ")}] ` : "";
    const userMsg: Msg = { role: "user", content: prefix + text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch(buildApiUrl("/chat/ask"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content, contexts }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json().catch(() => ({}) as any);
      const reply =
        data?.reply ??
        data?.response ??
        data?.message ??
        (typeof data === "string" ? data : "");
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: reply || "(no response)",
        },
      ]);
    } catch {
      // Mock fallback
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "I'm offline right now, but here's a sample insight: this KPI is trending within expected portfolio benchmarks.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="group fixed right-0 top-1/2 -translate-y-1/2 z-40 flex w-11 flex-col items-center gap-2 rounded-l-xl bg-teal-600 px-2 py-4 text-white shadow-lg ring-1 ring-teal-700/20 transition-all hover:bg-teal-700 hover:scale-[1.03]"
        aria-label="Open AI Assistant"
        style={{ fontFamily: "Inter, system-ui, sans-serif" }}
      >
        <Sparkles className="h-5 w-5" />
        <span className="text-[10px] font-bold tracking-[0.18em] [writing-mode:vertical-rl] rotate-180">
          AI ASSISTANT
        </span>
        <ChevronLeft className="h-3.5 w-3.5 opacity-80 group-hover:opacity-100" />
      </button>
    );
  }

  return (
    <aside
      className="fixed right-0 top-0 z-40 h-screen w-[360px] bg-white border-l border-slate-200 shadow-sm flex flex-col"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <div className="h-12 flex items-center justify-between border-b border-slate-200 px-3">
        <div className="flex items-center gap-2 text-slate-700">
          <Bot className="h-4 w-4 text-teal-600" />
          <span className="text-[12px] font-semibold tracking-wide">AI ASSISTANT</span>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          aria-label="Collapse AI Assistant"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[90%] rounded-lg px-3 py-2 text-[13px] leading-relaxed whitespace-pre-wrap",
              m.role === "user"
                ? "ml-auto bg-teal-600 text-white"
                : "bg-slate-100 text-slate-800",
            )}
          >
            {m.content}
          </div>
        ))}
        {sending && (
          <div className="bg-slate-100 text-slate-500 rounded-lg px-3 py-2 text-[13px] w-fit">
            Thinking…
          </div>
        )}
      </div>

      {contexts.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-t border-slate-200 px-3 py-2">
          {contexts.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-700"
            >
              {c}
              <button
                onClick={() => setContexts((p) => p.filter((x) => x !== c))}
                className="hover:text-teal-900"
                aria-label={`Remove ${c}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="border-t border-slate-200 p-2 flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={2}
          placeholder="Ask about a KPI, portco, or trend…"
          className="flex-1 resize-none rounded-md border border-slate-200 px-2 py-1.5 text-[13px] focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
        <button
          onClick={send}
          disabled={sending || !input.trim()}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
          aria-label="Send"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
