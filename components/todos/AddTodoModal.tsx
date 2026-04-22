'use client'

import type { CSSProperties, FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'

import Input from '@/components/ui/Input'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Modal from '@/components/ui/Modal'
import { createClient } from '@/lib/supabase/client'
import {
  createTodo,
  updateTodo,
  createCategory,
  type DBTodo,
  type DBTodoCategory,
} from '@/lib/supabase/queries/todos'

type Priority = 'low' | 'medium' | 'high'

const PRIORITIES: Priority[] = ['low', 'medium', 'high']
const PRIORITY_LABELS: Record<Priority, string> = { low: 'Low', medium: 'Medium', high: 'High' }
const PRIORITY_ACTIVE: Record<Priority, { bg: string; color: string; border: string }> = {
  high: { bg: 'rgba(255,107,107,0.20)', color: '#FF6B6B', border: '1px solid rgba(255,107,107,0.60)' },
  medium: { bg: 'rgba(255,185,85,0.20)', color: '#FFB955', border: '1px solid rgba(255,185,85,0.60)' },
  low: { bg: 'rgba(65,228,192,0.16)', color: '#41E4C0', border: '1px solid rgba(65,228,192,0.50)' },
}

const CATEGORY_COLORS = [
  '#7B5EA7', '#41E4C0', '#FFB955', '#FF6B6B', '#5EA8FF', '#FF8CF7', '#A8FF5E',
]

function toDatetimeLocalValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function toIsoString(value: string) {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString()
}

function toLocalInputValue(value: string | null) {
  if (!value) return ''
  return toDatetimeLocalValue(new Date(value))
}

type Props = {
  isOpen: boolean
  onClose: () => void
  userId: string
  categories: DBTodoCategory[]
  editingTodo?: DBTodo | null
  onCreated: (todo: DBTodo) => void
  onUpdated?: (todo: DBTodo) => void
  onCategoryCreated?: (cat: DBTodoCategory) => void
}

const fieldStackStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  paddingBottom: 8,
}

const labelStyle: CSSProperties = {
  margin: 0,
  color: 'rgba(223,226,243,0.60)',
  fontFamily: 'var(--font-manrope), Manrope, sans-serif',
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.03em',
  marginBottom: 6,
}

