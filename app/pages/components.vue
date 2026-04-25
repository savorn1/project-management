<template>
  <div class="flex gap-0 -m-6 min-h-[calc(100vh-4rem)]">

    <!-- ─── Left sidebar ──────────────────────────────────────────── -->
    <aside class="w-64 flex-shrink-0 bg-slate-900/60 border-r border-slate-800/60 flex flex-col sticky top-0 h-[calc(100vh-4rem)]">
      <div class="px-4 pt-5 pb-3 border-b border-slate-800/60 flex-shrink-0">
        <h2 class="text-xs font-semibold text-gray-500 uppercase tracking-widest">Component Library</h2>
        <p class="text-xs text-gray-600 mt-0.5">{{ totalComponents }} components total</p>
        <div class="relative mt-3">
          <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input v-model="navSearch" type="text" placeholder="Search components…"
            class="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
          <button v-if="navSearch" type="button" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300" @click="navSearch = ''">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <!-- Type filter -->
        <div class="flex gap-1 mt-2">
          <button v-for="f in ['all', 'form', 'column']" :key="f" type="button"
            class="flex-1 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-colors"
            :class="typeFilter === f ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-gray-500 hover:text-gray-300'"
            @click="typeFilter = f as 'all' | 'form' | 'column'"
          >{{ f }}</button>
        </div>
      </div>

      <nav class="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        <template v-for="section in filteredSections" :key="section.type + section.label">
          <div v-if="section.items.length > 0">
            <div class="flex items-center gap-2 px-2 mb-1">
              <span class="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest"
                :class="section.type === 'form' ? 'bg-violet-500/20 text-violet-400' : 'bg-sky-500/20 text-sky-400'">
                {{ section.type }}
              </span>
              <span class="text-[10px] font-semibold text-gray-600 uppercase tracking-widest truncate">{{ section.label }}</span>
            </div>
            <ul class="space-y-0.5">
              <li v-for="item in section.items" :key="item.id">
                <NuxtLink
                  :to="item.page + '?active=' + item.id"
                  class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all text-left"
                  :class="$route.query.active === item.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-gray-400 hover:text-white hover:bg-slate-800'"
                >
                  <span class="text-base leading-none flex-shrink-0">{{ item.icon }}</span>
                  <span class="flex-1 truncate font-medium">{{ item.label }}</span>
                </NuxtLink>
              </li>
            </ul>
          </div>
        </template>
        <p v-if="filteredSections.every(s => s.items.length === 0)" class="text-center text-xs text-gray-600 py-4">No results for "{{ navSearch }}"</p>
      </nav>
    </aside>

    <!-- ─── Main content ──────────────────────────────────────────── -->
    <div class="flex-1 min-w-0 overflow-y-auto">
      <div class="max-w-5xl mx-auto px-8 py-6 space-y-8">

        <!-- Header -->
        <div>
          <h1 class="text-2xl font-bold text-white mb-1">Component Library</h1>
          <p class="text-gray-400 text-sm leading-relaxed">
            Browse all <span class="text-violet-400 font-medium">{{ formCount }} form</span> and
            <span class="text-sky-400 font-medium">{{ columnCount }} column</span> components.
            Click any component in the sidebar or cards below to open its showcase.
          </p>
        </div>

        <!-- Category cards -->
        <div class="grid gap-4 md:grid-cols-2">
          <NuxtLink to="/form-components"
            class="group p-5 bg-slate-800/60 border border-slate-700/60 rounded-2xl hover:border-violet-500/40 hover:bg-slate-800 transition-all">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-lg">🧩</div>
              <div>
                <div class="font-semibold text-white group-hover:text-violet-300 transition-colors">Form Components</div>
                <div class="text-xs text-gray-500">{{ formCount }} interactive field components</div>
              </div>
              <svg class="w-4 h-4 text-gray-600 group-hover:text-violet-400 ml-auto transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div class="flex flex-wrap gap-1.5">
              <span v-for="g in formGroups" :key="g.label"
                class="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/60 text-gray-400 border border-slate-700/40">
                {{ g.label }} <span class="text-gray-600">{{ g.items.length }}</span>
              </span>
            </div>
          </NuxtLink>

          <NuxtLink to="/column-components"
            class="group p-5 bg-slate-800/60 border border-slate-700/60 rounded-2xl hover:border-sky-500/40 hover:bg-slate-800 transition-all">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center text-lg">📊</div>
              <div>
                <div class="font-semibold text-white group-hover:text-sky-300 transition-colors">Column Components</div>
                <div class="text-xs text-gray-500">{{ columnCount }} display-only column renderers</div>
              </div>
              <svg class="w-4 h-4 text-gray-600 group-hover:text-sky-400 ml-auto transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div class="flex flex-wrap gap-1.5">
              <span v-for="g in columnGroups" :key="g.label"
                class="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/60 text-gray-400 border border-slate-700/40">
                {{ g.label }} <span class="text-gray-600">{{ g.items.length }}</span>
              </span>
            </div>
          </NuxtLink>
        </div>

        <!-- Search + filter bar -->
        <div class="flex items-center gap-3">
          <div class="relative flex-1 max-w-sm">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input v-model="gridSearch" type="text" placeholder="Filter components…"
              class="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
          </div>
          <div class="flex gap-1.5">
            <button v-for="f in ['all', 'form', 'column']" :key="f" type="button"
              class="px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors border"
              :class="typeFilter === f
                ? f === 'form' ? 'bg-violet-600/20 border-violet-500/40 text-violet-300'
                  : f === 'column' ? 'bg-sky-600/20 border-sky-500/40 text-sky-300'
                  : 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                : 'bg-slate-800 border-slate-700 text-gray-500 hover:text-gray-300'"
              @click="typeFilter = f as 'all' | 'form' | 'column'"
            >{{ f }}</button>
          </div>
          <span class="text-xs text-gray-600">{{ filteredGridCount }} shown</span>
        </div>

        <!-- Component grid by group -->
        <div class="space-y-8">
          <template v-for="section in filteredGridSections" :key="section.type + section.label">
            <div v-if="section.items.length > 0">
              <div class="flex items-center gap-2 mb-3">
                <span class="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-widest"
                  :class="section.type === 'form' ? 'bg-violet-500/20 text-violet-400' : 'bg-sky-500/20 text-sky-400'">
                  {{ section.type }}
                </span>
                <h2 class="text-sm font-semibold text-gray-300">{{ section.label }}</h2>
                <div class="flex-1 h-px bg-slate-800/80 ml-1" />
                <span class="text-xs text-gray-600">{{ section.items.length }}</span>
              </div>
              <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <NuxtLink
                  v-for="item in section.items"
                  :key="item.id"
                  :to="item.page + '?active=' + item.id"
                  class="group flex items-start gap-3 p-3.5 bg-slate-800/40 border border-slate-700/40 rounded-xl hover:bg-slate-800/80 hover:border-slate-600/60 transition-all"
                >
                  <span class="text-xl leading-none flex-shrink-0 mt-0.5">{{ item.icon }}</span>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-1.5 mb-0.5">
                      <span class="text-sm font-semibold text-white font-mono truncate group-hover:text-indigo-300 transition-colors">{{ item.label }}</span>
                    </div>
                    <p class="text-xs text-gray-500 leading-relaxed line-clamp-2">{{ item.description }}</p>
                  </div>
                  <svg class="w-3.5 h-3.5 text-gray-600 group-hover:text-indigo-400 flex-shrink-0 mt-1 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </NuxtLink>
              </div>
            </div>
          </template>
          <p v-if="filteredGridCount === 0" class="text-center text-sm text-gray-600 py-8">No components match "{{ gridSearch }}"</p>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CompItem {
  id: string
  label: string
  icon: string
  description: string
  page: '/form-components' | '/column-components'
}
interface Section {
  type: 'form' | 'column'
  label: string
  items: CompItem[]
}

