import type { Resume } from '~/types'

export function useResume() {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase
  const { getAuthHeader } = useAuth()
  const toast = useToast()

  const resume = ref<Resume | null>(null)
  const loading = ref(false)
  const saving = ref(false)

  async function fetchResume() {
    loading.value = true
    try {
      const res = await fetch(`${apiBase}/admin/resume`, {
        headers: { ...getAuthHeader() },
      })
      const json = await res.json()
      if (json.success) {
        resume.value = json.data
      }
    } catch (e) {
      console.error('Failed to fetch resume', e)
    } finally {
      loading.value = false
    }
  }

  async function saveResume(data: Omit<Resume, '_id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Resume | null> {
    saving.value = true
    try {
      const res = await fetch(`${apiBase}/admin/resume`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (json.success) {
        resume.value = json.data
        toast.success('Resume saved successfully')
        return json.data
      } else {
        toast.error(json.message || 'Failed to save resume')
        return null
      }
    } catch (e) {
      console.error('Failed to save resume', e)
      toast.error('Failed to save resume')
      return null
    } finally {
      saving.value = false
    }
  }

  async function deleteResume(): Promise<boolean> {
    try {
      const res = await fetch(`${apiBase}/admin/resume`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      })
      const json = await res.json()
      if (json.success) {
        resume.value = null
        toast.success('Resume deleted')
        return true
      }
      return false
    } catch (e) {
      console.error('Failed to delete resume', e)
      return false
    }
  }

  return {
    resume,
    loading,
    saving,
    fetchResume,
    saveResume,
    deleteResume,
  }
}
