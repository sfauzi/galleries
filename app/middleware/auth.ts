import { getSupabase } from '~/utils/supabase'

export default defineNuxtRouteMiddleware(async (to, from) => {
    const supabase = getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    
    // If not authenticated, redirect to login
    if (!user && to.path !== '/login') {
        return navigateTo('/login')
    }
    
    // If authenticated and trying to access login page, redirect to upload
    if (user && to.path === '/login') {
        return navigateTo('/upload')
    }
})