export default function AddTodoModal({
  isOpen,
  onClose,
  userId,
  categories,
  editingTodo = null,
  onCreated,
  onUpdated,
  onCategoryCreated,
}: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [categoryId, setCategoryId] = useState<string>('')
  const [dueAt, setDueAt] = useState('')
  const [remindAt, setRemindAt] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // New category inline creation
  const [showNewCat, setShowNewCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatColor, setNewCatColor] = useState(CATEGORY_COLORS[0])
  const [creatingCat, setCreatingCat] = useState(false)
  const [catError, setCatError] = useState('')

  useEffect(() => {
    if (!isOpen) return
    setTitle(editingTodo?.title ?? '')
    setDescription(editingTodo?.description ?? '')
    setPriority((editingTodo?.priority as Priority) ?? 'medium')
    setCategoryId(editingTodo?.category_id ?? '')
    setDueAt(toLocalInputValue(editingTodo?.due_at ?? null))
    setRemindAt(toLocalInputValue(editingTodo?.remind_at ?? null))
    setIsSubmitting(false)
    setError('')
    setShowNewCat(false)
    setNewCatName('')
    setNewCatColor(CATEGORY_COLORS[0])
    setCatError('')
  }, [editingTodo, isOpen])

  async function handleCreateCategory() {
    if (!newCatName.trim()) {
      setCatError('Name is required.')
      return
    }
    setCreatingCat(true)
    setCatError('')
    try {
      const cat = await createCategory(supabase, {
        user_id: userId,
        name: newCatName.trim(),
        color: newCatColor,
      })
      onCategoryCreated?.(cat)
      setCategoryId(cat.id)
      setShowNewCat(false)
      setNewCatName('')
    } catch {
      setCatError('Could not create category.')
    } finally {
      setCreatingCat(false)
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!title.trim()) {
      setError('Title is required.')
      return
    }
    setIsSubmitting(true)
    setError('')
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        priority,
        category_id: categoryId || null,
        due_at: toIsoString(dueAt),
        remind_at: toIsoString(remindAt),
      }
      if (editingTodo) {
        const updated = await updateTodo(supabase, editingTodo.id, payload)
        onUpdated?.(updated)
      } else {
        const created = await createTodo(supabase, { user_id: userId, ...payload })
        onCreated(created)
      }
      onClose()
      router.refresh()
    } catch {
      setError(editingTodo ? 'Could not update todo.' : 'Could not create todo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingTodo ? 'Edit Todo' : 'Add Todo'}>
      <form onSubmit={handleSubmit} style={fieldStackStyle}>
        {/* Title + description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input
            label="Title"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Input
            label="Description"
            placeholder="Optional details"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Priority selector */}
        <div>
          <p style={labelStyle}>Priority</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {PRIORITIES.map((p) => {
              const isActive = priority === p
              const active = PRIORITY_ACTIVE[p]
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    borderRadius: 12,
                    border: isActive ? active.border : '1px solid rgba(74,69,79,0.30)',
                    background: isActive ? active.bg : 'transparent',
                    color: isActive ? active.color : 'rgba(223,226,243,0.45)',
                    fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background 150ms ease, color 150ms ease, border-color 150ms ease',
                  }}
                >
                  {PRIORITY_LABELS[p]}
                </button>
              )
            })}
          </div>
        </div>

        {/* Category selector */}
        <div>
          <p style={labelStyle}>Category</p>
          <div
            style={{
              background: '#0A0E1A',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 12,
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {/* None option */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
              }}
            >
              <input
                type="radio"
                name="category"
                value=""
                checked={categoryId === ''}
                onChange={() => setCategoryId('')}
                style={{ accentColor: '#7B5EA7', width: 16, height: 16, cursor: 'pointer' }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                  fontSize: 14,
                  color: 'rgba(223,226,243,0.55)',
                }}
              >
                None
              </span>
            </label>

            {/* Existing categories */}
            {categories.map((cat) => (
              <label
                key={cat.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="category"
                  value={cat.id}
                  checked={categoryId === cat.id}
                  onChange={() => setCategoryId(cat.id)}
                  style={{ accentColor: cat.color, width: 16, height: 16, cursor: 'pointer' }}
                />
                <span
                  style={{
                    display: 'inline-block',
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: cat.color,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                    fontSize: 14,
                    color: '#DFE2F3',
                  }}
                >
                  {cat.name}
                </span>
              </label>
            ))}

            {/* Create new category toggle */}
            {!showNewCat ? (
              <button
                type="button"
                onClick={() => setShowNewCat(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'rgba(214,186,255,0.70)',
                  fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Plus size={14} strokeWidth={2.4} />
                New category
              </button>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  padding: '12px',
                  background: '#171B28',
                  borderRadius: 10,
                }}
              >
                <Input
                  placeholder="Category name"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                />
                {/* Color swatches */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {CATEGORY_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewCatColor(color)}
                      aria-label={`Color ${color}`}
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background: color,
                        border: newCatColor === color ? '3px solid #DFE2F3' : '2px solid transparent',
                        cursor: 'pointer',
                        flexShrink: 0,
                        transition: 'border-color 120ms ease',
                      }}
                    />
                  ))}
                </div>
                {catError && (
                  <p
                    style={{
                      margin: 0,
                      color: '#FF6B6B',
                      fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                      fontSize: 13,
                    }}
                  >
                    {catError}
                  </p>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewCat(false)
                      setNewCatName('')
                      setCatError('')
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      borderRadius: 10,
                      border: '1px solid rgba(74,69,79,0.40)',
                      background: 'transparent',
                      color: 'rgba(223,226,243,0.60)',
                      fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={creatingCat}
                    onClick={() => void handleCreateCategory()}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      borderRadius: 10,
                      border: 'none',
                      background: 'rgba(123,94,167,0.40)',
                      color: '#D6BAFF',
                      fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: creatingCat ? 'not-allowed' : 'pointer',
                      opacity: creatingCat ? 0.7 : 1,
                    }}
                  >
                    {creatingCat ? 'Creating…' : 'Create'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Due date */}
        <Input
          label="Due date & time"
          type="datetime-local"
          value={dueAt}
          onChange={(e) => setDueAt(e.target.value)}
        />

        {/* Remind me */}
        <Input
          label="Remind me"
          type="datetime-local"
          value={remindAt}
          onChange={(e) => setRemindAt(e.target.value)}
        />

        {error && (
          <p
            style={{
              margin: 0,
              color: '#FF6B6B',
              fontFamily: 'var(--font-manrope), Manrope, sans-serif',
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            {error}
          </p>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              flex: 1,
              minHeight: 52,
              borderRadius: 12,
              border: '1px solid rgba(74,69,79,0.60)',
              background: 'transparent',
              color: '#DFE2F3',
              fontFamily: 'var(--font-manrope), Manrope, sans-serif',
              fontSize: 15,
              fontWeight: 500,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
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
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              border: 'none',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #D6BAFF, #7B5EA7)',
              color: '#0F131F',
              fontFamily: 'var(--font-manrope), Manrope, sans-serif',
              fontSize: 15,
              fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.75 : 1,
            }}
          >
            {isSubmitting ? <LoadingSpinner size="sm" className="" /> : null}
            <span>{editingTodo ? 'Save' : 'Create'}</span>
          </button>
        </div>
      </form>
    </Modal>
  )
}
