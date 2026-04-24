import { createClient } from '@supabase/supabase-js'

export const createSupabaseClient = () => {
  const config = useRuntimeConfig()
  const supabaseUrl = config.public.supabaseUrl
  const supabaseAnonKey = config.public.supabaseKey
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase credentials are missing. Check your environment variables.')
  }
  
  return createClient(supabaseUrl, supabaseAnonKey)
}

let supabaseInstance: ReturnType<typeof createClient> | null = null

export const getSupabase = () => {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient()
  }
  return supabaseInstance
}

// Auth helper functions
export const getCurrentUser = async () => {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const isAuthenticated = async () => {
  const user = await getCurrentUser()
  return !!user
}