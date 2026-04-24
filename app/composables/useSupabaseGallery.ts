import { getSupabase, getCurrentUser } from '~/utils/supabase'

export const useSupabaseGallery = () => {
    const supabase = getSupabase()
    const uploading = ref(false)
    const uploadProgress = ref(0)
    const error = ref<string | null>(null)

    const uploadImages = async (files: FileList | File[]) => {
        const fileArray = Array.from(files)
        const uploadedImages = []
        
        uploading.value = true
        uploadProgress.value = 0
        error.value = null

        try {
            // Get current user
            const user = await getCurrentUser()
            if (!user) {
                throw new Error('You must be logged in to upload images')
            }

            for (let i = 0; i < fileArray.length; i++) {
                const file = fileArray[i]
                
                if (!file.type.startsWith('image/')) {
                    throw new Error(`${file.name} bukan file gambar`)
                }
                
                if (file.size > 10 * 1024 * 1024) {
                    throw new Error(`${file.name} melebihi 10MB`)
                }
                
                const fileExt = file.name.split('.').pop()
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
                const filePath = `gallery/${user.id}/${fileName}`

                // Upload to storage with user folder
                const { error: uploadError } = await supabase.storage
                    .from('gallery')
                    .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: false
                    })

                if (uploadError) throw uploadError

                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('gallery')
                    .getPublicUrl(filePath)

                // Save metadata to database with user_id
                const { data: dbData, error: dbError } = await supabase
                    .from('gallery_images')
                    .insert({
                        image_url: publicUrl,
                        alt: file.name.replace(/\.[^/.]+$/, ''),
                        file_name: file.name,
                        file_size: file.size,
                        mime_type: file.type,
                        user_id: user.id,
                        col_span: Math.floor(Math.random() * 2) + 1,
                        row_span: Math.floor(Math.random() * 2) + 1
                    })
                    .select()

                if (dbError) throw dbError

                uploadedImages.push(dbData[0])
                uploadProgress.value = ((i + 1) / fileArray.length) * 100
            }

            return { success: true, data: uploadedImages, error: null }
        } catch (err: any) {
            console.error('Upload error:', err)
            error.value = err.message
            return { success: false, data: null, error: err }
        } finally {
            uploading.value = false
            uploadProgress.value = 0
        }
    }

    const deleteImage = async (id: number, imageUrl: string) => {
        try {
            const user = await getCurrentUser()
            if (!user) {
                throw new Error('You must be logged in to delete images')
            }

            // Extract file path from URL
            const urlParts = imageUrl.split('/')
            const filePath = urlParts.slice(urlParts.indexOf('gallery')).join('/')
            
            // Delete from storage
            const { error: storageError } = await supabase.storage
                .from('gallery')
                .remove([filePath])

            if (storageError) {
                console.error('Storage delete error:', storageError)
            }

            // Delete from database (only if user owns it)
            const { error: dbError } = await supabase
                .from('gallery_images')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id) // Ensure user owns the image

            if (dbError) throw dbError

            return { success: true, error: null }
        } catch (err: any) {
            console.error('Delete error:', err)
            return { success: false, error: err }
        }
    }

    const updateImageSpan = async (id: number, colSpan: number, rowSpan: number) => {
        try {
            const user = await getCurrentUser()
            if (!user) {
                throw new Error('You must be logged in to update images')
            }

            const { data, error: updateError } = await supabase
                .from('gallery_images')
                .update({
                    col_span: colSpan,
                    row_span: rowSpan,
                    updated_at: new Date()
                })
                .eq('id', id)
                .eq('user_id', user.id) // Ensure user owns the image
                .select()

            if (updateError) throw updateError
            return { success: true, data: data?.[0], error: null }
        } catch (err: any) {
            console.error('Update span error:', err)
            return { success: false, data: null, error: err }
        }
    }

    const fetchImages = async () => {
        try {
            const { data, error: fetchError } = await supabase
                .from('gallery_images')
                .select('*')
                .order('created_at', { ascending: false })

            if (fetchError) throw fetchError
            return { success: true, data: data || [], error: null }
        } catch (err: any) {
            console.error('Fetch error:', err)
            return { success: false, data: [], error: err }
        }
    }

    return {
        uploadImages,
        fetchImages,
        deleteImage,
        updateImageSpan,
        uploading,
        uploadProgress,
        error
    }
}