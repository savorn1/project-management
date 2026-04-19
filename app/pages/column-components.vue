<template>
  <div class="flex gap-0 -m-6 min-h-[calc(100vh-4rem)]">

    <!-- ─── Left nav ─────────────────────────────────────────────── -->
    <aside class="w-64 flex-shrink-0 bg-slate-900/60 border-r border-slate-800/60 flex flex-col sticky top-0 h-[calc(100vh-4rem)]">
      <div class="px-4 pt-5 pb-3 border-b border-slate-800/60 flex-shrink-0">
        <h2 class="text-xs font-semibold text-gray-500 uppercase tracking-widest">Column Components</h2>
        <p class="text-xs text-gray-600 mt-0.5">{{ totalComponents }} display components</p>
        <div class="relative mt-3">
          <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input v-model="navSearch" type="text" placeholder="Search columns…"
            class="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
          <button v-if="navSearch" type="button" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300" @click="navSearch = ''">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>
      <nav class="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        <template v-for="group in filteredGroups" :key="group.label">
          <div v-if="group.items.length > 0">
            <p class="px-2 mb-1 text-[10px] font-semibold text-gray-600 uppercase tracking-widest">{{ group.label }}</p>
            <ul class="space-y-0.5">
              <li v-for="item in group.items" :key="item.id">
                <button type="button"
                  class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all text-left"
                  :class="active === item.id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-gray-400 hover:text-white hover:bg-slate-800'"
                  @click="active = item.id">
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

        <!-- Header -->
        <div>
          <div class="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <span>Column Components</span>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            <span class="text-gray-400">{{ activeGroup?.label }}</span>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            <span class="text-indigo-400 font-medium">{{ activeItem?.label }}</span>
          </div>
          <div class="flex items-start justify-between gap-4">
            <div>
              <h1 class="text-2xl font-bold text-white font-mono mb-1">{{ activeItem?.label }}</h1>
              <p class="text-gray-400 text-sm leading-relaxed">{{ activeItem?.description }}</p>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0 pt-1">
              <span class="text-xs text-gray-500 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg">Display only · no user input</span>
            </div>
          </div>
        </div>

        <!-- Preview grid -->
        <div class="grid gap-5 lg:grid-cols-5">
          <!-- Preview panel -->
          <div class="lg:col-span-3 bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
            <div class="flex items-center justify-between px-5 py-3 border-b border-slate-700/50">
              <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Preview</span>
              <span class="text-xs text-gray-600">Rendering example values</span>
            </div>
            <div class="p-6 space-y-4">

              <!-- ── text ── -->
              <template v-if="active === 'col_text'">
                <div class="space-y-3">
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Normal</span><ColText :value="'Hello, World!'" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Bold</span><ColText :value="'Important value'" :bold="true" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Muted</span><ColText :value="'Secondary info'" :muted="true" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Prefix/Suffix</span><ColText :value="'42'" prefix="$" suffix=" USD" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Truncated</span><ColText :value="'This is a very long string that gets truncated'" :limit="30" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Null</span><ColText :value="null" /></div>
                </div>
              </template>

              <!-- ── boolean ── -->
              <template v-else-if="active === 'col_boolean'">
                <div class="space-y-3">
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">True</span><ColBoolean :value="true" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">False</span><ColBoolean :value="false" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Custom labels</span><ColBoolean :value="true" true-label="Active" false-label="Inactive" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Null</span><ColBoolean :value="null" /></div>
                </div>
              </template>

              <!-- ── check ── -->
              <template v-else-if="active === 'col_check'">
                <div class="space-y-3">
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">True</span><ColCheck :value="true" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">False (dash)</span><ColCheck :value="false" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">False (icon)</span><ColCheck :value="false" :show-false="true" /></div>
                </div>
              </template>

              <!-- ── badge ── -->
              <template v-else-if="active === 'col_badge'">
                <div class="flex flex-wrap gap-2">
                  <ColBadge value="Default" color="slate" />
                  <ColBadge value="Primary" color="indigo" :dot="true" />
                  <ColBadge value="Success" color="emerald" :dot="true" />
                  <ColBadge value="Danger" color="rose" :dot="true" />
                  <ColBadge value="Warning" color="amber" :dot="true" />
                  <ColBadge value="Info" color="sky" :dot="true" />
                  <ColBadge value="Purple" color="violet" :dot="true" />
                  <ColBadge value="Orange" color="orange" :dot="true" />
                  <ColBadge :value="null" />
                </div>
              </template>

              <!-- ── enum ── -->
              <template v-else-if="active === 'col_enum'">
                <div class="space-y-3">
                  <div v-for="status in ['active','inactive','draft','pending','archived']" :key="status" class="flex items-center gap-4">
                    <span class="text-xs text-gray-500 w-20 font-mono">{{ status }}</span>
                    <ColEnum :value="status" :options="statusOptions" :colors="statusColors" />
                  </div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-20">null</span><ColEnum :value="null" :options="statusOptions" :colors="statusColors" /></div>
                </div>
              </template>

              <!-- ── date ── -->
              <template v-else-if="active === 'col_date'">
                <div class="space-y-3">
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-32">Default</span><ColDate value="2025-04-18" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-32">Long</span><ColDate value="2025-04-18" :format="{ year:'numeric', month:'long', day:'numeric' }" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-32">Short</span><ColDate value="2025-04-18" :format="{ year:'2-digit', month:'2-digit', day:'2-digit' }" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-32">Null</span><ColDate :value="null" /></div>
                </div>
              </template>

              <!-- ── datetime ── -->
              <template v-else-if="active === 'col_datetime'">
                <div class="space-y-3">
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-32">Absolute</span><ColDatetime value="2025-04-18T09:30:00" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-32">Relative</span><ColDatetime value="2025-04-18T09:30:00" :relative="true" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-32">Null</span><ColDatetime :value="null" /></div>
                </div>
              </template>

              <!-- ── time ── -->
              <template v-else-if="active === 'col_time'">
                <div class="space-y-3">
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-32">24h</span><ColTime value="14:30" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-32">12h (AM)</span><ColTime value="09:15" :use24h="false" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-32">12h (PM)</span><ColTime value="14:30" :use24h="false" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-32">Null</span><ColTime :value="null" /></div>
                </div>
              </template>

              <!-- ── month ── -->
              <template v-else-if="active === 'col_month'">
                <div class="space-y-3">
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Long</span><ColMonth value="2025-04" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Short</span><ColMonth value="2025-04" month-format="short" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Numeric</span><ColMonth value="2025-04" month-format="numeric" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Null</span><ColMonth :value="null" /></div>
                </div>
              </template>

              <!-- ── week ── -->
              <template v-else-if="active === 'col_week'">
                <div class="space-y-3">
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Value</span><ColWeek value="2025-W18" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Null</span><ColWeek :value="null" /></div>
                </div>
              </template>

              <!-- ── email ── -->
              <template v-else-if="active === 'col_email'">
                <div class="space-y-3">
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Link</span><ColEmail value="savorn@example.com" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Truncated</span><ColEmail value="very.long.email.address@company.example.com" :limit="28" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Null</span><ColEmail :value="null" /></div>
                </div>
              </template>

              <!-- ── phone ── -->
              <template v-else-if="active === 'col_phone'">
                <div class="space-y-3">
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Link</span><ColPhone value="+855 12 345 678" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Null</span><ColPhone :value="null" /></div>
                </div>
              </template>

              <!-- ── url ── -->
              <template v-else-if="active === 'col_url'">
                <div class="space-y-3">
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Auto label</span><ColUrl value="https://backpackforlaravel.com" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Custom label</span><ColUrl value="https://github.com" label="View on GitHub" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Null</span><ColUrl :value="null" /></div>
                </div>
              </template>

              <!-- ── image ── -->
              <template v-else-if="active === 'col_image'">
                <div class="space-y-3">
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-36">cover (default)</span><ColImage value="https://picsum.photos/seed/a/160/160" :height="48" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-36">contain</span><ColImage value="https://picsum.photos/seed/b/160/80" :height="48" fit="contain" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-36">rounded-full (circle)</span><ColImage value="https://picsum.photos/seed/c/160/160" :height="48" rounded="full" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-36">rounded-xl</span><ColImage value="https://picsum.photos/seed/d/160/160" :height="48" rounded="xl" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-36">with ring</span><ColImage value="https://picsum.photos/seed/e/160/160" :height="48" rounded="full" :ring="true" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-36">broken src</span><ColImage value="https://broken.invalid/img.jpg" :height="48" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-36">null</span><ColImage :value="null" :height="48" /></div>
                </div>
              </template>

              <!-- ── number ── -->
              <template v-else-if="active === 'col_number'">
                <div class="space-y-3">
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-32">Integer</span><ColNumber :value="1234567" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-32">Decimals</span><ColNumber :value="9999.99" :decimals="2" prefix="$" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-32">With suffix</span><ColNumber :value="85" suffix="%" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-32">Compact (K)</span><ColNumber :value="4500" :compact="true" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-32">Compact (M)</span><ColNumber :value="2400000" :compact="true" prefix="$" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-32">Null</span><ColNumber :value="null" /></div>
                </div>
              </template>

              <!-- ── color ── -->
              <template v-else-if="active === 'col_color'">
                <div class="space-y-3">
                  <div v-for="hex in ['#6366f1','#22c55e','#ef4444','#f97316','#06b6d4']" :key="hex" class="flex items-center gap-4">
                    <span class="text-xs text-gray-500 w-24 font-mono">{{ hex }}</span>
                    <ColColor :value="hex" />
                  </div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-24">Null</span><ColColor :value="null" /></div>
                </div>
              </template>

              <!-- ── password ── -->
              <template v-else-if="active === 'col_password'">
                <div class="space-y-3">
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Dots</span><ColPassword value="secret123" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Stars</span><ColPassword value="secret123" char="*" :length="10" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Null</span><ColPassword :value="null" /></div>
                </div>
              </template>

              <!-- ── range ── -->
              <template v-else-if="active === 'col_range'">
                <div class="space-y-4">
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">40%</span><ColRange :value="40" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">75% emerald</span><ColRange :value="75" color="emerald" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">95% rose</span><ColRange :value="95" color="rose" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Max shown</span><ColRange :value="7" :max="10" :show-max="true" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Null</span><ColRange :value="null" /></div>
                </div>
              </template>

              <!-- ── array ── -->
              <template v-else-if="active === 'col_array'">
                <div class="space-y-4">
                  <div class="flex items-start gap-4"><span class="text-xs text-gray-500 w-28 mt-0.5">Text list</span><ColArray :value="['Vue.js','TypeScript','Tailwind','NestJS']" /></div>
                  <div class="flex items-start gap-4"><span class="text-xs text-gray-500 w-28 mt-0.5">Badges</span><ColArray :value="['Frontend','Backend','DevOps','Design','QA']" :as-badges="true" /></div>
                  <div class="flex items-start gap-4"><span class="text-xs text-gray-500 w-28 mt-0.5">Overflow (3)</span><ColArray :value="['A','B','C','D','E','F','G']" :limit="3" :as-badges="true" /></div>
                  <div class="flex items-start gap-4"><span class="text-xs text-gray-500 w-28 mt-0.5">Null</span><ColArray :value="null" /></div>
                </div>
              </template>

              <!-- ── array_count ── -->
              <template v-else-if="active === 'col_array_count'">
                <div class="space-y-3">
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Array</span><ColArrayCount :value="['a','b','c','d']" suffix="files" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Number</span><ColArrayCount :value="12" suffix="records" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Null</span><ColArrayCount :value="null" /></div>
                </div>
              </template>

              <!-- ── relationship_count ── -->
              <template v-else-if="active === 'col_relationship_count'">
                <div class="space-y-3">
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">With suffix</span><ColRelationshipCount :value="7" suffix="members" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Zero</span><ColRelationshipCount :value="0" suffix="tasks" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Null</span><ColRelationshipCount :value="null" /></div>
                </div>
              </template>

              <!-- ── row_number ── -->
              <template v-else-if="active === 'col_row_number'">
                <div class="space-y-3">
                  <div v-for="n in [1,2,3,4,5]" :key="n" class="flex items-center gap-4">
                    <span class="text-xs text-gray-500 w-24">Row {{ n }}</span>
                    <ColRowNumber :value="n" />
                  </div>
                </div>
              </template>

              <!-- ── json ── -->
              <template v-else-if="active === 'col_json'">
                <div class="space-y-4">
                  <div class="flex items-start gap-4"><span class="text-xs text-gray-500 w-28 mt-1">Collapsible</span><ColJson :value='jsonSample' :collapsible="true" /></div>
                  <div class="flex items-start gap-4"><span class="text-xs text-gray-500 w-28 mt-1">Always open</span><ColJson :value='{ "count": 3 }' :collapsible="false" /></div>
                  <div class="flex items-start gap-4"><span class="text-xs text-gray-500 w-28 mt-1">Null</span><ColJson :value="null" /></div>
                </div>
              </template>

              <!-- ── video ── -->
              <template v-else-if="active === 'col_video'">
                <div class="space-y-3">
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">YouTube</span><ColVideo value="https://www.youtube.com/watch?v=dQw4w9WgXcQ" :height="50" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">URL only</span><ColVideo value="https://example.com/video.mp4" :height="50" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Null</span><ColVideo :value="null" /></div>
                </div>
              </template>

              <!-- ── upload ── -->
              <template v-else-if="active === 'col_upload'">
                <div class="space-y-3">
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">PDF</span><ColUpload value="reports/annual-report-2024.pdf" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Image</span><ColUpload value="uploads/banner.png" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Archive</span><ColUpload value="exports/data-backup.zip" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Custom label</span><ColUpload value="https://example.com/file.xlsx" label="Download Report" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Null</span><ColUpload :value="null" /></div>
                </div>
              </template>

              <!-- ── upload_multiple ── -->
              <template v-else-if="active === 'col_upload_multiple'">
                <div class="space-y-3">
                  <ColUploadMultiple :value="['docs/brief.pdf','images/hero.png','data/export.csv','scripts/deploy.sh']" :limit="3" />
                  <div class="mt-2"><ColUploadMultiple :value="null" /></div>
                </div>
              </template>

              <!-- ── date_range ── -->
              <template v-else-if="active === 'col_date_range'">
                <div class="space-y-3">
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-32">Range</span><ColDateRange start="2025-04-01" end="2025-04-30" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-32">With duration</span><ColDateRange start="2025-06-01" end="2025-08-31" :show-duration="true" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-32">Open end</span><ColDateRange start="2025-01-01" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-32">Null</span><ColDateRange :value="null" /></div>
                </div>
              </template>

              <!-- ── table ── -->
              <template v-else-if="active === 'col_table'">
                <div class="space-y-4">
                  <ColTable :value="tableSample" />
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Custom cols</span><ColTable :value="tableSample" :columns="['name','rate']" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Null</span><ColTable :value="null" /></div>
                </div>
              </template>

              <!-- ── repeatable ── -->
              <template v-else-if="active === 'col_repeatable'">
                <ColRepeatable
                  :value="repeatableSample"
                  :fields="[{ key: 'item', label: 'Item' }, { key: 'qty', label: 'Qty' }, { key: 'price', label: 'Price' }]"
                />
              </template>

              <!-- ── base64_image ── -->
              <template v-else-if="active === 'col_base64_image'">
                <div class="space-y-3">
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Square</span><ColBase64Image :value="base64Sample" :height="48" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Circle</span><ColBase64Image :value="base64Sample" :height="48" rounded="full" :ring="true" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Null</span><ColBase64Image :value="null" /></div>
                </div>
              </template>

              <!-- ── slug ── -->
              <template v-else-if="active === 'col_slug'">
                <div class="space-y-3">
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Default</span><ColSlug value="my-awesome-post" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Custom prefix</span><ColSlug value="products/red-sneakers" prefix="" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Hash prefix</span><ColSlug value="section-overview" prefix="#" /></div>
                  <div class="flex items-center gap-4"><span class="text-xs text-gray-500 w-28">Null</span><ColSlug :value="null" /></div>
                </div>
              </template>

              <!-- ── address_google ── -->
              <template v-else-if="active === 'col_address_google'">
                <div class="space-y-4">
                  <div class="flex items-start gap-4"><span class="text-xs text-gray-500 w-28 mt-1">Full address</span><ColAddressGoogle :value="addressSample" /></div>
                  <div class="flex items-start gap-4"><span class="text-xs text-gray-500 w-28 mt-1">JSON string</span><ColAddressGoogle value='{"street":"456 Monivong Blvd","city":"Phnom Penh","country":"Cambodia"}' /></div>
                  <div class="flex items-start gap-4"><span class="text-xs text-gray-500 w-28 mt-1">Null</span><ColAddressGoogle :value="null" /></div>
                </div>
              </template>

              <!-- ── markdown ── -->
              <template v-else-if="active === 'col_markdown'">
                <ColMarkdown :value="markdownSample" />
              </template>

              <!-- ── custom_html ── -->
              <template v-else-if="active === 'col_custom_html'">
                <div class="space-y-4">
                  <div class="flex items-start gap-4">
                    <span class="text-xs text-gray-500 w-28 mt-1">HTML</span>
                    <ColCustomHtml value='<span class="text-emerald-400 font-semibold">✓ Verified</span> &nbsp; <span class="text-xs text-gray-400">by admin on Apr 18</span>' />
                  </div>
                  <div class="flex items-start gap-4">
                    <span class="text-xs text-gray-500 w-28 mt-1">Badge HTML</span>
                    <ColCustomHtml value='<span style="background:#6366f1;color:#fff;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600">In Progress</span>' />
                  </div>
                  <div class="flex items-start gap-4"><span class="text-xs text-gray-500 w-28 mt-1">Null</span><ColCustomHtml :value="null" /></div>
                </div>
              </template>

            </div>
          </div>

          <!-- Props / Usage inspector -->
          <div class="lg:col-span-2 bg-slate-900/70 border border-slate-800/60 rounded-2xl flex flex-col overflow-hidden">
            <!-- Tab bar -->
            <div class="flex border-b border-slate-800/60 flex-shrink-0">
              <button
                v-for="tab in ['props', 'usage']"
                :key="tab"
                type="button"
                class="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors capitalize"
                :class="activeTab === tab
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'"
                @click="activeTab = tab as 'props' | 'usage'"
              >{{ tab }}</button>
              <div class="flex-1" />
              <button
                v-if="activeTab === 'usage' && activeItem?.usage"
                type="button"
                class="px-3 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                @click="copyUsage"
              >{{ copied ? '✓ Copied' : 'Copy' }}</button>
            </div>

            <!-- Props table -->
            <div v-if="activeTab === 'props'" class="overflow-x-auto flex-1">
              <table class="w-full text-xs">
                <thead>
                  <tr class="bg-slate-800/60">
                    <th class="px-3 py-2 text-left text-gray-500 font-semibold">Prop</th>
                    <th class="px-3 py-2 text-left text-gray-500 font-semibold">Type</th>
                    <th class="px-3 py-2 text-left text-gray-500 font-semibold">Default</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/60">
                  <tr v-for="prop in activeItem?.props" :key="prop.name" class="hover:bg-slate-800/30 transition-colors">
                    <td class="px-3 py-2"><code class="text-indigo-300 font-mono">{{ prop.name }}</code></td>
                    <td class="px-3 py-2"><code class="text-amber-300 font-mono whitespace-nowrap">{{ prop.type }}</code></td>
                    <td class="px-3 py-2">
                      <code v-if="prop.default !== undefined" class="text-emerald-400 font-mono">{{ prop.default }}</code>
                      <span v-else class="text-gray-600">—</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Usage code -->
            <div v-else-if="activeTab === 'usage'" class="flex-1 overflow-auto">
              <pre class="text-xs text-indigo-300 font-mono p-4 whitespace-pre leading-relaxed">{{ activeItem?.usage }}</pre>
            </div>
          </div>
        </div>

        <!-- Tab bar (Props / Notes) below the grid -->
        <div v-if="activeItem?.notes?.length" class="border-b border-slate-800/60">
          <div class="flex gap-1">
            <button type="button"
              class="px-4 py-2.5 text-sm font-medium border-b-2 transition-colors"
              :class="activeBottomTab === 'notes' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-300'"
              @click="activeBottomTab = 'notes'">
              Notes <span class="ml-1 text-xs text-gray-600">({{ activeItem.notes.length }})</span>
            </button>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="activeItem?.notes?.length" class="space-y-3">
          <div v-for="(note, i) in activeItem.notes" :key="i" class="flex gap-3 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
            <svg class="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-sm text-gray-300 leading-relaxed">{{ note }}</p>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface PropDef { name: string; type: string; default?: string; description?: string }
