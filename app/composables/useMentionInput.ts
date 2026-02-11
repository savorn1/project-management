import type { TeamMember } from '~/types'

export interface MentionOption {
  type: 'member' | 'everyone'
  id: string
  name: string
  member?: TeamMember
}

export function useMentionInput(
  textareaRef: Ref<HTMLTextAreaElement | null>,
  members: Ref<TeamMember[]>,
  modelValue: Ref<string>,
) {
  const showDropdown = ref(false)
  const selectedIndex = ref(0)
  const mentionQuery = ref('')
  const mentionStartPos = ref(-1)

  const EVERYONE_OPTION: MentionOption = { type: 'everyone', id: 'everyone', name: 'everyone' }

  const filteredOptions = computed<MentionOption[]>(() => {
    const query = mentionQuery.value.toLowerCase()
    const options: MentionOption[] = []

    // Add @everyone if query matches
    if ('everyone'.includes(query)) {
      options.push(EVERYONE_OPTION)
    }

    // Add matching active members
    for (const m of members.value) {
      if (options.length >= 8) break
      if (m.isActive && m.name.toLowerCase().includes(query)) {
        options.push({ type: 'member', id: m._id, name: m.name, member: m })
      }
    }

    return options
  })

  function findMentionTrigger(text: string, cursorPos: number): { start: number; query: string } | null {
    let i = cursorPos - 1
    while (i >= 0) {
      if (text[i] === '@') {
        if (i === 0 || /\s/.test(text[i - 1])) {
          return { start: i, query: text.slice(i + 1, cursorPos) }
        }
        return null
      }
      if (/\s/.test(text[i])) return null
      i--
    }
    return null
  }

  function handleInput() {
    const textarea = textareaRef.value
    if (!textarea) return

    const trigger = findMentionTrigger(textarea.value, textarea.selectionStart)
    if (trigger) {
      mentionQuery.value = trigger.query
      mentionStartPos.value = trigger.start
      selectedIndex.value = 0
      showDropdown.value = true
    } else {
      closeDropdown()
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (!showDropdown.value || filteredOptions.value.length === 0) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        event.stopPropagation()
        selectedIndex.value = (selectedIndex.value + 1) % filteredOptions.value.length
        break
      case 'ArrowUp':
        event.preventDefault()
        event.stopPropagation()
        selectedIndex.value = (selectedIndex.value - 1 + filteredOptions.value.length) % filteredOptions.value.length
        break
      case 'Enter':
        event.preventDefault()
        event.stopPropagation()
        const opt = filteredOptions.value[selectedIndex.value]
        if (opt) selectOption(opt)
        break
      case 'Escape':
        event.preventDefault()
        event.stopPropagation()
        closeDropdown()
        break
    }
  }

  function selectOption(option: MentionOption) {
    const textarea = textareaRef.value
    if (!textarea || mentionStartPos.value === -1) return

    const before = modelValue.value.slice(0, mentionStartPos.value)
    const after = modelValue.value.slice(textarea.selectionStart)

    const mention = option.type === 'everyone'
      ? '@[everyone] '
      : `@[${option.name}](${option.id}) `

    modelValue.value = before + mention + after
    closeDropdown()

    nextTick(() => {
      const cursorPos = before.length + mention.length
      textarea.focus()
      textarea.setSelectionRange(cursorPos, cursorPos)
    })
  }

  function closeDropdown() {
    showDropdown.value = false
    mentionQuery.value = ''
    mentionStartPos.value = -1
    selectedIndex.value = 0
  }

  return {
    showDropdown: readonly(showDropdown),
    filteredOptions,
    selectedIndex: readonly(selectedIndex),
    handleInput,
    handleKeydown,
    selectOption,
    closeDropdown,
  }
}
