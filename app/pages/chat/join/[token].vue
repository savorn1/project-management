<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-950">
    <div class="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col items-center gap-5 text-center">
      <!-- Icon -->
      <div class="w-14 h-14 rounded-2xl bg-indigo-500/15 flex items-center justify-center">
        <svg class="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
        </svg>
      </div>

      <template v-if="loading">
        <div class="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin" />
        <p class="text-sm text-gray-400">Joining conversation…</p>
      </template>

      <template v-else-if="error">
        <h2 class="text-base font-semibold text-white">Invalid invite link</h2>
        <p class="text-sm text-gray-400">{{ error }}</p>
        <button
          class="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
          @click="navigateTo('/chat')"
        >
          Go to Chat
        </button>
      </template>

      <template v-else-if="alreadyMember && conversation">
        <h2 class="text-base font-semibold text-white">Already a member</h2>
        <p class="text-sm text-gray-400">
          You're already in <span class="text-white font-medium">{{ conversation.name ?? 'this group' }}</span>.
        </p>
        <button
          class="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
          @click="navigateTo('/chat')"
        >
          Open Chat
        </button>
      </template>

      <template v-else-if="conversation">
        <h2 class="text-base font-semibold text-white">You're in!</h2>
        <p class="text-sm text-gray-400">
          You joined <span class="text-white font-medium">{{ conversation.name ?? 'the group' }}</span>.
        </p>
        <button
          class="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
          @click="navigateTo('/chat')"
        >
          Open Chat
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Conversation } from '~/types'

definePageMeta({ layout: false })

const route = useRoute()
const { chatApi } = useApi()
const { isAuthenticated, initAuth } = useAuth()

const loading = ref(true)
const error = ref('')
const conversation = ref<Conversation | null>(null)
const alreadyMember = ref(false)

onMounted(async () => {
  const token = route.params.token as string
  initAuth()
  if (!isAuthenticated.value) {
    await navigateTo(`/login?redirect=/chat/join/${token}`)
    return
  }
  const result = await chatApi.joinViaInvite(token)
  loading.value = false
  if (result) {
    alreadyMember.value = result.alreadyMember
    conversation.value = result.conversation
  } else {
    error.value = 'This invite link is invalid or has expired.'
  }
})
</script>
