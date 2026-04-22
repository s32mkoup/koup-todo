'use client'

import type { CSSProperties } from 'react'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Plus, Trash2 } from 'lucide-react'

import PageHeader from '@/components/ui/PageHeader'
import CountdownBadge from '@/components/ui/CountdownBadge'
import AddTodoModal from '@/components/todos/AddTodoModal'
import { createClient } from '@/lib/supabase/client'
import {
  deleteTodo,
  toggleTodoDone,
  type DBTodo,
  type DBTodoCategory,
} from '@/lib/supabase/queries/todos'

type Props = {
  todos: DBTodo[]
  categories: DBTodoCategory[]
  userId: string
}

type FilterTab = 'all' | 'today' | 'overdue'

const PRIORITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  high: { bg: 'rgba(255,107,107,0.15)', text: '#FF6B6B', border: '1px solid rgba(255,107,107,0.40)' },
  medium: { bg: 'rgba(255,185,85,0.15)', text: '#FFB955', border: '1px solid rgba(255,185,85,0.40)' },
  low: { bg: 'rgba(65,228,192,0.12)', text: '#41E4C0', border: '1px solid rgba(65,228,192,0.35)' },
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function isToday(iso: string) {
  const today = startOfDay(new Date())
  const target = startOfDay(new Date(iso))
  return today.getTime() === target.getTime()
}

