"use client";

import type { CSSProperties, FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Input from "@/components/ui/Input";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Modal from "@/components/ui/Modal";
import { createClient } from "@/lib/supabase/client";
import {
  createHomework,
  updateHomework,
  type DBHomework,
} from "@/lib/supabase/queries/homework";

type Course = {
  id: string;
  name: string;
  color: string;
};

type AddHomeworkModalProps = {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  userId: string;
  onCreated: (homework: DBHomework) => void;
  editingHomework?: DBHomework | null;
  onUpdated?: (homework: DBHomework) => void;
};

const fieldStackStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
  paddingBottom: 8,
};

const switchRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  borderRadius: 16,
  background: "#171B28",
  padding: "16px 16px",
};

const helperTextStyle: CSSProperties = {
  margin: "4px 0 0",
  color: "rgba(223,226,243,0.60)",
  fontFamily: "var(--font-manrope), Manrope, sans-serif",
  fontSize: 13,
  lineHeight: 1.5,
};

function toDatetimeLocalValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
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

function toLocalInputValue(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  return toDatetimeLocalValue(date);
}

export default function AddHomeworkModal({
  isOpen,
  onClose,
  course,
  userId,
  onCreated,
  editingHomework = null,
  onUpdated,
}: AddHomeworkModalProps) {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hasDeadline, setHasDeadline] = useState(false);
  const [deadline, setDeadline] = useState("");
  const [remindAt, setRemindAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setTitle(editingHomework?.title ?? "");
    setDescription(editingHomework?.description ?? "");
    setHasDeadline(editingHomework?.has_deadline ?? false);
    setDeadline(toLocalInputValue(editingHomework?.deadline ?? null));
    setRemindAt(toLocalInputValue(editingHomework?.remind_at ?? null));
    setIsSubmitting(false);
    setErrorMessage("");
  }, [editingHomework, isOpen]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setErrorMessage("Title is required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const payload = {
        title: title.trim(),
        description: description.trim() ? description.trim() : null,
        has_deadline: hasDeadline,
        deadline: hasDeadline ? toIsoString(deadline) : null,
        remind_at: toIsoString(remindAt),
      };

      if (editingHomework) {
        const updated = await updateHomework(supabase, editingHomework.id, payload);
        onUpdated?.(updated);
      } else {
        const created = await createHomework(supabase, {
          course_id: course.id,
          user_id: userId,
          ...payload,
        });
        onCreated(created);
      }

      onClose();
      router.refresh();
    } catch {
      setErrorMessage(
        editingHomework
          ? "Could not update homework right now."
          : "Could not create homework right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingHomework ? "Edit Homework" : "Add Homework"}
    >
      <form onSubmit={handleSubmit} style={fieldStackStyle}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <Input
            label="Title"
            placeholder="Finish assignment sheet"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
          <Input
            label="Description"
            placeholder="Optional details"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <div style={switchRowStyle}>
          <div>
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
              Has deadline
            </p>
            <p style={helperTextStyle}>
              Show a countdown badge and deadline timing.
            </p>
          </div>

          <button
            type="button"
            aria-pressed={hasDeadline}
            aria-label="Toggle deadline"
            onClick={() => setHasDeadline((current) => !current)}
            style={{
              position: "relative",
              width: 52,
              height: 32,
              flexShrink: 0,
              border: "none",
              borderRadius: 999,
              background: hasDeadline ? "#41E4C0" : "#313442",
              cursor: "pointer",
              transition: "background 150ms ease",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                top: 4,
                left: hasDeadline ? 24 : 4,
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "#0F131F",
                transition: "left 150ms ease",
              }}
            />
          </button>
        </div>

        {hasDeadline ? (
          <Input
            label="Deadline"
            type="datetime-local"
            value={deadline}
            onChange={(event) => setDeadline(event.target.value)}
            min={toDatetimeLocalValue(new Date())}
            required={hasDeadline}
          />
        ) : null}

        <Input
          label="Remind me"
          type="datetime-local"
          value={remindAt}
          onChange={(event) => setRemindAt(event.target.value)}
        />

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

        <div
          style={{
            display: "flex",
            gap: 12,
            paddingTop: 8,
          }}
        >
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
            {isSubmitting ? <LoadingSpinner size="sm" className="" /> : null}
            <span>{editingHomework ? "Save" : "Create"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
