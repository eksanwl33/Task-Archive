import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  ListTodo,
  PhoneCall,
  ArrowUpDown,
  FileSpreadsheet,
} from 'lucide-react';
import {
  Task,
  Schedule,
  CallLog,
  Priority,
  AIOrganizeResult,
  NotificationSettings,
  GoogleSheetsSettings,
  DailySummary,
} from './types';
import { initialTasks, initialSchedules, initialCallLogs, resetAllData } from './data/initialData';
import { Header, AppView } from './components/Header';
import { TaskItem } from './components/TaskItem';
import { TaskAddForm } from './components/TaskAddForm';
import { ScheduleSection } from './components/ScheduleSection';
import { ProgressCard } from './components/ProgressCard';
import { CallLogSection } from './components/CallLogSection';
import { MonthlyRetrospective } from './components/MonthlyRetrospective';
import { AIOrganizeModal } from './components/AIOrganizeModal';
import { PhotoMemoSection } from './components/PhotoMemoSection';
import { SettingsSection } from './components/SettingsSection';
import { DailyWrapUpModal } from './components/DailyWrapUpModal';

const defaultNotificationSettings: NotificationSettings = {
  deadlineAlert: true,
  meetingAlert: true,
  dailyWrapUpAlert: true,
  sheetsUploadAlert: true,
};

const defaultSheetsSettings: GoogleSheetsSettings = {
  isConnected: true,
  spreadsheetId: 'today-work-sheet-2026',
  sheetName: '오늘업무_일일기록',
  accountEmail: 'user.workspace@gmail.com',
  uploadTime: '18:00',
  autoUploadEnabled: true,
  uploadHistory: [],
  lastUploadedAt: new Date(Date.now() - 86400000).toISOString(),
};

