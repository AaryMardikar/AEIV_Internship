// ─── Dashboard Sample Data ────────────────────────────────────────────────────
// Replace with real API calls when backend features are built

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed' | 'overdue';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type ApprovalType = 'leave' | 'expense' | 'access' | 'project' | 'purchase';
export type ActivityType =
  | 'task_created'
  | 'task_completed'
  | 'task_assigned'
  | 'approval_requested'
  | 'approval_granted'
  | 'comment_added'
  | 'file_uploaded'
  | 'deadline_set';

export interface Assignee {
  name: string;
  initials: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  project: string;
  assignee: Assignee;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  progress: number;
}

export interface Deadline {
  id: string;
  title: string;
  project: string;
  dueDate: string;
  daysLeft: number;
  priority: 'critical' | 'high' | 'medium';
  progress: number;
  assignees: Assignee[];
}

export interface Approval {
  id: string;
  title: string;
  requester: Assignee & { department: string };
  type: ApprovalType;
  requestedAt: string;
  priority: 'urgent' | 'normal';
  amount?: string;
  description: string;
}

export interface ActivityItem {
  id: string;
  user: Assignee;
  action: string;
  target: string;
  type: ActivityType;
  timeAgo: string;
}

// ─── Tasks ────────────────────────────────────────────────────────────────────
export const SAMPLE_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Redesign onboarding flow for enterprise clients',
    project: 'Product Redesign',
    assignee: { name: 'Sarah Chen', initials: 'SC', color: '#0078D4' },
    priority: 'high',
    status: 'in_progress',
    dueDate: '2026-06-18',
    progress: 65,
  },
  {
    id: 't2',
    title: 'Migrate legacy auth module to JWT',
    project: 'Platform Security',
    assignee: { name: 'Marcus Webb', initials: 'MW', color: '#6264A7' },
    priority: 'critical',
    status: 'in_progress',
    dueDate: '2026-06-17',
    progress: 82,
  },
  {
    id: 't3',
    title: 'Quarterly performance review documentation',
    project: 'HR Operations',
    assignee: { name: 'Priya Nair', initials: 'PN', color: '#107C10' },
    priority: 'medium',
    status: 'review',
    dueDate: '2026-06-20',
    progress: 90,
  },
  {
    id: 't4',
    title: 'Configure Datadog APM for production services',
    project: 'Infrastructure',
    assignee: { name: 'James Okafor', initials: 'JO', color: '#D83B01' },
    priority: 'high',
    status: 'todo',
    dueDate: '2026-06-22',
    progress: 0,
  },
  {
    id: 't5',
    title: 'Write integration test suite for payments API',
    project: 'Backend Core',
    assignee: { name: 'Lily Zhang', initials: 'LZ', color: '#00B7C3' },
    priority: 'high',
    status: 'overdue',
    dueDate: '2026-06-14',
    progress: 35,
  },
  {
    id: 't6',
    title: 'Create content strategy for Q3 campaign',
    project: 'Marketing',
    assignee: { name: 'Tom Rivera', initials: 'TR', color: '#C43E1C' },
    priority: 'medium',
    status: 'completed',
    dueDate: '2026-06-15',
    progress: 100,
  },
  {
    id: 't7',
    title: 'Update GDPR compliance checklist',
    project: 'Legal & Compliance',
    assignee: { name: 'Fatima Al-Amin', initials: 'FA', color: '#8764B8' },
    priority: 'critical',
    status: 'in_progress',
    dueDate: '2026-06-19',
    progress: 50,
  },
  {
    id: 't8',
    title: 'Deploy A/B test for homepage CTA',
    project: 'Growth',
    assignee: { name: 'Sam Park', initials: 'SP', color: '#038387' },
    priority: 'low',
    status: 'completed',
    dueDate: '2026-06-13',
    progress: 100,
  },
];

// ─── Upcoming Deadlines ───────────────────────────────────────────────────────
export const SAMPLE_DEADLINES: Deadline[] = [
  {
    id: 'd1',
    title: 'Platform Security Audit Report',
    project: 'Platform Security',
    dueDate: '2026-06-17',
    daysLeft: 1,
    priority: 'critical',
    progress: 72,
    assignees: [
      { name: 'Marcus Webb', initials: 'MW', color: '#6264A7' },
      { name: 'Fatima Al-Amin', initials: 'FA', color: '#8764B8' },
    ],
  },
  {
    id: 'd2',
    title: 'Onboarding Flow Prototype Handoff',
    project: 'Product Redesign',
    dueDate: '2026-06-18',
    daysLeft: 2,
    priority: 'high',
    progress: 65,
    assignees: [{ name: 'Sarah Chen', initials: 'SC', color: '#0078D4' }],
  },
  {
    id: 'd3',
    title: 'GDPR Compliance Review',
    project: 'Legal & Compliance',
    dueDate: '2026-06-19',
    daysLeft: 3,
    priority: 'critical',
    progress: 50,
    assignees: [{ name: 'Fatima Al-Amin', initials: 'FA', color: '#8764B8' }],
  },
  {
    id: 'd4',
    title: 'Q3 Budget Forecast Submission',
    project: 'Finance',
    dueDate: '2026-06-22',
    daysLeft: 6,
    priority: 'high',
    progress: 30,
    assignees: [
      { name: 'James Okafor', initials: 'JO', color: '#D83B01' },
      { name: 'Tom Rivera', initials: 'TR', color: '#C43E1C' },
    ],
  },
  {
    id: 'd5',
    title: 'Infrastructure Datadog Setup',
    project: 'Infrastructure',
    dueDate: '2026-06-22',
    daysLeft: 6,
    priority: 'medium',
    progress: 0,
    assignees: [{ name: 'James Okafor', initials: 'JO', color: '#D83B01' }],
  },
];

