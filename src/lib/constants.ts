import type { User, Goal, AuditLog, QuarterlyUpdate } from '@/types'

export const THRUST_AREAS = [
  'Revenue Growth',
  'Customer Success',
  'Product Quality',
  'Operational Efficiency',
  'People Development',
  'Innovation',
  'Compliance & Risk',
] as const

export const UOM_TYPES = ['Min', 'Max', 'Timeline', 'Zero'] as const

export const GOAL_STATUSES = ['Draft', 'Submitted', 'Approved', 'Rejected', 'Locked'] as const

export const CHECK_IN_STATUSES = ['Not Started', 'On Track', 'Completed'] as const

export const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'] as const

export const MAX_GOALS = 8
export const MIN_WEIGHTAGE = 10
export const MAX_WEIGHTAGE = 100

export const DEMO_USERS: User[] = [
  { id: 'u1', name: 'Priya Sharma', email: 'priya@aligniq.ai', role: 'employee', department: 'Engineering', manager_id: 'u3' },
  { id: 'u2', name: 'Rahul Menon', email: 'rahul@aligniq.ai', role: 'employee', department: 'Product', manager_id: 'u3' },
  { id: 'u3', name: 'Deepa Iyer', email: 'deepa@aligniq.ai', role: 'manager', department: 'Engineering', manager_id: 'u4' },
  { id: 'u4', name: 'Kiran Patel', email: 'kiran@aligniq.ai', role: 'admin', department: 'HR', manager_id: null },
]

export const DEMO_QUARTERLY: Record<string, QuarterlyUpdate[]> = {
  g1: [
    { id: 'qu1', goal_id: 'g1', quarter: 'Q1', achievement: '6.5', status: 'On Track', notes: 'Implemented new triage process', submitted_by: 'u1' },
    { id: 'qu2', goal_id: 'g1', quarter: 'Q2', achievement: '5.1', status: 'On Track', notes: 'Team upskilling done', submitted_by: 'u1' },
    { id: 'qu3', goal_id: 'g1', quarter: 'Q3', achievement: '3.8', status: 'On Track', notes: 'Automation helping', submitted_by: 'u1' },
    { id: 'qu4', goal_id: 'g1', quarter: 'Q4', achievement: '3.2', status: 'Completed', notes: 'Target exceeded!', submitted_by: 'u1' },
  ],
  g3: [
    { id: 'qu5', goal_id: 'g3', quarter: 'Q1', achievement: '71', status: 'On Track', notes: '', submitted_by: 'u1' },
    { id: 'qu6', goal_id: 'g3', quarter: 'Q2', achievement: '76', status: 'On Track', notes: '', submitted_by: 'u1' },
    { id: 'qu7', goal_id: 'g3', quarter: 'Q3', achievement: '82', status: 'On Track', notes: '', submitted_by: 'u1' },
    { id: 'qu8', goal_id: 'g3', quarter: 'Q4', achievement: '87', status: 'Completed', notes: 'Exceeded target', submitted_by: 'u1' },
  ],
}

