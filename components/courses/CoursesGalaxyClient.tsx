'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, ChevronRight, BookOpen } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import AddCourseModal from '@/components/courses/AddCourseModal'
import type { Database } from '@/lib/supabase/types'

type Course = Database['public']['Tables']['courses']['Row']

type Props = {
  courses: Course[]
  userId: string
}

export default function CoursesGalaxyClient({ courses, userId }: Props) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)

  function handleSuccess() {
    setModalOpen(false)
    router.refresh()
  }

  return (
    <>
      <div style={{ display: 'flex', minHeight: '100dvh', flexDirection: 'column', background: '#0F131F' }}>
        <PageHeader title="Courses" subtitle={`${courses.length} this semester`} />

        <div style={{ flex: 1, paddingLeft: 20, paddingRight: 20, paddingBottom: 128 }}>
          {courses.length === 0 ? (
            <div style={{ paddingTop: 48 }}>
              <EmptyState
                icon="🪐"
                title="No courses yet"
                description="Add your first course to start building your academic universe."
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 }}>
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => setModalOpen(true)}
        style={{
          position: 'fixed',
          bottom: 88,
          right: 20,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 56,
          width: 56,
          borderRadius: 16,
          background: 'linear-gradient(135deg, #D6BAFF, #7B5EA7)',
          boxShadow: '0px 24px 48px rgba(0,0,0,0.4)',
          border: 'none',
          cursor: 'pointer',
          transition: 'transform 150ms ease-out',
        }}
        aria-label="Add course"
      >
        <Plus size={24} strokeWidth={2} color="#0F131F" />
      </button>

      <AddCourseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        userId={userId}
      />
    </>
  )
}

function CourseCard({ course }: { course: Course }) {
  return (
    <Link href={`/courses/${course.id}`} style={{ textDecoration: 'none' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          borderRadius: 16,
          background: '#1B1F2C',
          border: '1px solid rgba(74,69,79,0.20)',
        }}
      >
        {/* Left color accent */}
        <div
          style={{
            width: 4,
            alignSelf: 'stretch',
            flexShrink: 0,
            background: course.color ?? '#7B5EA7',
            minHeight: 72,
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            gap: 12,
            paddingLeft: 16,
            paddingRight: 16,
            paddingTop: 16,
            paddingBottom: 16,
            minWidth: 0,
          }}
        >
          {/* Icon */}
          <div
            style={{
              display: 'flex',
              height: 40,
              width: 40,
              flexShrink: 0,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12,
              background: `${course.color ?? '#7B5EA7'}22`,
            }}
          >
            <BookOpen
              size={18}
              strokeWidth={1.8}
              style={{ color: course.color ?? '#7B5EA7' }}
            />
          </div>

          {/* Text */}
          <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: 2, minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: 16,
                fontWeight: 600,
                lineHeight: '1.2',
                color: '#DFE2F3',
                fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
                letterSpacing: '-0.01em',
              }}
            >
              {course.name}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {course.code && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: course.color ?? '#7B5EA7',
                    fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                    letterSpacing: '0.04em',
                  }}
                >
                  {course.code}
                </span>
              )}
              {course.code && course.professor && (
                <span style={{ color: 'rgba(223,226,243,0.20)', fontSize: 10 }}>·</span>
              )}
              {course.professor && (
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: 12,
                    color: 'rgba(223,226,243,0.50)',
                    fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                  }}
                >
                  {course.professor}
                </span>
              )}
            </div>
          </div>

          {/* Chevron */}
          <ChevronRight size={18} strokeWidth={1.8} style={{ color: 'rgba(223,226,243,0.25)', flexShrink: 0 }} />
        </div>
      </div>
    </Link>
  )
}
