"use client";

import type { CSSProperties, FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Modal from "@/components/ui/Modal";
import { createClient } from "@/lib/supabase/client";
import {
  createTeammate,
  type DBTeammate,
} from "@/lib/supabase/queries/teammates";

type Course = {
  id: string;
  name: string;
  color: string;
};

type AddTeammateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  userId: string;
  onCreated: (teammate: DBTeammate) => void;
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

export default function AddTeammateModal({
  isOpen,
  onClose,
  course,
  userId,
  onCreated,
}: AddTeammateModalProps) {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setName("");
    setEmail("");
    setIsSubmitting(false);
    setErrorMessage("");
  }, [isOpen]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setErrorMessage("Name is required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const created = await createTeammate(supabase, {
        course_id: course.id,
        user_id: userId,
        name: name.trim(),
        email: email.trim() ? email.trim() : null,
      });

      onCreated(created);
      onClose();
      router.refresh();
    } catch {
      setErrorMessage("Could not add teammate right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Teammate">
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 16, paddingBottom: 8 }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={fieldLabelStyle}>Name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Teammate name"
            style={inputStyle}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={fieldLabelStyle}>Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.com"
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
            Add
          </button>
        </div>
      </form>
    </Modal>
  );
}
