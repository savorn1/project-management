<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm"
        style="z-index: 9998;"
        @click="$emit('close')"
      />
    </Transition>

    <!-- Panel -->
    <Transition name="slide-up">
      <div
        v-if="modelValue"
        class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm"
        style="z-index: 9999;"
        @click.stop
      >
        <div class="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">

          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <div class="flex items-center gap-2">
              <span class="text-lg">💳</span>
              <span class="font-semibold text-white">Pay with QR</span>
            </div>
            <button
              class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-slate-700/60 transition-colors"
              @click="$emit('close')"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="p-5 space-y-4">

            <!-- ── PENDING state ────────────────────────────────────── -->
            <template v-if="status === 'pending'">
              <!-- Amount -->
              <div class="text-center">
                <p class="text-3xl font-bold text-white tracking-tight">
                  {{ formatAmount(qr.amount) }}
                  <span class="text-lg font-medium text-gray-400">USD</span>
                </p>
                <p class="text-xs text-gray-500 mt-1">Click the QR to inspect payload · Scan to pay</p>
              </div>

              <!-- QR image — clickable -->
              <div class="flex justify-center">
                <button
                  class="p-3 bg-white rounded-2xl shadow-lg relative group transition-all hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  :class="isScanning ? 'opacity-60 cursor-wait' : 'cursor-zoom-in'"
                  :title="isScanning ? 'Decoding…' : 'Click to inspect QR payload'"
                  @click="handleScanClick"
                >
                  <img
                    :src="qr.qrImage"
                    alt="Payment QR Code"
                    class="w-52 h-52 object-contain"
                  />
                  <!-- overlay hint -->
                  <span
                    class="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/0 group-hover:bg-black/10 transition-colors"
                  >
                    <span class="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium text-slate-700 bg-white/90 px-2 py-0.5 rounded-full shadow">
                      🔍 Inspect
                    </span>
                  </span>
                  <!-- spinner -->
                  <span v-if="isScanning" class="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/80">
                    <svg class="w-8 h-8 text-indigo-500 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </span>
                </button>
              </div>

              <!-- ── Decoded payload panel ──────────────────────────── -->
              <Transition name="expand">
                <div v-if="decoded" class="rounded-xl border border-slate-700/50 bg-slate-800/60 overflow-hidden">

                  <!-- Panel header -->
                  <div class="flex items-center justify-between px-4 py-2.5 border-b border-slate-700/50 bg-slate-800">
                    <span class="text-xs font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      QR Payload
                    </span>
                    <button class="text-gray-500 hover:text-gray-300 transition-colors" @click="decoded = null">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <!-- Fields -->
                  <div class="px-4 py-3 space-y-2">
                    <PayloadRow label="QR ID"     :value="decoded.qrId" mono />
                    <PayloadRow label="Order ID"  :value="decoded.orderId" mono />
                    <PayloadRow label="Amount"    :value="`${formatAmount(decoded.amount)} ${decoded.currency}`" />
                    <PayloadRow label="Nonce"     :value="decoded.nonce" mono truncate />
                    <PayloadRow label="Signature" :value="decoded.signature" mono truncate />
                    <PayloadRow label="Issued"    :value="formatTs(decoded.issuedAt)" />
                    <PayloadRow label="Expires"   :value="formatTs(decoded.expiresAt)" :warn="decoded.expiresAt < Date.now()" />
                  </div>

                  <!-- Simulate payment -->
                  <div class="px-4 pb-3">
                    <button
                      :disabled="isSimulating || decoded.expiresAt < Date.now()"
                      class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40
                             bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                      @click="simulatePayment"
                    >
                      <svg v-if="isSimulating" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {{ decoded.expiresAt < Date.now() ? 'QR Expired' : isSimulating ? 'Processing…' : 'Simulate Payment' }}
                    </button>
                  </div>
                </div>
              </Transition>

              <!-- Countdown -->
              <div class="flex items-center justify-center gap-2">
                <svg class="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-sm" :class="secondsLeft < 60 ? 'text-rose-400 font-medium' : 'text-gray-400'">
                  Expires in {{ formatCountdown(secondsLeft) }}
                </span>
              </div>

              <!-- Progress bar -->
              <div class="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-1000"
                  :class="secondsLeft < 60 ? 'bg-rose-500' : 'bg-indigo-500'"
                  :style="{ width: `${countdownPercent}%` }"
                />
              </div>

              <!-- Instructions -->
              <ol class="space-y-1.5 text-xs text-gray-500">
                <li class="flex items-start gap-2">
                  <span class="w-4 h-4 rounded-full bg-slate-700 text-gray-300 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px]">1</span>
                  Open your banking app or payment wallet
                </li>
                <li class="flex items-start gap-2">
                  <span class="w-4 h-4 rounded-full bg-slate-700 text-gray-300 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px]">2</span>
                  Scan the QR code above — or click it to inspect & simulate
                </li>
                <li class="flex items-start gap-2">
                  <span class="w-4 h-4 rounded-full bg-slate-700 text-gray-300 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px]">3</span>
                  Confirm the payment — this page updates automatically
                </li>
              </ol>
            </template>

            <!-- ── PAID state ───────────────────────────────────────── -->
            <template v-else-if="status === 'paid'">
              <div class="py-6 text-center space-y-3">
                <div class="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto">
                  <svg class="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p class="text-xl font-bold text-white">Payment Successful</p>
                  <p class="text-sm text-gray-400 mt-1">Your order has been confirmed</p>
                </div>
                <p class="text-2xl font-bold text-emerald-400">{{ formatAmount(qr.amount) }} USD</p>
                <BaseButton class="w-full" @click="$emit('close')">Done</BaseButton>
              </div>
            </template>

            <!-- ── EXPIRED state ────────────────────────────────────── -->
            <template v-else-if="status === 'expired'">
              <div class="py-6 text-center space-y-3">
                <div class="w-16 h-16 rounded-full bg-amber-500/15 flex items-center justify-center mx-auto">
                  <svg class="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p class="text-xl font-bold text-white">QR Code Expired</p>
                  <p class="text-sm text-gray-400 mt-1">Generate a new QR to continue</p>
                </div>
                <BaseButton class="w-full" @click="$emit('regenerate')">Generate New QR</BaseButton>
              </div>
            </template>

          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import jsQR from 'jsqr'
