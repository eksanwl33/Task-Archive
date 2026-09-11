import React from 'react';
import { Check, Clock, Calendar, Folder, Trash2, PhoneCall } from 'lucide-react';
import { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggleComplete, onDelete }) => {
  const formatMinutes = (mins: number) => {
    if (!mins) return '소요시간 미정';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}시간 ${m}분`;
    if (h > 0) return `${h}시간`;
    return `${mins}분`;
  };

  const getPriorityBadge = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return (
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FFE8E1] text-[#8E280D] border border-[#FBCFBE]">
            긴급 · High
          </span>
        );
      case 'medium':
        return (
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FFF8D6] text-[#6B5B00] border border-[#F5E59C]">
            보통 · Med
          </span>
        );
      case 'low':
      default:
        return (
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#E1F7F5] text-[#0B6A66] border border-[#BDEEE9]">
            여유 · Low
          </span>
        );
    }
  };

  return (
    <div
      id={`task-item-${task.id}`}
      className={`group relative rounded-[16px] p-4 transition-all duration-150 border flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 miro-shadow-subtle ${
        task.isCompleted
          ? 'bg-[#F9F9FB] border-[#E5E5ED] text-[#89869E]'
          : 'bg-white border-[#E5E5ED] hover:border-[#C9C7D6]'
      }`}
    >
      {/* Left Area: Circular Checkbox + Title & Metadata */}
      <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
        {/* Miro Black Pill Toggle Checkbox */}
        <button
          id={`btn-checkbox-${task.id}`}
          type="button"
          onClick={() => onToggleComplete(task.id)}
          aria-label={task.isCompleted ? '완료 취소' : '업무 완료 체크'}
          className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            task.isCompleted
              ? 'bg-[#050038] text-white'
              : 'border-2 border-[#C9C7D6] hover:border-[#050038] bg-white'
          }`}
        >
          {task.isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Content Column */}
        <div className="flex-1 min-w-0">
          {/* Metadata Badges */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {task.isCompleted ? (
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F0F0F5] text-[#5F5C7A]">
                완료됨
              </span>
            ) : (
              getPriorityBadge(task.priority)
            )}

            {task.project && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#4262FF] px-2.5 py-0.5 rounded-full bg-[#F0EDFF] border border-[#D5CCFF]">
                <Folder className="w-3 h-3 text-[#4262FF]" />
                {task.project}
              </span>
            )}

            {task.estimatedMinutes > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#5F5C7A] px-2.5 py-0.5 rounded-full bg-[#F4F4F7] border border-[#E5E5ED] tnum">
                <Clock className="w-3 h-3 text-[#5F5C7A]" />
                {formatMinutes(task.estimatedMinutes)}
              </span>
            )}

            {task.deadline && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#050038] px-2.5 py-0.5 rounded-full bg-[#FFF8D6] border border-[#F5E59C] tnum">
                <Calendar className="w-3 h-3 text-[#6B5B00]" />
                마감: {task.deadline}
              </span>
            )}

            {task.sourceCallLogId && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8E280D] px-2.5 py-0.5 rounded-full bg-[#FFE8E1] border border-[#FBCFBE]">
                <PhoneCall className="w-3 h-3 text-[#8E280D]" />
                전화 연계
              </span>
            )}
          </div>

          {/* Title */}
          <h4
            className={`text-[15px] font-medium tracking-tight leading-snug transition-colors ${
              task.isCompleted
                ? 'line-through text-[#89869E]'
                : 'text-[#050038]'
            }`}
          >
            {task.title}
          </h4>

          {/* Memo */}
          {task.memo && (
            <p
              className={`text-xs mt-1 leading-relaxed ${
                task.isCompleted ? 'text-[#89869E]/70' : 'text-[#5F5C7A]'
              }`}
            >
              {task.memo}
            </p>
          )}
        </div>
      </div>

      {/* Right Actions: Delete */}
      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        <button
          id={`btn-delete-task-${task.id}`}
          type="button"
          onClick={() => onDelete(task.id)}
          title="업무 삭제"
          className="p-1.5 rounded-full text-[#89869E] hover:text-[#BF2600] hover:bg-[#FFEBE6] transition-all cursor-pointer opacity-70 hover:opacity-100"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
