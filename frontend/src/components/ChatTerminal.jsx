import { useEffect, useRef, useState } from "react";
import { BUSINESS_META, initialsFor } from "../data/businessMeta.js";

// A small, safe markdown renderer: escapes HTML first, then supports
// **bold**, *italic*, line breaks, and GitHub-style pipe tables. No raw HTML
// from the model is ever trusted — everything is escaped before formatting.
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inlineFormat(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>");
}

function isTableRow(line) {
  const t = line.trim();
  return t.startsWith("|") && t.endsWith("|") && t.length > 1;
}

function isSeparatorRow(line) {
  return /^\|?[\s:|-]+\|?$/.test(line.trim()) && line.includes("-");
}

function parseRow(line) {
  const t = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return t.split("|").map((cell) => cell.trim());
}

function renderMarkdownLite(text) {
  const lines = text.split("\n");
  const html = [];
  let i = 0;

  while (i < lines.length) {
    if (isTableRow(lines[i]) && lines[i + 1] && isSeparatorRow(lines[i + 1])) {
      const header = parseRow(lines[i]);
      i += 2;
      const rows = [];
      while (i < lines.length && isTableRow(lines[i])) {
        rows.push(parseRow(lines[i]));
        i++;
      }
      html.push(
        '<div class="md-table-wrap"><table class="md-table"><thead><tr>' +
          header.map((h) => `<th>${inlineFormat(h)}</th>`).join("") +
          "</tr></thead><tbody>" +
          rows
            .map(
              (r) => "<tr>" + r.map((c) => `<td>${inlineFormat(c)}</td>`).join("") + "</tr>"
            )
            .join("") +
          "</tbody></table></div>"
      );
    } else {
      const para = [];
      while (
        i < lines.length &&
        !(isTableRow(lines[i]) && lines[i + 1] && isSeparatorRow(lines[i + 1]))
      ) {
        para.push(lines[i]);
        i++;
      }
      if (para.length) {
        html.push(para.map(inlineFormat).join("<br />"));
      }
    }
  }

  return html.join("<br />");
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function ChatTerminal({ business }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const logRef = useRef(null);

  // Reset the conversation whenever the active business changes
  useEffect(() => {
    if (!business) return;
    setMessages([{ role: "assistant", content: business.greeting, ts: Date.now() }]);
    setError(null);
  }, [business?.id]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function sendMessage(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending || !business) return;

    const nextHistory = [...messages, { role: "user", content: text, ts: Date.now() }];
    setMessages(nextHistory);
    setInput("");
    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_id: business.id,
          message: text,
          history: nextHistory
            .slice(0, -1)
            .map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, ts: Date.now() },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  if (!business) return null;

  const meta = BUSINESS_META[business.id] || { sector: "" };
  const initials = initialsFor(business.label);

  return (
    <section className="terminal" style={{ "--accent-active": business.accent }}>
      <header className="terminal-header">
        <span className="terminal-avatar">{initials}</span>
        <div>
          <div className="biz-name">{business.label}</div>
          <div className="biz-status">
            <span className="dot" />
            Assistant online
          </div>
        </div>
        <span className="biz-sector">{meta.sector}</span>
      </header>

      <div className="terminal-log" ref={logRef}>
        {messages.map((m, i) => {
          const isUser = m.role === "user";
          return (
            <div key={i} className={`msg-row ${m.role}`}>
              <span className="msg-avatar">{isUser ? "You" : initials}</span>
              <div className="msg-col">
                <div
                  className="msg-bubble"
                  dangerouslySetInnerHTML={{ __html: renderMarkdownLite(m.content) }}
                />
                <span className="msg-time">{formatTime(m.ts)}</span>
              </div>
            </div>
          );
        })}
        {sending && (
          <div className="msg-row assistant">
            <span className="msg-avatar">{initials}</span>
            <div className="msg-col">
              <div className="msg-bubble">
                <div className="typing-indicator">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}

      <form className="terminal-input-row" onSubmit={sendMessage}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message ${business.label}…`}
          disabled={sending}
          autoComplete="off"
        />
        <button type="submit" disabled={sending || !input.trim()}>
          Send
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M4 12L20 4L14 20L11 13L4 12Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </form>
    </section>
  );
}
