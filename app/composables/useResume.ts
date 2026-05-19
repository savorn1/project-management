import type { Resume, ResumeListItem } from '~/types'

export function useResume() {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase
  const { getAuthHeader } = useAuth()
  const toast = useToast()

  const resumeList = ref<ResumeListItem[]>([])
  const resume = ref<Resume | null>(null)
  const loading = ref(false)
  const saving = ref(false)

  async function fetchResumeList() {
    loading.value = true
    try {
      const res = await fetch(`${apiBase}/admin/resumes`, {
        headers: { ...getAuthHeader() },
      })
      const json = await res.json()
      if (json.success) resumeList.value = json.data ?? []
    } catch (e) {
      console.error('Failed to fetch resume list', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchResume(id: string) {
    loading.value = true
    try {
      const res = await fetch(`${apiBase}/admin/resumes/${id}`, {
        headers: { ...getAuthHeader() },
      })
      const json = await res.json()
      if (json.success) resume.value = json.data
    } catch (e) {
      console.error('Failed to fetch resume', e)
    } finally {
      loading.value = false
    }
  }

  async function createResume(data: Omit<Resume, '_id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Resume | null> {
    saving.value = true
    try {
      const res = await fetch(`${apiBase}/admin/resumes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (json.success) {
        resume.value = json.data
        resumeList.value.unshift({ _id: json.data._id, cvName: json.data.cvName, fullName: json.data.fullName, updatedAt: json.data.updatedAt })
        toast.success('Resume created')
        return json.data
      } else {
        toast.error(json.message || 'Failed to create resume')
        return null
      }
    } catch (e) {
      console.error('Failed to create resume', e)
      toast.error('Failed to create resume')
      return null
    } finally {
      saving.value = false
    }
  }

  async function saveResume(id: string, data: Omit<Resume, '_id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Resume | null> {
    saving.value = true
    try {
      const res = await fetch(`${apiBase}/admin/resumes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (json.success) {
        resume.value = json.data
        const idx = resumeList.value.findIndex(r => r._id === id)
        if (idx !== -1) {
          resumeList.value[idx] = { _id: json.data._id, cvName: json.data.cvName, fullName: json.data.fullName, updatedAt: json.data.updatedAt }
        }
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

  async function renameResume(id: string, cvName: string): Promise<boolean> {
    try {
      const res = await fetch(`${apiBase}/admin/resumes/${id}/name`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ cvName }),
      })
      const json = await res.json()
      if (json.success) {
        const idx = resumeList.value.findIndex(r => r._id === id)
        if (idx !== -1) resumeList.value[idx]!.cvName = cvName
        if (resume.value?._id === id) resume.value.cvName = cvName
        return true
      }
      return false
    } catch (e) {
      console.error('Failed to rename resume', e)
      return false
    }
  }

  async function cloneResume(id: string): Promise<Resume | null> {
    saving.value = true
    try {
      const res = await fetch(`${apiBase}/admin/resumes/${id}/clone`, {
        method: 'POST',
        headers: { ...getAuthHeader() },
      })
      const json = await res.json()
      if (json.success) {
        resumeList.value.unshift({ _id: json.data._id, cvName: json.data.cvName, fullName: json.data.fullName, updatedAt: json.data.updatedAt })
        toast.success('CV cloned')
        return json.data
      } else {
        toast.error(json.message || 'Failed to clone CV')
        return null
      }
    } catch (e) {
      console.error('Failed to clone resume', e)
      toast.error('Failed to clone CV')
      return null
    } finally {
      saving.value = false
    }
  }

  async function deleteResume(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${apiBase}/admin/resumes/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      })
      const json = await res.json()
      if (json.success) {
        resumeList.value = resumeList.value.filter(r => r._id !== id)
        if (resume.value?._id === id) resume.value = null
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
    resumeList,
    resume,
    loading,
    saving,
    fetchResumeList,
    fetchResume,
    createResume,
    saveResume,
    renameResume,
    cloneResume,
    deleteResume,
  }
}
