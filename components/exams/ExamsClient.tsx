"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { Plus, Star, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import AddExamModal from "@/components/exams/AddExamModal";
import Card from "@/components/ui/Card";
import CountdownBadge from "@/components/ui/CountdownBadge";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { createClient } from "@/lib/supabase/client";
import {
  deleteExam,
  updateReadiness,
  type DBExam,
} from "@/lib/supabase/queries/exams";

type Course = {
  id: string;
  name: string;
  color: string;
};

type Props = {
  course: Course;
  exams: DBExam[];
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

const fabStyle: CSSProperties = {
  position: "fixed",
  right: 20,
  bottom: "calc(96px + env(safe-area-inset-bottom))",
  zIndex: 30,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  minHeight: 56,
  padding: "0 20px",
  borderRadius: 16,
  border: "1px solid rgba(74,69,79,0.20)",
  background: "rgba(15,19,31,0.80)",
  color: "#D6BAFF",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  boxShadow: "0px 24px 48px rgba(0, 0, 0, 0.4)",
  cursor: "pointer",
};

function sortExams(items: DBExam[]) {
  return [...items].sort(
    (a, b) => new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime(),
  );
}

export default function ExamsClient({ course, exams: initialExams }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [exams, setExams] = useState<DBExam[]>(sortExams(initialExams));
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<DBExam | null>(null);

  const orderedExams = useMemo(() => sortExams(exams), [exams]);

  function handleStartCreate() {
    setEditingExam(null);
    setIsModalOpen(true);
  }

  function handleStartEdit(exam: DBExam) {
    setEditingExam(exam);
    setIsModalOpen(true);
  }

  async function handleDelete(id: string) {
    setBusyId(id);

    try {
      await deleteExam(supabase, id);
      setExams((current) => current.filter((entry) => entry.id !== id));
      setExpandedId((current) => (current === id ? null : current));
      setEditingExam((current) => (current?.id === id ? null : current));
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function handleReadiness(id: string, readiness: number) {
    setBusyId(id);

    try {
      const updated = await updateReadiness(supabase, id, readiness);
      setExams((current) =>
        current.map((entry) => (entry.id === id ? updated : entry)),
      );
    } finally {
      setBusyId(null);
    }
  }

  function handleCreated(created: DBExam) {
    setExams((current) => sortExams([created, ...current]));
    setExpandedId(created.id);
  }

  function handleUpdated(updated: DBExam) {
    setExams((current) =>
      sortExams(current.map((entry) => (entry.id === updated.id ? updated : entry))),
    );
    setExpandedId(updated.id);
  }

  return (
    <div style={pageStyle}>
      <PageHeader
        title="Exams"
        subtitle={course.name}
        backHref={`/courses/${course.id}`}
      />

      <main style={contentStyle}>
        {orderedExams.length === 0 ? (
          <EmptyState
            icon="📝"
            title="No exams yet"
            description="Add your first exam to track deadlines, locations, and readiness in one place."
            action={
              <button
                type="button"
                onClick={handleStartCreate}
                style={{
                  minHeight: 52,
                  padding: "14px 24px",
                  borderRadius: 12,
                  border: "none",
                  background: "linear-gradient(135deg, #D6BAFF, #7B5EA7)",
                  color: "#0F131F",
                  fontFamily: "var(--font-manrope), Manrope, sans-serif",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Add Exam
              </button>
            }
          />
        ) : (
          orderedExams.map((exam) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              isBusy={busyId === exam.id}
              isExpanded={expandedId === exam.id}
              onExpand={(id) =>
                setExpandedId((current) => (current === id ? null : id))
              }
              onReadiness={handleReadiness}
              onEdit={handleStartEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </main>

      <button
        type="button"
        aria-label="Add exam"
        onClick={handleStartCreate}
        style={fabStyle}
      >
        <Plus size={20} strokeWidth={2.2} />
        <span
          style={{
            fontFamily: "var(--font-manrope), Manrope, sans-serif",
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "0.03em",
          }}
        >
          Add
        </span>
      </button>

      <AddExamModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingExam(null);
        }}
        course={course}
        onCreated={handleCreated}
        editingExam={editingExam}
        onUpdated={handleUpdated}
      />
    </div>
  );
}

function ExamCard({
  exam,
  isBusy,
  isExpanded,
  onExpand,
  onReadiness,
  onEdit,
  onDelete,
}: {
  exam: DBExam;
  isBusy: boolean;
  isExpanded: boolean;
  onExpand: (id: string) => void;
  onReadiness: (id: string, readiness: number) => Promise<void>;
  onEdit: (exam: DBExam) => void;
  onDelete: (id: string) => Promise<void>;
}) {
  const formattedDate = formatExamDate(exam.exam_date);

  return (
    <Card
      onClick={() => onExpand(exam.id)}
      style={{
        background: "#1B1F2C",
        border: "1px solid rgba(74,69,79,0.20)",
        borderRadius: 16,
        padding: 16,
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <p
              style={{
                margin: 0,
                color: "#DFE2F3",
                fontFamily: "var(--font-manrope), Manrope, sans-serif",
                fontSize: 16,
                fontWeight: 600,
                lineHeight: 1.5,
                wordBreak: "break-word",
              }}
            >
              {exam.title}
            </p>
            <p
              style={{
                margin: "6px 0 0",
                color: "rgba(223,226,243,0.60)",
                fontFamily: "var(--font-manrope), Manrope, sans-serif",
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              {formattedDate}
            </p>
          </div>

          <div style={{ flexShrink: 0 }}>
            <CountdownBadge targetDate={new Date(exam.exam_date)} />
          </div>
        </div>

        <div
          style={{
            maxHeight: isExpanded ? 420 : 0,
            opacity: isExpanded ? 1 : 0,
            overflow: "hidden",
            transform: isExpanded ? "translateY(0)" : "translateY(-8px)",
            transition:
              "max-height 240ms ease, opacity 200ms ease, transform 200ms ease, margin-top 200ms ease",
            marginTop: isExpanded ? 2 : -10,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {exam.location ? <DetailRow label="Location" value={exam.location} /> : null}
            {exam.topics ? <DetailRow label="Topics" value={exam.topics} multiline /> : null}

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span
                style={{
                  color: "rgba(223,226,243,0.40)",
                  fontFamily: "var(--font-manrope), Manrope, sans-serif",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                Readiness
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                {Array.from({ length: 5 }, (_, index) => {
                  const value = index + 1;
                  const filled = value <= (exam.readiness ?? 0);

                  return (
                    <button
                      key={value}
                      type="button"
                      aria-label={`Set readiness to ${value}`}
                      disabled={isBusy}
                      onClick={(event) => {
                        event.stopPropagation();
                        void onReadiness(exam.id, value);
                      }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 36,
                        height: 36,
                        border: "none",
                        borderRadius: 12,
                        background: "transparent",
                        padding: 0,
                        cursor: isBusy ? "not-allowed" : "pointer",
                        opacity: isBusy ? 0.6 : 1,
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

            <div style={{ display: "flex", gap: 10, paddingTop: 2 }}>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(exam);
                }}
                style={{
                  minHeight: 36,
                  padding: "0 14px",
                  border: "none",
                  borderRadius: 12,
                  background: "rgba(214,186,255,0.16)",
                  color: "#D6BAFF",
                  fontFamily: "var(--font-manrope), Manrope, sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Edit
              </button>
              <button
                type="button"
                disabled={isBusy}
                onClick={(event) => {
                  event.stopPropagation();
                  void onDelete(exam.id);
                }}
                style={{
                  minHeight: 36,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "0 14px",
                  border: "none",
                  borderRadius: 12,
                  background: "rgba(255,107,107,0.14)",
                  color: "#FF6B6B",
                  fontFamily: "var(--font-manrope), Manrope, sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: isBusy ? "not-allowed" : "pointer",
                  opacity: isBusy ? 0.55 : 1,
                }}
              >
                <Trash2 size={14} strokeWidth={1.9} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function DetailRow({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span
        style={{
          color: "rgba(223,226,243,0.40)",
          fontFamily: "var(--font-manrope), Manrope, sans-serif",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <span
        style={{
          color: "rgba(223,226,243,0.70)",
          fontFamily: "var(--font-manrope), Manrope, sans-serif",
          fontSize: 14,
          lineHeight: 1.6,
          whiteSpace: multiline ? "pre-wrap" : "normal",
          wordBreak: "break-word",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function formatExamDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
