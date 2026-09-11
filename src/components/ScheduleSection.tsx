import React, { useState, useRef } from 'react';
import {
  CalendarClock,
  Check,
  Plus,
  Clock,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Calendar,
} from 'lucide-react';
import { Schedule } from '../types';
import { sendAppNotification } from '../utils/notifications';

interface ScheduleSectionProps {
  schedules: Schedule[];
  onToggleConfirm: (id: string) => void;
  onAddSchedule: (schedule: Omit<Schedule, 'id' | 'createdAt' | 'isConfirmed'>) => void;
  onDeleteSchedule: (id: string) => void;
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  schedules,
  onToggleConfirm,
  onAddSchedule,
  onDeleteSchedule,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('14:00');
  const [project, setProject] = useState('프로젝트 A (알파)');
  const [memo, setMemo] = useState('');
  const timelineRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddSchedule({
      title: title.trim(),
      date,
      time,
      project: project.trim() || '일반',
      memo: memo.trim(),
    });
    sendAppNotification('새 중요 일정 등록', `[${title.trim()}] 타임라인에 등록되었습니다.`);
    setTitle('');
    setMemo('');
    setIsAdding(false);
  };

  // Chronological Sort: Earliest date & time first for a true chronological timeline sequence
  const sortedSchedules = [...schedules].sort((a, b) => {
    const dateA = `${a.date}T${a.time || '00:00'}`;
    const dateB = `${b.date}T${b.time || '00:00'}`;
    return dateA.localeCompare(dateB);
  });

  const scrollTimeline = (direction: 'left' | 'right') => {
    if (timelineRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      timelineRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getDDayInfo = (scheduleDate: string) => {
    const today = new Date().toISOString().split('T')[0];
    if (scheduleDate === today) {
      return { label: '오늘 D-DAY', isUrgent: true, color: 'bg-[#FFE8E1] text-[#8E280D] border border-[#FBCFBE]' };
    }
    const tDate = new Date(today);
    const sDate = new Date(scheduleDate);
    const diffDays = Math.ceil((sDate.getTime() - tDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return { label: '내일 D-1', isUrgent: true, color: 'bg-[#FFF8D6] text-[#6B5B00] border border-[#F5E59C]' };
    }
    if (diffDays > 1) {
      return { label: `D-${diffDays}`, isUrgent: false, color: 'bg-[#F0EDFF] text-[#4262FF] border border-[#D5CCFF]' };
    }
    return { label: '종료', isUrgent: false, color: 'bg-[#F4F4F7] text-[#89869E] border border-[#E5E5ED]' };
  };

  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parseInt(parts[1], 10)}월 ${parseInt(parts[2], 10)}일`;
    }
    return dateStr;
  };

  return (
    <section
      id="section-upcoming-schedules"
      className="bg-white rounded-[20px] p-6 sm:p-7 border border-[#E5E5ED] miro-shadow-card"
    >
      {/* Top Header: Title & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E5ED] pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#050038] text-white flex items-center justify-center shrink-0">
            <CalendarClock className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#5F5C7A] uppercase tracking-wider">
                02 · TIMELINE
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FFF8D6] text-[#6B5B00] border border-[#F5E59C]">
                가로형 순서 타임라인
              </span>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-[#050038] mt-0.5">
              마감 임박 및 중요 일정
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Scroll Nav Buttons */}
          <div className="flex items-center gap-1 bg-[#F9F9FB] p-1 rounded-full border border-[#E5E5ED]">
            <button
              type="button"
              onClick={() => scrollTimeline('left')}
              title="이전 일정 보기"
              className="w-7 h-7 rounded-full flex items-center justify-center text-[#5F5C7A] hover:text-[#050038] hover:bg-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollTimeline('right')}
              title="다음 일정 보기"
              className="w-7 h-7 rounded-full flex items-center justify-center text-[#5F5C7A] hover:text-[#050038] hover:bg-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Add Schedule Button */}
          <button
            id="btn-trigger-add-schedule"
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="miro-btn-primary py-1.5 px-4 text-xs font-medium"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{isAdding ? '닫기' : '새 일정 등록'}</span>
          </button>
        </div>
      </div>

      {/* Add Schedule Expandable Form */}
      {isAdding && (
        <form
          id="form-add-schedule"
          onSubmit={handleSubmit}
          className="mb-6 p-5 rounded-[16px] bg-[#F9F9FB] border border-[#E5E5ED] space-y-3.5 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-[#E5E5ED] pb-2">
            <h4 className="text-sm font-bold text-[#050038] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#050038] text-white flex items-center justify-center text-[11px] font-bold">
                +
              </span>
              새 미팅 및 마감 일정 등록
            </h4>
            <span className="text-[11px] text-[#5F5C7A]">가로 타임라인에 시간순으로 자동 배치됩니다</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-[#050038] mb-1">
                일정 / 마감명 *
              </label>
              <input
                id="input-schedule-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 고객사 제안 미팅, 견적서 발송 마감"
                required
                className="w-full text-xs px-3 py-2 rounded-[8px] border border-[#C9C7D6] bg-white text-[#050038] focus:outline-none focus:border-[#4262FF]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#050038] mb-1">
                프로젝트
              </label>
              <input
                id="input-schedule-project"
                type="text"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                placeholder="관련 프로젝트명"
                className="w-full text-xs px-3 py-2 rounded-[8px] border border-[#C9C7D6] bg-white text-[#050038] focus:outline-none focus:border-[#4262FF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#050038] mb-1">
                날짜 *
              </label>
              <input
                id="input-schedule-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full text-xs px-3 py-2 rounded-[8px] border border-[#C9C7D6] bg-white text-[#050038] focus:outline-none focus:border-[#4262FF] tnum"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#050038] mb-1">
                시각 *
              </label>
              <input
                id="input-schedule-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full text-xs px-3 py-2 rounded-[8px] border border-[#C9C7D6] bg-white text-[#050038] focus:outline-none focus:border-[#4262FF] tnum"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#050038] mb-1">
              메모 / 장소
            </label>
            <input
              id="input-schedule-memo"
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="예: 4층 회의실 대면 진행, 줌 링크 공유 필요"
              className="w-full text-xs px-3 py-2 rounded-[8px] border border-[#C9C7D6] bg-white text-[#050038] focus:outline-none focus:border-[#4262FF]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="miro-btn-secondary text-xs py-1.5 px-3.5"
            >
              취소
            </button>
            <button
              id="btn-submit-schedule"
              type="submit"
              className="miro-btn-primary text-xs py-1.5 px-4"
            >
              타임라인에 등록
            </button>
          </div>
        </form>
      )}

      {/* Horizontal Timeline Track */}
      <div
        ref={timelineRef}
        className="flex gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth snap-x snap-mandatory"
        style={{ scrollbarWidth: 'thin' }}
      >
        {sortedSchedules.map((schedule, idx) => {
          const dday = getDDayInfo(schedule.date);
          return (
            <div
              key={schedule.id}
              className={`snap-start shrink-0 w-[285px] sm:w-[315px] rounded-[16px] p-4.5 border transition-all duration-150 flex flex-col justify-between miro-shadow-subtle ${
                schedule.isConfirmed
                  ? 'bg-[#F9F9FB] border-[#E5E5ED] opacity-75'
                  : dday.isUrgent
                  ? 'bg-white border-[#FFD02F] ring-2 ring-[#FFD02F]/30'
                  : 'bg-white border-[#E5E5ED] hover:border-[#C9C7D6]'
              }`}
            >
              <div>
                {/* Timeline Step Number & D-Day Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#050038] text-white text-[10px] font-bold flex items-center justify-center tnum">
                      {idx + 1}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full tnum ${dday.color}`}
                    >
                      {dday.label}
                    </span>
                  </div>

                  {schedule.project && (
                    <span className="text-[11px] text-[#4262FF] font-medium px-2.5 py-0.5 rounded-full bg-[#F0EDFF] border border-[#D5CCFF] truncate max-w-[110px]">
                      {schedule.project}
                    </span>
                  )}
                </div>

                {/* Schedule Title */}
                <h4
                  className={`text-sm font-medium tracking-tight leading-snug line-clamp-2 ${
                    schedule.isConfirmed ? 'line-through text-[#89869E]' : 'text-[#050038]'
                  }`}
                >
                  {schedule.title}
                </h4>

                {/* Memo */}
                {schedule.memo && (
                  <p className="text-xs text-[#5F5C7A] mt-1.5 line-clamp-2 leading-relaxed">
                    {schedule.memo}
                  </p>
                )}
              </div>

              {/* Bottom Info & Action Bar */}
              <div className="mt-4 pt-3 border-t border-[#E5E5ED] flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-[#050038] font-medium">
                  <span className="flex items-center gap-1 text-[#4262FF] tnum">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDateLabel(schedule.date)}
                  </span>
                  <span className="flex items-center gap-1 bg-[#F4F4F7] px-2 py-0.5 rounded-full text-[11px] border border-[#E5E5ED] tnum">
                    <Clock className="w-3 h-3 text-[#5F5C7A]" />
                    {schedule.time || '14:00'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Confirm Checkbox */}
                  <button
                    type="button"
                    onClick={() => onToggleConfirm(schedule.id)}
                    title={schedule.isConfirmed ? '확인 완료 취소' : '일정 확인 완료 체크'}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      schedule.isConfirmed
                        ? 'bg-[#050038] text-white'
                        : 'border border-[#C9C7D6] hover:border-[#050038] text-[#89869E]'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => onDeleteSchedule(schedule.id)}
                    title="일정 삭제"
                    className="p-1.5 text-[#89869E] hover:text-[#BF2600] rounded-full hover:bg-[#FFEBE6] transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {sortedSchedules.length === 0 && (
          <div className="w-full py-10 text-center text-xs text-[#5F5C7A] bg-[#F9F9FB] rounded-[16px] border border-dashed border-[#E5E5ED] flex flex-col items-center justify-center">
            <Calendar className="w-6 h-6 text-[#FFD02F] mb-2" />
            <p className="font-bold text-[#050038]">등록된 중요 일정이 없습니다.</p>
            <p className="mt-0.5 text-[#5F5C7A]">상단의 [+ 새 일정 등록] 버튼을 눌러 중요한 마감이나 미팅을 가로 타임라인에 추가하세요.</p>
          </div>
        )}
      </div>
    </section>
  );
};
