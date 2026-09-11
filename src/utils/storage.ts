import { Task, Schedule, CallLog } from '../types';
import { createInitialTasks, createInitialSchedules, createInitialCallLogs } from '../data/initialData';

const TASKS_KEY = 'oneul_eopmu_tasks_v1';
const SCHEDULES_KEY = 'oneul_eopmu_schedules_v1';
const CALL_LOGS_KEY = 'oneul_eopmu_calls_v1';

export function loadTasks(): Task[] {
  try {
    const saved = localStorage.getItem(TASKS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load tasks from localStorage', e);
  }
  const initial = createInitialTasks();
  saveTasks(initial);
  return initial;
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks to localStorage', e);
  }
}

export function loadSchedules(): Schedule[] {
  try {
    const saved = localStorage.getItem(SCHEDULES_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load schedules from localStorage', e);
  }
  const initial = createInitialSchedules();
  saveSchedules(initial);
  return initial;
}

export function saveSchedules(schedules: Schedule[]): void {
  try {
    localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
  } catch (e) {
    console.error('Failed to save schedules to localStorage', e);
  }
}

export function loadCallLogs(): CallLog[] {
  try {
    const saved = localStorage.getItem(CALL_LOGS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load call logs from localStorage', e);
  }
  const initial = createInitialCallLogs();
  saveCallLogs(initial);
  return initial;
}

export function saveCallLogs(logs: CallLog[]): void {
  try {
    localStorage.setItem(CALL_LOGS_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save call logs to localStorage', e);
  }
}

export function resetAllData(): { tasks: Task[]; schedules: Schedule[]; callLogs: CallLog[] } {
  localStorage.removeItem(TASKS_KEY);
  localStorage.removeItem(SCHEDULES_KEY);
  localStorage.removeItem(CALL_LOGS_KEY);
  const tasks = createInitialTasks();
  const schedules = createInitialSchedules();
  const callLogs = createInitialCallLogs();
  saveTasks(tasks);
  saveSchedules(schedules);
  saveCallLogs(callLogs);
  return { tasks, schedules, callLogs };
}
