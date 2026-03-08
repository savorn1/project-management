<template>
  <div class="relative px-4 py-3 border-t border-slate-800/60">

    <!-- Reply preview strip -->
    <Transition
      enter-active-class="transition ease-out duration-150"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="replyingTo"
        class="flex items-center gap-2 mb-2 px-3 py-2 bg-slate-700/40 border border-slate-600/30 rounded-xl"
      >
        <div class="w-0.5 h-8 rounded-full bg-indigo-400/60 flex-shrink-0" />
        <div class="flex-1 min-w-0">
          <p class="text-[10px] font-semibold text-indigo-300 mb-0.5">{{ replyingTo.senderName }}</p>
          <p class="text-[11px] text-gray-500 truncate">{{ replyingTo.content || '📎 Attachment' }}</p>
        </div>
        <button
          @click="$emit('cancel-reply')"
          class="w-5 h-5 rounded flex items-center justify-center text-gray-600 hover:text-gray-300 hover:bg-slate-700 transition-colors flex-shrink-0"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </Transition>

    <!-- Poll creation modal -->
    <Teleport to="body">
      <div v-if="showPollModal" class="fixed inset-0 z-[9990] flex items-center justify-center p-4" @click.self="showPollModal = false">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showPollModal = false" />
        <div class="relative w-full max-w-sm bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/60 p-5" @click.stop>
          <p class="text-sm font-semibold text-white mb-4">Create Poll</p>

          <!-- Question -->
          <div class="mb-3">
            <label class="text-[10px] font-semibold uppercase tracking-wider text-gray-600 mb-1 block">Question</label>
            <input
              v-model="pollQuestion"
              placeholder="Ask a question…"
              class="w-full bg-slate-800/60 border border-slate-700/40 rounded-xl px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"
              @keydown.escape="showPollModal = false"
            />
          </div>

          <!-- Options -->
          <div class="mb-4">
            <label class="text-[10px] font-semibold uppercase tracking-wider text-gray-600 mb-1 block">Options</label>
            <div class="flex flex-col gap-1.5">
              <div v-for="(opt, i) in pollOptions" :key="i" class="flex items-center gap-2">
                <input
                  v-model="pollOptions[i]"
                  :placeholder="`Option ${i + 1}`"
                  class="flex-1 bg-slate-800/60 border border-slate-700/40 rounded-lg px-3 py-1.5 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/40"
                />
                <button
                  v-if="pollOptions.length > 2"
                  @click="pollOptions.splice(i, 1)"
                  class="w-5 h-5 rounded flex items-center justify-center text-gray-600 hover:text-rose-400 transition-colors flex-shrink-0"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <button
                v-if="pollOptions.length < 6"
                @click="pollOptions.push('')"
                class="text-[11px] text-indigo-400/70 hover:text-indigo-300 text-left mt-0.5 transition-colors"
              >+ Add option</button>
            </div>
          </div>

          <div class="flex justify-end gap-2">
            <button @click="showPollModal = false" class="px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-gray-300 hover:bg-slate-800 transition-colors">Cancel</button>
            <button
              @click="submitPoll"
              :disabled="!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2"
              class="px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
              :class="pollQuestion.trim() && pollOptions.filter(o => o.trim()).length >= 2
                ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30'
                : 'text-gray-700 cursor-not-allowed'"
            >Create Poll</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Schedule picker -->
    <Teleport to="body">
      <div
        v-if="showSchedulePicker"
        class="fixed inset-0"
        style="z-index: 99998;"
        @click.stop="showSchedulePicker = false"
      />
      <div
        v-if="showSchedulePicker"
        class="fixed bg-slate-800 border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/60 p-3 w-64"
        style="z-index: 99999;"
        :style="schedulePickerStyle"
        @click.stop
      >
        <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-600 mb-2 px-1">Schedule Message</p>
        <div class="flex flex-col gap-0.5 mb-2">
          <button
            v-for="preset in schedulePresets"
            :key="preset.ts"
            @click="submitScheduled(preset.ts)"
            class="w-full text-left px-2 py-1.5 rounded-lg text-xs text-gray-300 hover:bg-slate-700/60 hover:text-white transition-colors"
          >{{ preset.label }}</button>
        </div>
        <div class="border-t border-slate-700/40 pt-2">
          <p class="text-[10px] text-gray-600 mb-1 px-1">Custom date & time</p>
          <DatePicker
            v-model="customDate"
            placeholder="Pick a date"
            :clearable="false"
            class="mb-1.5 px-1"
          />
          <div class="flex gap-1.5">
            <input
              v-model="customTime"
              type="time"
              class="flex-1 bg-slate-900/60 border border-slate-700/40 rounded-lg px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-indigo-500/50"
            />
            <button
              @click="scheduleCustom"
              :disabled="!customDate || !customTime"
              class="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
              :class="customDate && customTime ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30' : 'text-gray-700 cursor-not-allowed'"
            >Set</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- File validation error -->
    <Transition
      enter-active-class="transition ease-out duration-150"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div v-if="fileError" class="flex items-center gap-2 mb-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
        <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ fileError }}
      </div>
    </Transition>

    <!-- Mention dropdown -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="showDropdown && filteredOptions.length > 0"
        class="absolute bottom-full left-4 right-4 mb-2 bg-slate-800 border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden z-10"
      >
        <div class="px-3 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-600">Mention</div>
        <div
          v-for="(option, i) in filteredOptions"
          :key="option.id"
          @mousedown.prevent="selectOption(option)"
          class="flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors"
          :class="i === selectedIndex ? 'bg-indigo-500/15' : 'hover:bg-slate-700/40'"
        >
          <div
            class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
            :class="option.type === 'everyone'
              ? 'bg-gradient-to-br from-amber-500 to-orange-600'
              : 'bg-gradient-to-br from-slate-500 to-slate-700'"
          >
            {{ option.type === 'everyone' ? '✦' : option.name.charAt(0).toUpperCase() }}
          </div>
          <div class="min-w-0">
            <p class="text-xs font-medium truncate" :class="i === selectedIndex ? 'text-indigo-200' : 'text-gray-300'">
              {{ option.name }}
            </p>
            <p v-if="option.type === 'everyone'" class="text-[10px] text-gray-600">Notify all members</p>
          </div>
        </div>
        <div class="h-1" />
      </div>
    </Transition>

    <!-- Emoji picker -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="showEmojiPicker"
        ref="emojiPickerRef"
        class="absolute bottom-full left-4 mb-2 bg-slate-800 border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/40 z-20 w-72"
        @click.stop
      >
        <!-- Category tabs -->
        <div class="flex gap-1 p-2 border-b border-slate-700/40">
          <button
            v-for="cat in emojiCategories"
            :key="cat.name"
            @mousedown.prevent="activeCategory = cat.name"
            class="flex-1 py-1 rounded-lg text-base transition-colors"
            :class="activeCategory === cat.name ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-500 hover:text-gray-300'"
          >{{ cat.icon }}</button>
        </div>
        <!-- Emoji grid -->
        <div class="grid grid-cols-8 gap-0.5 p-2 max-h-40 overflow-y-auto">
          <button
            v-for="emoji in currentEmojis"
            :key="emoji"
            @mousedown.prevent="insertEmoji(emoji)"
            class="w-8 h-8 flex items-center justify-center text-[18px] rounded-lg hover:bg-slate-700/50 transition-colors"
          >{{ emoji }}</button>
        </div>
      </div>
    </Transition>

    <!-- Recording bar -->
    <Transition
      enter-active-class="transition ease-out duration-150"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div v-if="isRecording" class="flex items-center gap-3 mb-2 px-3 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl">
        <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse flex-shrink-0" />
        <div class="flex items-center gap-0.5 flex-shrink-0">
          <span v-for="n in 5" :key="n" class="w-0.5 bg-rose-400 rounded-full animate-pulse"
            :style="{ height: `${6 + (n % 3) * 4}px`, animationDelay: `${n * 0.1}s` }" />
        </div>
        <span class="text-xs text-rose-300 font-mono flex-1">{{ recordingTime }}</span>
        <button @click="cancelRecording" class="text-[11px] text-gray-500 hover:text-gray-300 transition-colors">Cancel</button>
        <button @click="stopRecording" class="text-[11px] px-2.5 py-1 bg-rose-500/20 border border-rose-500/30 rounded-lg text-rose-300 hover:bg-rose-500/30 transition-colors">Send</button>
      </div>
    </Transition>

    <!-- Main input container -->
    <div
      class="relative bg-slate-800/50 border rounded-2xl transition-all duration-200"
      :class="isFocused
        ? 'border-indigo-500/50 shadow-lg shadow-indigo-500/10'
        : 'border-slate-700/40 shadow-sm'"
    >

      <!-- File preview strip (inside container) -->
      <Transition
        enter-active-class="transition ease-out duration-150"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-1"
      >
        <div v-if="selectedFiles.length > 0" class="flex items-center gap-2 px-3 pt-3 flex-wrap">
          <div
            v-for="(file, i) in selectedFiles"
            :key="i"
            class="relative flex items-center gap-1.5 bg-slate-700/60 border border-slate-600/40 rounded-lg overflow-hidden group/file"
            :class="file.type.startsWith('image/') && previewUrls[i] ? 'pr-6' : 'pl-2 pr-6 py-1'"
          >
            <!-- Image thumbnail -->
            <template v-if="file.type.startsWith('image/') && previewUrls[i]">
              <img
                :src="previewUrls[i]"
                class="w-16 h-12 object-cover"
                alt=""
              />
              <span class="absolute bottom-0 left-0 right-6 truncate text-[9px] text-white/70 bg-black/50 px-1 py-0.5 leading-tight">{{ file.name }}</span>
            </template>
            <!-- File chip -->
            <template v-else>
              <svg class="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span class="truncate text-xs text-gray-300 max-w-[120px]">{{ file.name }}</span>
            </template>
            <!-- Remove button -->
            <button
              @click="removeFile(i)"
              class="absolute right-0.5 top-0.5 w-5 h-5 rounded flex items-center justify-center bg-slate-900/70 text-gray-500 hover:text-red-400 hover:bg-red-500/20 transition-colors opacity-0 group-hover/file:opacity-100"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </Transition>

      <!-- Formatting toolbar (visible when toggled) -->
      <FormattingToolbar
        v-if="showFormattingToolbar"
        :textarea-ref="textareaRef"
        v-model="text"
      />

      <!-- Textarea -->
      <textarea
        ref="textareaRef"
        v-model="text"
        @keydown="onKeydown"
        @input="onInput"
        @focus="isFocused = true"
        @blur="onBlur"
        rows="1"
        placeholder="Message…"
        class="w-full bg-transparent px-4 pt-3 pb-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none resize-none overflow-hidden leading-relaxed max-h-48"
      />

      <!-- Bottom toolbar -->
      <div class="flex items-center gap-1 px-2 pb-2">

        <!-- Emoji button -->
        <button
          @click.stop="toggleEmojiPicker"
          class="w-8 h-8 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
          :class="showEmojiPicker ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10'"
          title="Emoji"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        <!-- Attach file button -->
        <button
          @click="fileInputRef?.click()"
          :disabled="selectedFiles.length >= 5"
          class="w-8 h-8 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
          :class="selectedFiles.length >= 5
            ? 'text-gray-700 cursor-not-allowed'
            : 'text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10'"
          title="Attach files (max 5 × 20 MB)"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>

        <input
          ref="fileInputRef"
          type="file"
          multiple
          accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
          class="hidden"
          @change="onFileChange"
        />

        <!-- Formatting toolbar toggle -->
        <button
          @click.stop="showFormattingToolbar = !showFormattingToolbar"
          class="w-8 h-8 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 text-[11px] font-bold"
          :class="showFormattingToolbar ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10'"
          title="Formatting toolbar"
        >B</button>

        <!-- Poll button -->
        <button
          @click.stop="showPollModal = true"
          class="w-8 h-8 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10"
          title="Create poll"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </button>

        <!-- Voice record button -->
        <button
          @click.stop="toggleRecording"
          class="w-8 h-8 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
          :class="isRecording
            ? 'text-rose-400 bg-rose-500/15 animate-pulse'
            : 'text-gray-500 hover:text-rose-400 hover:bg-rose-500/10'"
          :title="isRecording ? 'Stop recording' : 'Voice message'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>

        <!-- Templates button -->
        <div class="relative">
          <button
            @click.stop="toggleTemplatePicker"
            class="w-8 h-8 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
            :class="showTemplatePicker ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10'"
            title="Message templates"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 10h16M4 14h10" />
            </svg>
          </button>

          <!-- Template picker dropdown -->
          <Teleport to="body">
            <div v-if="showTemplatePicker" class="fixed inset-0" style="z-index:99998;" @click.stop="showTemplatePicker = false" />
            <div
              v-if="showTemplatePicker"
              class="fixed bg-slate-800 border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/60 w-72"
              style="z-index:99999;"
              :style="templatePickerStyle"
              @click.stop
            >
              <div class="p-2 border-b border-slate-700/40 flex items-center gap-2">
                <input
                  v-model="templateSearch"
                  type="text"
                  placeholder="Search templates…"
                  class="flex-1 bg-slate-900/60 border border-slate-700/40 rounded-lg px-2.5 py-1 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"
                />
                <button
                  @click="addTemplateFromInput"
                  :disabled="!text.trim()"
                  class="text-[10px] px-2 py-1 rounded-lg transition-colors flex-shrink-0"
                  :class="text.trim() ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30' : 'text-gray-700 cursor-not-allowed'"
                  title="Save current text as template"
                >Save</button>
              </div>
              <div class="max-h-52 overflow-y-auto py-1">
                <p v-if="filteredTemplates.length === 0" class="text-[11px] text-gray-600 text-center py-4">
                  {{ templateSearch ? 'No matches' : 'No templates yet — type a message and click Save' }}
                </p>
                <div
                  v-for="(t, i) in filteredTemplates"
                  :key="i"
                  class="group flex items-start gap-2 px-3 py-2 hover:bg-slate-700/50 cursor-pointer transition-colors"
                  @click="insertTemplate(t)"
                >
                  <p class="flex-1 text-xs text-gray-300 line-clamp-2">{{ t }}</p>
                  <button
                    @click.stop="deleteTemplate(i)"
                    class="flex-shrink-0 text-gray-700 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 mt-0.5"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </Teleport>
        </div>

        <!-- Formatting help button -->
        <div class="relative">
          <button
            @click.stop="showFormatHelp = !showFormatHelp"
            class="w-8 h-8 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 text-[11px] font-bold"
            :class="showFormatHelp ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10'"
            title="Formatting help"
          >Aa</button>

          <Transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="opacity-0 translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-1"
          >
            <div
              v-if="showFormatHelp"
              class="absolute bottom-full left-0 mb-2 w-52 bg-slate-800 border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/40 p-3 z-20"
              @click.stop
            >
              <p class="text-[10px] font-semibold uppercase tracking-widest text-gray-600 mb-2">Formatting</p>
              <div class="space-y-1.5">
                <div class="flex items-center justify-between gap-2">
                  <code class="text-[11px] text-gray-400 bg-slate-900/60 px-1.5 py-0.5 rounded">**bold**</code>
                  <strong class="text-[11px] text-gray-300">bold</strong>
                </div>
                <div class="flex items-center justify-between gap-2">
                  <code class="text-[11px] text-gray-400 bg-slate-900/60 px-1.5 py-0.5 rounded">*italic*</code>
                  <em class="text-[11px] text-gray-300">italic</em>
                </div>
                <div class="flex items-center justify-between gap-2">
                  <code class="text-[11px] text-gray-400 bg-slate-900/60 px-1.5 py-0.5 rounded">`inline code`</code>
                  <code class="text-[11px] text-indigo-300">code</code>
                </div>
                <div class="flex items-center justify-between gap-2">
                  <code class="text-[11px] text-gray-400 bg-slate-900/60 px-1.5 py-0.5 rounded">```code block```</code>
                  <span class="text-[11px] text-gray-500">block</span>
                </div>
                <div class="border-t border-slate-700/40 pt-1.5">
                  <code class="text-[11px] text-gray-400 bg-slate-900/60 px-1.5 py-0.5 rounded">@name</code>
                  <span class="text-[11px] text-gray-500 ml-1">to mention</span>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <div class="flex-1" />

        <!-- Hint -->
        <span class="hidden sm:block text-[10px] text-gray-700 pr-1 select-none">Enter to send</span>

        <!-- Schedule button -->
        <button
          @click="openSchedulePicker"
          :disabled="(!text.trim() && selectedFiles.length === 0) || loading"
          class="w-7 h-8 rounded-l-xl flex items-center justify-center transition-all flex-shrink-0 border-r"
          :class="(text.trim() || selectedFiles.length > 0) && !loading
            ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white/80 hover:text-white border-white/20'
            : 'text-gray-700 cursor-not-allowed bg-slate-800/40 border-slate-700/40'"
          title="Schedule message"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        <!-- Send button -->
        <button
          @click="submit"
          :disabled="(!text.trim() && selectedFiles.length === 0) || loading"
          class="w-8 h-8 rounded-r-xl flex items-center justify-center transition-all flex-shrink-0"
          :class="(text.trim() || selectedFiles.length > 0) && !loading
            ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white hover:from-indigo-400 hover:to-violet-500 shadow-md shadow-indigo-500/30'
            : 'text-gray-700 cursor-not-allowed'"
        >
          <svg v-if="!loading" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
          <div v-else class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TeamMember } from '~/types';

