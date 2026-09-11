import React, { useState, useEffect } from 'react';
import {
  Calendar,
  PhoneCall,
  BarChart3,
  Bell,
  RotateCcw,
  ListTodo,
  Settings as SettingsIcon,
  Camera,
  FileSpreadsheet,
} from 'lucide-react';
import { getNotificationPermission, requestNotificationPermission, sendAppNotification } from '../utils/notifications';

export type AppView = 'tasks' | 'photomemo' | 'retrospective' | 'calls' | 'settings';

interface HeaderProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  todayTaskCount: { total: number; completed: number; remaining: number };
  onResetData: () => void;
  onOpenDailyWrapUp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  todayTaskCount,
  onResetData,
  onOpenDailyWrapUp,
}) => {
  const [notificationState, setNotificationState] = useState<NotificationPermission>('default');

  useEffect(() => {
    setNotificationState(getNotificationPermission());
  }, []);

  const handleNotificationClick = async () => {
    const perm = await requestNotificationPermission();
    setNotificationState(perm);
    if (perm === 'granted') {
      sendAppNotification('오늘업무 알림 활성화', '마감 임박 일정과 중요한 업무 알림을 전송해 드립니다.');
    }
  };

  const today = new Date();
  const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const dateFormatted = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 (${dayNames[today.getDay()]})`;

  return (
    <header
      id="app-header"
      className="sticky top-0 z-40 bg-white border-b border-[#E5E5ED] transition-all"
    >
      {/* Miro Sticky Promo Banner ABOVE Top Nav */}
      <div className="bg-[#050038] text-white py-2 px-4 text-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 mx-auto sm:mx-0">
          <span className="bg-[#FFD02F] text-[#050038] font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide">
            TODAY WORK
          </span>
          <span className="font-medium text-white/95 tracking-tight">AI 비주얼 워크스페이스 · 오늘 업무 계획 및 마감 타임라인</span>
          <span className="text-white/30 hidden md:inline">|</span>
          <span className="text-white/70 hidden md:inline text-[11px]">Google Sheets 일일 동기화 &amp; 수기 메모 OCR 지원</span>
        </div>

        {/* Miro White Pill CTA on Dark Banner */}
        <button
          type="button"
          onClick={onOpenDailyWrapUp}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium text-[#050038] bg-white hover:bg-[#F4F4F7] active:scale-95 transition-all cursor-pointer shadow-xs"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-[#050038]" />
          <span>오늘 업무 정리 및 업로드</span>
        </button>
      </div>

      {/* Main White Nav Bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        {/* Left: Canary Yellow Miro Wordmark + Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCurrentView('tasks')}
            className="flex items-center gap-2.5 text-left cursor-pointer group"
          >
            {/* Canary Yellow Square Wordmark Badge */}
            <div className="w-8 h-8 rounded-[8px] bg-[#FFD02F] text-[#050038] font-black text-base flex items-center justify-center shrink-0 shadow-xs group-hover:bg-[#E5B800] transition-colors">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-[#050038]">오늘업무</h1>
                {/* Yellow Tag Chip */}
                <span className="bg-[#FFF8D6] text-[#6B5B00] text-[11px] font-semibold px-2 py-0.5 rounded-full border border-[#F5E59C]">
                  Visual Workspace
                </span>
              </div>
              <p className="text-[12px] text-[#5F5C7A] flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3 text-[#4262FF]" />
                <span className="tnum font-normal">{dateFormatted}</span>
              </p>
            </div>
          </button>
        </div>

        {/* Center: Miro Pill-Style Tab Nav */}
        <nav
          id="main-navigation"
          className="flex items-center gap-1.5 self-start md:self-auto overflow-x-auto max-w-full p-1"
        >
          {/* 1. 오늘 업무 */}
          <button
            id="nav-tab-tasks"
            type="button"
            onClick={() => setCurrentView('tasks')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all cursor-pointer whitespace-nowrap text-[13px] font-medium ${
              currentView === 'tasks'
                ? 'bg-[#050038] text-white shadow-none'
                : 'bg-white text-[#5F5C7A] hover:text-[#050038] border border-[#E5E5ED] hover:border-[#C9C7D6]'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>오늘 업무</span>
            {todayTaskCount.remaining > 0 && (
              <span
                className={`ml-0.5 px-2 py-0.2 rounded-full text-[11px] font-semibold tnum ${
                  currentView === 'tasks'
                    ? 'bg-[#FFD02F] text-[#050038]'
                    : 'bg-[#F0F0F5] text-[#050038]'
                }`}
              >
                {todayTaskCount.remaining}
              </span>
            )}
          </button>

          {/* 2. 수기 메모 사진 */}
          <button
            id="nav-tab-photomemo"
            type="button"
            onClick={() => setCurrentView('photomemo')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all cursor-pointer whitespace-nowrap text-[13px] font-medium ${
              currentView === 'photomemo'
                ? 'bg-[#050038] text-white shadow-none'
                : 'bg-white text-[#5F5C7A] hover:text-[#050038] border border-[#E5E5ED] hover:border-[#C9C7D6]'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>수기 메모 사진</span>
          </button>

          {/* 3. 월간 회고 */}
          <button
            id="nav-tab-retrospective"
            type="button"
            onClick={() => setCurrentView('retrospective')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all cursor-pointer whitespace-nowrap text-[13px] font-medium ${
              currentView === 'retrospective'
                ? 'bg-[#050038] text-white shadow-none'
                : 'bg-white text-[#5F5C7A] hover:text-[#050038] border border-[#E5E5ED] hover:border-[#C9C7D6]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>월간 회고</span>
          </button>

          {/* 4. 전화 기록 */}
          <button
            id="nav-tab-calls"
            type="button"
            onClick={() => setCurrentView('calls')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all cursor-pointer whitespace-nowrap text-[13px] font-medium ${
              currentView === 'calls'
                ? 'bg-[#050038] text-white shadow-none'
                : 'bg-white text-[#5F5C7A] hover:text-[#050038] border border-[#E5E5ED] hover:border-[#C9C7D6]'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>전화 기록</span>
          </button>

          {/* 5. 설정 */}
          <button
            id="nav-tab-settings"
            type="button"
            onClick={() => setCurrentView('settings')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all cursor-pointer whitespace-nowrap text-[13px] font-medium ${
              currentView === 'settings'
                ? 'bg-[#050038] text-white shadow-none'
                : 'bg-white text-[#5F5C7A] hover:text-[#050038] border border-[#E5E5ED] hover:border-[#C9C7D6]'
            }`}
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>설정</span>
          </button>
        </nav>

        {/* Right: Outlined Pill Buttons */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            id="btn-toggle-notification"
            type="button"
            onClick={handleNotificationClick}
            title="마감 및 업무 알림 설정"
            className="miro-btn-secondary py-1.5 px-3.5 text-xs font-medium"
          >
            <Bell className={`w-3.5 h-3.5 ${notificationState === 'granted' ? 'text-[#4262FF]' : 'text-[#89869E]'}`} />
            <span className="hidden sm:inline">
              {notificationState === 'granted' ? '알림 켜짐' : '알림 켜기'}
            </span>
          </button>

          <button
            id="btn-reset-data"
            type="button"
            onClick={() => {
              if (window.confirm('기본 예시 데이터를 초기 상태로 복원하시겠습니까?')) {
                onResetData();
              }
            }}
            title="기본 예시 데이터 복원"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-[#89869E] hover:text-[#050038] border border-[#E5E5ED] bg-white hover:bg-[#F4F4F7] transition-all cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">초기화</span>
          </button>
        </div>
      </div>
    </header>
  );
};
