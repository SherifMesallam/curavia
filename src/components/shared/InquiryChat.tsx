"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

type Message = {
  id: string;
  content: string;
  isAdmin: boolean;
  createdAt: string;
  sender: { firstName: string; lastName: string; role: string };
};

export function InquiryChat({
  inquiryId,
  currentUserIsAdmin,
}: {
  inquiryId: string;
  currentUserIsAdmin: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    const res = await fetch(`/api/inquiries/${inquiryId}/messages`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages ?? []);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inquiryId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    const res = await fetch(`/api/inquiries/${inquiryId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text.trim() }),
    });
    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
      setText("");
    }
    setSending(false);
  };

  return (
    <div className="flex flex-col rounded-lg border overflow-hidden" style={{ height: 420 }}>
      <div className="border-b px-4 py-3 bg-muted/30">
        <h2 className="font-semibold text-sm">Messages</h2>
        <p className="text-xs text-muted-foreground">
          {currentUserIsAdmin ? "Chat with the patient" : "Chat with the Curavia team"}
        </p>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground text-center mt-8">
            No messages yet. Start the conversation!
          </p>
        )}
        {messages.map((m) => {
          const isMine = currentUserIsAdmin === m.isAdmin;
          return (
            <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                isMine
                  ? "bg-teal-600 text-white rounded-br-sm"
                  : "bg-muted text-foreground rounded-bl-sm"
              }`}>
                {!isMine && (
                  <p className="text-[10px] font-semibold mb-1 opacity-70">
                    {m.isAdmin ? "Curavia Team" : `${m.sender.firstName} ${m.sender.lastName}`}
                  </p>
                )}
                <p className="leading-relaxed">{m.content}</p>
                <p className={`text-[10px] mt-1 ${isMine ? "text-white/60" : "text-muted-foreground"}`}>
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  {" · "}
                  {new Date(m.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t p-3 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
          placeholder="Type a message…"
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <Button size="icon" onClick={send} disabled={sending || !text.trim()} className="shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
