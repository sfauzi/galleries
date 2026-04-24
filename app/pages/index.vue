<script lang="ts" setup>
import { ref, onMounted, nextTick } from "vue";
import { useSupabaseGallery } from "~/composables/useSupabaseGallery";
import { useAuth } from '~/composables/useAuth'

interface BentoItem {
  id: number;
  src: string;
  alt: string;
  colSpan: number;
  rowSpan: number;
}

const { fetchImages, deleteImage, updateImageSpan } = useSupabaseGallery();
const { user, isAuthenticated, logout, initAuth } = useAuth()

const items = ref<BentoItem[]>([]);
const selectedItem = ref<BentoItem | null>(null);
const resizingItem = ref<BentoItem | null>(null);
const resizePanelEl = ref<HTMLElement | null>(null);

// Posisi panel — koordinat viewport murni untuk position:fixed
const panelPos = ref({ top: 0, left: 0, placement: 'below' as 'below' | 'above' });

const loading = ref(true);
const colOptions = [1, 2, 3, 4];
const rowOptions = [1, 2, 3, 4];

const loadImages = async () => {
  loading.value = true
  const result = await fetchImages()
  if (result.success && result.data) {
    items.value = result.data.map((item: any) => ({
      id: item.id,
      src: item.image_url,
      alt: item.alt,
      colSpan: item.col_span,
      rowSpan: item.row_span
    }))
  }
  loading.value = false
}

const handleDeleteImage = async (item: BentoItem, event: Event) => {
  event.stopPropagation();
  if (confirm(`Yakin ingin menghapus ${item.alt}?`)) {
    const result = await deleteImage(item.id, item.src);
    if (result.success) {
      items.value = items.value.filter((i) => i.id !== item.id);
    } else {
      alert("Gagal menghapus gambar");
    }
  }
};

async function openResize(item: BentoItem, event: MouseEvent) {
  // Toggle off jika item yang sama diklik lagi
  if (resizingItem.value?.id === item.id) {
    resizingItem.value = null;
    return;
  }

  // Set item dulu agar panel ter-render ke DOM
  resizingItem.value = { ...item };

  // Koordinat tombol di viewport (tanpa scroll — karena fixed)
  const btn = event.currentTarget as HTMLElement;
  const btnRect = btn.getBoundingClientRect();

  // Tunggu panel ter-render agar kita bisa ukur ukurannya
  await nextTick();

  const PANEL_W = 176;  // w-44
  const PANEL_H = resizePanelEl.value?.offsetHeight ?? 190;
  const GAP = 6;
  const MARGIN = 8; // jarak aman dari tepi layar

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Horizontal: rata kanan tombol, tapi jangan keluar kiri/kanan layar
  let left = btnRect.right - PANEL_W;
  if (left < MARGIN) left = MARGIN;
  if (left + PANEL_W > vw - MARGIN) left = vw - PANEL_W - MARGIN;

  // Vertical: preferensi di bawah tombol, fallback di atas jika tidak muat
  let top: number;
  let placement: 'below' | 'above';
  if (btnRect.bottom + GAP + PANEL_H <= vh - MARGIN) {
    top = btnRect.bottom + GAP;
    placement = 'below';
  } else {
    top = btnRect.top - GAP - PANEL_H;
    placement = 'above';
    // Jika masih tidak muat di atas, paksa di bawah dengan scroll
    if (top < MARGIN) top = MARGIN;
  }

  panelPos.value = { top, left, placement };
}

async function applyResize(item: BentoItem, colSpan: number, rowSpan: number) {
  const result = await updateImageSpan(item.id, colSpan, rowSpan);
  const target = items.value.find((i) => i.id === item.id);
  if (target) {
    if (result.success && result.data) {
      target.colSpan = result.data.col_span;
      target.rowSpan = result.data.row_span;
    } else {
      target.colSpan = colSpan;
      target.rowSpan = rowSpan;
    }
  }
  resizingItem.value = null;
}

function openLightbox(item: BentoItem) {
  selectedItem.value = item;
}

function closeLightbox() {
  selectedItem.value = null;
}

function gridColClass(span: number) {
  const map: Record<number, string> = { 1: "col-span-1", 2: "col-span-2", 3: "col-span-3", 4: "col-span-4" };
  return map[span] ?? "col-span-1";
}

function gridRowClass(span: number) {
  const map: Record<number, string> = { 1: "row-span-1", 2: "row-span-2", 3: "row-span-3", 4: "row-span-4" };
  return map[span] ?? "row-span-1";
}

const handleLogout = async () => {
  await logout()
  navigateTo('/')
}

const navigateToUpload = () => navigateTo("/upload");

onMounted(async () => {
  await initAuth()
  await loadImages()
})
</script>

