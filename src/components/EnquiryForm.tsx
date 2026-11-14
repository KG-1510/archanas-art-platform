"use client";

import { useState, type FormEvent } from "react";
import { whatsappLink } from "@/lib/site";
import { WhatsAppIcon } from "./WhatsAppButton";

// WebMCP declarative attributes: lets a browser AI agent fill this form as a tool.
// It never auto-submits, so a person always confirms before a message is sent.
const webmcp = {
  toolname: "enquire_with_studio",
  tooldescription:
    "Prepare a WhatsApp enquiry to Archana's Art about a class, workshop, demo, commission or painting. Opens WhatsApp with the message drafted; the person sends it themselves.",
} as Record<string, string>;

const param = (text: string) => ({ toolparamdescription: text }) as Record<string, string>;

export function EnquiryForm({ topics, defaultTopic }: { topics: string[]; defaultTopic?: string }) {
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") || "").trim();
    const topic = String(data.get("topic") || "").trim();
    const message = String(data.get("message") || "").trim();
    const text = [`Hello, I am ${name}.`, `I am enquiring about: ${topic}.`, message].filter(Boolean).join("\n");
    window.open(whatsappLink(text), "_blank", "noopener,noreferrer");
    setSent(true);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-7" {...webmcp}>
      <label className="field">
        <span>Your name</span>
        <input name="name" type="text" required maxLength={80} autoComplete="name" {...param("The enquirer's name")} />
      </label>
      <label className="field">
        <span>I am interested in</span>
        <select name="topic" defaultValue={defaultTopic || topics[0]} {...param("What the enquiry is about")}>
          {topics.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Message</span>
        <textarea name="message" rows={4} maxLength={600} {...param("Details: preferred dates, experience level, size or subject of a commission")} />
      </label>
      <div className="flex flex-wrap items-center gap-5">
        <button type="submit" className="btn">
          <WhatsAppIcon className="h-4 w-4" />
          Continue on WhatsApp
        </button>
        <p role="status" className="text-sm text-muted">
          {sent ? "WhatsApp opened in a new tab with your message drafted. Press send there." : "Opens WhatsApp with your message ready to send."}
        </p>
      </div>
    </form>
  );
}