interface NavItem {
  id: string; icon: string; label: string; description: string; isNew?: boolean
  props: PropDef[]; notes?: string[]; usage?: string
}
interface NavGroup { label: string; items: NavItem[] }

// ─── Demo data ────────────────────────────────────────────────────────────────

const statusOptions: Record<string, string> = {
  active: 'Active', inactive: 'Inactive', draft: 'Draft',
  pending: 'Pending', archived: 'Archived',
}
type ColColorName = 'slate' | 'indigo' | 'emerald' | 'rose' | 'amber' | 'sky' | 'violet' | 'orange'
const statusColors: Partial<Record<string, ColColorName>> = {
  active: 'emerald', inactive: 'rose', draft: 'slate',
  pending: 'amber', archived: 'slate',
}

const jsonSample = { name: 'TaskFlow', version: '1.0', features: ['kanban', 'chat', 'reports'] }

const tableSample = [
  { name: 'Alice', role: 'Developer', rate: '$120/h' },
  { name: 'Bob', role: 'Designer', rate: '$95/h' },
  { name: 'Carol', role: 'Manager', rate: '$110/h' },
]

const repeatableSample = [
  { item: 'NestJS License', qty: 1, price: '$299' },
  { item: 'Tailwind UI', qty: 2, price: '$149' },
  { item: 'Figma Pro', qty: 5, price: '$45' },
]