// ─── Form component groups ────────────────────────────────────────────────────

const formGroups: Section[] = [
  {
    type: 'form', label: 'Text & Input',
    items: [
      { id: 'text',     icon: '🔤', label: 'FieldText',     page: '/form-components', description: 'Single-line text input with prefix, suffix, character counter, and maxlength support.' },
      { id: 'slug',     icon: '🔗', label: 'FieldSlug',     page: '/form-components', description: 'Auto-generates a URL-safe slug from a source value. Lockable for manual editing.' },
      { id: 'email',    icon: '📧', label: 'FieldEmail',    page: '/form-components', description: 'Email input with inline format validation on blur.' },
      { id: 'url',      icon: '🌐', label: 'FieldUrl',      page: '/form-components', description: 'URL input with format validation and an open-in-new-tab button.' },
      { id: 'textarea', icon: '📝', label: 'FieldTextarea', page: '/form-components', description: 'Multi-line textarea with optional auto-resize, character counter, and maxlength.' },
      { id: 'number',   icon: '🔢', label: 'FieldNumber',   page: '/form-components', description: 'Integer input with stepper buttons, keyboard arrows, min/max/step constraints.' },
      { id: 'float',    icon: '🔣', label: 'FieldFloat',    page: '/form-components', description: 'Decimal number input with configurable precision, prefix/suffix, and blur rounding.' },
      { id: 'password', icon: '🔑', label: 'FieldPassword', page: '/form-components', description: 'Password input with reveal toggle and optional strength indicator.' },
      { id: 'hidden',   icon: '👁️', label: 'FieldHidden',   page: '/form-components', description: 'Invisible field that stores a value in the DOM without rendering any UI.' },
    ],
  },
  {
    type: 'form', label: 'Selection',
    items: [
      { id: 'select2',                   icon: '📋', label: 'FieldSelect2',                page: '/form-components', description: 'Single-select dropdown with search and keyboard navigation.' },
      { id: 'select2_from_array',        icon: '📋', label: 'FieldSelect2FromArray',       page: '/form-components', description: 'Select from a plain string array with auto-generated values.' },
      { id: 'select2_multiple',          icon: '✅', label: 'FieldSelect2Multiple',        page: '/form-components', description: 'Multi-select dropdown with tag chips and a select-all toggle.' },
      { id: 'select2_grouped',           icon: '🗂️', label: 'FieldSelect2Grouped',         page: '/form-components', description: 'Single-select dropdown with grouped option headers.' },
      { id: 'select2_nested',            icon: '🌲', label: 'FieldSelect2Nested',          page: '/form-components', description: 'Hierarchical tree-select with expandable parent nodes.' },
      { id: 'select2_from_ajax',         icon: '🔍', label: 'FieldSelect2FromAjax',        page: '/form-components', description: 'Async single-select that fetches options via a custom fetch function.' },
      { id: 'select2_from_ajax_multiple',icon: '🔍', label: 'FieldSelect2FromAjaxMultiple',page: '/form-components', description: 'Async multi-select with debounced search and tag chips.' },
      { id: 'select_and_order',          icon: '↕️', label: 'FieldSelectAndOrder',         page: '/form-components', description: 'Pick items from a list and drag to reorder their priority.' },
      { id: 'enum',                      icon: '📋', label: 'FieldEnum',                   page: '/form-components', description: 'Dropdown backed by a Record<value, label> map or a plain string array.' },
    ],
  },
  {
    type: 'form', label: 'Boolean & Checks',
    items: [
      { id: 'checkbox',  icon: '☑️', label: 'FieldCheckbox',  page: '/form-components', description: 'Single checkbox or multi-checkbox group from an options array.' },
      { id: 'radio',     icon: '⚪', label: 'FieldRadio',     page: '/form-components', description: 'Radio button group — one selection from an options list.' },
      { id: 'switch',    icon: '🔁', label: 'FieldSwitch',    page: '/form-components', description: 'Toggle switch in sm/md/lg sizes with configurable accent color.' },
      { id: 'boolean',   icon: '✅', label: 'FieldBoolean',   page: '/form-components', description: 'Yes/No segmented toggle with custom true/false labels and hints.' },
    ],
  },
  {
    type: 'form', label: 'Date & Time',
    items: [
      { id: 'date_picker',     icon: '📅', label: 'FieldDatePicker',     page: '/form-components', description: 'Calendar popup returning a YYYY-MM-DD string.' },
      { id: 'date_range',      icon: '📅', label: 'FieldDateRange',      page: '/form-components', description: 'Two-date range picker returning { start, end }.' },
      { id: 'datetime_picker', icon: '⏰', label: 'FieldDatetimePicker', page: '/form-components', description: 'Combined date + time calendar picker returning an ISO datetime string.' },
      { id: 'time_picker',     icon: '⏱️', label: 'FieldTimePicker',     page: '/form-components', description: '24h or 12h time picker with configurable minute steps.' },
      { id: 'month',           icon: '🗓️', label: 'FieldMonth',          page: '/form-components', description: 'Month-year selector returning a YYYY-MM string.' },
      { id: 'week',            icon: '📆', label: 'FieldWeek',           page: '/form-components', description: 'ISO week selector returning a YYYY-Www string.' },
    ],
  },
  {
    type: 'form', label: 'Files & Media',
    items: [
      { id: 'browse',          icon: '📎', label: 'FieldBrowse',         page: '/form-components', description: 'Single file upload with drag-and-drop, size limit, and file type filtering.' },
      { id: 'browse_multiple', icon: '📂', label: 'FieldBrowseMultiple', page: '/form-components', description: 'Multi-file upload with drag-and-drop, max-files, and size constraints.' },
      { id: 'image',           icon: '🖼️', label: 'FieldImage',          page: '/form-components', description: 'Image uploader with live preview, crop hint, and size constraints.' },
      { id: 'base64_image',    icon: '🖼️', label: 'FieldBase64Image',    page: '/form-components', description: 'Image uploader that converts the selected file to a base64 data URL.' },
      { id: 'video',           icon: '🎬', label: 'FieldVideo',          page: '/form-components', description: 'Video file uploader with drag-and-drop and max-size guard.' },
    ],
  },
  {
    type: 'form', label: 'Rich Content',
    items: [
      { id: 'wysiwyg',  icon: '✏️', label: 'FieldWysiwyg',  page: '/form-components', description: 'Lightweight WYSIWYG toolbar (bold, italic, lists, links) producing HTML.' },
      { id: 'ckeditor', icon: '✒️', label: 'FieldCkeditor', page: '/form-components', description: 'Full-featured rich-text editor modeled after CKEditor 5.' },
      { id: 'tinymce',  icon: '📰', label: 'FieldTinymce',  page: '/form-components', description: 'Rich-text editor modeled after TinyMCE with configurable min height.' },
      { id: 'easymde',  icon: '⬇️', label: 'FieldEasymde',  page: '/form-components', description: 'Markdown editor with preview toggle and toolbar shortcuts.' },
      { id: 'code',     icon: '💻', label: 'FieldCode',     page: '/form-components', description: 'Code editor with syntax highlighting and language switcher.' },
    ],
  },
  {
    type: 'form', label: 'Structured Data',
    items: [
      { id: 'json',                   icon: '{ }', label: 'FieldJson',                  page: '/form-components', description: 'Textarea that validates and pretty-prints JSON. Format button on blur.' },
      { id: 'table',                  icon: '🗃️', label: 'FieldTable',                 page: '/form-components', description: 'Inline editable table with configurable columns and add/remove rows.' },
      { id: 'repeatable',             icon: '🔁', label: 'FieldRepeatable',             page: '/form-components', description: 'Repeatable row group — define any fields via a default slot.' },
      { id: 'checklist',              icon: '✅', label: 'FieldChecklist',              page: '/form-components', description: 'Searchable checkbox list with select-all toggle.' },
      { id: 'checklist_dependency',   icon: '🌳', label: 'FieldChecklistDependency',   page: '/form-components', description: 'Hierarchical checklist where child items depend on a parent checkbox.' },
    ],
  },
  {
    type: 'form', label: 'Special',
    items: [
      { id: 'color_picker',    icon: '🎨', label: 'FieldColorPicker',    page: '/form-components', description: 'Hex color picker with preset swatches and a free-form hex input.' },
      { id: 'range',           icon: '↔️', label: 'FieldRange',          page: '/form-components', description: 'Single or dual-thumb slider for numeric ranges.' },
      { id: 'otp',             icon: '🔢', label: 'FieldOtp',            page: '/form-components', description: 'One-time password input with configurable digit length and grouping.' },
      { id: 'rating',          icon: '⭐', label: 'FieldRating',         page: '/form-components', description: 'Star rating input with half-star support, size and color variants.' },
      { id: 'tag_input',       icon: '🏷️', label: 'FieldTagInput',       page: '/form-components', description: 'Free-form tag chips with autocomplete suggestions and max-tag limit.' },
      { id: 'phone_number',    icon: '📱', label: 'FieldPhoneNumber',    page: '/form-components', description: 'Phone input with country dial-code selector.' },
      { id: 'currency',        icon: '💰', label: 'FieldCurrency',       page: '/form-components', description: 'Currency input with locale-aware formatting, symbol, and decimal precision.' },
      { id: 'icon_picker',     icon: '🔣', label: 'FieldIconPicker',     page: '/form-components', description: 'Searchable icon picker from the Heroicons set.' },
      { id: 'address_google',  icon: '📍', label: 'FieldAddressGoogle',  page: '/form-components', description: 'Address autocomplete backed by the Google Places API.' },
      { id: 'relationship',    icon: '🔗', label: 'FieldRelationship',   page: '/form-components', description: 'Async single or multi-select for related records with search.' },
    ],
  },
]