const props = defineProps<{
  members: TeamMember[]
  replyingTo?: { _id: string; content: string; senderName: string }
  initialDraft?: string
}>()

const emit = defineEmits<{
  send: [content: string, files: File[]]
  schedule: [content: string, files: File[], scheduledFor: number]
  typing: [isTyping: boolean]
  'cancel-reply': []
  poll: [question: string, options: string[]]
}>()

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 MB
const MAX_FILES = 5

const text = ref('')
const loading = ref(false)
const isFocused = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const selectedFiles = ref<File[]>([])
const previewUrls = ref<string[]>([])
const fileError = ref('')
let errorTimer: ReturnType<typeof setTimeout> | null = null

function showError(message: string) {
  fileError.value = message
  if (errorTimer) clearTimeout(errorTimer)
  errorTimer = setTimeout(() => { fileError.value = '' }, 4000)
}

const { 
  showDropdown, 
  filteredOptions, 
  selectedIndex, 
  handleInput, 
  handleKeydown: mentionKeydown, 
  selectOption 
} = useMentionInput(textareaRef, toRef(props, 'members'), text)

function autoResize() {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 192) + 'px'
}

function onInput() {
  handleInput()
  autoResize()
}

function onKeydown(e: KeyboardEvent) {
  const dropdownWasOpen = showDropdown.value
  mentionKeydown(e)

  if (dropdownWasOpen && ['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(e.key)) {
    e.preventDefault()
    return
  }

  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    submit()
    return
  }

  if (['Enter', 'Escape', 'Tab'].includes(e.key)) return
  autoResize()
  emit('typing', true)
}

