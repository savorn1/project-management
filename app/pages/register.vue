<template>
  <div class="flex rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-slate-700/40 min-h-[600px]">

    <!-- ── Left branding panel ─────────────────────────────────────────────── -->
    <div class="hidden md:flex flex-col w-[40%] bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-10 relative overflow-hidden">
      <!-- Decorative circles -->
      <div class="absolute -top-16 -left-16 w-64 h-64 bg-white/5 rounded-full"></div>
      <div class="absolute -bottom-20 -right-20 w-72 h-72 bg-white/5 rounded-full"></div>
      <div class="absolute top-1/2 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>

      <!-- Logo -->
      <div class="relative z-10 flex items-center gap-3">
        <div class="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center border border-white/25">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <span class="text-white font-bold text-xl tracking-tight">HTP</span>
      </div>

      <!-- Center content -->
      <div class="relative z-10 flex-1 flex flex-col justify-center py-8">
        <div class="mb-8">
          <div class="w-16 h-16 bg-white/15 border border-white/25 rounded-2xl flex items-center justify-center mb-5">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 class="text-white text-2xl font-bold leading-tight mb-3">Join HTP Today</h2>
          <p class="text-indigo-200/80 text-sm leading-relaxed">Create your account and start collaborating with your team in minutes.</p>
        </div>

        <!-- Step indicators -->
        <div class="space-y-4">
          <div class="flex items-start gap-3">
            <div class="w-7 h-7 rounded-full bg-white/20 border border-white/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span class="text-white text-xs font-bold">1</span>
            </div>
            <div>
              <p class="text-white text-sm font-medium">Create your profile</p>
              <p class="text-indigo-200/70 text-xs mt-0.5">Set up your personal details</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-7 h-7 rounded-full bg-white/20 border border-white/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span class="text-white text-xs font-bold">2</span>
            </div>
            <div>
              <p class="text-white text-sm font-medium">Join your workspace</p>
              <p class="text-indigo-200/70 text-xs mt-0.5">Connect with your team</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-7 h-7 rounded-full bg-white/20 border border-white/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span class="text-white text-xs font-bold">3</span>
            </div>
            <div>
              <p class="text-white text-sm font-medium">Start managing projects</p>
              <p class="text-indigo-200/70 text-xs mt-0.5">Track tasks and collaborate</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom tagline -->
      <div class="relative z-10">
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <div class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
            </div>
            <span class="text-indigo-100/80 text-xs">Free to get started</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
            </div>
            <span class="text-indigo-100/80 text-xs">No credit card required</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Right form panel ────────────────────────────────────────────────── -->
    <div class="flex-1 flex flex-col justify-center bg-slate-900 px-8 py-10 md:px-10 overflow-y-auto">

      <!-- Mobile logo -->
      <div class="flex items-center gap-2.5 mb-6 md:hidden">
        <div class="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <span class="text-white font-bold text-lg">HTP</span>
      </div>

      <!-- Heading -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-white mb-1">Create account</h1>
        <p class="text-slate-400 text-sm">Fill in your details to get started</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleRegister" class="space-y-4">

        <!-- Error alert -->
        <div v-if="authError" class="flex items-center gap-3 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl">
          <svg class="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-red-400 text-sm">{{ authError }}</p>
        </div>

        <!-- First Name + Last Name -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label for="firstName" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">First Name</label>
            <input
              id="firstName"
              v-model="form.firstName"
              type="text"
              required
              autocomplete="given-name"
              placeholder="John"
              class="w-full px-3.5 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label for="lastName" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Last Name</label>
            <input
              id="lastName"
              v-model="form.lastName"
              type="text"
              required
              autocomplete="family-name"
              placeholder="Doe"
              class="w-full px-3.5 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <!-- Username -->
        <div>
          <label for="name" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Username</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              autocomplete="username"
              placeholder="johndoe"
              class="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <!-- Email -->
        <div>
          <label for="email" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              autocomplete="email"
              placeholder="you@example.com"
              class="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <!-- Password -->
        <div>
          <label for="password" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              required
              minlength="6"
              autocomplete="new-password"
              placeholder="Min. 6 characters"
              class="w-full pl-10 pr-10 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
            >
              <svg v-if="showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Confirm Password -->
        <div>
          <label for="confirmPassword" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Confirm Password</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              required
              autocomplete="new-password"
              placeholder="Repeat your password"
              class="w-full pl-10 pr-4 py-3 bg-slate-800 border rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              :class="confirmPassword && form.password !== confirmPassword ? 'border-red-500/60' : 'border-slate-700'"
            />
          </div>
          <p v-if="confirmPassword && form.password !== confirmPassword" class="mt-1.5 text-xs text-red-400">
            Passwords do not match
          </p>
        </div>

        <!-- Submit -->
        <button
          type="submit"
          :disabled="isLoading || !isFormValid"
          class="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/25 mt-2"
        >
          <span v-if="isLoading" class="flex items-center justify-center gap-2">
            <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating account…
          </span>
          <span v-else>Create Account</span>
        </button>
      </form>

      <!-- Login link -->
      <p class="mt-6 text-center text-xs text-slate-500">
        Already have an account?
        <NuxtLink to="/login" class="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
          Sign in
        </NuxtLink>
      </p>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const router = useRouter()
const { register, isLoading, authError } = useAuth()

const form = reactive({
  firstName: '',
  lastName: '',
  name: '',
  email: '',
  password: '',
})

const confirmPassword = ref('')
const showPassword = ref(false)

const isFormValid = computed(() =>
  form.firstName &&
  form.lastName &&
  form.name &&
  form.email &&
  form.password.length >= 6 &&
  form.password === confirmPassword.value,
)

const handleRegister = async () => {
  if (!isFormValid.value) return
  const success = await register({
    firstName: form.firstName,
    lastName: form.lastName,
    name: form.name,
    email: form.email,
    password: form.password,
  })
  if (success) router.push('/')
}
</script>
