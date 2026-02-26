<template>
  <BaseModal :model-value="modelValue" title="New Order" size="2xl" @update:model-value="$emit('update:modelValue', $event)">

    <form @submit.prevent="handleSubmit" class="space-y-6">

      <!-- ── Currency + Shipping row ───────────────────────────── -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Currency -->
        <div>
          <label class="block text-xs text-gray-400 mb-1.5">Currency</label>
          <select
            v-model="form.currency"
            class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500/60"
          >
            <option v-for="c in CURRENCIES" :key="c.code" :value="c.code">
              {{ c.symbol }} {{ c.code }} — {{ c.name }}
            </option>
          </select>
        </div>

        <!-- Payment method -->
        <div>
          <label class="block text-xs text-gray-400 mb-1.5">Payment Method</label>
          <select
            v-model="form.paymentMethod"
            class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500/60"
          >
            <option value="qr_code">QR Code</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="credit_card">Credit Card</option>
            <option value="cash">Cash on Delivery</option>
          </select>
        </div>
      </div>

      <!-- ── Line Items ─────────────────────────────────────────── -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="text-xs text-gray-400">Items</label>
          <button
            type="button"
            class="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            @click="addItem"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add item
          </button>
        </div>

        <!-- Header row -->
        <div class="grid grid-cols-[1fr_100px_56px_80px_28px] gap-2 px-1 mb-1">
          <span class="text-[11px] text-gray-500">Description</span>
          <span class="text-[11px] text-gray-500 text-right">Unit price</span>
          <span class="text-[11px] text-gray-500 text-center">Qty</span>
          <span class="text-[11px] text-gray-500 text-right">Total</span>
          <span></span>
        </div>

        <div class="space-y-2">
          <div
            v-for="(item, idx) in form.items"
            :key="item._key"
            class="grid grid-cols-[1fr_100px_56px_80px_28px] gap-2 items-center"
          >
            <!-- Description -->
            <input
              v-model="item.name"
              type="text"
              required
              placeholder="Item description"
              class="px-2.5 py-1.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 w-full"
            />

            <!-- Unit price -->
            <div class="relative">
              <span class="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs pointer-events-none">
                {{ currencySymbol }}
              </span>
              <input
                v-model.number="item.price"
                type="number"
                required
                min="0.01"
                step="0.01"
                class="w-full pl-5 pr-2 py-1.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm text-right focus:outline-none focus:border-indigo-500/60"
              />
            </div>

            <!-- Quantity -->
            <input
              v-model.number="item.quantity"
              type="number"
              required
              min="1"
              step="1"
              class="px-2 py-1.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm text-center focus:outline-none focus:border-indigo-500/60 w-full"
            />

            <!-- Row total -->
            <span class="text-sm text-gray-300 text-right tabular-nums">
              {{ formatAmt(item.price * item.quantity) }}
            </span>

            <!-- Remove -->
            <button
              v-if="form.items.length > 1"
              type="button"
              class="w-6 h-6 flex items-center justify-center rounded text-gray-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              @click="removeItem(idx)"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <span v-else></span>
          </div>
        </div>

        <!-- Subtotal -->
        <div class="flex justify-between items-center mt-3 pt-3 border-t border-slate-700/50">
          <span class="text-sm text-gray-400">Total</span>
          <span class="text-lg font-bold text-white tabular-nums">
            {{ currencySymbol }}{{ formatAmt(orderTotal) }}
            <span class="text-sm font-normal text-gray-500 ml-1">{{ form.currency }}</span>
          </span>
        </div>
      </div>

      <!-- ── Shipping address ────────────────────────────────────── -->
      <div>
        <label class="block text-xs text-gray-400 mb-1.5">Shipping Address</label>
        <input
          v-model="form.shippingAddress"
          type="text"
          required
          placeholder="Enter shipping address"
          class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/60"
        />
      </div>

      <!-- ── Notes ──────────────────────────────────────────────── -->
      <div>
        <label class="block text-xs text-gray-400 mb-1.5">Notes <span class="text-gray-600">(optional)</span></label>
        <input
          v-model="form.notes"
          type="text"
          placeholder="Special instructions, handling notes…"
          class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/60"
        />
      </div>

    </form>

    <!-- Footer -->
    <template #footer>
      <div class="flex items-center justify-between">
        <button
          type="button"
          class="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-slate-700/60 rounded-lg transition-colors"
          @click="$emit('update:modelValue', false)"
        >
          Cancel
        </button>
        <BaseButton :disabled="isCreating || !isValid" @click="handleSubmit">
          <svg
            v-if="isCreating"
            class="w-4 h-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Place Order — {{ currencySymbol }}{{ formatAmt(orderTotal) }} {{ form.currency }}
        </BaseButton>
      </div>
    </template>

  </BaseModal>
