export type Priority = 'high' | 'medium' | 'low';

// 9. 데이터 구조 원칙 준수
export interface Task {
  id: string;
  title: string;
  project: string;
  estimatedMinutes: number; // or estimatedTime
  memo: string;
  deadline?: string; // YYYY-MM-DD or YYYY-MM-DD HH:mm
  isCompleted: boolean; // completed status
  priority: Priority;
  completedAt?: string;
  createdAt: string;
  date: string; // YYYY-MM-DD
  sourceCallLogId?: string; // If added from a call log
  sourcePhotoMemo?: boolean;
}

export interface Schedule {
  id: string;
  title: string;
  project: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  isConfirmed: boolean; // confirmed status
  notification?: boolean;
  confirmedAt?: string;
  createdAt: string;
  memo?: string;
}

export interface ExtractedFollowUp {
  title: string;
  estimatedMinutes: number;
  memo: string;
  project: string;
  deadline: string;
  priority?: Priority;
}

export interface ExtractedDate {
  title: string;
  date: string;
  time: string;
  project: string;
}

// 9. CallRecord 데이터 구조
export interface CallLog {
  id: string;
  inputType?: 'text' | 'audio';
  callerName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  rawText: string; // originalText
  audioFileName?: string;
  hasAudio?: boolean;
  keySummary: string; // summary
  counterpartRequests: string[]; // requests
  followUpTasks: ExtractedFollowUp[];
  importantDates: ExtractedDate[];
  createdAt: string;
}

// 9. DailySummary 데이터 구조
export interface DailySummary {
  date: string;
  totalTasks: number;
  completedTasks: number;
  incompleteTasks: number;
  projectSummary: string[];
  mainWork: string;
  unfinishedWork: string;
  nextDayPriority: string;
  generatedAt?: string;
}

export interface AIOrganizeResult {
  organizedTaskIds: string[];
  summary: string;
  estimatedTotalTime: string;
  tips: string[];
}

export interface MonthlyRetrospectiveResult {
  hasSufficientData: boolean;
  improvements: string[];
  positiveHighlights: string[];
}

// 1. 알림 설정 구조
export interface NotificationSettings {
  deadlineAlert: boolean;
  meetingAlert: boolean;
  dailyWrapUpAlert: boolean;
  sheetsUploadAlert: boolean;
}

// 3, 5. Google Sheets 설정 구조
export interface GoogleSheetsSettings {
  isConnected: boolean;
  accountEmail: string;
  spreadsheetId: string;
  spreadsheetUrl?: string;
  sheetName: string;
  uploadTime: string; // e.g. "18:00"
  autoUploadEnabled: boolean;
  lastUploadedAt?: string;
  lastSummary?: DailySummary;
  uploadHistory: Array<{
    date: string;
    uploadedAt: string;
    taskCount: number;
    completedCount: number;
    summaryMainWork: string;
  }>;
}

// 2. 수기 메모 사진 정리 데이터 구조
export interface ExtractedMemoTask {
  id: string;
  title: string;
  project: string;
  deadline: string;
  estimatedMinutes: number;
  memo: string;
  scheduleTime?: string;
  isSelected?: boolean;
}

export interface PhotoMemoResult {
  isLegible: boolean;
  illegibleMessage?: string;
  rawText: string;
  structuredTasks: ExtractedMemoTask[];
}
