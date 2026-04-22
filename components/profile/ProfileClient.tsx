'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type ProfileClientProps = {
  userId: string
  name: string
  email: string
  telegramChatId: string
}

const colors = {
  surface: '#0F131F',
  card: '#1B1F2C',
  input: '#0A0E1A',
  text: '#DFE2F3',
  muted: 'rgba(223, 226, 243, 0.60)',
  violet: '#7B5EA7',
  teal: '#41E4C0',
  coral: '#FF6B6B',
}

export default function ProfileClient({
  userId,
  name,
  email,
  telegramChatId,
}: ProfileClientProps) {
  const [chatId, setChatId] = useState(telegramChatId)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [isChatIdFocused, setIsChatIdFocused] = useState(false)

  const firstName = name.split(' ')[0] || 'Student'
  const initial = firstName.charAt(0).toUpperCase()

  useEffect(() => {
    console.log('ProfileClient mounted')
  }, [])

  async function handleSave() {
    setStatus('saving')

    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ telegram_chat_id: chatId.trim() || null })
      .eq('id', userId)

    if (error) {
      setStatus('error')
      return
    }

    setStatus('saved')
    window.setTimeout(() => setStatus('idle'), 2000)
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <main
      style={{
        minHeight: '100dvh',
        background: colors.surface,
        color: colors.text,
        padding: '56px 20px 112px',
      }}
    >
      <section
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              margin: 0,
              color: colors.text,
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.12,
            }}
          >
            Hi, {firstName}
          </h1>
          <p
            style={{
              margin: '8px 0 0',
              color: colors.muted,
              fontFamily: 'Manrope, sans-serif',
              fontSize: 14,
              lineHeight: 1.6,
              overflowWrap: 'anywhere',
            }}
          >
            {email}
          </p>
        </div>

        <div
          aria-hidden="true"
          style={{
            alignItems: 'center',
            background: colors.violet,
            borderRadius: '50%',
            color: colors.text,
            display: 'flex',
            flex: '0 0 72px',
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 30,
            fontWeight: 700,
            height: 72,
            justifyContent: 'center',
            width: 72,
          }}
        >
          {initial}
        </div>
      </section>

      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          marginTop: 32,
        }}
      >
        <article
          style={{
            background: colors.card,
            borderRadius: 16,
            padding: 16,
          }}
        >
          <h2
            style={{
              margin: 0,
              color: colors.text,
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 20,
              fontWeight: 600,
              lineHeight: 1.2,
            }}
          >
            Telegram Notifications
          </h2>
          <p
            style={{
              margin: '8px 0 0',
              color: colors.muted,
              fontFamily: 'Manrope, sans-serif',
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            Connect your Telegram to receive homework and exam reminders
          </p>

          <label
            htmlFor="telegram_chat_id"
            style={{
              display: 'block',
              marginTop: 16,
              color: colors.text,
              fontFamily: 'Manrope, sans-serif',
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.03em',
            }}
          >
            Chat ID
          </label>
          <input
            id="telegram_chat_id"
            type="text"
            inputMode="numeric"
            value={chatId}
            onChange={(event) => setChatId(event.target.value)}
            onBlur={() => setIsChatIdFocused(false)}
            onFocus={() => setIsChatIdFocused(true)}
            placeholder="1022909025"
            style={{
              width: '100%',
              minHeight: 52,
              marginTop: 8,
              backgroundColor: colors.input,
              border: `1px solid ${isChatIdFocused ? colors.teal : 'rgba(255,255,255,0.10)'}`,
              borderRadius: 12,
              color: colors.text,
              fontFamily: 'Manrope, sans-serif',
              fontSize: 15,
              outline: 'none',
              padding: '0 14px',
            }}
          />

          <p
            style={{
              margin: '10px 0 0',
              color: colors.muted,
              fontFamily: 'Manrope, sans-serif',
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            Open Telegram → message @userinfobot → copy your ID here
          </p>

          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              gap: 12,
              marginTop: 16,
            }}
          >
            <button
              type="button"
              onClick={handleSave}
              disabled={status === 'saving'}
              style={{
                minHeight: 52,
                background: status === 'saved'
                  ? colors.teal
                  : 'linear-gradient(135deg, #D6BAFF, #7B5EA7)',
                border: 0,
                borderRadius: 12,
                color: colors.surface,
                cursor: status === 'saving' ? 'default' : 'pointer',
                fontFamily: 'Manrope, sans-serif',
                fontSize: 15,
                fontWeight: 700,
                opacity: status === 'saving' ? 0.7 : 1,
                padding: '14px 24px',
                transition: 'background 160ms ease, opacity 160ms ease',
              }}
            >
              {status === 'saved' ? 'Saved ✓' : status === 'saving' ? 'Saving...' : 'Save'}
            </button>

            {status === 'error' && (
              <span
                style={{
                  color: colors.coral,
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Could not save
              </span>
            )}
          </div>
        </article>

        <article
          style={{
            background: colors.card,
            borderRadius: 16,
            padding: 16,
          }}
        >
          <h2
            style={{
              margin: 0,
              color: colors.text,
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 20,
              fontWeight: 600,
              lineHeight: 1.2,
            }}
          >
            Danger Zone
          </h2>
          <button
            type="button"
            onClick={handleSignOut}
            style={{
              width: '100%',
              minHeight: 52,
              marginTop: 16,
              background: 'transparent',
              border: '1px solid rgba(255, 107, 107, 0.40)',
              borderRadius: 12,
              color: colors.coral,
              cursor: 'pointer',
              fontFamily: 'Manrope, sans-serif',
              fontSize: 15,
              fontWeight: 600,
              padding: '13px 24px',
            }}
          >
            Sign Out
          </button>
        </article>
      </section>
    </main>
  )
}
