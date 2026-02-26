<template>
  <div class="space-y-6">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">Orders & Payments</h1>
        <p class="text-gray-400 mt-1">Manage your orders and pay with QR code</p>
      </div>
      <div class="flex items-center gap-3">
        <!-- Live indicator -->
        <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Live
        </div>
        <!-- Quick Demo -->
        <button
          :disabled="isCreatingSample"
          class="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10 transition-colors disabled:opacity-50"
          @click="handleQuickDemo"
        >
          <svg v-if="isCreatingSample" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span v-else>⚡</span>
          Quick Demo
        </button>
        <BaseButton @click="showCreateForm = true">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Order
        </BaseButton>
      </div>
    </div>

    <!-- Loading skeleton -->
    <template v-if="isLoading">
      <BaseCard v-for="i in 4" :key="i" class="animate-pulse">
        <div class="flex items-center justify-between">
          <div class="space-y-2">
            <div class="h-4 w-40 bg-slate-700/60 rounded"></div>
            <div class="h-3 w-24 bg-slate-700/40 rounded"></div>
          </div>
          <div class="h-8 w-24 bg-slate-700/40 rounded-lg"></div>
        </div>
      </BaseCard>
    </template>

    <!-- Empty state -->
    <div v-else-if="!orders.length" class="flex flex-col items-center justify-center py-20 space-y-4">
      <div class="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-3xl">🛒</div>
      <div class="text-center">
        <p class="text-white font-medium">No orders yet</p>
        <p class="text-gray-500 text-sm mt-1">Place your first order to get started with QR payments</p>
      </div>
      <div class="flex items-center gap-3">
        <button
          :disabled="isCreatingSample"
          class="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10 transition-colors disabled:opacity-50"
          @click="handleQuickDemo"
        >
          <svg v-if="isCreatingSample" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span v-else>⚡</span>
          Quick Demo
        </button>
        <BaseButton @click="showCreateForm = true">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Place First Order
        </BaseButton>
      </div>
    </div>

    <!-- Orders list -->
    <template v-else>
      <div class="space-y-3">
        <BaseCard
          v-for="order in orders"
          :key="order._id"
          class="transition-all duration-200 hover:border-slate-600/50"
        >
          <div class="flex flex-col sm:flex-row sm:items-center gap-4">

            <!-- Left: order info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs font-mono text-gray-500">{{ shortId(order._id) }}</span>
                <OrderStatusBadge :status="order.status" />
              </div>
              <p class="text-white font-medium mt-1 truncate">
                {{ order.items.length }} item{{ order.items.length !== 1 ? 's' : '' }}
                <span class="text-gray-500 text-sm font-normal ml-1">
                  ({{ order.items.map(i => i.name).join(', ') }})
                </span>
              </p>
              <div class="flex items-center gap-4 mt-1.5 text-xs text-gray-500">
                <span>{{ formatDate(order.createdAt) }}</span>
                <span v-if="order.paymentMethod" class="capitalize">{{ order.paymentMethod.replace('_', ' ') }}</span>
              </div>
            </div>

            <!-- Right: amount + actions -->
            <div class="flex items-center gap-3 sm:flex-shrink-0">
              <span class="text-lg font-bold text-white">
                ${{ formatAmount(order.totalAmount) }}
              </span>

              <template v-if="order.status === 'pending'">
                <BaseButton
                  :disabled="isGenerating && activeOrderId === order._id"
                  @click="openQr(order._id)"
                >
                  <svg
                    v-if="isGenerating && activeOrderId === order._id"
                    class="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  Pay with QR
                </BaseButton>

                <button
                  class="px-3 py-1.5 text-xs text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  @click="handleCancel(order._id)"
                >
                  Cancel
                </button>
              </template>

              <span v-else-if="order.status === 'confirmed'" class="flex items-center gap-1.5 text-sm text-emerald-400 font-medium">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
                Paid
              </span>
            </div>
          </div>

          <!-- Items breakdown (collapsed) -->
          <details class="mt-3 group">
            <summary class="text-xs text-gray-500 cursor-pointer hover:text-gray-300 transition-colors list-none flex items-center gap-1">
              <svg class="w-3 h-3 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              {{ order.items.length }} item{{ order.items.length !== 1 ? 's' : '' }}
            </summary>
            <div class="mt-2 space-y-1 pl-4 border-l border-slate-700/50">
              <div
                v-for="item in order.items"
                :key="item.productId"
                class="flex justify-between text-xs text-gray-400"
              >
                <span>{{ item.name }} × {{ item.quantity }}</span>
                <span>${{ formatAmount(item.price * item.quantity) }}</span>
              </div>
            </div>
          </details>
        </BaseCard>
      </div>

      <!-- Pagination hint -->
      <p v-if="total > orders.length" class="text-center text-xs text-gray-600">
        Showing {{ orders.length }} of {{ total }} orders
      </p>
    </template>

    <!-- QR Modal -->
    <QrModal
      v-if="activeQr"
      :model-value="showModal"
      :qr="activeQr"
      :status="qrStatus"
      :seconds-left="secondsLeft"
      @close="handleModalClose"
      @regenerate="handleRegenerate"
      @paid="handleSimulatedPaid"
    />

    <!-- Create Order Form -->
    <CreateOrderForm
      v-model="showCreateForm"
      :vendor-id="user?.id ?? ''"
      :is-creating="isCreating"
      @submit="handleCreateOrder"
    />

  </div>
</template>

<script setup lang="ts">
import type { CreateOrderInput } from '~/types'

definePageMeta({ middleware: 'auth' })

const { user } = useAuth()

const {
  orders,
  total,
  isLoading,
  isCreating,
  loadOrders,
  createOrder,
  cancelOrder,
  isCreatingSample,
  createSampleOrder,
  activeQr,
  activeOrderId,
  qrStatus,
  isGenerating,
  secondsLeft,
  generateQr,
  closeQrModal,
  setupRealtime,
  teardownRealtime,
} = usePayments()

const showModal = ref(false)
const showCreateForm = ref(false)

async function handleCreateOrder(data: CreateOrderInput) {
  const created = await createOrder(data)
  if (created) showCreateForm.value = false
}

async function handleQuickDemo() {
  const result = await createSampleOrder()
  if (result) showModal.value = true
}

async function openQr(orderId: string) {
  await generateQr(orderId)
  if (activeQr.value) showModal.value = true
}

function handleModalClose() {
  showModal.value = false
  closeQrModal()
}

function handleSimulatedPaid() {
  if (activeOrderId.value) {
    const idx = orders.value.findIndex(o => o._id === activeOrderId.value)
    if (idx !== -1) orders.value[idx]!.status = 'confirmed'
  }
  showModal.value = false
  closeQrModal()
}

async function handleRegenerate() {
  if (!activeOrderId.value) return
  const orderId = activeOrderId.value
  closeQrModal()
  await generateQr(orderId)
  if (activeQr.value) showModal.value = true
}

async function handleCancel(orderId: string) {
  await cancelOrder(orderId)
}

function shortId(id: string) {
  return `#${id.slice(-6).toUpperCase()}`
}

function formatAmount(n: number) {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

onMounted(() => {
  loadOrders()
  setupRealtime()
})

onUnmounted(() => {
  teardownRealtime()
})
</script>
