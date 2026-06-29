/**
 * Job Tracker API client.
 *
 * Typed fetch wrapper around the Go backend.
 * All functions are safe to call when the backend is unreachable —
 * consumers can catch errors or check the return type.
 */

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080'

/* ------------------------------------------------------------------ */
/*  Internal helpers                                                   */
/* ------------------------------------------------------------------ */

class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE}${path}`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new ApiError(body || res.statusText, res.status)
  }

  // 204 No Content — no body to parse
  if (res.status === 204) return undefined as unknown as T

  return res.json() as Promise<T>
}

/* ------------------------------------------------------------------ */
/*  Types (server shapes)                                              */
/* ------------------------------------------------------------------ */

export type ApiFollowUp = {
  id: number
  applicationId: number
  title: string
  dueLabel: string
  status: 'due-today' | 'this-week' | 'waiting' | 'completed'
  context: string
}

export type ApiApplication = {
  id: number
  company: string
  role: string
  stage: string
  location: string
  salary: string
  appliedOn: string
  nextStep: string
  resume: string
  contact: string
  contactRole: string
  notes: string
}

/* ------------------------------------------------------------------ */
/*  Public helpers                                                     */
/* ------------------------------------------------------------------ */

/** True when the backend is reachable at the configured API_BASE. */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/applications`, { method: 'HEAD', signal: AbortSignal.timeout(2000) })
    return res.ok
  } catch {
    return false
  }
}

/* ------------------------------------------------------------------ */
/*  Follow-up endpoints                                                */
/* ------------------------------------------------------------------ */

/** GET /api/followups/{applicationId} — list follow-ups for an application. */
export async function fetchFollowUps(applicationId: number): Promise<ApiFollowUp[]> {
  return request<ApiFollowUp[]>(`/api/followups/${applicationId}`)
}

/** POST /api/followups/{applicationId} — create a follow-up. */
export async function createFollowUp(
  applicationId: number,
  data: { title: string; dueLabel: string; status: string; context: string },
): Promise<ApiFollowUp> {
  return request<ApiFollowUp>(`/api/followups/${applicationId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/** PUT /api/followups/{applicationId}/{followUpId} — update a follow-up. */
export async function updateFollowUp(
  applicationId: number,
  followUpId: number,
  data: { title: string; dueLabel: string; status: string; context: string },
): Promise<ApiFollowUp> {
  return request<ApiFollowUp>(`/api/followups/${applicationId}/${followUpId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/** DELETE /api/followups/{applicationId}/{followUpId} — delete a follow-up. */
export async function deleteFollowUp(
  applicationId: number,
  followUpId: number,
): Promise<void> {
  return request<void>(`/api/followups/${applicationId}/${followUpId}`, {
    method: 'DELETE',
  })
}

/* ------------------------------------------------------------------ */
/*  Application endpoints (read-only for now, expand as needed)        */
/* ------------------------------------------------------------------ */

/** GET /api/applications — list all applications. */
export async function fetchApplications(): Promise<ApiApplication[]> {
  return request<ApiApplication[]>('/api/applications')
}