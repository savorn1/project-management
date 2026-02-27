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
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000',
      // Shared with payment gateway — used only by the Simulate Payment button.
      // In production the real gateway sends this key server-side; the frontend
      // should not know it. Set NUXT_PUBLIC_PAYMENT_GATEWAY_KEY in .env.
      paymentGatewayKey: process.env.NUXT_PUBLIC_PAYMENT_GATEWAY_KEY || 'dev-gateway-key',
    }
  }
})
