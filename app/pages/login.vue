<script lang="ts" setup>
import { useAuth } from '~/composables/useAuth'

definePageMeta({
    layout: 'default'
})

const { login, loading, error } = useAuth()
const email = ref('sfauzi@gmail.com')
const password = ref('')
const showPassword = ref(false)

const handleLogin = async () => {
    if (!email.value || !password.value) {
        alert('Please fill in all fields')
        return
    }

    const result = await login(email.value, password.value)

    if (result.success) {
        // Redirect to upload page
        navigateTo('/upload')
    } else {
        alert('Login failed: ' + (result.error?.message || 'Unknown error'))
    }
}
</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] flex items-center justify-center px-4">
        <div class="max-w-md w-full">
            <!-- Logo/Brand -->
            <div class="text-center mb-8">
                <h1 class="text-4xl font-bold mb-2 font-['Syne',sans-serif]">
                    <span class="text-[#c8ff00]">PIN</span>
                    <span class="text-white">GALLERIES</span>
                </h1>
                <p class="text-white/60">Login to upload images</p>
            </div>

            <!-- Login Form -->
            <div class="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
                <form @submit.prevent="handleLogin">
                    <!-- Email Field -->
                    <div class="mb-4">
                        <label class="block text-sm font-medium mb-2 text-white/80">Email</label>
                        <input v-model="email" type="email"
                            class="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#c8ff00] transition-colors"
                            placeholder="your@email.com" required />
                    </div>

                    <!-- Password Field -->
                    <div class="mb-6">
                        <label class="block text-sm font-medium mb-2 text-white/80">Password</label>
                        <div class="relative">
                            <input v-model="password" :type="showPassword ? 'text' : 'password'"
                                class="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#c8ff00] transition-colors"
                                placeholder="Enter your password" required />
                            <button type="button" @click="showPassword = !showPassword"
                                class="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white">
                                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5"
                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                                <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2">
                                    <path
                                        d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                    <line x1="1" y1="1" x2="23" y2="23" />
                                </svg>
                            </button>
                        </div>
                        <p class="text-xs text-white/40 mt-1">Demo account: sfauzi@gmail.com</p>
                    </div>

                    <!-- Error Message -->
                    <div v-if="error"
                        class="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                        {{ error }}
                    </div>

                    <!-- Submit Button -->
                    <button type="submit" :disabled="loading"
                        class="w-full py-3 bg-[#c8ff00] text-black rounded-xl font-semibold hover:bg-[#d4ff33] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        <div v-if="loading"
                            class="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        <span v-else>Login</span>
                    </button>
                </form>

                <!-- Demo Info -->
                <!-- <div class="mt-6 p-4 bg-white/5 rounded-xl">
                    <p class="text-xs text-white/60 text-center">
                        <strong>Demo Credentials:</strong><br />
                        Email: sfauzi@gmail.com<br />
                        Password: (the password you set in Supabase)
                    </p>
                </div> -->
            </div>
        </div>
    </div>
</template>