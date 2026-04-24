import { getSupabase } from '~/utils/supabase'
import type { User } from '@supabase/supabase-js'

export const useAuth = () => {
    const supabase = getSupabase()
    const user = ref<User | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    // Login with email and password
    const login = async (email: string, password: string) => {
        loading.value = true
        error.value = null

        try {
            const { data, error: loginError } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (loginError) throw loginError

            user.value = data.user
            return { success: true, data: data.user, error: null }
        } catch (err: any) {
            error.value = err.message
            return { success: false, data: null, error: err }
        } finally {
            loading.value = false
        }
    }

    // Logout
    const logout = async () => {
        loading.value = true
        error.value = null

        try {
            const { error: logoutError } = await supabase.auth.signOut()
            if (logoutError) throw logoutError

            user.value = null
            return { success: true, error: null }
        } catch (err: any) {
            error.value = err.message
            return { success: false, error: err }
        } finally {
            loading.value = false
        }
    }

    // Get current user
    const getCurrentUser = async () => {
        try {
            const { data: { user: currentUser } } = await supabase.auth.getUser()
            user.value = currentUser
            return currentUser
        } catch (err) {
            console.error('Error getting user:', err)
            return null
        }
    }

    // Check if authenticated
    const isAuthenticated = computed(() => !!user.value)

    // Initialize auth state
    const initAuth = async () => {
        await getCurrentUser()

        // Listen for auth changes
        supabase.auth.onAuthStateChange((_event, session) => {
            user.value = session?.user || null
        })
    }

    return {
        user,
        loading,
        error,
        login,
        logout,
        getCurrentUser,
        isAuthenticated,
        initAuth
    }
}