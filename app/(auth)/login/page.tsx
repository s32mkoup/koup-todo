'use client'

import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const supabase = createClient()

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `https://koup-todo-g5c6.vercel.app/api/auth/callback`,
      },
    })
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: '#0F131F' }}>
      {/* Logo / wordmark */}
      <div className="mb-12 text-center">
        <h1
          className="text-5xl font-bold tracking-tight"
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            letterSpacing: '-0.02em',
            color: '#DFE2F3',
          }}
        >
          KOUPA
        </h1>
        <p
          className="mt-3 text-sm"
          style={{
            fontFamily: 'Manrope, sans-serif',
            color: 'rgba(223,226,243,0.60)',
            letterSpacing: '0.05em',
          }}
        >
          YOUR ACADEMIC UNIVERSE
        </p>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-sm p-8 flex flex-col gap-6"
        style={{
          background: '#1B1F2C',
          borderRadius: '24px',
        }}
      >
        <div className="text-center">
          <p
            className="text-base"
            style={{
              fontFamily: 'Manrope, sans-serif',
              color: 'rgba(223,226,243,0.60)',
            }}
          >
            Sign in to continue
          </p>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 py-4 font-semibold transition-opacity active:opacity-70"
          style={{
            background: 'linear-gradient(135deg, #D6BAFF, #7B5EA7)',
            borderRadius: '12px',
            color: '#0F131F',
            fontFamily: 'Manrope, sans-serif',
            fontSize: '15px',
          }}
        >
          {/* Google G icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>
      </div>

      {/* Ambient glow */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(123,94,167,0.15) 0%, transparent 70%)',
        }}
      />
    </main>
  )
}
