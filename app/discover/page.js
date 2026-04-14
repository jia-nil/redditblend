'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Discover() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState(null)
  const [cards, setCards] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [swiping, setSwiping] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem('currentUser')
    if (!stored) { router.push('/onboarding'); return }
    const user = JSON.parse(stored)
    setCurrentUser(user)
    fetchCards(user)
  }, [])

  const fetchCards = async (user) => {
    setLoading(true)

    // Get users already swiped on
    const { data: swipedData } = await supabase
      .from('swipes')
      .select('swiped_id')
      .eq('swiper_id', user.id)

    const swipedIds = swipedData?.map(s => s.swiped_id) || []
    const excludeIds = [...swipedIds, user.id]

    // Build query
    let query = supabase
      .from('users')
      .select('*')
      .not('id', 'in', `(${excludeIds.join(',')})`)
      .limit(20)

    // Apply gender preference
    if (user.gender_preference !== 'any') {
      query = query.eq('gender', user.gender_preference)
    }

    // Apply location preference
    if (user.location_preference === 'city') {
      query = query.eq('city', user.city)
    } else if (user.location_preference === 'country') {
      query = query.ilike('city', `%${user.city?.split(',').pop()?.trim()}%`)
    }

    // Apply age preference
    if (user.age && user.age_preference) {
      query = query
        .gte('age', user.age - user.age_preference)
        .lte('age', user.age + user.age_preference)
    }

    const { data, error } = await query

    if (error) { console.error(error); return }
    setCards(data || [])
    setLoading(false)
  }

  const handleSwipe = async (direction) => {
    if (!cards[currentIndex]) return
    setSwiping(direction)

    const swiped = cards[currentIndex]

    // Record swipe
    await supabase.from('swipes').insert({
      swiper_id: currentUser.id,
      swiped_id: swiped.id,
      direction,
    })

    // Check for match if swiped right
    if (direction === 'right') {
      const { data: theirSwipe } = await supabase
        .from('swipes')
        .select('*')
        .eq('swiper_id', swiped.id)
        .eq('swiped_id', currentUser.id)
        .eq('direction', 'right')
        .single()

      if (theirSwipe) {
        // It's a match — create match record
        const { data: match } = await supabase
          .from('matches')
          .insert({
            user1_id: currentUser.id,
            user2_id: swiped.id,
          })
          .select()
          .single()

        setTimeout(() => {
          router.push(`/match?matchId=${match.id}&username=${swiped.username}`)
        }, 400)
        return
      }
    }

    setTimeout(() => {
      setSwiping(null)
      setCurrentIndex(prev => prev + 1)
    }, 300)
  }

  const getSharedSubs = (card) => {
    if (!currentUser?.top_subreddits || !card?.top_subreddits) return []
    return currentUser.top_subreddits.filter(sub =>
      card.top_subreddits.includes(sub)
    )
  }

  const getCompatibilityScore = (card) => {
    const shared = getSharedSubs(card)
    const subScore = (shared.length / 5) * 70
    const tagScore = currentUser?.vibe_tags?.filter(t =>
      card?.vibe_tags?.includes(t)
    ).length * 10 || 0
    return Math.min(Math.round(subScore + tagScore), 99)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"/>
        <p className="text-gray-500 text-sm">Finding your people...</p>
      </div>
    </div>
  )

  const card = cards[currentIndex]

  if (!card) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-2xl mb-2">🎉</p>
        <p className="text-gray-900 font-medium mb-1">You've seen everyone</p>
        <p className="text-gray-500 text-sm mb-6">Check back later for new people</p>
        <button
          onClick={() => router.push('/matches')}
          className="bg-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-purple-700 transition"
        >
          See my matches
        </button>
      </div>
    </div>
  )

  const sharedSubs = getSharedSubs(card)
  const score = getCompatibilityScore(card)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">

      {/* Header */}
      <div className="w-full max-w-sm flex justify-between items-center mb-6">
        <h1 className="text-lg font-medium text-gray-900">discover</h1>
        <button
          onClick={() => router.push('/matches')}
          className="text-sm text-purple-600 font-medium"
        >
          matches
        </button>
      </div>

      {/* Card */}
      <div className={`w-full max-w-sm bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 ${
        swiping === 'right' ? 'translate-x-20 rotate-6 opacity-0' :
        swiping === 'left' ? '-translate-x-20 -rotate-6 opacity-0' : ''
      }`}>

        {/* Card header */}
        <div className="bg-purple-50 px-6 pt-6 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-medium text-sm">
                  {card.username[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">u/{card.username}</p>
                  <p className="text-xs text-gray-500">{card.city || 'Somewhere on the internet'}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-medium text-purple-600">{score}%</p>
              <p className="text-xs text-gray-400">match</p>
            </div>
          </div>
        </div>

        {/* Card body */}
        <div className="px-6 py-4 space-y-4">

          {/* Top subreddits */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">top communities</p>
            <div className="flex flex-wrap gap-1.5">
              {card.top_subreddits?.map(sub => (
                <span
                  key={sub}
                  className={`text-xs px-2.5 py-1 rounded-full ${
                    sharedSubs.includes(sub)
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  r/{sub}
                </span>
              ))}
            </div>
          </div>

          {/* Shared subs callout */}
          {sharedSubs.length > 0 && (
            <div className="bg-purple-50 rounded-xl px-3 py-2">
              <p className="text-xs text-purple-600">
                You both hang out in {sharedSubs.length === 1
                  ? `r/${sharedSubs[0]}`
                  : `r/${sharedSubs[0]} and ${sharedSubs.length - 1} more`}
              </p>
            </div>
          )}

          {/* Vibe tags */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">vibe</p>
            <div className="flex flex-wrap gap-1.5">
              {card.vibe_tags?.map(tag => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-orange-50 text-orange-600">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-lg font-medium text-gray-900">{card.karma?.toLocaleString()}</p>
              <p className="text-xs text-gray-400">karma</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-lg font-medium text-gray-900">{card.avg_comment_length} chars</p>
              <p className="text-xs text-gray-400">avg comment</p>
            </div>
          </div>

        </div>

        {/* Swipe buttons */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={() => handleSwipe('left')}
            className="flex-1 border border-gray-200 text-gray-500 rounded-xl py-3 font-medium hover:bg-gray-50 transition text-sm"
          >
            Pass
          </button>
          <button
            onClick={() => handleSwipe('right')}
            className="flex-1 bg-purple-600 text-white rounded-xl py-3 font-medium hover:bg-purple-700 transition text-sm"
          >
            Connect
          </button>
        </div>
      </div>

      {/* Card counter */}
      <p className="text-xs text-gray-400 mt-4">
        {cards.length - currentIndex - 1} more people to discover
      </p>

    </div>
  )
}