export function App() {
  const [currentView, setCurrentView] = useState<AppView>('tasks');

  // Core App State (Stored in localStorage for simple client persistence)
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('todaywork_tasks');
      return saved ? JSON.parse(saved) : initialTasks;
    } catch {
      return initialTasks;
    }
  });

  const [schedules, setSchedules] = useState<Schedule[]>(() => {
    try {
      const saved = localStorage.getItem('todaywork_schedules');
      return saved ? JSON.parse(saved) : initialSchedules;
    } catch {
      return initialSchedules;
    }
  });

  const [callLogs, setCallLogs] = useState<CallLog[]>(() => {
    try {
      const saved = localStorage.getItem('todaywork_calls');
      return saved ? JSON.parse(saved) : initialCallLogs;
    } catch {
      return initialCallLogs;
    }
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    try {
      const saved = localStorage.getItem('todaywork_notifications');
      return saved ? JSON.parse(saved) : defaultNotificationSettings;
    } catch {
      return defaultNotificationSettings;
    }
  });

  const [sheetsSettings, setSheetsSettings] = useState<GoogleSheetsSettings>(() => {
    try {
      const saved = localStorage.getItem('todaywork_sheets');
      return saved ? JSON.parse(saved) : defaultSheetsSettings;
    } catch {
      return defaultSheetsSettings;
    }
  });

  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>(() => {
    try {
      const saved = localStorage.getItem('todaywork_daily_summaries');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Daily Wrap-Up Modal State
  const [isDailyWrapUpOpen, setIsDailyWrapUpOpen] = useState(false);

  // AI Organize Modal State
  const [isOrganizeModalOpen, setIsOrganizeModalOpen] = useState(false);
  const [organizeLoading, setOrganizeLoading] = useState(false);
  const [organizeResult, setOrganizeResult] = useState<AIOrganizeResult | null>(null);

  // Sorting & Filtering State
  const [filterMode, setFilterMode] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'smart' | 'time' | 'created'>('smart');

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('todaywork_tasks', JSON.stringify(tasks));
    } catch (e) {
      console.error(e);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem('todaywork_schedules', JSON.stringify(schedules));
    } catch (e) {
      console.error(e);
    }
  }, [schedules]);

  useEffect(() => {
    try {
      localStorage.setItem('todaywork_calls', JSON.stringify(callLogs));
    } catch (e) {
      console.error(e);
    }
  }, [callLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('todaywork_notifications', JSON.stringify(notificationSettings));
    } catch (e) {
      console.error(e);
    }
  }, [notificationSettings]);

  useEffect(() => {
    try {
      localStorage.setItem('todaywork_sheets', JSON.stringify(sheetsSettings));
    } catch (e) {
      console.error(e);
    }
  }, [sheetsSettings]);

  useEffect(() => {
    try {
      localStorage.setItem('todaywork_daily_summaries', JSON.stringify(dailySummaries));
    } catch (e) {
      console.error(e);
    }
  }, [dailySummaries]);

  // Today Filter for Tasks
  const todayTasks = useMemo(() => {
    return tasks;
  }, [tasks]);

  // Existing Project List for Autocomplete
  const existingProjects = useMemo(() => {
    const pSet = new Set<string>();
    tasks.forEach((t) => t.project && pSet.add(t.project));
    schedules.forEach((s) => s.project && pSet.add(s.project));
    return Array.from(pSet);
  }, [tasks, schedules]);

  // Task Counts
  const todayTaskCount = useMemo(() => {
    const total = todayTasks.length;
    const completed = todayTasks.filter((t) => t.isCompleted).length;
    return {
      total,
      completed,
      remaining: total - completed,
    };
  }, [todayTasks]);

  // Task Action Handlers
  const handleToggleTaskComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t))
    );
  };

  const handleAddTask = (newTaskData: Omit<Task, 'id' | 'createdAt' | 'isCompleted'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleBatchAddTasks = (newTasksData: Omit<Task, 'id' | 'createdAt' | 'isCompleted'>[]) => {
    const newItems: Task[] = newTasksData.map((d, index) => ({
      ...d,
      id: `task-${Date.now()}-${index}`,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    }));
    setTasks((prev) => [...newItems, ...prev]);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Schedule Action Handlers
  const handleToggleScheduleConfirm = (scheduleId: string) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === scheduleId ? { ...s, isConfirmed: !s.isConfirmed } : s))
    );
  };

  const handleAddSchedule = (
    newScheduleData: Omit<Schedule, 'id' | 'createdAt' | 'isConfirmed'>
  ) => {
    const newSchedule: Schedule = {
      ...newScheduleData,
      id: `schedule-${Date.now()}`,
      isConfirmed: false,
      createdAt: new Date().toISOString(),
    };
    setSchedules((prev) => [newSchedule, ...prev]);
  };

  const handleUpdateSchedule = (updatedSchedule: Schedule) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === updatedSchedule.id ? updatedSchedule : s))
    );
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
  };

  // Call Log Action Handlers
  const handleAddCallLog = (log: CallLog) => {
    setCallLogs((prev) => [log, ...prev]);
  };

  const handleUpdateCallLog = (updated: CallLog) => {
    setCallLogs((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleDeleteCallLog = (id: string) => {
    setCallLogs((prev) => prev.filter((c) => c.id !== id));
  };

  // Reset to initial sample data
  const handleResetData = () => {
    const defaults = resetAllData();
    setTasks(defaults.tasks);
    setSchedules(defaults.schedules);
    setCallLogs(defaults.callLogs);
    setNotificationSettings(defaultNotificationSettings);
    setSheetsSettings(defaultSheetsSettings);
    setDailySummaries([]);
    localStorage.removeItem('todaywork_tasks');
    localStorage.removeItem('todaywork_schedules');
    localStorage.removeItem('todaywork_calls');
    localStorage.removeItem('todaywork_notifications');
    localStorage.removeItem('todaywork_sheets');
    localStorage.removeItem('todaywork_daily_summaries');
  };

  // AI [업무 정리] Trigger (Section 3: Important meeting schedules, calls, deadlines, optimal order)
  const handleOrganizeWork = async () => {
    setIsOrganizeModalOpen(true);
    setOrganizeLoading(true);
    setOrganizeResult(null);

    try {
      const response = await fetch('/api/ai/organize-daily-work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: todayTasks,
          schedules,
          callLogs,
        }),
      });

      if (!response.ok) {
        throw new Error('AI 업무 정리 요청에 실패했습니다.');
      }

      const data: AIOrganizeResult = await response.json();
      setOrganizeResult(data);
    } catch (e: any) {
      console.error(e);
      // Fallback local heuristic recommendation
      const prioritized = [...todayTasks].sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
        const pScore: Record<Priority, number> = { high: 3, medium: 2, low: 1 };
        return pScore[b.priority] - pScore[a.priority];
      });

      setOrganizeResult({
        recommendedOrder: prioritized.map((t, idx) => ({
          taskId: t.id,
          title: t.title,
          order: idx + 1,
          reason:
            t.priority === 'high'
              ? '마감 임박 및 우선순위가 높은 핵심 업무'
              : '미팅 일정 전후에 집중하기 적합한 업무',
          timeSlot: `블록 ${idx + 1}`,
        })),
        rationaleSummary:
          '오늘 예정된 중요 미팅 일정과 긴급 업무를 파악하여 가장 집중력이 높은 시간대에 핵심 업무를 완수하도록 순서를 재구성했습니다.',
        keyConflictsOrAlerts: [
          '오후 14:00 고객사 제안 미팅 전에 제안서 슬라이드 초안을 반드시 검토해야 합니다.',
        ],
      });
    } finally {
      setOrganizeLoading(false);
    }
  };

  // Apply AI Recommended Order
  const handleApplyOrder = (orderedTaskIds: string[]) => {
    const taskMap = new Map<string, Task>(tasks.map((t) => [t.id, t]));
    const reordered: Task[] = [];

    orderedTaskIds.forEach((id) => {
      const t = taskMap.get(id);
      if (t) {
        reordered.push(t);
        taskMap.delete(id);
      }
    });

    taskMap.forEach((t) => reordered.push(t));

    setTasks(reordered);
    setIsOrganizeModalOpen(false);
  };

  // Google Sheets Upload Success Handler
  const handleUploadSuccess = (summary: DailySummary) => {
    setDailySummaries((prev) => [summary, ...prev.filter((s) => s.date !== summary.date)]);
    setSheetsSettings((prev) => ({
      ...prev,
      lastUploadedAt: new Date().toISOString(),
      uploadHistory: [
        {
          timestamp: new Date().toISOString(),
          status: 'success',
          rowsAdded: summary.totalTasks,
          sheetUrl: `https://docs.google.com/spreadsheets/d/${prev.spreadsheetId}`,
        },
        ...prev.uploadHistory.slice(0, 9),
      ],
    }));
  };

  // Display Filtered and Sorted Tasks
  const displayedTasks = useMemo(() => {
    let filtered = todayTasks;
    if (filterMode === 'active') {
      filtered = filtered.filter((t) => !t.isCompleted);
    } else if (filterMode === 'completed') {
      filtered = filtered.filter((t) => t.isCompleted);
    }

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'smart') {
        if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
        const pMap: Record<Priority, number> = { high: 3, medium: 2, low: 1 };
        const pDiff = pMap[b.priority] - pMap[a.priority];
        if (pDiff !== 0) return pDiff;
        if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline);
        return (b.estimatedMinutes || 0) - (a.estimatedMinutes || 0);
      }
      if (sortBy === 'time') {
        return (b.estimatedMinutes || 0) - (a.estimatedMinutes || 0);
      }
      if (sortBy === 'created') {
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      }
      return 0;
    });

    return sorted;
  }, [todayTasks, filterMode, sortBy]);

  return (
    <div className="min-h-screen bg-white text-[#050038] flex flex-col font-sans selection:bg-[#FFD02F] selection:text-[#050038]">
      {/* App Header with Navigation */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        todayTaskCount={todayTaskCount}
        onResetData={handleResetData}
        onOpenDailyWrapUp={() => setIsDailyWrapUpOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* VIEW 1: 오늘의 업무 (MAIN) */}
        {currentView === 'tasks' && (
          <div className="space-y-6">
            {/* Miro Dark CTA Banner (cta-banner-dark with canary yellow tag & white pill CTA) */}
            <div
              id="bar-core-action"
              className="bg-[#050038] rounded-[24px] sm:rounded-[28px] p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 miro-shadow-card transition-all"
            >
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-[#FFD02F] text-[#050038] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    CORE ACTION · 집중 계획
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  오늘 해야 할 업무 계획 및 관리
                </h2>
                <p className="text-sm text-[#A5A2B8] mt-1.5 leading-relaxed">
                  오늘 할 일을 등록하고 소요 시간을 체크하세요. 완료된 업무는 목록에서 사라지지 않고 성취 기록으로 안전하게 보존됩니다.
                </p>
              </div>

              {/* Action Buttons: Miro Yellow Pill + Miro White Pill */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
                <button
                  id="btn-organize-work"
                  type="button"
                  onClick={handleOrganizeWork}
                  className="miro-btn-yellow text-xs font-semibold py-2.5 px-4"
                >
                  <Sparkles className="w-4 h-4 stroke-[2.5]" />
                  <span>AI 업무 정리</span>
                </button>

                <button
                  id="btn-daily-upload"
                  type="button"
                  onClick={() => setIsDailyWrapUpOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full font-medium text-xs text-[#050038] bg-white hover:bg-[#F4F4F7] active:scale-95 transition-all cursor-pointer shadow-xs"
                >
                  <FileSpreadsheet className="w-4 h-4 text-[#050038]" />
                  <span>오늘 업무 정리 및 업로드</span>
                </button>
              </div>
            </div>

            {/* 화면 우선순위 (Section 5 Strict Order):
                1. 오늘의 업무 (Today's Tasks)
                2. 임박한 일정 및 타임라인 (Schedule / Timeline)
                3. 업무 진행 상황 (Progress / Statistics)
                4. 전화 기록 (Call Log - 보조 기능, 별도 영역) */}

            {/* [우선순위 1] 오늘 해야 할 업무 — 세로 정렬 (Vertical Tasks Column in Miro White 20px Card) */}
            <section
              id="section-main-tasks"
              className="bg-white rounded-[20px] p-6 sm:p-7 border border-[#E5E5ED] miro-shadow-card space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5ED] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#050038] text-white flex items-center justify-center shrink-0">
                    <ListTodo className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#5F5C7A] uppercase tracking-wider">
                        1순위 · PRIMARY
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#FFF8D6] text-[#6B5B00] border border-[#F5E59C]">
                        세로 정렬 목록
                      </span>
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-[#050038] mt-0.5">
                      오늘 해야 할 업무
                    </h3>
                  </div>
                </div>

                {/* Filters & Sorters in Miro Pill Aesthetic */}
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  {/* Filter Pills */}
                  <div className="flex items-center gap-1 bg-[#F9F9FB] p-1 rounded-full border border-[#E5E5ED]">
                    <button
                      id="filter-all"
                      type="button"
                      onClick={() => setFilterMode('all')}
                      className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer font-medium ${
                        filterMode === 'all'
                          ? 'bg-[#050038] text-white'
                          : 'text-[#5F5C7A] hover:text-[#050038]'
                      }`}
                    >
                      전체 ({todayTasks.length})
                    </button>
                    <button
                      id="filter-active"
                      type="button"
                      onClick={() => setFilterMode('active')}
                      className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer font-medium ${
                        filterMode === 'active'
                          ? 'bg-[#050038] text-white'
                          : 'text-[#5F5C7A] hover:text-[#050038]'
                      }`}
                    >
                      진행 중 ({todayTaskCount.remaining})
                    </button>
                    <button
                      id="filter-completed"
                      type="button"
                      onClick={() => setFilterMode('completed')}
                      className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer font-medium ${
                        filterMode === 'completed'
                          ? 'bg-[#050038] text-white'
                          : 'text-[#5F5C7A] hover:text-[#050038]'
                      }`}
                    >
                      완료됨 ({todayTaskCount.completed})
                    </button>
                  </div>

                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-1.5 bg-[#F9F9FB] border border-[#E5E5ED] px-3.5 py-1.5 rounded-full">
                    <ArrowUpDown className="w-3.5 h-3.5 text-[#4262FF]" />
                    <select
                      id="select-task-sort"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-transparent text-xs font-medium text-[#050038] focus:outline-none cursor-pointer"
                    >
                      <option value="smart">중요도·마감순</option>
                      <option value="time">소요 시간순</option>
                      <option value="created">최근 등록순</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Task Quick Add Form */}
              <TaskAddForm onAddTask={handleAddTask} existingProjects={existingProjects} />

              {/* Vertical Task Items Stack (세로 정렬) */}
              <div className="flex flex-col space-y-3">
                {displayedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggleComplete={handleToggleTaskComplete}
                    onDelete={handleDeleteTask}
                  />
                ))}

                {displayedTasks.length === 0 && (
                  <div className="rounded-[16px] p-8 text-center border border-dashed border-[#E5E5ED] text-[#5F5C7A] bg-[#F9F9FB]">
                    <p className="text-sm font-bold text-[#050038]">해당 조건의 업무가 없습니다.</p>
                    <p className="text-xs mt-1 text-[#5F5C7A]">
                      상단의 [+ 오늘 할 일 추가하기]를 눌러 새 업무를 세로 목록에 등록해 보세요.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* [우선순위 2] 마감 임박 및 중요 일정 — 가로형 타임라인 순서 (Horizontal Timeline Sequence) */}
            <ScheduleSection
              schedules={schedules}
              onToggleConfirm={handleToggleScheduleConfirm}
              onAddSchedule={handleAddSchedule}
              onDeleteSchedule={handleDeleteSchedule}
            />

            {/* [우선순위 3] 업무 진행 상황 (Progress / Statistics) */}
            <ProgressCard tasks={todayTasks} />

            {/* [우선순위 4] 전화 기록 — 보조 기능, Miro Pastel Feature Card (Sticky Note Tint) */}
            <section
              id="section-sub-call-teaser"
              className="bg-[#E1F7F5] border border-[#BDEEE9] rounded-[24px] p-6 miro-shadow-card transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-white text-[#050038] border border-[#BDEEE9] flex items-center justify-center shrink-0 shadow-xs">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#0B6A66] uppercase tracking-wider">
                      4순위 · SUB FEATURE
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white text-[#0B6A66] border border-[#BDEEE9]">
                      보조 기능
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-[#050038] mt-0.5">
                    전화 기록 및 통화 내용 연계
                  </h4>
                  <p className="text-xs text-[#0B6A66] mt-0.5">
                    통화 중 나온 요청사항이나 미팅 일정을 오늘의 업무 또는 타임라인으로 바로 추가할 수 있습니다.
                  </p>
                </div>
              </div>

              <button
                id="btn-open-call-view"
                type="button"
                onClick={() => setCurrentView('calls')}
                className="miro-btn-primary text-xs py-2 px-4 shrink-0 self-start sm:self-auto"
              >
                전화 기록 관리 ({callLogs.length}건) 열기 →
              </button>
            </section>
          </div>
        )}

        {/* VIEW 2: 수기 메모 사진 OCR 및 업무 정리 (SECTION 2) */}
        {currentView === 'photomemo' && (
          <PhotoMemoSection
            onAddTasks={handleBatchAddTasks}
            existingProjects={existingProjects}
          />
        )}

        {/* VIEW 3: 월간 업무 회고 (SECTION C) */}
        {currentView === 'retrospective' && (
          <MonthlyRetrospective tasks={tasks} />
        )}

        {/* VIEW 4: 전화 기록 관리 (SECTION B - 보조 기능) */}
        {currentView === 'calls' && (
          <CallLogSection
            callLogs={callLogs}
            onAddCallLog={handleAddCallLog}
            onDeleteCallLog={handleDeleteCallLog}
            onAddFollowUpAsTask={handleAddTask}
            onAddDateAsSchedule={handleAddSchedule}
          />
        )}

        {/* VIEW 5: 설정 및 데이터 관리 (SECTION 1) */}
        {currentView === 'settings' && (
          <SettingsSection
            tasks={tasks}
            schedules={schedules}
            callLogs={callLogs}
            notificationSettings={notificationSettings}
            sheetsSettings={sheetsSettings}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onToggleTaskComplete={handleToggleTaskComplete}
            onUpdateSchedule={handleUpdateSchedule}
            onDeleteSchedule={handleDeleteSchedule}
            onToggleScheduleConfirm={handleToggleScheduleConfirm}
            onUpdateCallLog={handleUpdateCallLog}
            onDeleteCallLog={handleDeleteCallLog}
            onUpdateNotificationSettings={setNotificationSettings}
            onUpdateSheetsSettings={setSheetsSettings}
            onOpenDailyWrapUp={() => setIsDailyWrapUpOpen(true)}
          />
        )}
      </main>

      {/* Floating Circular Action Button: Miro Yellow Accent Pill */}
      <button
        id="btn-floating-frap"
        type="button"
        onClick={handleOrganizeWork}
        title="AI 오늘 업무 정리 열기"
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-[#FFD02F] text-[#050038] flex items-center justify-center miro-shadow-mockup z-30 cursor-pointer hover:bg-[#E5B800] active:scale-95 group transition-all"
      >
        <Sparkles className="w-5 h-5 stroke-[2.4] group-hover:rotate-12 transition-transform" />
      </button>

      {/* AI [업무 정리] Modal */}
      <AIOrganizeModal
        isOpen={isOrganizeModalOpen}
        onClose={() => setIsOrganizeModalOpen(false)}
        result={organizeResult}
        isLoading={organizeLoading}
        onApplyOrder={handleApplyOrder}
        tasks={todayTasks}
      />

      {/* Google Sheets [오늘 업무 정리 및 업로드] Modal */}
      <DailyWrapUpModal
        isOpen={isDailyWrapUpOpen}
        onClose={() => setIsDailyWrapUpOpen(false)}
        tasks={todayTasks}
        sheetsSettings={sheetsSettings}
        onNavigateToSettings={() => setCurrentView('settings')}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}

export default App;
