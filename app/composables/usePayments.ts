import type {
  CreateOrderInput,
  Order,
  PaymentConfirmedEvent,
  PaymentQrResult,
  PaymentQrStatus,
  SampleOrderResult,
} from '~/types'

export function usePayments() {
  const { ordersApi, paymentsApi } = useApi()
  const { on, off, joinRoom, leaveRoom } = useSocket()
  const { user } = useAuth()
  const toast = useToast()

  // ── Orders state ─────────────────────────────────────────────────────────────
  const orders = ref<Order[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const isCreating = ref(false)

  // ── Active QR modal state ─────────────────────────────────────────────────────
  const activeQr = ref<PaymentQrResult | null>(null)
  const activeOrderId = ref<string | null>(null)
  const qrStatus = ref<PaymentQrStatus>('pending')
  const isGenerating = ref(false)

  // ── Countdown ─────────────────────────────────────────────────────────────────
  const secondsLeft = ref(0)
  let countdownTimer: ReturnType<typeof setInterval> | null = null

  // ── Orders ────────────────────────────────────────────────────────────────────

  async function loadOrders(skip = 0, limit = 20) {
    isLoading.value = true
    try {
      const result = await ordersApi.getAll(skip, limit)
      orders.value = result.data
      total.value = result.total
    } finally {
      isLoading.value = false
    }
  }

  async function createOrder(input: CreateOrderInput): Promise<Order | null> {
    isCreating.value = true
    try {
      const created = await ordersApi.create(input)
      if (created) {
        orders.value.unshift(created)
        total.value++
        toast.success('Order created successfully')
      }
      return created
    } finally {
      isCreating.value = false
    }
  }

  async function cancelOrder(orderId: string): Promise<boolean> {
    const updated = await ordersApi.cancel(orderId)
    if (updated) {
      const idx = orders.value.findIndex(o => o._id === orderId)
      if (idx !== -1) orders.value[idx] = updated
      toast.success('Order cancelled')
      return true
    }
    return false
  }

  // ── Sample order (Quick Demo) ─────────────────────────────────────────────────

  const isCreatingSample = ref(false)

  async function createSampleOrder(): Promise<SampleOrderResult | null> {
    isCreatingSample.value = true
    try {
      const result = await paymentsApi.createSampleOrder()
      if (!result) return null

      orders.value.unshift(result.order)
      total.value++

      // Open QR modal immediately
      activeQr.value = { qrId: result.qrId, qrImage: result.qrImage, expiresAt: result.expiresAt, amount: result.amount }
      activeOrderId.value = String(result.order._id)
      qrStatus.value = 'pending'
      startCountdown(result.expiresAt)

      toast.success('Demo order created — scan the QR to complete payment')
      return result
    } finally {
      isCreatingSample.value = false
    }
  }

  // ── QR ────────────────────────────────────────────────────────────────────────

  async function generateQr(orderId: string) {
    isGenerating.value = true
    try {
      const order = orders.value.find(o => o._id === orderId)
      const currency = (order?.metadata?.currency as string) || 'USD'
      const result = await paymentsApi.generateQr(orderId, currency)
      if (!result) return

      activeQr.value = result
      activeOrderId.value = orderId
      qrStatus.value = 'pending'
      startCountdown(result.expiresAt)
    } finally {
      isGenerating.value = false
    }
  }

  function closeQrModal() {
    stopCountdown()
    activeQr.value = null
    activeOrderId.value = null
    qrStatus.value = 'pending'
  }

  function startCountdown(expiresAt: string) {
    stopCountdown()
    function tick() {
      const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
      secondsLeft.value = diff
      if (diff === 0 && qrStatus.value === 'pending') {
        qrStatus.value = 'expired'
        stopCountdown()
      }
    }
    tick()
    countdownTimer = setInterval(tick, 1000)
  }

  function stopCountdown() {
    if (countdownTimer !== null) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }

  // ── WebSocket ─────────────────────────────────────────────────────────────────

  function handlePaymentConfirmed(data: PaymentConfirmedEvent) {
    if (data.orderId !== activeOrderId.value) return

    stopCountdown()
    qrStatus.value = 'paid'

    const idx = orders.value.findIndex(o => o._id === data.orderId)
    if (idx !== -1) orders.value[idx].status = 'confirmed'

    toast.success(`Payment confirmed — ${data.amount} ${data.currency}`)
  }

  function handlePaymentExpired(data: { qrId: string; orderId: string }) {
    // Only act if this expiry matches the QR currently shown
    if (data.orderId !== activeOrderId.value) return

    stopCountdown()
    qrStatus.value = 'expired'
    secondsLeft.value = 0

    toast.error('QR code expired — generate a new one to continue')
  }

  function setupRealtime() {
    if (!user.value?.id) return
    joinRoom(`user:${user.value.id}`)
    on<PaymentConfirmedEvent>('payment:confirmed', handlePaymentConfirmed)
    on<{ qrId: string; orderId: string }>('payment:expired', handlePaymentExpired)
  }

  function teardownRealtime() {
    if (!user.value?.id) return
    off('payment:confirmed', handlePaymentConfirmed)
    off('payment:expired', handlePaymentExpired)
    leaveRoom(`user:${user.value.id}`)
    stopCountdown()
  }

  return {
    // orders
    orders,
    total,
    isLoading,
    isCreating,
    loadOrders,
    createOrder,
    cancelOrder,
    // sample / demo
    isCreatingSample,
    createSampleOrder,
    // qr modal
    activeQr,
    activeOrderId,
    qrStatus,
    isGenerating,
    secondsLeft,
    generateQr,
    closeQrModal,
    // realtime
    setupRealtime,
    teardownRealtime,
  }
}
