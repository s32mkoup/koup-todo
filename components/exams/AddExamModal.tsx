"use client";

import type { CSSProperties, FormEvent } from "react";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import {
  createExam,
  updateExam,
  type DBExam,
} from "@/lib/supabase/queries/exams";
import Input from "@/components/ui/Input";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Modal from "@/components/ui/Modal";

type Course = {
  id: string;
  name: string;
  color: string;
};

type AddExamModalProps = {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  onCreated: (exam: DBExam) => void;
  editingExam?: DBExam | null;
  onUpdated?: (exam: DBExam) => void;
};

const fieldStackStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
  paddingBottom: 8,
};

const helperTextStyle: CSSProperties = {
  margin: "4px 0 0",
  color: "rgba(223,226,243,0.60)",
  fontFamily: "var(--font-manrope), Manrope, sans-serif",
  fontSize: 13,
  lineHeight: 1.5,
};

const textareaStyle: CSSProperties = {
  width: "100%",
  minHeight: 112,
  resize: "vertical",
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

function toDatetimeLocalValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function toLocalInputValue(value: string | null) {
  if (!value) {
    return "";
  }

  return toDatetimeLocalValue(new Date(value));
}

function toIsoString(value: string) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

export default function AddExamModal({
  isOpen,
  onClose,
  course,
  onCreated,
  editingExam = null,
  onUpdated,
}: AddExamModalProps) {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [examDate, setExamDate] = useState("");
  const [location, setLocation] = useState("");
  const [topics, setTopics] = useState("");
  const [readiness, setReadiness] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setTitle(editingExam?.title ?? "");
    setExamDate(toLocalInputValue(editingExam?.exam_date ?? null));
    setLocation(editingExam?.location ?? "");
    setTopics(editingExam?.topics ?? "");
    setReadiness(editingExam?.readiness ?? 3);
    setIsSubmitting(false);
    setErrorMessage("");
  }, [editingExam, isOpen]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !examDate) {
      setErrorMessage("Title and exam date are required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const examDateIso = toIsoString(examDate);
      if (!examDateIso) {
        throw new Error("Invalid exam date");
      }

      const payload = {
        title: title.trim(),
        exam_date: examDateIso,
        location: location.trim() ? location.trim() : null,
        topics: topics.trim() ? topics.trim() : null,
        readiness,
      };

      if (editingExam) {
        const updated = await updateExam(supabase, editingExam.id, payload);
        onUpdated?.(updated);
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("Missing user");
        }

        const created = await createExam(supabase, {
          course_id: course.id,
          user_id: user.id,
          ...payload,
        });

        onCreated(created);
      }

      onClose();
      router.refresh();
    } catch {
      setErrorMessage(
        editingExam
          ? "Could not update exam right now."
          : "Could not create exam right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingExam ? "Edit Exam" : "Add Exam"}
    >
      <form onSubmit={handleSubmit} style={fieldStackStyle}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Input
            label="Title"
            placeholder="Machine Learning Final"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
          <Input
            label="Exam date"
            type="datetime-local"
            value={examDate}
            onChange={(event) => setExamDate(event.target.value)}
            required
          />
          <Input
            label="Location"
            placeholder="Room A3 or online"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />
          <label
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              fontFamily: "var(--font-manrope), Manrope, sans-serif",
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: "0.03em",
                color: "rgba(223,226,243,0.60)",
              }}
            >
              Topics
            </span>
            <textarea
              placeholder="Optional topics or scope"
              value={topics}
              onChange={(event) => setTopics(event.target.value)}
              style={textareaStyle}
            />
          </label>
        </div>

        <div
          style={{
            borderRadius: 16,
            background: "#171B28",
            padding: 16,
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#DFE2F3",
              fontFamily: "var(--font-manrope), Manrope, sans-serif",
              fontSize: 15,
              fontWeight: 600,
              lineHeight: 1.4,
            }}
          >
            Readiness
          </p>
          <p style={helperTextStyle}>
            Rate how prepared you currently feel on a 1 to 5 scale.
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            {Array.from({ length: 5 }, (_, index) => {
              const value = index + 1;
              const filled = value <= readiness;

              return (
                <button
                  key={value}
                  type="button"
                  aria-label={`Set readiness to ${value}`}
                  onClick={() => setReadiness(value)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 36,
                    height: 36,
                    border: "none",
                    borderRadius: 12,
                    background: "transparent",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <Star
                    size={22}
                    strokeWidth={1.9}
                    color={filled ? "#FFB955" : "rgba(223,226,243,0.20)"}
                    fill={filled ? "#FFB955" : "transparent"}
                  />
                </button>
              );
            })}
          </div>
        </div>

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

        <div style={{ display: "flex", gap: 12, paddingTop: 8 }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              flex: 1,
              minHeight: 52,
              borderRadius: 12,
              border: "1px solid rgba(74,69,79,0.60)",
              background: "transparent",
              color: "#DFE2F3",
              fontFamily: "var(--font-manrope), Manrope, sans-serif",
              fontSize: 15,
              fontWeight: 500,
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.6 : 1,
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              flex: 1,
              minHeight: 52,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
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
            {isSubmitting ? <LoadingSpinner size="sm" /> : null}
            <span>{editingExam ? "Save" : "Create"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
