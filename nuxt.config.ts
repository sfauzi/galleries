// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  nitro: {
    // preset: "static"
    preset: 'node-server'
  },
  modules: [
    '@nuxt/fonts',
    '@nuxt/image',
    '@nuxtjs/google-fonts',
    '@nuxtjs/tailwindcss'
  ],
  googleFonts: {
    families: {
      Manrope: true,
      Mansalva: true,
      Rubik: true,
    },
  },
})