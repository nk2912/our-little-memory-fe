export type User = {
  id: number
  name: string
  email: string
}

export type Place = {
  id: number
  name: string
  address?: string
  image_path?: string | null
  image_url?: string | null
  latitude?: string | number | null
  longitude?: string | number | null
}

export type Memory = {
  id: number
  title: string
  description?: string
  memory_date: string
  mood?: string
  is_favorite?: boolean
  place_id?: number | null
  place?: Place
}

export type Routine = {
  id: number
  place_id?: number | null
  title: string
  repeat_type: string
  day_of_week?: string | null
  start_time?: string | null
  end_time?: string | null
  start_date: string
  end_date?: string | null
  color?: string | null
  is_active?: boolean
  place?: Place
}

export type RoutineOccurrence = {
  id: number
  routine_id: number
  occurrence_date: string
  status: string
  note?: string | null
}

export type Tag = {
  id: number
  name: string
  color?: string | null
}

export type SpecialDate = {
  id: number
  title: string
  description?: string | null
  special_date: string
  type: string
  remind_before_days: number
}

export type VisitAlbum = {
  id: string
  title: string
  subtitle: string
  date: string
  place: string
  mood: string
  image: string
  color: string
  memories: Memory[]
}