const base64Sample = 'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNk+M9Qz0AEYBxVSF+FABJYApTFLkN3AAAAAElFTkSuQmCC'

const addressSample = { street: '123 Norodom Blvd', city: 'Phnom Penh', state: '', zip: '12000', country: 'Cambodia', lat: 11.5564, lng: 104.9282 }

const markdownSample = `## Overview

This is a **markdown** column. It converts raw markdown to *rendered HTML* inline.

- Supports \`inline code\`
- **Bold** and *italic*
- [Links](https://example.com) open in new tab
`

// ─── Nav groups ───────────────────────────────────────────────────────────────

const groups: NavGroup[] = [
  {
    label: 'Text & Numbers',
    items: [
      {
        id: 'col_text', icon: '🔤', label: 'ColText', isNew: true,
        description: 'Plain text display with optional prefix, suffix, truncation limit, bold, and muted variants.',
        props: [
          { name: 'value', type: 'string | number | null' },
          { name: 'prefix', type: 'string' },
          { name: 'suffix', type: 'string' },
          { name: 'limit', type: 'number', default: '0', description: '0 = no truncation' },
          { name: 'bold', type: 'boolean', default: 'false' },
          { name: 'muted', type: 'boolean', default: 'false' },
        ],
        notes: ['Null/undefined/empty string renders a grey "—" dash.', 'Hover to reveal a copy icon — copies the full raw value. When truncated, hovering also shows a native tooltip with the full text.'],
        usage: `<ColText :value="row.title" />

<!-- with prefix/suffix -->
<ColText :value="row.amount" prefix="$" suffix=" USD" />

<!-- truncate at 40 chars -->
<ColText :value="row.description" :limit="40" />

<!-- bold or muted variants -->
<ColText :value="row.name" :bold="true" />
<ColText :value="row.meta" :muted="true" />`,
      },
      {
        id: 'col_number', icon: '🔢', label: 'ColNumber', isNew: true,
        description: 'Locale-formatted number with optional decimal places, prefix, and suffix.',
        props: [
          { name: 'value', type: 'number | string | null' },
          { name: 'decimals', type: 'number', description: 'Fixed decimal places' },
          { name: 'prefix', type: 'string' },
          { name: 'suffix', type: 'string' },
          { name: 'locale', type: 'string', default: '"en-US"' },
          { name: 'compact', type: 'boolean', default: 'false', description: '4500 → 4.5K, 1500000 → 1.5M' },
        ],
        notes: ['Uses Intl.NumberFormat — thousands separators follow the locale.', 'Copy on hover copies the raw numeric value.'],
        usage: `<ColNumber :value="row.count" />

<!-- currency -->
<ColNumber :value="row.price" :decimals="2" prefix="$" />

<!-- percentage -->
<ColNumber :value="row.progress" suffix="%" />

<!-- compact notation: 4500 → 4.5K -->
<ColNumber :value="row.views" :compact="true" />

<!-- custom locale -->
<ColNumber :value="row.amount" locale="de-DE" />`,
      },
      {
        id: 'col_password', icon: '🔑', label: 'ColPassword', isNew: true,
        description: 'Renders a fixed-length masking character string regardless of the actual value.',
        props: [
          { name: 'value', type: 'string | null' },
          { name: 'char', type: 'string', default: '"•"' },
          { name: 'length', type: 'number', default: '8' },
        ],
        usage: `<ColPassword :value="row.password" />

<!-- custom mask character and length -->
<ColPassword :value="row.secret" char="*" :length="12" />`,
      },
    ],
  },
  {
    label: 'Status & Badges',
    items: [
      {
        id: 'col_boolean', icon: '✅', label: 'ColBoolean', isNew: true,
        description: 'Displays a coloured pill badge: green "Yes" for true, red "No" for false.',
        props: [
          { name: 'value', type: 'boolean | number | null' },
          { name: 'trueLabel', type: 'string', default: '"Yes"' },
          { name: 'falseLabel', type: 'string', default: '"No"' },
        ],
        usage: `<ColBoolean :value="row.isActive" />

<!-- custom labels -->
<ColBoolean
  :value="row.published"
  true-label="Published"
  false-label="Draft"
/>`,
      },
      {
        id: 'col_check', icon: '☑️', label: 'ColCheck', isNew: true,
        description: 'Checkmark circle icon for true. False shows a dash by default, or an × icon when showFalse is set.',
        props: [
          { name: 'value', type: 'boolean | number | null' },
          { name: 'showFalse', type: 'boolean', default: 'false' },
          { name: 'trueColor', type: 'string', default: '"text-emerald-400"' },
          { name: 'falseColor', type: 'string', default: '"text-rose-400"' },
        ],
        usage: `<ColCheck :value="row.completed" />

<!-- show × icon when false -->
<ColCheck :value="row.verified" :show-false="true" />

<!-- custom colours -->
<ColCheck
  :value="row.enabled"
  true-color="text-sky-400"
  false-color="text-gray-600"
/>`,
      },
      {
        id: 'col_badge', icon: '🏷️', label: 'ColBadge', isNew: true,
        description: 'Generic coloured badge in 8 preset colour schemes. Supports an optional dot indicator.',
        props: [
          { name: 'value', type: 'string | number | null' },
          { name: 'color', type: '"slate"|"indigo"|"emerald"|"rose"|"amber"|"sky"|"violet"|"orange"', default: '"slate"' },
          { name: 'dot', type: 'boolean', default: 'false' },
        ],
        usage: `<ColBadge value="Active" color="emerald" />

<!-- with dot indicator -->
<ColBadge value="In Progress" color="indigo" :dot="true" />

<!-- danger / warning -->
<ColBadge value="Overdue" color="rose" :dot="true" />
<ColBadge value="Pending" color="amber" />`,
      },
      {
        id: 'col_enum', icon: '📋', label: 'ColEnum', isNew: true,
        description: 'Resolves a raw value to a human label via an options map and colours it via a separate color map.',
        props: [
          { name: 'value', type: 'string | number | null' },
          { name: 'options', type: 'Record<string, string>', default: '{}' },
          { name: 'colors', type: 'Partial<Record<string, ColorName>>', default: '{}' },
          { name: 'defaultColor', type: 'ColorName', default: '"slate"' },
        ],
        notes: ['If the value key is not found in options, the raw value is shown. If not in colors, defaultColor is used.'],
        usage: `<ColEnum
  :value="row.status"
  :options="{ active: 'Active', inactive: 'Inactive', draft: 'Draft' }"
  :colors="{ active: 'emerald', inactive: 'rose', draft: 'slate' }"
/>

<!-- without color map (all slate) -->
<ColEnum :value="row.role" :options="roleLabels" />`,
      },
      {
        id: 'col_color', icon: '🎨', label: 'ColColor', isNew: true,
        description: 'Colour swatch box with optional hex code label.',
        props: [
          { name: 'value', type: 'string | null', description: 'Hex colour e.g. "#6366f1"' },
          { name: 'showHex', type: 'boolean', default: 'true' },
        ],
        usage: `<ColColor :value="row.brandColor" />

<!-- swatch only, no hex label -->
<ColColor :value="row.color" :show-hex="false" />`,
      },
      {
        id: 'col_range', icon: '📊', label: 'ColRange', isNew: true,
        description: 'Horizontal progress bar for numeric values with configurable min/max and colour.',
        props: [
          { name: 'value', type: 'number | null' },
          { name: 'min', type: 'number', default: '0' },
          { name: 'max', type: 'number', default: '100' },
          { name: 'showValue', type: 'boolean', default: 'true' },
          { name: 'showMax', type: 'boolean', default: 'false', description: 'Show "value/max" instead of just value' },
          { name: 'color', type: '"indigo"|"emerald"|"amber"|"rose"|"sky"', default: '"indigo"' },
        ],
        notes: ['Bar animates from 0 to the target value on mount with a 0.6s ease transition.'],
        usage: `<ColRange :value="row.progress" />

<!-- green bar, show x/100 -->
<ColRange :value="row.score" color="emerald" :show-max="true" />

<!-- custom max -->
<ColRange :value="row.level" :max="10" color="amber" :show-max="true" />`,
      },
    ],
  },
  {
    label: 'Date & Time',
    items: [
      {
        id: 'col_date', icon: '📅', label: 'ColDate', isNew: true,
        description: 'Locale-formatted date from any ISO or parseable date string.',
        props: [
          { name: 'value', type: 'string | null', description: '"YYYY-MM-DD" or any Date-parseable string' },
          { name: 'format', type: 'Intl.DateTimeFormatOptions', description: 'Default: { year, month: short, day }' },
          { name: 'locale', type: 'string', default: '"en-US"' },
        ],
        usage: `<ColDate :value="row.dueDate" />

<!-- long format: "April 18, 2025" -->
<ColDate
  :value="row.createdAt"
  :format="{ year: 'numeric', month: 'long', day: 'numeric' }"
/>

<!-- numeric short: "04/18/25" -->
<ColDate
  :value="row.date"
  :format="{ year: '2-digit', month: '2-digit', day: '2-digit' }"
/>`,
      },
      {
        id: 'col_datetime', icon: '⏰', label: 'ColDatetime', isNew: true,
        description: 'Locale-formatted datetime. Supports absolute display or relative ("2 hours ago") mode.',
        props: [
          { name: 'value', type: 'string | null' },
          { name: 'format', type: 'Intl.DateTimeFormatOptions' },
          { name: 'locale', type: 'string', default: '"en-US"' },
          { name: 'relative', type: 'boolean', default: 'false', description: 'Show relative time e.g. "3 days ago"' },
        ],
        notes: ['Relative mode uses Intl.RelativeTimeFormat. Granularity: minutes → hours → days.', 'In relative mode, hovering shows the absolute datetime as a native tooltip.'],
        usage: `<ColDatetime :value="row.createdAt" />

<!-- relative: "3 days ago" -->
<ColDatetime :value="row.updatedAt" :relative="true" />

<!-- custom format -->
<ColDatetime
  :value="row.scheduledAt"
  :format="{ dateStyle: 'short', timeStyle: 'short' }"
/>`,
      },
      {
        id: 'col_time', icon: '⏱️', label: 'ColTime', isNew: true,
        description: 'Displays "HH:mm" time in 24-hour or 12-hour (AM/PM) format.',
        props: [
          { name: 'value', type: 'string | null', description: '"HH:mm" or "HH:mm:ss"' },
          { name: 'use24h', type: 'boolean', default: 'true' },
        ],
        usage: `<!-- 24-hour: "14:30" -->
<ColTime :value="row.startTime" />

<!-- 12-hour: "2:30 PM" -->
<ColTime :value="row.startTime" :use24h="false" />`,
      },
      {
        id: 'col_month', icon: '🗓️', label: 'ColMonth', isNew: true,
        description: 'Renders a "YYYY-MM" month string as a human-readable date like "April 2025".',
        props: [
          { name: 'value', type: 'string | null', description: '"YYYY-MM"' },
          { name: 'monthFormat', type: '"long"|"short"|"numeric"', default: '"long"' },
        ],
        usage: `<!-- "April 2025" -->
<ColMonth :value="row.billingMonth" />

<!-- "Apr 2025" -->
<ColMonth :value="row.billingMonth" month-format="short" />

<!-- "4/2025" -->
<ColMonth :value="row.billingMonth" month-format="numeric" />`,
      },
      {
        id: 'col_week', icon: '📆', label: 'ColWeek', isNew: true,
        description: 'Renders a "YYYY-Www" ISO week string as "Week 18, 2025".',
        props: [
          { name: 'value', type: 'string | null', description: '"YYYY-Www" e.g. "2025-W18"' },
        ],
        usage: `<!-- "Week 18, 2025" -->
<ColWeek :value="row.sprintWeek" />`,
      },
    ],
  },
  {
    label: 'Links & Contact',
    items: [
      {
        id: 'col_email', icon: '📧', label: 'ColEmail', isNew: true,
        description: 'Clickable mailto: link with optional truncation.',
        props: [
          { name: 'value', type: 'string | null' },
          { name: 'limit', type: 'number', default: '0' },
        ],
        notes: ['Hover to reveal a copy icon — copies the full email address to the clipboard.'],
        usage: `<ColEmail :value="row.email" />

<!-- truncate long addresses -->
<ColEmail :value="row.email" :limit="28" />`,
      },
      {
        id: 'col_phone', icon: '📱', label: 'ColPhone', isNew: true,
        description: 'Clickable tel: link. Strips whitespace from the href for compatibility.',
        props: [
          { name: 'value', type: 'string | null' },
        ],
        usage: `<ColPhone :value="row.phone" />`,
      },
      {
        id: 'col_url', icon: '🔗', label: 'ColUrl', isNew: true,
        description: 'Clickable external link that opens in a new tab. Defaults to showing the hostname.',
        props: [
          { name: 'value', type: 'string | null' },
          { name: 'label', type: 'string', description: 'Custom link text (overrides hostname)' },
        ],
        notes: ['Uses rel="noopener noreferrer" on the anchor for security.', 'Hover to reveal a copy icon — copies the full URL to the clipboard.'],
        usage: `<!-- shows hostname as label -->
<ColUrl :value="row.website" />

<!-- custom label -->
<ColUrl :value="row.docsUrl" label="View Docs" />`,
      },
    ],
  },
  {
    label: 'Media',
    items: [
      {
        id: 'col_image', icon: '🖼️', label: 'ColImage', isNew: true,
        description: 'Thumbnail image with a click-to-expand lightbox overlay.',
        props: [
          { name: 'value', type: 'string | null', description: 'Absolute URL or relative path' },
          { name: 'height', type: 'number', default: '40' },
          { name: 'width', type: 'number' },
          { name: 'maxWidth', type: 'number', default: '120' },
          { name: 'alt', type: 'string', default: '""' },
          { name: 'fit', type: '"cover"|"contain"|"fill"|"scale-down"', default: '"cover"' },
          { name: 'rounded', type: '"none"|"sm"|"md"|"lg"|"xl"|"full"', default: '"md"', description: '"full" forces a circle (equal width/height)' },
          { name: 'ring', type: 'boolean', default: 'false', description: 'Adds a subtle ring border' },
        ],
        notes: ['Clicking the thumbnail opens a full-screen lightbox with a close button. Click backdrop to dismiss.', 'If the image fails to load, a warning icon placeholder is shown.', 'rounded="full" auto-constrains width to height for a perfect circle.'],
        usage: `<ColImage :value="row.avatar" />

<!-- avatar circle with ring -->
<ColImage :value="row.photo" :height="40" rounded="full" :ring="true" />

<!-- banner with contain fit -->
<ColImage :value="row.logo" :height="48" fit="contain" rounded="lg" />

<!-- large rounded thumbnail -->
<ColImage :value="row.cover" :height="80" rounded="xl" :alt="row.title" />`,
      },
      {
        id: 'col_video', icon: '🎬', label: 'ColVideo', isNew: true,
        description: 'Video thumbnail link. Auto-generates a YouTube thumbnail when the URL is a YouTube link.',
        props: [
          { name: 'value', type: 'string | null', description: 'Video URL or JSON { url, provider }' },
          { name: 'height', type: 'number', default: '40' },
        ],
        notes: ['YouTube thumbnails are fetched via img.youtube.com — no API key needed.', 'Vimeo thumbnails are fetched via the vimeo.com/api/oembed.json endpoint — no API key needed, but requires a network request on mount.'],
        usage: `<ColVideo :value="row.videoUrl" />

<!-- taller thumbnail -->
<ColVideo :value="row.demo" :height="60" />

<!-- JSON { url, provider } format -->
<ColVideo :value='JSON.stringify({ url: row.url, provider: "youtube" })' />`,
      },
    ],
  },
  {
    label: 'Collections',
    items: [
      {
        id: 'col_array', icon: '📝', label: 'ColArray', isNew: true,
        description: 'Renders an array as comma-separated text or inline badge chips.',
        props: [
          { name: 'value', type: 'unknown[] | string | null', description: 'Array or JSON string' },
          { name: 'separator', type: 'string', default: '", "' },
          { name: 'asBadges', type: 'boolean', default: 'false' },
          { name: 'limit', type: 'number', default: '5', description: 'Items to show before "+N more"' },
        ],
        notes: ['Hovering the "+N more" chip shows the remaining items as a native tooltip.'],
        usage: `<!-- comma-separated text -->
<ColArray :value="row.tags" />

<!-- badge chips with overflow -->
<ColArray :value="row.skills" :as-badges="true" :limit="3" />

<!-- custom separator -->
<ColArray :value="row.items" separator=" · " />`,
      },
      {
        id: 'col_array_count', icon: '🔢', label: 'ColArrayCount', isNew: true,
        description: 'Counts items in an array (or JSON-string array) and displays the count with an optional suffix.',
        props: [
          { name: 'value', type: 'unknown[] | string | number | null' },
          { name: 'suffix', type: 'string' },
        ],
        usage: `<ColArrayCount :value="row.attachments" suffix="files" />

<!-- accepts a plain number too -->
<ColArrayCount :value="row.memberCount" suffix="members" />`,
      },
      {
        id: 'col_relationship_count', icon: '🔗', label: 'ColRelationshipCount', isNew: true,
        description: 'Displays a relationship count as an indigo badge with an optional suffix label.',
        props: [
          { name: 'value', type: 'number | null' },
          { name: 'suffix', type: 'string', default: '"items"' },
        ],
        usage: `<ColRelationshipCount :value="row.tasksCount" suffix="tasks" />

<ColRelationshipCount :value="row.membersCount" suffix="members" />`,
      },
      {
        id: 'col_row_number', icon: '#️⃣', label: 'ColRowNumber', isNew: true,
        description: 'Row index number in a muted monospace style. Used as the first column of data tables.',
        props: [
          { name: 'value', type: 'number | null' },
        ],
        usage: `<ColRowNumber :value="index + 1" />`,
      },
      {
        id: 'col_json', icon: '{ }', label: 'ColJson', isNew: true,
        description: 'Pretty-printed JSON in a monospace code block. Collapsible by default.',
        props: [
          { name: 'value', type: 'string | object | null', description: 'JSON string or parsed object' },
          { name: 'collapsible', type: 'boolean', default: 'true' },
          { name: 'maxHeight', type: 'number', default: '200' },
        ],
        notes: ['Syntax highlighted — keys indigo, strings amber, numbers sky, booleans emerald/rose, null slate.'],
        usage: `<!-- collapsible (default) -->
<ColJson :value="row.meta" />

<!-- always expanded -->
<ColJson :value="row.config" :collapsible="false" />

<!-- accepts parsed object or JSON string -->
<ColJson :value='{ "key": "value" }' />`,
      },
    ],
  },
  {
    label: 'Rich Content',
    items: [
      {
        id: 'col_markdown', icon: '📝', label: 'ColMarkdown', isNew: true,
        description: 'Renders a Markdown string to HTML inline — headings, bold, italic, lists, code, and links.',
        props: [
          { name: 'value', type: 'string | null' },
          { name: 'limit', type: 'number', default: '0', description: 'Truncate source before rendering' },
        ],
        notes: ['Uses a lightweight regex-based Markdown parser. No external library needed.', 'Only use with trusted content — HTML tags in the source are escaped.'],
        usage: `<ColMarkdown :value="row.description" />

<!-- truncate long content -->
<ColMarkdown :value="row.notes" :limit="500" />`,
      },
      {
        id: 'col_custom_html', icon: '🧩', label: 'ColCustomHtml', isNew: true,
        description: 'Renders raw HTML via v-html. Use only with server-sanitised or trusted content.',
        props: [
          { name: 'value', type: 'string | null', description: 'Raw HTML string rendered unescaped' },
        ],
        notes: ['⚠️ This component uses v-html and is vulnerable to XSS if passed untrusted user input. Always sanitise on the server before using.'],
        usage: `<!-- simple badge from backend -->
<ColCustomHtml :value="row.statusHtml" />

<!-- coloured pill -->
<!-- value: '<span style="background:#6366f1;color:#fff;padding:2px 10px;border-radius:999px;font-size:11px;font-weight:600">In Progress</span>' -->

<!-- verified label with icon -->
<!-- value: '<span style="color:#34d399">✓ Verified</span>' -->

<!-- multiple inline elements -->
<!-- value: '<strong style="color:#f59e0b">⚠ Needs Review</strong> <span style="color:#6b7280;font-size:11px">— flagged by system</span>' -->

<!-- link -->
<!-- value: '<a href="/admin/users/42" style="color:#818cf8">View user →</a>' -->`,
      },
    ],
  },
  {
    label: 'Files & Uploads',
    items: [
      {
        id: 'col_upload', icon: '📎', label: 'ColUpload', isNew: true,
        description: 'Clickable file link with auto-detected icon based on extension. Opens in a new tab.',
        props: [
          { name: 'value', type: 'string | null', description: 'File path or full URL' },
          { name: 'label', type: 'string', description: 'Custom display label (overrides filename)' },
          { name: 'baseUrl', type: 'string', description: 'Prepended to relative paths' },
        ],
        notes: ['Icons are auto-detected from extension: PDF, image, video, audio, archive, spreadsheet, code, and more.', 'Hover to reveal a copy icon — copies the full URL.'],
        usage: `<ColUpload :value="row.attachment" />

<!-- custom label -->
<ColUpload :value="row.file" label="Download Report" />

<!-- with base URL for relative paths -->
<ColUpload :value="row.path" base-url="https://cdn.example.com" />`,
      },
      {
        id: 'col_upload_multiple', icon: '📂', label: 'ColUploadMultiple', isNew: true,
        description: 'Stacked list of file links from a JSON array of paths.',
        props: [
          { name: 'value', type: 'string[] | string | null', description: 'Array or JSON-encoded array of paths' },
          { name: 'limit', type: 'number', default: '5', description: 'Max files shown before "+N more"' },
          { name: 'baseUrl', type: 'string', description: 'Prepended to relative paths' },
        ],
        usage: `<ColUploadMultiple :value="row.attachments" />

<!-- limit visible files -->
<ColUploadMultiple :value="row.documents" :limit="3" />`,
      },
    ],
  },
  {
    label: 'Dates & Ranges',
    items: [
      {
        id: 'col_date_range', icon: '📅', label: 'ColDateRange', isNew: true,
        description: 'Two dates displayed as a range: "Apr 1, 2025 → Apr 30, 2025". Supports optional duration label.',
        props: [
          { name: 'value', type: '{ start?, end? } | string | null', description: 'JSON object with start/end, or pass as direct props' },
          { name: 'start', type: 'string', description: 'Start date string (alternative to value)' },
          { name: 'end', type: 'string', description: 'End date string (alternative to value)' },
          { name: 'format', type: 'Intl.DateTimeFormatOptions' },
          { name: 'locale', type: 'string', default: '"en-US"' },
          { name: 'showDuration', type: 'boolean', default: 'false', description: 'Show "(N days)" beside the range' },
        ],
        notes: ['Either start/end or a JSON value object is accepted. Open-ended ranges (one side null) show "…" for the missing date.'],
        usage: `<!-- from direct props -->
<ColDateRange start="2025-04-01" end="2025-04-30" />

<!-- from JSON value -->
<ColDateRange :value="row.period" :show-duration="true" />`,
      },
    ],
  },
  {
    label: 'Structured Data',
    items: [
      {
        id: 'col_table', icon: '🗃️', label: 'ColTable', isNew: true,
        description: 'Renders a JSON array of objects as a compact inline table with auto-detected columns.',
        props: [
          { name: 'value', type: 'object[] | string | null', description: 'Array of objects or JSON string' },
          { name: 'columns', type: 'string[]', description: 'Keys to show (defaults to all keys from first row)' },
          { name: 'maxRows', type: 'number', default: '5', description: 'Rows before "+N more"' },
        ],
        usage: `<ColTable :value="row.items" />

<!-- show only specific columns -->
<ColTable :value="row.data" :columns="['name', 'price']" />`,
      },
      {
        id: 'col_repeatable', icon: '🔁', label: 'ColRepeatable', isNew: true,
        description: 'Renders a JSON array of objects as stacked cards with labelled subfields — matches Backpack\'s repeatable field output.',
        props: [
          { name: 'value', type: 'object[] | string | null', description: 'Array of objects or JSON string' },
          { name: 'fields', type: 'FieldDef[]', description: '{ key, label?, prefix?, suffix? } — defaults to auto keys' },
          { name: 'maxRows', type: 'number', default: '3' },
          { name: 'cols', type: 'number', default: '0', description: 'Grid columns per card (0 = auto)' },
        ],
        notes: ['Auto-detects grid columns based on field count (1→1col, 2→2col, 3-4→2col, 5+→3col).'],
        usage: `<ColRepeatable :value="row.lineItems" />

<!-- with field definitions -->
<ColRepeatable
  :value="row.lineItems"
  :fields="[
    { key: 'name', label: 'Product' },
    { key: 'qty',  label: 'Qty' },
    { key: 'price', label: 'Price', prefix: '$' },
  ]"
/>`,
      },
    ],
  },
  {
    label: 'Special',
    items: [
      {
        id: 'col_base64_image', icon: '🖼️', label: 'ColBase64Image', isNew: true,
        description: 'Thumbnail rendered from a base64-encoded string stored in the database. Supports lightbox, rounded, and ring props.',
        props: [
          { name: 'value', type: 'string | null', description: 'Raw base64 string or full data URL' },
          { name: 'mime', type: 'string', default: '"image/jpeg"', description: 'MIME type when value is raw base64' },
          { name: 'height', type: 'number', default: '40' },
          { name: 'width', type: 'number' },
          { name: 'alt', type: 'string', default: '""' },
          { name: 'rounded', type: '"none"|"sm"|"md"|"lg"|"xl"|"full"', default: '"md"' },
          { name: 'ring', type: 'boolean', default: 'false' },
        ],
        notes: ['Accepts either a raw base64 string or a full data: URL. The mime prop is only needed for raw base64.'],
        usage: `<ColBase64Image :value="row.avatar" />

<!-- circle avatar -->
<ColBase64Image :value="row.photo" rounded="full" :ring="true" />

<!-- explicit MIME type -->
<ColBase64Image :value="row.thumbnail" mime="image/png" :height="60" />`,
      },
      {
        id: 'col_slug', icon: '🔗', label: 'ColSlug', isNew: true,
        description: 'Displays a slug in a monospace pill with a muted prefix character. Hover to copy.',
        props: [
          { name: 'value', type: 'string | null' },
          { name: 'prefix', type: 'string', default: '"/"', description: 'Character shown before the slug' },
        ],
        notes: ['Hover to reveal a copy icon — copies the raw slug value without the prefix.'],
        usage: `<ColSlug :value="row.slug" />

<!-- hash prefix for anchors -->
<ColSlug :value="row.anchor" prefix="#" />

<!-- no prefix -->
<ColSlug :value="row.handle" prefix="" />`,
      },
      {
        id: 'col_address_google', icon: '📍', label: 'ColAddressGoogle', isNew: true,
        description: 'Displays a structured address from a JSON object. Shows a "View on map" link using coordinates or address text.',
        props: [
          { name: 'value', type: '{ street?, city?, state?, zip?, country?, lat?, lng? } | string | null' },
        ],
        notes: ['If lat/lng are present, the map link uses coordinates. Otherwise it falls back to a text query.', 'Accepts a parsed object or a JSON string.'],
        usage: `<ColAddressGoogle :value="row.address" />

<!-- JSON string from Backpack address_google field -->
<ColAddressGoogle :value='row.location' />`,
      },
    ],
  },
]

// ─── State ───────────────────────────────────────────────────────────────────

const active          = ref('col_text')
const navSearch       = ref('')
const activeTab       = ref<'props' | 'usage'>('props')
const activeBottomTab = ref('notes')
const copied          = ref(false)

const allItems        = computed(() => groups.flatMap(g => g.items))
const totalComponents = computed(() => [...new Set(allItems.value.map(i => i.id))].length)
const activeItem      = computed(() => allItems.value.find(i => i.id === active.value))
const activeGroup     = computed(() => groups.find(g => g.items.some(i => i.id === active.value)))

const filteredGroups = computed(() => {
  if (!navSearch.value) return groups
  const q = navSearch.value.toLowerCase()
  return groups.map(g => ({
    ...g,
    items: g.items.filter(i => i.label.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)),
  }))
})

watch(active, () => { activeTab.value = 'props' })

async function copyUsage() {
  const text = activeItem.value?.usage
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    copied.value = false
  }
}
</script>