// ─── Column component groups ──────────────────────────────────────────────────

const columnGroups: Section[] = [
  {
    type: 'column', label: 'Text & Numbers',
    items: [
      { id: 'col_text',     icon: '🔤', label: 'ColText',     page: '/column-components', description: 'Plain text display with prefix, suffix, truncation, bold, and muted variants.' },
      { id: 'col_number',   icon: '🔢', label: 'ColNumber',   page: '/column-components', description: 'Locale-formatted number with decimals, prefix/suffix, and compact (K/M) mode.' },
      { id: 'col_password', icon: '🔑', label: 'ColPassword', page: '/column-components', description: 'Masked value rendered as fixed-length dots or stars.' },
    ],
  },
  {
    type: 'column', label: 'Status & Badges',
    items: [
      { id: 'col_boolean', icon: '✅', label: 'ColBoolean', page: '/column-components', description: 'Yes/No pill badge — green for true, red for false.' },
      { id: 'col_check',   icon: '☑️', label: 'ColCheck',   page: '/column-components', description: 'Checkmark circle for true; dash or × icon for false.' },
      { id: 'col_badge',   icon: '🏷️', label: 'ColBadge',   page: '/column-components', description: 'Generic coloured badge in 8 preset colour schemes with optional dot.' },
      { id: 'col_enum',    icon: '📋', label: 'ColEnum',    page: '/column-components', description: 'Resolves a raw value to a human label and colours it from a map.' },
      { id: 'col_color',   icon: '🎨', label: 'ColColor',   page: '/column-components', description: 'Colour swatch box with optional hex code label.' },
      { id: 'col_range',   icon: '📊', label: 'ColRange',   page: '/column-components', description: 'Horizontal progress bar with configurable min/max and colour.' },
    ],
  },
  {
    type: 'column', label: 'Date & Time',
    items: [
      { id: 'col_date',     icon: '📅', label: 'ColDate',     page: '/column-components', description: 'Locale-formatted date from any ISO date string.' },
      { id: 'col_datetime', icon: '⏰', label: 'ColDatetime', page: '/column-components', description: 'Datetime display in absolute or relative ("2 hours ago") mode.' },
      { id: 'col_time',     icon: '⏱️', label: 'ColTime',     page: '/column-components', description: 'Time in 24-hour or 12-hour (AM/PM) format.' },
      { id: 'col_month',    icon: '🗓️', label: 'ColMonth',    page: '/column-components', description: 'Renders a YYYY-MM string as "April 2025".' },
      { id: 'col_week',     icon: '📆', label: 'ColWeek',     page: '/column-components', description: 'Renders a YYYY-Www ISO week string as "Week 18, 2025".' },
    ],
  },
  {
    type: 'column', label: 'Links & Contact',
    items: [
      { id: 'col_email', icon: '📧', label: 'ColEmail', page: '/column-components', description: 'Clickable mailto: link with optional truncation and copy on hover.' },
      { id: 'col_phone', icon: '📱', label: 'ColPhone', page: '/column-components', description: 'Clickable tel: link that strips whitespace for compatibility.' },
      { id: 'col_url',   icon: '🔗', label: 'ColUrl',   page: '/column-components', description: 'External link that opens in a new tab, defaults to hostname as label.' },
    ],
  },
  {
    type: 'column', label: 'Media',
    items: [
      { id: 'col_image', icon: '🖼️', label: 'ColImage', page: '/column-components', description: 'Thumbnail image with click-to-expand lightbox overlay.' },
      { id: 'col_video', icon: '🎬', label: 'ColVideo', page: '/column-components', description: 'Video thumbnail with auto-generated YouTube thumbnail support.' },
    ],
  },
  {
    type: 'column', label: 'Collections',
    items: [
      { id: 'col_array',              icon: '📝', label: 'ColArray',             page: '/column-components', description: 'Array as comma-separated text or inline badge chips with overflow.' },
      { id: 'col_array_count',        icon: '🔢', label: 'ColArrayCount',        page: '/column-components', description: 'Counts items in an array and displays count with optional suffix.' },
      { id: 'col_relationship_count', icon: '🔗', label: 'ColRelationshipCount', page: '/column-components', description: 'Relationship count as an indigo badge with optional suffix label.' },
      { id: 'col_row_number',         icon: '#️⃣', label: 'ColRowNumber',         page: '/column-components', description: 'Row index in muted monospace style for data table first columns.' },
      { id: 'col_json',               icon: '{ }', label: 'ColJson',             page: '/column-components', description: 'Pretty-printed JSON in a monospace block, collapsible by default.' },
    ],
  },
  {
    type: 'column', label: 'Rich Content',
    items: [
      { id: 'col_markdown',    icon: '📝', label: 'ColMarkdown',    page: '/column-components', description: 'Renders Markdown to HTML inline — headings, bold, lists, code, links.' },
      { id: 'col_custom_html', icon: '🧩', label: 'ColCustomHtml',  page: '/column-components', description: 'Renders raw HTML via v-html. Use only with trusted/sanitised content.' },
    ],
  },
  {
    type: 'column', label: 'Files & Uploads',
    items: [
      { id: 'col_upload',          icon: '📎', label: 'ColUpload',         page: '/column-components', description: 'File link with auto-detected icon by extension, opens in new tab.' },
      { id: 'col_upload_multiple', icon: '📂', label: 'ColUploadMultiple', page: '/column-components', description: 'Stacked list of file links from a JSON array of paths.' },
    ],
  },
  {
    type: 'column', label: 'Structured Data',
    items: [
      { id: 'col_date_range', icon: '📅', label: 'ColDateRange',  page: '/column-components', description: 'Two dates as a range with optional duration label.' },
      { id: 'col_table',      icon: '🗃️', label: 'ColTable',      page: '/column-components', description: 'JSON array of objects rendered as a compact inline table.' },
      { id: 'col_repeatable', icon: '🔁', label: 'ColRepeatable', page: '/column-components', description: 'JSON array rendered as stacked cards with labelled subfields.' },
    ],
  },
  {
    type: 'column', label: 'Special',
    items: [
      { id: 'col_base64_image',  icon: '🖼️', label: 'ColBase64Image',  page: '/column-components', description: 'Thumbnail from a base64-encoded string with lightbox, rounded, and ring.' },
      { id: 'col_slug',          icon: '🔗', label: 'ColSlug',          page: '/column-components', description: 'Slug in a monospace pill with muted prefix character and hover copy.' },
      { id: 'col_address_google',icon: '📍', label: 'ColAddressGoogle', page: '/column-components', description: 'Structured address display with a "View on map" Google Maps link.' },
    ],
  },
]

