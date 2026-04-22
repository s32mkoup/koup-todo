"use client";

import type { CSSProperties, FormEvent } from "react";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { createClient } from "@/lib/supabase/client";
import {
  createNote,
  deleteNote,
  type DBNote,
} from "@/lib/supabase/queries/notes";

type Course = {
  id: string;
  name: string;
  color: string;
};

type Props = {
  course: Course;
  notes: DBNote[];
  userId: string;
};

const pageStyle: CSSProperties = {
  minHeight: "100dvh",
  background: "#0F131F",
  color: "#DFE2F3",
};

const contentStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 24,
  padding: "8px 20px 128px",
};

const fieldLabelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  letterSpacing: "0.03em",
  color: "rgba(223,226,243,0.60)",
  fontFamily: "var(--font-manrope), Manrope, sans-serif",
};

const inputStyle: CSSProperties = {
  width: "100%",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "#0A0E1A",
  color: "#DFE2F3",
  padding: "14px 16px",
  outline: "none",
  fontFamily: "var(--font-manrope), Manrope, sans-serif",
  fontSize: 15,
  lineHeight: 1.6,
  boxSizing: "border-box",
};

const textareaStyle: CSSProperties = {
  ...inputStyle,
  minHeight: 112,
  resize: "vertical",
};

export default function NotesClient({ course, notes: initialNotes, userId }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [notes, setNotes] = useState(initialNotes);
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedContent = content.trim();
    const trimmedUrl = url.trim();

    if (!trimmedContent && !trimmedUrl) {
      setErrorMessage("Add note content or a URL.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const created = await createNote(supabase, {
        course_id: course.id,
        user_id: userId,
        content: trimmedContent || null,
        url: trimmedUrl || null,
      });

      setNotes((current) => [created, ...current]);
      setContent("");
      setUrl("");
      router.refresh();
    } catch {
      setErrorMessage("Could not add note right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setBusyId(id);

    try {
      await deleteNote(supabase, id);
      setNotes((current) => current.filter((entry) => entry.id !== id));
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div style={pageStyle}>
      <PageHeader
        title="Notes"
        subtitle={course.name}
        backHref={`/courses/${course.id}`}
      />

      <main style={contentStyle}>
        <Card style={{ padding: 16 }}>
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={fieldLabelStyle}>Content</span>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Write a note, summary, or reminder"
                style={textareaStyle}
              />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={fieldLabelStyle}>URL</span>
              <input
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://example.com"
                style={inputStyle}
              />
            </label>

            {errorMessage ? (
              <p
                style={{
                  margin: 0,
                  color: "#FF6B6B",
                  fontFamily: "var(--font-manrope), Manrope, sans-serif",
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                {errorMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                alignSelf: "flex-start",
                minHeight: 44,
                padding: "0 18px",
                border: "none",
                borderRadius: 12,
                background: "linear-gradient(135deg, #D6BAFF, #7B5EA7)",
                color: "#0F131F",
                fontFamily: "var(--font-manrope), Manrope, sans-serif",
                fontSize: 15,
                fontWeight: 600,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.75 : 1,
              }}
            >
              Add Note
            </button>
          </form>
        </Card>

        {notes.length === 0 ? (
          <EmptyState
            icon="📒"
            title="No notes yet"
            description="Save links, snippets, and course notes here as you go."
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {notes.map((note) => (
              <Card key={note.id} style={{ padding: 16 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {note.content ? (
                      <p
                        style={{
                          margin: 0,
                          color: "#DFE2F3",
                          fontFamily: "var(--font-manrope), Manrope, sans-serif",
                          fontSize: 14,
                          lineHeight: 1.6,
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {note.content}
                      </p>
                    ) : null}
                    {note.url ? (
                      <a
                        href={note.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-block",
                          marginTop: note.content ? 10 : 0,
                          color: "#D6BAFF",
                          fontFamily: "var(--font-manrope), Manrope, sans-serif",
                          fontSize: 14,
                          lineHeight: 1.6,
                          textDecoration: "underline",
                          wordBreak: "break-all",
                        }}
                      >
                        {note.url}
                      </a>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    aria-label="Delete note"
                    disabled={busyId === note.id}
                    onClick={() => void handleDelete(note.id)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 36,
                      height: 36,
                      border: "none",
                      borderRadius: 12,
                      background: "transparent",
                      color: "#FF6B6B",
                      cursor: busyId === note.id ? "not-allowed" : "pointer",
                      opacity: busyId === note.id ? 0.55 : 1,
                    }}
                  >
                    <Trash2 size={18} strokeWidth={1.8} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
