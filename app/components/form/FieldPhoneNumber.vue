<template>
  <FieldWrapper :label="label" :hint="hint" :error="error" :required="required" :input-id="uid" :tooltip="tooltip">
    <div
      class="flex items-center bg-slate-700 border rounded-lg transition-colors overflow-hidden"
      :class="[
        error    ? 'border-rose-500'   : 'border-slate-600 hover:border-slate-500 focus-within:border-indigo-500',
        disabled ? 'opacity-50'        : '',
      ]"
    >
      <!-- Country code selector -->
      <div class="relative flex-shrink-0" ref="dialRef">
        <button
          type="button"
          class="flex items-center gap-1.5 pl-3 pr-2 py-2 text-sm text-gray-200 hover:bg-slate-600 transition-colors border-r border-slate-600 h-full"
          :disabled="disabled"
          @click="dialOpen = !dialOpen"
        >
          <span class="text-base leading-none">{{ selectedCountry.flag }}</span>
          <span class="text-gray-400 tabular-nums">+{{ selectedCountry.dial }}</span>
          <svg class="w-3 h-3 text-gray-500 transition-transform" :class="{ 'rotate-180': dialOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <Teleport to="body">
          <div v-if="dialOpen" class="fixed inset-0" style="z-index:99998;" @click="dialOpen = false" />
          <div
            v-if="dialOpen"
            class="fixed bg-slate-800 border border-slate-700/60 rounded-xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col"
            style="z-index:99999; width:260px;"
            :style="dialPanelStyle"
            @click.stop
          >
            <div class="p-2 border-b border-slate-700/60">
              <input
                v-model="countrySearch"
                type="text"
                placeholder="Search country…"
                class="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                @click.stop
              />
            </div>
            <ul class="overflow-y-auto max-h-52 py-1">
              <li
                v-for="c in filteredCountries"
                :key="c.code"
                class="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer transition-colors"
                :class="c.code === countryCode ? 'bg-indigo-600/20 text-indigo-300' : 'text-gray-200 hover:bg-slate-700'"
                @click="selectCountry(c)"
              >
                <span class="text-base leading-none">{{ c.flag }}</span>
                <span class="flex-1">{{ c.name }}</span>
                <span class="text-gray-500 tabular-nums text-xs">+{{ c.dial }}</span>
              </li>
            </ul>
          </div>
        </Teleport>
      </div>

      <!-- Number input -->
      <input
        :id="uid"
        :value="localNumber"
        type="tel"
        :placeholder="placeholder"
        :disabled="disabled"
        class="flex-1 min-w-0 bg-transparent pl-3 pr-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none tabular-nums"
        @input="onInput"
      />
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
export interface PhoneValue {
  countryCode: string
  dialCode: string
  number: string
  /** E.164 format e.g. "+15551234567" */
  e164: string
}

interface Country { code: string; name: string; dial: string; flag: string }

const COUNTRIES: Country[] = [
  { code: 'KH', name: 'Cambodia',           dial: '855', flag: '🇰🇭' },
  { code: 'US', name: 'United States',       dial: '1',   flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom',      dial: '44',  flag: '🇬🇧' },
  { code: 'AU', name: 'Australia',           dial: '61',  flag: '🇦🇺' },
  { code: 'CA', name: 'Canada',              dial: '1',   flag: '🇨🇦' },
  { code: 'CN', name: 'China',               dial: '86',  flag: '🇨🇳' },
  { code: 'JP', name: 'Japan',               dial: '81',  flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea',         dial: '82',  flag: '🇰🇷' },
  { code: 'TH', name: 'Thailand',            dial: '66',  flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnam',             dial: '84',  flag: '🇻🇳' },
  { code: 'SG', name: 'Singapore',           dial: '65',  flag: '🇸🇬' },
  { code: 'MY', name: 'Malaysia',            dial: '60',  flag: '🇲🇾' },
  { code: 'ID', name: 'Indonesia',           dial: '62',  flag: '🇮🇩' },
  { code: 'PH', name: 'Philippines',         dial: '63',  flag: '🇵🇭' },
  { code: 'IN', name: 'India',               dial: '91',  flag: '🇮🇳' },
  { code: 'FR', name: 'France',              dial: '33',  flag: '🇫🇷' },
  { code: 'DE', name: 'Germany',             dial: '49',  flag: '🇩🇪' },
  { code: 'IT', name: 'Italy',               dial: '39',  flag: '🇮🇹' },
  { code: 'ES', name: 'Spain',               dial: '34',  flag: '🇪🇸' },
  { code: 'BR', name: 'Brazil',              dial: '55',  flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico',              dial: '52',  flag: '🇲🇽' },
  { code: 'ZA', name: 'South Africa',        dial: '27',  flag: '🇿🇦' },
  { code: 'NG', name: 'Nigeria',             dial: '234', flag: '🇳🇬' },
  { code: 'AE', name: 'UAE',                 dial: '971', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia',        dial: '966', flag: '🇸🇦' },
]

interface Props {
  modelValue: PhoneValue | null
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
  tooltip?: string
  /** Default country code (ISO 3166-1 alpha-2) */
  defaultCountry?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  placeholder: '012 345 678',
  defaultCountry: 'KH',
})

const emit = defineEmits<{
  'update:modelValue': [value: PhoneValue | null]
}>()

const _autoId = useId()
const uid = computed(() => _autoId)

const dialRef = ref<HTMLElement | null>(null)
const dialOpen = ref(false)
const dialPanelStyle = ref<Record<string, string>>({})
const countrySearch = ref('')

const countryCode = ref(props.modelValue?.countryCode ?? props.defaultCountry)
const localNumber = ref(props.modelValue?.number ?? '')

const selectedCountry = computed(() =>
  COUNTRIES.find(c => c.code === countryCode.value) ?? COUNTRIES[0]!
)

const filteredCountries = computed(() => {
  const q = countrySearch.value.toLowerCase()
  return q
    ? COUNTRIES.filter(c => c.name.toLowerCase().includes(q) || c.dial.includes(q))
    : COUNTRIES
})

watch(dialOpen, (open) => {
  if (open && dialRef.value) {
    countrySearch.value = ''
    const rect = dialRef.value.getBoundingClientRect()
    let top = rect.bottom + 4
    if (top + 280 > window.innerHeight - 8) top = rect.top - 284
    dialPanelStyle.value = { top: `${top}px`, left: `${rect.left}px` }
  }
})

watch(() => props.modelValue, (val) => {
  if (!val) { localNumber.value = ''; return }
  countryCode.value = val.countryCode
  localNumber.value = val.number
})

function selectCountry(c: Country) {
  countryCode.value = c.code
  dialOpen.value = false
  emitValue()
}

function onInput(e: Event) {
  localNumber.value = (e.target as HTMLInputElement).value.replace(/[^\d\s\-().+]/g, '')
  emitValue()
}

function emitValue() {
  const num = localNumber.value.trim()
  if (!num) { emit('update:modelValue', null); return }
  const c = selectedCountry.value
  emit('update:modelValue', {
    countryCode: c.code,
    dialCode: c.dial,
    number: num,
    e164: `+${c.dial}${num.replace(/\D/g, '')}`,
  })
}
</script>
