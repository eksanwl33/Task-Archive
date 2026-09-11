import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  ListTodo,
  Calendar,
  PhoneCall,
  Bell,
  FileSpreadsheet,
  Trash2,
  Edit2,
  Check,
  X,
  AlertTriangle,
  Upload,
  CheckCircle2,
  Clock,
  ExternalLink,
  Save,
  HelpCircle,
} from 'lucide-react';
import {
  Task,
  Schedule,
  CallLog,
  NotificationSettings,
  GoogleSheetsSettings,
  DailySummary,
  Priority,
} from '../types';

interface SettingsSectionProps {
  tasks: Task[];
  schedules: Schedule[];
  callLogs: CallLog[];
  notificationSettings: NotificationSettings;
  sheetsSettings: GoogleSheetsSettings;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleTaskComplete: (taskId: string) => void;
  onUpdateSchedule: (schedule: Schedule) => void;
  onDeleteSchedule: (scheduleId: string) => void;
  onToggleScheduleConfirm: (scheduleId: string) => void;
  onUpdateCallLog: (log: CallLog) => void;
  onDeleteCallLog: (logId: string) => void;
  onUpdateNotificationSettings: (settings: NotificationSettings) => void;
  onUpdateSheetsSettings: (settings: GoogleSheetsSettings) => void;
  onOpenDailyWrapUp: () => void;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  tasks,
  schedules,
  callLogs,
  notificationSettings,
  sheetsSettings,
  onUpdateTask,
  onDeleteTask,
  onToggleTaskComplete,
  onUpdateSchedule,
  onDeleteSchedule,
  onToggleScheduleConfirm,
  onUpdateCallLog,
  onDeleteCallLog,
  onUpdateNotificationSettings,
  onUpdateSheetsSettings,
  onOpenDailyWrapUp,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'tasks' | 'schedules' | 'calls' | 'notifications' | 'sheets'
  >('tasks');

