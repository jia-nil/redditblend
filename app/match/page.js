'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'

function MatchContent() {
  const params = useSearchParams()
  const router = useRouter()
  const username = params.get('username')

  return (
    <div className="min-h-screen bg-purple-600 flex flex-col items-center justify-center p-4 text-white text-center">
      <div className="mb-10">
        <p className="text-6xl mb-4">🎉</p>
        <h1 className="text-3xl font-medium mb-2">It's a match!</h1>
        <p className="text-purple-200 mb-8">You and u/{username} both connected</p>

        {/* The only thing they need */}
        <div className="bg-white/10 rounded-2xl px-8 py-5 inline-block">
          <p className="text-purple-200 text-sm mb-1">their reddit username</p>
          <p className="text-2xl font-medium">u/{username}</p>
        </div>
      </div>

      <p className="text-purple-300 text-sm mb-8">
        Head over to Reddit and slide into their DMs 👋
      </p>

      <button
        onClick={() => router.push('/discover')}
        className="w-full max-w-sm border border-purple-400 text-white rounded-xl py-3 font-medium hover:bg-purple-700 transition"
      >
        Keep discovering
      </button>
    </div>
  )
}

export default function Match() {
  return (
    <Suspense>
      <MatchContent />
    </Suspense>
  )
}
