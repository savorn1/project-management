// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,
  devtools: { enabled: true },
  devServer: {
    port: Number(process.env.NUXT_PORT) || 3002,
  },
  modules: ['@nuxtjs/tailwindcss'],
  components: {
    dirs: [
      { path: '~/components', pathPrefix: false }
    ]
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000'
    }
  }
})
