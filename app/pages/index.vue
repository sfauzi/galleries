<script lang="ts" setup>
import { ref, computed } from 'vue'

interface BentoItem {
    id: number
    src: string
    alt: string
    colSpan: number
    rowSpan: number
}

const items = ref<BentoItem[]>([
    { id: 1, src: 'https://picsum.photos/seed/bento1/800/600', alt: 'Gallery 1', colSpan: 2, rowSpan: 2 },
    { id: 2, src: 'https://picsum.photos/seed/bento2/400/300', alt: 'Gallery 2', colSpan: 1, rowSpan: 1 },
    { id: 3, src: 'https://picsum.photos/seed/bento3/400/600', alt: 'Gallery 3', colSpan: 1, rowSpan: 2 },
    { id: 4, src: 'https://picsum.photos/seed/bento4/800/300', alt: 'Gallery 4', colSpan: 2, rowSpan: 1 },
    { id: 5, src: 'https://picsum.photos/seed/bento5/400/300', alt: 'Gallery 5', colSpan: 1, rowSpan: 1 },
    { id: 6, src: 'https://picsum.photos/seed/bento6/800/600', alt: 'Gallery 6', colSpan: 2, rowSpan: 2 },
    { id: 7, src: 'https://picsum.photos/seed/bento7/400/300', alt: 'Gallery 7', colSpan: 1, rowSpan: 1 },
    { id: 8, src: 'https://picsum.photos/seed/bento8/400/600', alt: 'Gallery 8', colSpan: 1, rowSpan: 2 },
    { id: 9, src: 'https://picsum.photos/seed/bento9/400/300', alt: 'Gallery 9', colSpan: 1, rowSpan: 1 },
    { id: 10, src: 'https://picsum.photos/seed/bento10/800/300', alt: 'Gallery 10', colSpan: 2, rowSpan: 1 },
    { id: 11, src: 'https://picsum.photos/seed/bento11/400/300', alt: 'Gallery 11', colSpan: 1, rowSpan: 1 },
    { id: 12, src: 'https://picsum.photos/seed/bento12/400/300', alt: 'Gallery 12', colSpan: 1, rowSpan: 1 },
    { id: 13, src: 'https://picsum.photos/seed/bento13/800/600', alt: 'Gallery 13', colSpan: 2, rowSpan: 2 },
    { id: 14, src: 'https://picsum.photos/seed/bento14/400/600', alt: 'Gallery 14', colSpan: 1, rowSpan: 2 },
    { id: 15, src: 'https://picsum.photos/seed/bento15/400/300', alt: 'Gallery 15', colSpan: 1, rowSpan: 1 },
    { id: 16, src: 'https://picsum.photos/seed/bento16/800/300', alt: 'Gallery 16', colSpan: 2, rowSpan: 1 },
    { id: 17, src: 'https://picsum.photos/seed/bento17/400/300', alt: 'Gallery 17', colSpan: 1, rowSpan: 1 },
    { id: 18, src: 'https://picsum.photos/seed/bento18/400/600', alt: 'Gallery 18', colSpan: 1, rowSpan: 2 },
    { id: 19, src: 'https://picsum.photos/seed/bento19/800/600', alt: 'Gallery 19', colSpan: 2, rowSpan: 2 },
    { id: 20, src: 'https://picsum.photos/seed/bento20/400/300', alt: 'Gallery 20', colSpan: 1, rowSpan: 1 },
    { id: 21, src: 'https://picsum.photos/seed/bento21/800/300', alt: 'Gallery 21', colSpan: 2, rowSpan: 1 },
    { id: 22, src: 'https://picsum.photos/seed/bento22/400/300', alt: 'Gallery 22', colSpan: 1, rowSpan: 1 },
    { id: 23, src: 'https://picsum.photos/seed/bento23/400/600', alt: 'Gallery 23', colSpan: 1, rowSpan: 2 },
    { id: 24, src: 'https://picsum.photos/seed/bento24/800/300', alt: 'Gallery 24', colSpan: 2, rowSpan: 1 },
])

const selectedItem = ref<BentoItem | null>(null)
const resizingItem = ref<BentoItem | null>(null)

// Span options
const colOptions = [1, 2, 3, 4]
const rowOptions = [1, 2, 3, 4]

function openResize(item: BentoItem) {
    resizingItem.value = resizingItem.value?.id === item.id ? null : { ...item }
}

function applyResize(item: BentoItem, colSpan: number, rowSpan: number) {
    const target = items.value.find(i => i.id === item.id)
    if (target) {
        target.colSpan = colSpan
        target.rowSpan = rowSpan
    }
    resizingItem.value = null
}

function openLightbox(item: BentoItem) {
    selectedItem.value = item
}

function closeLightbox() {
    selectedItem.value = null
}

function gridColClass(span: number) {
    const map: Record<number, string> = { 1: 'col-span-1', 2: 'col-span-2', 3: 'col-span-3', 4: 'col-span-4' }
    return map[span] ?? 'col-span-1'
}

function gridRowClass(span: number) {
    const map: Record<number, string> = { 1: 'row-span-1', 2: 'row-span-2', 3: 'row-span-3', 4: 'row-span-4' }
    return map[span] ?? 'row-span-1'
}
</script>

