import { Task, Schedule, CallLog } from '../types';

export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDateOffset(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createInitialTasks(): Task[] {
  const today = getTodayString();
  const yesterday = getDateOffset(-1);
  const twoDaysAgo = getDateOffset(-2);
  const fiveDaysAgo = getDateOffset(-5);
  const eightDaysAgo = getDateOffset(-8);

  return [
    // Today's tasks (MAIN)
    {
      id: 'task-1',
      title: '신규 고객사 제안서 최종 검토 및 발송',
      estimatedMinutes: 60,
      memo: '경쟁사 대비 차별점 슬라이드(p.12) 수치 보정 확인 필수',
      project: '프로젝트 A (알파)',
      deadline: `${today} 16:00`,
      isCompleted: false,
      priority: 'high',
      createdAt: `${today}T08:30:00Z`,
      date: today,
    },
    {
      id: 'task-2',
      title: '주간 업무 회의 자료 정리 및 공유',
      estimatedMinutes: 45,
      memo: '지난주 부서별 실적 달성률 취합 후 노션에 업로드',
      project: '운영 및 문서',
      deadline: `${today} 14:00`,
      isCompleted: true,
      priority: 'medium',
      completedAt: `${today}T11:20:00Z`,
      createdAt: `${today}T08:45:00Z`,
      date: today,
    },
    {
      id: 'task-3',
      title: '디자인 시스템 컴포넌트 도면 수정',
      estimatedMinutes: 90,
      memo: '모바일 뷰포트 여백 16px 패딩 기준 반영',
      project: '프로젝트 B (베타)',
      deadline: `${today} 18:00`,
      isCompleted: false,
      priority: 'high',
      createdAt: `${today}T09:00:00Z`,
      date: today,
    },
    {
      id: 'task-4',
      title: '경쟁사 신규 기능 레퍼런스 조사',
      estimatedMinutes: 30,
      memo: '해외 3개 서비스 온보딩 플로우 스크린샷 수집',
      project: '기획 및 리서치',
      deadline: `${today} 19:00`,
      isCompleted: false,
      priority: 'low',
      createdAt: `${today}T09:15:00Z`,
      date: today,
    },
    {
      id: 'task-5',
      title: '경비 정산 영수증 업로드',
      estimatedMinutes: 15,
      memo: '법인카드 9월 1주차 사용 내역 승인 요청',
      project: '운영 및 문서',
      deadline: `${today} 18:30`,
      isCompleted: true,
      priority: 'low',
      completedAt: `${today}T10:00:00Z`,
      createdAt: `${today}T09:30:00Z`,
      date: today,
    },

    // Month's historical tasks for rich Monthly Retrospective
    {
      id: 'task-hist-1',
      title: '경쟁사 신규 기능 레퍼런스 조사',
      estimatedMinutes: 45,
      memo: 'UI/UX 트렌드 리포트 작성',
      project: '기획 및 리서치',
      deadline: yesterday,
      isCompleted: true,
      priority: 'medium',
      completedAt: `${yesterday}T15:00:00Z`,
      createdAt: `${yesterday}T10:00:00Z`,
      date: yesterday,
    },
    {
      id: 'task-hist-2',
      title: '디자인 시스템 컴포넌트 도면 수정',
      estimatedMinutes: 120,
      memo: '버튼 및 다이얼로그 컴포넌트 1차 피드백 수정',
      project: '프로젝트 B (베타)',
      deadline: yesterday,
      isCompleted: true,
      priority: 'high',
      completedAt: `${yesterday}T17:30:00Z`,
      createdAt: `${yesterday}T09:00:00Z`,
      date: yesterday,
    },
    {
      id: 'task-hist-3',
      title: '주간 업무 회의 자료 정리',
      estimatedMinutes: 40,
      memo: '9월 1주차 부서 회의록 정리',
      project: '운영 및 문서',
      deadline: fiveDaysAgo,
      isCompleted: true,
      priority: 'medium',
      completedAt: `${fiveDaysAgo}T14:00:00Z`,
      createdAt: `${fiveDaysAgo}T09:00:00Z`,
      date: fiveDaysAgo,
    },
    {
      id: 'task-hist-4',
      title: '알파 프로젝트 1차 기획안 작성',
      estimatedMinutes: 150,
      memo: '사업부 요구사항 정의서 초안 완료',
      project: '프로젝트 A (알파)',
      deadline: fiveDaysAgo,
      isCompleted: true,
      priority: 'high',
      completedAt: `${fiveDaysAgo}T18:00:00Z`,
      createdAt: `${fiveDaysAgo}T10:00:00Z`,
      date: fiveDaysAgo,
    },
    {
      id: 'task-hist-5',
      title: '경쟁사 신규 기능 레퍼런스 조사',
      estimatedMinutes: 60,
      memo: '벤치마킹 분석 보고서 작성',
      project: '기획 및 리서치',
      deadline: eightDaysAgo,
      isCompleted: true,
      priority: 'medium',
      completedAt: `${eightDaysAgo}T16:00:00Z`,
      createdAt: `${eightDaysAgo}T09:00:00Z`,
      date: eightDaysAgo,
    },
    {
      id: 'task-hist-6',
      title: '디자인 시스템 컴포넌트 도면 수정',
      estimatedMinutes: 80,
      memo: '헤더 및 네비게이션 가이드라인 수정',
      project: '프로젝트 B (베타)',
      deadline: eightDaysAgo,
      isCompleted: true,
      priority: 'medium',
      completedAt: `${eightDaysAgo}T17:00:00Z`,
      createdAt: `${eightDaysAgo}T11:00:00Z`,
      date: eightDaysAgo,
    },
  ];
}

export function createInitialSchedules(): Schedule[] {
  const today = getTodayString();
  const tomorrow = getDateOffset(1);
  const inThreeDays = getDateOffset(3);

  return [
    {
      id: 'sched-1',
      title: '알파 프로젝트 주간 싱크 미팅',
      date: today,
      time: '15:00',
      project: '프로젝트 A (알파)',
      isConfirmed: false,
      createdAt: `${today}T08:00:00Z`,
      memo: '온라인 구글 미팅 (발표 순서 2번째)',
    },
    {
      id: 'sched-2',
      title: '베타 프로젝트 2차 스프린트 마감일',
      date: tomorrow,
      time: '18:00',
      project: '프로젝트 B (베타)',
      isConfirmed: false,
      createdAt: `${today}T08:00:00Z`,
      memo: 'QA 테스트 전 빌드 파일 전달 완료할 것',
    },
    {
      id: 'sched-3',
      title: '고객사 정기 피드백 세션',
      date: inThreeDays,
      time: '11:00',
      project: '프로젝트 A (알파)',
      isConfirmed: true,
      confirmedAt: `${today}T09:00:00Z`,
      createdAt: `${today}T08:00:00Z`,
      memo: '회의실 B에서 대면 진행',
    },
  ];
}

export function createInitialCallLogs(): CallLog[] {
  const today = getTodayString();
  const tomorrow = getDateOffset(1);

  return [
    {
      id: 'call-1',
      callerName: '김태호 팀장 (마케팅팀)',
      date: today,
      time: '10:30',
      rawText: '다음 주 신규 캠페인 랜딩페이지 텍스트 검토 부탁드립니다. 특히 이벤트 혜택 안내 문구가 법무팀 검토 기준에 맞는지 확인해 주시고, 내일 오후 3시까지 수정본 공유 부탁드립니다.',
      keySummary: '신규 마케팅 캠페인 랜딩페이지 혜택 문구 법무 검토 및 수정본 전달 요청 통화입니다.',
      counterpartRequests: [
        '이벤트 혜택 안내 문구 법무 기준 검토',
        '내일 오후 3시까지 수정본 메일 공유',
      ],
      followUpTasks: [
        {
          title: '마케팅 캠페인 문구 법무 검토 및 피드백 수정',
          estimatedMinutes: 40,
          memo: '김태호 팀장 요청 (내일 15시까지)',
          project: '운영 및 문서',
          deadline: `${tomorrow} 15:00`,
        },
      ],
      importantDates: [
        {
          title: '캠페인 문구 수정본 전달 마감',
          date: tomorrow,
          time: '15:00',
          project: '운영 및 문서',
        },
      ],
      createdAt: `${today}T10:35:00Z`,
    },
  ];
}

export const initialTasks = createInitialTasks();
export const initialSchedules = createInitialSchedules();
export const initialCallLogs = createInitialCallLogs();

export function resetAllData() {
  const tasks = createInitialTasks();
  const schedules = createInitialSchedules();
  const callLogs = createInitialCallLogs();
  try {
    localStorage.removeItem('todaywork_tasks');
    localStorage.removeItem('todaywork_schedules');
    localStorage.removeItem('todaywork_calls');
  } catch (e) {
    console.error(e);
  }
  return { tasks, schedules, callLogs };
}

