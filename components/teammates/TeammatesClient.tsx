"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import AddTeammateModal from "@/components/teammates/AddTeammateModal";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { createClient } from "@/lib/supabase/client";
import {
  deleteTeammate,
  type DBTeammate,
} from "@/lib/supabase/queries/teammates";

type Course = {
  id: string;
  name: string;
  color: string;
};

type Props = {
  course: Course;
  teammates: DBTeammate[];
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

export default function TeammatesClient({
  course,
  teammates: initialTeammates,
  userId,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [teammates, setTeammates] = useState(initialTeammates);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function handleDelete(id: string) {
    setBusyId(id);

    try {
      await deleteTeammate(supabase, id);
      setTeammates((current) => current.filter((entry) => entry.id !== id));
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div style={pageStyle}>
      <PageHeader
        title="Teammates"
        subtitle={course.name}
        backHref={`/courses/${course.id}`}
      />

      <main style={contentStyle}>
        {teammates.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No teammates yet"
            description="Add course teammates so names and emails are always easy to reach."
            action={
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
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
                Add Teammate
              </button>
            }
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {teammates.map((teammate) => (
              <Card key={teammate.id} style={{ padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: `${course.color}22`,
                      color: course.color,
                      fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
                      fontSize: 18,
                      fontWeight: 700,
                      letterSpacing: "-0.02em",
                      flexShrink: 0,
                    }}
                  >
                    {teammate.name.trim().charAt(0).toUpperCase()}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        color: "#DFE2F3",
                        fontFamily: "var(--font-manrope), Manrope, sans-serif",
                        fontSize: 15,
                        fontWeight: 600,
                        lineHeight: 1.4,
                        wordBreak: "break-word",
                      }}
                    >
                      {teammate.name}
                    </p>
                    <p
                      style={{
                        margin: "4px 0 0",
                        color: "rgba(223,226,243,0.60)",
                        fontFamily: "var(--font-manrope), Manrope, sans-serif",
                        fontSize: 14,
                        lineHeight: 1.6,
                        wordBreak: "break-word",
                      }}
                    >
                      {teammate.email || "No email added"}
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-label="Delete teammate"
                    disabled={busyId === teammate.id}
                    onClick={() => void handleDelete(teammate.id)}
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
                      cursor: busyId === teammate.id ? "not-allowed" : "pointer",
                      opacity: busyId === teammate.id ? 0.55 : 1,
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

      <button
        type="button"
        aria-label="Add teammate"
        onClick={() => setIsModalOpen(true)}
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

      <AddTeammateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        course={course}
        userId={userId}
        onCreated={(created) => setTeammates((current) => [created, ...current])}
      />
    </div>
  );
}