<template>
    <div class="min-h-screen bg-[#0a0a0a] text-white font-['Syne',sans-serif]">
        <!-- Google Font Import -->
        <component :is="'style'">
            @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
            .bento-item { transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease; }
            .bento-item:hover { transform: scale(1.015); box-shadow: 0 0 0 2px #c8ff00, 0 20px 60px
            rgba(200,255,0,0.15); }
            .resize-panel { animation: slideDown 0.2s ease; }
            @keyframes slideDown { from { opacity:0; transform:translateY(-6px) } to { opacity:1;
            transform:translateY(0) } }
            .lightbox-bg { animation: fadeIn 0.25s ease; }
            @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
            .lightbox-img { animation: zoomIn 0.3s cubic-bezier(0.34,1.56,0.64,1); }
            @keyframes zoomIn { from { opacity:0; transform:scale(0.85) } to { opacity:1; transform:scale(1) } }
            .span-btn { transition: all 0.15s ease; }
            .span-btn:hover { background: #c8ff00; color: #0a0a0a; }
            .span-btn.active { background: #c8ff00; color: #0a0a0a; font-weight: 700; }
        </component>

        <!-- Header -->
        <!-- <header class="px-8 py-6 flex items-center justify-between border-b border-white/10">
            <div>
                <span class="text-2xl font-extrabold tracking-tight text-[#c8ff00]">BENTO</span>
                <span class="text-2xl font-extrabold tracking-tight text-white">GRID</span>
            </div>
            <p class="text-white/40 text-sm tracking-widest uppercase">Flexible Image Gallery</p>
        </header> -->

        <!-- Helper tip -->
        <!-- <div class="px-8 py-3 flex items-center gap-2 text-xs text-white/30 tracking-wide border-b border-white/5">
            <span class="inline-block w-2 h-2 rounded-full bg-[#c8ff00]"></span>
            Klik ikon <strong class="text-white/50 mx-1">⊞</strong> di tiap item untuk mengubah ukuran · Klik gambar
            untuk lihat lebih besar
        </div>
 -->
        <!-- Bento Grid -->
        <main class="p-4 md:p-6">
            <div class="grid grid-cols-4 auto-rows-[160px] md:auto-rows-[200px] gap-3" style="grid-auto-flow: dense;">
                <div v-for="item in items" :key="item.id"
                    :class="[gridColClass(item.colSpan), gridRowClass(item.rowSpan)]"
                    class="bento-item relative overflow-hidden rounded-2xl group cursor-pointer">
                    <!-- Image -->
                    <img :src="item.src" :alt="item.alt" class="w-full h-full object-cover" loading="lazy"
                        @click="openLightbox(item)" />

                    <!-- Dark overlay on hover -->
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        @click="openLightbox(item)"></div>

                    <!-- Item label -->
                    <div
                        class="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <span
                            class="text-xs font-semibold text-white/80 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
                            {{ item.colSpan }}×{{ item.rowSpan }} · #{{ item.id }}
                        </span>
                    </div>

                    <!-- Resize toggle button -->
                    <button
                        class="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-[#c8ff00] hover:text-black hover:border-[#c8ff00] z-10"
                        title="Ubah ukuran" @click.stop="openResize(item)">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="7" height="7" rx="1" />
                            <rect x="14" y="3" width="7" height="7" rx="1" />
                            <rect x="3" y="14" width="7" height="7" rx="1" />
                            <rect x="14" y="14" width="7" height="7" rx="1" />
                        </svg>
                    </button>

                    <!-- Resize Panel -->
                    <div v-if="resizingItem?.id === item.id"
                        class="resize-panel absolute top-12 right-2 z-20 bg-[#111]/90 backdrop-blur-md border border-white/15 rounded-xl p-3 shadow-2xl w-44"
                        @click.stop>
                        <p class="text-[10px] text-white/40 uppercase tracking-widest mb-2">Kolom (col span)</p>
                        <div class="flex gap-1 mb-3">
                            <button v-for="c in colOptions" :key="'c' + c"
                                :class="['span-btn flex-1 h-7 rounded-md text-xs border border-white/15 text-white/70', resizingItem.colSpan === c ? 'active' : '']"
                                @click="resizingItem.colSpan = c">{{ c }}</button>
                        </div>
                        <p class="text-[10px] text-white/40 uppercase tracking-widest mb-2">Baris (row span)</p>
                        <div class="flex gap-1 mb-3">
                            <button v-for="r in rowOptions" :key="'r' + r"
                                :class="['span-btn flex-1 h-7 rounded-md text-xs border border-white/15 text-white/70', resizingItem.rowSpan === r ? 'active' : '']"
                                @click="resizingItem.rowSpan = r">{{ r }}</button>
                        </div>
                        <button
                            class="w-full h-8 rounded-lg bg-[#c8ff00] text-black text-xs font-bold hover:bg-[#d4ff33] transition-colors"
                            @click="applyResize(item, resizingItem!.colSpan, resizingItem!.rowSpan)">Terapkan</button>
                    </div>
                </div>
            </div>
        </main>

        <!-- Lightbox -->
        <Teleport to="body">
            <div v-if="selectedItem"
                class="lightbox-bg fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
                @click="closeLightbox">
                <div class="lightbox-img relative max-w-5xl max-h-[90vh] w-full" @click.stop>
                    <img :src="selectedItem.src.replace('/400/', '/1200/').replace('/800/', '/1200/')"
                        :alt="selectedItem.alt" class="w-full h-full object-contain rounded-2xl shadow-2xl" />
                    <div class="absolute top-3 right-3 flex gap-2">
                        <span class="bg-black/60 backdrop-blur-sm text-white/60 text-xs px-3 py-1.5 rounded-lg">
                            {{ selectedItem.colSpan }}×{{ selectedItem.rowSpan }}
                        </span>
                        <button
                            class="w-9 h-9 rounded-lg bg-black/60 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors"
                            @click="closeLightbox">✕</button>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>