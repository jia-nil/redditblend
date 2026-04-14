'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'

function MatchContent() {
  const params = useSearchParams()
  const router = useRouter()
  const username = params.get('username')
  const matchId = params.get('matchId')

  return (
    <div className="min-h-screen bg-purple-600 flex flex-col items-center justify-center p-4 text-white text-center">
      <div className="mb-8">
        <p className="text-6xl mb-4">🎉</p>
        <h1 className="text-3xl font-medium mb-2">It's a match!</h1>
        <p className="text-purple-200">You and u/{username} both connected</p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={() => router.push(`/messages/${matchId}`)}
          className="w-full bg-white text-purple-600 rounded-xl py-3 font-medium hover:bg-purple-50 transition"
        >
          Send a message
        </button>
        <button
          onClick={() => router.push('/discover')}
          className="w-full border border-purple-400 text-white rounded-xl py-3 font-medium hover:bg-purple-700 transition"
        >
          Keep discovering
        </button>
      </div>
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
