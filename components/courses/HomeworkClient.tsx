"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, Trash2 } from "lucide-react";

import AddHomeworkModal from "@/components/homework/AddHomeworkModal";
import Card from "@/components/ui/Card";
import CountdownBadge from "@/components/ui/CountdownBadge";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { createClient } from "@/lib/supabase/client";
import {
  deleteHomework,
  toggleHomeworkDone,
  type DBHomework,
} from "@/lib/supabase/queries/homework";

type Course = {
  id: string;
  name: string;
  color: string;
};

type Props = {
  course: Course;
  homework: DBHomework[];
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
  gap: 32,
  padding: "8px 20px 128px",
};

const sectionStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const sectionLabelStyle: CSSProperties = {
  margin: 0,
  color: "rgba(223,226,243,0.60)",
  fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
  fontSize: 20,
  fontWeight: 600,
  lineHeight: 1.1,
  letterSpacing: "-0.01em",
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

export default function HomeworkClient({
  course,
  homework: initialHomework,
  userId,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [homework, setHomework] = useState<DBHomework[]>(initialHomework);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingHomework, setEditingHomework] = useState<DBHomework | null>(null);

  const pendingHomework = useMemo(
    () => homework.filter((item) => !item.is_done),
    [homework],
  );
  const doneHomework = useMemo(
    () => homework.filter((item) => item.is_done),
    [homework],
  );

  async function handleToggle(item: DBHomework) {
    setBusyId(item.id);

    try {
      const updated = await toggleHomeworkDone(supabase, item.id, !item.is_done);
      setHomework((current) =>
        current.map((entry) => (entry.id === item.id ? updated : entry)),
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    setBusyId(id);

    try {
      await deleteHomework(supabase, id);
      setHomework((current) => current.filter((entry) => entry.id !== id));
      setExpandedId((current) => (current === id ? null : current));
      setEditingHomework((current) => (current?.id === id ? null : current));
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  function handleCreated(created: DBHomework) {
    setHomework((current) => [created, ...current]);
    setExpandedId(created.id);
  }

  function handleUpdated(updated: DBHomework) {
    setHomework((current) =>
      current.map((entry) => (entry.id === updated.id ? updated : entry)),
    );
    setExpandedId(updated.id);
  }

  function handleToggleExpanded(id: string) {
    setExpandedId((current) => (current === id ? null : id));
  }

  function handleStartCreate() {
    setEditingHomework(null);
    setIsModalOpen(true);
  }

  function handleStartEdit(item: DBHomework) {
    setEditingHomework(item);
    setIsModalOpen(true);
  }

  return (
    <div style={pageStyle}>
      <PageHeader
        title="Homework"
        subtitle={course.name}
        backHref={`/courses/${course.id}`}
      />

      <main style={contentStyle}>
        {homework.length === 0 ? (
          <EmptyState
            icon="📚"
            title="No homework yet"
            description="Add your first assignment to keep deadlines, reminders, and progress in one calm place."
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
                Add Homework
              </button>
            }
          />
        ) : (
          <>
            <HomeworkSection
              title="Pending"
              items={pendingHomework}
              busyId={busyId}
              expandedId={expandedId}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onExpand={handleToggleExpanded}
              onEdit={handleStartEdit}
            />
            <HomeworkSection
              title="Done"
              items={doneHomework}
              busyId={busyId}
              expandedId={expandedId}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onExpand={handleToggleExpanded}
              onEdit={handleStartEdit}
            />
          </>
        )}
      </main>

      <button
        type="button"
        aria-label="Add homework"
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

      <AddHomeworkModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingHomework(null);
        }}
        course={course}
        userId={userId}
        onCreated={handleCreated}
        editingHomework={editingHomework}
        onUpdated={handleUpdated}
      />
    </div>
  );
}

function HomeworkSection({
  title,
  items,
  busyId,
  expandedId,
  onToggle,
  onDelete,
  onExpand,
  onEdit,
}: {
  title: string;
  items: DBHomework[];
  busyId: string | null;
  expandedId: string | null;
  onToggle: (item: DBHomework) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onExpand: (id: string) => void;
  onEdit: (item: DBHomework) => void;
}) {
  return (
    <section style={sectionStyle}>
      <h2 style={sectionLabelStyle}>{title}</h2>
      {items.length === 0 ? (
        <p
          style={{
            margin: 0,
            color: "rgba(223,226,243,0.40)",
            fontFamily: "var(--font-manrope), Manrope, sans-serif",
            fontSize: 14,
            lineHeight: 1.6,
          }}
        >
          Nothing here yet.
        </p>
      ) : (
        items.map((item) => (
          <HomeworkCard
            key={item.id}
            item={item}
            isBusy={busyId === item.id}
            isExpanded={expandedId === item.id}
            onToggle={onToggle}
            onDelete={onDelete}
            onExpand={onExpand}
            onEdit={onEdit}
          />
        ))
      )}
    </section>
  );
}

function HomeworkCard({
  item,
  isBusy,
  isExpanded,
  onToggle,
  onDelete,
  onExpand,
  onEdit,
}: {
  item: DBHomework;
  isBusy: boolean;
  isExpanded: boolean;
  onToggle: (item: DBHomework) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onExpand: (id: string) => void;
  onEdit: (item: DBHomework) => void;
}) {
  const hasDescription = Boolean(item.description?.trim());

  return (
    <Card
      onClick={() => onExpand(item.id)}
      style={{
        background: "#1B1F2C",
        border: "1px solid rgba(74, 69, 79, 0.20)",
        borderRadius: 16,
        padding: 16,
        cursor: "pointer",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <button
          type="button"
          aria-label={item.is_done ? "Mark homework as pending" : "Mark homework as done"}
          disabled={isBusy}
          onClick={(event) => {
            event.stopPropagation();
            void onToggle(item);
          }}
          style={{
            marginTop: 2,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            flexShrink: 0,
            borderRadius: "50%",
            border: item.is_done
              ? "none"
              : "2px solid rgba(223,226,243,0.40)",
            background: item.is_done ? "#41E4C0" : "transparent",
            color: "#0F131F",
            cursor: isBusy ? "not-allowed" : "pointer",
            opacity: isBusy ? 0.6 : 1,
          }}
        >
          {item.is_done ? <Check size={14} strokeWidth={2.6} /> : null}
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
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
                  fontSize: 15,
                  fontWeight: 600,
                  lineHeight: 1.5,
                  textDecoration: item.is_done ? "line-through" : "none",
                  opacity: item.is_done ? 0.55 : 1,
                  wordBreak: "break-word",
                }}
              >
                {item.title}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexShrink: 0,
              }}
            >
              {item.has_deadline && item.deadline ? (
                <CountdownBadge targetDate={new Date(item.deadline)} />
              ) : null}
              {!isExpanded ? (
                <button
                  type="button"
                  aria-label="Delete homework"
                  disabled={isBusy}
                  onClick={(event) => {
                    event.stopPropagation();
                    void onDelete(item.id);
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
                    color: "#FF6B6B",
                    cursor: isBusy ? "not-allowed" : "pointer",
                    opacity: isBusy ? 0.55 : 1,
                  }}
                >
                  <Trash2 size={18} strokeWidth={1.8} />
                </button>
              ) : null}
            </div>
          </div>

          <div
            style={{
              maxHeight: isExpanded ? 1000 : 0,
              opacity: isExpanded ? 1 : 0,
              overflow: "hidden",
              transform: isExpanded ? "translateY(0)" : "translateY(-8px)",
              transition:
                "max-height 240ms ease, opacity 200ms ease, transform 200ms ease, margin-top 200ms ease",
              marginTop: isExpanded ? 14 : 0,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {hasDescription ? (
                <p
                  style={{
                    margin: 0,
                    color: "rgba(223,226,243,0.60)",
                    fontFamily: "var(--font-manrope), Manrope, sans-serif",
                    fontSize: 14,
                    fontWeight: 400,
                    lineHeight: 1.6,
                    textDecoration: item.is_done ? "line-through" : "none",
                    opacity: item.is_done ? 0.55 : 1,
                    wordBreak: "break-word",
                  }}
                >
                  {item.description}
                </p>
              ) : null}

              {item.has_deadline && item.deadline ? (
                <DetailRow
                  label="Deadline"
                  value={formatDateTime(item.deadline)}
                  isDone={item.is_done}
                />
              ) : null}

              {item.remind_at ? (
                <DetailRow
                  label="Remind me"
                  value={formatDateTime(item.remind_at)}
                  isDone={item.is_done}
                />
              ) : null}

              <div style={{ display: "flex", gap: 10, paddingTop: 2 }}>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onEdit(item);
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
                    void onDelete(item.id);
                  }}
                  style={{
                    minHeight: 36,
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
                  Delete
                </button>
              </div>
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
  isDone,
}: {
  label: string;
  value: string;
  isDone: boolean;
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
          lineHeight: 1.5,
          textDecoration: isDone ? "line-through" : "none",
          opacity: isDone ? 0.55 : 1,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
