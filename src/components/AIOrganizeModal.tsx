import React from 'react';
import { Sparkles, Clock, X, Lightbulb, ListOrdered, Check } from 'lucide-react';
import { AIOrganizeResult, Task } from '../types';

interface AIOrganizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: AIOrganizeResult | null;
  isLoading: boolean;
  onApplyOrder: (orderedIds: string[]) => void;
  tasks: Task[];
}

export const AIOrganizeModal: React.FC<AIOrganizeModalProps> = ({
  isOpen,
  onClose,
  result,
  isLoading,
  onApplyOrder,
  tasks,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div
        id="modal-ai-organize"
        className="bg-white rounded-[24px] max-w-xl w-full max-h-[90vh] flex flex-col miro-shadow-modal border border-[#E5E5ED] overflow-hidden"
      >
        {/* Header: Miro Dark (#050038) */}
        <div className="p-5 sm:p-6 border-b border-[#E5E5ED] flex items-center justify-between bg-[#050038] text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FFD02F] text-[#050038] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#FFD02F] font-bold block">
                AI WORK ORGANIZER
              </span>
              <h3 className="text-lg font-bold tracking-tight text-white">
                오늘의 업무 최적화 순서
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-8 h-8 border-2 border-[#050038]/30 border-t-[#050038] rounded-full animate-spin" />
              <p className="text-sm font-bold text-[#050038]">
                오늘의 업무와 마감 일정을 종합 분석하고 있습니다...
              </p>
              <p className="text-xs text-[#5F5C7A]">
                중요도 · 마감 임박도 · 소요 시간 기반 최적 정렬 계산 중
              </p>
            </div>
          ) : result ? (
            <>
              {/* Summary Block: Miro Yellow Pastel Card */}
              <div className="bg-[#FFF8D6] rounded-[16px] p-5 border border-[#F5E59C]">
                <span className="text-[10px] font-bold text-[#6B5B00] uppercase tracking-wider block mb-1">
                  GUIDANCE · 업무 요약
                </span>
                <p className="text-sm text-[#050038] leading-relaxed font-normal">
                  {result.summary}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-[#6B5B00] pt-2.5 border-t border-[#F5E59C]">
                  <Clock className="w-3.5 h-3.5 text-[#6B5B00]" />
                  <span>
                    예상 총 집중 시간: <strong className="text-[#050038] font-bold tnum">{result.estimatedTotalTime}</strong>
                  </span>
                </div>
              </div>

              {/* Actionable Tips */}
              {result.tips && result.tips.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-bold text-[#050038] mb-2 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-[#4262FF]" />
                    실행 권장 팁
                  </h4>
                  <div className="space-y-1.5">
                    {result.tips.map((tip, idx) => (
                      <div
                        key={idx}
                        className="text-xs text-[#050038] bg-[#F9F9FB] rounded-full px-4 py-2 flex items-center gap-2.5 border border-[#E5E5ED]"
                      >
                        <span className="w-5 h-5 rounded-full bg-[#050038] text-white text-[10px] font-bold flex items-center justify-center shrink-0 tnum">
                          {idx + 1}
                        </span>
                        <span className="leading-snug">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Order List */}
              <div>
                <h4 className="text-xs uppercase tracking-wider font-bold text-[#050038] mb-2 flex items-center gap-1.5">
                  <ListOrdered className="w-3.5 h-3.5 text-[#4262FF]" />
                  추천 실행 순서 (세로 목록에 반영)
                </h4>
                <div className="space-y-2">
                  {result.organizedTaskIds.map((taskId, index) => {
                    const matchedTask = tasks.find((t) => t.id === taskId);
                    if (!matchedTask) return null;

                    return (
                      <div
                        key={taskId}
                        className="flex items-center justify-between gap-3 p-3 bg-white rounded-[12px] border border-[#E5E5ED] text-xs miro-shadow-subtle"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-6 h-6 rounded-full bg-[#F4F4F7] text-[#050038] font-bold flex items-center justify-center shrink-0 text-xs border border-[#E5E5ED] tnum">
                            {index + 1}
                          </span>
                          <div className="truncate">
                            <span className="font-medium text-[#050038] truncate block">
                              {matchedTask.title}
                            </span>
                            <span className="text-[11px] text-[#5F5C7A]">
                              {matchedTask.project} · {matchedTask.estimatedMinutes}분
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                            matchedTask.priority === 'high'
                              ? 'bg-[#FFE8E1] text-[#8E280D] border border-[#FBCFBE]'
                              : matchedTask.priority === 'medium'
                              ? 'bg-[#FFF8D6] text-[#6B5B00] border border-[#F5E59C]'
                              : 'bg-[#E1F7F5] text-[#0B6A66] border border-[#BDEEE9]'
                          }`}
                        >
                          {matchedTask.priority.toUpperCase()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-xs text-[#5F5C7A]">
              정리할 업무 데이터가 없습니다.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#E5E5ED] bg-[#F9F9FB] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="miro-btn-secondary text-xs py-2 px-4"
          >
            닫기
          </button>

          {result && (
            <button
              id="btn-apply-organized-order"
              type="button"
              onClick={() => {
                onApplyOrder(result.organizedTaskIds);
                onClose();
              }}
              className="miro-btn-primary text-xs py-2 px-5"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>이 순서로 세로 목록 정렬</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
