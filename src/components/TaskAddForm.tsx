import React, { useState } from 'react';
import { Plus, Clock, Folder, Calendar } from 'lucide-react';
import { Task, Priority } from '../types';
import { getTodayString } from '../data/initialData';

interface TaskAddFormProps {
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'isCompleted'>) => void;
  existingProjects: string[];
}

export const TaskAddForm: React.FC<TaskAddFormProps> = ({ onAddTask, existingProjects }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(30);
  const [memo, setMemo] = useState('');
  const [project, setProject] = useState('프로젝트 A (알파)');
  const [hasDeadline, setHasDeadline] = useState(true);
  const [deadlineDate, setDeadlineDate] = useState(getTodayString());
  const [deadlineTime, setDeadlineTime] = useState('18:00');
  const [priority, setPriority] = useState<Priority>('medium');

  const presetTimes = [
    { label: '15분', value: 15 },
    { label: '30분', value: 30 },
    { label: '45분', value: 45 },
    { label: '1시간', value: 60 },
    { label: '2시간', value: 120 },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      estimatedMinutes: Number(estimatedMinutes) || 0,
      memo: memo.trim(),
      project: project.trim() || '일반',
      deadline: hasDeadline ? `${deadlineDate} ${deadlineTime}` : undefined,
      priority,
      date: getTodayString(),
    });

    setTitle('');
    setMemo('');
    setIsOpen(false);
  };

  return (
    <div className="bg-white rounded-[16px] border border-[#E5E5ED] miro-shadow-card transition-all">
      {!isOpen ? (
        <div className="p-3 sm:p-3.5 flex items-center justify-between gap-3">
          <button
            id="btn-quick-add-trigger"
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex-1 text-left flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#F9F9FB] hover:bg-[#F0EDFF] text-[#050038] text-[13px] font-medium transition-all cursor-pointer border border-[#E5E5ED] hover:border-[#C9C7D6]"
          >
            {/* Miro Canary Yellow Accent Plus Pill */}
            <div className="w-6 h-6 rounded-full bg-[#FFD02F] text-[#050038] flex items-center justify-center shrink-0 font-bold shadow-xs">
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span className="text-[#5F5C7A]">오늘 할 일 추가하기 (소요 시간, 프로젝트, 마감일 입력)</span>
          </button>
        </div>
      ) : (
        <form id="form-add-task" onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E5ED] pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#FFD02F] text-[#050038] flex items-center justify-center font-bold text-xs">
                +
              </span>
              <h3 className="text-base font-bold text-[#050038]">오늘 새 업무 등록</h3>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs font-medium text-[#5F5C7A] hover:text-[#050038] px-3 py-1 rounded-full border border-[#E5E5ED] hover:bg-[#F4F4F7] cursor-pointer"
            >
              접기
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-[#050038] mb-1.5">
              업무 내용 *
            </label>
            <input
              id="input-task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 신규 고객사 제안서 슬라이드 초안 작성"
              required
              autoFocus
              className="w-full text-sm px-3.5 py-2.5 rounded-[8px] border border-[#C9C7D6] focus:outline-none focus:border-[#4262FF] focus:ring-1 focus:ring-[#4262FF] bg-white text-[#050038] placeholder:text-[#A5A2B8] transition-all"
            />
          </div>

          {/* Estimated Time */}
          <div>
            <label className="block text-xs font-semibold text-[#050038] mb-1.5">
              예상 소요 시간 (분)
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative w-32">
                <input
                  id="input-task-minutes"
                  type="number"
                  min="5"
                  step="5"
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                  className="w-full text-sm pl-8 pr-3 py-2 rounded-[8px] border border-[#C9C7D6] focus:outline-none focus:border-[#4262FF] bg-white text-[#050038] font-medium tnum"
                />
                <Clock className="w-3.5 h-3.5 text-[#5F5C7A] absolute left-2.5 top-3" />
              </div>

              {presetTimes.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setEstimatedMinutes(preset.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer tnum ${
                    estimatedMinutes === preset.value
                      ? 'bg-[#050038] text-white'
                      : 'bg-[#F9F9FB] text-[#5F5C7A] hover:text-[#050038] border border-[#E5E5ED]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Project & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Project */}
            <div>
              <label className="block text-xs font-semibold text-[#050038] mb-1.5">
                관련 프로젝트
              </label>
              <div className="relative">
                <input
                  id="input-task-project"
                  type="text"
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  placeholder="예: 프로젝트 A, 운영 및 문서"
                  list="project-suggestions"
                  className="w-full text-sm pl-8 pr-3 py-2 rounded-[8px] border border-[#C9C7D6] focus:outline-none focus:border-[#4262FF] bg-white text-[#050038] font-medium"
                />
                <Folder className="w-3.5 h-3.5 text-[#5F5C7A] absolute left-2.5 top-3" />
                <datalist id="project-suggestions">
                  {existingProjects.map((p) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-[#050038] mb-1.5">
                중요도
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPriority('high')}
                  className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    priority === 'high'
                      ? 'bg-[#FF5C35] text-white shadow-xs'
                      : 'bg-[#FFE8E1] text-[#8E280D] border border-[#FBCFBE]'
                  }`}
                >
                  긴급 (High)
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('medium')}
                  className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    priority === 'medium'
                      ? 'bg-[#FFD02F] text-[#050038] shadow-xs'
                      : 'bg-[#FFF8D6] text-[#6B5B00] border border-[#F5E59C]'
                  }`}
                >
                  보통 (Med)
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('low')}
                  className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    priority === 'low'
                      ? 'bg-[#05A3A4] text-white shadow-xs'
                      : 'bg-[#E1F7F5] text-[#0B6A66] border border-[#BDEEE9]'
                  }`}
                >
                  여유 (Low)
                </button>
              </div>
            </div>
          </div>

          {/* Deadline Toggle & Inputs */}
          <div className="p-3.5 rounded-[12px] bg-[#F9F9FB] border border-[#E5E5ED] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#050038] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#4262FF]" />
                마감일 설정
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDeadline}
                  onChange={(e) => setHasDeadline(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#E5E5ED] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E5E5ED] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#050038]" />
              </label>
            </div>

            {hasDeadline && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E5E5ED]">
                <div>
                  <label className="block text-[11px] text-[#5F5C7A] mb-1">마감 날짜</label>
                  <input
                    type="date"
                    value={deadlineDate}
                    onChange={(e) => setDeadlineDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-[8px] border border-[#C9C7D6] bg-white text-[#050038] focus:outline-none focus:border-[#4262FF] tnum"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#5F5C7A] mb-1">마감 시각</label>
                  <input
                    type="time"
                    value={deadlineTime}
                    onChange={(e) => setDeadlineTime(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-[8px] border border-[#C9C7D6] bg-white text-[#050038] focus:outline-none focus:border-[#4262FF] tnum"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Memo */}
          <div>
            <label className="block text-xs font-semibold text-[#050038] mb-1.5">
              상세 메모
            </label>
            <textarea
              id="input-task-memo"
              rows={2}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="업무 진행 시 참고할 사항, 링크, 주요 체크포인트 기록"
              className="w-full text-sm px-3.5 py-2.5 rounded-[8px] border border-[#C9C7D6] focus:outline-none focus:border-[#4262FF] bg-white text-[#050038] placeholder:text-[#A5A2B8]"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="miro-btn-secondary text-xs py-2 px-4"
            >
              취소
            </button>
            <button
              id="btn-submit-task"
              type="submit"
              className="miro-btn-primary text-xs py-2 px-5"
            >
              오늘 할 일에 추가
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
