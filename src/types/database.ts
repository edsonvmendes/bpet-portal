export interface UserProfile {
  id: string
  email: string
  role: 'admin' | 'viewer'
  full_name?: string | null
  created_at: string
  updated_at: string
}

export interface PortalSettings {
  id: 1
  portal_title: string
  report_id: string | null
  embed_url: string | null
  active_mode: 'report_id' | 'embed_url'
  updated_at: string
  updated_by: string | null
}

export interface AuditLog {
  id: number
  user_id: string | null
  user_email: string | null
  event_type: string       // coluna real no banco = event_type
  metadata: Record<string, unknown> | null
  created_at: string
}
