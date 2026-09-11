import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Sparkles,
  Send,
  Calendar,
} from 'lucide-react';
import { Task, GoogleSheetsSettings, DailySummary } from '../types';

interface DailyWrapUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  sheetsSettings: GoogleSheetsSettings;
  onNavigateToSettings: () => void;
  onUploadSuccess: (summary: DailySummary) => void;
}

export const DailyWrapUpModal: React.FC<DailyWrapUpModalProps> = ({
  isOpen,
  onClose,
  tasks,
  sheetsSettings,
  onNavigateToSettings,
  onUploadSuccess,
}) => {
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [hasSufficientData, setHasSufficientData] = useState(true);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [uploadMessage, setUploadMessage] = useState<string>('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Fetch or generate daily summary on open
  useEffect(() => {
    if (!isOpen) {
      setUploadSuccess(false);
      setUploadMessage('');
      return;
    }

    const generateSummary = async () => {
      if (tasks.length === 0) {
        setHasSufficientData(false);
        return;
      }

      setIsLoadingSummary(true);
      try {
        const response = await fetch('/api/ai/daily-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tasks, date: todayStr }),
        });

        const data = await response.json();
        if (data.hasData && data.summary) {
          setSummary(data.summary);
          setHasSufficientData(true);
        } else {
          setHasSufficientData(false);
        }
      } catch (e) {
        console.error(e);
        // Fallback calculation from real tasks
        const completed = tasks.filter((t) => t.isCompleted);
        const incomplete = tasks.filter((t) => !t.isCompleted);
        setSummary({
          date: todayStr,
          totalTasks: tasks.length,
          completedTasks: completed.length,
          incompleteTasks: incomplete.length,
          projectSummary: Array.from(new Set(tasks.map((t) => t.project).filter(Boolean))),
          mainWork: completed.length > 0 ? completed.map((t) => t.title).join(', ') : '업무 진행',
          unfinishedWork: incomplete.length > 0 ? incomplete.map((t) => t.title).join(', ') : '모두 완료',
          nextDayPriority: incomplete[0]?.title || '새로운 업무 계획',
          generatedAt: new Date().toISOString(),
        });
        setHasSufficientData(true);
      } finally {
        setIsLoadingSummary(false);
      }
    };

    generateSummary();
  }, [isOpen, tasks, todayStr]);

  // Execute Upload to Google Sheets
  const handleUploadToSheets = async () => {
    if (!sheetsSettings.isConnected) return;
    if (tasks.length === 0) return;

    setIsUploading(true);
    try {
      const response = await fetch('/api/google-sheets/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks,
          summary,
          spreadsheetId: sheetsSettings.spreadsheetId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setUploadSuccess(true);
        setUploadMessage(
          `${data.rowsUploaded}개의 업무 행과 '오늘의 업무 요약'이 Google Sheets에 정상 업로드되었습니다.`
        );
        if (summary) {
          onUploadSuccess(summary);
        }
      } else {
        throw new Error(data.error || '업로드 실패');
      }
    } catch (e: any) {
      alert(`업로드 중 오류가 발생했습니다: ${e.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-[24px] max-w-2xl w-full p-6 sm:p-8 space-y-6 miro-shadow-modal border border-[#E5E5ED] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#E5E5ED] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#050038] text-white flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFF8D6] text-[#6B5B00] border border-[#F5E59C] uppercase tracking-wider">
                  일일 업무 마감
                </span>
                <span className="text-xs text-[#5F5C7A] flex items-center gap-1 tnum">
                  <Calendar className="w-3 h-3 text-[#4262FF]" />
                  {todayStr}
                </span>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-[#050038] mt-0.5">
                오늘 업무 정리 및 업로드
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#5F5C7A] hover:text-[#050038] rounded-full hover:bg-[#F4F4F7] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Connection Check Banner */}
        {!sheetsSettings.isConnected && (
          <div className="bg-[#FFF8D6] border border-[#F5E59C] rounded-[16px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#6B5B00]">
            <div className="flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-[#6B5B00] shrink-0" />
              <span>Google Sheets가 연결되지 않았습니다. 설정에서 연결해주세요.</span>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToSettings();
              }}
              className="miro-btn-primary text-xs py-1.5 px-3.5 shrink-0"
            >
              설정으로 이동하기 →
            </button>
          </div>
        )}

        {/* Upload Success Alert */}
        {uploadSuccess && (
          <div className="bg-[#E3FCEF] border border-[#B3F5D3] rounded-[16px] p-4 flex items-center gap-3 text-xs text-[#006644]">
            <CheckCircle2 className="w-5 h-5 stroke-[2.5] text-[#00875A] shrink-0" />
            <div>
              <span className="font-bold block text-[#050038]">업로드 완료!</span>
              <p className="text-[#5F5C7A]">{uploadMessage}</p>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoadingSummary ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <RefreshCw className="w-6 h-6 text-[#050038] animate-spin" />
            <p className="text-xs font-bold text-[#050038]">
              오늘 업무 기록을 객관적으로 분석 및 요약 중입니다...
            </p>
          </div>
        ) : !hasSufficientData ? (
          /* Insufficient Data Notice */
          <div className="rounded-[16px] p-8 text-center bg-[#F9F9FB] border border-dashed border-[#E5E5ED] space-y-2">
            <AlertCircle className="w-7 h-7 text-[#5F5C7A] mx-auto" />
            <h4 className="text-sm font-bold text-[#050038]">분석할 데이터가 부족합니다.</h4>
            <p className="text-xs text-[#5F5C7A] max-w-sm mx-auto">
              오늘 기록된 업무가 없어 요약을 생성할 수 없습니다. 오늘의 업무를 등록하고 완료 체크를 진행해 보세요.
            </p>
          </div>
        ) : (
          summary && (
            <div className="space-y-5">
              {/* 「오늘의 업무 요약」 영역 (Miro Sticky Note Yellow Tint Card) */}
              <div className="bg-[#FFF8D6] border border-[#F5E59C] rounded-[18px] p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#6B5B00]" />
                  <span className="text-xs font-bold text-[#6B5B00] uppercase tracking-wider">
                    오늘의 업무 요약
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-[10px] border border-[#F5E59C]">
                    <span className="text-[11px] text-[#5F5C7A] block">날짜</span>
                    <span className="font-bold text-[#050038] tnum">{summary.date}</span>
                  </div>
                  <div className="bg-white p-3 rounded-[10px] border border-[#F5E59C]">
                    <span className="text-[11px] text-[#5F5C7A] block">총 업무</span>
                    <span className="font-bold text-[#050038] tnum">{summary.totalTasks}건</span>
                  </div>
                  <div className="bg-white p-3 rounded-[10px] border border-[#F5E59C]">
                    <span className="text-[11px] text-[#5F5C7A] block">완료</span>
                    <span className="font-bold text-[#00875A] tnum">{summary.completedTasks}건</span>
                  </div>
                  <div className="bg-white p-3 rounded-[10px] border border-[#F5E59C]">
                    <span className="text-[11px] text-[#5F5C7A] block">미완료</span>
                    <span className="font-bold text-[#8E280D] tnum">{summary.incompleteTasks}건</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs pt-1 text-[#050038]">
                  <div>
                    <span className="font-bold mr-2">주요 프로젝트:</span>
                    <span className="text-[#5F5C7A]">
                      {summary.projectSummary.length > 0
                        ? summary.projectSummary.join(', ')
                        : '기본 프로젝트'}
                    </span>
                  </div>

                  <div>
                    <span className="font-bold mr-2">오늘 가장 많이 진행한 업무:</span>
                    <span className="text-[#5F5C7A] font-normal">{summary.mainWork}</span>
                  </div>

                  <div>
                    <span className="font-bold mr-2">미완료 업무:</span>
                    <span className="text-[#5F5C7A]">{summary.unfinishedWork}</span>
                  </div>

                  <div>
                    <span className="font-bold mr-2">내일 우선 처리:</span>
                    <span className="text-[#4262FF] font-bold">{summary.nextDayPriority}</span>
                  </div>
                </div>
              </div>

              {/* Table Preview: | 날짜 | 프로젝트 | 업무 내용 | 예상 시간 | 완료 여부 | 주요 메모 | 마감일 | */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#050038]">기록될 업무 목록 ({tasks.length}개 행)</span>
                  <span className="text-[#5F5C7A]">시트명: {sheetsSettings.sheetName}</span>
                </div>

                <div className="overflow-x-auto rounded-[12px] border border-[#E5E5ED] max-h-48 text-[11px]">
                  <table className="min-w-full divide-y divide-[#E5E5ED] bg-white">
                    <thead className="bg-[#F9F9FB] text-[#050038] font-bold sticky top-0">
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
                      {tasks.map((t) => (
                        <tr key={t.id}>
                          <td className="px-3 py-1.5 whitespace-nowrap tnum">{t.date || todayStr}</td>
                          <td className="px-3 py-1.5 whitespace-nowrap">{t.project || '미지정'}</td>
                          <td className="px-3 py-1.5 font-medium text-[#050038]">{t.title}</td>
                          <td className="px-3 py-1.5 whitespace-nowrap tnum">{t.estimatedMinutes}분</td>
                          <td className="px-3 py-1.5 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                t.isCompleted
                                  ? 'bg-[#E3FCEF] text-[#006644]'
                                  : 'bg-[#F4F4F7] text-[#5F5C7A] border border-[#E5E5ED]'
                              }`}
                            >
                              {t.isCompleted ? '완료' : '미완료'}
                            </span>
                          </td>
                          <td className="px-3 py-1.5 truncate max-w-[120px]">{t.memo || '-'}</td>
                          <td className="px-3 py-1.5 whitespace-nowrap tnum">{t.deadline || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#E5E5ED] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="miro-btn-secondary text-xs py-2 px-4"
          >
            닫기
          </button>

          <button
            type="button"
            disabled={!sheetsSettings.isConnected || tasks.length === 0 || isUploading}
            onClick={handleUploadToSheets}
            className="miro-btn-primary text-xs py-2.5 px-5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Google Sheets에 기록 중...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Google Sheets에 기록 및 업로드</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
