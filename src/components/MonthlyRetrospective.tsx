import React, { useState, useEffect, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';
import {
  BarChart3,
  Sparkles,
  Repeat,
  Folder,
  Clock,
  AlertTriangle,
  AlertCircle,
  Lightbulb,
  Trophy,
} from 'lucide-react';
import { Task, MonthlyRetrospectiveResult } from '../types';

interface MonthlyRetrospectiveProps {
  tasks: Task[];
}

const MIRO_CHART_COLORS = [
  '#4262FF', // Miro Royal Blue
  '#050038', // Miro Dark Navy
  '#FFD02F', // Miro Canary Yellow
  '#00875A', // Miro Green
  '#BF2600', // Miro Coral Red
  '#8C52FF', // Miro Purple
  '#00A3BF', // Miro Teal
];

export const MonthlyRetrospective: React.FC<MonthlyRetrospectiveProps> = ({ tasks }) => {
  const [aiResult, setAiResult] = useState<MonthlyRetrospectiveResult | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const currentMonthName = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
  }, []);

  // Filter tasks for current month
  const monthTasks = useMemo(() => {
    const currentPrefix = new Date().toISOString().slice(0, 7); // YYYY-MM
    return tasks.filter((t) => (t.date || t.createdAt || '').startsWith(currentPrefix));
  }, [tasks]);

  // ① 이번 달 수행한 업무 - Distribution calculation by Project
  const projectDistribution = useMemo(() => {
    const map: Record<string, { count: number; totalMinutes: number }> = {};
    monthTasks.forEach((t) => {
      const proj = t.project || '기타 업무';
      if (!map[proj]) {
        map[proj] = { count: 0, totalMinutes: 0 };
      }
      map[proj].count += 1;
      map[proj].totalMinutes += Number(t.estimatedMinutes) || 0;
    });

    const totalTasks = monthTasks.length || 1;
    const list = Object.entries(map).map(([name, data]) => ({
      name,
      count: data.count,
      totalMinutes: data.totalMinutes,
      percentage: Math.round((data.count / totalTasks) * 100),
    }));

    return list.sort((a, b) => b.count - a.count);
  }, [monthTasks]);

  // Total time spent across the month
  const totalMonthMinutes = useMemo(() => {
    return monthTasks.reduce((sum, t) => sum + (Number(t.estimatedMinutes) || 0), 0);
  }, [monthTasks]);

  const formatMinutes = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}시간 ${m}분`;
    if (h > 0) return `${h}시간`;
    return `${mins}분`;
  };

  // ② 주요 프로젝트 정리
  const topProjects = useMemo(() => {
    const map: Record<string, { total: number; completed: number; minutes: number }> = {};
    monthTasks.forEach((t) => {
      const proj = t.project || '기타';
      if (!map[proj]) {
        map[proj] = { total: 0, completed: 0, minutes: 0 };
      }
      map[proj].total += 1;
      if (t.isCompleted) {
        map[proj].completed += 1;
      }
      map[proj].minutes += Number(t.estimatedMinutes) || 0;
    });

    return Object.entries(map)
      .map(([name, data]) => ({
        name,
        total: data.total,
        completed: data.completed,
        minutes: data.minutes,
        completionRate: Math.round((data.completed / data.total) * 100),
      }))
      .sort((a, b) => b.total - a.total);
  }, [monthTasks]);

  // ③ 반복적으로 수행한 업무
  const recurringTasks = useMemo(() => {
    const titleMap: Record<string, { count: number; totalMinutes: number; projects: Set<string> }> = {};
    monthTasks.forEach((t) => {
      const trimmed = t.title.trim();
      let key = trimmed;
      if (trimmed.includes('자료 조사') || trimmed.includes('레퍼런스')) key = '레퍼런스 및 자료 조사';
      else if (trimmed.includes('도면') || trimmed.includes('수정')) key = '도면 및 컴포넌트 수정';
      else if (trimmed.includes('회의') || trimmed.includes('정리')) key = '회의 자료 정리 및 공유';

      if (!titleMap[key]) {
        titleMap[key] = { count: 0, totalMinutes: 0, projects: new Set() };
      }
      titleMap[key].count += 1;
      titleMap[key].totalMinutes += Number(t.estimatedMinutes) || 0;
      if (t.project) titleMap[key].projects.add(t.project);
    });

    return Object.entries(titleMap)
      .filter(([_, data]) => data.count >= 2)
      .map(([name, data]) => ({
        name,
        count: data.count,
        totalMinutes: data.totalMinutes,
        projects: Array.from(data.projects),
      }))
      .sort((a, b) => b.count - a.count);
  }, [monthTasks]);

  // 가장 많이 한 업무 TOP 3
  const topThreeTasks = useMemo(() => {
    const taskGrouping: Record<string, { count: number; totalMinutes: number; projects: Set<string> }> = {};

    monthTasks.forEach((t) => {
      const title = t.title.trim();
      if (!title) return;

      if (!taskGrouping[title]) {
        taskGrouping[title] = { count: 0, totalMinutes: 0, projects: new Set() };
      }
      taskGrouping[title].count += 1;
      taskGrouping[title].totalMinutes += Number(t.estimatedMinutes) || 0;
      if (t.project) taskGrouping[title].projects.add(t.project);
    });

    const list = Object.entries(taskGrouping).map(([title, data]) => ({
      title,
      count: data.count,
      totalMinutes: data.totalMinutes,
      projects: Array.from(data.projects),
    }));

    list.sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return b.totalMinutes - a.totalMinutes;
    });

    return list.slice(0, 3);
  }, [monthTasks]);

  const hasSufficientTopData = useMemo(() => {
    return monthTasks.length >= 3 && topThreeTasks.length > 0;
  }, [monthTasks.length, topThreeTasks.length]);

  // ④ AI 월간 개선 포인트 요청
  const fetchMonthlyImprovements = async () => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/ai/monthly-retrospective', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: monthTasks,
          monthName: currentMonthName,
        }),
      });

      if (!res.ok) {
        throw new Error('회고 분석 요청 실패');
      }

      const data: MonthlyRetrospectiveResult = await res.json();
      setAiResult(data);
    } catch (e) {
      console.error(e);
      if (monthTasks.length < 3) {
        setAiResult({
          hasSufficientData: false,
          improvements: ['분석할 데이터가 부족합니다.'],
          positiveHighlights: ['업무를 더 등록하면 맞춤형 개선점을 제안해 드립니다.'],
        });
      } else {
        setAiResult({
          hasSufficientData: true,
          improvements: [
            '2시간 이상 소요되는 대형 업무의 경우 30분 단위 세부 태스크로 분할하여 계획하면 진행률 관리가 훨씬 수월합니다.',
            '마감일이 지정되지 않은 업무의 완료율이 상대적으로 낮으므로, 대략적인 완료 목표 일시를 기재해 보세요.',
          ],
          positiveHighlights: [`이번 달 총 ${monthTasks.filter((t) => t.isCompleted).length}건의 업무를 완료했습니다.`],
        });
      }
    } finally {
      setIsLoadingAi(false);
    }
  };

  useEffect(() => {
    fetchMonthlyImprovements();
  }, [monthTasks.length]);

  return (
    <div id="view-monthly-retrospective" className="space-y-6 max-w-5xl mx-auto animate-in fade-in">
      {/* Title Header: Miro Dark Band (#050038) */}
      <div className="bg-[#050038] rounded-[24px] sm:rounded-[28px] p-6 sm:p-7 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 miro-shadow-card">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-[#FFD02F] text-[#050038] flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#FFD02F]">
                RETROSPECTIVE · 월간 분석
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
              {currentMonthName} 업무 회고
            </h2>
            <p className="text-xs text-[#A5A2B8] mt-0.5">
              한 달 동안 내가 어떤 일을 했는지 한눈에 파악하고 업무 패턴을 점검합니다.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/10 px-4 py-2.5 rounded-full border border-white/15 self-start sm:self-auto">
          <div className="text-right">
            <span className="text-[10px] text-[#A5A2B8] uppercase tracking-wider block">누적 업무</span>
            <span className="text-sm font-bold text-white tnum">{monthTasks.length}건</span>
          </div>
          <div className="h-6 w-px bg-white/20" />
          <div>
            <span className="text-[10px] text-[#A5A2B8] uppercase tracking-wider block">총 소요 시간</span>
            <span className="text-sm font-bold text-[#FFD02F] tnum">{formatMinutes(totalMonthMinutes)}</span>
          </div>
        </div>
      </div>

      {/* 가장 많이 한 업무 TOP 3 섹션 */}
      <section
        id="section-top3-tasks"
        className="bg-white rounded-[20px] p-6 sm:p-7 border border-[#E5E5ED] miro-shadow-card"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#050038] text-white flex items-center justify-center shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#5F5C7A]">
                  TOP 3 TASKS
                </span>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FFF8D6] text-[#6B5B00] border border-[#F5E59C]">
                  월간 최다 빈도
                </span>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-[#050038] mt-0.5">
                가장 많이 한 업무 TOP 3
              </h3>
            </div>
          </div>

          {hasSufficientTopData && (
            <span className="text-xs text-[#5F5C7A] self-start sm:self-auto">
              기준: 수행 횟수 및 누적 시간
            </span>
          )}
        </div>

        {hasSufficientTopData ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topThreeTasks.map((item, index) => {
              const rankLabels = ['01', '02', '03'];
              const maxMinutes = topThreeTasks[0]?.totalMinutes || 1;
              const timePercent = Math.min(100, Math.round((item.totalMinutes / maxMinutes) * 100));

              return (
                <div
                  key={item.title}
                  className="rounded-[16px] p-5 border border-[#E5E5ED] bg-[#F9F9FB] flex flex-col justify-between miro-shadow-subtle"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="w-6 h-6 rounded-full bg-[#050038] text-white text-xs font-bold flex items-center justify-center tnum">
                        {rankLabels[index]}
                      </span>
                      {item.projects.length > 0 && (
                        <span className="text-[11px] text-[#4262FF] bg-[#F0EDFF] px-2.5 py-0.5 rounded-full border border-[#D5CCFF] truncate max-w-[140px] font-semibold">
                          {item.projects[0]}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-[#050038] line-clamp-2 min-h-[2.5rem] leading-snug">
                      {item.title}
                    </h4>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E5E5ED] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#5F5C7A] flex items-center gap-1">
                        <Repeat className="w-3.5 h-3.5 text-[#4262FF]" />
                        수행 횟수
                      </span>
                      <span className="font-bold text-[#4262FF] tnum">{item.count}회</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#5F5C7A] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#4262FF]" />
                        총 소요 시간
                      </span>
                      <span className="font-bold text-[#050038] tnum">
                        {formatMinutes(item.totalMinutes)}
                      </span>
                    </div>

                    {/* Progress indicator */}
                    <div className="w-full h-1.5 bg-[#E5E5ED] rounded-full overflow-hidden mt-2">
                      <div
                        className="h-full bg-[#050038] rounded-full"
                        style={{ width: `${timePercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-10 text-center bg-[#F9F9FB] rounded-[16px] border border-dashed border-[#E5E5ED] flex flex-col items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-white text-[#5F5C7A] flex items-center justify-center mb-2 border border-[#E5E5ED]">
              <AlertCircle className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-[#050038]">데이터가 부족합니다</h4>
            <p className="text-xs text-[#5F5C7A] mt-1 max-w-sm leading-relaxed">
              지난 한 달 동안 수행한 업무 기록이 충분하지 않아 TOP 3를 집계할 수 없습니다. (업무 3건 이상 등록 시 분석됩니다)
            </p>
          </div>
        )}
      </section>

      {/* Grid: ① 이번 달 수행한 업무 (차트/분포도) & ② 주요 프로젝트 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ① 이번 달 수행한 업무 - 분포도 / 차트 */}
        <div className="lg:col-span-5 bg-white rounded-[20px] p-6 border border-[#E5E5ED] miro-shadow-card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#5F5C7A] font-bold block">
                01 · RATIO
              </span>
              <h3 className="text-base font-bold text-[#050038]">이번 달 수행한 업무 분포</h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F0EDFF] text-[#4262FF] border border-[#D5CCFF] tnum">
              총 {monthTasks.length}건
            </span>
          </div>

          {monthTasks.length > 0 ? (
            <div className="flex-1 flex flex-col justify-between">
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={projectDistribution}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {projectDistribution.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={MIRO_CHART_COLORS[index % MIRO_CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value: any, name: any, item: any) => [
                        `${value}건 (${item.payload.percentage}%) · ${formatMinutes(item.payload.totalMinutes)}`,
                        name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Distribution Table / Legend */}
              <div className="space-y-2 mt-2 pt-3 border-t border-[#E5E5ED]">
                {projectDistribution.map((item, idx) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: MIRO_CHART_COLORS[idx % MIRO_CHART_COLORS.length] }}
                      />
                      <span className="font-medium text-[#050038] truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-[#5F5C7A] tnum">
                      <span>{formatMinutes(item.totalMinutes)}</span>
                      <strong className="text-[#050038] w-10 text-right font-bold">{item.percentage}%</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-[#5F5C7A]">
              이번 달 기록된 업무가 없습니다.
            </div>
          )}
        </div>

        {/* ② 주요 프로젝트 */}
        <div className="lg:col-span-7 bg-white rounded-[20px] p-6 border border-[#E5E5ED] miro-shadow-card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#5F5C7A] font-bold block">
                02 · PROJECTS
              </span>
              <h3 className="text-base font-bold text-[#050038]">주요 프로젝트 달성도</h3>
            </div>
            <span className="text-xs text-[#5F5C7A] font-medium tnum">{topProjects.length}개 프로젝트</span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {topProjects.map((p) => (
              <div
                key={p.name}
                className="bg-[#F9F9FB] rounded-[16px] p-4 border border-[#E5E5ED] transition-all hover:border-[#C9C7D6]"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-white border border-[#E5E5ED] text-[#050038] flex items-center justify-center shadow-xs">
                      <Folder className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#050038]">{p.name}</h4>
                      <p className="text-xs text-[#5F5C7A]">
                        총 {p.total}건 중 {p.completed}건 완료
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold text-[#050038] tnum">{p.completionRate}%</span>
                    <span className="text-xs text-[#5F5C7A] block tnum">{formatMinutes(p.minutes)}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-[#E5E5ED] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#050038] rounded-full transition-all duration-300"
                    style={{ width: `${p.completionRate}%` }}
                  />
                </div>
              </div>
            ))}

            {topProjects.length === 0 && (
              <div className="py-12 text-center text-xs text-[#5F5C7A]">
                프로젝트 데이터가 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: ③ 반복적으로 수행한 업무 & ④ 부족하거나 보완해야 할 부분 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ③ 반복적으로 수행한 업무 */}
        <div className="lg:col-span-5 bg-white rounded-[20px] p-6 border border-[#E5E5ED] miro-shadow-card">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#050038] text-white flex items-center justify-center shrink-0">
              <Repeat className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#5F5C7A] font-bold block">
                03 · PATTERNS
              </span>
              <h3 className="text-base font-bold text-[#050038]">반복 수행 업무</h3>
            </div>
          </div>

          <div className="space-y-2.5">
            {recurringTasks.map((item) => (
              <div
                key={item.name}
                className="bg-[#F9F9FB] rounded-[16px] p-4 border border-[#E5E5ED] flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-xs font-bold text-[#050038]">{item.name}</h4>
                  <p className="text-[11px] text-[#5F5C7A] mt-0.5">
                    {item.projects.join(', ') || '일반 업무'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-block text-[11px] font-semibold text-[#4262FF] bg-[#F0EDFF] px-2.5 py-0.5 rounded-full border border-[#D5CCFF] tnum">
                    월 {item.count}회
                  </span>
                  <span className="text-[11px] text-[#5F5C7A] block mt-0.5 tnum">
                    {formatMinutes(item.totalMinutes)}
                  </span>
                </div>
              </div>
            ))}

            {recurringTasks.length === 0 && (
              <div className="py-8 text-center text-xs text-[#5F5C7A] bg-[#F9F9FB] rounded-[16px] border border-dashed border-[#E5E5ED]">
                2회 이상 반복 수행된 업무가 아직 감지되지 않았습니다.
              </div>
            )}
          </div>
        </div>

        {/* ④ 부족하거나 보완해야 할 부분 (AI 월간 개선 포인트) */}
        <div className="lg:col-span-7 bg-white rounded-[20px] p-6 border border-[#E5E5ED] miro-shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#FFD02F] text-[#050038] flex items-center justify-center shrink-0">
                <Lightbulb className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#5F5C7A] font-bold block">
                  04 · INSIGHTS
                </span>
                <h3 className="text-base font-bold text-[#050038]">개선 포인트 분석</h3>
              </div>
            </div>

            <button
              type="button"
              onClick={fetchMonthlyImprovements}
              disabled={isLoadingAi}
              className="miro-btn-secondary text-xs py-1.5 px-3.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#050038]" />
              <span>{isLoadingAi ? '분석 중...' : '다시 분석'}</span>
            </button>
          </div>

          {isLoadingAi ? (
            <div className="py-8 text-center space-y-2">
              <div className="w-6 h-6 border-2 border-[#050038]/30 border-t-[#050038] rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[#5F5C7A]">업무 기록을 분석하여 개선점을 계산하고 있습니다...</p>
            </div>
          ) : aiResult ? (
            <div className="space-y-3">
              {!aiResult.hasSufficientData || aiResult.improvements.includes('분석할 데이터가 부족합니다.') ? (
                <div className="bg-[#F9F9FB] border border-[#E5E5ED] rounded-[16px] p-5 text-center">
                  <AlertTriangle className="w-6 h-6 text-[#6B5B00] mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-[#050038]">분석할 데이터가 부족합니다</h4>
                  <p className="text-xs text-[#5F5C7A] mt-1 leading-relaxed">
                    업무 기록이 3건 이상 누적되면, 마감 직전 집중도나 예상 시간 오차 등을 객관적으로 분석하여 개인 맞춤 개선점을 제공합니다.
                  </p>
                </div>
              ) : (
                <>
                  {aiResult.positiveHighlights && aiResult.positiveHighlights.length > 0 && (
                    <div className="bg-[#FFF8D6] border border-[#F5E59C] rounded-[16px] p-4 text-[#6B5B00]">
                      <span className="text-[10px] font-bold text-[#6B5B00] uppercase tracking-wider block mb-1">
                        이번 달 긍정적 성과
                      </span>
                      {aiResult.positiveHighlights.map((hl, i) => (
                        <p key={i} className="text-xs text-[#050038] leading-relaxed font-medium">
                          ✓ {hl}
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    <span className="text-[10px] uppercase tracking-wider text-[#5F5C7A] font-bold block">
                      다음 달을 위한 실행 제안:
                    </span>
                    {aiResult.improvements.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-[#F9F9FB] border border-[#E5E5ED] rounded-[14px] p-4 flex items-start gap-2.5 text-xs text-[#050038]"
                      >
                        <span className="w-5 h-5 rounded-full bg-[#050038] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 tnum">
                          {idx + 1}
                        </span>
                        <p className="leading-relaxed font-medium">{item}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[#5F5C7A]">
              [다시 분석] 버튼을 눌러 회고를 생성하세요.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
