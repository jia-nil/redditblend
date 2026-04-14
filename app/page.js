'use client'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
      
      <div className="mb-10">
        <p className="text-5xl mb-4">🔀</p>
        <h1 className="text-4xl font-medium text-gray-900 mb-3">Reddit Blend</h1>
        <p className="text-gray-500 text-lg max-w-sm">
          Find people who actually get your taste. Matched by what you post, not what you say about yourself.
        </p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={() => router.push('/onboarding')}
          className="w-full bg-purple-600 text-white rounded-xl py-3 font-medium hover:bg-purple-700 transition"
        >
          Find my people
        </button>
        <button
          onClick={() => router.push('/discover')}
          className="w-full border border-gray-200 text-gray-600 rounded-xl py-3 font-medium hover:bg-gray-100 transition"
        >
          Already signed up? Discover
        </button>
      </div>

      <p className="text-gray-400 text-xs mt-10 max-w-xs">
        We only read your public Reddit history. Nothing is stored except your top subreddits and vibe tags.
      </p>

    </div>
  )
}