</template>

<script setup lang="ts">
import type { CreateOrderInput, SupportedCurrency } from '~/types'

const props = defineProps<{
  modelValue: boolean
  vendorId: string
  isCreating: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'submit', data: CreateOrderInput): void
}>()

// ── Currency config ───────────────────────────────────────────────────────────

const CURRENCIES = [
  { code: 'USD', symbol: '$',  name: 'US Dollar' },
  { code: 'EUR', symbol: '€',  name: 'Euro' },
  { code: 'GBP', symbol: '£',  name: 'British Pound' },
  { code: 'THB', symbol: '฿',  name: 'Thai Baht' },
  { code: 'JPY', symbol: '¥',  name: 'Japanese Yen' },
] as const

// ── Sample items ─────────────────────────────────────────────────────────────
// Pre-filled so the user can place a test order immediately

function makeSampleItems() {
  return [
    { _key: crypto.randomUUID(), productId: crypto.randomUUID(), name: 'MacBook Pro 14-inch M3 Pro', price: 1999.00, quantity: 1 },
    { _key: crypto.randomUUID(), productId: crypto.randomUUID(), name: 'AirPods Pro (2nd Gen)',       price:  249.00, quantity: 1 },
  ]
}

// ── Form state ────────────────────────────────────────────────────────────────

interface FormItem {
  _key: string
  productId: string
  name: string
  price: number
  quantity: number
}

interface FormState {
  currency: SupportedCurrency
  paymentMethod: string
  shippingAddress: string
  notes: string
  items: FormItem[]
}

const form = reactive<FormState>({
  currency: 'USD',
  paymentMethod: 'qr_code',
  shippingAddress: '123 Main Street, San Francisco, CA 94102, USA',
  notes: 'Please handle with care',
  items: makeSampleItems(),
})

// Reset sample data whenever the modal opens
watch(() => props.modelValue, (open) => {
  if (open) {
    form.currency = 'USD'
    form.paymentMethod = 'qr_code'
    form.shippingAddress = '123 Main Street, San Francisco, CA 94102, USA'
    form.notes = 'Please handle with care'
    form.items = makeSampleItems()
  }
})

// ── Derived ───────────────────────────────────────────────────────────────────

const currencySymbol = computed(() =>
  CURRENCIES.find(c => c.code === form.currency)?.symbol ?? '$',
)

const orderTotal = computed(() =>
  form.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
)

const isValid = computed(() =>
  form.items.length > 0 &&
  form.items.every(i => i.name.trim() && i.price > 0 && i.quantity >= 1) &&
  form.shippingAddress.trim().length > 0,
)

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatAmt(n: number) {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0)
}

function addItem() {
  form.items.push({
    _key: crypto.randomUUID(),
    productId: crypto.randomUUID(),
    name: '',
    price: 0,
    quantity: 1,
  })
}

function removeItem(idx: number) {
  form.items.splice(idx, 1)
}

// ── Submit ────────────────────────────────────────────────────────────────────

function handleSubmit() {
  if (!isValid.value) return
  const payload: CreateOrderInput = {
    vendorId: props.vendorId,
    currency: form.currency,
    paymentMethod: form.paymentMethod,
    shippingAddress: form.shippingAddress,
    notes: form.notes || undefined,
    items: form.items.map(({ _key: _k, ...rest }) => rest),
  }
  emit('submit', payload)
}
</script>
