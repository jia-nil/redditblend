import { supabase } from '@/lib/supabase'

export async function POST(request) {
  const { username, age, gender, city, lookingFor, genderPreference, agePreference, locationPreference } = await request.json()

  try {
    // Fetch public profile
    const profileRes = await fetch(
      `https://www.reddit.com/user/${username}/about.json`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    )
    if (!profileRes.ok) throw new Error('Reddit user not found. Make sure your profile is public.')
    const profileData = await profileRes.json()
    const profile = profileData.data

    // Fetch recent comments
    const commentsRes = await fetch(
      `https://www.reddit.com/user/${username}/comments.json?limit=100`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    )
    const commentsData = await commentsRes.json()
    const comments = commentsData.data.children.map(c => c.data)

    if (comments.length === 0) throw new Error('No comment history found. Make sure your profile is public.')

    // Count subreddit activity
    const subredditCounts = {}
    comments.forEach(comment => {
      const sub = comment.subreddit
      subredditCounts[sub] = (subredditCounts[sub] || 0) + 1
    })

    // Top 5 subreddits only
    const topSubreddits = Object.entries(subredditCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([sub]) => sub)

    // Average comment length
    const avgCommentLength = Math.round(
      comments.reduce((sum, c) => sum + c.body.length, 0) / comments.length
    )

    // Peak posting hour
    const hourCounts = Array(24).fill(0)
    comments.forEach(c => {
      const hour = new Date(c.created_utc * 1000).getUTCHours()
      hourCounts[hour]++
    })
    const peakHour = hourCounts.indexOf(Math.max(...hourCounts))

    // Vibe tags
    const vibeTags = []
    if (avgCommentLength > 300) vibeTags.push('deep diver')
    if (avgCommentLength < 80) vibeTags.push('short and sharp')
    if (peakHour >= 22 || peakHour <= 3) vibeTags.push('late night poster')
    if (peakHour >= 6 && peakHour <= 10) vibeTags.push('early bird')
    if (Object.keys(subredditCounts).length >= 8) vibeTags.push('niche explorer')
    if (comments.length > 80) vibeTags.push('active commenter')
    if (profile.total_karma > 10000) vibeTags.push('high karma')

    // Build text for embedding
    const textForEmbedding = comments
      .slice(0, 30)
      .map(c => c.body)
      .join(' ')
      .slice(0, 2000)

    // Get embedding from Hugging Face
    const embeddingRes = await fetch(
      'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: textForEmbedding }),
      }
    )
    const embeddingData = await embeddingRes.json()
    const embedding = Array.isArray(embeddingData[0])
      ? embeddingData[0]
      : embeddingData

    // Save to Supabase
    const { data, error } = await supabase
      .from('users')
      .upsert({
        username,
        age: parseInt(age),
        gender,
        city,
        looking_for: lookingFor,
        gender_preference: genderPreference,
        age_preference: parseInt(agePreference),
        location_preference: locationPreference,
        top_subreddits: topSubreddits,
        vibe_tags: vibeTags,
        avg_comment_length: avgCommentLength,
        peak_hour: peakHour,
        karma: profile.total_karma,
        embedding,
      }, { onConflict: 'username' })
      .select()
      .single()

    if (error) throw new Error(error.message)

    return Response.json({ success: true, user: data })

  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 })
  }
}