import type { PaymentQrResult, PaymentQrStatus } from '~/types'

interface QrPayload {
  qrId: string
  orderId: string
  clientId: string
  amount: number
  currency: string
  nonce: string
  expiresAt: number
  issuedAt: number
  signature: string
}

const props = defineProps<{
  modelValue: boolean
  qr: PaymentQrResult
  status: PaymentQrStatus
  secondsLeft: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'regenerate'): void
  (e: 'paid'): void
}>()

const { paymentsApi } = useApi()
const toast = useToast()

const totalSeconds = 10 * 60

const countdownPercent = computed(() =>
  Math.round((props.secondsLeft / totalSeconds) * 100),
)

// ── Scan state ────────────────────────────────────────────────────────────────

const isScanning = ref(false)
const decoded = ref<QrPayload | null>(null)
const isSimulating = ref(false)

// Reset decoded panel whenever the QR changes (new order / regenerate)
watch(() => props.qr.qrId, () => { decoded.value = null })

async function handleScanClick() {
  if (isScanning.value) return
  isScanning.value = true
  decoded.value = null

  try {
    const payload = await decodeQrImage(props.qr.qrImage)
    decoded.value = payload
  } catch (err) {
    toast.error('Could not decode QR — ' + String(err))
  } finally {
    isScanning.value = false
  }
}

/**
 * Loads the base64 QR image onto a canvas, reads the pixel data,
 * passes it to jsQR to extract the embedded JSON string, then parses it.
 */
async function decodeQrImage(dataUrl: string): Promise<QrPayload> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas 2D context unavailable'))

      ctx.drawImage(img, 0, 0)
      const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const result = jsQR(data, width, height, { inversionAttempts: 'dontInvert' })
      if (!result) return reject(new Error('No QR code detected in image'))

      try {
        resolve(JSON.parse(result.data) as QrPayload)
      } catch {
        reject(new Error('QR data is not valid JSON'))
      }
    }
    img.onerror = () => reject(new Error('Failed to load QR image'))
    img.src = dataUrl
  })
}

// ── Simulate payment ──────────────────────────────────────────────────────────

async function simulatePayment() {
  if (!decoded.value || isSimulating.value) return
  isSimulating.value = true
  try {
    const result = await paymentsApi.verify({
      qrId: decoded.value.qrId,
      nonce: decoded.value.nonce,
      amount: decoded.value.amount,
      signature: decoded.value.signature,
    })
    if (result?.success) {
      decoded.value = null
      emit('paid')
      toast.success('Payment simulated successfully — order confirmed!')
    }
  } finally {
    isSimulating.value = false
  }
}

// ── Formatters ────────────────────────────────────────────────────────────────

function formatCountdown(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
}

function formatTs(ms: number): string {
  return new Date(ms).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}
</script>

<!-- Sub-component: single payload row -->
<script lang="ts">
const PayloadRow = defineComponent({
  props: {
    label:    { type: String, required: true },
    value:    { type: String, required: true },
    mono:     { type: Boolean, default: false },
    truncate: { type: Boolean, default: false },
    warn:     { type: Boolean, default: false },
  },
  template: `
    <div class="flex items-start justify-between gap-3 text-xs">
      <span class="text-gray-500 flex-shrink-0 w-20">{{ label }}</span>
      <span
        :class="[
          truncate ? 'truncate max-w-[160px]' : '',
          mono ? 'font-mono' : '',
          warn ? 'text-rose-400' : 'text-gray-200',
        ]"
        :title="value"
      >{{ value }}</span>
    </div>
  `,
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translate(-50%, calc(-50% + 16px));
}

.expand-enter-active,
.expand-leave-active {
  transition: opacity 0.2s ease, max-height 0.25s ease;
  max-height: 400px;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