  // Deletion Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'task' | 'schedule' | 'call';
    id: string;
    title: string;
    extraNotice?: string;
  }>({
    isOpen: false,
    type: 'task',
    id: '',
    title: '',
  });

  // Editing States
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskEditForm, setTaskEditForm] = useState<Partial<Task>>({});

  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [scheduleEditForm, setScheduleEditForm] = useState<Partial<Schedule>>({});

  const [editingCallId, setEditingCallId] = useState<string | null>(null);
  const [callEditForm, setCallEditForm] = useState<Partial<CallLog>>({});

  // Sheets Settings Local State
  const [sheetsForm, setSheetsForm] = useState<GoogleSheetsSettings>(sheetsSettings);

  // Task Edit Handlers
  const startEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setTaskEditForm({ ...task });
  };

  const saveEditTask = () => {
    if (!editingTaskId || !taskEditForm.title) return;
    const original = tasks.find((t) => t.id === editingTaskId);
    if (!original) return;

    onUpdateTask({
      ...original,
      title: taskEditForm.title || original.title,
      project: taskEditForm.project || original.project,
      estimatedMinutes: Number(taskEditForm.estimatedMinutes) || original.estimatedMinutes,
      memo: taskEditForm.memo ?? original.memo,
      deadline: taskEditForm.deadline ?? original.deadline,
      priority: taskEditForm.priority || original.priority,
    });
    setEditingTaskId(null);
  };

  // Schedule Edit Handlers
  const startEditSchedule = (sched: Schedule) => {
    setEditingScheduleId(sched.id);
    setScheduleEditForm({ ...sched });
  };

  const saveEditSchedule = () => {
    if (!editingScheduleId || !scheduleEditForm.title) return;
    const original = schedules.find((s) => s.id === editingScheduleId);
    if (!original) return;

    onUpdateSchedule({
      ...original,
      title: scheduleEditForm.title || original.title,
      date: scheduleEditForm.date || original.date,
      time: scheduleEditForm.time || original.time,
      project: scheduleEditForm.project || original.project,
      memo: scheduleEditForm.memo ?? original.memo,
    });
    setEditingScheduleId(null);
  };

  // CallLog Edit Handlers
  const startEditCall = (call: CallLog) => {
    setEditingCallId(call.id);
    setCallEditForm({ ...call });
  };

  const saveEditCall = () => {
    if (!editingCallId || !callEditForm.keySummary) return;
    const original = callLogs.find((c) => c.id === editingCallId);
    if (!original) return;

    onUpdateCallLog({
      ...original,
      callerName: callEditForm.callerName || original.callerName,
      keySummary: callEditForm.keySummary || original.keySummary,
    });
    setEditingCallId(null);
  };

  // Delete Action Dispatcher
  const handleConfirmDelete = () => {
    if (deleteModal.type === 'task') {
      onDeleteTask(deleteModal.id);
    } else if (deleteModal.type === 'schedule') {
      onDeleteSchedule(deleteModal.id);
    } else if (deleteModal.type === 'call') {
      onDeleteCallLog(deleteModal.id);
    }
    setDeleteModal({ isOpen: false, type: 'task', id: '', title: '' });
  };

  // Notification Toggle Handlers
  const handleToggleNotification = (key: keyof NotificationSettings) => {
    const updated = {
      ...notificationSettings,
      [key]: !notificationSettings[key],
    };
    onUpdateNotificationSettings(updated);
  };

  // Sheets Config Save
  const handleSaveSheetsConfig = () => {
    onUpdateSheetsSettings(sheetsForm);
  };

  const handleToggleSheetsConnect = () => {
    const updated = {
      ...sheetsForm,
      isConnected: !sheetsForm.isConnected,
      accountEmail: !sheetsForm.isConnected ? 'user.workspace@gmail.com' : undefined,
    };
    setSheetsForm(updated);
    onUpdateSheetsSettings(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Miro Dark Header Band (#050038) */}
      <div
        id="banner-settings"
        className="bg-[#050038] rounded-[24px] sm:rounded-[28px] p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 miro-shadow-card"
      >
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold text-[#FFD02F] uppercase tracking-wider">
              SETTINGS &amp; INTEGRATIONS · 앱 설정
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            설정 및 데이터 관리
          </h2>
          <p className="text-sm text-[#A5A2B8] mt-1.5 leading-relaxed">
            등록된 업무, 중요 일정, 전화 기록을 직접 수정 및 삭제할 수 있으며, 알림 옵션과 Google Sheets 일일 업로드 환경을 설정할 수 있습니다.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenDailyWrapUp}
          className="miro-btn-yellow text-xs py-2.5 px-4 shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4 text-[#050038]" />
          <span>오늘 업무 정리 및 업로드 →</span>
        </button>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#E5E5ED]">
        <button
          type="button"
          onClick={() => setActiveSubTab('tasks')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'tasks'
              ? 'bg-[#050038] text-white shadow-xs'
              : 'bg-white text-[#5F5C7A] hover:text-[#050038] border border-[#E5E5ED]'
          }`}
        >
          <ListTodo className="w-3.5 h-3.5" />
          <span>업무 관리 ({tasks.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('schedules')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'schedules'
              ? 'bg-[#050038] text-white shadow-xs'
              : 'bg-white text-[#5F5C7A] hover:text-[#050038] border border-[#E5E5ED]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>일정 관리 ({schedules.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('calls')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'calls'
              ? 'bg-[#050038] text-white shadow-xs'
              : 'bg-white text-[#5F5C7A] hover:text-[#050038] border border-[#E5E5ED]'
          }`}
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>전화 기록 관리 ({callLogs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'notifications'
              ? 'bg-[#050038] text-white shadow-xs'
              : 'bg-white text-[#5F5C7A] hover:text-[#050038] border border-[#E5E5ED]'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>알림 설정</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('sheets')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'sheets'
              ? 'bg-[#050038] text-white shadow-xs'
              : 'bg-white text-[#5F5C7A] hover:text-[#050038] border border-[#E5E5ED]'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Google Sheets 연결</span>
          {sheetsForm.isConnected ? (
            <span className="w-2 h-2 rounded-full bg-[#00875A]"></span>
          ) : (
            <span className="w-2 h-2 rounded-full bg-[#FFD02F]"></span>
          )}
        </button>
      </div>

      {/* 1. 업무 관리 탭 */}
      {activeSubTab === 'tasks' && (
        <section className="bg-white rounded-[20px] p-6 sm:p-7 border border-[#E5E5ED] miro-shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E5ED] pb-3">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-[#050038]">등록된 업무 관리</h3>
              <p className="text-xs text-[#5F5C7A]">
                업무 내용, 소요 시간, 마감일, 메모, 프로젝트를 수정하거나 완료 상태를 변경하고 삭제할 수 있습니다.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F0EDFF] text-[#4262FF] border border-[#D5CCFF] tnum">
              총 {tasks.length}개 업무
            </span>
          </div>

          <div className="divide-y divide-[#E5E5ED]">
            {tasks.map((task) => {
              const isEditing = editingTaskId === task.id;

              if (isEditing) {
                return (
                  <div key={task.id} className="py-4 bg-[#F9F9FB] p-4 rounded-[14px] space-y-3 border border-[#E5E5ED]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#050038]">업무 정보 편집</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={saveEditTask}
                          className="miro-btn-primary text-xs py-1 px-3"
                        >
                          <Save className="w-3.5 h-3.5" />
                          저장
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingTaskId(null)}
                          className="miro-btn-secondary text-xs py-1 px-3"
                        >
                          취소
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="font-bold text-[#050038] block mb-1">업무 내용</label>
                        <input
                          type="text"
                          value={taskEditForm.title || ''}
                          onChange={(e) => setTaskEditForm((prev) => ({ ...prev, title: e.target.value }))}
                          className="w-full text-xs font-medium text-[#050038] bg-white border border-[#C9C7D6] rounded-[8px] px-2.5 py-1.5 focus:outline-none focus:border-[#4262FF]"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-[#050038] block mb-1">프로젝트</label>
                        <input
                          type="text"
                          value={taskEditForm.project || ''}
                          onChange={(e) => setTaskEditForm((prev) => ({ ...prev, project: e.target.value }))}
                          className="w-full text-xs text-[#050038] bg-white border border-[#C9C7D6] rounded-[8px] px-2.5 py-1.5 focus:outline-none focus:border-[#4262FF]"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-[#050038] block mb-1">예상 소요 시간 (분)</label>
                        <input
                          type="number"
                          step="5"
                          min="5"
                          value={taskEditForm.estimatedMinutes || 30}
                          onChange={(e) =>
                            setTaskEditForm((prev) => ({ ...prev, estimatedMinutes: Number(e.target.value) }))
                          }
                          className="w-full text-xs text-[#050038] bg-white border border-[#C9C7D6] rounded-[8px] px-2.5 py-1.5 focus:outline-none focus:border-[#4262FF]"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-[#050038] block mb-1">마감일 / 시간</label>
                        <input
                          type="text"
                          value={taskEditForm.deadline || ''}
                          onChange={(e) => setTaskEditForm((prev) => ({ ...prev, deadline: e.target.value }))}
                          className="w-full text-xs text-[#050038] bg-white border border-[#C9C7D6] rounded-[8px] px-2.5 py-1.5 focus:outline-none focus:border-[#4262FF]"
                          placeholder="예: 2026-09-12 18:00"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="font-bold text-[#050038] block mb-1">메모</label>
                        <input
                          type="text"
                          value={taskEditForm.memo || ''}
                          onChange={(e) => setTaskEditForm((prev) => ({ ...prev, memo: e.target.value }))}
                          className="w-full text-xs text-[#050038] bg-white border border-[#C9C7D6] rounded-[8px] px-2.5 py-1.5 focus:outline-none focus:border-[#4262FF]"
                        />
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={task.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => onToggleTaskComplete(task.id)}
                      title={task.isCompleted ? '완료 취소' : '완료 처리'}
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                        task.isCompleted
                          ? 'bg-[#050038] border-[#050038] text-[#FFD02F]'
                          : 'border-[#C9C7D6] hover:border-[#050038]'
                      }`}
                    >
                      {task.isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#4262FF] px-2 py-0.5 rounded-full bg-[#F0EDFF] border border-[#D5CCFF] text-[10px]">
                          {task.project || '미지정'}
                        </span>
                        <span
                          className={`font-medium truncate ${
                            task.isCompleted
                              ? 'line-through text-[#89869E]'
                              : 'text-[#050038]'
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[#5F5C7A] text-[11px] mt-0.5 tnum">
                        <span>예상 {task.estimatedMinutes}분</span>
                        {task.deadline && <span>마감: {task.deadline}</span>}
                        {task.memo && <span className="truncate max-w-xs text-[#5F5C7A]">{task.memo}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEditTask(task)}
                      className="p-1.5 text-[#5F5C7A] hover:text-[#050038] rounded-full hover:bg-[#F4F4F7] transition-colors cursor-pointer"
                      title="업무 수정"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteModal({
                          isOpen: true,
                          type: 'task',
                          id: task.id,
                          title: task.title,
                        })
                      }
                      className="p-1.5 text-[#5F5C7A] hover:text-[#BF2600] rounded-full hover:bg-[#FFEBE6] transition-colors cursor-pointer"
                      title="업무 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {tasks.length === 0 && (
              <div className="py-8 text-center text-xs text-[#5F5C7A]">
                등록된 업무가 없습니다.
              </div>
            )}
          </div>
        </section>
      )}

      {/* 2. 일정 관리 탭 */}
      {activeSubTab === 'schedules' && (
        <section className="bg-white rounded-[20px] p-6 sm:p-7 border border-[#E5E5ED] miro-shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E5ED] pb-3">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-[#050038]">중요 일정 및 미팅 관리</h3>
              <p className="text-xs text-[#5F5C7A]">
                등록된 타임라인 일정(미팅, 마감 보고 등)을 직접 수정하거나 확인 상태 변경 및 삭제할 수 있습니다.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F0EDFF] text-[#4262FF] border border-[#D5CCFF] tnum">
              총 {schedules.length}개 일정
            </span>
          </div>

          <div className="divide-y divide-[#E5E5ED]">
            {schedules.map((sched) => {
              const isEditing = editingScheduleId === sched.id;

              if (isEditing) {
                return (
                  <div key={sched.id} className="py-4 bg-[#F9F9FB] p-4 rounded-[14px] space-y-3 border border-[#E5E5ED]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#050038]">일정 정보 편집</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={saveEditSchedule}
                          className="miro-btn-primary text-xs py-1 px-3"
                        >
                          <Save className="w-3.5 h-3.5" />
                          저장
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingScheduleId(null)}
                          className="miro-btn-secondary text-xs py-1 px-3"
                        >
                          취소
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="sm:col-span-2">
                        <label className="font-bold text-[#050038] block mb-1">일정 제목</label>
                        <input
                          type="text"
                          value={scheduleEditForm.title || ''}
                          onChange={(e) => setScheduleEditForm((prev) => ({ ...prev, title: e.target.value }))}
                          className="w-full text-xs font-medium text-[#050038] bg-white border border-[#C9C7D6] rounded-[8px] px-2.5 py-1.5 focus:outline-none focus:border-[#4262FF]"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-[#050038] block mb-1">프로젝트</label>
                        <input
                          type="text"
                          value={scheduleEditForm.project || ''}
                          onChange={(e) => setScheduleEditForm((prev) => ({ ...prev, project: e.target.value }))}
                          className="w-full text-xs text-[#050038] bg-white border border-[#C9C7D6] rounded-[8px] px-2.5 py-1.5 focus:outline-none focus:border-[#4262FF]"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-[#050038] block mb-1">날짜</label>
                        <input
                          type="date"
                          value={scheduleEditForm.date || ''}
                          onChange={(e) => setScheduleEditForm((prev) => ({ ...prev, date: e.target.value }))}
                          className="w-full text-xs text-[#050038] bg-white border border-[#C9C7D6] rounded-[8px] px-2.5 py-1.5 focus:outline-none focus:border-[#4262FF]"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-[#050038] block mb-1">시간</label>
                        <input
                          type="time"
                          value={scheduleEditForm.time || ''}
                          onChange={(e) => setScheduleEditForm((prev) => ({ ...prev, time: e.target.value }))}
                          className="w-full text-xs text-[#050038] bg-white border border-[#C9C7D6] rounded-[8px] px-2.5 py-1.5 focus:outline-none focus:border-[#4262FF]"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-[#050038] block mb-1">메모</label>
                        <input
                          type="text"
                          value={scheduleEditForm.memo || ''}
                          onChange={(e) => setScheduleEditForm((prev) => ({ ...prev, memo: e.target.value }))}
                          className="w-full text-xs text-[#050038] bg-white border border-[#C9C7D6] rounded-[8px] px-2.5 py-1.5 focus:outline-none focus:border-[#4262FF]"
                          placeholder="장소 또는 메모"
                        />
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={sched.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => onToggleScheduleConfirm(sched.id)}
                      title={sched.isConfirmed ? '확인 취소' : '확인 완료'}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer shrink-0 ${
                        sched.isConfirmed
                          ? 'bg-[#050038] text-[#FFD02F]'
                          : 'bg-[#F4F4F7] text-[#5F5C7A] border border-[#E5E5ED] hover:bg-[#E5E5ED]'
                      }`}
                    >
                      {sched.isConfirmed ? '✓ 확인완료' : '미확인'}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#4262FF] px-2 py-0.5 rounded-full bg-[#F0EDFF] border border-[#D5CCFF] text-[10px]">
                          {sched.project || '미지정'}
                        </span>
                        <span className="font-medium text-[#050038] truncate">{sched.title}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[#5F5C7A] text-[11px] mt-0.5 tnum">
                        <span>
                          {sched.date} {sched.time}
                        </span>
                        {sched.memo && <span className="truncate max-w-xs">{sched.memo}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEditSchedule(sched)}
                      className="p-1.5 text-[#5F5C7A] hover:text-[#050038] rounded-full hover:bg-[#F4F4F7] transition-colors cursor-pointer"
                      title="일정 수정"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteModal({
                          isOpen: true,
                          type: 'schedule',
                          id: sched.id,
                          title: sched.title,
                        })
                      }
                      className="p-1.5 text-[#5F5C7A] hover:text-[#BF2600] rounded-full hover:bg-[#FFEBE6] transition-colors cursor-pointer"
                      title="일정 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {schedules.length === 0 && (
              <div className="py-8 text-center text-xs text-[#5F5C7A]">
                등록된 일정이 없습니다.
              </div>
            )}
          </div>
        </section>
      )}

      {/* 3. 전화 기록 관리 탭 */}
      {activeSubTab === 'calls' && (
        <section className="bg-white rounded-[20px] p-6 sm:p-7 border border-[#E5E5ED] miro-shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E5ED] pb-3">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-[#050038]">전화 기록 관리</h3>
              <p className="text-xs text-[#5F5C7A]">
                통화 요약 및 후속 업무를 수정하거나 삭제할 수 있습니다.
                (※ 전화 기록을 삭제해도 이미 업무로 등록된 후속 업무는 별도로 안전하게 유지됩니다.)
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F0EDFF] text-[#4262FF] border border-[#D5CCFF] tnum">
              총 {callLogs.length}건 기록
            </span>
          </div>

          <div className="divide-y divide-[#E5E5ED]">
            {callLogs.map((call) => {
              const isEditing = editingCallId === call.id;

              if (isEditing) {
                return (
                  <div key={call.id} className="py-4 bg-[#F9F9FB] p-4 rounded-[14px] space-y-3 border border-[#E5E5ED]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#050038]">전화 기록 편집</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={saveEditCall}
                          className="miro-btn-primary text-xs py-1 px-3"
                        >
                          <Save className="w-3.5 h-3.5" />
                          저장
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCallId(null)}
                          className="miro-btn-secondary text-xs py-1 px-3"
                        >
                          취소
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <label className="font-bold text-[#050038] block mb-1">통화 상대방</label>
                        <input
                          type="text"
                          value={callEditForm.callerName || ''}
                          onChange={(e) => setCallEditForm((prev) => ({ ...prev, callerName: e.target.value }))}
                          className="w-full text-xs font-medium text-[#050038] bg-white border border-[#C9C7D6] rounded-[8px] px-2.5 py-1.5 focus:outline-none focus:border-[#4262FF]"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-[#050038] block mb-1">핵심 통화 요약</label>
                        <textarea
                          rows={2}
                          value={callEditForm.keySummary || ''}
                          onChange={(e) => setCallEditForm((prev) => ({ ...prev, keySummary: e.target.value }))}
                          className="w-full text-xs text-[#050038] bg-white border border-[#C9C7D6] rounded-[8px] px-2.5 py-1.5 focus:outline-none focus:border-[#4262FF]"
                        />
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={call.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#050038]">{call.callerName}</span>
                      <span className="text-[11px] text-[#5F5C7A] tnum">
                        {call.date} {call.time}
                      </span>
                      {call.hasAudio && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F0EDFF] text-[#4262FF] border border-[#D5CCFF]">
                          음성 녹음
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#050038] mt-1 font-normal leading-relaxed">
                      {call.keySummary}
                    </p>
                    {call.followUpTasks.length > 0 && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#5F5C7A]">
                        <span className="font-bold text-[#4262FF]">추출된 후속 업무:</span>
                        <span>{call.followUpTasks.map((f) => f.title).join(', ')}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0 mt-0.5">
                    <button
                      type="button"
                      onClick={() => startEditCall(call)}
                      className="p-1.5 text-[#5F5C7A] hover:text-[#050038] rounded-full hover:bg-[#F4F4F7] transition-colors cursor-pointer"
                      title="기록 수정"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteModal({
                          isOpen: true,
                          type: 'call',
                          id: call.id,
                          title: `${call.callerName} 통화 기록`,
                          extraNotice:
                            '전화 기록을 삭제해도 이미 오늘 업무로 등록된 후속 업무는 별도로 안전하게 유지됩니다.',
                        })
                      }
                      className="p-1.5 text-[#5F5C7A] hover:text-[#BF2600] rounded-full hover:bg-[#FFEBE6] transition-colors cursor-pointer"
                      title="기록 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {callLogs.length === 0 && (
              <div className="py-8 text-center text-xs text-[#5F5C7A]">
                등록된 전화 기록이 없습니다.
              </div>
            )}
          </div>
        </section>
      )}

      {/* 4. 알림 설정 탭 */}
      {activeSubTab === 'notifications' && (
        <section className="bg-white rounded-[20px] p-6 sm:p-7 border border-[#E5E5ED] miro-shadow-card space-y-6">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-[#050038]">알림 설정</h3>
            <p className="text-xs text-[#5F5C7A] mt-0.5">
              마감일, 중요 일정, 일일 정리 알림을 각각 ON/OFF 할 수 있습니다.
            </p>
          </div>

          {/* Environmental Limitation Notice (Miro yellow sticky style) */}
          <div className="bg-[#FFF8D6] border border-[#F5E59C] rounded-[16px] p-4 flex items-start gap-3 text-xs text-[#6B5B00]">
            <AlertTriangle className="w-4 h-4 text-[#6B5B00] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-[#050038] block">브라우저 알림 환경 안내</span>
              <p className="leading-relaxed">
                웹 브라우저의 iFrame 또는 탭 샌드박스 정책으로 인해 백그라운드 푸시 알림이 지원되지 않는
                환경이 있을 수 있습니다. 실제 알림을 원활하게 수신하려면 우측 상단의 브라우저 알림 권한을
                허용하거나 새 탭에서 앱을 실행해 주세요.
              </p>
            </div>
          </div>

          {/* 4 Notification Toggles */}
          <div className="space-y-4 divide-y divide-[#E5E5ED]">
            {/* 1) 임박한 마감일 알림 */}
            <div className="pt-3 first:pt-0 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-[#050038] block">
                  임박한 마감일 알림
                </span>
                <span className="text-xs text-[#5F5C7A]">
                  마감 30분 전 및 1시간 전 완료되지 않은 업무 알림을 전송합니다.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleToggleNotification('deadlineAlert')}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  notificationSettings.deadlineAlert ? 'bg-[#050038]' : 'bg-[#E5E5ED]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                    notificationSettings.deadlineAlert ? 'left-5.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* 2) 회의/일정 알림 */}
            <div className="pt-3 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-[#050038] block">
                  회의 / 중요 일정 알림
                </span>
                <span className="text-xs text-[#5F5C7A]">
                  타임라인에 등록된 미팅 및 일정 시작 15분 전에 알려드립니다.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleToggleNotification('meetingAlert')}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  notificationSettings.meetingAlert ? 'bg-[#050038]' : 'bg-[#E5E5ED]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                    notificationSettings.meetingAlert ? 'left-5.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* 3) 업무 종료 전 오늘의 업무 정리 알림 */}
            <div className="pt-3 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-[#050038] block">
                  업무 종료 전 오늘의 업무 정리 알림
                </span>
                <span className="text-xs text-[#5F5C7A]">
                  퇴근 30분 전(기본 17:30) 오늘의 업무 완료 체크 및 회고 알림을 보냅니다.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleToggleNotification('dailyWrapUpAlert')}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  notificationSettings.dailyWrapUpAlert ? 'bg-[#050038]' : 'bg-[#E5E5ED]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                    notificationSettings.dailyWrapUpAlert ? 'left-5.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* 4) Google Sheets 일일 업로드 알림 */}
            <div className="pt-3 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-[#050038] block">
                  Google Sheets 일일 업로드 알림
                </span>
                <span className="text-xs text-[#5F5C7A]">
                  지정된 업로드 시간에 오늘의 업무 기록 업로드 상태를 알려드립니다.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleToggleNotification('sheetsUploadAlert')}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  notificationSettings.sheetsUploadAlert ? 'bg-[#050038]' : 'bg-[#E5E5ED]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                    notificationSettings.sheetsUploadAlert ? 'left-5.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 5. Google Sheets 연결 탭 */}
      {activeSubTab === 'sheets' && (
        <section className="bg-white rounded-[20px] p-6 sm:p-7 border border-[#E5E5ED] miro-shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E5ED] pb-4">
            <div>
              <span className="text-[10px] font-bold text-[#5F5C7A] uppercase tracking-wider">
                INTEGRATION
              </span>
              <h3 className="text-xl font-bold text-[#050038] mt-0.5">Google Sheets 연결</h3>
              <p className="text-xs text-[#5F5C7A] mt-0.5">
                매일 완료한 업무와 '오늘의 업무 요약'을 지정된 Google 스프레드시트에 자동 또는 원클릭으로 기록합니다.
              </p>
            </div>

            {/* Connection Badge */}
            {sheetsForm.isConnected ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[#00875A] bg-[#E1F7F5] border border-[#BDEEE9]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Google 계정 연결됨</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[#6B5B00] bg-[#FFF8D6] border border-[#F5E59C]">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Google Sheets 미연결</span>
              </div>
            )}
          </div>

          {/* Not Connected Warning Notice */}
          {!sheetsForm.isConnected && (
            <div className="bg-[#FFF8D6] border border-[#F5E59C] rounded-[16px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#6B5B00]">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="w-4 h-4 text-[#6B5B00] shrink-0" />
                <span>Google Sheets가 연결되지 않았습니다. 설정에서 연결해주세요.</span>
              </div>
              <button
                type="button"
                onClick={handleToggleSheetsConnect}
                className="miro-btn-primary text-xs py-1.5 px-4 shrink-0"
              >
                Google Sheets 연결하기
              </button>
            </div>
          )}

          {/* Connection Controls & Google Identity Button */}
          {sheetsForm.isConnected && (
            <div className="bg-[#F9F9FB] border border-[#E5E5ED] rounded-[16px] p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#050038] text-white flex items-center justify-center font-bold text-sm">
                    G
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#050038] block">연결된 Google 계정</span>
                    <span className="text-xs text-[#5F5C7A]">
                      {sheetsForm.accountEmail || 'user.workspace@gmail.com'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleSheetsConnect}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#BF2600] hover:bg-[#FFEBE6] border border-[#FFBDAD] transition-all cursor-pointer"
                >
                  연결 해제
                </button>
              </div>
            </div>
          )}

          {/* Form Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#050038]">스프레드시트 설정</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-[#050038] block mb-1">
                  스프레드시트 ID 또는 이름
                </label>
                <input
                  type="text"
                  value={sheetsForm.spreadsheetId}
                  onChange={(e) =>
                    setSheetsForm((prev) => ({ ...prev, spreadsheetId: e.target.value }))
                  }
                  className="w-full text-xs text-[#050038] bg-white border border-[#C9C7D6] rounded-[8px] px-3 py-2 focus:outline-none focus:border-[#4262FF]"
                  placeholder="예: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                />
              </div>

              <div>
                <label className="font-bold text-[#050038] block mb-1">시트 탭 이름</label>
                <input
                  type="text"
                  value={sheetsForm.sheetName}
                  onChange={(e) =>
                    setSheetsForm((prev) => ({ ...prev, sheetName: e.target.value }))
                  }
                  className="w-full text-xs text-[#050038] bg-white border border-[#C9C7D6] rounded-[8px] px-3 py-2 focus:outline-none focus:border-[#4262FF]"
                  placeholder="오늘업무_일일기록"
                />
              </div>

              {/* 5. 매일 자동 업로드 시간 */}
              <div>
                <label className="font-bold text-[#050038] block mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#4262FF]" />
                  일일 업무 기록 업로드 시간
                </label>
                <input
                  type="time"
                  value={sheetsForm.uploadTime}
                  onChange={(e) =>
                    setSheetsForm((prev) => ({ ...prev, uploadTime: e.target.value }))
                  }
                  className="w-full text-xs text-[#050038] bg-white border border-[#C9C7D6] rounded-[8px] px-3 py-2 focus:outline-none focus:border-[#4262FF]"
                />
                <span className="text-[11px] text-[#5F5C7A] mt-1 block">
                  매일 지정된 시간에 해당 날짜의 업무를 정리하여 기록합니다.
                </span>
              </div>

              <div className="flex items-center justify-end pt-5">
                <button
                  type="button"
                  onClick={handleSaveSheetsConfig}
                  className="miro-btn-primary text-xs py-2 px-4"
                >
                  설정 저장
                </button>
              </div>
            </div>
          </div>

          {/* 5. 자동화 제약 안내 및 대체 버튼 제공 */}
          <div className="bg-[#F9F9FB] border border-[#E5E5ED] rounded-[16px] p-5 space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-[#050038]">
              <HelpCircle className="w-4 h-4 text-[#4262FF]" />
              <span>백그라운드 자동 업로드 환경 안내</span>
            </div>
            <p className="text-[#5F5C7A] leading-relaxed">
              브라우저가 닫혀 있거나 절전 모드 등 백그라운드 자동 실행이 지원되지 않는 환경에서는 지정된 시간에
              자동 업로드가 일시 제한될 수 있습니다. 하루 업무를 마친 뒤 아래의{' '}
              <strong className="text-[#050038]">[오늘 업무 정리 및 업로드]</strong> 버튼을 이용해 즉시 업로드하실 수 있습니다.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onOpenDailyWrapUp}
                className="miro-btn-primary text-xs py-2 px-4"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#FFD02F]" />
                <span>오늘 업무 정리 및 업로드 실행</span>
              </button>

              {sheetsForm.lastUploadedAt && (
                <span className="text-[11px] text-[#5F5C7A] tnum">
                  최근 업로드: {new Date(sheetsForm.lastUploadedAt).toLocaleString('ko-KR')}
                </span>
              )}
            </div>
          </div>

          {/* 4. 일일 업무 기록 형식 미리보기 */}
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-bold text-[#050038]">Google Sheets 기록 포맷 안내</h4>
            <div className="overflow-x-auto rounded-[12px] border border-[#E5E5ED] text-xs">
              <table className="min-w-full divide-y divide-[#E5E5ED] bg-white">
                <thead className="bg-[#F9F9FB] text-[#050038] font-bold">
                  <tr>
                    <th className="px-3 py-2 text-left">날짜</th>
                    <th className="px-3 py-2 text-left">프로젝트</th>
                    <th className="px-3 py-2 text-left">업무 내용</th>
                    <th className="px-3 py-2 text-left">예상 시간</th>
                    <th className="px-3 py-2 text-left">완료 여부</th>
                    <th className="px-3 py-2 text-left">주요 메모</th>
                    <th className="px-3 py-2 text-left">마감일</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5ED] text-[#5F5C7A]">
                  <tr>
                    <td className="px-3 py-2 font-bold text-[#050038] tnum">2026-09-11</td>
                    <td className="px-3 py-2">프로젝트 A</td>
                    <td className="px-3 py-2">신규 고객사 제안서 최종 검토</td>
                    <td className="px-3 py-2 tnum">60분</td>
                    <td className="px-3 py-2 text-[#00875A] font-bold">완료</td>
                    <td className="px-3 py-2">수치 보정 확인 필수</td>
                    <td className="px-3 py-2 tnum">16:00</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-bold text-[#050038] tnum">2026-09-11</td>
                    <td className="px-3 py-2">프로젝트 B</td>
                    <td className="px-3 py-2">디자인 시스템 컴포넌트 도면 수정</td>
                    <td className="px-3 py-2 tnum">90분</td>
                    <td className="px-3 py-2 text-[#5F5C7A]">미완료</td>
                    <td className="px-3 py-2">모바일 패딩 16px 반영</td>
                    <td className="px-3 py-2 tnum">18:00</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-[#5F5C7A]">
              ※ 추가로 해당 날짜의 전체 업무를 요약한 <strong>「오늘의 업무 요약」</strong> 영역(총 업무, 완료,
              미완료, 주요 프로젝트, 오늘 가장 많이 진행한 업무, 미완료 업무, 내일 우선 처리)도 스프레드시트에
              함께 기록됩니다.
            </p>
          </div>
        </section>
      )}

      {/* Confirmation Modal for Deletions: 「이 업무를 삭제하시겠습니까?」 [취소] [삭제] */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-[20px] max-w-sm w-full p-6 space-y-4 miro-shadow-modal border border-[#E5E5ED]">
            <div className="w-10 h-10 rounded-full bg-[#FFEBE6] text-[#BF2600] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1.5">
              <h4 className="text-base font-bold text-[#050038]">
                {deleteModal.type === 'task' && '이 업무를 삭제하시겠습니까?'}
                {deleteModal.type === 'schedule' && '이 일정을 삭제하시겠습니까?'}
                {deleteModal.type === 'call' && '이 전화 기록을 삭제하시겠습니까?'}
              </h4>
              <p className="text-xs text-[#5F5C7A] break-words">
                "{deleteModal.title}"
              </p>
              {deleteModal.extraNotice && (
                <p className="text-[11px] text-[#4262FF] bg-[#F0EDFF] p-2.5 rounded-[10px] mt-2 border border-[#D5CCFF]">
                  {deleteModal.extraNotice}
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, type: 'task', id: '', title: '' })}
                className="flex-1 miro-btn-secondary text-xs py-2 justify-center"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2 rounded-full text-xs font-semibold text-white bg-[#BF2600] hover:bg-[#9E2000] transition-all cursor-pointer shadow-xs"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
