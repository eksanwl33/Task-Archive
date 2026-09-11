import React, { useState, useRef } from 'react';
import {
  PhoneCall,
  Upload,
  Mic,
  MicOff,
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Plus,
  FileAudio,
  Trash2,
  Check,
  AlertCircle,
} from 'lucide-react';
import { CallLog, ExtractedFollowUp, ExtractedDate, Task, Schedule } from '../types';
import { getTodayString } from '../data/initialData';

interface CallLogSectionProps {
  callLogs: CallLog[];
  onAddCallLog: (log: CallLog) => void;
  onDeleteCallLog: (id: string) => void;
  onAddFollowUpAsTask: (task: Omit<Task, 'id' | 'createdAt' | 'isCompleted'>) => void;
  onAddDateAsSchedule: (schedule: Omit<Schedule, 'id' | 'createdAt' | 'isConfirmed'>) => void;
}

export const CallLogSection: React.FC<CallLogSectionProps> = ({
  callLogs,
  onAddCallLog,
  onDeleteCallLog,
  onAddFollowUpAsTask,
  onAddDateAsSchedule,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'audio'>('text');
  const [callerName, setCallerName] = useState('');
  const [textInput, setTextInput] = useState('');
  const [audioFile, setAudioFile] = useState<{ file: File; base64: string; name: string } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Added state to track which items were pushed to tasks or schedules
  const [addedTasksMap, setAddedTasksMap] = useState<Record<string, boolean>>({});
  const [addedSchedulesMap, setAddedSchedulesMap] = useState<Record<string, boolean>>({});

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);

  // Handle Audio File Selection / Drag & Drop
  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|m4a|aac|ogg|webm)$/i)) {
      setErrorMsg('지원되는 오디오 형식(MP3, WAV, M4A, WebM 등)을 선택해 주세요.');
      return;
    }
    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setAudioFile({ file, base64, name: file.name });
    };
    reader.readAsDataURL(file);
  };

  // Start Mic Recording
  const startRecording = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          setAudioFile({
            file: new File([audioBlob], `녹음_${new Date().toISOString().slice(0, 10)}.webm`, { type: 'audio/webm' }),
            base64,
            name: `녹음_${new Date().toLocaleTimeString('ko-KR')}.webm`,
          });
        };
        reader.readAsDataURL(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone error:', err);
      setErrorMsg('마이크 접근 권한이 필요하거나 사용 가능한 마이크를 찾을 수 없습니다.');
    }
  };

  // Stop Mic Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  // Run AI Analysis
  const handleAnalyzeCall = async () => {
    setErrorMsg(null);
    if (activeTab === 'text' && !textInput.trim()) {
      setErrorMsg('통화 메모 내용을 입력해 주세요.');
      return;
    }
    if (activeTab === 'audio' && !audioFile) {
      setErrorMsg('음성 파일을 업로드하거나 마이크로 녹음해 주세요.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/ai/analyze-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerName: callerName.trim() || '통화 상대방',
          inputType: activeTab,
          textInput: textInput.trim(),
          audioBase64: audioFile?.base64,
          audioFileName: audioFile?.name,
        }),
      });

      if (!response.ok) {
        throw new Error('통화 분석에 실패했습니다.');
      }

      const newLog: CallLog = await response.json();
      onAddCallLog(newLog);

      // Reset form
      setTextInput('');
      setCallerName('');
      setAudioFile(null);
    } catch (err: any) {
      console.error('Analyze error:', err);
      // Fallback local creation
      const fallbackLog: CallLog = {
        id: `call-${Date.now()}`,
        callerName: callerName.trim() || '고객사 담당자',
        date: getTodayString(),
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        hasAudio: activeTab === 'audio',
        rawText: textInput || '음성 녹음 통화',
        keySummary: '고객사 요청사항 확인 및 일정 협의 내용',
        counterpartRequests: ['수정본 메일 발송'],
        createdAt: new Date().toISOString(),
        followUpTasks: [
          {
            title: `${callerName.trim() || '상대방'} 요청 수정본 전달`,
            estimatedMinutes: 30,
            priority: 'medium',
            project: '프로젝트 일반',
            memo: '',
            deadline: '',
          },
        ],
        importantDates: [
          {
            title: `${callerName.trim() || '상대방'} 후속 미팅`,
            date: getTodayString(),
            time: '16:00',
            project: '통화 미팅',
          },
        ],
      };
      onAddCallLog(fallbackLog);
      setTextInput('');
      setCallerName('');
      setAudioFile(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Add FollowUp item to Today's Tasks
  const handlePushTask = (item: ExtractedFollowUp, logId: string, idx: number) => {
    onAddFollowUpAsTask({
      title: item.title,
      project: item.project || '고객사',
      estimatedMinutes: item.estimatedMinutes || 30,
      memo: `[통화 기록 연계] ${item.deadline ? `마감: ${item.deadline}` : ''}`,
      priority: item.priority || 'medium',
      deadline: item.deadline || '',
      date: getTodayString(),
      sourceCallLogId: logId,
    });
    setAddedTasksMap((prev) => ({ ...prev, [`${logId}-task-${idx}`]: true }));
  };

  // Add Important Date item to Timeline
  const handlePushSchedule = (item: ExtractedDate, logId: string, idx: number) => {
    onAddDateAsSchedule({
      title: item.title,
      date: item.date,
      time: item.time || '14:00',
      project: '통화 일정',
      memo: '통화 분석에서 자동 추출된 중요 약속',
      sourceCallLogId: logId,
    });
    setAddedSchedulesMap((prev) => ({ ...prev, [`${logId}-schedule-${idx}`]: true }));
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  return (
    <div className="space-y-6">
      {/* Miro Dark CTA Banner */}
      <div
        id="banner-calls-teaser"
        className="bg-[#050038] rounded-[24px] sm:rounded-[28px] p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 miro-shadow-card"
      >
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#FFD02F] text-[#050038] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              SUB FEATURE · 보조 기능
            </span>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FFF8D6] text-[#6B5B00] border border-[#F5E59C]">
              별도 영역 유지
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            전화 기록 및 통화 내용 자동 정리
          </h2>
          <p className="text-sm text-[#A5A2B8] mt-1.5 leading-relaxed">
            통화 중 끄적인 메모나 음성 녹음본을 바탕으로 핵심 요약, 후속 할 일, 중요 약속 일정을 추출합니다.
            추출된 항목은 클릭 한 번으로 오늘의 업무 또는 타임라인에 등록할 수 있습니다.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="w-12 h-12 rounded-full bg-[#FFD02F] text-[#050038] flex items-center justify-center">
            <PhoneCall className="w-6 h-6 stroke-[2.2]" />
          </div>
        </div>
      </div>

      {/* Input Box: Text or Voice Audio */}
      <div className="bg-white rounded-[20px] p-6 sm:p-7 border border-[#E5E5ED] miro-shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E5ED] pb-4 mb-5">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-[#050038]">새 통화 내용 등록</h3>
            <p className="text-xs text-[#5F5C7A] mt-0.5">
              통화 상대방 정보와 내용을 입력하거나 음성 녹음 파일을 올려주세요.
            </p>
          </div>

          {/* Tab Selector: Pill */}
          <div className="flex items-center gap-1 bg-[#F9F9FB] p-1 rounded-full border border-[#E5E5ED]">
            <button
              id="tab-call-text"
              type="button"
              onClick={() => setActiveTab('text')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'text'
                  ? 'bg-[#050038] text-white shadow-xs'
                  : 'text-[#5F5C7A] hover:text-[#050038]'
              }`}
            >
              텍스트 메모
            </button>
            <button
              id="tab-call-audio"
              type="button"
              onClick={() => setActiveTab('audio')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'audio'
                  ? 'bg-[#050038] text-white shadow-xs'
                  : 'text-[#5F5C7A] hover:text-[#050038]'
              }`}
            >
              음성 녹음 파일
            </button>
          </div>
        </div>

        {/* Caller Name Input */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-[#050038] mb-1.5">
            통화 상대방 (이름 / 소속)
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-[#89869E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-caller-name"
              type="text"
              value={callerName}
              onChange={(e) => setCallerName(e.target.value)}
              placeholder="예: 김상무님 (알파기업), 박팀장 (마케팅팀)"
              className="w-full text-xs pl-9 pr-3 py-2 rounded-[8px] border border-[#C9C7D6] bg-white text-[#050038] focus:outline-none focus:border-[#4262FF]"
            />
          </div>
        </div>

        {/* Tab 1: Text Memo Input */}
        {activeTab === 'text' && (
          <div>
            <label className="block text-xs font-bold text-[#050038] mb-1.5">
              통화 메모 내용
            </label>
            <textarea
              id="textarea-call-notes"
              rows={4}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="통화하며 메모한 내용을 자유롭게 적어주세요. (예: 견적서 할인 요청하심. 금요일 오후 3시까지 수정본 메일 발송하기로 함. 다음 주 화요일 10시 미팅 재확인)"
              className="w-full text-xs p-3.5 rounded-[12px] border border-[#C9C7D6] bg-white text-[#050038] focus:outline-none focus:border-[#4262FF] leading-relaxed"
            />
          </div>
        )}

        {/* Tab 2: Audio File Upload or Mic Recording */}
        {activeTab === 'audio' && (
          <div className="space-y-4">
            {/* Drag & Drop File Area */}
            <div
              className="border-2 border-dashed border-[#C9C7D6] hover:border-[#4262FF] rounded-[16px] p-6 text-center bg-[#F9F9FB] transition-colors"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileChange(e.dataTransfer.files[0]);
                }
              }}
            >
              <FileAudio className="w-8 h-8 text-[#4262FF] mx-auto mb-2 stroke-[1.5]" />
              <p className="text-xs font-bold text-[#050038]">
                통화 녹음 파일을 이곳에 드래그하거나 선택하세요
              </p>
              <p className="text-[11px] text-[#5F5C7A] mt-1">
                MP3, WAV, M4A, WebM 파일 지원 (최대 25MB)
              </p>

              <label className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-[#050038] bg-white border border-[#C9C7D6] hover:border-[#050038] cursor-pointer transition-colors shadow-xs">
                <Upload className="w-3.5 h-3.5" />
                <span>파일 찾기</span>
                <input
                  id="input-audio-upload"
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.webm"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                />
              </label>

              {audioFile && (
                <div className="mt-3 inline-flex items-center gap-2 bg-[#050038] text-white px-3.5 py-1.5 rounded-full text-xs font-medium">
                  <Check className="w-3.5 h-3.5 text-[#FFD02F]" />
                  <span>선택된 파일: {audioFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setAudioFile(null)}
                    className="text-white/70 hover:text-white ml-1 text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Direct Microphone Recording */}
            <div className="bg-[#F9F9FB] rounded-[16px] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border border-[#E5E5ED]">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isRecording ? 'bg-[#BF2600] text-white animate-pulse' : 'bg-white text-[#050038] border border-[#E5E5ED]'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#050038]">브라우저 실시간 음성 녹음</h4>
                  <p className="text-[11px] text-[#5F5C7A] tnum">
                    {isRecording ? `녹음 진행 중 (${formatSeconds(recordingSeconds)})` : '마이크로 통화 내용을 직접 음성으로 녹음'}
                  </p>
                </div>
              </div>

              <div>
                {!isRecording ? (
                  <button
                    id="btn-start-recording"
                    type="button"
                    onClick={startRecording}
                    className="miro-btn-secondary text-xs py-1.5 px-4"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>녹음 시작</span>
                  </button>
                ) : (
                  <button
                    id="btn-stop-recording"
                    type="button"
                    onClick={stopRecording}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#BF2600] hover:bg-[#9E2000] rounded-full shadow-xs transition-colors cursor-pointer tnum"
                  >
                    <MicOff className="w-3.5 h-3.5" />
                    <span>녹음 완료 ({formatSeconds(recordingSeconds)})</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-[#8E280D] bg-[#FFE8E1] px-3.5 py-2 rounded-[8px] border border-[#FBCFBE]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Button: Analyze Call */}
        <div className="mt-5 flex justify-end">
          <button
            id="btn-analyze-call"
            type="button"
            disabled={isAnalyzing}
            onClick={handleAnalyzeCall}
            className="miro-btn-primary text-xs py-2 px-5 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FFD02F]" />
            <span>{isAnalyzing ? 'AI 통화 분석 중...' : '통화 내용 분석 및 정리'}</span>
          </button>
        </div>
      </div>

      {/* Recorded Call Logs List */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-[#5F5C7A] font-bold">
            HISTORY
          </span>
          <span className="text-sm font-bold text-[#050038] tnum">
            최근 통화 분석 기록 ({callLogs.length})
          </span>
        </div>

        {callLogs.map((log) => (
          <div
            key={log.id}
            id={`card-call-${log.id}`}
            className="bg-white rounded-[20px] p-6 border border-[#E5E5ED] miro-shadow-card space-y-4"
          >
            {/* Header info */}
            <div className="flex items-start justify-between gap-3 border-b border-[#E5E5ED] pb-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-bold text-[#050038]">{log.callerName}</span>
                  {log.hasAudio && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#4262FF] bg-[#F0EDFF] px-2.5 py-0.5 rounded-full font-semibold border border-[#D5CCFF]">
                      <FileAudio className="w-3 h-3" />
                      음성 녹음
                    </span>
                  )}
                  <span className="text-xs text-[#5F5C7A] tnum">
                    {log.date} {log.time}
                  </span>
                </div>
                {log.rawText && (
                  <p className="text-xs text-[#5F5C7A] mt-1.5 italic bg-[#F9F9FB] p-3 rounded-[8px] border border-[#E5E5ED]">
                    "{log.rawText}"
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => onDeleteCallLog(log.id)}
                title="기록 삭제"
                className="text-[#89869E] hover:text-[#BF2600] p-1.5 rounded-full hover:bg-[#FFEBE6] transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* ① 통화 핵심 내용 (Miro Sticky Note Yellow Tint Card) */}
            <div className="bg-[#FFF8D6] p-4 rounded-[16px] border border-[#F5E59C]">
              <span className="text-[10px] font-bold text-[#6B5B00] uppercase tracking-wider block mb-1">
                ① 통화 핵심 내용 요약
              </span>
              <p className="text-sm text-[#050038] leading-relaxed font-medium">
                {log.keySummary}
              </p>
            </div>

            {/* ② 추출된 후속 할 일 */}
            {log.followUpTasks && log.followUpTasks.length > 0 && (
              <div className="bg-[#F9F9FB] p-4 rounded-[16px] border border-[#E5E5ED]">
                <span className="text-[10px] font-bold text-[#4262FF] uppercase tracking-wider block mb-2">
                  ② 추출된 후속 할 일 (오늘 업무에 추가 가능)
                </span>
                <div className="space-y-2">
                  {log.followUpTasks.map((item, idx) => {
                    const isAdded = addedTasksMap[`${log.id}-task-${idx}`];
                    return (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white rounded-[10px] border border-[#E5E5ED] text-xs miro-shadow-subtle"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#4262FF] shrink-0" />
                          <span className="font-medium text-[#050038]">{item.title}</span>
                          {item.estimatedMinutes && (
                            <span className="text-[11px] text-[#5F5C7A] bg-[#F4F4F7] px-2 py-0.5 rounded-full border border-[#E5E5ED] tnum">
                              {item.estimatedMinutes}분
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          disabled={isAdded}
                          onClick={() => handlePushTask(item, log.id, idx)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                            isAdded
                              ? 'bg-[#F4F4F7] text-[#89869E] border border-[#E5E5ED] cursor-not-allowed'
                              : 'miro-btn-primary text-xs py-1 px-3'
                          }`}
                        >
                          <Plus className="w-3 h-3" />
                          <span>{isAdded ? '업무 추가됨' : '오늘 할 일로 추가'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ③ 언급된 날짜 및 일정 */}
            {log.importantDates && log.importantDates.length > 0 && (
              <div className="bg-[#F9F9FB] p-4 rounded-[16px] border border-[#E5E5ED]">
                <span className="text-[10px] font-bold text-[#4262FF] uppercase tracking-wider block mb-2">
                  ③ 언급된 날짜 및 미팅 약속 (타임라인에 추가 가능)
                </span>
                <div className="space-y-2">
                  {log.importantDates.map((item, idx) => {
                    const isAdded = addedSchedulesMap[`${log.id}-schedule-${idx}`];
                    return (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white rounded-[10px] border border-[#E5E5ED] text-xs miro-shadow-subtle"
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#4262FF] shrink-0" />
                          <span className="font-medium text-[#050038]">{item.title}</span>
                          <span className="text-[11px] text-[#4262FF] bg-[#F0EDFF] px-2 py-0.5 rounded-full font-semibold border border-[#D5CCFF] tnum">
                            {item.date} {item.time}
                          </span>
                        </div>

                        <button
                          type="button"
                          disabled={isAdded}
                          onClick={() => handlePushSchedule(item, log.id, idx)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                            isAdded
                              ? 'bg-[#F4F4F7] text-[#89869E] border border-[#E5E5ED] cursor-not-allowed'
                              : 'miro-btn-secondary text-xs py-1 px-3'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{isAdded ? '타임라인 추가됨' : '타임라인에 추가'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}

        {callLogs.length === 0 && (
          <div className="p-8 text-center bg-white rounded-[20px] border border-dashed border-[#E5E5ED] text-[#5F5C7A] text-xs">
            기록된 통화 내용이 없습니다. 상단에서 텍스트 메모나 음성 파일을 등록해 보세요.
          </div>
        )}
      </div>
    </div>
  );
};