function isOverdue(iso: string) {
  return startOfDay(new Date(iso)) < startOfDay(new Date())
}

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export default function TodoClient({ todos: initialTodos, categories: initialCategories, userId }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [todos, setTodos] = useState<DBTodo[]>(initialTodos)
  const [categories, setCategories] = useState<DBTodoCategory[]>(initialCategories)
  const [filterTab, setFilterTab] = useState<FilterTab>('all')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<DBTodo | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let list = todos
    if (filterTab === 'today') list = list.filter((t) => t.due_at && isToday(t.due_at))
    if (filterTab === 'overdue') list = list.filter((t) => t.due_at && isOverdue(t.due_at) && !t.is_done)
    if (categoryFilter) list = list.filter((t) => t.category_id === categoryFilter)
    return list
  }, [todos, filterTab, categoryFilter])

  const pending = useMemo(() => filtered.filter((t) => !t.is_done), [filtered])
  const done = useMemo(() => filtered.filter((t) => t.is_done), [filtered])

  async function handleToggle(todo: DBTodo) {
    setBusyId(todo.id)
    try {
      const updated = await toggleTodoDone(supabase, todo.id, !todo.is_done)
      setTodos((cur) => cur.map((t) => (t.id === todo.id ? updated : t)))
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(id: string) {
    setBusyId(id)
    try {
      await deleteTodo(supabase, id)
      setTodos((cur) => cur.filter((t) => t.id !== id))
      setExpandedId((cur) => (cur === id ? null : cur))
      router.refresh()
    } finally {
      setBusyId(null)
    }
  }

  function handleCreated(todo: DBTodo) {
    setTodos((cur) => [todo, ...cur])
    setExpandedId(todo.id)
  }

  function handleUpdated(todo: DBTodo) {
    setTodos((cur) => cur.map((t) => (t.id === todo.id ? todo : t)))
    setExpandedId(todo.id)
  }

  function handleCategoryCreated(cat: DBTodoCategory) {
    setCategories((cur) => [...cur, cat].sort((a, b) => a.name.localeCompare(b.name)))
  }

  function openCreate() {
    setEditingTodo(null)
    setModalOpen(true)
  }

  function openEdit(todo: DBTodo) {
    setEditingTodo(todo)
    setModalOpen(true)
  }

  const catById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])

  const tabStyle = (active: boolean): CSSProperties => ({
    padding: '7px 16px',
    borderRadius: 999,
    border: active ? '1px solid rgba(214,186,255,0.50)' : '1px solid rgba(74,69,79,0.30)',
    background: active ? 'rgba(123,94,167,0.22)' : 'transparent',
    color: active ? '#D6BAFF' : 'rgba(223,226,243,0.50)',
    fontFamily: 'var(--font-manrope), Manrope, sans-serif',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'background 150ms ease, color 150ms ease, border-color 150ms ease',
  })

  const catPillStyle = (active: boolean, color: string): CSSProperties => ({
    padding: '6px 14px',
    borderRadius: 999,
    border: active ? `1px solid ${color}` : '1px solid rgba(74,69,79,0.30)',
    background: active ? `${color}22` : 'transparent',
    color: active ? color : 'rgba(223,226,243,0.50)',
    fontFamily: 'var(--font-manrope), Manrope, sans-serif',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'background 150ms ease, color 150ms ease, border-color 150ms ease',
  })

  return (
    <div style={{ minHeight: '100dvh', background: '#0F131F', color: '#DFE2F3' }}>
      <PageHeader title="Personal Todo" />

      {/* Filter tabs */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          padding: '0 20px 12px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {(['all', 'today', 'overdue'] as FilterTab[]).map((tab) => (
          <button key={tab} type="button" onClick={() => setFilterTab(tab)} style={tabStyle(filterTab === tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Category pills */}
      {categories.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: 8,
            padding: '0 20px 16px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          <button
            type="button"
            onClick={() => setCategoryFilter(null)}
            style={catPillStyle(categoryFilter === null, '#7B5EA7')}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter((cur) => (cur === cat.id ? null : cat.id))}
              style={catPillStyle(categoryFilter === cat.id, cat.color)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, padding: '0 20px 128px' }}>
        {todos.length === 0 ? (
          <EmptyState onAdd={openCreate} />
        ) : filtered.length === 0 ? (
          <p
            style={{
              margin: 0,
              textAlign: 'center',
              paddingTop: 40,
              fontSize: 14,
              color: 'rgba(223,226,243,0.35)',
              fontFamily: 'var(--font-manrope), Manrope, sans-serif',
            }}
          >
            No todos match this filter.
          </p>
        ) : (
          <>
            <TodoSection
              title="Pending"
              items={pending}
              catById={catById}
              busyId={busyId}
              expandedId={expandedId}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onExpand={(id) => setExpandedId((cur) => (cur === id ? null : id))}
              onEdit={openEdit}
            />
            <TodoSection
              title="Done"
              items={done}
              catById={catById}
              busyId={busyId}
              expandedId={expandedId}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onExpand={(id) => setExpandedId((cur) => (cur === id ? null : id))}
              onEdit={openEdit}
            />
          </>
        )}
      </div>

      {/* FAB */}
      <button
        type="button"
        aria-label="Add todo"
        onClick={openCreate}
        style={{
          position: 'fixed',
          right: 20,
          bottom: 'calc(96px + env(safe-area-inset-bottom))',
          zIndex: 30,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          minHeight: 56,
          padding: '0 20px',
          borderRadius: 16,
          border: '1px solid rgba(74,69,79,0.20)',
          background: 'rgba(15,19,31,0.80)',
          color: '#D6BAFF',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0px 24px 48px rgba(0,0,0,0.40)',
          cursor: 'pointer',
        }}
      >
        <Plus size={20} strokeWidth={2.2} />
        <span
          style={{
            fontFamily: 'var(--font-manrope), Manrope, sans-serif',
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: '0.03em',
          }}
        >
          Add
        </span>
      </button>

      <AddTodoModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingTodo(null)
        }}
        userId={userId}
        categories={categories}
        editingTodo={editingTodo}
        onCreated={handleCreated}
        onUpdated={handleUpdated}
        onCategoryCreated={handleCategoryCreated}
      />
    </div>
  )
}

// ─── Section ─────────────────────────────────────────────────────────────────

