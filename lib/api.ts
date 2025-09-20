export class ApiClient {
  private baseUrl: string
  private token: string | null

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"
    this.token = null
  }

  setToken(token: string | null) {
    this.token = token
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Request failed" }))
      throw new Error(error.error || "Request failed")
    }

    return response.json()
  }

  // Notes API
  async getNotes() {
    return this.request("/notes")
  }

  async createNote(title: string, content: string) {
    return this.request("/notes", {
      method: "POST",
      body: JSON.stringify({ title, content }),
    })
  }

  async updateNote(id: string, title: string, content: string) {
    return this.request(`/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify({ title, content }),
    })
  }

  async deleteNote(id: string) {
    return this.request(`/notes/${id}`, {
      method: "DELETE",
    })
  }

  // Subscription API
  async upgradeTenant(slug: string) {
    return this.request(`/tenants/${slug}/upgrade`, {
      method: "POST",
    })
  }
}

export const apiClient = new ApiClient()
