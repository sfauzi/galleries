<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useSupabaseGallery } from '~/composables/useSupabaseGallery'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
    layout: 'default',
    middleware: 'auth' // Add auth middleware
})

const { uploadImages, uploading, uploadProgress } = useSupabaseGallery()
const { user, isAuthenticated, initAuth } = useAuth()

const selectedFiles = ref<FileList | null>(null)
const previewUrls = ref<string[]>([])
const uploadError = ref<string | null>(null)
const uploadSuccess = ref(false)
const uploadedCount = ref(0)

// Check authentication on mount
onMounted(async () => {
    await initAuth()
    if (!isAuthenticated.value) {
        navigateTo('/login')
    }
})

const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files && target.files.length > 0) {
        selectedFiles.value = target.files
        uploadError.value = null
        uploadSuccess.value = false
        
        previewUrls.value = []
        Array.from(target.files).forEach(file => {
            const url = URL.createObjectURL(file)
            previewUrls.value.push(url)
        })
    }
}

const handleUpload = async () => {
    if (!selectedFiles.value || selectedFiles.value.length === 0) {
        uploadError.value = 'Pilih file terlebih dahulu'
        return
    }

    const result = await uploadImages(selectedFiles.value)
    
    if (result.success && result.data) {
        uploadSuccess.value = true
        uploadedCount.value = result.data.length
        selectedFiles.value = null
        previewUrls.value = []
        
        const fileInput = document.querySelector('#file-upload') as HTMLInputElement
        if (fileInput) fileInput.value = ''
        
        setTimeout(() => {
            uploadSuccess.value = false
        }, 3000)
    } else {
        uploadError.value = result.error?.message || 'Upload gagal, silakan coba lagi'
    }
}

const clearAll = () => {
    selectedFiles.value = null
    previewUrls.value = []
    uploadError.value = null
    uploadSuccess.value = false
    const fileInput = document.querySelector('#file-upload') as HTMLInputElement
    if (fileInput) fileInput.value = ''
}

const navigateToGallery = () => {
    navigateTo('/')
}
</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] text-white font-['Syne',sans-serif]">
        <div class="container mx-auto px-4 py-8 max-w-6xl">
            <!-- Header -->
            <div class="mb-8">
                <div class="flex justify-between items-center">
                    <div>
                        <h1 class="text-4xl md:text-5xl font-bold mb-2">
                            <span class="text-[#c8ff00]">Upload</span>
                            <span> Gallery</span>
                        </h1>
                        <p class="text-white/60 text-sm">Upload multiple images to your gallery</p>
                        <p class="text-white/40 text-xs mt-1">Logged in as: {{ user?.email }}</p>
                    </div>
                    <div class="flex gap-3">
                        <button 
                            @click="navigateToGallery"
                            class="px-6 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 12h18M3 12l4-4m-4 4l4 4" />
                                <path d="M21 12l-4-4m4 4l-4 4" />
                            </svg>
                            View Gallery
                        </button>
                    </div>
                </div>
            </div>

            <!-- Upload Form -->
            <div class="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8">
                <!-- File Input Area -->
                <div class="mb-6">
                    <label class="block text-sm font-medium mb-3 text-white/80">Pilih Gambar (Multiple)</label>
                    <div class="relative">
                        <input id="file-upload" type="file" multiple accept="image/jpeg,image/png,image/gif,image/webp"
                            @change="handleFileSelect"
                            class="w-full px-4 py-3 bg-black/50 border-2 border-dashed border-white/20 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#c8ff00] file:text-black hover:file:bg-[#d4ff33] transition-all cursor-pointer" />
                    </div>
                    <p class="text-xs text-white/40 mt-2">
                        Supported formats: JPG, PNG, GIF, WEBP (Max 10MB per file)
                    </p>
                </div>

                <!-- Preview Area -->
                <div v-if="previewUrls.length > 0" class="mb-6">
                    <h3 class="text-sm font-medium mb-3 text-white/80">Preview ({{ previewUrls.length }} files)</h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div v-for="(url, index) in previewUrls" :key="index" class="relative group">
                            <img :src="url" :alt="`Preview ${index + 1}`" class="w-full h-32 object-cover rounded-lg" />
                            <div
                                class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                <span class="text-xs text-white">{{ index + 1 }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Error Message -->
                <div v-if="uploadError"
                    class="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm">
                    <div class="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        {{ uploadError }}
                    </div>
                </div>

                <!-- Success Message -->
                <div v-if="uploadSuccess"
                    class="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-400 text-sm">
                    <div class="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2">
                            <path d="M20 6L9 17l-5-5" />
                        </svg>
                        Berhasil upload {{ uploadedCount }} gambar!
                    </div>
                </div>

                <!-- Upload Progress -->
                <div v-if="uploading" class="mb-6">
                    <div class="flex justify-between text-sm mb-2">
                        <span>Uploading...</span>
                        <span>{{ Math.round(uploadProgress) }}%</span>
                    </div>
                    <div class="bg-white/10 rounded-full h-2 overflow-hidden">
                        <div class="bg-[#c8ff00] h-full transition-all duration-300"
                            :style="{ width: `${uploadProgress}%` }"></div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex gap-3">
                    <button @click="handleUpload" :disabled="uploading || !selectedFiles"
                        class="flex-1 px-6 py-3 bg-[#c8ff00] text-black rounded-xl font-semibold hover:bg-[#d4ff33] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        <svg v-if="!uploading" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 3v12m0 0-3-3m3 3 3-3M5 21h14" />
                        </svg>
                        <div v-else
                            class="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        {{ uploading ? 'Uploading...' : 'Upload Now' }}
                    </button>

                    <button v-if="selectedFiles || uploadSuccess" @click="clearAll"
                        class="px-6 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
                        Clear
                    </button>
                </div>

                <!-- Info Box -->
                <div class="mt-6 p-4 bg-white/5 rounded-xl">
                    <div class="flex items-start gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-[#c8ff00] mt-0.5"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                        <div class="text-xs text-white/60">
                            <p class="mb-1">• File akan otomatis tersimpan di Supabase Storage</p>
                            <p class="mb-1">• Metadata gambar tersimpan di database</p>
                            <p>• Gambar akan muncul di gallery setelah upload selesai</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
</style>