function onBlur() {
  isFocused.value = false
  emit('typing', false)
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files) return

  const candidates = Array.from(input.files)
  const tooBig = candidates.filter((f) => f.size > MAX_FILE_SIZE)
  const fits   = candidates.filter((f) => f.size <= MAX_FILE_SIZE)

  if (tooBig.length > 0) {
    const names = tooBig.map((f) => f.name).join(', ')
    showError(`File${tooBig.length > 1 ? 's' : ''} exceed 20 MB limit: ${names}`)
  }

  const slots = MAX_FILES - selectedFiles.value.length
  if (slots <= 0) {
    showError(`Maximum ${MAX_FILES} files per message.`)
    input.value = ''
    return
  }

  const accepted = fits.slice(0, slots)
  if (fits.length > slots) {
    showError(`Only ${slots} more file${slots > 1 ? 's' : ''} can be added (max ${MAX_FILES}).`)
  }

  for (const file of accepted) {
    selectedFiles.value.push(file)
    previewUrls.value.push(file.type.startsWith('image/') ? URL.createObjectURL(file) : '')
  }

  input.value = ''
}

function removeFile(index: number) {
  const url = previewUrls.value[index]
  if (url) URL.revokeObjectURL(url)
  selectedFiles.value.splice(index, 1)
  previewUrls.value.splice(index, 1)
}

