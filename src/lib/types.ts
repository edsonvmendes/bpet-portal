export type Role = 'admin' | 'viewer'

export interface UserProfile {
  id: string
  email: string
  role: Role
  full_name?: string | null
  created_at: string
}

export interface PortalSettings {
  id: number
  portal_title: string
  report_id?: string | null
  embed_url?: string | null
  active_mode: 'report_id' | 'embed_url'
  updated_at: string
  updated_by?: string | null
}

// FIX #9: campo correto é event_type (igual à tabela)
export interface AuditLog {
  id: number
  event_type: string
  user_id?: string | null
  user_email?: string | null
  metadata?: Record<string, unknown> | null
  created_at: string
}
