<template>
  <div class="flex gap-0 -m-6 min-h-[calc(100vh-4rem)]">

    <!-- ─── Left nav ─────────────────────────────────────────────── -->
    <aside class="w-64 flex-shrink-0 bg-slate-900/60 border-r border-slate-800/60 flex flex-col sticky top-0 h-[calc(100vh-4rem)]">
      <!-- Header -->
      <div class="px-4 pt-5 pb-3 border-b border-slate-800/60 flex-shrink-0">
        <h2 class="text-xs font-semibold text-gray-500 uppercase tracking-widest">Form Components</h2>
        <p class="text-xs text-gray-600 mt-0.5">{{ totalComponents }} components</p>
        <!-- Search -->
        <div class="relative mt-3">
          <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="navSearch"
            type="text"
            placeholder="Search components..."
            class="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button v-if="navSearch" type="button" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300" @click="navSearch = ''">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      <!-- Nav list -->
      <nav class="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        <template v-for="group in filteredGroups" :key="group.label">
          <div v-if="group.items.length > 0">
            <p class="px-2 mb-1 text-[10px] font-semibold text-gray-600 uppercase tracking-widest">{{ group.label }}</p>
            <ul class="space-y-0.5">
              <li v-for="item in group.items" :key="item.id">
                <button
                  type="button"
                  class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all text-left"
                  :class="active === item.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-gray-400 hover:text-white hover:bg-slate-800'"
                  @click="active = item.id"
                >
                  <span class="text-base leading-none flex-shrink-0">{{ item.icon }}</span>
                  <span class="flex-1 truncate font-medium">{{ item.label }}</span>
                  <span v-if="item.isNew" class="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">new</span>
                </button>
              </li>
            </ul>
          </div>
        </template>
        <p v-if="filteredGroups.every(g => g.items.length === 0)" class="text-center text-xs text-gray-600 py-4">No results for "{{ navSearch }}"</p>
      </nav>
    </aside>

    <!-- ─── Main content ──────────────────────────────────────────── -->
    <div class="flex-1 min-w-0 overflow-y-auto">
      <div class="max-w-5xl mx-auto px-8 py-6 space-y-6">

        <!-- ── Page header ── -->
        <div>
          <div class="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <span>Form Components</span>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            <span class="text-gray-400">{{ activeGroup?.label }}</span>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            <span class="text-indigo-400 font-medium">{{ activeItem?.label }}</span>
          </div>
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="flex items-center gap-3 mb-1">
                <h1 class="text-2xl font-bold text-white font-mono">{{ activeItem?.label }}</h1>
                <span v-if="activeItem?.isNew" class="text-xs font-semibold px-2 py-0.5 bg-emerald-500/15 text-emerald-400 rounded-full border border-emerald-500/25">new</span>
              </div>
              <p class="text-gray-400 text-sm leading-relaxed">{{ activeItem?.description }}</p>
            </div>
            <!-- State toggles -->
            <div class="flex items-center gap-2 flex-shrink-0 pt-1">
              <button
                type="button"
                :class="['flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all', forceDisabled ? 'bg-amber-500/15 border-amber-500/40 text-amber-400' : 'bg-slate-800 border-slate-700 text-gray-400 hover:text-white hover:border-slate-600']"
                @click="forceDisabled = !forceDisabled"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                Disabled
              </button>
              <button
                type="button"
                :class="['flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all', forceError ? 'bg-rose-500/15 border-rose-500/40 text-rose-400' : 'bg-slate-800 border-slate-700 text-gray-400 hover:text-white hover:border-slate-600']"
                @click="forceError = !forceError"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Error state
              </button>
            </div>
          </div>
        </div>

        <!-- ── Preview + Inspector ── -->
        <div class="grid gap-5 lg:grid-cols-5">
          <!-- Preview -->
          <div class="lg:col-span-3 bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
            <div class="flex items-center justify-between px-5 py-3 border-b border-slate-700/50">
              <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Preview</span>
              <div class="flex items-center gap-2">
                <span v-if="forceDisabled" class="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">disabled</span>
                <span v-if="forceError" class="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">error</span>
                <button type="button" class="text-xs text-gray-500 hover:text-gray-300 transition-colors" @click="resetActive">Reset</button>
              </div>
            </div>
            <div class="p-6">
              <!-- ── text ── -->
              <div v-if="active === 'text'" class="space-y-4">
                <FieldText v-model="vals.text" label="Full name" placeholder="John Doe" :disabled="forceDisabled" :error="forceError ? 'This field is required' : ''" hint="Plain text input" />
                <FieldText v-model="vals.text_prefix" label="Website" placeholder="example.com" prefix="https://" :disabled="forceDisabled" :error="forceError ? 'Enter a valid URL' : ''" />
                <FieldText v-model="vals.text_counter" label="Username" placeholder="max 20 chars" :maxlength="20" :show-counter="true" :disabled="forceDisabled" :error="forceError ? 'Username is taken' : ''" />
                <!-- rules / custom validation -->
                <FieldText
                  v-model="vals.text_rules"
                  label="Username (rules)"
                  placeholder="3–16 lowercase letters/numbers"
                  :disabled="forceDisabled"
                  :rules="[
                    v => !!v || 'Required',
                    v => v.length >= 3 || 'Minimum 3 characters',
                    v => v.length <= 16 || 'Maximum 16 characters',
                    v => /^[a-z0-9_]+$/.test(v) || 'Lowercase letters, numbers and _ only',
                  ]"
                  hint="Blur to trigger — rules run on each blur then live as you type"
                />
                <FieldText
                  v-model="vals.text_rules2"
                  label="Promo code (validate-on-input)"
                  placeholder="SAVE10"
                  validate-on="input"
                  :disabled="forceDisabled"
                  :rules="[
                    v => !!v || 'Enter a promo code',
                    v => v.length === 6 || 'Must be exactly 6 characters',
                    v => /^[A-Z0-9]+$/.test(v) || 'Uppercase letters and digits only',
                  ]"
                  hint="validate-on=&quot;input&quot; — validates on every keystroke"
                />
              </div>
              <!-- ── slug ── -->
              <div v-else-if="active === 'slug'" class="space-y-4">
                <FieldText v-model="vals.slug_source" label="Post title (source)" placeholder="My Awesome Blog Post" :disabled="forceDisabled" hint="Type here — slug auto-updates" />
                <FieldSlug v-model="vals.slug" :source-value="vals.slug_source" label="Slug" base-url="https://example.com/posts/" :disabled="forceDisabled" :error="forceError ? 'Slug already in use' : ''" hint="🔒 Lock icon toggles manual edit" />
              </div>
              <!-- ── email ── -->
              <FieldEmail v-else-if="active === 'email'" v-model="vals.email" label="Email address" :disabled="forceDisabled" :error="forceError ? 'Email already registered' : ''" hint="Validates on blur" />
              <!-- ── textarea ── -->
              <div v-else-if="active === 'textarea'" class="space-y-4">
                <FieldTextarea v-model="vals.textarea" label="Bio" placeholder="Tell us about yourself…" :rows="4" :maxlength="300" :show-counter="true" :disabled="forceDisabled" :error="forceError ? 'Bio is required' : ''" />
                <FieldTextarea v-model="vals.textarea_auto" label="Notes (auto-resize)" placeholder="Grows as you type…" :auto-resize="true" :disabled="forceDisabled" hint="Height expands automatically" />
              </div>
              <!-- ── number ── -->
              <div v-else-if="active === 'number'" class="space-y-4">
                <FieldNumber v-model="vals.number" label="Quantity" :min="0" :max="999" :step="1" :disabled="forceDisabled" :error="forceError ? 'Must be between 0 and 999' : ''" hint="↑ ↓ keys also work" />
                <FieldNumber v-model="vals.number_suffix" label="Age" :min="0" :max="150" suffix="yrs" :disabled="forceDisabled" />
              </div>
              <!-- ── float ── -->
              <div v-else-if="active === 'float'" class="space-y-4">
                <FieldFloat v-model="vals.float" label="Price" prefix="$" :min="0" :step="0.01" :decimals="2" :disabled="forceDisabled" :error="forceError ? 'Price cannot be negative' : ''" hint="Rounds to 2 decimals on blur" />
                <FieldFloat v-model="vals.float_rating" label="Rating" :min="0" :max="5" :step="0.5" :decimals="1" suffix="/ 5" :disabled="forceDisabled" />
              </div>
              <!-- ── checkbox ── -->
              <div v-else-if="active === 'checkbox'" class="space-y-5">
                <FieldCheckbox v-model="vals.checkbox_single" label="Accept terms and conditions" description="You agree to our Terms of Service and Privacy Policy" :disabled="forceDisabled" :error="forceError ? 'You must accept the terms' : ''" />
                <FieldCheckbox v-model:group-value="vals.checkbox_group" :options="checkboxOptions" label="Preferred contact methods" :disabled="forceDisabled" hint="Select all that apply" :error="forceError ? 'Select at least one method' : ''" />
              </div>
              <!-- ── select2 ── -->
              <FieldSelect2 v-else-if="active === 'select2'" v-model="vals.select2" :options="colorOptions" label="Favourite color" hint="Pick one from the list" :disabled="forceDisabled" :error="forceError ? 'Please select a color' : ''" />
              <!-- ── select2_from_array ── -->
              <FieldSelect2FromArray v-else-if="active === 'select2_from_array'" v-model="vals.select2_from_array" :options="['Apple', 'Banana', 'Cherry', 'Durian', 'Elderberry']" label="Favourite fruit" :disabled="forceDisabled" :error="forceError ? 'Required' : ''" />
              <!-- ── select2_multiple ── -->
              <FieldSelect2Multiple v-else-if="active === 'select2_multiple'" v-model="vals.select2_multiple" :options="techOptions" label="Tech stack" hint="Select all that apply" :disabled="forceDisabled" :error="forceError ? 'Select at least one' : ''" />
              <!-- ── select2_grouped ── -->
              <FieldSelect2Grouped v-else-if="active === 'select2_grouped'" v-model="vals.select2_grouped" :options="groupedOptions" label="Choose a city" :disabled="forceDisabled" :error="forceError ? 'Required' : ''" />
              <!-- ── select2_nested ── -->
              <FieldSelect2Nested v-else-if="active === 'select2_nested'" v-model="vals.select2_nested" :options="nestedOptions" label="Department" :disabled="forceDisabled" :error="forceError ? 'Required' : ''" />
              <!-- ── select2_from_ajax ── -->
              <FieldSelect2FromAjax v-else-if="active === 'select2_from_ajax'" v-model="vals.select2_from_ajax" :fetch-fn="fakeAjaxFetch" label="Search user" placeholder="Type a name…" :min-chars="2" :disabled="forceDisabled" :error="forceError ? 'Required' : ''" />
              <!-- ── select2_from_ajax_multiple ── -->
              <FieldSelect2FromAjaxMultiple v-else-if="active === 'select2_from_ajax_multiple'" v-model="vals.select2_from_ajax_multiple" :fetch-fn="fakeAjaxFetch" label="Assign to" :min-chars="2" :disabled="forceDisabled" :error="forceError ? 'Required' : ''" />
              <!-- ── select_and_order ── -->
              <FieldSelectAndOrder v-else-if="active === 'select_and_order'" v-model="vals.select_and_order" :options="techOptions" label="Ordered stack" hint="Select and reorder priority" :disabled="forceDisabled" :error="forceError ? 'Required' : ''" />
              <!-- ── date_picker ── -->
              <FieldDatePicker v-else-if="active === 'date_picker'" v-model="vals.date_picker" label="Due date" hint="Click to open calendar" :disabled="forceDisabled" :error="forceError ? 'Date is required' : ''" />
              <!-- ── date_range ── -->
              <FieldDateRange v-else-if="active === 'date_range'" v-model="vals.date_range" label="Date range" :disabled="forceDisabled" :error="forceError ? 'Invalid range' : ''" />
              <!-- ── datetime_picker ── -->
              <FieldDatetimePicker v-else-if="active === 'datetime_picker'" v-model="vals.datetime_picker" label="Scheduled at" :disabled="forceDisabled" :error="forceError ? 'Required' : ''" />
              <!-- ── browse ── -->
              <FieldBrowse v-else-if="active === 'browse'" v-model="vals.browse" label="Attachment" :max-size="5 * 1024 * 1024" hint="Max 5 MB" :disabled="forceDisabled" :error="forceError ? 'File is required' : ''" />
              <!-- ── browse_multiple ── -->
              <FieldBrowseMultiple v-else-if="active === 'browse_multiple'" v-model="vals.browse_multiple" label="Attachments" :max-files="5" :max-size="10 * 1024 * 1024" hint="Up to 5 files" :disabled="forceDisabled" :error="forceError ? 'Required' : ''" />
              <!-- ── image ── -->
              <FieldImage v-else-if="active === 'image'" v-model="vals.image" label="Cover photo" :height="180" :disabled="forceDisabled" :error="forceError ? 'Image required' : ''" />
              <!-- ── base64_image ── -->
              <FieldBase64Image v-else-if="active === 'base64_image'" v-model="vals.base64_image" label="Avatar (base64)" :height="160" :disabled="forceDisabled" :error="forceError ? 'Required' : ''" />
              <!-- ── video ── -->
              <FieldVideo v-else-if="active === 'video'" v-model="vals.video" label="Demo video" :max-size="100 * 1024 * 1024" hint="Max 100 MB" :disabled="forceDisabled" :error="forceError ? 'Required' : ''" />
              <!-- ── wysiwyg ── -->
              <FieldWysiwyg v-else-if="active === 'wysiwyg'" v-model="vals.wysiwyg" label="Description" placeholder="Write something…" :error="forceError ? 'Content required' : ''" />
              <!-- ── ckeditor ── -->
              <FieldCkeditor v-else-if="active === 'ckeditor'" v-model="vals.ckeditor" label="Content (CKEditor style)" :error="forceError ? 'Content required' : ''" />
              <!-- ── tinymce ── -->
              <FieldTinymce v-else-if="active === 'tinymce'" v-model="vals.tinymce" label="Content (TinyMCE style)" :min-height="200" :error="forceError ? 'Content required' : ''" />
              <!-- ── easymde ── -->
              <FieldEasymde v-else-if="active === 'easymde'" v-model="vals.easymde" label="Markdown content" placeholder="# Heading&#10;&#10;Write **markdown** here…" :disabled="forceDisabled" :error="forceError ? 'Content required' : ''" />
              <!-- ── address_google ── -->
              <FieldAddressGoogle v-else-if="active === 'address_google'" v-model="vals.address_google" label="Location" hint="Pass api-key prop for live Google results" :disabled="forceDisabled" :error="forceError ? 'Address required' : ''" />
              <!-- ── icon_picker ── -->
              <FieldIconPicker v-else-if="active === 'icon_picker'" v-model="vals.icon_picker" label="Icon" hint="Choose from Heroicons" :disabled="forceDisabled" :error="forceError ? 'Icon required' : ''" />
              <!-- ── relationship ── -->
              <div v-else-if="active === 'relationship'" class="space-y-4">
                <FieldRelationship v-model="vals.relationship_single" :fetch-fn="fakeRelFetch" label="Assigned to (single)" :min-chars="1" :disabled="forceDisabled" :error="forceError ? 'Required' : ''" />
                <FieldRelationship v-model="vals.relationship_multiple" :fetch-fn="fakeRelFetch" :multiple="true" label="Reviewers (multiple)" :min-chars="1" :disabled="forceDisabled" />
              </div>
              <!-- ── repeatable ── -->
              <FieldRepeatable v-else-if="active === 'repeatable'" v-model="vals.repeatable" :new-row="() => ({ name: '', role: '' })" label="Team members" add-label="Add member" :disabled="forceDisabled" :error="forceError ? 'At least one member required' : ''">
                <template #default="{ row, update }">
                  <div class="grid grid-cols-2 gap-3">
                    <FieldText :model-value="String(row['name'] ?? '')" label="Name" placeholder="Full name" @update:model-value="update('name', $event)" />
                    <FieldText :model-value="String(row['role'] ?? '')" label="Role" placeholder="Job title" @update:model-value="update('role', $event)" />
                  </div>
                </template>
              </FieldRepeatable>
              <!-- ── table ── -->
              <FieldTable v-else-if="active === 'table'" v-model="vals.table" :columns="tableColumns" label="Line items" :disabled="forceDisabled" :error="forceError ? 'Table required' : ''" />
              <!-- ── tag_input ── -->
              <div v-else-if="active === 'tag_input'" class="space-y-4">
                <FieldTagInput v-model="vals.tag_input" label="Topics" placeholder="Add a topic…" :suggestions="tagSuggestions" hint="Press Enter or comma to add" :disabled="forceDisabled" :error="forceError ? 'At least one topic required' : ''" />
                <FieldTagInput v-model="vals.tag_input2" label="Skills (max 5)" :max-tags="5" :commit-on-blur="true" :disabled="forceDisabled" hint="Blur also commits the typed value" />
              </div>
              <!-- ── color_picker ── -->
              <div v-else-if="active === 'color_picker'" class="space-y-4">
                <FieldColorPicker v-model="vals.color_picker" label="Brand color" :presets="colorPresets" :disabled="forceDisabled" :error="forceError ? 'Color is required' : ''" hint="Click swatch or type hex" />
                <FieldColorPicker v-model="vals.color_picker2" label="Accent (no presets)" :disabled="forceDisabled" />
              </div>
              <!-- ── range ── -->
              <div v-else-if="active === 'range'" class="space-y-6">
                <FieldRange v-model="vals.range_single" label="Volume" :min="0" :max="100" :step="1" unit="%" :disabled="forceDisabled" :error="forceError ? 'Required' : ''" hint="Single thumb" />
                <FieldRange v-model="vals.range_dual" label="Price range" :min="0" :max="1000" :step="10" unit="$" :range="true" :disabled="forceDisabled" :error="forceError ? 'Required' : ''" hint="Dual thumb" />
              </div>
              <!-- ── otp ── -->
              <div v-else-if="active === 'otp'" class="space-y-6">
                <FieldOtp v-model="vals.otp" label="Verification code" hint="Paste or type your 6-digit code" :disabled="forceDisabled" :error="forceError ? 'Invalid code' : ''" />
                <FieldOtp v-model="vals.otp4" label="PIN" :length="4" :group-size="4" :disabled="forceDisabled" hint="4-digit PIN — no separator" />
              </div>
              <!-- ── rating ── -->
              <div v-else-if="active === 'rating'" class="space-y-5">
                <FieldRating v-model="vals.rating" label="Overall rating" :show-value="true" :disabled="forceDisabled" :error="forceError ? 'Please rate this item' : ''" />
                <FieldRating v-model="vals.rating_half" label="Precision rating" :allow-half="false" size="lg" color="rose" :show-value="true" :disabled="forceDisabled" hint="size=lg, color=rose" />
              </div>
              <!-- ── radio ── -->
              <FieldRadio v-else-if="active === 'radio'" v-model="vals.radio" :options="radioOptions" label="Preferred plan" :disabled="forceDisabled" :error="forceError ? 'Please select a plan' : ''" hint="Single selection only" />
              <!-- ── switch ── -->
              <div v-else-if="active === 'switch'" class="space-y-4">
                <FieldSwitch v-model="vals.switch_basic" label="Enable notifications" description="Receive alerts when something changes" :disabled="forceDisabled" :error="forceError ? 'Required' : ''" />
                <FieldSwitch v-model="vals.switch_sm" label="Compact mode" size="sm" color="emerald" :disabled="forceDisabled" />
                <FieldSwitch v-model="vals.switch_lg" label="Dark mode" size="lg" color="sky" :disabled="forceDisabled" />
              </div>
              <!-- ── password ── -->
              <div v-else-if="active === 'password'" class="space-y-4">
                <FieldPassword v-model="vals.password" label="Password" placeholder="Enter password" autocomplete="new-password" :show-strength="true" :disabled="forceDisabled" :error="forceError ? 'Password is too weak' : ''" hint="Click the eye icon to reveal" />
                <FieldPassword v-model="vals.password_confirm" label="Confirm password" placeholder="Repeat password" autocomplete="new-password" :disabled="forceDisabled" :error="forceError ? 'Passwords do not match' : ''" />
              </div>
              <!-- ── boolean ── -->
              <div v-else-if="active === 'boolean'" class="space-y-4">
                <FieldBoolean v-model="vals.boolean" label="Active status" true-hint="User can log in" false-hint="Account suspended" :disabled="forceDisabled" :error="forceError ? 'Required' : ''" />
                <FieldBoolean v-model="vals.boolean2" label="Email verified" true-label="Verified" false-label="Unverified" :disabled="forceDisabled" />
              </div>
              <!-- ── url ── -->
              <div v-else-if="active === 'url'" class="space-y-4">
                <FieldUrl v-model="vals.url" label="Website" placeholder="https://example.com" :disabled="forceDisabled" :error="forceError ? 'Invalid URL' : ''" hint="Validates format on blur; click ↗ to open" />
                <FieldUrl v-model="vals.url_repo" label="Repository" placeholder="https://github.com/user/repo" :disabled="forceDisabled" />
              </div>
              <!-- ── hidden ── -->
              <div v-else-if="active === 'hidden'" class="space-y-4">
                <div class="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 text-sm text-gray-400 text-center">
                  <svg class="w-8 h-8 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" /></svg>
                  <p class="font-medium text-gray-300 mb-1">Renders invisibly in the DOM</p>
                  <p class="text-xs">The value below is tracked — check the inspector →</p>
                </div>
                <FieldHidden v-model="vals.hidden" name="csrf_token" />
                <FieldText v-model="vals.hidden" label="Bound source (edit to update hidden value)" placeholder="Type something…" hint="The FieldHidden below reflects this value" :disabled="forceDisabled" />
              </div>
              <!-- ── enum ── -->
              <div v-else-if="active === 'enum'" class="space-y-4">
                <FieldEnum v-model="vals.enum" :options="enumOptions" label="Status" :disabled="forceDisabled" :error="forceError ? 'Status is required' : ''" hint="Record<value, label> options" />
                <FieldEnum v-model="vals.enum2" :options="['low', 'medium', 'high', 'critical']" label="Priority" :disabled="forceDisabled" hint="Plain string array" />
              </div>
              <!-- ── month ── -->
              <div v-else-if="active === 'month'" class="space-y-4">
                <FieldMonth v-model="vals.month" label="Report month" :disabled="forceDisabled" :error="forceError ? 'Month is required' : ''" hint="Returns YYYY-MM" />
                <FieldMonth v-model="vals.month2" label="Contract start" :clearable="false" :disabled="forceDisabled" />
              </div>
              <!-- ── week ── -->
              <div v-else-if="active === 'week'" class="space-y-4">
                <FieldWeek v-model="vals.week" label="Sprint week" :disabled="forceDisabled" :error="forceError ? 'Week is required' : ''" hint="Returns YYYY-Www" />
                <FieldWeek v-model="vals.week2" label="Delivery window" :disabled="forceDisabled" />
              </div>
              <!-- ── json ── -->
              <div v-else-if="active === 'json'" class="space-y-4">
                <FieldJson v-model="vals.json" label="Configuration" :disabled="forceDisabled" :error="forceError ? 'Invalid JSON' : ''" hint="Click Format to pretty-print" />
              </div>
              <!-- ── checklist ── -->
              <div v-else-if="active === 'checklist'" class="space-y-4">
                <FieldChecklist v-model="vals.checklist" :options="checklistOptions" label="Required features" :disabled="forceDisabled" :error="forceError ? 'Select at least one feature' : ''" hint="Searchable list with select-all" />
              </div>
              <!-- ── checklist_dependency ── -->
              <div v-else-if="active === 'checklist_dependency'" class="space-y-4">
                <FieldChecklistDependency v-model="vals.checklist_dep" :options="depOptions" label="Permissions" :disabled="forceDisabled" :error="forceError ? 'Select at least one permission' : ''" hint="Checking a parent reveals its children" />
              </div>
              <!-- ── code ── -->
              <div v-else-if="active === 'code'" class="space-y-4">
                <FieldCode v-model="vals.code" v-model:language="vals.code_lang" label="Script" :disabled="forceDisabled" :error="forceError ? 'Code is required' : ''" hint="Tab inserts 2 spaces" />
              </div>
              <!-- ── time_picker ── -->
              <div v-else-if="active === 'time_picker'" class="space-y-4">
                <FieldTimePicker v-model="vals.time_picker" label="Meeting time" :disabled="forceDisabled" :error="forceError ? 'Time is required' : ''" hint="24-hour format, 5-min steps" />
                <FieldTimePicker v-model="vals.time_picker_12h" label="Reminder (12 h mode)" :use24h="false" :minute-step="15" :disabled="forceDisabled" hint="AM/PM mode, 15-min steps" />
              </div>
              <!-- ── phone_number ── -->
              <FieldPhoneNumber v-else-if="active === 'phone_number'" v-model="vals.phone" label="Phone number" :disabled="forceDisabled" :error="forceError ? 'Phone number is required' : ''" hint="Country dial code included" />
              <!-- ── currency ── -->
              <div v-else-if="active === 'currency'" class="space-y-4">
                <FieldCurrency v-model="vals.currency" label="Price (USD)" :min="0" :disabled="forceDisabled" :error="forceError ? 'Price is required' : ''" hint="USD · 2 decimal places" />
                <FieldCurrency v-model="vals.currency_eur" label="Amount (EUR)" currency="EUR" locale="de-DE" :min="0" :disabled="forceDisabled" hint="Euro · de-DE locale formatting" />
              </div>
            </div>
          </div>

          <!-- Value inspector -->
          <div class="lg:col-span-2 bg-slate-900/70 border border-slate-800/60 rounded-2xl flex flex-col overflow-hidden">
            <div class="flex items-center justify-between px-4 py-3 border-b border-slate-800/60 flex-shrink-0">
              <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">v-model value</span>
              <button type="button" class="text-xs text-indigo-400 hover:text-indigo-300 transition-colors" @click="copyValue">
                {{ valueCopied ? '✓ Copied' : 'Copy' }}
              </button>
            </div>
            <pre class="flex-1 overflow-auto text-xs text-emerald-400 font-mono p-4 whitespace-pre-wrap break-all leading-relaxed">{{ activeValueJson }}</pre>
          </div>
        </div>

        <!-- ── Tab bar ── -->
        <div class="border-b border-slate-800/60">
          <div class="flex gap-1">
            <button
              v-for="tab in activeTabs"
              :key="tab.id"
              type="button"
              class="px-4 py-2.5 text-sm font-medium border-b-2 transition-colors"
              :class="activeTab === tab.id
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-300'"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
              <span v-if="tab.count" class="ml-1.5 text-xs text-gray-600">({{ tab.count }})</span>
            </button>
          </div>
        </div>

        <!-- ── Props table ── -->
        <div v-if="activeTab === 'props'" class="overflow-x-auto rounded-xl border border-slate-800/60">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-800/80 text-left">
                <th class="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-36">Prop</th>
                <th class="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-40">Type</th>
                <th class="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-28">Default</th>
                <th class="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              <tr v-for="prop in activeItem?.props" :key="prop.name" class="hover:bg-slate-800/30 transition-colors">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <code class="text-indigo-300 font-mono text-xs">{{ prop.name }}</code>
                    <span v-if="prop.required" class="text-[9px] font-bold uppercase px-1 py-0.5 bg-rose-500/15 text-rose-400 rounded border border-rose-500/25">req</span>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <code class="text-amber-300 font-mono text-xs whitespace-nowrap">{{ prop.type }}</code>
                </td>
                <td class="px-4 py-3">
                  <code v-if="prop.default !== undefined" class="text-emerald-400 font-mono text-xs">{{ prop.default }}</code>
                  <span v-else class="text-gray-600 text-xs">—</span>
                </td>
                <td class="px-4 py-3 text-gray-300 text-xs leading-relaxed">{{ prop.description }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ── Emits table ── -->
        <div v-else-if="activeTab === 'emits'" class="overflow-x-auto rounded-xl border border-slate-800/60">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-800/80 text-left">
                <th class="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-48">Event</th>
                <th class="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-52">Payload</th>
                <th class="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              <tr v-for="emit in activeItem?.emits" :key="emit.name" class="hover:bg-slate-800/30 transition-colors">
                <td class="px-4 py-3"><code class="text-violet-300 font-mono text-xs">{{ emit.name }}</code></td>
                <td class="px-4 py-3"><code class="text-amber-300 font-mono text-xs">{{ emit.payload }}</code></td>
                <td class="px-4 py-3 text-gray-300 text-xs leading-relaxed">{{ emit.description }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ── Slots table ── -->
        <div v-else-if="activeTab === 'slots'" class="overflow-x-auto rounded-xl border border-slate-800/60">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-800/80 text-left">
                <th class="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-48">Slot</th>
                <th class="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-52">Scope</th>
                <th class="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              <tr v-for="slot in activeItem?.slots" :key="slot.name" class="hover:bg-slate-800/30 transition-colors">
                <td class="px-4 py-3"><code class="text-sky-300 font-mono text-xs">#{{ slot.name }}</code></td>
                <td class="px-4 py-3"><code class="text-amber-300 font-mono text-xs">{{ slot.scope ?? '—' }}</code></td>
                <td class="px-4 py-3 text-gray-300 text-xs leading-relaxed">{{ slot.description }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ── Notes ── -->
        <div v-else-if="activeTab === 'notes'" class="space-y-3">
          <div
            v-for="(note, i) in activeItem?.notes"
            :key="i"
            class="flex gap-3 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl"
          >
            <svg class="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-sm text-gray-300 leading-relaxed">{{ note }}</p>
          </div>
        </div>

        <!-- ── Usage ── -->
        <div v-if="activeTab === 'usage'" class="bg-slate-900/70 border border-slate-800/60 rounded-2xl overflow-hidden">
          <div class="flex items-center justify-between px-5 py-3 border-b border-slate-800/60">
            <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Usage</span>
            <button type="button" class="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors" @click="copyUsage">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              {{ usageCopied ? 'Copied!' : 'Copy' }}
            </button>
          </div>
          <pre class="text-xs text-indigo-300 font-mono p-5 overflow-x-auto whitespace-pre leading-relaxed">{{ activeItem?.usage }}</pre>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SelectOption } from '~/components/form/FieldSelect2.vue'
import type { AjaxOption } from '~/components/form/FieldSelect2FromAjax.vue'
import type { RelationshipItem } from '~/components/form/FieldRelationship.vue'
import type { TableColumn } from '~/components/form/FieldTable.vue'
import type { DateRangeValue } from '~/components/form/FieldDateRange.vue'

// ─── Types ───────────────────────────────────────────────────────────────────

interface PropDef {
  name: string
  type: string
  default?: string
  required?: boolean
  description: string
}
interface EmitDef { name: string; payload: string; description: string }
interface SlotDef { name: string; scope?: string; description: string }

interface NavItem {
  id: string
  label: string
  icon: string
  description: string
  usage: string
  props: PropDef[]
  emits?: EmitDef[]
  slots?: SlotDef[]
  notes?: string[]
  isNew?: boolean
}
interface NavGroup { label: string; items: NavItem[] }

// ─── Common prop sets ─────────────────────────────────────────────────────────

const COMMON: PropDef[] = [
  { name: 'label',    type: 'string',  description: 'Label text rendered above the input.' },
  { name: 'hint',     type: 'string',  description: 'Helper text shown below the input when there is no error.' },
  { name: 'error',    type: 'string',  description: 'Error message; replaces hint and adds red border when set.' },
  { name: 'required', type: 'boolean', default: 'false', description: 'Appends a red asterisk (*) to the label.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables all interaction and dims the field.' },
]

const COMMON_MODEL_EMIT = (type: string, desc = 'Emitted on every value change.'): EmitDef => ({
  name: 'update:modelValue', payload: type, description: desc,
})

// ─── Demo data ────────────────────────────────────────────────────────────────

const colorOptions: SelectOption[] = [
  { value: 'red', label: 'Red' }, { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' }, { value: 'purple', label: 'Purple' },
  { value: 'yellow', label: 'Yellow' }, { value: 'orange', label: 'Orange' },
]
const techOptions: SelectOption[] = [
  { value: 'vue', label: 'Vue.js' }, { value: 'nuxt', label: 'Nuxt' },
  { value: 'ts', label: 'TypeScript' }, { value: 'tailwind', label: 'Tailwind CSS' },
  { value: 'node', label: 'Node.js' }, { value: 'nestjs', label: 'NestJS' },
  { value: 'mongo', label: 'MongoDB' }, { value: 'redis', label: 'Redis' },
]
const groupedOptions = [
  { label: 'Asia', options: [{ value: 'pnh', label: 'Phnom Penh' }, { value: 'bkk', label: 'Bangkok' }, { value: 'hcm', label: 'Ho Chi Minh City' }] },
  { label: 'Europe', options: [{ value: 'par', label: 'Paris' }, { value: 'ber', label: 'Berlin' }, { value: 'lon', label: 'London' }] },
  { label: 'Americas', options: [{ value: 'nyc', label: 'New York' }, { value: 'sfo', label: 'San Francisco' }, { value: 'cdmx', label: 'Mexico City' }] },
]
const nestedOptions = [
  { value: 'engineering', label: 'Engineering', children: [
    { value: 'frontend', label: 'Frontend', children: [{ value: 'vue-team', label: 'Vue Team' }, { value: 'react-team', label: 'React Team' }] },
    { value: 'backend', label: 'Backend' }, { value: 'devops', label: 'DevOps' },
  ]},
  { value: 'product', label: 'Product', children: [{ value: 'design', label: 'Design' }, { value: 'pm', label: 'Project Management' }] },
  { value: 'hr', label: 'Human Resources' },
]
const FAKE_USERS = [
  { id: 1, label: 'Alice Johnson', description: 'Senior Developer' },
  { id: 2, label: 'Bob Smith', description: 'Product Manager' },
  { id: 3, label: 'Carol White', description: 'UI/UX Designer' },
  { id: 4, label: 'David Lee', description: 'DevOps Engineer' },
  { id: 5, label: 'Eva Martinez', description: 'QA Engineer' },
  { id: 6, label: 'Frank Chen', description: 'Backend Developer' },
]
const tagSuggestions = [
  'Vue.js', 'Nuxt', 'TypeScript', 'Tailwind CSS', 'Node.js', 'NestJS',
  'MongoDB', 'Redis', 'Docker', 'GraphQL', 'REST API', 'WebSocket',
]
const colorPresets = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#06b6d4',
]
const enumOptions: Record<string, string> = {
  active: 'Active',
  inactive: 'Inactive',
  draft: 'Draft',
  pending: 'Pending review',
  archived: 'Archived',
}

const checklistOptions = [
  { value: 'auth',      label: 'Authentication',    description: 'Login, register, password reset' },
  { value: 'rbac',      label: 'Role-based access',  description: 'Permissions & roles' },
  { value: 'api',       label: 'REST API',           description: 'CRUD endpoints' },
  { value: 'ws',        label: 'WebSockets',         description: 'Real-time events' },
  { value: 'storage',   label: 'File storage',       description: 'S3 / MinIO integration' },
  { value: 'queue',     label: 'Job queues',         description: 'BullMQ background jobs' },
  { value: 'cache',     label: 'Caching',            description: 'Redis layer' },
  { value: 'search',    label: 'Full-text search',   description: 'Elasticsearch / Meilisearch' },
]

const depOptions = [
  {
    value: 'users', label: 'Users', children: [
      { value: 'users.view',   label: 'View users' },
      { value: 'users.create', label: 'Create users' },
      { value: 'users.edit',   label: 'Edit users' },
      { value: 'users.delete', label: 'Delete users', description: 'Irreversible' },
    ],
  },
  {
    value: 'projects', label: 'Projects', children: [
      { value: 'projects.view',   label: 'View projects' },
      { value: 'projects.create', label: 'Create projects' },
      { value: 'projects.edit',   label: 'Edit projects' },
    ],
  },
  {
    value: 'reports', label: 'Reports', children: [
      { value: 'reports.view',   label: 'View reports' },
      { value: 'reports.export', label: 'Export reports' },
    ],
  },
  { value: 'settings', label: 'Settings (no sub-permissions)' },
]

const radioOptions = [
  { value: 'free',    label: 'Free',       description: 'Up to 3 projects, 1 GB storage' },
  { value: 'pro',     label: 'Pro',        description: 'Unlimited projects, 50 GB storage' },
  { value: 'team',    label: 'Team',       description: 'Everything in Pro + collaboration tools' },
  { value: 'enterprise', label: 'Enterprise', description: 'Custom limits, SLA & dedicated support', disabled: false },
]
const checkboxOptions = [
  { value: 'email', label: 'Email', description: 'Receive updates via email' },
  { value: 'sms', label: 'SMS', description: 'Text message notifications' },
  { value: 'push', label: 'Push notifications', description: 'In-app and browser push' },
  { value: 'slack', label: 'Slack', description: 'Via connected Slack workspace' },
]
const tableColumns: TableColumn[] = [
  { key: 'item', label: 'Item', type: 'text', placeholder: 'Item name' },
  { key: 'qty', label: 'Qty', type: 'number', placeholder: '0', width: '80px' },
  { key: 'unit', label: 'Unit', type: 'select', options: [{ value: 'pcs', label: 'pcs' }, { value: 'kg', label: 'kg' }, { value: 'hr', label: 'hr' }], width: '100px' },
  { key: 'price', label: 'Price ($)', type: 'number', placeholder: '0.00', width: '100px' },
  { key: 'taxable', label: 'Taxable', type: 'checkbox', width: '80px' },
]

async function fakeAjaxFetch(query: string): Promise<AjaxOption[]> {
  await new Promise(r => setTimeout(r, 350))
  const q = query.toLowerCase()
  return FAKE_USERS.filter(u => u.label.toLowerCase().includes(q)).map(u => ({ value: u.id, label: u.label }))
}
async function fakeRelFetch(query: string): Promise<RelationshipItem[]> {
  await new Promise(r => setTimeout(r, 350))
  const q = query.toLowerCase()
  return FAKE_USERS.filter(u => u.label.toLowerCase().includes(q) || u.description.toLowerCase().includes(q))
}

// ─── Nav groups ───────────────────────────────────────────────────────────────

const groups: NavGroup[] = [
  {
    label: 'Basic Inputs',
    items: [
      {
        id: 'text', icon: '🔤', label: 'text', isNew: true,
        description: 'Single-line text input with optional prefix/suffix slots, character counter, and custom rule-based validation.',
        usage: `<FieldText\n  v-model="value"\n  label="Username"\n  :rules="[\n    v => !!v || 'Required',\n    v => v.length >= 3 || 'Minimum 3 characters',\n    v => /^[a-z0-9_]+$/.test(v) || 'Lowercase letters, numbers and _ only',\n  ]"\n/>\n\n<!-- validate-on=input: validate every keystroke -->\n<FieldText v-model="code" validate-on="input" :rules="[v => v.length === 6 || '6 chars required']" />\n\n<!-- call validate() from a submit handler -->\n<FieldText ref="nameRef" v-model="name" :rules="[v => !!v || 'Required']" />\n<!-- in script: if (!nameRef.value.validate()) return -->`,
        props: [
          { name: 'modelValue', type: 'string', required: true, description: 'Bound string value (use v-model).' },
          { name: 'rules', type: '((v: string) => string | boolean | null)[]', description: 'Array of validator functions. Return true (or nothing) when valid, or an error string when invalid. The first failing message is shown.' },
          { name: 'validateOn', type: '"blur" | "input" | "none"', default: '"blur"', description: 'When to trigger rule evaluation. blur = on first blur then live; input = every keystroke; none = only via validate().' },
          { name: 'placeholder', type: 'string', description: 'Input placeholder text.' },
          { name: 'prefix', type: 'string', description: 'Static prefix text shown inside the left side of the input. Use the #prefix slot for custom content.' },
          { name: 'suffix', type: 'string', description: 'Static suffix text shown inside the right side. Use the #suffix slot for custom content.' },
          { name: 'maxlength', type: 'number', description: 'Maximum number of characters allowed.' },
          { name: 'showCounter', type: 'boolean', default: 'false', description: 'Show a character count badge (e.g. 12/50) inside the right edge.' },
          { name: 'readonly', type: 'boolean', default: 'false', description: 'Makes the input read-only; value is visible but not editable.' },
          { name: 'id / name', type: 'string', description: 'Forwarded to the underlying <input> for form association.' },
          { name: 'autocomplete', type: 'string', default: '"off"', description: 'HTML autocomplete attribute.' },
          ...COMMON,
        ],
        emits: [
          COMMON_MODEL_EMIT('string'),
          { name: 'enter', payload: 'string', description: 'Fires when the user presses Enter; payload is the current value.' },
          { name: 'blur / focus', payload: 'FocusEvent', description: 'Native focus/blur events forwarded from the inner <input>.' },
        ],
        slots: [
          { name: 'prefix', description: 'Custom content rendered inside the left edge of the input (overrides the prefix prop).' },
          { name: 'suffix', description: 'Custom content rendered inside the right edge of the input (overrides the suffix prop).' },
        ],
        notes: [
          'Rules take priority over the external error prop when any rule fails.',
          'validate-on="blur" runs on first blur, then re-runs on every keystroke so the user gets live feedback while correcting.',
          'Call validate() via template ref from a parent submit handler to imperatively trigger validation without user interaction.',
          'clearValidation() resets the internal error and dirty state (useful when resetting a form).',
          'When both prefix and suffix are present the input automatically adjusts its horizontal padding to avoid text overlap.',
        ],
      },
      {
        id: 'slug', icon: '🔗', label: 'slug', isNew: true,
        description: 'URL-safe slug that auto-generates from a source string. The lock icon toggles between auto-sync and manual-edit modes.',
        usage: `<FieldSlug\n  v-model="slug"\n  :source-value="postTitle"\n  label="Slug"\n  base-url="https://example.com/posts/"\n/>`,
        props: [
          { name: 'modelValue', type: 'string', required: true, description: 'The current slug string (use v-model).' },
          { name: 'sourceValue', type: 'string', description: 'The upstream string (e.g. a title) to auto-generate the slug from. When the component is locked and sourceValue changes the slug updates automatically.' },
          { name: 'baseUrl', type: 'string', description: 'URL prefix shown in the preview bar below the input (e.g. "https://site.com/posts/").' },
          { name: 'transform', type: '(raw: string) => string', description: 'Custom transform function. Defaults to lowercase-hyphen slugification with NFD normalisation.' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('string')],
        notes: [
          'The lock icon (🔒) means the slug is auto-synced to sourceValue. Click it to unlock and edit manually. Clicking again re-locks and the ↺ sync button can force a regeneration.',
          'The default slugifier strips accents, replaces spaces/underscores with hyphens and removes non-alphanumeric characters.',
          'If modelValue is empty on mount and sourceValue is provided, the slug is auto-initialised immediately.',
        ],
      },
      {
        id: 'email', icon: '📧', label: 'email', isNew: true,
        description: 'Email input with built-in RFC-style format validation and a real-time ✓/✗ indicator icon.',
        usage: `<FieldEmail\n  v-model="email"\n  label="Email address"\n  hint="We'll never share your email"\n/>`,
        props: [
          { name: 'modelValue', type: 'string', required: true, description: 'Bound email string (use v-model).' },
          { name: 'multiple', type: 'boolean', default: 'false', description: 'Allows comma-separated multiple email addresses (forwards to the native <input multiple> attribute).' },
          { name: 'validateOnInput', type: 'boolean', default: 'false', description: 'Run validation on every keystroke instead of waiting for blur.' },
          { name: 'readonly', type: 'boolean', default: 'false', description: 'Prevents editing.' },
          { name: 'autocomplete', type: 'string', default: '"email"', description: 'Autocomplete hint.' },
          ...COMMON,
        ],
        emits: [
          COMMON_MODEL_EMIT('string'),
          { name: 'blur', payload: 'FocusEvent', description: 'Fires on blur; validation runs here by default.' },
        ],
        notes: [
          'The component maintains its own internal validation state separate from the error prop. Pass error from your form library to override.',
          'The ✓ indicator appears in green when the email is non-empty and matches the pattern; ✗ appears in red after the field has been touched (blurred).',
        ],
      },
      {
        id: 'textarea', icon: '📄', label: 'textarea', isNew: true,
        description: 'Multi-line text area with optional character counter and an auto-resize mode that grows with content.',
        usage: `<FieldTextarea\n  v-model="bio"\n  label="Bio"\n  :rows="4"\n  :maxlength="300"\n  :show-counter="true"\n  :auto-resize="false"\n/>`,
        props: [
          { name: 'modelValue', type: 'string', required: true, description: 'Bound string value (use v-model).' },
          { name: 'rows', type: 'number', default: '4', description: 'Initial visible row count.' },
          { name: 'maxlength', type: 'number', description: 'Maximum characters. The counter turns red when the limit is reached.' },
          { name: 'showCounter', type: 'boolean', default: 'false', description: 'Displays a character counter badge in the bottom-right corner.' },
          { name: 'autoResize', type: 'boolean', default: 'false', description: 'Disables the manual resize handle and grows the height automatically as content is entered.' },
          { name: 'readonly', type: 'boolean', default: 'false', description: 'Renders the textarea non-editable.' },
          ...COMMON,
        ],
        emits: [
          COMMON_MODEL_EMIT('string'),
          { name: 'blur / focus', payload: 'FocusEvent', description: 'Native focus/blur events.' },
        ],
        notes: [
          'autoResize and the manual resize handle are mutually exclusive. When autoResize is true, resize-y is removed.',
          'showCounter without maxlength shows just the raw character count (e.g. "142").',
        ],
      },
      {
        id: 'number', icon: '🔢', label: 'number', isNew: true,
        description: 'Integer input with ＋/− stepper buttons, min/max clamping applied on blur, and ↑↓ keyboard support.',
        usage: `<FieldNumber\n  v-model="qty"\n  label="Quantity"\n  :min="0"\n  :max="999"\n  :step="1"\n  suffix="pcs"\n/>`,
        props: [
          { name: 'modelValue', type: 'number | null', required: true, description: 'Bound integer value (use v-model). null means empty.' },
          { name: 'min', type: 'number', description: 'Minimum allowed value. Enforced on blur and stepper clicks.' },
          { name: 'max', type: 'number', description: 'Maximum allowed value.' },
          { name: 'step', type: 'number', default: '1', description: 'Amount added/subtracted by the stepper buttons and ↑↓ keys.' },
          { name: 'prefix / suffix', type: 'string', description: 'Static text displayed inside the left/right edge.' },
          { name: 'showStepper', type: 'boolean', default: 'true', description: 'Show/hide the ＋/− stepper button column on the right.' },
          { name: 'readonly', type: 'boolean', default: 'false', description: 'Prevents editing.' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('number | null', 'Fires when the value changes. Emits null for empty input.')],
        notes: [
          'The raw input accepts typed text freely to avoid interrupting the user mid-entry. Clamping to min/max only happens on blur.',
          'Non-numeric characters are stripped on input. Negative numbers are allowed unless min ≥ 0.',
          'The stepper buttons are disabled at the min/max boundary.',
        ],
      },
      {
        id: 'float', icon: '🔣', label: 'float', isNew: true,
        description: 'Decimal number input. Accepts free-form typing (including partial entries like "3.") and applies precision rounding on blur.',
        usage: `<FieldFloat\n  v-model="price"\n  label="Price"\n  prefix="$"\n  :min="0"\n  :step="0.01"\n  :decimals="2"\n/>`,
        props: [
          { name: 'modelValue', type: 'number | null', required: true, description: 'Bound decimal value (use v-model). null means empty.' },
          { name: 'decimals', type: 'number', default: '2', description: 'Number of decimal places to enforce on blur (e.g. 2 → "3.10").' },
          { name: 'step', type: 'number', default: '0.1', description: 'Amount added/subtracted per stepper click or ↑↓ key press.' },
          { name: 'min / max', type: 'number', description: 'Value boundaries applied on blur and stepper limits.' },
          { name: 'prefix / suffix', type: 'string', description: 'Static text inside the left/right edge.' },
          { name: 'showStepper', type: 'boolean', default: 'true', description: 'Show/hide the ＋/− stepper column.' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('number | null', 'Fires on input. Does not round mid-entry; rounding happens on blur.')],
        notes: [
          'Intermediate partial entries like "3." are preserved during typing and only resolved when the field loses focus.',
          'step is used for both the stepper buttons and ↑↓ keyboard increments.',
          'roundDecimals uses toFixed internally, which means 1.005 may round to 1.00 due to floating-point representation.',
        ],
      },
      {
        id: 'checkbox', icon: '☑️', label: 'checkbox', isNew: true,
        description: 'Custom styled checkbox in two modes: single boolean toggle, or a checkbox group via the options prop.',
        usage: `<!-- Single -->\n<FieldCheckbox\n  v-model="accepted"\n  label="Accept terms"\n  description="Read our ToS before accepting"\n/>\n\n<!-- Group -->\n<FieldCheckbox\n  v-model:group-value="selected"\n  :options="[\n    { value: 'email', label: 'Email' },\n    { value: 'sms',   label: 'SMS'   },\n  ]"\n  label="Notify via"\n/>`,
        props: [
          { name: 'modelValue', type: 'boolean', default: 'false', description: 'Single mode: the boolean checked state (use v-model).' },
          { name: 'groupValue', type: '(string | number)[]', default: '[]', description: 'Group mode: array of currently selected values (use v-model:group-value).' },
          { name: 'options', type: 'CheckboxOption[]', description: 'When provided, switches to group mode and renders a checkbox per option. CheckboxOption: { value, label, description?, disabled? }.' },
          { name: 'description', type: 'string', description: 'Subtext rendered below the label in single mode.' },
          ...COMMON,
        ],
        emits: [
          { name: 'update:modelValue', payload: 'boolean', description: 'Single mode: emits the new boolean state.' },
          { name: 'update:groupValue', payload: '(string | number)[]', description: 'Group mode: emits the new selected values array.' },
        ],
        notes: [
          'Single and group modes are mutually exclusive. The component switches to group mode as soon as the options prop is provided.',
          'Individual options can be disabled via option.disabled even when the parent disabled prop is false.',
        ],
      },
      {
        id: 'radio', icon: '🔘', label: 'radio', isNew: true,
        description: 'Radio button group for single-value selection from a predefined list of options.',
        usage: `<FieldRadio\n  v-model="plan"\n  :options="[\n    { value: 'free', label: 'Free' },\n    { value: 'pro',  label: 'Pro', description: 'Most popular' },\n  ]"\n  label="Billing plan"\n/>`,
        props: [
          { name: 'modelValue', type: 'string | number | null', required: true, description: 'Currently selected option value (use v-model).' },
          { name: 'options', type: 'RadioOption[]', required: true, description: 'Array of { value, label, description?, disabled? }.' },
          { name: 'inline', type: 'boolean', default: 'false', description: 'Render options horizontally in a row instead of stacked.' },
          { name: 'name', type: 'string', description: 'HTML name attribute shared across all radio inputs in the group. Required for native form submission.' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('string | number', 'Emits the value of the newly selected option.')],
        notes: [
          'Individual options can be disabled via option.disabled even when the parent disabled prop is false.',
          'Use the name prop to associate radios with a <form> element for native browser form handling.',
        ],
      },
      {
        id: 'switch', icon: '🔀', label: 'switch', isNew: true,
        description: 'Toggle switch (on/off) with configurable size and accent color.',
        usage: `<FieldSwitch\n  v-model="notifications"\n  label="Email notifications"\n  description="Get notified when something changes"\n  size="md"\n  color="indigo"\n/>`,
        props: [
          { name: 'modelValue', type: 'boolean', required: true, description: 'Bound boolean state (use v-model).' },
          { name: 'description', type: 'string', description: 'Subtext rendered below the label.' },
          { name: 'size', type: '"sm" | "md" | "lg"', default: '"md"', description: 'Controls the physical dimensions of the toggle.' },
          { name: 'color', type: '"indigo" | "emerald" | "rose" | "amber" | "sky"', default: '"indigo"', description: 'Accent color applied when the switch is on.' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('boolean')],
        notes: [
          'The toggle uses role="switch" and aria-checked for accessibility.',
          'Clicking anywhere on the label row (including the description) activates the toggle.',
        ],
      },
      {
        id: 'password', icon: '🔑', label: 'password', isNew: true,
        description: 'Password input with a show/hide visibility toggle and an optional 4-segment strength meter.',
        usage: `<FieldPassword\n  v-model="password"\n  label="Password"\n  :show-strength="true"\n  autocomplete="new-password"\n/>`,
        props: [
          { name: 'modelValue', type: 'string', required: true, description: 'Bound password string (use v-model).' },
          { name: 'showStrength', type: 'boolean', default: 'false', description: 'Show a 4-segment strength meter below the input. Evaluates length ≥ 8, uppercase, digit, and special character.' },
          { name: 'autocomplete', type: 'string', default: '"current-password"', description: 'HTML autocomplete attribute. Use "new-password" on registration forms.' },
          { name: 'readonly', type: 'boolean', default: 'false', description: 'Prevents editing; hides the show/hide toggle.' },
          ...COMMON,
        ],
        emits: [
          COMMON_MODEL_EMIT('string'),
          { name: 'blur / focus', payload: 'FocusEvent', description: 'Native focus/blur events forwarded from the inner <input>.' },
        ],
        notes: [
          'The strength meter scores four criteria independently: length ≥ 8, at least one uppercase letter, at least one digit, at least one special character.',
          'The show/hide button uses tabindex="-1" so it does not interrupt the tab order.',
        ],
      },
      {
        id: 'range', icon: '↔️', label: 'range', isNew: true,
        description: 'Slider input with a filled track. Supports single-thumb and dual-thumb (range) modes.',
        usage: `<!-- Single -->\n<FieldRange v-model="volume" label="Volume" :min="0" :max="100" unit="%" />\n\n<!-- Dual thumb -->\n<FieldRange\n  v-model="priceRange"\n  label="Price range"\n  :min="0" :max="1000" :step="10" unit="$"\n  :range="true"\n/>`,
        props: [
          { name: 'modelValue', type: 'number | [number, number]', required: true, description: 'Single mode: a number. Range mode: a [from, to] tuple.' },
          { name: 'min / max', type: 'number', default: '0 / 100', description: 'Track bounds.' },
          { name: 'step', type: 'number', default: '1', description: 'Granularity of movement.' },
          { name: 'range', type: 'boolean', default: 'false', description: 'Enable dual-thumb range mode. modelValue must be [number, number].' },
          { name: 'unit', type: 'string', description: 'Suffix appended to displayed values (e.g. "%" → "40%").' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('number | [number, number]', 'Fires on every thumb movement.')],
        notes: [
          'In range mode the from thumb cannot exceed the to thumb and vice versa — they clamp against each other.',
          'Custom thumb styling is applied via scoped CSS (`::-webkit-slider-thumb` / `::-moz-range-thumb`). The native input is hidden behind the custom track.',
        ],
      },
      {
        id: 'otp', icon: '🔢', label: 'otp', isNew: true,
        description: 'One-time password / PIN input: individual styled boxes per digit with smart focus management.',
        usage: `<FieldOtp\n  v-model="code"\n  label="Verification code"\n  :length="6"\n  separator="-"\n  :group-size="3"\n  @complete="verify"\n/>`,
        props: [
          { name: 'modelValue', type: 'string', required: true, description: 'The current OTP string (use v-model). Length matches the length prop.' },
          { name: 'length', type: 'number', default: '6', description: 'Total number of digit boxes.' },
          { name: 'separator', type: 'string', description: 'Character inserted between digit groups (e.g. "-"). Shown visually only, not part of the value.' },
          { name: 'groupSize', type: 'number', default: '3', description: 'Number of digits per group before the separator is shown.' },
          ...COMMON,
        ],
        emits: [
          COMMON_MODEL_EMIT('string', 'Fires on every digit change. Value is a plain digit string without separators.'),
          { name: 'complete', payload: 'string', description: 'Fired once when all digit boxes are filled.' },
        ],
        notes: [
          'Pasting a numeric string auto-distributes digits into the boxes and moves focus to the first unfilled box.',
          'Backspace on an empty box moves focus to the previous box.',
          'Arrow Left / Right navigate between boxes.',
        ],
      },
      {
        id: 'rating', icon: '⭐', label: 'rating', isNew: true,
        description: 'Star rating with configurable count, size, color, and optional half-star support.',
        usage: `<FieldRating\n  v-model="score"\n  label="Your rating"\n  :max="5"\n  size="md"\n  color="amber"\n  :show-value="true"\n  :clearable="true"\n/>`,
        props: [
          { name: 'modelValue', type: 'number | null', required: true, description: 'Current rating value or null for unrated.' },
          { name: 'max', type: 'number', default: '5', description: 'Total number of stars rendered.' },
          { name: 'allowHalf', type: 'boolean', default: 'false', description: 'Allow half-star values (0.5 increments). Half stars are shown with a clip-path.' },
          { name: 'showValue', type: 'boolean', default: 'false', description: 'Show the numeric value (e.g. "4 / 5") beside the stars.' },
          { name: 'clearable', type: 'boolean', default: 'true', description: 'Show a "Clear" link when a rating is selected.' },
          { name: 'size', type: '"sm" | "md" | "lg"', default: '"md"', description: 'Icon size.' },
          { name: 'color', type: '"amber" | "indigo" | "rose" | "emerald"', default: '"amber"', description: 'Filled star color.' },
          { name: 'readonly', type: 'boolean', default: 'false', description: 'Disables interaction without dimming.' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('number | null', 'Emits null when cleared.')],
        notes: [
          'Hovering previews the star fill before committing. Mouse-leave restores the current modelValue.',
          'Clicking the currently selected star clears the rating when clearable is true.',
        ],
      },
      {
        id: 'tag_input', icon: '🏷️', label: 'tag_input', isNew: true,
        description: 'Free-form tag entry. Press Enter, comma, or Tab to commit a tag. Supports paste, suggestions dropdown, and max-tag limit.',
        usage: `<FieldTagInput\n  v-model="tags"\n  label="Topics"\n  placeholder="Add a topic…"\n  :suggestions="['Vue', 'React', 'Svelte']"\n  :max-tags="10"\n  :commit-on-blur="true"\n/>`,
        props: [
          { name: 'modelValue', type: 'string[]', required: true, description: 'Array of current tag strings (use v-model).' },
          { name: 'delimiters', type: 'string[]', default: '["Enter",",","Tab"]', description: 'Keys that commit the current input as a tag.' },
          { name: 'suggestions', type: 'string[]', description: 'Optional list of predefined suggestions shown in a dropdown while typing.' },
          { name: 'maxTags', type: 'number', description: 'Maximum number of tags allowed. The input is hidden once reached.' },
          { name: 'allowDuplicates', type: 'boolean', default: 'false', description: 'Allow the same tag to be added more than once.' },
          { name: 'commitOnBlur', type: 'boolean', default: 'false', description: 'Commit the typed value when the input loses focus.' },
          { name: 'addMorePlaceholder', type: 'string', default: '"Add more…"', description: 'Placeholder shown when at least one tag already exists.' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('string[]')],
        notes: [
          'Pasting multi-line or comma/semicolon-separated text auto-splits into individual tags.',
          'Backspace on an empty input removes the last tag.',
          'Suggestions are filtered by the current input and exclude already-added tags (when allowDuplicates is false).',
        ],
      },
      {
        id: 'color_picker', icon: '🎨', label: 'color_picker', isNew: true,
        description: 'Colour picker combining a native browser colour input (swatch) with a hex text field and optional preset swatches.',
        usage: `<FieldColorPicker\n  v-model="brandColor"\n  label="Brand colour"\n  :presets="['#6366f1','#ec4899','#22c55e']"\n  :clearable="true"\n/>`,
        props: [
          { name: 'modelValue', type: 'string | null', required: true, description: 'Hex colour string (e.g. "#6366f1") or null.' },
          { name: 'presets', type: 'string[]', description: 'Array of hex colour strings shown as quick-pick swatches.' },
          { name: 'clearable', type: 'boolean', default: 'true', description: 'Show a clear button when a colour is selected.' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('string | null', 'Emits a full #rrggbb hex string, or null when cleared.')],
        notes: [
          'The swatch on the left opens the native browser colour picker on click.',
          'Typing in the hex field supports 3-char shorthand (e.g. "f0a" → "#ff00aa") which is expanded on blur.',
          'The hex field strips non-hex characters on input.',
        ],
      },
      {
        id: 'phone_number', icon: '📱', label: 'phone_number', isNew: true,
        description: 'Phone number input with a searchable country dial-code selector. Emits a structured PhoneValue object including E.164 format.',
        usage: `<FieldPhoneNumber\n  v-model="phone"\n  label="Phone"\n  default-country="KH"\n  placeholder="012 345 678"\n/>`,
        props: [
          { name: 'modelValue', type: 'PhoneValue | null', required: true, description: 'PhoneValue: { countryCode, dialCode, number, e164 } or null. Emits null when the number field is cleared.' },
          { name: 'defaultCountry', type: 'string', default: '"KH"', description: 'ISO 3166-1 alpha-2 code of the pre-selected country on first render (e.g. "US", "GB").' },
          { name: 'placeholder', type: 'string', default: '"012 345 678"', description: 'Placeholder shown inside the number input field.' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('PhoneValue | null', 'e164 is "+{dialCode}{digitsOnly}". Emits null when the number is empty.')],
        notes: [
          'e164 strips all non-digit characters from the local number and prepends "+{dialCode}".',
          'The country dropdown can be searched by name or dial code. 25 countries are included.',
          'The dropdown panel teleports to <body> and flips upward when insufficient space exists below.',
        ],
      },
      {
        id: 'currency', icon: '💰', label: 'currency', isNew: true,
        description: 'Currency amount input with a live locale-aware formatted display, currency symbol prefix, and ISO code badge. Supports min/max clamping and ↑↓ keyboard stepping.',
        usage: `<FieldCurrency\n  v-model="price"\n  label="Price"\n  currency="USD"\n  :decimals="2"\n  locale="en-US"\n  :min="0"\n/>`,
        props: [
          { name: 'modelValue', type: 'number | null', required: true, description: 'Numeric amount (use v-model). null represents an empty field.' },
          { name: 'currency', type: 'string', default: '"USD"', description: 'ISO 4217 currency code. Controls the symbol shown on the left and the Intl.NumberFormat formatting (e.g. "USD", "EUR", "KHR").' },
          { name: 'decimals', type: 'number', default: '2', description: 'Decimal places enforced on blur. Use 0 for zero-decimal currencies like JPY or KRW.' },
          { name: 'locale', type: 'string', default: '"en-US"', description: 'BCP 47 locale tag for Intl.NumberFormat display (e.g. "fr-FR", "de-DE", "ja-JP").' },
          { name: 'min / max', type: 'number', description: 'Value boundaries applied on blur and stepper limits.' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('number | null', 'Emits raw number on every input. Decimal rounding and clamping are applied on blur.')],
        notes: [
          'While focused the input shows the raw number for easy editing. On blur it rounds to the configured decimal precision and clamps to min/max.',
          '↑ / ↓ arrow keys increment or decrement by 1 unit.',
          'The formatted Intl display is shown below the input when the field is not focused.',
        ],
      },
      {
        id: 'boolean', icon: '✅', label: 'boolean', isNew: true,
        description: 'Yes/No toggle button. Displays a green "Yes" badge or a red "No" badge. Simpler and more readable than a switch for record-list contexts.',
        usage: `<FieldBoolean\n  v-model="isActive"\n  label="Active status"\n  true-label="Yes"\n  false-label="No"\n  true-hint="User can log in"\n/>`,
        props: [
          { name: 'modelValue', type: 'boolean', required: true, description: 'Bound boolean value (use v-model).' },
          { name: 'trueLabel', type: 'string', default: '"Yes"', description: 'Button label when the value is true.' },
          { name: 'falseLabel', type: 'string', default: '"No"', description: 'Button label when the value is false.' },
          { name: 'trueHint', type: 'string', description: 'Descriptive text shown beside the button when true.' },
          { name: 'falseHint', type: 'string', description: 'Descriptive text shown beside the button when false.' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('boolean', 'Emits the toggled boolean on click.')],
        notes: [
          'Unlike FieldSwitch, FieldBoolean renders as a badge button — suited for forms where explicit "Yes/No" labels improve clarity.',
        ],
      },
      {
        id: 'url', icon: '🔗', label: 'url', isNew: true,
        description: 'URL input with format validation on blur and an "open in new tab" button shown when a valid URL is entered.',
        usage: `<FieldUrl\n  v-model="website"\n  label="Website"\n  placeholder="https://example.com"\n  :openable="true"\n/>`,
        props: [
          { name: 'modelValue', type: 'string', required: true, description: 'Bound URL string (use v-model).' },
          { name: 'openable', type: 'boolean', default: 'true', description: 'Show the ↗ external link button when a valid URL is entered.' },
          { name: 'readonly', type: 'boolean', default: 'false', description: 'Prevents editing.' },
          { name: 'placeholder', type: 'string', default: '"https://example.com"', description: 'Input placeholder.' },
          ...COMMON,
        ],
        emits: [
          COMMON_MODEL_EMIT('string'),
          { name: 'blur', payload: 'FocusEvent', description: 'Fires on blur; URL validation runs here.' },
        ],
        notes: [
          'Validation uses the URL constructor — it requires a protocol (e.g. "https://"). Plain "example.com" will fail.',
          'The ↗ open button only activates when the URL is non-empty and passes validation.',
        ],
      },
      {
        id: 'hidden', icon: '👁️', label: 'hidden', isNew: true,
        description: 'Renders a native <input type="hidden"> with no visible UI. Useful for embedding server-generated tokens or IDs into forms.',
        usage: `<FieldHidden v-model="csrfToken" name="csrf_token" />`,
        props: [
          { name: 'modelValue', type: 'unknown', required: true, description: 'Value to embed. Objects/arrays are JSON-serialised.' },
          { name: 'name', type: 'string', description: 'HTML name attribute forwarded to the hidden input for native form submission.' },
        ],
        emits: [],
        notes: [
          'Non-string values (objects, arrays, numbers) are serialised to JSON via JSON.stringify before being placed in the hidden input value.',
          'The component renders nothing visible — no FieldWrapper, no label, no hint.',
        ],
      },
      {
        id: 'enum', icon: '📋', label: 'enum', isNew: true,
        description: 'Select from a PHP-enum-like key/value map or a plain string array. Shows the key as a code badge alongside the label in the dropdown.',
        usage: `<FieldEnum\n  v-model="status"\n  :options="{ active: 'Active', draft: 'Draft', archived: 'Archived' }"\n  label="Status"\n/>`,
        props: [
          { name: 'modelValue', type: 'string | number | null', required: true, description: 'Selected enum value (use v-model).' },
          { name: 'options', type: 'Record<string, string> | (string | number)[]', required: true, description: 'A key→label object or a flat array of strings/numbers. Arrays use the value as both key and label.' },
          { name: 'clearable', type: 'boolean', default: 'true', description: 'Show a clear button.' },
          { name: 'placeholder', type: 'string', default: '"Select a value"', description: 'Trigger placeholder.' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('string | number | null')],
        notes: [
          'The dropdown shows each option\'s raw key as a monospace badge — useful when the key is a machine-readable constant.',
          'When passing a plain array, each element becomes both the stored value and the displayed label.',
        ],
      },
    ],
  },
  {
    label: 'Select',
    items: [
      {
        id: 'select2', icon: '🔽', label: 'select2',
        description: 'Searchable single-select dropdown. All options are loaded upfront and filtered client-side.',
        usage: `<FieldSelect2\n  v-model="colorId"\n  :options="[\n    { value: 'red',  label: 'Red'  },\n    { value: 'blue', label: 'Blue' },\n  ]"\n  label="Colour"\n  :clearable="true"\n/>`,
        props: [
          { name: 'modelValue', type: 'string | number | null', required: true, description: 'Selected option value (use v-model).' },
          { name: 'options', type: 'SelectOption[]', required: true, description: 'Array of { value, label } objects.' },
          { name: 'clearable', type: 'boolean', default: 'true', description: 'Show an × button to clear the selection.' },
          { name: 'placeholder', type: 'string', default: '"Select an option"', description: 'Trigger button placeholder text.' },
          ...COMMON,
        ],
        emits: [
          COMMON_MODEL_EMIT('string | number | null'),
          { name: 'change', payload: 'SelectOption | null', description: 'Fires after selection with the full option object (or null on clear).' },
        ],
        notes: ['The dropdown is teleported to <body> to escape overflow:hidden containers. Position is recalculated on open and flips upward if it would overflow the viewport bottom.'],
      },
      {
        id: 'select2_from_array', icon: '🔽', label: 'select2_from_array',
        description: 'Like select2 but the options prop accepts plain strings or numbers in addition to {value, label} objects.',
        usage: `<FieldSelect2FromArray\n  v-model="fruit"\n  :options="['Apple', 'Banana', 'Cherry']"\n  label="Fruit"\n/>`,
        props: [
          { name: 'modelValue', type: 'string | number | null', required: true, description: 'Selected value.' },
          { name: 'options', type: "(string | number | { value, label })[]", required: true, description: 'Plain strings/numbers are normalised to { value: x, label: String(x) } automatically.' },
          { name: 'clearable', type: 'boolean', default: 'true', description: 'Show clear button.' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('string | number | null'), { name: 'change', payload: 'SelectOption | null', description: 'Full option object on change.' }],
        notes: ['Internally delegates to FieldSelect2 after normalising the options array. All other select2 behaviour is identical.'],
      },
      {
        id: 'select2_multiple', icon: '☑️', label: 'select2_multiple',
        description: 'Multi-select with tag chips for selected items and checkbox ticks in the dropdown list.',
        usage: `<FieldSelect2Multiple\n  v-model="selectedIds"\n  :options="techOptions"\n  label="Tech stack"\n/>`,
        props: [
          { name: 'modelValue', type: '(string | number)[]', required: true, description: 'Array of selected values.' },
          { name: 'options', type: 'SelectOption[]', required: true, description: 'Full option list.' },
          { name: 'clearable', type: 'boolean', default: 'true', description: 'Show a "Clear all" option.' },
          { name: 'placeholder', type: 'string', default: '"Select options"', description: 'Placeholder when nothing is selected.' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('(string | number)[]')],
        notes: ['Tags can be removed individually with ×, or all at once via the "Clear all" footer link.'],
      },
      {
        id: 'select2_grouped', icon: '🗂️', label: 'select2_grouped',
        description: 'Single-select with options organised under sticky group headers.',
        usage: `<FieldSelect2Grouped\n  v-model="city"\n  :options="[\n    { label: 'Asia',   options: [{ value: 'pnh', label: 'Phnom Penh' }] },\n    { label: 'Europe', options: [{ value: 'par', label: 'Paris' }] },\n  ]"\n  label="City"\n/>`,
        props: [
          { name: 'modelValue', type: 'string | number | null', required: true, description: 'Selected value.' },
          { name: 'options', type: 'GroupedOption[]', required: true, description: '{ label: string, options: SelectOption[] }[] — each group has a label and a nested options array.' },
          { name: 'clearable', type: 'boolean', default: 'true', description: 'Show clear button.' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('string | number | null')],
      },
      {
        id: 'select2_nested', icon: '🌳', label: 'select2_nested',
        description: 'Tree-select with infinitely nestable options. Parent nodes with children show an expand/collapse toggle.',
        usage: `<FieldSelect2Nested\n  v-model="deptId"\n  :options="[\n    { value: 'eng', label: 'Engineering', children: [\n      { value: 'fe', label: 'Frontend' },\n    ]},\n  ]"\n  label="Department"\n/>`,
        props: [
          { name: 'modelValue', type: 'string | number | null', required: true, description: 'Selected leaf value.' },
          { name: 'options', type: 'NestedOption[]', required: true, description: '{ value, label, children?: NestedOption[] }[] — recursive tree structure.' },
          { name: 'clearable', type: 'boolean', default: 'true', description: 'Show clear button.' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('string | number | null')],
        notes: [
          'Parent nodes that have children are only expandable, not selectable. Only leaf nodes (no children) can be selected.',
          'Search filters across all levels; matching branches are preserved and expanded automatically.',
        ],
      },
      {
        id: 'select2_from_ajax', icon: '🔍', label: 'select2_from_ajax',
        description: 'Async single-select. Calls fetchFn with the current search query after a debounce delay.',
        usage: `<FieldSelect2FromAjax\n  v-model="selectedUser"\n  :fetch-fn="async (q) => {\n    const res = await api.get('/users', { q })\n    return res.data.map(u => ({ value: u.id, label: u.name }))\n  }"\n  label="User"\n  :min-chars="2"\n  :debounce="300"\n/>`,
        props: [
          { name: 'modelValue', type: 'AjaxOption | null', required: true, description: 'Full selected object { value, label, ...rest } or null.' },
          { name: 'fetchFn', type: '(query: string) => Promise<AjaxOption[]>', required: true, description: 'Async function called with the search string. Must return AjaxOption[].' },
          { name: 'minChars', type: 'number', default: '2', description: 'Minimum characters before fetchFn is triggered.' },
          { name: 'debounce', type: 'number', default: '300', description: 'Milliseconds to wait after the last keystroke before calling fetchFn.' },
          { name: 'clearable', type: 'boolean', default: 'true', description: 'Show clear button.' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('AjaxOption | null')],
        notes: [
          'The component stores the full selected object (not just the value) so the label can be displayed without a second fetch.',
          'The debounce timer is cleared on unmount to avoid state updates after component destruction.',
        ],
      },
      {
        id: 'select2_from_ajax_multiple', icon: '🔍', label: 'select2_from_ajax_multiple',
        description: 'Async multi-select variant of select2_from_ajax. Stores full option objects in the value array.',
        usage: `<FieldSelect2FromAjaxMultiple\n  v-model="assignees"\n  :fetch-fn="fetchUsers"\n  label="Assign to"\n/>`,
        props: [
          { name: 'modelValue', type: 'AjaxOption[]', required: true, description: 'Array of full selected objects.' },
          { name: 'fetchFn', type: '(query: string) => Promise<AjaxOption[]>', required: true, description: 'Async search function.' },
          { name: 'minChars', type: 'number', default: '2', description: 'Minimum characters before searching.' },
          { name: 'debounce', type: 'number', default: '300', description: 'Debounce delay in ms.' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('AjaxOption[]')],
      },
      {
        id: 'select_and_order', icon: '↕️', label: 'select_and_order',
        description: 'Two-panel interface: pick items from the left "available" panel, then reorder them in the right "selected" panel using up/down arrows.',
        usage: `<FieldSelectAndOrder\n  v-model="orderedFeatures"\n  :options="allFeatures"\n  label="Feature priority"\n/>`,
        props: [
          { name: 'modelValue', type: '(string | number)[]', required: true, description: 'Ordered array of selected values.' },
          { name: 'options', type: 'SelectOption[]', required: true, description: 'Full option list to choose from.' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('(string | number)[]', 'Fired when items are added, removed, or reordered.')],
        notes: ['The left panel has a live search filter. The right panel only shows items in their current order.'],
      },
    ],
  },
  {
    label: 'Date & Time',
    items: [
      {
        id: 'date_picker', icon: '📅', label: 'date_picker',
        description: 'Calendar date picker returning an ISO date string (YYYY-MM-DD).',
        usage: `<FieldDatePicker\n  v-model="dueDate"\n  label="Due date"\n  placeholder="Set date"\n  :clearable="true"\n/>`,
        props: [
          { name: 'modelValue', type: 'string | null', required: true, description: 'ISO date string "YYYY-MM-DD" or null.' },
          { name: 'placeholder', type: 'string', default: '"Select date"', description: 'Trigger placeholder text.' },
          { name: 'clearable', type: 'boolean', default: 'true', description: 'Show clear option.' },
          { name: 'triggerClass', type: 'string', description: 'Extra CSS classes forwarded to the inner DatePicker trigger.' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('string | null')],
        notes: ['The calendar dropdown teleports to <body>. It flips upward when there is insufficient space below.'],
      },
      {
        id: 'date_range', icon: '📆', label: 'date_range',
        description: 'Two side-by-side date pickers for selecting a from/to date range.',
        usage: `<FieldDateRange\n  v-model="range"\n  label="Project span"\n/>\n<!-- range: { from: string|null, to: string|null } -->`,
        props: [
          { name: 'modelValue', type: 'DateRangeValue', required: true, description: '{ from: string | null, to: string | null } — both sides are ISO date strings.' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('DateRangeValue')],
        notes: ['No automatic validation that "from" is before "to" — enforce this in your form logic if needed.'],
      },
      {
        id: 'datetime_picker', icon: '⏰', label: 'datetime_picker',
        description: 'Combined date + time picker. Returns an ISO datetime string "YYYY-MM-DDTHH:mm".',
        usage: `<FieldDatetimePicker\n  v-model="scheduledAt"\n  label="Scheduled at"\n/>`,
        props: [
          { name: 'modelValue', type: 'string | null', required: true, description: 'ISO datetime string "YYYY-MM-DDTHH:mm" or null.' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('string | null', 'Emits null when the date is cleared; keeps the previous time part otherwise.')],
        notes: [
          'The time part defaults to "00:00" when a date is first selected. Clearing the date sets the entire value to null.',
          'The time input uses a native <input type="time"> — appearance varies by browser.',
        ],
      },
      {
        id: 'time_picker', icon: '⏱️', label: 'time_picker', isNew: true,
        description: 'Scrollable column time picker for selecting hours and minutes. Supports 24-hour and 12-hour (AM/PM) modes with configurable minute-step granularity.',
        usage: `<FieldTimePicker\n  v-model="time"\n  label="Meeting time"\n  :use24h="true"\n  :minute-step="5"\n  :clearable="true"\n/>`,
        props: [
          { name: 'modelValue', type: 'string | null', required: true, description: '"HH:mm" 24-hour string, or null when unset.' },
          { name: 'use24h', type: 'boolean', default: 'true', description: 'Display and input in 24-hour format. Set false to enable 12-hour AM/PM mode.' },
          { name: 'minuteStep', type: 'number', default: '5', description: 'Granularity of the minute column (e.g. 5 → 00, 05, 10 … 55).' },
          { name: 'clearable', type: 'boolean', default: 'true', description: 'Show an × clear button inside the trigger.' },
          { name: 'placeholder', type: 'string', default: '"Select time"', description: 'Trigger button placeholder text.' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('string | null', 'Emits "HH:mm" when the "Set time" button is clicked, or null when cleared.')],
        notes: [
          'The value is always stored and emitted as a 24-hour "HH:mm" string regardless of the use24h display mode.',
          'Changes are only committed when the "Set time" confirm button is clicked — scrolling the columns does not emit immediately.',
          'The dropdown panel teleports to <body> and flips upward when insufficient viewport space exists below.',
        ],
      },
      {
        id: 'month', icon: '🗓️', label: 'month', isNew: true,
        description: 'Month/year picker rendered as a 4-column grid of abbreviated month names with prev/next year navigation.',
        usage: `<FieldMonth\n  v-model="reportMonth"\n  label="Report month"\n  :clearable="true"\n/>`,
        props: [
          { name: 'modelValue', type: 'string | null', required: true, description: 'ISO month string "YYYY-MM" or null.' },
          { name: 'clearable', type: 'boolean', default: 'true', description: 'Show a clear button inside the trigger.' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('string | null', 'Emits "YYYY-MM" on selection, or null when cleared.')],
        notes: [
          'The dropdown re-opens to the year of the current modelValue so the user sees context immediately.',
          'The panel teleports to <body> and flips upward when insufficient space exists below.',
        ],
      },
      {
        id: 'week', icon: '📅', label: 'week', isNew: true,
        description: 'ISO week picker using the native <input type="week">. Shows a friendly label (e.g. "Week 18 of 2025 · Apr 28 – May 4") below the input.',
        usage: `<FieldWeek\n  v-model="sprint"\n  label="Sprint week"\n  :clearable="true"\n/>`,
        props: [
          { name: 'modelValue', type: 'string | null', required: true, description: 'ISO week string "YYYY-Www" (e.g. "2025-W18") or null.' },
          { name: 'min / max', type: 'string', description: 'ISO week strings constraining the selectable range.' },
          { name: 'clearable', type: 'boolean', default: 'true', description: 'Show a clear button.' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('string | null', 'Emits the native "YYYY-Www" string or null when cleared.')],
        notes: [
          'The native week picker UI varies across browsers. Chrome/Edge show a week-number spinner; Firefox shows a date-range picker.',
          'The friendly label is computed client-side by converting the ISO week number to a Monday–Sunday date range.',
        ],
      },
    ],
  },
  {
    label: 'File & Media',
    items: [
      {
        id: 'browse', icon: '📎', label: 'browse',
        description: 'Single file upload with drag-and-drop support and optional size validation.',
        usage: `<FieldBrowse\n  v-model="attachment"\n  label="Attachment"\n  accept=".pdf,.docx"\n  :max-size="5 * 1024 * 1024"\n/>`,
        props: [
          { name: 'modelValue', type: 'File | null', required: true, description: 'Selected File object or null.' },
          { name: 'accept', type: 'string', description: 'MIME types or extensions forwarded to the native file input (e.g. "image/*" or ".pdf,.docx").' },
          { name: 'maxSize', type: 'number', description: 'Maximum file size in bytes. Displays an error message if exceeded.' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('File | null')],
      },
      {
        id: 'browse_multiple', icon: '📂', label: 'browse_multiple',
        description: 'Multiple file upload with a list view showing each file name and size.',
        usage: `<FieldBrowseMultiple\n  v-model="files"\n  label="Attachments"\n  :max-files="5"\n  :max-size="10 * 1024 * 1024"\n/>`,
        props: [
          { name: 'modelValue', type: 'File[]', required: true, description: 'Array of selected File objects.' },
          { name: 'accept', type: 'string', description: 'Accepted MIME types or extensions.' },
          { name: 'maxSize', type: 'number', description: 'Max size per file in bytes.' },
          { name: 'maxFiles', type: 'number', description: 'Maximum number of files. Extra files are silently dropped.' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('File[]')],
        notes: ['Files exceeding maxSize are skipped and an error list is shown below the drop zone. Valid files in the same drop are still added.'],
      },
      {
        id: 'image', icon: '🖼️', label: 'image',
        description: 'Image upload with a full-area preview and hover overlay for change/remove actions.',
        usage: `<FieldImage\n  v-model="coverPhoto"\n  label="Cover photo"\n  :height="200"\n  :max-size="2 * 1024 * 1024"\n/>`,
        props: [
          { name: 'modelValue', type: 'File | string | null', required: true, description: 'A File (new upload), a URL string (existing image), or null.' },
          { name: 'height', type: 'number', default: '200', description: 'Fixed height of the preview/upload zone in pixels.' },
          { name: 'maxSize', type: 'number', description: 'Max upload size in bytes.' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('File | string | null')],
        notes: [
          'When a File is provided, an object URL is created for the preview. It is revoked on unmount or when the value changes to prevent memory leaks.',
          'Passing a URL string lets you display an existing image (e.g. from an API) without re-uploading.',
        ],
      },
      {
        id: 'base64_image', icon: '🧬', label: 'base64_image',
        description: 'Image upload that encodes the file as a base64 data URL string using the FileReader API.',
        usage: `<FieldBase64Image\n  v-model="avatarBase64"\n  label="Avatar"\n  accept="image/*"\n  :height="160"\n/>`,
        props: [
          { name: 'modelValue', type: 'string | null', required: true, description: 'Base64 data URL string ("data:image/png;base64,…") or null.' },
          { name: 'accept', type: 'string', default: '"image/*"', description: 'Accepted image types.' },
          { name: 'height', type: 'number', default: '200', description: 'Height of the upload zone in pixels.' },
          { name: 'maxSize', type: 'number', description: 'Max file size in bytes before encoding.' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('string | null', 'Emits the full data URL string after encoding.')],
        notes: [
          'A "Copy base64" button is shown when a value is present for easy extraction.',
          'The approximate decoded size in KB is shown below the preview. Note: base64 strings are ~33% larger than the original binary.',
        ],
      },
      {
        id: 'video', icon: '🎬', label: 'video',
        description: 'Video upload with an HTML5 <video> player preview.',
        usage: `<FieldVideo\n  v-model="demoVideo"\n  label="Demo video"\n  :max-size="100 * 1024 * 1024"\n/>`,
        props: [
          { name: 'modelValue', type: 'File | string | null', required: true, description: 'A File (upload), a URL string (existing video), or null.' },
          { name: 'maxSize', type: 'number', description: 'Max file size in bytes.' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('File | string | null')],
        notes: ['Only files whose MIME type starts with "video/" are accepted from drag-and-drop. The accept attribute on the file input is "video/*".'],
      },
    ],
  },
  {
    label: 'Editors',
    items: [
      {
        id: 'wysiwyg', icon: '✍️', label: 'wysiwyg',
        description: 'Basic WYSIWYG editor using contenteditable. Thin wrapper around the shared WysiwygEditor component.',
        usage: `<FieldWysiwyg\n  v-model="description"\n  label="Description"\n  placeholder="Write something…"\n/>`,
        props: [
          { name: 'modelValue', type: 'string', required: true, description: 'HTML string value (use v-model).' },
          { name: 'placeholder', type: 'string', default: '"Start typing…"', description: 'Placeholder shown when the editor is empty and unfocused.' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('string', 'Emits the innerHTML of the editor on every change.')],
        notes: ['Uses document.execCommand which is deprecated but still widely supported. Consider FieldCkeditor or FieldTinymce for richer editing.'],
      },
      {
        id: 'ckeditor', icon: '📝', label: 'ckeditor',
        description: 'CKEditor-style rich-text editor with a style dropdown (paragraph/headings), all standard formatting, and a raw HTML source toggle.',
        usage: `<FieldCkeditor\n  v-model="content"\n  label="Content"\n/>`,
        props: [
          { name: 'modelValue', type: 'string', required: true, description: 'HTML string value.' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('string')],
        notes: ['The </>source toggle reveals a raw HTML textarea synced with the editor. Changes in either view are reflected in the other.'],
      },
      {
        id: 'tinymce', icon: '📰', label: 'tinymce',
        description: 'TinyMCE-style editor with a two-row toolbar, word count status bar, and a fullscreen mode.',
        usage: `<FieldTinymce\n  v-model="content"\n  label="Content"\n  :min-height="240"\n  :max-height="600"\n/>`,
        props: [
          { name: 'modelValue', type: 'string', required: true, description: 'HTML string value.' },
          { name: 'minHeight', type: 'number', default: '200', description: 'Minimum editor height in px.' },
          { name: 'maxHeight', type: 'number', default: '500', description: 'Maximum editor height in px before scrolling.' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('string')],
        notes: ['The fullscreen button expands the editor to fill the available viewport height. Word count is calculated by stripping HTML tags.'],
      },
      {
        id: 'easymde', icon: '🖊️', label: 'easymde',
        description: 'Markdown editor with a toolbar for common formatting, a rendered preview pane, and a side-by-side mode.',
        usage: `<FieldEasymde\n  v-model="markdownContent"\n  label="Post body"\n  :min-height="200"\n/>`,
        props: [
          { name: 'modelValue', type: 'string', required: true, description: 'Raw Markdown string (use v-model).' },
          { name: 'minHeight', type: 'number', default: '200', description: 'Minimum textarea/preview height in px.' },
          { name: 'placeholder', type: 'string', default: '"Write in Markdown…"', description: 'Textarea placeholder.' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('string', 'Emits the raw Markdown string on every keystroke.')],
        notes: [
          'The built-in renderer is a lightweight regex-based parser. It supports headings, bold, italic, lists, blockquotes, code, links, images and horizontal rules.',
          'Tab key inserts 2 spaces instead of shifting focus, matching standard Markdown editor behaviour.',
        ],
      },
    ],
  },
  {
    label: 'Special',
    items: [
      {
        id: 'address_google', icon: '📍', label: 'address_google',
        description: 'Google Places address autocomplete. Requires a Google Maps JavaScript API key with the Places library enabled.',
        usage: `<FieldAddressGoogle\n  v-model="location"\n  label="Office address"\n  api-key="YOUR_KEY"\n  country="us"\n/>`,
        props: [
          { name: 'modelValue', type: 'AddressValue | null', required: true, description: '{ address, lat?, lng?, placeId?, components? } or null.' },
          { name: 'apiKey', type: 'string', description: 'Google Maps JavaScript API key. If provided and the Maps SDK is not yet loaded, the script tag is injected automatically.' },
          { name: 'country', type: 'string', description: 'ISO 3166-1 alpha-2 country code to restrict results (e.g. "us", "kh").' },
          { name: 'minChars', type: 'number', default: '3', description: 'Minimum characters before querying the Places API.' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('AddressValue | null', 'Emits the full address object including lat/lng after the Places detail fetch.')],
        notes: [
          'Without a valid API key the component renders as a plain text input — no autocomplete suggestions.',
          'If the Google Maps script is already on the page (e.g. loaded by another component), the apiKey prop is ignored.',
          'address_components are exposed as a flat Record<string, string> keyed by address type (e.g. "locality", "country").',
        ],
      },
      {
        id: 'icon_picker', icon: '🎨', label: 'icon_picker',
        description: 'Grid icon picker with search. Ships with 40+ Heroicons (outline); accepts a custom icon set.',
        usage: `<FieldIconPicker\n  v-model="sectionIcon"\n  label="Section icon"\n/>`,
        props: [
          { name: 'modelValue', type: 'string | null', required: true, description: 'Selected icon name (e.g. "home") or null.' },
          { name: 'icons', type: 'IconDef[]', description: 'Custom icon set: { name: string, path: string }[]. Defaults to built-in Heroicons.' },
          { name: 'placeholder', type: 'string', default: '"Pick an icon"', description: 'Trigger placeholder.' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('string | null')],
        notes: ['The grid panel is fixed-width (320 px) and uses 6 columns. Icon name is shown as a tooltip on hover and truncated label below each icon.'],
      },
      {
        id: 'relationship', icon: '🔗', label: 'relationship',
        description: 'Async search to link related records. Supports single and multiple selection.',
        usage: `<!-- Single -->\n<FieldRelationship\n  v-model="assignee"\n  :fetch-fn="async (q) => searchUsers(q)"\n  label="Assigned to"\n/>\n\n<!-- Multiple -->\n<FieldRelationship\n  v-model="reviewers"\n  :fetch-fn="searchUsers"\n  :multiple="true"\n  label="Reviewers"\n/>`,
        props: [
          { name: 'modelValue', type: 'RelationshipItem | RelationshipItem[] | null', required: true, description: 'Single item, array (multiple mode), or null.' },
          { name: 'fetchFn', type: '(query: string) => Promise<RelationshipItem[]>', required: true, description: 'Async search function. RelationshipItem: { id, label, description?, ...rest }.' },
          { name: 'multiple', type: 'boolean', default: 'false', description: 'Switch to multi-select mode.' },
          { name: 'minChars', type: 'number', default: '2', description: 'Minimum characters before searching.' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('RelationshipItem | RelationshipItem[] | null')],
        notes: ['The trigger in multiple mode renders selected items as tag chips with individual × remove buttons, matching the select2_multiple pattern.'],
      },
      {
        id: 'repeatable', icon: '🔁', label: 'repeatable',
        description: 'Add / remove / reorder arbitrary row groups. Content is fully customisable via a scoped slot.',
        usage: `<FieldRepeatable\n  v-model="contacts"\n  :new-row="() => ({ name: '', email: '' })"\n  label="Contacts"\n  add-label="Add contact"\n  :min-rows="1"\n  :max-rows="10"\n>\n  <template #default="{ row, update }">\n    <FieldText :model-value="row.name"  label="Name"  @update:model-value="update('name',  $event)" />\n    <FieldText :model-value="row.email" label="Email" @update:model-value="update('email', $event)" />\n  </template>\n</FieldRepeatable>`,
        props: [
          { name: 'modelValue', type: 'Record<string, unknown>[]', required: true, description: 'Array of row objects.' },
          { name: 'newRow', type: '() => Record<string, unknown>', default: '() => ({})', description: 'Factory function that returns a blank row. Called each time "Add" is clicked.' },
          { name: 'addLabel', type: 'string', default: '"Add item"', description: 'Label for the add button.' },
          { name: 'minRows', type: 'number', description: 'Hide the remove button when the row count is at or below this value.' },
          { name: 'maxRows', type: 'number', description: 'Hide the add button when the row count reaches this value.' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('Record<string, unknown>[]')],
        slots: [
          { name: 'default', scope: '{ row, index, update }', description: 'Rendered inside each row. row is the current row data; update(field, value) patches a single field.' },
        ],
        notes: [
          'Rows are tracked with stable internal keys so Vue can diff reorders efficiently without remounting row content.',
          'The update helper performs a shallow merge: update("name", "Alice") is equivalent to emit("update:modelValue", rows.map((r,i) => i===idx ? {...r, name: "Alice"} : r)).',
        ],
      },
      {
        id: 'table', icon: '📊', label: 'table',
        description: 'Inline-editable table with typed column definitions. Supports text, number, select, checkbox, textarea and date cell types.',
        usage: `<FieldTable\n  v-model="lineItems"\n  label="Invoice items"\n  :columns="[\n    { key: 'desc',    label: 'Description', type: 'text'   },\n    { key: 'qty',     label: 'Qty',         type: 'number', width: '80px' },\n    { key: 'unit',    label: 'Unit',        type: 'select',\n      options: [{ value: 'pcs', label: 'pcs' }] },\n    { key: 'taxable', label: 'Taxable',     type: 'checkbox' },\n  ]"\n/>`,
        props: [
          { name: 'modelValue', type: 'Record<string, unknown>[]', required: true, description: 'Array of row objects.' },
          { name: 'columns', type: 'TableColumn[]', required: true, description: 'Column definitions. TableColumn: { key, label, type?, placeholder?, width?, required?, disabled?, options?, default? }.' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('Record<string, unknown>[]')],
        slots: [{ name: 'cell-{key}', scope: '{ row, rowIndex, column, update }', description: 'Override the cell renderer for a specific column key. Use update(value) to patch the cell.' }],
        notes: [
          'New rows are initialised using the column default values (or false for checkbox, "" for others).',
          'The remove button is hidden until the row is hovered. The "Clear all" button in the footer removes all rows at once.',
        ],
      },
    ],
  },
  {
    label: 'Advanced',
    items: [
      {
        id: 'json', icon: '{ }', label: 'json', isNew: true,
        description: 'JSON code editor with line numbers, a Format button, a validity indicator, and Tab-key indentation support.',
        usage: `<FieldJson\n  v-model="config"\n  label="Configuration"\n  :rows="8"\n/>`,
        props: [
          { name: 'modelValue', type: 'string', required: true, description: 'Raw JSON string (use v-model).' },
          { name: 'rows', type: 'number', default: '6', description: 'Minimum visible line count.' },
          { name: 'placeholder', type: 'string', description: 'Placeholder text shown when the editor is empty.' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('string', 'Emits the raw string on every keystroke. Validation only runs on blur.')],
        notes: [
          'Clicking "Format" pretty-prints valid JSON with 2-space indentation. If the JSON is invalid, the error is shown instead.',
          'The ✓ valid badge appears only when the field is non-empty and parses without errors.',
          'Tab key inserts 2 spaces at the cursor position instead of moving focus.',
        ],
      },
      {
        id: 'checklist', icon: '☑️', label: 'checklist', isNew: true,
        description: 'Scrollable checkbox list with optional search filter and select-all toggle. Emits an array of selected values.',
        usage: `<FieldChecklist\n  v-model="selected"\n  :options="[\n    { value: 'auth',  label: 'Authentication' },\n    { value: 'api',   label: 'REST API', description: 'CRUD endpoints' },\n  ]"\n  label="Features"\n  :searchable="true"\n/>`,
        props: [
          { name: 'modelValue', type: '(string | number)[]', required: true, description: 'Array of selected values (use v-model).' },
          { name: 'options', type: 'ChecklistOption[]', required: true, description: '{ value, label, description?, disabled? }[]' },
          { name: 'searchable', type: 'boolean', default: 'true', description: 'Show a search filter above the list (auto-hidden when ≤ 5 options).' },
          { name: 'showSelectAll', type: 'boolean', default: 'true', description: 'Show a "Select all / Deselect all" header row.' },
          { name: 'maxHeight', type: 'number', default: '220', description: 'Max height of the scrollable list in px.' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('(string | number)[]')],
        notes: [
          'The search filter applies locally — no async fetch is triggered.',
          'The select-all button operates on the full options array, not just the filtered subset.',
        ],
      },
      {
        id: 'checklist_dependency', icon: '🔗', label: 'checklist_dependency', isNew: true,
        description: 'Two-level dependency checklist: child items are only revealed when their parent is checked. Collapsible per parent.',
        usage: `<FieldChecklistDependency\n  v-model="permissions"\n  :options="[\n    { value: 'users', label: 'Users', children: [\n      { value: 'users.view',   label: 'View' },\n      { value: 'users.delete', label: 'Delete' },\n    ]},\n  ]"\n  label="Permissions"\n/>`,
        props: [
          { name: 'modelValue', type: '(string | number)[]', required: true, description: 'Flat array of all checked values — both parent and child keys.' },
          { name: 'options', type: 'DependencyItem[]', required: true, description: '{ value, label, description?, children?: DependencyItem[] }[]' },
          ...COMMON,
        ],
        emits: [COMMON_MODEL_EMIT('(string | number)[]', 'Unchecking a parent also removes all its children from the value array.')],
        notes: [
          'Unchecking a parent automatically removes all its children from the value array.',
          'Children are only visible when the parent is checked. The collapse toggle appears in the parent row header.',
          'Parent values are included in the emitted array alongside child values — filter them out in your form logic if needed.',
        ],
      },
      {
        id: 'code', icon: '💻', label: 'code', isNew: true,
        description: 'Monospace code editor with line numbers, a language selector dropdown, and Tab-key indentation (2 spaces).',
        usage: `<FieldCode\n  v-model="script"\n  v-model:language="lang"\n  label="Script"\n  :min-lines="10"\n  :show-language-selector="true"\n/>`,
        props: [
          { name: 'modelValue', type: 'string', required: true, description: 'Raw code string (use v-model).' },
          { name: 'language', type: 'string', default: '"javascript"', description: 'Current language shown/selected in the toolbar. Use v-model:language to make it two-way.' },
          { name: 'minLines', type: 'number', default: '8', description: 'Minimum visible line count. The editor grows with content.' },
          { name: 'showLanguageSelector', type: 'boolean', default: 'true', description: 'Show a language <select> in the toolbar. Set false to display the language label only.' },
          { name: 'placeholder', type: 'string', description: 'Placeholder text when the editor is empty.' },
          ...COMMON,
        ],
        emits: [
          COMMON_MODEL_EMIT('string', 'Fires on every keystroke.'),
          { name: 'update:language', payload: 'string', description: 'Fires when the user changes the language selector.' },
        ],
        notes: [
          'Supported languages: plaintext, javascript, typescript, html, css, scss, json, bash, shell, sql, python, php, go, rust, yaml, markdown.',
          'No real syntax highlighting is applied — text is rendered in a monospace indigo colour. For full highlighting, integrate a library like Shiki.',
          'Tab inserts 2 spaces at the cursor; it does not shift focus.',
        ],
      },
    ],
  },
]

// ─── State ───────────────────────────────────────────────────────────────────

const route  = useRoute()
const active = ref(String(route.query.active || 'text'))

watch(() => route.query.active, (v) => { if (v) active.value = String(v) })
const activeTab = ref('props')
const navSearch = ref('')
const forceDisabled = ref(false)
const forceError = ref(false)
const usageCopied = ref(false)
const valueCopied = ref(false)

// ─── Derived ─────────────────────────────────────────────────────────────────

const allItems = computed(() => groups.flatMap(g => g.items))
const totalComponents = computed(() => allItems.value.length)
const activeItem = computed(() => allItems.value.find(i => i.id === active.value))
const activeGroup = computed(() => groups.find(g => g.items.some(i => i.id === active.value)))

const filteredGroups = computed(() => {
  if (!navSearch.value) return groups
  const q = navSearch.value.toLowerCase()
  return groups.map(g => ({ ...g, items: g.items.filter(i => i.label.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)) }))
})

const activeTabs = computed(() => {
  const item = activeItem.value
  if (!item) return []
  const tabs = [
    { id: 'props',  label: 'Props',  count: item.props?.length },
    { id: 'usage',  label: 'Usage',  count: undefined },
  ]
  if (item.emits?.length)  tabs.splice(1, 0, { id: 'emits', label: 'Emits', count: item.emits.length })
  if (item.slots?.length)  tabs.splice(2, 0, { id: 'slots', label: 'Slots', count: item.slots.length })
  if (item.notes?.length)  tabs.push({ id: 'notes', label: 'Notes', count: item.notes.length })
  return tabs
})

// Reset activeTab to 'props' when switching components
watch(active, () => { activeTab.value = 'props'; forceDisabled.value = false; forceError.value = false })

// ─── v-model values ───────────────────────────────────────────────────────────

const vals = reactive<Record<string, any>>({
  select2: null, select2_from_array: null, select2_multiple: [], select2_grouped: null,
  select2_nested: null, select2_from_ajax: null, select2_from_ajax_multiple: [],
  select_and_order: [], date_picker: null, date_range: { from: null, to: null } as DateRangeValue,
  datetime_picker: null, browse: null, browse_multiple: [], image: null,
  base64_image: null, video: null, wysiwyg: '', ckeditor: '', tinymce: '', easymde: '',
  address_google: null, icon_picker: null,
  relationship_single: null, relationship_multiple: [], repeatable: [], table: [],
  text: '', text_prefix: '', text_counter: '', text_rules: '', text_rules2: '',
  slug_source: '', slug: '', email: '',
  textarea: '', textarea_auto: '',
  number: null, number_suffix: null,
  float: null, float_rating: null,
  checkbox_single: false, checkbox_group: [],
  radio: null,
  switch_basic: false, switch_sm: false, switch_lg: false,
  password: '', password_confirm: '',
  tag_input: [] as string[], tag_input2: [] as string[],
  color_picker: null as string | null, color_picker2: null as string | null,
  range_single: 40, range_dual: [200, 600] as [number, number],
  otp: '', otp4: '',
  rating: null, rating_half: null,
  time_picker: null as string | null, time_picker_12h: null as string | null,
  phone: null,
  currency: null as number | null, currency_eur: null as number | null,
  boolean: false, boolean2: false,
  url: '', url_repo: '',
  hidden: 'tok_abc123',
  enum: null as string | null, enum2: null as string | null,
  month: null as string | null, month2: null as string | null,
  week: null as string | null, week2: null as string | null,
  json: '{\n  "name": "TaskFlow",\n  "version": "1.0.0",\n  "features": ["kanban", "chat"]\n}',
  checklist: [] as (string | number)[],
  checklist_dep: [] as (string | number)[],
  code: 'function greet(name: string) {\n  return `Hello, ${name}!`\n}\n\nconsole.log(greet("World"))',
  code_lang: 'typescript',
})

const DISPLAY_KEY_MAP: Record<string, string[]> = {
  relationship: ['relationship_single', 'relationship_multiple'],
  slug:         ['slug_source', 'slug'],
  text:         ['text', 'text_prefix', 'text_counter', 'text_rules', 'text_rules2'],
  textarea:     ['textarea', 'textarea_auto'],
  number:       ['number', 'number_suffix'],
  float:        ['float', 'float_rating'],
  checkbox:     ['checkbox_single', 'checkbox_group'],
  switch:       ['switch_basic', 'switch_sm', 'switch_lg'],
  password:     ['password', 'password_confirm'],
  tag_input:    ['tag_input', 'tag_input2'],
  color_picker: ['color_picker', 'color_picker2'],
  range:        ['range_single', 'range_dual'],
  otp:          ['otp', 'otp4'],
  rating:       ['rating', 'rating_half'],
  time_picker:  ['time_picker', 'time_picker_12h'],
  currency:     ['currency', 'currency_eur'],
  boolean:      ['boolean', 'boolean2'],
  url:          ['url', 'url_repo'],
  enum:         ['enum', 'enum2'],
  month:        ['month', 'month2'],
  week:         ['week', 'week2'],
  code:         ['code', 'code_lang'],
}

const DEFAULT_VALS: Record<string, any> = {
  select2: null, select2_from_array: null, select2_multiple: [], select2_grouped: null,
  select2_nested: null, select2_from_ajax: null, select2_from_ajax_multiple: [],
  select_and_order: [], date_picker: null, date_range: { from: null, to: null },
  datetime_picker: null, browse: null, browse_multiple: [], image: null,
  base64_image: null, video: null, wysiwyg: '', ckeditor: '', tinymce: '', easymde: '',
  address_google: null, icon_picker: null,
  relationship_single: null, relationship_multiple: [], repeatable: [], table: [],
  text: '', text_prefix: '', text_counter: '', text_rules: '', text_rules2: '',
  slug_source: '', slug: '', email: '',
  textarea: '', textarea_auto: '',
  number: null, number_suffix: null,
  float: null, float_rating: null,
  checkbox_single: false, checkbox_group: [],
  radio: null,
  switch_basic: false, switch_sm: false, switch_lg: false,
  password: '', password_confirm: '',
  tag_input: [], tag_input2: [],
  color_picker: null, color_picker2: null,
  range_single: 40, range_dual: [200, 600],
  otp: '', otp4: '',
  rating: null, rating_half: null,
  time_picker: null, time_picker_12h: null,
  phone: null,
  currency: null, currency_eur: null,
  boolean: false, boolean2: false,
  url: '', url_repo: '',
  hidden: 'tok_abc123',
  enum: null, enum2: null,
  month: null, month2: null,
  week: null, week2: null,
  json: '{\n  "name": "TaskFlow",\n  "version": "1.0.0",\n  "features": ["kanban", "chat"]\n}',
  checklist: [],
  checklist_dep: [],
  code: 'function greet(name: string) {\n  return `Hello, ${name}!`\n}\n\nconsole.log(greet("World"))',
  code_lang: 'typescript',
}

const activeValueJson = computed(() => {
  const keys = DISPLAY_KEY_MAP[active.value] ?? [active.value]
  if (keys.length === 1) {
    const val = vals[keys[0]!]
    if (val instanceof File) return JSON.stringify({ name: val.name, size: val.size, type: val.type }, null, 2)
    if (Array.isArray(val) && val[0] instanceof File)
      return JSON.stringify(val.map((f: File) => ({ name: f.name, size: f.size })), null, 2)
    return JSON.stringify(val, null, 2)
  }
  const out: Record<string, any> = {}
  for (const k of keys) out[k] = vals[k]
  return JSON.stringify(out, null, 2)
})

function resetActive() {
  const keys = DISPLAY_KEY_MAP[active.value] ?? [active.value]
  for (const k of keys) vals[k] = structuredClone(DEFAULT_VALS[k] ?? null)
}

async function copyUsage() {
  if (!import.meta.client || !activeItem.value) return
  await navigator.clipboard.writeText(activeItem.value.usage)
  usageCopied.value = true
  setTimeout(() => { usageCopied.value = false }, 2000)
}

async function copyValue() {
  if (!import.meta.client) return
  await navigator.clipboard.writeText(activeValueJson.value)
  valueCopied.value = true
  setTimeout(() => { valueCopied.value = false }, 2000)
}
</script>
