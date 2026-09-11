import React from 'react';
import { Clock } from 'lucide-react';
import { Task } from '../types';

interface ProgressCardProps {
  tasks: Task[];
}

export const ProgressCard: React.FC<ProgressCardProps> = ({ tasks }) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.isCompleted).length;
  const remaining = total - completed;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const remainingMinutes = tasks
    .filter((t) => !t.isCompleted)
    .reduce((sum, t) => sum + (Number(t.estimatedMinutes) || 0), 0);

  const formatTime = (mins: number) => {
    if (mins <= 0) return '모두 완료!';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}시간 ${m}분 남음`;
    if (h > 0) return `${h}시간 남음`;
    return `${mins}분 남음`;
  };

  return (
    <div
      id="section-work-progress"
      className="bg-white rounded-[20px] p-6 sm:p-7 border border-[#E5E5ED] miro-shadow-card transition-all"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#5F5C7A] uppercase tracking-wider">
              03 · PROGRESS OVERVIEW
            </span>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#E3FCEF] text-[#006644] tnum border border-[#B3F5D3]">
              {percent}% 달성
            </span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-[#050038] mt-1">
            오늘의 업무 진행 현황
          </h3>
          <p className="text-xs text-[#5F5C7A] mt-0.5">
            등록된 {total}개 업무 중 {completed}개 완료됨 · 남은 업무 {remaining}개
          </p>
        </div>

        <div className="inline-flex items-center gap-2 text-xs font-medium text-[#050038] bg-[#F9F9FB] px-4 py-2 rounded-full border border-[#E5E5ED] self-start sm:self-auto shadow-none tnum">
          <Clock className="w-3.5 h-3.5 text-[#4262FF]" />
          <span>예상 잔여 시간: {formatTime(remainingMinutes)}</span>
        </div>
      </div>

      {/* Miro Progress Bar */}
      <div className="w-full h-3 bg-[#F4F4F7] rounded-full overflow-hidden p-0.5 border border-[#E5E5ED]">
        <div
          className="h-full bg-[#050038] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Miro Sticky Note Tinted Metric Tiles */}
      <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-[#E5E5ED]">
        {/* Total: Miro Yellow Tint */}
        <div className="bg-[#FFF8D6] rounded-[16px] p-3.5 text-center border border-[#F5E59C]">
          <span className="text-[11px] font-bold text-[#6B5B00] uppercase tracking-wider block">
            TOTAL · 등록
          </span>
          <span className="text-xl font-bold text-[#050038] tnum mt-0.5 block">{total}건</span>
        </div>

        {/* Done: Miro Teal Tint */}
        <div className="bg-[#E1F7F5] rounded-[16px] p-3.5 text-center border border-[#BDEEE9]">
          <span className="text-[11px] font-bold text-[#0B6A66] uppercase tracking-wider block">
            DONE · 완료
          </span>
          <span className="text-xl font-bold text-[#050038] tnum mt-0.5 block">{completed}건</span>
        </div>

        {/* Left: Miro Coral Tint */}
        <div className="bg-[#FFE8E1] rounded-[16px] p-3.5 text-center border border-[#FBCFBE]">
          <span className="text-[11px] font-bold text-[#8E280D] uppercase tracking-wider block">
            LEFT · 잔여
          </span>
          <span className="text-xl font-bold text-[#050038] tnum mt-0.5 block">{remaining}건</span>
        </div>
      </div>
    </div>
  );
};