function clearFiles() {
  previewUrls.value.forEach((url) => { if (url) URL.revokeObjectURL(url) })
  selectedFiles.value = []
  previewUrls.value = []
}

async function submit() {
  const content = text.value.trim()
  if (!content && selectedFiles.value.length === 0) return
  if (loading.value) return

  loading.value = true
  emit('typing', false)

  const files = [...selectedFiles.value]
  text.value = ''
  clearFiles()
  nextTick(() => {
    if (textareaRef.value) textareaRef.value.style.height = 'auto'
  })

  emit('send', content, files)
  loading.value = false
}

// ── Poll modal ───────────────────────────────────────────────────────────────
const showPollModal = ref(false)
const pollQuestion = ref('')
const pollOptions = ref(['', ''])

function submitPoll() {
  const opts = pollOptions.value.filter((o: string) => o.trim())
  if (!pollQuestion.value.trim() || opts.length < 2) return
  emit('poll', pollQuestion.value.trim(), opts)
  showPollModal.value = false
  pollQuestion.value = ''
  pollOptions.value = ['', '']
}

// ── Formatting toolbar ───────────────────────────────────────────────────────
const showFormattingToolbar = ref(false)

// ── Formatting help ──────────────────────────────────────────────────────────
const showFormatHelp = ref(false)

