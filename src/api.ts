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

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(8000),
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

export type ApiApplicationInput = {
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

export type ApiFollowUpInput = {
  title: string
  dueLabel: string
  status: string
  context: string
}

/**
 * Map a local Application to the shape expected by the API.
 */
export function toApiApplicationInput(app: {
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
}): ApiApplicationInput {
  return {
    company: app.company,
    role: app.role,
    stage: app.stage,
    location: app.location,
    salary: app.salary,
    appliedOn: app.appliedOn,
    nextStep: app.nextStep,
    resume: app.resume,
    contact: app.contact,
    contactRole: app.contactRole,
    notes: app.notes,
  }
}

/**
 * Map a local FollowUp to the shape expected by the API.
 */
export function toApiFollowUpInput(fup: {
  title: string
  dueLabel: string
  status: string
  context: string
}): ApiFollowUpInput {
  return {
    title: fup.title,
    dueLabel: fup.dueLabel,
    status: fup.status,
    context: fup.context,
  }
}

/* ------------------------------------------------------------------ */
/*  Public helpers                                                     */
/* ------------------------------------------------------------------ */

/** True when the backend is reachable at the configured API_BASE. */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/applications`, {
      method: 'HEAD',
      signal: AbortSignal.timeout(3000),
    })
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
  data: ApiFollowUpInput,
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
  data: ApiFollowUpInput,
): Promise<ApiFollowUp> {
  return request<ApiFollowUp>(`/api/followups/${applicationId}/${followUpId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/* ------------------------------------------------------------------ */
/*  Application endpoints                                              */
/* ------------------------------------------------------------------ */

/** GET /api/applications — list all applications. */
export async function fetchApplications(): Promise<ApiApplication[]> {
  return request<ApiApplication[]>('/api/applications')
}

/** POST /api/applications — create a new application. */
export async function createApplication(data: ApiApplicationInput): Promise<ApiApplication> {
  return request<ApiApplication>('/api/applications', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/** PUT /api/applications/{id} — update an existing application. */
export async function updateApplication(
  id: number,
  data: ApiApplicationInput,
): Promise<ApiApplication> {
  return request<ApiApplication>(`/api/applications/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/** DELETE /api/applications/{id} — delete an application and its follow-ups (cascade). */
export async function deleteApplication(id: number): Promise<void> {
  return request<void>(`/api/applications/${id}`, {
    method: 'DELETE',
  })
}