// ─── State ────────────────────────────────────────────────────────────────────

const navSearch  = ref('')
const gridSearch = ref('')
const typeFilter = ref<'all' | 'form' | 'column'>('all')

const allSections = computed<Section[]>(() => [...formGroups, ...columnGroups])

const formCount   = computed(() => formGroups.reduce((s, g) => s + g.items.length, 0))
const columnCount = computed(() => columnGroups.reduce((s, g) => s + g.items.length, 0))
const totalComponents = computed(() => formCount.value + columnCount.value)

// Sidebar filtered sections
const filteredSections = computed<Section[]>(() => {
  const q  = navSearch.value.toLowerCase()
  const tf = typeFilter.value
  return allSections.value
    .filter(s => tf === 'all' || s.type === tf)
    .map(s => ({
      ...s,
      items: s.items.filter(i =>
        !q || i.label.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
      ),
    }))
})

// Grid filtered sections
const filteredGridSections = computed<Section[]>(() => {
  const q  = gridSearch.value.toLowerCase()
  const tf = typeFilter.value
  return allSections.value
    .filter(s => tf === 'all' || s.type === tf)
    .map(s => ({
      ...s,
      items: s.items.filter(i =>
        !q || i.label.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
      ),
    }))
})

const filteredGridCount = computed(() =>
  filteredGridSections.value.reduce((s, g) => s + g.items.length, 0)
)
</script>