// ── Emoji picker ────────────────────────────────────────────────────────────
const showEmojiPicker = ref(false)
const activeCategory = ref('smileys')
const emojiPickerRef = ref<HTMLElement | null>(null)

const emojiCategories = [
  { name: 'smileys', icon: '😀', emojis: ['😀','😂','😍','😎','😭','😊','😉','🥰','😅','🤣','😆','😋','🤩','😏','😒','😢','😤','😡','🥺','🤔','😴','🥳','😇','🫡','🤗','😬','🙄','😳','🤯','🥸'] },
  { name: 'hands',   icon: '👋', emojis: ['👋','👍','👎','✌️','🤞','🙌','👏','🤝','🙏','💪','🫶','☝️','👌','🤌','🤏','🫰','🖖','🤙','💅','🫵','👈','👉','👆','👇','✋','🤚','🖐️','🖕'] },
  { name: 'hearts',  icon: '❤️', emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','💕','💯','💞','💓','💗','💖','💘','💝','🩷','🩵','🩶','❣️','💔','❤️‍🔥','❤️‍🩹','🫀'] },
  { name: 'nature',  icon: '🌸', emojis: ['🌸','🌺','🌻','🌹','🍀','🌈','⭐','🌙','☀️','🌊','🔥','❄️','🌿','🍃','🌾','🦋','🐶','🐱','🐸','🦊','🐼','🐨','🦁','🐯','🦄','🌍','🌴','🍄'] },
  { name: 'food',    icon: '🍕', emojis: ['🍕','🍔','🍟','🌮','🍣','🍜','🍩','🍪','🎂','🍺','☕','🧋','🍓','🍇','🍎','🥑','🍿','🧇','🥗','🫕','🍱','🥐','🧆','🌯','🥤','🧃','🍦','🍰'] },
  { name: 'objects', icon: '🎉', emojis: ['🎉','🎊','🎁','🏆','🎯','💡','💎','💰','📱','💻','⚡','🚀','✨','🌟','💫','🎶','🎵','📸','🔑','🎮','⚽','🏀','🎸','🎨','📚','🔮','🛸','💣'] },
]

const currentEmojis = computed(() =>
  emojiCategories.find((c) => c.name === activeCategory.value)?.emojis ?? []
)

function toggleEmojiPicker() {
  showEmojiPicker.value = !showEmojiPicker.value
}

function insertEmoji(emoji: string) {
  const el = textareaRef.value
  if (!el) {
    text.value += emoji
    return
  }
  const start = el.selectionStart ?? text.value.length
  const end = el.selectionEnd ?? text.value.length
  text.value = text.value.slice(0, start) + emoji + text.value.slice(end)
  nextTick(() => {
    el.focus()
    el.setSelectionRange(start + emoji.length, start + emoji.length)
    autoResize()
  })
}

function onDocMouseDown(e: MouseEvent) {
  if (emojiPickerRef.value && !emojiPickerRef.value.contains(e.target as Node)) {
    showEmojiPicker.value = false
  }
}

watch(showEmojiPicker, (val) => {
  if (val) nextTick(() => document.addEventListener('mousedown', onDocMouseDown))
  else document.removeEventListener('mousedown', onDocMouseDown)
})

onUnmounted(() => document.removeEventListener('mousedown', onDocMouseDown))
// ────────────────────────────────────────────────────────────────────────────

// Restore draft when conversation switches
watch(() => props.initialDraft, (draft) => {
  text.value = draft ?? ''
  nextTick(() => autoResize())
})

// ── Schedule picker ──────────────────────────────────────────────────────────
const showSchedulePicker = ref(false)
const schedulePickerStyle = ref<Record<string, string>>({})
const customDate = ref<string | null>(null)
const customTime = ref('09:00')

const schedulePresets = computed(() => {
  const now = new Date()
  const tonight = new Date(now)
  tonight.setHours(21, 0, 0, 0)
  const tomorrow = new Date(now)
  tomorrow.setDate(now.getDate() + 1)
  tomorrow.setHours(9, 0, 0, 0)
  const nextMon = new Date(now)
  const day = now.getDay()
  const daysUntilMon = day === 0 ? 1 : 8 - day
  nextMon.setDate(now.getDate() + daysUntilMon)
  nextMon.setHours(9, 0, 0, 0)
  const in30 = new Date(now.getTime() + 30 * 60 * 1000)
  const in1h  = new Date(now.getTime() + 60 * 60 * 1000)

  function fmt(d: Date) {
    const isToday = d.toDateString() === now.toDateString()
    const isTomorrow = d.toDateString() === tomorrow.toDateString()
    const prefix = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
    return `${prefix}, ${d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`
  }
  const presets: { label: string; ts: number }[] = [
    { label: `In 30 min — ${fmt(in30)}`, ts: in30.getTime() },
    { label: `In 1 hour — ${fmt(in1h)}`, ts: in1h.getTime() },
  ]
  if (tonight.getTime() > now.getTime() + 60000) {
    presets.push({ label: `Tonight — ${fmt(tonight)}`, ts: tonight.getTime() })
  }
  presets.push({ label: `Tomorrow — ${fmt(tomorrow)}`, ts: tomorrow.getTime() })
  presets.push({ label: `Next Monday — ${fmt(nextMon)}`, ts: nextMon.getTime() })
  return presets
})

function openSchedulePicker(e: MouseEvent) {
  if (showSchedulePicker.value) { showSchedulePicker.value = false; return }
  const btn = e.currentTarget as HTMLElement
  const rect = btn.getBoundingClientRect()
  schedulePickerStyle.value = {
    bottom: `${window.innerHeight - rect.top + 6}px`,
    right: `${window.innerWidth - rect.right}px`,
  }
  customDate.value = null
  customTime.value = '09:00'
  showSchedulePicker.value = true
}

function submitScheduled(ts: number) {
  const content = text.value.trim()
  if (!content && selectedFiles.value.length === 0) return
  const files = [...selectedFiles.value]
  text.value = ''
  clearFiles()
  nextTick(() => { if (textareaRef.value) textareaRef.value.style.height = 'auto' })
  showSchedulePicker.value = false
  emit('schedule', content, files, ts)
}

function scheduleCustom() {
  if (!customDate.value || !customTime.value) return
  const ts = new Date(`${customDate.value}T${customTime.value}`).getTime()
  if (isNaN(ts) || ts <= Date.now()) return
  submitScheduled(ts)
}

// ── Voice Recording ──────────────────────────────────────────────────────────
const isRecording = ref(false)
const recordingTime = ref('0:00')
let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []
let recordingTimer: ReturnType<typeof setInterval> | null = null
let recordingSeconds = 0

async function toggleRecording() {
  if (isRecording.value) { stopRecording(); return }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    audioChunks = []
    mediaRecorder = new MediaRecorder(stream)
    mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.push(e.data) }
    mediaRecorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop())
      if (audioChunks.length === 0) return
      const blob = new Blob(audioChunks, { type: 'audio/webm' })
      const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' })
      const slots = MAX_FILES - selectedFiles.value.length
      if (slots > 0) {
        selectedFiles.value.push(file)
        previewUrls.value.push('')
      }
    }
    mediaRecorder.start()
    isRecording.value = true
    recordingSeconds = 0
    recordingTime.value = '0:00'
    recordingTimer = setInterval(() => {
      recordingSeconds++
      const m = Math.floor(recordingSeconds / 60)
      const s = recordingSeconds % 60
      recordingTime.value = `${m}:${s.toString().padStart(2, '0')}`
    }, 1000)
  } catch {
    showError('Microphone access denied.')
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop()
  if (recordingTimer) { clearInterval(recordingTimer); recordingTimer = null }
  isRecording.value = false
}

