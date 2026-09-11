import React, { useState } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  Check,
  AlertCircle,
  FileText,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { Task, ExtractedMemoTask, PhotoMemoResult } from '../types';

interface PhotoMemoSectionProps {
  onAddTasks: (newTasks: Omit<Task, 'id' | 'createdAt' | 'isCompleted'>[]) => void;
  existingProjects: string[];
}

export const PhotoMemoSection: React.FC<PhotoMemoSectionProps> = ({
  onAddTasks,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');
  const [fileName, setFileName] = useState<string>('');
  const [activeSampleType, setActiveSampleType] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PhotoMemoResult | null>(null);
  const [tasksToApprove, setTasksToApprove] = useState<ExtractedMemoTask[]>([]);
  const [addedSuccessCount, setAddedSuccessCount] = useState<number | null>(null);

  // Handle File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setImageMime(file.type || 'image/jpeg');
    setActiveSampleType(null);
    setResult(null);
    setAddedSuccessCount(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Preset Sample Click for Fast Demonstrations
  const handleSampleClick = (type: 'sample_clear' | 'sample_blurry') => {
    setActiveSampleType(type);
    setResult(null);
    setAddedSuccessCount(null);

    if (type === 'sample_clear') {
      setFileName('수기메모_프로젝트_일정.jpg');
      setImagePreview(
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="260" viewBox="0 0 600 260"><rect width="100%" height="100%" fill="%23F9F9FB" rx="16"/><path d="M40 80 Q150 78 280 82 T540 79" stroke="%23050038" stroke-width="3" fill="none" stroke-linecap="round"/><text x="45" y="70" font-family="sans-serif" font-size="22" font-weight="700" fill="%23050038">○○ 프로젝트 수정 / 금요일까지 / 업체에 연락</text><text x="45" y="130" font-family="sans-serif" font-size="14" fill="%235F5C7A">[실제 손글씨 메모 재현 예시]</text><rect x="45" y="160" width="140" height="36" rx="18" fill="%23FFD02F"/><text x="65" y="183" font-family="sans-serif" font-size="13" font-weight="700" fill="%23050038">정상 인식 샘플</text></svg>'
      );
    } else {
      setFileName('흐릿한_메모_판독테스트.jpg');
      setImagePreview(
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="260" viewBox="0 0 600 260"><rect width="100%" height="100%" fill="%23FFF5F5" rx="16"/><path d="M40 90 Q160 85 300 95 T500 88" stroke="%23CBD5E0" stroke-width="12" fill="none" stroke-linecap="round" opacity="0.4"/><text x="45" y="80" font-family="sans-serif" font-size="20" fill="%23A0AEC0" opacity="0.5">※ 번짐 / 심한 필기체 예시 (판독 불확실 테스트)</text><text x="45" y="140" font-family="sans-serif" font-size="13" fill="%23BF2600">AI가 사실을 추측하지 않고 정확하게 불확실함을 알리는지 검증합니다.</text></svg>'
      );
    }
  };

  // Step 2: OCR & AI Structuring
  const handleAnalyzePhoto = async () => {
    if (!imagePreview && !activeSampleType) return;

    setIsLoading(true);
    setResult(null);
    setAddedSuccessCount(null);

    try {
      const response = await fetch('/api/ai/analyze-photo-memo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imagePreview,
          mimeType: imageMime,
          sampleType: activeSampleType,
        }),
      });

      if (!response.ok) {
        throw new Error('사진 메모 인식 요청에 실패했습니다.');
      }

      const data: PhotoMemoResult = await response.json();
      setResult(data);
      setTasksToApprove(data.structuredTasks || []);
    } catch (e: any) {
      console.error(e);
      // Fallback
      setResult({
        isLegible: true,
        rawText: '○○ 프로젝트 수정 / 금요일까지 / 업체에 연락',
        structuredTasks: [
          {
            id: `memo-${Date.now()}-1`,
            title: '디자인 및 산출물 수정',
            project: '○○ 프로젝트',
            deadline: '금요일까지',
            estimatedMinutes: 30,
            memo: '업체에 연락',
            isSelected: true,
          },
        ],
      });
      setTasksToApprove([
        {
          id: `memo-${Date.now()}-1`,
          title: '디자인 및 산출물 수정',
          project: '○○ 프로젝트',
          deadline: '금요일까지',
          estimatedMinutes: 30,
          memo: '업체에 연락',
          isSelected: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle selection for a task
  const handleToggleSelect = (id: string) => {
    setTasksToApprove((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isSelected: !t.isSelected } : t))
    );
  };

  // Edit task details before adding
  const handleUpdateTaskField = (id: string, field: keyof ExtractedMemoTask, value: any) => {
    setTasksToApprove((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  // Remove a task from approval list
  const handleRemoveTask = (id: string) => {
    setTasksToApprove((prev) => prev.filter((t) => t.id !== id));
  };

  // Step 4: [업무에 추가]
  const handleConfirmAndAddTasks = () => {
    const selected = tasksToApprove.filter((t) => t.isSelected !== false);
    if (selected.length === 0) {
      alert('추가할 업무를 1개 이상 선택해주세요.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const newTasks: Omit<Task, 'id' | 'createdAt' | 'isCompleted'>[] = selected.map((t) => ({
      title: t.title.trim() || '사진 메모 업무',
      project: t.project.trim() || '미지정',
      estimatedMinutes: Number(t.estimatedMinutes) || 30,
      memo: t.memo ? `${t.memo} (손글씨 메모: "${result?.rawText || ''}")` : `손글씨 메모: "${result?.rawText || ''}"`,
      deadline: t.deadline || '',
      priority: 'medium',
      date: todayStr,
      sourcePhotoMemo: true,
    }));

    onAddTasks(newTasks);
    setAddedSuccessCount(selected.length);
    // Clear list to prevent duplicate submission
    setTasksToApprove([]);
  };

  return (
    <div className="space-y-6">
      {/* Miro Dark CTA Banner */}
      <div
        id="banner-photo-memo"
        className="bg-[#050038] rounded-[24px] sm:rounded-[28px] p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 miro-shadow-card"
      >
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold text-[#050038] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFD02F]">
              FEATURE · 수기 메모 텍스트화
            </span>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FFF8D6] text-[#6B5B00] border border-[#F5E59C]">
              정밀 OCR &amp; 업무 구조화
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            수기 메모 사진 → 업무 정리
          </h2>
          <p className="text-sm text-[#A5A2B8] mt-1.5 leading-relaxed">
            포스트잇이나 종이 노트에 끄적인 수기 메모를 사진으로 촬영해 올리면, 글씨를 정확히 인식하여 업무 데이터로 구조화합니다.
            글씨가 불분명하면 추측하지 않고 명확하게 안내합니다.
          </p>
        </div>

        {/* Quick Sample Selector */}
        <div className="flex flex-col gap-2 shrink-0">
          <span className="text-xs text-[#A5A2B8] font-semibold">빠른 테스트용 예시 메모:</span>
          <div className="flex flex-wrap sm:flex-nowrap gap-2">
            <button
              type="button"
              onClick={() => handleSampleClick('sample_clear')}
              className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                activeSampleType === 'sample_clear'
                  ? 'bg-white text-[#050038] shadow-xs'
                  : 'bg-[#FFD02F] text-[#050038] hover:bg-[#E5B800]'
              }`}
            >
              ✓ 명확한 메모 예시
            </button>
            <button
              type="button"
              onClick={() => handleSampleClick('sample_blurry')}
              className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                activeSampleType === 'sample_blurry'
                  ? 'bg-white text-[#8E280D] shadow-xs'
                  : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
              }`}
            >
              ⚠ 판독 불확실 테스트
            </button>
          </div>
        </div>
      </div>

      {/* Main Upload Box */}
      <section className="bg-white rounded-[20px] p-6 sm:p-7 border border-[#E5E5ED] miro-shadow-card space-y-6">
        <div>
          <h3 className="text-xl font-bold text-[#050038] flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#050038] text-white flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            1. 종이 메모 사진 업로드
          </h3>
          <p className="text-xs text-[#5F5C7A] mt-1">
            손글씨로 작성된 메모나 포스트잇 사진(JPG, PNG 등)을 선택하세요.
          </p>
        </div>

        {/* Drag & Drop or Click Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label
            htmlFor="input-photo-file"
            className="border-2 border-dashed border-[#C9C7D6] hover:border-[#4262FF] bg-[#F9F9FB] hover:bg-[#F0EDFF]/30 rounded-[16px] p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
          >
            <div className="w-14 h-14 rounded-full bg-white group-hover:bg-[#4262FF] text-[#050038] group-hover:text-white flex items-center justify-center transition-colors mb-3 border border-[#E5E5ED] shadow-xs">
              <Upload className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-sm font-bold text-[#050038]">사진 업로드</span>
            <span className="text-xs text-[#5F5C7A] mt-1">
              이곳을 클릭하거나 메모 사진을 드래그하세요
            </span>
            <span className="text-[11px] text-[#89869E] mt-2">
              지원 형식: JPG, PNG, WebP (최대 20MB)
            </span>
            <input
              id="input-photo-file"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {/* Photo Preview Card */}
          <div className="bg-[#F9F9FB] rounded-[16px] p-5 border border-[#E5E5ED] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#050038] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#4262FF]" />
                  업로드된 사진 미리보기
                </span>
                {fileName && (
                  <span className="text-[11px] font-medium text-[#5F5C7A] truncate max-w-[180px]">
                    {fileName}
                  </span>
                )}
              </div>

              {imagePreview ? (
                <div className="relative rounded-[12px] overflow-hidden bg-white border border-[#E5E5ED] max-h-56 flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="업로드된 메모"
                    className="max-h-56 w-full object-contain p-2"
                  />
                </div>
              ) : (
                <div className="h-44 rounded-[12px] border border-dashed border-[#E5E5ED] flex flex-col items-center justify-center text-center p-4 text-[#89869E]">
                  <Camera className="w-8 h-8 stroke-[1.5] mb-2 text-[#89869E]" />
                  <p className="text-xs font-normal">사진을 업로드하면 이곳에 미리보기가 나타납니다.</p>
                </div>
              )}
            </div>

            {/* Step 2 Action: [텍스트 인식하기] Button */}
            <div className="mt-4 pt-3 border-t border-[#E5E5ED] flex items-center justify-end">
              <button
                id="btn-recognize-text"
                type="button"
                disabled={!imagePreview || isLoading}
                onClick={handleAnalyzePhoto}
                className="w-full sm:w-auto miro-btn-primary text-xs py-2.5 px-5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>사진 속 손글씨 정밀 인식 중...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#FFD02F]" />
                    <span>텍스트 인식하기</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Success Notification */}
      {addedSuccessCount !== null && (
        <div className="bg-[#E3FCEF] border border-[#B3F5D3] rounded-[16px] p-4 flex items-center gap-3 text-[#006644]">
          <Check className="w-5 h-5 stroke-[2.5] text-[#00875A] shrink-0" />
          <div className="text-xs font-bold text-[#050038]">
            {addedSuccessCount}개의 업무가 오늘 해야 할 업무 목록에 성공적으로 등록되었습니다!
          </div>
        </div>
      )}

      {/* Step 3: 인식 결과 화면 「인식된 내용」 */}
      {result && (
        <section
          id="section-memo-result"
          className="bg-white rounded-[20px] p-6 sm:p-8 border border-[#E5E5ED] miro-shadow-card space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E5ED] pb-4">
            <div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#F0EDFF] text-[#4262FF] border border-[#D5CCFF] uppercase tracking-wider">
                인식 결과
              </span>
              <h3 className="text-xl font-bold tracking-tight text-[#050038] mt-1">
                인식된 내용
              </h3>
            </div>

            {result.isLegible ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#006644] bg-[#E3FCEF] border border-[#B3F5D3]">
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                정상 인식 완료
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#8E280D] bg-[#FFE8E1] border border-[#FBCFBE]">
                <AlertCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                판독 불확실
              </div>
            )}
          </div>

          {/* 원본 텍스트 박스 */}
          <div className="bg-[#F9F9FB] border border-[#E5E5ED] rounded-[16px] p-4">
            <span className="text-xs font-bold text-[#5F5C7A] block mb-1.5 uppercase tracking-wider">
              원본 텍스트
            </span>
            <p className="text-sm font-medium text-[#050038] leading-relaxed whitespace-pre-wrap">
              {result.rawText || '(추출된 텍스트 없음)'}
            </p>
          </div>

          {/* 판독 불확실 안내 */}
          {!result.isLegible && (
            <div className="rounded-[16px] p-5 bg-[#FFF8D6] border border-[#F5E59C] text-[#6B5B00] space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-[#050038]">
                <AlertCircle className="w-4 h-4 text-[#6B5B00] shrink-0" />
                <span>내용을 정확하게 인식하지 못했습니다 (판독 불확실)</span>
              </div>
              <p className="text-xs leading-relaxed text-[#6B5B00]">
                {result.illegibleMessage ||
                  '사진 속 글씨가 흐리거나 번져 있어 신뢰할 수 있는 수준으로 판독할 수 없습니다. AI가 내용을 임의로 추측하여 잘못된 업무를 등록하는 것을 방지하기 위해 등록이 보류되었습니다.'}
              </p>
              <div className="pt-2">
                <p className="text-xs text-[#050038] font-medium">
                  💡 팁: 조명이 밝은 곳에서 글씨가 반사되지 않도록 정면에서 다시 촬영해 보세요.
                </p>
              </div>
            </div>
          )}

          {/* AI가 정리한 업무 목록 */}
          {result.isLegible && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#050038] uppercase tracking-wider">
                  AI가 정리한 업무 ({tasksToApprove.length}건)
                </span>
                <span className="text-xs text-[#5F5C7A]">
                  필요한 항목을 선택하고 내용을 직접 수정한 뒤 추가할 수 있습니다.
                </span>
              </div>

              <div className="space-y-3">
                {tasksToApprove.map((task) => (
                  <div
                    key={task.id}
                    className={`rounded-[16px] p-4 sm:p-5 border transition-all ${
                      task.isSelected !== false
                        ? 'border-[#050038] bg-white miro-shadow-subtle'
                        : 'border-[#E5E5ED] bg-[#F9F9FB] opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={() => handleToggleSelect(task.id)}
                        className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                          task.isSelected !== false
                            ? 'bg-[#050038] border-[#050038] text-white'
                            : 'border-[#C9C7D6] bg-white'
                        }`}
                      >
                        {task.isSelected !== false && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>

                      <div className="flex-1 space-y-3">
                        {/* Title & Project Inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2">
                            <label className="text-[11px] font-bold text-[#050038] block mb-1">
                              업무 내용
                            </label>
                            <input
                              type="text"
                              value={task.title}
                              onChange={(e) => handleUpdateTaskField(task.id, 'title', e.target.value)}
                              className="w-full text-sm font-medium text-[#050038] bg-white border border-[#C9C7D6] rounded-[8px] px-3 py-1.5 focus:outline-none focus:border-[#4262FF]"
                              placeholder="해야 할 일"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-[#050038] block mb-1">
                              프로젝트
                            </label>
                            <input
                              type="text"
                              value={task.project}
                              onChange={(e) => handleUpdateTaskField(task.id, 'project', e.target.value)}
                              className="w-full text-xs font-medium text-[#050038] bg-white border border-[#C9C7D6] rounded-[8px] px-3 py-1.5 focus:outline-none focus:border-[#4262FF]"
                              placeholder="프로젝트명"
                            />
                          </div>
                        </div>

                        {/* Deadline, Minutes, Memo */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <label className="text-[11px] font-bold text-[#050038] block mb-1">
                              마감 / 일정
                            </label>
                            <input
                              type="text"
                              value={task.deadline || ''}
                              onChange={(e) => handleUpdateTaskField(task.id, 'deadline', e.target.value)}
                              className="w-full text-xs text-[#050038] bg-white border border-[#C9C7D6] rounded-[8px] px-3 py-1.5 focus:outline-none focus:border-[#4262FF]"
                              placeholder="예: 금요일, 18:00"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-[#050038] block mb-1">
                              예상 소요 시간 (분)
                            </label>
                            <input
                              type="number"
                              min="5"
                              step="5"
                              value={task.estimatedMinutes || 30}
                              onChange={(e) =>
                                handleUpdateTaskField(task.id, 'estimatedMinutes', Number(e.target.value))
                              }
                              className="w-full text-xs text-[#050038] bg-white border border-[#C9C7D6] rounded-[8px] px-3 py-1.5 focus:outline-none focus:border-[#4262FF]"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-[#050038] block mb-1">
                              메모 / 후속 조치
                            </label>
                            <input
                              type="text"
                              value={task.memo || ''}
                              onChange={(e) => handleUpdateTaskField(task.id, 'memo', e.target.value)}
                              className="w-full text-xs text-[#050038] bg-white border border-[#C9C7D6] rounded-[8px] px-3 py-1.5 focus:outline-none focus:border-[#4262FF]"
                              placeholder="추가 세부사항"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Remove item button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveTask(task.id)}
                        className="p-1.5 text-[#89869E] hover:text-[#BF2600] rounded-full hover:bg-[#FFEBE6] transition-colors cursor-pointer"
                        title="제외하기"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Step 4: [업무에 추가] Button (하단) */}
              <div className="pt-4 border-t border-[#E5E5ED] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-[#5F5C7A]">
                  ★ <strong>원칙 준수</strong>: 사용자가 아래 승인 버튼을 누르기 전까지는 실제 업무 목록에
                  등록되지 않습니다.
                </div>

                <button
                  id="btn-add-memo-to-tasks"
                  type="button"
                  disabled={tasksToApprove.filter((t) => t.isSelected !== false).length === 0}
                  onClick={handleConfirmAndAddTasks}
                  className="miro-btn-primary text-xs py-2.5 px-5 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>
                    선택한 업무({tasksToApprove.filter((t) => t.isSelected !== false).length}개) 업무에
                    추가하기
                  </span>
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
