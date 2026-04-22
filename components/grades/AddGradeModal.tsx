"use client";

import type { CSSProperties, FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Modal from "@/components/ui/Modal";
import { createClient } from "@/lib/supabase/client";
import {
  createGrade,
  type DBGrade,
} from "@/lib/supabase/queries/grades";

type Course = {
  id: string;
  name: string;
  color: string;
};

type AddGradeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  userId: string;
  onCreated: (grade: DBGrade) => void;
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

export default function AddGradeModal({
  isOpen,
  onClose,
  course,
  userId,
  onCreated,
}: AddGradeModalProps) {
  const router = useRouter();
  const supabase = createClient();

  const [itemName, setItemName] = useState("");
  const [maxScore, setMaxScore] = useState("");
  const [receivedScore, setReceivedScore] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setItemName("");
    setMaxScore("");
    setReceivedScore("");
    setIsSubmitting(false);
    setErrorMessage("");
  }, [isOpen]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedMax = Number(maxScore);
    const parsedReceived = Number(receivedScore);

    if (!itemName.trim() || Number.isNaN(parsedMax) || Number.isNaN(parsedReceived)) {
      setErrorMessage("Item name, max score, and received score are required.");
      return;
    }

    if (parsedMax <= 0) {
      setErrorMessage("Max score must be greater than zero.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const created = await createGrade(supabase, {
        course_id: course.id,
        user_id: userId,
        item_name: itemName.trim(),
        max_score: parsedMax,
        received_score: parsedReceived,
      });

      onCreated(created);
      onClose();
      router.refresh();
    } catch {
      setErrorMessage("Could not add grade right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Grade">
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 16, paddingBottom: 8 }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={fieldLabelStyle}>Item name</span>
          <input
            value={itemName}
            onChange={(event) => setItemName(event.target.value)}
            placeholder="Midterm or assignment"
            style={inputStyle}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={fieldLabelStyle}>Max score</span>
          <input
            type="number"
            inputMode="decimal"
            value={maxScore}
            onChange={(event) => setMaxScore(event.target.value)}
            placeholder="100"
            style={inputStyle}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={fieldLabelStyle}>Received score</span>
          <input
            type="number"
            inputMode="decimal"
            value={receivedScore}
            onChange={(event) => setReceivedScore(event.target.value)}
            placeholder="78"
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