function cancelRecording() {
  audioChunks = [] // clear so onstop doesn't add the file
  if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop()
  if (recordingTimer) { clearInterval(recordingTimer); recordingTimer = null }
  isRecording.value = false
}

// ── Message Templates ─────────────────────────────────────────────────────────
const showTemplatePicker = ref(false)
const templatePickerStyle = ref<Record<string, string>>({})
const templateSearch = ref('')
const templates = ref<string[]>([])

function loadTemplates() {
  try { templates.value = JSON.parse(localStorage.getItem('chat-templates') ?? '[]') } catch { templates.value = [] }
}
function saveTemplates() {
  localStorage.setItem('chat-templates', JSON.stringify(templates.value))
}

const filteredTemplates = computed(() => {
  if (!templateSearch.value.trim()) return templates.value
  const q = templateSearch.value.toLowerCase()
  return templates.value.filter((t) => t.toLowerCase().includes(q))
})

function toggleTemplatePicker(e: MouseEvent) {
  if (showTemplatePicker.value) { showTemplatePicker.value = false; return }
  const btn = e.currentTarget as HTMLElement
  const rect = btn.getBoundingClientRect()
  templatePickerStyle.value = {
    bottom: `${window.innerHeight - rect.top + 6}px`,
    left: `${Math.max(8, rect.left - 100)}px`,
  }
  templateSearch.value = ''
  showTemplatePicker.value = true
}

