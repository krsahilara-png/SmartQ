export type UserRole = 'customer' | 'operator' | 'admin';

export type ConnectionState =
  | 'unconfigured'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error';

export type RealtimeState = 'idle' | 'subscribing' | 'live' | 'error' | 'offline';

export interface UiPreferences {
  theme: 'light' | 'dark';
  language: 'en' | 'hi';
  voiceAnnouncements: boolean;
  browserNotificationsEnabled: boolean;
}

export interface SmartQProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  assignedCentreId: string;
  assignedCounterId: string;
  favouriteCentreIds: string[];
  createdAt: string;
}

export interface SmartQAnnouncement {
  id: string;
  businessId: string;
  message: string;
  messageHi: string;
  active: boolean;
  createdAt: string;
}

export interface SmartQCentre {
  id: string;
  name: string;
  nameHi: string;
  directoryCategoryId: string;
  area: string;
  locality: string;
  areaTags: string[];
  address: string;
  city: string;
  phone: string;
  openTime: string;
  closeTime: string;
  dataScope: 'directory' | 'operational' | 'demo';
  isOnboarded: boolean;
  bookingEnabled: boolean;
  verified: boolean;
  verifiedAt: string | null;
  verifiedBy: string;
  isActive: boolean;
  announcements: SmartQAnnouncement[];
}

export interface SmartQCategory {
  id: string;
  name: string;
  nameHi: string;
  code: string;
  defaultDurationMin: number;
  description: string;
  directoryCategoryId?: string | null;
  active: boolean;
  isTemplateService?: boolean;
}

export interface SmartQCounter {
  id: string;
  centreId: string;
  number: string;
  name: string;
  categoryIds: string[];
  operatorId: string;
  status: 'open' | 'paused' | 'closed';
  maxCapacity: number;
  avgDurationMin: number;
  openTime: string;
  closeTime: string;
  pauseReason: string;
  createdAt: string;
}

export interface SmartQToken {
  id: string;
  tokenNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  isGuest: boolean;
  centreId: string;
  categoryId: string;
  counterId: string;
  bookingType: 'immediate' | 'appointment';
  scheduledTime: string;
  createdAt: string;
  calledAt: string | null;
  arrivedAt: string | null;
  servingStartedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  noShowAt?: string | null;
  restoredAt?: string | null;
  restoredBy?: string;
  restoreReason?: string;
  cancelReason: string;
  noShowReason?: string;
  noShowMode?: string;
  recallCount?: number;
  actualServiceDurationMin?: number | null;
  position: number;
  peopleAhead?: number;
  waitingAhead?: number;
  etaMin: number;
  etaRangeMin?: number | null;
  etaRangeMax?: number | null;
  etaAvgServiceMin?: number | null;
  etaSampleCount?: number;
  status: string;
  priorityType: string;
  priorityApprovedBy: string;
  priorityReason: string;
  notes: string;
  lastNotifiedEtaMin?: number | null;
  notifiedThresholds: string[];
  isRedactedPublic?: boolean;
}

export interface SmartQNotification {
  id: string;
  userId: string;
  tokenId: string;
  type: string;
  title: string;
  message: string;
  urgent?: boolean;
  read: boolean;
  createdAt: string;
}

export interface SmartQServiceHistory {
  id: string;
  tokenId: string;
  tokenNumber: string;
  centreId: string;
  counterId: string;
  categoryId: string;
  operatorId: string;
  fromStatus?: string;
  toStatus?: string;
  waitDurationMin: number;
  serviceDurationMin: number;
  hourOfDay: number;
  dateStr: string;
  outcome: string;
  notes?: string;
  createdAt: string;
}

export interface SmartQNoShowHistory {
  id: string;
  tokenId: string;
  tokenNumber: string;
  customerId: string;
  customerName: string;
  centreId: string;
  counterId: string;
  counterNumber: string;
  calledAt: string | null;
  timestamp: string;
  reason: string;
  mode: 'manual' | 'automatic';
  actorName: string;
  restored: boolean;
  restoredAt: string | null;
  restoredBy: string;
  restoreReason: string;
}

export interface SmartQAuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  createdAt: string;
}

export interface SmartQSettings {
  notifyAtFive: boolean;
  notifyAtThree: boolean;
  notifyAtOne: boolean;
  notifyApproaching: boolean;
  notifyEtaChange: boolean;
  browserNotificationsEnabled: boolean;
  noShowGraceSec: number;
  autoNoShowEnabled: boolean;
  autoAdvanceOnNoShow: boolean;
  priorityRules: {
    senior: boolean;
    medical: boolean;
    accessibility: boolean;
    vip: boolean;
    requireReason: boolean;
  };
  language: 'en' | 'hi';
  theme: 'light' | 'dark';
  voiceAnnouncements: boolean;
}

export interface SmartQDatabaseSnapshot {
  version: number;
  queueRevision: number;
  tokenCounters: Record<string, number>;
  users: SmartQProfile[];
  centres: SmartQCentre[];
  categories: SmartQCategory[];
  counters: SmartQCounter[];
  tokens: SmartQToken[];
  notifications: SmartQNotification[];
  serviceHistory: SmartQServiceHistory[];
  noShowHistory: SmartQNoShowHistory[];
  auditLogs: SmartQAuditLog[];
  etaStats: Record<string, unknown>;
  settings: SmartQSettings;
}

export interface BackendOperationResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
  code?: string;
  needsEmailConfirmation?: boolean;
}
