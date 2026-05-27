export type LogType   = 'movie' | 'series' | 'episode'
export type LogStatus = 'watched' | 'watching' | 'dropped'
export type LogSource = 'manual' | 'letterboxd'

// ── Vibe (replaces numeric rating) ──────────────────────────────────────────
export type Vibe = 'masterpiece' | 'loved' | 'solid' | 'fine' | 'painful'

export const VIBES: {
  key:   Vibe
  label: string
  emoji: string
  sub:   string   // one-liner description
  color: string
}[] = [
  { key: 'masterpiece', label: 'This is Cinema', emoji: '🏆', sub: 'One for the ages',      color: '#fbbf24' },
  { key: 'loved',       label: 'Loved it',       emoji: '💜',  sub: 'Genuinely great',       color: '#b8a0ff' },
  { key: 'solid',       label: 'Mid',            emoji: '😑', sub: 'Perfectly middle ground', color: '#82ff1f' },
  { key: 'fine',        label: 'Boring',         emoji: '😐', sub: 'Has its moments',        color: '#b8a0ff' },
  { key: 'painful',     label: 'Painful',        emoji: '💀', sub: 'Genuinely bad',          color: '#e02020' },
]

// ── Platforms ────────────────────────────────────────────────────────────────
export const PLATFORMS = [
  { key: 'theatre',    label: 'Theatre',     emoji: '🎭', logo: null },
  { key: 'imax',       label: 'IMAX',        emoji: '🎬', logo: null },
  { key: 'netflix',    label: 'Netflix',     emoji: '🔴', logo: 'https://www.google.com/s2/favicons?domain=netflix.com&sz=64' },
  { key: 'prime',      label: 'Prime Video', emoji: '📦', logo: 'https://www.google.com/s2/favicons?domain=primevideo.com&sz=64' },
  { key: 'disney',     label: 'Disney+',     emoji: '✨', logo: 'https://www.google.com/s2/favicons?domain=disneyplus.com&sz=64' },
  { key: 'apple',      label: 'Apple TV+',   emoji: '🍎', logo: 'https://www.google.com/s2/favicons?domain=tv.apple.com&sz=64' },
  { key: 'hotstar',    label: 'Hotstar',     emoji: '⭐', logo: 'https://www.google.com/s2/favicons?domain=hotstar.com&sz=64' },
  { key: 'mubi',       label: 'MUBI',        emoji: '🎞️', logo: 'https://www.google.com/s2/favicons?domain=mubi.com&sz=64' },
  { key: 'youtube',    label: 'YouTube',     emoji: '▶️', logo: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=64' },
  { key: 'unofficial', label: 'Unofficial',  emoji: '🏴‍☠️', logo: null },
]

// ── What drew you to it ──────────────────────────────────────────────────────
export const DRAWS = [
  { key: 'cast',           label: 'The Cast',          emoji: '🎭' },
  { key: 'story',          label: 'The Story',         emoji: '📖' },
  { key: 'director',       label: 'The Director',      emoji: '🎬' },
  { key: 'studio',         label: 'The Studio',        emoji: '🏢' },
  { key: 'franchise',      label: 'The Franchise',     emoji: '🌌' },
  { key: 'genre',          label: 'The Genre',         emoji: '🎯' },
  { key: 'soundtrack',     label: 'The Soundtrack',    emoji: '🎵' },
  { key: 'visuals',        label: 'The Visuals',       emoji: '📷' },
  { key: 'hype',           label: 'The Hype',          emoji: '🔥' },
  { key: 'recommendation', label: 'A Recommendation',  emoji: '💬' },
  { key: 'awards',         label: 'Award Buzz',        emoji: '🏅' },
  { key: 'binge',          label: 'Binge Session',     emoji: '🍿' },
  { key: 'nostalgia',      label: 'Nostalgia',         emoji: '🕰️' },
  { key: 'curiosity',      label: 'Pure Curiosity',    emoji: '🔭' },
]

// ── Favourite person (from TMDB credits) ────────────────────────────────────
export interface FavoritePerson {
  id:          number
  name:        string
  role:        string        // character name or job title
  profile_url: string | null
}

// ── Main log entry ───────────────────────────────────────────────────────────
export interface MovieLog {
  id:              string
  type:            LogType
  tmdb_id:         number | null
  title:           string
  poster_url:      string | null
  backdrop_url:    string | null
  year:            number | null

  // ── Personal fields ──
  vibe:            Vibe | null
  review:          string | null
  watched_on:      string          // ISO date
  platform:        string | null
  favorite_person: FavoritePerson | null
  draws:           string[]
  season:          number | null
  episode:         number | null
  episode_title:   string | null
  status:          LogStatus
  tags:            string[]
  rewatch:         boolean
  source:          LogSource

  // ── TMDB rich metadata (for insights) ──
  genres:               string[]
  runtime:              number | null
  original_language:    string | null
  origin_country:       string[]
  tmdb_rating:          number | null
  tmdb_vote_count:      number | null
  tmdb_popularity:      number | null
  director:             string | null
  cast_names:           string[]
  keywords:             string[]
  collection:           string | null
  certification:        string | null
  tagline:              string | null
  overview:             string | null
  imdb_id:              string | null
  budget:               number | null
  revenue:              number | null
  networks:             string[]
  production_companies: string[]

  created_at: string
}

// ── TMDB shapes ──────────────────────────────────────────────────────────────
export interface TMDBResult {
  id:               number
  title?:           string
  name?:            string
  poster_path:      string | null
  backdrop_path:    string | null
  release_date?:    string
  first_air_date?:  string
  genre_ids:        number[]
  overview:         string
  vote_average:     number
  number_of_seasons?: number
}

export interface TMDBPerson {
  id:           number
  name:         string
  character?:   string   // cast
  job?:         string   // crew
  department?:  string
  profile_path: string | null
  order?:       number
}

export interface TMDBEpisode {
  id:             number
  episode_number: number
  name:           string
  still_path:     string | null
  air_date:       string
  overview:       string
  runtime:        number | null
}

// ── Watch Later ──────────────────────────────────────────────────────────────
export interface WatchlistItem {
  id:          string
  tmdb_id:     number | null
  type:        'movie' | 'series'
  title:       string
  poster_url:  string | null
  backdrop_url:string | null
  year:        number | null
  overview:    string | null
  genres:      string[]
  tmdb_rating: number | null
  added_at:    string
}

// ── Letterboxd CSV row ───────────────────────────────────────────────────────
export interface LetterboxdRow {
  name:      string
  year:      string
  rating:    string   // 0.5–5 or empty
  watchedOn: string
  rewatch:   boolean
  tags:      string[]
}