function addTemplateFromInput() {
  const t = text.value.trim()
  if (!t || templates.value.includes(t)) return
  templates.value = [t, ...templates.value]
  saveTemplates()
  showTemplatePicker.value = false
}

function insertTemplate(t: string) {
  text.value = t
  showTemplatePicker.value = false
  nextTick(() => { textareaRef.value?.focus(); autoResize() })
}

function deleteTemplate(i: number) {
  const t = filteredTemplates.value[i]
  if (!t) return
  const realIdx = templates.value.indexOf(t)
  if (realIdx !== -1) { templates.value.splice(realIdx, 1); saveTemplates() }
}

onMounted(() => loadTemplates())

defineExpose({
  focus: () => textareaRef.value?.focus(),
  getDraft: () => text.value,
  addFiles(droppedFiles: File[]) {
    const tooBig = droppedFiles.filter((f) => f.size > MAX_FILE_SIZE)
    const fits = droppedFiles.filter((f) => f.size <= MAX_FILE_SIZE)
    if (tooBig.length > 0) showError(`Files exceed 20 MB: ${tooBig.map((f) => f.name).join(', ')}`)
    const slots = MAX_FILES - selectedFiles.value.length
    if (slots <= 0) { showError(`Maximum ${MAX_FILES} files per message.`); return }
    const accepted = fits.slice(0, slots)
    if (fits.length > slots) showError(`Only ${slots} more file${slots > 1 ? 's' : ''} can be added.`)
    for (const file of accepted) {
      selectedFiles.value.push(file)
      previewUrls.value.push(file.type.startsWith('image/') ? URL.createObjectURL(file) : '')
    }
  },
})
</script>
