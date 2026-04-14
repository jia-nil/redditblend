'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Onboarding() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    username: '',
    age: '',
    gender: '',
    city: '',
    lookingFor: 'friends',
    genderPreference: 'any',
    agePreference: '5',
    locationPreference: 'anywhere',
  })

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      localStorage.setItem('currentUser', JSON.stringify(data.user))
      router.push('/discover')
    } catch (err) {
      setError(err.message)
      setStep(1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">

        {/* Step 1 — Reddit username */}
        {step === 1 && (
          <div>
            <h1 className="text-2xl font-medium text-gray-900 mb-1">Find your people</h1>
            <p className="text-gray-500 text-sm mb-8">We'll build your profile from your Reddit history</p>

            <label className="block text-sm text-gray-600 mb-2">Reddit username</label>
            <input
              type="text"
              placeholder="u/yourname"
              value={form.username}
              onChange={e => update('username', e.target.value.replace('u/', ''))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-purple-400 mb-2"
            />
            <p className="text-xs text-gray-400 mb-8">Make sure your Reddit profile is set to public</p>

            <button
              onClick={() => form.username && setStep(2)}
              className="w-full bg-purple-600 text-white rounded-xl py-3 font-medium hover:bg-purple-700 transition"
            >
              Continue
            </button>
            {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
          </div>
        )}

        {/* Step 2 — Basic info */}
        {step === 2 && (
          <div>
            <h1 className="text-2xl font-medium text-gray-900 mb-1">About you</h1>
            <p className="text-gray-500 text-sm mb-8">This helps us find better matches</p>

            <label className="block text-sm text-gray-600 mb-2">Your age</label>
            <input
              type="number"
              placeholder="25"
              value={form.age}
              onChange={e => update('age', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-purple-400 mb-4"
            />

            <label className="block text-sm text-gray-600 mb-2">Your gender</label>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {['Male', 'Female', 'Other'].map(g => (
                <button
                  key={g}
                  onClick={() => update('gender', g.toLowerCase())}
                  className={`py-2 rounded-xl border text-sm transition ${
                    form.gender === g.toLowerCase()
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            <label className="block text-sm text-gray-600 mb-2">Your city</label>
            <input
              type="text"
              placeholder="Mumbai, London, New York..."
              value={form.city}
              onChange={e => update('city', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-purple-400 mb-8"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-3 font-medium hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                onClick={() => form.age && form.gender && setStep(3)}
                className="flex-1 bg-purple-600 text-white rounded-xl py-3 font-medium hover:bg-purple-700 transition"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Preferences */}
        {step === 3 && (
          <div>
            <h1 className="text-2xl font-medium text-gray-900 mb-1">Your preferences</h1>
            <p className="text-gray-500 text-sm mb-8">Who are you looking to connect with?</p>

            <label className="block text-sm text-gray-600 mb-2">Show me</label>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {['Any', 'Male', 'Female'].map(g => (
                <button
                  key={g}
                  onClick={() => update('genderPreference', g.toLowerCase())}
                  className={`py-2 rounded-xl border text-sm transition ${
                    form.genderPreference === g.toLowerCase()
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            <label className="block text-sm text-gray-600 mb-2">Age range</label>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[['±2 years', '2'], ['±5 years', '5'], ['±10 years', '10']].map(([label, val]) => (
                <button
                  key={val}
                  onClick={() => update('agePreference', val)}
                  className={`py-2 rounded-xl border text-sm transition ${
                    form.agePreference === val
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <label className="block text-sm text-gray-600 mb-2">Location</label>
            <div className="grid grid-cols-3 gap-2 mb-8">
              {[['Same city', 'city'], ['Same country', 'country'], ['Anywhere', 'anywhere']].map(([label, val]) => (
                <button
                  key={val}
                  onClick={() => update('locationPreference', val)}
                  className={`py-2 rounded-xl border text-sm transition ${
                    form.locationPreference === val
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-3 font-medium hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-purple-600 text-white rounded-xl py-3 font-medium hover:bg-purple-700 transition disabled:opacity-50"
              >
                {loading ? 'Building your profile...' : 'Find my people'}
              </button>
            </div>
          </div>
        )}

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-6">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s === step ? 'w-6 bg-purple-500' : 'w-1.5 bg-gray-200'
              }`}
            />
          ))}
        </div>

      </div>
    </div>
  )
}