<template>
  <div class="min-h-screen bg-[#0a0a0a] text-white font-['Syne',sans-serif]">
    <component :is="'style'">
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
      .bento-item { transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease; }
      .bento-item:hover { transform: scale(1.015); box-shadow: 0 0 0 2px #c8ff00, 0 20px 60px rgba(200,255,0,0.15); }
      .resize-panel { animation: slideIn 0.15s ease; }
      @keyframes slideIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0);
      } }
      .lightbox-bg { animation: fadeIn 0.25s ease; }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      .lightbox-img { animation: zoomIn 0.3s cubic-bezier(0.34,1.56,0.64,1); }
      @keyframes zoomIn { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }
      .span-btn { transition: all 0.15s ease; }
      .span-btn:hover { background: #c8ff00; color: #0a0a0a; }
      .span-btn.active { background: #c8ff00; color: #0a0a0a; font-weight: 700; }
    </component>

    <!-- Header -->
    <header class="px-8 py-6 flex items-center justify-between border-b border-white/10">
      <div>
        <span class="text-2xl font-extrabold tracking-tight text-[#c8ff00]">BENTO</span>
        <span class="text-2xl font-extrabold tracking-tight text-white">GRID</span>
      </div>
      <div class="flex items-center gap-4">
        <div v-if="isAuthenticated" class="flex items-center gap-3">
          <span class="text-sm text-white/60">{{ user?.email }}</span>
          <button @click="navigateToUpload"
            class="px-5 py-2.5 bg-[#c8ff00] text-black rounded-xl font-semibold hover:bg-[#d4ff33] transition-all flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2">
              <path d="M12 3v12m0 0-3-3m3 3 3-3M5 21h14" />
            </svg>
            Upload
          </button>
          <button @click="handleLogout"
            class="px-5 py-2.5 bg-red-500/20 text-red-400 rounded-xl font-semibold hover:bg-red-500/30 transition-all flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
        <button v-else @click="navigateTo('/login')"
          class="px-5 py-2.5 bg-[#c8ff00] text-black rounded-xl font-semibold hover:bg-[#d4ff33] transition-all flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
          Login
        </button>
      </div>
    </header>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <div class="w-12 h-12 border-4 border-[#c8ff00] border-t-transparent rounded-full animate-spin mx-auto mb-4">
        </div>
        <p class="text-white/60">Loading gallery...</p>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="items.length === 0" class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-20 h-20 mx-auto mb-4 text-white/20" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="1">
          <rect x="2" y="2" width="20" height="20" rx="2.18" />
          <circle cx="8.5" cy="8.5" r="2.5" />
          <path d="M21 15l-5-5-5 5-5-5-4 4" />
        </svg>
        <p class="text-white/60 mb-4">No images in gallery yet</p>
        <button @click="navigateToUpload"
          class="px-6 py-3 bg-[#c8ff00] text-black rounded-xl font-semibold hover:bg-[#d4ff33] transition-all">
          Upload First Image
        </button>
      </div>
    </div>

    <!-- Bento Grid -->
    <main v-else class="p-4 md:p-6">
      <div class="grid grid-cols-4 auto-rows-[160px] md:auto-rows-[200px] gap-3" style="grid-auto-flow: dense">
        <div v-for="item in items" :key="item.id" :class="[gridColClass(item.colSpan), gridRowClass(item.rowSpan)]"
          class="bento-item relative overflow-hidden rounded-2xl group cursor-pointer">
          <img :src="item.src" :alt="item.alt" class="w-full h-full object-cover" loading="lazy"
            @click="openLightbox(item)" />

          <div
            class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            @click="openLightbox(item)"></div>

          <div
            class="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <span class="text-xs font-semibold text-white/80 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
              {{ item.colSpan }}×{{ item.rowSpan }} · #{{ item.id }}
            </span>
          </div>

          <!-- Delete -->
          <button
            class="absolute top-2 right-12 w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-500 hover:text-white hover:border-red-500 z-10"
            title="Hapus gambar" @click.stop="handleDeleteImage(item, $event)">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>

          <!-- Resize toggle -->
          <button
            class="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-[#c8ff00] hover:text-black hover:border-[#c8ff00] z-10"
            :class="{ 'bg-[#c8ff00] !text-black !border-[#c8ff00] !opacity-100': resizingItem?.id === item.id }"
            title="Ubah ukuran" @click.stop="openResize(item, $event)">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </button>
        </div>
      </div>
    </main>

    <!-- ✅ Resize Panel — Teleport + position:fixed + koordinat viewport murni -->
    <Teleport to="body">
      <!-- Backdrop tipis untuk close on outside click -->
      <div v-if="resizingItem" class="fixed inset-0 z-[9990]" @click="resizingItem = null" />

      <!-- Panel -->
      <div v-if="resizingItem" ref="resizePanelEl"
        class="resize-panel fixed z-[9999] bg-[#111]/95 backdrop-blur-md border border-white/15 rounded-xl p-3 shadow-2xl w-44"
        :style="{
          top: panelPos.top + 'px',
          left: panelPos.left + 'px',
        }" @click.stop>
        <!-- Arrow indicator arah panel -->
        <div class="absolute w-2 h-2 bg-[#111] border-l border-t border-white/15 rotate-45" :style="panelPos.placement === 'below'
          ? 'top: -5px; right: 14px; border-bottom: none; border-right: none;'
          : 'bottom: -5px; right: 14px; border-top: none; border-left: none; transform: rotate(225deg);'" />

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
          @click="applyResize(resizingItem, resizingItem!.colSpan, resizingItem!.rowSpan)">Terapkan</button>
      </div>
    </Teleport>

    <!-- Lightbox -->
    <Teleport to="body">
      <div v-if="selectedItem"
        class="lightbox-bg fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
        @click="closeLightbox">
        <div class="lightbox-img relative" @click.stop>
          <img :src="selectedItem.src" :alt="selectedItem.alt" class="rounded-2xl shadow-2xl block"
            style="max-width: min(90vw, 1200px); max-height: 85vh; width: auto; height: auto; object-fit: contain;" />
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