// ─── Pending Approvals ────────────────────────────────────────────────────────
export const SAMPLE_APPROVALS: Approval[] = [
  {
    id: 'a1',
    title: 'Annual Leave — 5 Days',
    requester: {
      name: 'Sarah Chen',
      initials: 'SC',
      color: '#0078D4',
      department: 'Product',
    },
    type: 'leave',
    requestedAt: '2 hours ago',
    priority: 'normal',
    description: 'Vacation leave Jul 7–11, 2026. Cover arranged with Lily Zhang.',
  },
  {
    id: 'a2',
    title: 'AWS Infrastructure Spend — $4,200',
    requester: {
      name: 'James Okafor',
      initials: 'JO',
      color: '#D83B01',
      department: 'Infrastructure',
    },
    type: 'expense',
    requestedAt: '4 hours ago',
    priority: 'urgent',
    amount: '$4,200',
    description: 'EC2 instance upgrade for production load testing environment.',
  },
  {
    id: 'a3',
    title: 'Admin Access Request — GitHub Org',
    requester: {
      name: 'Marcus Webb',
      initials: 'MW',
      color: '#6264A7',
      department: 'Engineering',
    },
    type: 'access',
    requestedAt: '1 day ago',
    priority: 'normal',
    description: 'Requires admin rights to configure branch protection rules.',
  },
  {
    id: 'a4',
    title: 'New Project — Mobile App v2',
    requester: {
      name: 'Priya Nair',
      initials: 'PN',
      color: '#107C10',
      department: 'Product',
    },
    type: 'project',
    requestedAt: '1 day ago',
    priority: 'normal',
    description: 'Proposal for Q3 mobile app redesign initiative. Budget: $28,000.',
  },
];

// ─── Activity Feed ────────────────────────────────────────────────────────────
export const SAMPLE_ACTIVITY: ActivityItem[] = [
  {
    id: 'ac1',
    user: { name: 'Marcus Webb', initials: 'MW', color: '#6264A7' },
    action: 'completed',
    target: 'Deploy A/B test for homepage CTA',
    type: 'task_completed',
    timeAgo: '12 min ago',
  },
  {
    id: 'ac2',
    user: { name: 'Sarah Chen', initials: 'SC', color: '#0078D4' },
    action: 'submitted approval for',
    target: 'Annual Leave — 5 Days',
    type: 'approval_requested',
    timeAgo: '2 hrs ago',
  },
  {
    id: 'ac3',
    user: { name: 'Lily Zhang', initials: 'LZ', color: '#00B7C3' },
    action: 'uploaded files to',
    target: 'Backend Core / Payments API',
    type: 'file_uploaded',
    timeAgo: '3 hrs ago',
  },
  {
    id: 'ac4',
    user: { name: 'James Okafor', initials: 'JO', color: '#D83B01' },
    action: 'created task',
    target: 'Configure Datadog APM for production',
    type: 'task_created',
    timeAgo: '4 hrs ago',
  },
  {
    id: 'ac5',
    user: { name: 'Priya Nair', initials: 'PN', color: '#107C10' },
    action: 'commented on',
    target: 'Quarterly Performance Review',
    type: 'comment_added',
    timeAgo: '5 hrs ago',
  },
  {
    id: 'ac6',
    user: { name: 'Fatima Al-Amin', initials: 'FA', color: '#8764B8' },
    action: 'assigned to',
    target: 'GDPR Compliance Review',
    type: 'task_assigned',
    timeAgo: '6 hrs ago',
  },
  {
    id: 'ac7',
    user: { name: 'Tom Rivera', initials: 'TR', color: '#C43E1C' },
    action: 'set deadline for',
    target: 'Q3 Budget Forecast Submission',
    type: 'deadline_set',
    timeAgo: '8 hrs ago',
  },
  {
    id: 'ac8',
    user: { name: 'Sam Park', initials: 'SP', color: '#038387' },
    action: 'approved request for',
    target: 'AWS Infrastructure Spend',
    type: 'approval_granted',
    timeAgo: '1 day ago',
  },
];

// ─── Computed Summary Stats ───────────────────────────────────────────────────
export const DASHBOARD_STATS = {
  totalTasks: 247,
  pendingTasks: 38,
  completedTasks: 189,
  pendingApprovals: 12,
  upcomingDeadlines: 7,
};
