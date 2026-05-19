export type Role = 'employee' | 'manager' | 'admin'

export type UoMType = 'Min' | 'Max' | 'Timeline' | 'Zero'

export type GoalStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Locked'

export type CheckInStatus = 'Not Started' | 'On Track' | 'Completed'

export type QuarterKey = 'Q1' | 'Q2' | 'Q3' | 'Q4'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  department: string
  manager_id: string | null
  avatar_url?: string | null
  created_at?: string
}

export interface Goal {
  id: string
  user_id: string
  title: string
  thrust_area: string
  description: string | null
  uom_type: UoMType
  target: string
  achievement: string | null
  weightage: number
  status: GoalStatus
  deadline: string
  locked: boolean
  manager_comment: string | null
  is_shared: boolean
  shared_goal_id: string | null
  created_at?: string
  updated_at?: string
  // joined
  user?: User
  quarterly_updates?: QuarterlyUpdate[]
}

export interface QuarterlyUpdate {
  id: string
  goal_id: string
  quarter: QuarterKey
  achievement: string
  status: CheckInStatus
  notes: string | null
  submitted_by: string
  created_at?: string
  updated_at?: string
}

export interface SharedGoal {
  id: string
  title: string
  thrust_area: string
  description: string | null
  uom_type: UoMType
  target: string
  created_by: string
  department: string | null
  created_at?: string
}

export interface Comment {
  id: string
  goal_id: string
  user_id: string
  content: string
  created_at?: string
  user?: User
}

export interface AuditLog {
  id: string
  user_id: string
  action: string
  entity_type: string
  entity_id: string
  old_value: string | null
  new_value: string | null
  created_at?: string
  user?: User
}

export interface Cycle {
  id: string
  name: string
  cycle_type: 'goal_setting' | 'Q1' | 'Q2' | 'Q3' | 'Q4'
  start_date: string
  end_date: string
  is_active: boolean
  override_by?: string | null
}

export interface ProgressResult {
  value: number
  label: string
}

export interface GoalFormData {
  title: string
  thrust_area: string
  description: string
  uom_type: UoMType | ''
  target: string
  weightage: number | ''
  deadline: string
}

export interface CheckInFormData {
  quarter: QuarterKey
  achievement: string
  status: CheckInStatus
  notes: string
}