export const DEMO_GOALS: Goal[] = [
  {
    id: 'g1', user_id: 'u1', title: 'Reduce P1 bug resolution time',
    thrust_area: 'Product Quality', description: 'Reduce time to resolve P1 incidents from 8h avg to under 4h',
    uom_type: 'Min', target: '4', achievement: '3.2', weightage: 30,
    status: 'Approved', deadline: '2025-12-31', locked: true,
    manager_comment: 'Great initiative. Keep the automation focus.', is_shared: false, shared_goal_id: null,
  },
  {
    id: 'g2', user_id: 'u1', title: 'Complete AWS Solutions Architect certification',
    thrust_area: 'People Development', description: 'Obtain AWS SA certification by Q3 2025',
    uom_type: 'Timeline', target: '2025-09-30', achievement: '2025-08-15', weightage: 20,
    status: 'Approved', deadline: '2025-09-30', locked: true,
    manager_comment: null, is_shared: false, shared_goal_id: null,
  },
  {
    id: 'g3', user_id: 'u1', title: 'Increase unit test coverage to 85%',
    thrust_area: 'Product Quality', description: 'Raise unit test coverage from 68% to 85%',
    uom_type: 'Max', target: '85', achievement: '87', weightage: 25,
    status: 'Approved', deadline: '2025-12-31', locked: true,
    manager_comment: null, is_shared: false, shared_goal_id: null,
  },
  {
    id: 'g4', user_id: 'u1', title: 'Zero critical security vulnerabilities',
    thrust_area: 'Compliance & Risk', description: 'Ensure no critical CVEs remain open beyond SLA',
    uom_type: 'Zero', target: '0', achievement: '0', weightage: 25,
    status: 'Approved', deadline: '2025-12-31', locked: true,
    manager_comment: null, is_shared: false, shared_goal_id: null,
  },
  {
    id: 'g5', user_id: 'u2', title: 'Launch 3 major product features',
    thrust_area: 'Product Quality', description: 'Ship 3 high-impact features with NPS > 40 each',
    uom_type: 'Max', target: '3', achievement: '2', weightage: 35,
    status: 'Approved', deadline: '2025-12-31', locked: true,
    manager_comment: 'Good progress on feature planning. Feature C needs attention.', is_shared: false, shared_goal_id: null,
  },
  {
    id: 'g6', user_id: 'u2', title: 'Improve NPS score to 55',
    thrust_area: 'Customer Success', description: 'Increase product NPS from 32 to 55',
    uom_type: 'Max', target: '55', achievement: '48', weightage: 30,
    status: 'Approved', deadline: '2025-12-31', locked: true,
    manager_comment: null, is_shared: false, shared_goal_id: null,
  },
  {
    id: 'g7', user_id: 'u2', title: 'Conduct 50 user research sessions',
    thrust_area: 'Innovation', description: 'Run 50 structured user research sessions to feed roadmap',
    uom_type: 'Max', target: '50', achievement: '53', weightage: 20,
    status: 'Approved', deadline: '2025-12-31', locked: true,
    manager_comment: null, is_shared: false, shared_goal_id: null,
  },
  {
    id: 'g8', user_id: 'u2', title: 'Document all product specifications',
    thrust_area: 'Operational Efficiency', description: '100% of features to have PRDs before dev handoff',
    uom_type: 'Max', target: '100', achievement: null, weightage: 15,
    status: 'Submitted', deadline: '2025-12-31', locked: false,
    manager_comment: null, is_shared: false, shared_goal_id: null,
  },
  {
    id: 'g9', user_id: 'u1', title: 'Mentor 2 junior engineers',
    thrust_area: 'People Development', description: 'Conduct structured mentoring with measurable skill outcomes',
    uom_type: 'Max', target: '2', achievement: null, weightage: 0,
    status: 'Draft', deadline: '2025-12-31', locked: false,
    manager_comment: null, is_shared: false, shared_goal_id: null,
  },
]

export const DEMO_AUDIT: AuditLog[] = [
  { id: 'a1', user_id: 'u3', action: 'Goal Approved', entity_type: 'goal', entity_id: 'g1', old_value: 'Submitted', new_value: 'Approved', created_at: '2025-05-10 09:14:22' },
  { id: 'a2', user_id: 'u4', action: 'Goal Unlocked', entity_type: 'goal', entity_id: 'g3', old_value: 'Locked', new_value: 'Editable', created_at: '2025-06-02 11:30:15' },
  { id: 'a3', user_id: 'u3', action: 'Comment Added', entity_type: 'goal', entity_id: 'g5', old_value: null, new_value: 'Good progress on feature planning', created_at: '2025-07-15 14:22:08' },
  { id: 'a4', user_id: 'u1', action: 'Q3 Check-in Submitted', entity_type: 'quarterly_update', entity_id: 'g1', old_value: '4.2', new_value: '3.8', created_at: '2025-10-05 10:01:45' },
  { id: 'a5', user_id: 'u3', action: 'Goal Approved', entity_type: 'goal', entity_id: 'g5', old_value: 'Submitted', new_value: 'Approved', created_at: '2025-05-12 13:55:30' },
  { id: 'a6', user_id: 'u2', action: 'Goal Submitted', entity_type: 'goal', entity_id: 'g8', old_value: 'Draft', new_value: 'Submitted', created_at: '2025-05-20 09:00:00' },
]

export const CYCLE_WINDOWS = [
  { name: 'Goal Setting', period: 'May 1 – May 31', type: 'goal_setting', active: false },
  { name: 'Q1 Check-In', period: 'July 1 – July 31', type: 'Q1', active: false },
  { name: 'Q2 Check-In', period: 'October 1 – October 31', type: 'Q2', active: false },
  { name: 'Q3 Check-In', period: 'January 1 – January 31', type: 'Q3', active: false },
  { name: 'Q4 / Annual Review', period: 'March 1 – April 30', type: 'Q4', active: true },
] as const