function TodoSection({
  title,
  items,
  catById,
  busyId,
  expandedId,
  onToggle,
  onDelete,
  onExpand,
  onEdit,
}: {
  title: string
  items: DBTodo[]
  catById: Map<string, DBTodoCategory>
  busyId: string | null
  expandedId: string | null
  onToggle: (todo: DBTodo) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onExpand: (id: string) => void
  onEdit: (todo: DBTodo) => void
}) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h2
        style={{
          margin: 0,
          color: 'rgba(223,226,243,0.60)',
          fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
          fontSize: 20,
          fontWeight: 600,
          lineHeight: 1.1,
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h2>
      {items.length === 0 ? (
        <p
          style={{
            margin: 0,
            color: 'rgba(223,226,243,0.35)',
            fontFamily: 'var(--font-manrope), Manrope, sans-serif',
            fontSize: 14,
          }}
        >
          Nothing here yet.
        </p>
      ) : (
        items.map((todo) => (
          <TodoCard
            key={todo.id}
            todo={todo}
            category={todo.category_id ? catById.get(todo.category_id) ?? null : null}
            isBusy={busyId === todo.id}
            isExpanded={expandedId === todo.id}
            onToggle={onToggle}
            onDelete={onDelete}
            onExpand={onExpand}
            onEdit={onEdit}
          />
        ))
      )}
    </section>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function TodoCard({
  todo,
  category,
  isBusy,
  isExpanded,
  onToggle,
  onDelete,
  onExpand,
  onEdit,
}: {
  todo: DBTodo
  category: DBTodoCategory | null
  isBusy: boolean
  isExpanded: boolean
  onToggle: (todo: DBTodo) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onExpand: (id: string) => void
  onEdit: (todo: DBTodo) => void
}) {
  const priority = (todo.priority ?? 'medium').toLowerCase()
  const pColor = PRIORITY_COLORS[priority] ?? PRIORITY_COLORS.medium

  return (
    <div
      onClick={() => onExpand(todo.id)}
      style={{
        background: '#1B1F2C',
        border: '1px solid rgba(74,69,79,0.20)',
        borderRadius: 16,
        padding: 16,
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Checkbox */}
        <button
          type="button"
          aria-label={todo.is_done ? 'Mark as pending' : 'Mark as done'}
          disabled={isBusy}
          onClick={(e) => {
            e.stopPropagation()
            void onToggle(todo)
          }}
          style={{
            marginTop: 2,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            flexShrink: 0,
            borderRadius: '50%',
            border: todo.is_done ? 'none' : '2px solid rgba(223,226,243,0.40)',
            background: todo.is_done ? '#41E4C0' : 'transparent',
            color: '#0F131F',
            cursor: isBusy ? 'not-allowed' : 'pointer',
            opacity: isBusy ? 0.6 : 1,
          }}
        >
          {todo.is_done ? <Check size={14} strokeWidth={2.6} /> : null}
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Top row: title + badges + delete */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <p
              style={{
                margin: 0,
                flex: 1,
                minWidth: 0,
                color: '#DFE2F3',
                fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                fontSize: 15,
                fontWeight: 600,
                lineHeight: 1.5,
                textDecoration: todo.is_done ? 'line-through' : 'none',
                opacity: todo.is_done ? 0.55 : 1,
                wordBreak: 'break-word',
              }}
            >
              {todo.title}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              {todo.due_at && (
                <CountdownBadge targetDate={new Date(todo.due_at)} />
              )}
              {!isExpanded && (
                <button
                  type="button"
                  aria-label="Delete todo"
                  disabled={isBusy}
                  onClick={(e) => {
                    e.stopPropagation()
                    void onDelete(todo.id)
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    border: 'none',
                    borderRadius: 10,
                    background: 'transparent',
                    color: '#FF6B6B',
                    cursor: isBusy ? 'not-allowed' : 'pointer',
                    opacity: isBusy ? 0.55 : 1,
                  }}
                >
                  <Trash2 size={16} strokeWidth={1.8} />
                </button>
              )}
            </div>
          </div>

          {/* Inline meta: priority + category */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: 999,
                background: pColor.bg,
                color: pColor.text,
                border: pColor.border,
                fontSize: 11,
                fontWeight: 600,
                fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                letterSpacing: '0.02em',
              }}
            >
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </span>
            {category && (
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: `${category.color}20`,
                  color: category.color,
                  border: `1px solid ${category.color}50`,
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                  letterSpacing: '0.02em',
                }}
              >
                {category.name}
              </span>
            )}
          </div>

          {/* Expanded content */}
          <div
            style={{
              maxHeight: isExpanded ? 1000 : 0,
              opacity: isExpanded ? 1 : 0,
              overflow: 'hidden',
              transform: isExpanded ? 'translateY(0)' : 'translateY(-8px)',
              transition: 'max-height 240ms ease, opacity 200ms ease, transform 200ms ease, margin-top 200ms ease',
              marginTop: isExpanded ? 14 : 0,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {todo.description?.trim() && (
                <p
                  style={{
                    margin: 0,
                    color: 'rgba(223,226,243,0.60)',
                    fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                    fontSize: 14,
                    lineHeight: 1.6,
                    textDecoration: todo.is_done ? 'line-through' : 'none',
                    opacity: todo.is_done ? 0.55 : 1,
                    wordBreak: 'break-word',
                  }}
                >
                  {todo.description}
                </p>
              )}
              {todo.due_at && (
                <DetailRow label="Due" value={formatDateTime(todo.due_at)} isDone={todo.is_done} />
              )}
              {todo.remind_at && (
                <DetailRow label="Remind me" value={formatDateTime(todo.remind_at)} isDone={todo.is_done} />
              )}
              <div style={{ display: 'flex', gap: 10, paddingTop: 2 }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(todo)
                  }}
                  style={{
                    minHeight: 36,
                    padding: '0 14px',
                    border: 'none',
                    borderRadius: 12,
                    background: 'rgba(214,186,255,0.16)',
                    color: '#D6BAFF',
                    fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={(e) => {
                    e.stopPropagation()
                    void onDelete(todo.id)
                  }}
                  style={{
                    minHeight: 36,
                    padding: '0 14px',
                    border: 'none',
                    borderRadius: 12,
                    background: 'rgba(255,107,107,0.14)',
                    color: '#FF6B6B',
                    fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: isBusy ? 'not-allowed' : 'pointer',
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
    </div>
  )
}

// ─── Detail row ───────────────────────────────────────────────────────────────

function DetailRow({ label, value, isDone }: { label: string; value: string; isDone: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span
        style={{
          color: 'rgba(223,226,243,0.40)',
          fontFamily: 'var(--font-manrope), Manrope, sans-serif',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <span
        style={{
          color: 'rgba(223,226,243,0.70)',
          fontFamily: 'var(--font-manrope), Manrope, sans-serif',
          fontSize: 14,
          lineHeight: 1.5,
          textDecoration: isDone ? 'line-through' : 'none',
          opacity: isDone ? 0.55 : 1,
        }}
      >
        {value}
      </span>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        paddingTop: 60,
        paddingBottom: 40,
        textAlign: 'center',
      }}
    >
      <span style={{ fontSize: 48, lineHeight: 1 }}>✅</span>
      <div>
        <p
          style={{
            margin: '0 0 6px',
            color: '#DFE2F3',
            fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: '-0.01em',
          }}
        >
          No todos yet
        </p>
        <p
          style={{
            margin: 0,
            color: 'rgba(223,226,243,0.50)',
            fontFamily: 'var(--font-manrope), Manrope, sans-serif',
            fontSize: 14,
            lineHeight: 1.6,
          }}
        >
          Add your first todo to stay on top of everything.
        </p>
      </div>
      <button
        type="button"
        onClick={onAdd}
        style={{
          minHeight: 52,
          padding: '14px 24px',
          borderRadius: 12,
          border: 'none',
          background: 'linear-gradient(135deg, #D6BAFF, #7B5EA7)',
          color: '#0F131F',
          fontFamily: 'var(--font-manrope), Manrope, sans-serif',
          fontSize: 15,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Add Todo
      </button>
    </div>
  )
}
