/**
 * IronLog Pro - 核心應用程式邏輯 (v5.0 全面重構版)
 * 包含：打勾流水線、雙軌排程模式、部位熱身、現場計算工具箱、SVG動態肌群疲勞、雙軸進度圖、Canvas結算分享卡
 */

// ======================= 1. 預設動作庫與基礎資料 =======================
const DEFAULT_EXERCISES = [
  { id: 'bench-press', name: '平板槓鈴臥推 (Bench Press)', category: '胸部', isCompound: true, pinNote: '握距中指對準刻痕，沉肩收核心' },
  { id: 'incline-db-press', name: '上斜啞鈴臥推 (Incline DB Press)', category: '胸部', isCompound: false, pinNote: '椅背調整至 30 度角' },
  { id: 'dips', name: '雙槓臂屈伸 (Dips)', category: '胸部', isCompound: true, pinNote: '軀幹前傾著重下胸' },
  { id: 'cable-fly', name: '滑輪夾胸 (Cable Fly)', category: '胸部', isCompound: false, pinNote: '滑輪高度調整至肩膀水平' },

  { id: 'squat', name: '槓鈴頸後深蹲 (Back Squat)', category: '腿部', isCompound: true, pinNote: '站距略寬於肩，腳尖朝外30度' },
  { id: 'leg-press', name: '45度仰臥腿推機 (Leg Press)', category: '腿部', isCompound: true, pinNote: '背板貼平，膝蓋不內扣' },
  { id: 'rdl', name: '羅馬尼亞硬舉 (RDL)', category: '腿部', isCompound: true, pinNote: '髖關節後推，背部平直微曲膝' },
  { id: 'leg-extension', name: '坐姿腿屈伸 (Leg Extension)', category: '腿部', isCompound: false, pinNote: '椅背調整至第 3 孔' },

  { id: 'deadlift', name: '傳統硬舉 (Conventional Deadlift)', category: '背部', isCompound: true, pinNote: '槓鈴貼小腿脛骨起槓' },
  { id: 'barbell-row', name: '槓鈴划船 (Barbell Row)', category: '背部', isCompound: true, pinNote: '前傾45度拉向肚臍' },
  { id: 'lat-pulldown', name: '高位滑輪下拉 (Lat Pulldown)', category: '背部', isCompound: true, pinNote: '大腿擋板卡緊，胸口微挺' },
  { id: 'pull-up', name: '引體向上 (Pull-Up)', category: '背部', isCompound: true, pinNote: '肩胛下沉帶動手肘向後下拉' },

  { id: 'ohp', name: '槓鈴站姿肩推 (Overhead Press)', category: '肩部', isCompound: true, pinNote: '收緊核心與臀部，直上直下' },
  { id: 'db-shoulder-press', name: '坐姿啞鈴肩推 (DB Shoulder Press)', category: '肩部', isCompound: true, pinNote: '下沉至耳旁水平' },
  { id: 'lateral-raise', name: '啞鈴側平舉 (Lateral Raise)', category: '肩部', isCompound: false, pinNote: '手肘微彎如倒水' },

  { id: 'bicep-curl', name: '啞鈴/槓鈴彎舉 (Bicep Curl)', category: '手臂', isCompound: false, pinNote: '手肘固定於身體兩側' },
  { id: 'tricep-pushdown', name: '滑輪三頭肌下壓 (Tricep Pushdown)', category: '手臂', isCompound: false, pinNote: '大臂夾緊不晃動' }
];

const DEFAULT_ROUTINES = [
  {
    id: 'push-a',
    name: '推 A (胸・肩・三頭)',
    category: '胸部',
    exercises: [
      { exerciseId: 'bench-press', targetSets: 4, targetReps: 8 },
      { exerciseId: 'incline-db-press', targetSets: 3, targetReps: 10 },
      { exerciseId: 'db-shoulder-press', targetSets: 3, targetReps: 10 },
      { exerciseId: 'lateral-raise', targetSets: 4, targetReps: 12 },
      { exerciseId: 'tricep-pushdown', targetSets: 3, targetReps: 12 }
    ]
  },
  {
    id: 'pull-a',
    name: '拉 A (背・後三角・二頭)',
    category: '背部',
    exercises: [
      { exerciseId: 'deadlift', targetSets: 3, targetReps: 5 },
      { exerciseId: 'lat-pulldown', targetSets: 4, targetReps: 8 },
      { exerciseId: 'barbell-row', targetSets: 3, targetReps: 8 },
      { exerciseId: 'bicep-curl', targetSets: 4, targetReps: 10 }
    ]
  },
  {
    id: 'leg-a',
    name: '腿 A (股四頭・臀腿・膕旁)',
    category: '腿部',
    exercises: [
      { exerciseId: 'squat', targetSets: 4, targetReps: 6 },
      { exerciseId: 'leg-press', targetSets: 3, targetReps: 10 },
      { exerciseId: 'rdl', targetSets: 3, targetReps: 8 },
      { exerciseId: 'leg-extension', targetSets: 3, targetReps: 12 }
    ]
  }
];

const MOBILITY_PROTOCOLS = {
  '胸部': [
    { text: '彈力帶 / 輕啞鈴肩外旋 × 15 次', done: false },
    { text: '胸椎伸展與旋轉放鬆 × 30 秒', done: false }
  ],
  '背部': [
    { text: '單槓被動懸掛 (Dead Hang) × 30 秒', done: false },
    { text: '輕重量面拉 (Face Pull) 活化肩胛 × 15 次', done: false }
  ],
  '腿部': [
    { text: '徒手深蹲底端停頓 3 秒 (活化髖踝) × 8 次', done: false },
    { text: '雙腿臀橋 (激活臀大肌) × 12 次', done: false }
  ],
  '肩部': [
    { text: '胸椎伸展與肩胛滑動 × 30 秒', done: false },
    { text: '輕啞鈴過頭伸展 / YWTL 肩袖啟動 × 12 次', done: false }
  ],
  '全身': [
    { text: '全身動態關節活動度操 × 2 分鐘', done: false },
    { text: '深蹲髖關節活動度伸展 × 8 次', done: false }
  ]
};

// ======================= 2. 本地儲存與全域狀態 =======================
const STORAGE_KEYS = {
  EXERCISES: 'ironlog_v5_exercises',
  ROUTINES: 'ironlog_v5_routines',
  SCHEDULE: 'ironlog_v5_schedule',
  SESSIONS: 'ironlog_v5_sessions',
  BODY_LOGS: 'ironlog_v5_body_logs',
  ACTIVE_WORKOUT: 'ironlog_v5_active_workout'
};

const state = {
  exercises: [],
  routines: [],
  schedule: {
    mode: 'weekly', // 'weekly' | 'cycle'
    weeklySplit: { 1: 'push-a', 2: 'pull-a', 3: null, 4: null, 5: 'leg-a', 6: null, 0: null },
    cycleSteps: ['push-a', 'pull-a', 'leg-a', 'rest'],
    cycleIndex: 0
  },
  sessions: [], // 歷史歸檔訓練 (每次訓練為一筆物件)
  bodyLogs: [
    { date: '2026-10-25', timestamp: 1792915200000, weight: 70.8, bodyFat: 15.2 },
    { date: '2026-11-01', timestamp: 1793520000000, weight: 70.3, bodyFat: 14.8 },
    { date: '2026-11-05', timestamp: 1793865600000, weight: 70.0, bodyFat: 14.5 }
  ],
  activeWorkout: null,
  currentNav: 'tab-workout',

  // 手動計時器
  timer: {
    intervalId: null,
    totalSeconds: 90,
    remainingSeconds: 90,
    isRunning: false,
    isMuted: false
  },

  // 抽屜與臨時狀態
  editingRoutine: null,
  pickerTarget: { mode: 'workout' },
  swapTarget: { exerciseIndex: null, originalExerciseId: null },
  selectedMuscleFilter: null,

  // Chart.js 實例
  chartDual: null
};

// ======================= 3. 音效與震動模組 =======================
class AudioHaptics {
  constructor() {
    this.audioCtx = null;
  }
  init() {
    if (!this.audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.audioCtx = new AC();
    }
  }
  beep(freq = 880, type = 'sine', duration = 0.12) {
    if (state.timer.isMuted) return;
    try {
      this.init();
      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {}
  }
  check() {
    this.beep(880, 'sine', 0.08);
    this.vibrate(25);
  }
  pr() {
    this.beep(523, 'triangle', 0.1);
    setTimeout(() => this.beep(659, 'triangle', 0.1), 90);
    setTimeout(() => this.beep(784, 'triangle', 0.12), 180);
    setTimeout(() => this.beep(1046, 'sine', 0.3), 290);
    this.vibrate([60, 40, 100, 40, 200]);
  }
  timerDone() {
    this.beep(784, 'square', 0.12);
    setTimeout(() => this.beep(880, 'square', 0.12), 150);
    setTimeout(() => this.beep(1046, 'square', 0.3), 300);
    this.vibrate([150, 100, 150, 100, 250]);
  }
  vibrate(pattern = 25) {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
  }
}
const sound = new AudioHaptics();

// ======================= 4. 資料持久化與載入 =======================
function loadState() {
  try {
    const rawEx = localStorage.getItem(STORAGE_KEYS.EXERCISES);
    state.exercises = rawEx ? JSON.parse(rawEx) : [...DEFAULT_EXERCISES];

    const rawRoutines = localStorage.getItem(STORAGE_KEYS.ROUTINES);
    state.routines = rawRoutines ? JSON.parse(rawRoutines) : [...DEFAULT_ROUTINES];

    const rawSchedule = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
    if (rawSchedule) state.schedule = { ...state.schedule, ...JSON.parse(rawSchedule) };

    const rawSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    state.sessions = rawSessions ? JSON.parse(rawSessions) : [];

    const rawBody = localStorage.getItem(STORAGE_KEYS.BODY_LOGS);
    if (rawBody) state.bodyLogs = JSON.parse(rawBody);

    const rawWorkout = localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKOUT);
    if (rawWorkout) {
      state.activeWorkout = JSON.parse(rawWorkout);
    } else {
      // 根據排程判斷今天應練課表
      resolveScheduledWorkoutForToday();
    }
  } catch (e) {
    console.error('Storage load failed', e);
    state.exercises = [...DEFAULT_EXERCISES];
    state.routines = [...DEFAULT_ROUTINES];
    state.sessions = [];
    state.activeWorkout = null;
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(state.exercises));
    localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(state.routines));
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(state.schedule));
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(state.sessions));
    localStorage.setItem(STORAGE_KEYS.BODY_LOGS, JSON.stringify(state.bodyLogs));
    if (state.activeWorkout) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT, JSON.stringify(state.activeWorkout));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
    }
  } catch (e) {
    console.error('Storage save failed', e);
  }
}

// 根據排程自動決定今日課表
function resolveScheduledWorkoutForToday() {
  if (state.schedule.mode === 'weekly') {
    const day = new Date().getDay();
    const routineId = state.schedule.weeklySplit[day];
    if (routineId) {
      loadRoutineIntoActiveWorkout(routineId, false);
    } else {
      state.activeWorkout = null;
    }
  } else if (state.schedule.mode === 'cycle') {
    const currentStep = state.schedule.cycleSteps[state.schedule.cycleIndex % state.schedule.cycleSteps.length];
    if (currentStep && currentStep !== 'rest') {
      loadRoutineIntoActiveWorkout(currentStep, false);
    } else {
      state.activeWorkout = null;
    }
  }
}

// 取得最新體重
function getLatestBodyWeight() {
  if (state.bodyLogs.length === 0) return 70.0;
  const sorted = [...state.bodyLogs].sort((a, b) => b.timestamp - a.timestamp);
  return sorted[0].weight || 70.0;
}

// 根據歷史紀錄找出某動作的「前次完成數據 (Ghost Data)」
function getExerciseGhostData(exerciseId) {
  for (const session of state.sessions) {
    const foundEx = session.exercises.find(e => e.exerciseId === exerciseId);
    if (foundEx) {
      const workingSets = foundEx.sets.filter(s => s.isCompleted && s.setType === 'working');
      if (workingSets.length > 0) {
        return workingSets.reduce((max, cur) => cur.weight > max.weight ? cur : max, workingSets[0]);
      }
    }
  }
  return null;
}

// 將課表範本載入到現場訓練工作表
function loadRoutineIntoActiveWorkout(routineId, overwriteConfirm = true) {
  if (overwriteConfirm && state.activeWorkout && state.activeWorkout.exercises.some(e => e.sets.some(s => s.isCompleted))) {
    if (!confirm('當前訓練已有完成組數，確定要切換並重新載入新課表嗎？')) return;
  }

  const routine = state.routines.find(r => r.id === routineId);
  if (!routine) {
    state.activeWorkout = null;
    saveState();
    renderWorkoutSheet();
    return;
  }

  const mobility = MOBILITY_PROTOCOLS[routine.category] || MOBILITY_PROTOCOLS['全身'];

  state.activeWorkout = {
    routineId: routine.id,
    routineName: routine.name,
    category: routine.category,
    startTime: Date.now(),
    mobilityChecks: mobility.map(m => ({ text: m.text, done: false })),
    exercises: (routine.exercises || []).map(item => {
      const ex = state.exercises.find(e => e.id === item.exerciseId) || { name: '自訂動作', isCompound: false, pinNote: '' };
      const ghost = getExerciseGhostData(item.exerciseId);
      const defaultWeight = ghost ? ghost.weight : 40;
      const defaultReps = ghost ? ghost.reps : (item.targetReps || 8);

      const sets = [];
      const setTotal = item.targetSets || 3;
      for (let i = 0; i < setTotal; i++) {
        sets.push({
          id: 'set-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
          setType: 'working',
          weight: defaultWeight,
          reps: defaultReps,
          rpe: 8,
          isCompleted: false
        });
      }

      return {
        exerciseId: item.exerciseId,
        isDumbbellEachSide: false,
        loadMode: 'normal', // 'normal' | 'bodyweight-plus' | 'bodyweight-minus'
        pinNote: ex.pinNote || '',
        sets
      };
    })
  };

  saveState();
  renderWorkoutSheet();
}

// 公式估算 1RM (Epley + Brzycki 平均)
function calculateE1RM(weight, reps, rpe = 8) {
  if (weight <= 0 || reps <= 0) return 0;
  const rir = Math.max(0, 10 - rpe);
  const effReps = reps + rir;
  const epley = weight * (1 + effReps / 30);
  const brzycki = effReps < 37 ? weight * (36 / (37 - effReps)) : epley;
  return Math.round(((epley + brzycki) / 2) * 10) / 10;
}

function roundTo2_5(val) {
  return Math.max(20, Math.round(val / 2.5) * 2.5);
}

// ======================= 5. UI 渲染：現場訓練工作表 (Workout Sheet) =======================

function renderWorkoutSheet() {
  const statusBadge = document.getElementById('headerWorkoutStatusBadge');
  const progressText = document.getElementById('headerSetsProgressText');
  const mobilityCard = document.getElementById('mobilityWarmupCard');
  const container = document.getElementById('workoutCardsContainer');
  const finishBtn = document.getElementById('finishWorkoutBtn');
  const scheduleModeBadge = document.getElementById('splitModeIndicatorBadge');
  const scheduleLabel = document.getElementById('todayScheduleLabel');
  const activeTitle = document.getElementById('activeRoutineHeaderTitle');

  // 更新排程模式標籤
  scheduleModeBadge.textContent = state.schedule.mode === 'weekly' ? '固定週排程' : '滾動循環模式';
  if (state.schedule.mode === 'weekly') {
    const days = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
    scheduleLabel.textContent = `今天 (${days[new Date().getDay()]})`;
  } else {
    scheduleLabel.textContent = `第 ${(state.schedule.cycleIndex % state.schedule.cycleSteps.length) + 1} 節點`;
  }

  // 情況 A：休息日 (Rest Day)
  if (!state.activeWorkout) {
    statusBadge.textContent = '今日休息日';
    statusBadge.className = 'text-[9px] font-bold px-1.5 py-0.2 rounded bg-iron-800 text-slate-400 border border-iron-700';
    progressText.textContent = '修復生長中';
    activeTitle.textContent = '☕ 今日休息日 (Rest Day)';
    mobilityCard.classList.add('hidden');
    finishBtn.classList.add('opacity-40', 'pointer-events-none');

    // 尋找上次訓練回顧與預排下次課表
    const lastSession = state.sessions.length > 0 ? state.sessions[0] : null;
    let nextRoutineName = '未設定';

    if (state.schedule.mode === 'weekly') {
      const nextDay = (new Date().getDay() + 1) % 7;
      const nextRId = state.schedule.weeklySplit[nextDay];
      const r = state.routines.find(item => item.id === nextRId);
      if (r) nextRoutineName = r.name;
    } else {
      const nextStep = state.schedule.cycleSteps[(state.schedule.cycleIndex + 1) % state.schedule.cycleSteps.length];
      const r = state.routines.find(item => item.id === nextStep);
      if (r) nextRoutineName = r.name;
    }

    container.innerHTML = `
      <div class="bg-iron-900 border border-iron-800 rounded-2xl p-5 space-y-4 shadow-xl text-center">
        <div class="w-12 h-12 rounded-2xl bg-iron-850 border border-iron-750 flex items-center justify-center mx-auto text-accent-amber">
          <i data-lucide="coffee" class="w-6 h-6"></i>
        </div>
        <div class="space-y-1">
          <h3 class="text-base font-extrabold text-white">排定休息日 (Rest Day)</h3>
          <p class="text-xs text-slate-400 max-w-xs mx-auto">肌肉在充分休息中進行超補償生長，今日注重營養與充足睡眠。</p>
        </div>

        <!-- 訓練回顧與下次預告卡片 -->
        <div class="grid grid-cols-2 gap-2 text-left bg-iron-950 p-3 rounded-xl border border-iron-800/80 text-xs">
          <div>
            <span class="text-[10px] text-slate-500 font-bold block">上次訓練回顧</span>
            <strong class="text-slate-200 text-xs block truncate">${lastSession ? lastSession.routineName : '尚無紀錄'}</strong>
            <span class="text-[10px] font-mono text-accent-green">${lastSession ? `${lastSession.totalVolume.toLocaleString()}kg 容量` : '—'}</span>
          </div>
          <div>
            <span class="text-[10px] text-slate-500 font-bold block">預排下次課表</span>
            <strong class="text-slate-200 text-xs block truncate">${nextRoutineName}</strong>
            <span class="text-[10px] text-slate-400 block font-mono">蓄勢待發</span>
          </div>
        </div>

        <!-- 休息日操作按鈕 -->
        <div class="pt-2 flex flex-col sm:flex-row gap-2 justify-center max-w-xs mx-auto">
          <button id="restDayStartNextBtn" class="py-2.5 px-3.5 rounded-xl bg-accent-green hover:bg-emerald-400 text-iron-950 text-xs font-black tap-active flex items-center justify-center gap-1.5 shadow-md shadow-accent-green/20">
            <i data-lucide="play" class="w-3.5 h-3.5 fill-current"></i> 提前開練下次課表
          </button>
          <button id="restDayPickRoutineBtn" class="py-2.5 px-3.5 rounded-xl bg-iron-800 hover:bg-iron-750 text-slate-300 text-xs font-bold tap-active flex items-center justify-center gap-1.5">
            <i data-lucide="shuffle" class="w-3.5 h-3.5"></i> 選擇其他課表
          </button>
        </div>
      </div>
    `;

    document.getElementById('restDayStartNextBtn').addEventListener('click', () => {
      // 提前開練
      let nextRId = null;
      if (state.schedule.mode === 'weekly') {
        const nextDay = (new Date().getDay() + 1) % 7;
        nextRId = state.schedule.weeklySplit[nextDay] || state.routines[0].id;
      } else {
        nextRId = state.schedule.cycleSteps[(state.schedule.cycleIndex + 1) % state.schedule.cycleSteps.length] || state.routines[0].id;
      }
      loadRoutineIntoActiveWorkout(nextRId, false);
      alertToast('已載入課表，全力開練！');
    });

    document.getElementById('restDayPickRoutineBtn').addEventListener('click', () => switchNavTab('tab-routines'));

    if (window.lucide) lucide.createIcons();
    return;
  }

  // 情況 B：課表進行中
  statusBadge.textContent = '課表進行中';
  statusBadge.className = 'text-[9px] font-bold px-1.5 py-0.2 rounded bg-iron-800 text-accent-green border border-iron-700';
  activeTitle.textContent = state.activeWorkout.routineName;
  mobilityCard.classList.remove('hidden');

  // 計算組數進度
  let totalSets = 0;
  let completedSets = 0;
  state.activeWorkout.exercises.forEach(ex => {
    (ex.sets || []).forEach(s => {
      totalSets++;
      if (s.isCompleted) completedSets++;
    });
  });
  const pct = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
  progressText.textContent = `${completedSets} / ${totalSets} 組 (${pct}%)`;

  // 完成按鈕防呆：未完成 1 組時鎖定
  if (completedSets === 0) {
    finishBtn.classList.add('opacity-50');
  } else {
    finishBtn.classList.remove('opacity-50');
  }

  // 渲染動態部位熱身
  renderMobilitySection();

  // 若課表內無動作
  if (!state.activeWorkout.exercises || state.activeWorkout.exercises.length === 0) {
    container.innerHTML = `
      <div class="text-center py-10 bg-iron-900 border border-iron-800 rounded-2xl p-6 space-y-3">
        <i data-lucide="dumbbell" class="w-8 h-8 text-slate-500 mx-auto"></i>
        <h3 class="font-extrabold text-white text-sm">課表內目前無動作</h3>
        <p class="text-xs text-slate-400">點擊下方「＋ 臨時新增動作」加入您今天想做的項目！</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = '';

  state.activeWorkout.exercises.forEach((item, exIdx) => {
    const exObj = state.exercises.find(e => e.id === item.exerciseId) || { name: '自訂動作', isCompound: false };
    const ghost = getExerciseGhostData(item.exerciseId);

    const card = document.createElement('div');
    card.className = 'bg-iron-900 border border-iron-800 rounded-2xl p-4 shadow-xl space-y-3';

    const ghostStr = ghost ? `上次：${ghost.weight}kg × ${ghost.reps} @ RPE ${ghost.rpe}` : '首次訓練';

    card.innerHTML = `
      <!-- 動作標題、負重模式、快捷工具列 -->
      <div class="space-y-1.5 pb-2 border-b border-iron-800/80">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="font-extrabold text-white text-base tracking-tight">${exObj.name}</h3>
            <div class="flex items-center gap-1.5 mt-0.5 text-xs">
              <span class="text-slate-400 font-mono text-[11px]">${ghostStr}</span>
              <!-- 單邊(×2)切換 -->
              <button data-action="toggle-dumbbell" data-ex-index="${exIdx}" class="text-[10px] font-bold px-1.5 py-0.2 rounded transition tap-active ${item.isDumbbellEachSide ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/40' : 'bg-iron-800 text-slate-400'}">
                ${item.isDumbbellEachSide ? '單邊 (×2)' : '總重'}
              </button>
              <!-- 自重負重模式切換 -->
              <select data-action="change-load-mode" data-ex-index="${exIdx}" class="bg-iron-800 border border-iron-700 text-slate-300 text-[10px] rounded px-1 py-0.2 focus:outline-none">
                <option value="normal" ${item.loadMode === 'normal' ? 'selected' : ''}>一般負重</option>
                <option value="bodyweight-plus" ${item.loadMode === 'bodyweight-plus' ? 'selected' : ''}>自重+負重</option>
                <option value="bodyweight-minus" ${item.loadMode === 'bodyweight-minus' ? 'selected' : ''}>自重-輔助</option>
              </select>
            </div>
          </div>

          <!-- 工具按鈕列 -->
          <div class="flex items-center gap-1">
            ${exObj.isCompound ? `
              <button data-action="generate-warmup" data-ex-index="${exIdx}" class="p-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-xs font-bold flex items-center gap-1 tap-active" title="產生熱身組">
                <i data-lucide="flame" class="w-3.5 h-3.5"></i>
                <span class="text-[10px]">熱身</span>
              </button>
            ` : ''}
            <button data-action="swap-today" data-ex-index="${exIdx}" data-ex-id="${item.exerciseId}" class="p-1.5 rounded-lg bg-iron-800 hover:bg-iron-750 text-slate-300 hover:text-accent-blue text-xs flex items-center gap-1 tap-active" title="僅今日臨時替換動作">
              <i data-lucide="arrow-left-right" class="w-3.5 h-3.5 text-accent-blue"></i>
              <span class="text-[10px]">替換</span>
            </button>
            <button data-action="remove-workout-ex" data-ex-index="${exIdx}" class="p-1.5 rounded-lg bg-iron-800 hover:bg-rose-950 text-slate-500 hover:text-rose-400 text-xs tap-active" title="移除此動作">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>

        <!-- 動作常駐固定備註 (Pin Note) -->
        <div class="flex items-center gap-1.5 bg-iron-950/80 px-2.5 py-1 rounded-lg border border-iron-800/80 text-xs">
          <i data-lucide="pin" class="w-3 h-3 text-accent-amber shrink-0"></i>
          <input type="text" value="${item.pinNote || ''}" data-action="edit-pin-note" data-ex-index="${exIdx}" data-ex-id="${item.exerciseId}"
            placeholder="置頂備註 (例: 椅背第3格、握距壓紋、史密斯空槓10kg...)"
            class="w-full bg-transparent text-[11px] text-slate-300 placeholder-slate-600 focus:outline-none">
        </div>
      </div>

      <!-- 流水線表格表頭 -->
      <div class="space-y-1">
        <div class="grid grid-cols-12 text-[10px] font-bold font-mono text-slate-400 px-2 py-0.5">
          <span class="col-span-2">組別</span>
          <span class="col-span-3">前次表現</span>
          <span class="col-span-3 text-center">公斤 (KG)</span>
          <span class="col-span-2 text-center">次數</span>
          <span class="col-span-2 text-center">完成</span>
        </div>

        <div class="space-y-1.5" id="setsContainer-${exIdx}">
          <!-- 組別流水列 -->
        </div>

        <!-- 卡片底部：新增一組按鈕 -->
        <div class="pt-1">
          <button data-action="add-set" data-ex-index="${exIdx}" class="w-full py-2 rounded-xl bg-iron-850 hover:bg-iron-800 border border-dashed border-iron-750 text-xs font-bold text-slate-300 flex items-center justify-center gap-1 tap-active">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> 新增一組
          </button>
        </div>
      </div>
    `;

    container.appendChild(card);

    // 渲染每一組
    const setsBox = card.querySelector(`#setsContainer-${exIdx}`);
    item.sets.forEach((set, setIdx) => {
      const isDone = set.isCompleted;
      const row = document.createElement('div');
      row.className = `p-1.5 rounded-xl border transition ${isDone ? 'bg-iron-950/40 border-iron-850/60 text-slate-500' : 'bg-iron-950 border-iron-800 text-white'}`;

      let typeLabel = `${setIdx + 1}`;
      let typeColor = 'bg-iron-800 text-slate-300';
      if (set.setType === 'warmup') {
        typeLabel = 'W';
        typeColor = 'bg-orange-500/20 text-orange-400 border border-orange-500/40';
      } else if (set.setType === 'drop') {
        typeLabel = 'D';
        typeColor = 'bg-purple-500/20 text-purple-400 border border-purple-500/40';
      } else if (set.setType === 'failure') {
        typeLabel = 'F';
        typeColor = 'bg-rose-500/20 text-rose-400 border border-rose-500/40';
      }

      const ghostDisplay = ghost ? `${ghost.weight}k×${ghost.reps}` : '—';

      row.innerHTML = `
        <div class="grid grid-cols-12 items-center gap-1">
          <!-- 組別類型切換 -->
          <div class="col-span-2 flex items-center gap-1">
            <button data-action="toggle-set-type" data-ex-index="${exIdx}" data-set-index="${setIdx}"
              class="w-7 h-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center ${typeColor} tap-active" title="點擊切換類型">
              ${typeLabel}
            </button>
          </div>

          <!-- 前次表現 Ghost Data (點擊直接帶入該組) -->
          <div class="col-span-3 text-[11px] font-mono text-slate-500 truncate cursor-pointer hover:text-accent-green" data-action="apply-ghost-data" data-ex-index="${exIdx}" data-set-index="${setIdx}" title="點擊一鍵帶入前次數據">
            ${ghostDisplay}
          </div>

          <!-- 重量欄位 -->
          <div class="col-span-3">
            <input type="number" step="0.5" value="${set.weight}" data-field="weight" data-ex-index="${exIdx}" data-set-index="${setIdx}"
              class="w-full bg-iron-900 border border-iron-750 focus:border-accent-green text-center text-sm font-mono font-black py-1.5 rounded-lg text-white ${isDone ? 'opacity-60' : ''}" inputmode="decimal">
          </div>

          <!-- 次數欄位 -->
          <div class="col-span-2">
            <input type="number" step="1" value="${set.reps}" data-field="reps" data-ex-index="${exIdx}" data-set-index="${setIdx}"
              class="w-full bg-iron-900 border border-iron-750 focus:border-accent-green text-center text-sm font-mono font-bold py-1.5 rounded-lg text-white ${isDone ? 'opacity-60' : ''}" inputmode="numeric">
          </div>

          <!-- 打勾完成按鈕 (支援打勾與取消打勾防誤觸) -->
          <div class="col-span-2 flex justify-center">
            <button data-action="toggle-set-complete" data-ex-index="${exIdx}" data-set-index="${setIdx}"
              class="w-8 h-8 rounded-xl font-bold flex items-center justify-center transition tap-active ${isDone ? 'bg-accent-green text-iron-950 shadow-md shadow-accent-green/30 check-pop' : 'bg-iron-800 border border-iron-700 text-slate-400 hover:text-white'}">
              <i data-lucide="check" class="w-4 h-4 stroke-[3]"></i>
            </button>
          </div>
        </div>

        <!-- 現場快填輔助列與當組刪除 (+1.25 / +2.5 / +5 / 複製 / RPE / 刪組) -->
        <div class="flex items-center justify-between pt-1.5 mt-1 border-t border-iron-850/80 text-[10px]">
          <div class="flex items-center gap-1">
            <button data-action="quick-add-weight" data-delta="1.25" data-ex-index="${exIdx}" data-set-index="${setIdx}" class="px-1.5 py-0.5 rounded bg-iron-850 hover:bg-iron-800 text-slate-300 font-mono tap-active">+1.25</button>
            <button data-action="quick-add-weight" data-delta="2.5" data-ex-index="${exIdx}" data-set-index="${setIdx}" class="px-1.5 py-0.5 rounded bg-iron-850 hover:bg-iron-800 text-slate-300 font-mono tap-active">+2.5</button>
            <button data-action="quick-add-weight" data-delta="5" data-ex-index="${exIdx}" data-set-index="${setIdx}" class="px-1.5 py-0.5 rounded bg-iron-850 hover:bg-iron-800 text-slate-300 font-mono tap-active">+5</button>
            ${setIdx > 0 ? `
              <button data-action="copy-last-set" data-ex-index="${exIdx}" data-set-index="${setIdx}" class="px-1.5 py-0.5 rounded bg-iron-800 hover:bg-iron-750 text-accent-green font-mono flex items-center gap-0.5 tap-active" title="複製上一組重量與次數">
                <i data-lucide="copy" class="w-2.5 h-2.5"></i> 同上
              </button>
            ` : ''}
          </div>

          <div class="flex items-center gap-1.5">
            <!-- RPE / RIR 輕量選單 -->
            <select data-field="rpe" data-ex-index="${exIdx}" data-set-index="${setIdx}" class="bg-iron-850 border border-iron-750 text-slate-300 rounded px-1 py-0.5 font-mono text-[10px] focus:outline-none">
              <option value="10" ${set.rpe == 10 ? 'selected' : ''}>RPE 10 (@0)</option>
              <option value="9.5" ${set.rpe == 9.5 ? 'selected' : ''}>RPE 9.5</option>
              <option value="9" ${set.rpe == 9 ? 'selected' : ''}>RPE 9 (@1)</option>
              <option value="8.5" ${set.rpe == 8.5 ? 'selected' : ''}>RPE 8.5</option>
              <option value="8" ${set.rpe == 8 ? 'selected' : ''}>RPE 8 (@2)</option>
              <option value="7.5" ${set.rpe == 7.5 ? 'selected' : ''}>RPE 7.5</option>
              <option value="7" ${set.rpe == 7 ? 'selected' : ''}>RPE 7 (@3)</option>
              <option value="6" ${set.rpe == 6 ? 'selected' : ''}>RPE 6</option>
            </select>
            <!-- 當場直接刪除此組按鈕 -->
            <button data-action="delete-single-set" data-ex-index="${exIdx}" data-set-index="${setIdx}" class="p-1 text-slate-500 hover:text-rose-400 tap-active" title="刪除此組">
              <i data-lucide="trash-2" class="w-3 h-3"></i>
            </button>
          </div>
        </div>
      `;

      setsBox.appendChild(row);
    });
  });

  if (window.lucide) lucide.createIcons();
}

// 渲染部位動態熱身打卡
function renderMobilitySection() {
  const container = document.getElementById('mobilityItemsList');
  const tag = document.getElementById('mobilityCategoryTag');
  tag.textContent = state.activeWorkout.category || '活動度';
  container.innerHTML = '';

  state.activeWorkout.mobilityChecks.forEach((item, idx) => {
    const row = document.createElement('div');
    row.className = `flex items-center justify-between p-2 rounded-xl text-xs transition cursor-pointer tap-active ${item.done ? 'bg-iron-950/40 text-slate-500 line-through' : 'bg-iron-950 text-slate-200'}`;
    row.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="w-4 h-4 rounded-md border flex items-center justify-center ${item.done ? 'bg-orange-500 border-orange-500 text-iron-950' : 'border-iron-700'}">
          ${item.done ? '<i data-lucide="check" class="w-3 h-3 stroke-[3]"></i>' : ''}
        </span>
        <span class="font-medium">${item.text}</span>
      </div>
      <span class="text-[10px] font-mono ${item.done ? 'text-slate-600' : 'text-orange-400'}">${item.done ? '已完成' : '打卡'}</span>
    `;

    row.addEventListener('click', () => {
      item.done = !item.done;
      saveState();
      renderMobilitySection();
      sound.vibrate(20);
    });

    container.appendChild(row);
  });

  if (window.lucide) lucide.createIcons();
}

// 複合大主項一鍵產生階梯熱身組
function generateWarmupSets(exIndex) {
  const item = state.activeWorkout.exercises[exIndex];
  const firstWorking = item.sets.find(s => s.setType === 'working') || item.sets[0];
  const targetWeight = firstWorking ? firstWorking.weight : 60;

  if (targetWeight <= 25) {
    alertToast('目標重量較輕，直接以空槓進行即可。');
    return;
  }

  const w1 = 20; // 空槓 20kg
  const w2 = roundTo2_5(20 + (targetWeight - 20) * 0.50); // 50%
  const w3 = roundTo2_5(20 + (targetWeight - 20) * 0.70); // 70%
  const w4 = roundTo2_5(20 + (targetWeight - 20) * 0.85); // 85%

  const newWarmups = [
    { id: 'w-' + Date.now() + '-1', setType: 'warmup', weight: w1, reps: 10, rpe: 6, isCompleted: false },
    { id: 'w-' + Date.now() + '-2', setType: 'warmup', weight: w2, reps: 5, rpe: 6.5, isCompleted: false },
    { id: 'w-' + Date.now() + '-3', setType: 'warmup', weight: w3, reps: 3, rpe: 7, isCompleted: false }
  ];

  if (targetWeight >= 80) {
    newWarmups.push({
      id: 'w-' + Date.now() + '-4',
      setType: 'warmup',
      weight: w4,
      reps: 1,
      rpe: 7.5,
      isCompleted: false
    });
  }

  const existingWorkings = item.sets.filter(s => s.setType !== 'warmup');
  item.sets = [...newWarmups, ...existingWorkings];

  saveState();
  renderWorkoutSheet();
  alertToast('已自動插入階梯熱身組！');
  sound.vibrate(30);
}

// ======================= 6. UI 渲染：排程模式與課表範本庫 (Schedule & Routines) =======================

function renderRoutinesView() {
  // 切換排程模式按鈕樣式
  document.querySelectorAll('.schedule-mode-btn').forEach(btn => {
    if (btn.getAttribute('data-mode') === state.schedule.mode) {
      btn.className = 'schedule-mode-btn px-2.5 py-1 rounded-md text-[11px] font-bold bg-accent-green text-iron-950';
    } else {
      btn.className = 'schedule-mode-btn px-2.5 py-1 rounded-md text-[11px] font-bold text-slate-400 hover:text-white';
    }
  });

  const weeklyContainer = document.getElementById('weeklySplitContainer');
  const cycleContainer = document.getElementById('cycleSplitContainer');

  if (state.schedule.mode === 'weekly') {
    weeklyContainer.classList.remove('hidden');
    cycleContainer.classList.add('hidden');
    renderWeeklySplitGrid();
  } else {
    weeklyContainer.classList.add('hidden');
    cycleContainer.classList.remove('hidden');
    renderCycleStepsList();
  }

  // 渲染範本清單
  const container = document.getElementById('routinesListContainer');
  const countBadge = document.getElementById('routineCountBadge');
  countBadge.textContent = `${state.routines.length} 套範本`;
  container.innerHTML = '';

  state.routines.forEach(routine => {
    const card = document.createElement('div');
    card.className = 'bg-iron-900 border border-iron-800 rounded-2xl p-4 space-y-3 shadow-md';

    const exListHtml = routine.exercises.map(item => {
      const ex = state.exercises.find(e => e.id === item.exerciseId);
      return `<span class="inline-block px-2 py-0.5 rounded-md bg-iron-950 border border-iron-800 text-[11px] text-slate-300 mr-1.5 mb-1">${ex ? ex.name : '自訂'} <strong class="text-accent-green font-mono">${item.targetSets}組</strong></span>`;
    }).join('');

    card.innerHTML = `
      <div class="flex items-start justify-between">
        <div>
          <h3 class="font-extrabold text-white text-base">${routine.name}</h3>
          <span class="text-[10px] font-bold px-1.5 py-0.2 rounded bg-iron-800 text-accent-green">${routine.category}</span>
        </div>
        <div class="flex items-center gap-1">
          <button data-action="start-routine" data-routine-id="${routine.id}" class="px-3 py-1.5 rounded-xl bg-accent-green hover:bg-emerald-400 text-iron-950 text-xs font-black flex items-center gap-1 tap-active">
            <i data-lucide="play" class="w-3.5 h-3.5 fill-current"></i> 開始
          </button>
          <!-- 一鍵複製課表範本 (Duplicate) -->
          <button data-action="duplicate-routine" data-routine-id="${routine.id}" class="p-1.5 rounded-lg bg-iron-800 hover:bg-iron-750 text-slate-300 text-xs tap-active" title="複製此課表範本">
            <i data-lucide="copy" class="w-3.5 h-3.5"></i>
          </button>
          <button data-action="edit-routine" data-routine-id="${routine.id}" class="p-1.5 rounded-lg bg-iron-800 hover:bg-iron-750 text-slate-300 text-xs tap-active" title="編輯課表">
            <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
          </button>
          <button data-action="delete-routine" data-routine-id="${routine.id}" class="p-1.5 rounded-lg bg-iron-800 hover:bg-rose-950 text-slate-500 hover:text-rose-400 text-xs tap-active" title="刪除課表">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
      <div class="pt-1">${exListHtml}</div>
    `;

    container.appendChild(card);
  });

  if (window.lucide) lucide.createIcons();
}

function renderWeeklySplitGrid() {
  const grid = document.getElementById('weeklySplitGrid');
  grid.innerHTML = '';
  const days = [
    { num: 1, label: '一' }, { num: 2, label: '二' }, { num: 3, label: '三' },
    { num: 4, label: '四' }, { num: 5, label: '五' }, { num: 6, label: '六' }, { num: 0, label: '日' }
  ];
  const currentDay = new Date().getDay();

  days.forEach(d => {
    const routineId = state.schedule.weeklySplit[d.num];
    const routine = state.routines.find(r => r.id === routineId);
    const isToday = d.num === currentDay;

    const btn = document.createElement('button');
    btn.className = `p-2 rounded-xl flex flex-col items-center justify-between text-center transition tap-active border ${isToday ? 'border-accent-green bg-accent-green/10 shadow-sm' : 'border-iron-800 bg-iron-950/80 hover:bg-iron-800'}`;
    const rName = routine ? routine.name.split(' ')[0] : '休';

    btn.innerHTML = `
      <span class="text-[10px] font-bold ${isToday ? 'text-accent-green' : 'text-slate-400'}">${d.label}</span>
      <span class="text-[11px] font-black truncate w-full mt-1 ${routine ? 'text-white' : 'text-slate-600'}">${rName}</span>
    `;

    btn.addEventListener('click', () => {
      const routineOptions = [null, ...state.routines.map(r => r.id)];
      const curIdx = routineOptions.indexOf(state.schedule.weeklySplit[d.num]);
      const nextIdx = (curIdx + 1) % routineOptions.length;
      const nextRId = routineOptions[nextIdx];
      state.schedule.weeklySplit[d.num] = nextRId;

      if (d.num === currentDay) {
        if (nextRId) {
          loadRoutineIntoActiveWorkout(nextRId, false);
        } else {
          state.activeWorkout = null;
        }
      }

      saveState();
      renderWeeklySplitGrid();
      sound.vibrate(20);
    });

    grid.appendChild(btn);
  });
}

function renderCycleStepsList() {
  const list = document.getElementById('cycleStepsList');
  list.innerHTML = '';

  state.schedule.cycleSteps.forEach((step, idx) => {
    const isCurrent = idx === (state.schedule.cycleIndex % state.schedule.cycleSteps.length);
    const routine = state.routines.find(r => r.id === step);
    const stepName = step === 'rest' ? '休 (Rest)' : (routine ? routine.name : '自訂');

    const item = document.createElement('div');
    item.className = `px-3 py-2 rounded-xl border flex items-center gap-2 shrink-0 transition tap-active ${isCurrent ? 'bg-accent-green/20 border-accent-green text-white font-black' : 'bg-iron-950 border-iron-800 text-slate-400'}`;
    item.innerHTML = `
      <span class="w-5 h-5 rounded-full ${isCurrent ? 'bg-accent-green text-iron-950' : 'bg-iron-800 text-slate-400'} text-[10px] font-mono flex items-center justify-center font-bold">${idx + 1}</span>
      <span class="text-xs truncate max-w-[100px]">${stepName}</span>
      <button data-action="delete-cycle-step" data-step-idx="${idx}" class="text-slate-500 hover:text-rose-400 p-0.5" title="刪除節點">
        <i data-lucide="x" class="w-3 h-3"></i>
      </button>
    `;

    item.addEventListener('click', (e) => {
      if (e.target.closest('[data-action="delete-cycle-step"]')) return;
      // 點擊直接設為當前節點
      state.schedule.cycleIndex = idx;
      if (step === 'rest') {
        state.activeWorkout = null;
      } else {
        loadRoutineIntoActiveWorkout(step, false);
      }
      saveState();
      renderCycleStepsList();
      alertToast(`已切換至第 ${idx + 1} 節點：${stepName}`);
    });

    list.appendChild(item);
  });

  if (window.lucide) lucide.createIcons();
}

// 課表編輯器 (Modal)
function openRoutineEditor(routineId = null) {
  const modal = document.getElementById('routineEditorModal');
  const titleEl = document.getElementById('routineEditorModalTitle');
  const nameInput = document.getElementById('routineNameInput');
  const catSelect = document.getElementById('routineCategorySelect');

  if (routineId) {
    const r = state.routines.find(item => item.id === routineId);
    state.editingRoutine = JSON.parse(JSON.stringify(r));
    titleEl.textContent = '編輯課表範本';
  } else {
    state.editingRoutine = {
      id: 'routine-' + Date.now(),
      name: '自訂新課表',
      category: '胸部',
      exercises: [
        { exerciseId: 'bench-press', targetSets: 4, targetReps: 8 }
      ]
    };
    titleEl.textContent = '新建課表範本';
  }

  nameInput.value = state.editingRoutine.name;
  catSelect.value = state.editingRoutine.category;
  renderTemplateExercisesEditor();
  modal.classList.remove('hidden');
}

function renderTemplateExercisesEditor() {
  const list = document.getElementById('templateExercisesList');
  list.innerHTML = '';

  state.editingRoutine.exercises.forEach((item, idx) => {
    const ex = state.exercises.find(e => e.id === item.exerciseId) || { name: '自訂' };
    const row = document.createElement('div');
    row.className = 'flex items-center justify-between p-2 rounded-xl bg-iron-950 border border-iron-800 text-xs';
    row.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="w-5 h-5 rounded-md bg-iron-800 font-mono text-[11px] font-bold flex items-center justify-center text-slate-400">${idx + 1}</span>
        <strong class="text-white text-xs truncate max-w-[120px]">${ex.name}</strong>
      </div>
      <div class="flex items-center gap-1.5 font-mono text-[11px]">
        <input type="number" value="${item.targetSets}" min="1" max="10" data-idx="${idx}" data-field="targetSets"
          class="w-10 bg-iron-900 border border-iron-750 text-center rounded py-1 text-white">組
        <span>×</span>
        <input type="number" value="${item.targetReps}" min="1" max="30" data-idx="${idx}" data-field="targetReps"
          class="w-10 bg-iron-900 border border-iron-750 text-center rounded py-1 text-white">次
        <button data-action="move-up" data-idx="${idx}" class="p-1 text-slate-400 hover:text-white ${idx === 0 ? 'opacity-30' : ''}"><i data-lucide="chevron-up" class="w-3.5 h-3.5"></i></button>
        <button data-action="move-down" data-idx="${idx}" class="p-1 text-slate-400 hover:text-white ${idx === state.editingRoutine.exercises.length - 1 ? 'opacity-30' : ''}"><i data-lucide="chevron-down" class="w-3.5 h-3.5"></i></button>
        <button data-action="delete-template-ex" data-idx="${idx}" class="p-1 text-slate-500 hover:text-rose-400"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
      </div>
    `;
    list.appendChild(row);
  });
  if (window.lucide) lucide.createIcons();
}

// 一鍵複製課表 (Duplicate)
function duplicateRoutine(routineId) {
  const r = state.routines.find(item => item.id === routineId);
  if (!r) return;
  const clone = JSON.parse(JSON.stringify(r));
  clone.id = 'routine-' + Date.now();
  clone.name = clone.name + ' (副本)';
  state.routines.push(clone);
  saveState();
  renderRoutinesView();
  alertToast(`已複製課表為「${clone.name}」`);
}

// ======================= 7. 現場實用計算工具箱 (Gym Calculator Toolbox) =======================

function initGymToolbox() {
  // 1RM 次數配重監聽
  const wInput = document.getElementById('tool1RMWeightInput');
  const rInput = document.getElementById('tool1RMRepsInput');
  const update1RM = () => {
    const w = parseFloat(wInput.value) || 0;
    const r = parseInt(rInput.value) || 1;
    const e1rm = calculateE1RM(w, r, 10);
    document.getElementById('toolCalculated1RMDisplay').textContent = e1rm.toFixed(1);

    // 生成速查清單 (取 2.5kg 整數)
    const table = document.getElementById('repsWeightTableGrid');
    table.innerHTML = '';
    const presets = [
      { reps: '1RM', pct: 1.00 },
      { reps: '3RM', pct: 0.93 },
      { reps: '5RM', pct: 0.87 },
      { reps: '8RM', pct: 0.80 },
      { reps: '10RM', pct: 0.75 },
      { reps: '12RM', pct: 0.70 }
    ];

    presets.forEach(p => {
      const rec = roundTo2_5(e1rm * p.pct);
      const card = document.createElement('div');
      card.className = 'bg-iron-950 p-2 rounded-lg border border-iron-800 text-xs';
      card.innerHTML = `
        <span class="text-[10px] text-slate-400 block">${p.reps}</span>
        <strong class="text-accent-green font-mono text-sm">${rec}</strong> <span class="text-[9px] text-slate-500">kg</span>
      `;
      table.appendChild(card);
    });
  };

  wInput.addEventListener('input', update1RM);
  rInput.addEventListener('input', update1RM);
  update1RM();

  // 雙重超負荷診斷
  const runOverloadDiagnosis = () => {
    const range = document.getElementById('toolTargetRangeSelect').value;
    const actualReps = parseInt(document.getElementById('toolActualRepsInput').value) || 0;
    const actualRpe = parseFloat(document.getElementById('toolActualRPESelect').value) || 8;
    const maxTarget = parseInt(range.split('-')[1]);
    const minTarget = parseInt(range.split('-')[0]);

    const resultCard = document.getElementById('overloadDiagnosticResultCard');
    const textEl = document.getElementById('overloadDiagnosticText');

    if (actualReps >= maxTarget && actualRpe <= 8.5) {
      resultCard.className = 'p-3 rounded-xl border bg-iron-950 border-emerald-500/40 text-xs space-y-1';
      resultCard.firstElementChild.className = 'flex items-center gap-1.5 font-bold text-accent-green';
      resultCard.firstElementChild.innerHTML = '<i data-lucide="check-circle" class="w-4 h-4"></i> 診斷：表現達標！建議加重';
      textEl.textContent = `已達到次數區間上限 (${actualReps}次 ≥ ${maxTarget}次)，下次該動作建議加重 +2.5kg！`;
    } else if (actualReps < minTarget) {
      resultCard.className = 'p-3 rounded-xl border bg-iron-950 border-rose-500/40 text-xs space-y-1';
      resultCard.firstElementChild.className = 'flex items-center gap-1.5 font-bold text-rose-400';
      resultCard.firstElementChild.innerHTML = '<i data-lucide="alert-circle" class="w-4 h-4"></i> 診斷：未達區間底限';
      textEl.textContent = `目前完成次數 (${actualReps}次 < ${minTarget}次) 低於目標，建議適度微調降重，優先保證動作質量。`;
    } else {
      resultCard.className = 'p-3 rounded-xl border bg-iron-950 border-amber-500/40 text-xs space-y-1';
      resultCard.firstElementChild.className = 'flex items-center gap-1.5 font-bold text-accent-amber';
      resultCard.firstElementChild.innerHTML = '<i data-lucide="clock" class="w-4 h-4"></i> 診斷：維持重量，推高次數';
      textEl.textContent = `表現穩定於目標區間 (${actualReps}次)，維持原重量，優先把次數推至 ${maxTarget} 次上限！`;
    }
    if (window.lucide) lucide.createIcons();
  };

  ['toolTargetRangeSelect', 'toolActualRepsInput', 'toolActualRPESelect'].forEach(id => {
    document.getElementById(id).addEventListener('input', runOverloadDiagnosis);
  });
  runOverloadDiagnosis();

  // 蛋白質速算
  const pInput = document.getElementById('toolProteinWeightInput');
  const updateProtein = () => {
    const bw = parseFloat(pInput.value) || 70;
    document.getElementById('proteinLowDisplay').textContent = Math.round(bw * 1.6);
    document.getElementById('proteinHighDisplay').textContent = Math.round(bw * 2.2);
  };
  pInput.addEventListener('input', updateProtein);
  updateProtein();

  // 工具箱分頁標籤切換
  document.querySelectorAll('.tool-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tool-tab-btn').forEach(b => {
        b.className = 'tool-tab-btn flex-1 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white';
      });
      btn.className = 'tool-tab-btn flex-1 py-1.5 rounded-lg text-xs font-bold bg-accent-green text-iron-950';

      const tool = btn.getAttribute('data-tool');
      document.getElementById('toolPanel1RM').classList.toggle('hidden', tool !== '1rm');
      document.getElementById('toolPanelOverload').classList.toggle('hidden', tool !== 'overload');
      document.getElementById('toolPanelProtein').classList.toggle('hidden', tool !== 'protein');
      sound.vibrate(15);
    });
  });
}

// ======================= 8. UI 渲染：數據分析與 SVG 肌群疲勞熱圖 (Analytics & Visuals) =======================

function renderAnalyticsView() {
  const latestBw = getLatestBodyWeight();
  document.getElementById('latestBodyWeightDisplay').textContent = `${latestBw.toFixed(1)} kg`;

  // 1. 計算肌群疲勞時數並著色 SVG 人體圖
  renderSvgMuscleRecoveryMap();

  // 2. 渲染雙軸曲線圖 (1RM vs 體重/體脂)
  renderDualAxisProgressChart();

  // 3. 渲染出勤熱圖 (支援點擊彈出當日結算卡)
  renderStreakHeatmap();

  // 4. 渲染 PR 榮譽牆 (含相對肌力 x BW)
  renderPRHonorWall(latestBw);

  // 5. 渲染歷史訓練歸檔清單 (Session Cards)
  renderWorkoutSessionsList();
}

// 根據歷史紀錄計算各肌群疲勞並渲染 SVG 人體圖
function renderSvgMuscleRecoveryMap() {
  const muscleGroups = ['胸部', '背部', '腿部', '肩部', '手臂', '核心'];
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;

  const recoveryStatus = {};

  muscleGroups.forEach(grp => {
    // 找出該肌群最近一次被訓練的時間
    let lastTime = 0;
    for (const session of state.sessions) {
      const match = session.exercises.some(e => {
        const ex = state.exercises.find(item => item.id === e.exerciseId);
        return (ex && ex.category === grp) || session.category === grp;
      });
      if (match) {
        lastTime = session.timestamp;
        break;
      }
    }

    if (!lastTime) {
      recoveryStatus[grp] = { hoursAgo: 999, color: '#10b981', label: '充分就緒' };
    } else {
      const hoursAgo = Math.floor((now - lastTime) / ONE_HOUR);
      if (hoursAgo < 24) {
        recoveryStatus[grp] = { hoursAgo, color: '#ef4444', label: '高疲勞修復中' };
      } else if (hoursAgo < 48) {
        recoveryStatus[grp] = { hoursAgo, color: '#f59e0b', label: '修復過渡中' };
      } else {
        recoveryStatus[grp] = { hoursAgo, color: '#10b981', label: '完全就緒' };
      }
    }
  });

  // 為 SVG 的各 muscle-part 元素填色
  document.querySelectorAll('.muscle-part').forEach(part => {
    const grp = part.getAttribute('data-group');
    if (recoveryStatus[grp]) {
      part.setAttribute('fill', recoveryStatus[grp].color);
    }
  });

  // 點擊肌群查詢資訊
  document.querySelectorAll('.muscle-part').forEach(part => {
    part.onclick = () => {
      const grp = part.getAttribute('data-group');
      const info = recoveryStatus[grp];
      const infoEl = document.getElementById('selectedMuscleRecoveryInfo');
      infoEl.innerHTML = `
        <span>肌群：<strong class="text-white">${grp}</strong> (距上次約 ${info.hoursAgo >= 999 ? '未練過' : `${info.hoursAgo} 小時`})</span>
        <span class="font-mono font-bold" style="color: ${info.color}">${info.label}</span>
      `;
      sound.vibrate(20);
    };
  });
}

// 繪製 1RM 與 體重/體脂 雙軸折線圖
function renderDualAxisProgressChart() {
  const ctx = document.getElementById('dualAxisProgressChart');
  if (!ctx || !window.Chart) return;

  const select = document.getElementById('dualChartExerciseSelect');
  if (select.children.length === 0) {
    const compoundExs = ['bench-press', 'squat', 'deadlift', 'ohp', 'barbell-row'];
    compoundExs.forEach(id => {
      const ex = state.exercises.find(e => e.id === id);
      if (ex) {
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = ex.name;
        select.appendChild(opt);
      }
    });
    select.onchange = () => renderDualAxisProgressChart();
  }

  const selectedExId = select.value || 'bench-press';

  // 整理時間軸資料
  const timeMap = {};

  // 放入體重體脂資料
  state.bodyLogs.forEach(b => {
    timeMap[b.date] = { date: b.date, weight: b.weight, e1rm: null };
  });

  // 放入動作的 e1RM 資料
  state.sessions.forEach(sess => {
    const foundEx = sess.exercises.find(e => e.exerciseId === selectedExId);
    if (foundEx) {
      const maxE1rm = Math.max(...foundEx.sets.map(s => s.e1rm || calculateE1RM(s.weight, s.reps, s.rpe || 8)), 0);
      if (maxE1rm > 0) {
        if (!timeMap[sess.date]) timeMap[sess.date] = { date: sess.date, weight: null, e1rm: maxE1rm };
        else timeMap[sess.date].e1rm = maxE1rm;
      }
    }
  });

  const sortedDates = Object.keys(timeMap).sort();
  const labels = sortedDates.map(d => d.slice(5));
  const e1rmData = sortedDates.map(d => timeMap[d].e1rm);
  const weightData = sortedDates.map(d => timeMap[d].weight);

  if (state.chartDual) {
    state.chartDual.destroy();
  }

  state.chartDual = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels.length > 0 ? labels : ['無數據'],
      datasets: [
        {
          label: '估算 1RM (kg)',
          data: e1rmData.length > 0 ? e1rmData : [0],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          yAxisID: 'yStrength',
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 3
        },
        {
          label: '體重 (kg)',
          data: weightData.length > 0 ? weightData : [0],
          borderColor: '#f59e0b',
          backgroundColor: 'transparent',
          borderDash: [4, 4],
          yAxisID: 'yBody',
          tension: 0.2,
          borderWidth: 1.5,
          pointRadius: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: { color: '#94a3b8', font: { size: 10 } }
        }
      },
      scales: {
        x: { grid: { color: '#1a2236' }, ticks: { color: '#64748b', font: { size: 9 } } },
        yStrength: {
          type: 'linear',
          position: 'left',
          grid: { color: '#1a2236' },
          ticks: { color: '#10b981', font: { size: 9 } }
        },
        yBody: {
          type: 'linear',
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: { color: '#f59e0b', font: { size: 9 } }
        }
      }
    }
  });
}

// 繪製熱圖 (支援點擊打開當日訓練卡片)
function renderStreakHeatmap() {
  const container = document.getElementById('heatmapGridContainer');
  container.innerHTML = '';
  const now = new Date();

  // 整理每日總容量與 session
  const dateMap = {};
  state.sessions.forEach(sess => {
    dateMap[sess.date] = sess;
  });

  const columns = [];
  for (let w = 8; w >= 0; w--) {
    const colDays = [];
    for (let d = 0; d < 7; d++) {
      const targetDate = new Date();
      targetDate.setDate(now.getDate() - (w * 7 + (6 - d)));
      const dateStr = targetDate.toISOString().split('T')[0];
      const session = dateMap[dateStr] || null;
      colDays.push({ dateStr, session });
    }
    columns.push(colDays);
  }

  columns.forEach(col => {
    const colDiv = document.createElement('div');
    colDiv.className = 'flex flex-col gap-1';

    col.forEach(day => {
      const cell = document.createElement('div');
      cell.className = 'w-3.5 h-3.5 rounded-sm transition-transform hover:scale-125 cursor-pointer';

      if (!day.session) {
        cell.className += ' bg-iron-850';
      } else if (day.session.totalVolume < 2500) {
        cell.className += ' bg-emerald-950 border border-emerald-800';
      } else if (day.session.totalVolume < 6000) {
        cell.className += ' bg-emerald-700';
      } else {
        cell.className += ' bg-emerald-400 shadow-sm shadow-emerald-400/40';
      }

      cell.title = day.session ? `${day.dateStr}：${day.session.routineName} (${day.session.totalVolume}kg)` : `${day.dateStr}：休息`;

      cell.onclick = () => {
        if (day.session) {
          openWorkoutSummaryModal(day.session);
        } else {
          alertToast(`${day.dateStr}：當日為休息日`);
        }
      };

      colDiv.appendChild(cell);
    });

    container.appendChild(colDiv);
  });
}

// 渲染 PR 榮譽牆 (含相對肌力 x BW)
function renderPRHonorWall(bodyWeight = 70) {
  const container = document.getElementById('prHonorGrid');
  container.innerHTML = '';

  const prMap = {};

  state.sessions.forEach(sess => {
    sess.exercises.forEach(ex => {
      const maxW = Math.max(...ex.sets.map(s => s.weight), 0);
      const maxE1rm = Math.max(...ex.sets.map(s => s.e1rm || calculateE1RM(s.weight, s.reps, s.rpe || 8)), 0);

      if (!prMap[ex.exerciseId] || maxE1rm > prMap[ex.exerciseId].e1rm) {
        prMap[ex.exerciseId] = {
          exerciseName: ex.exerciseName,
          bestWeight: maxW,
          e1rm: maxE1rm
        };
      }
    });
  });

  const entries = Object.entries(prMap);
  if (entries.length === 0) {
    container.innerHTML = `<div class="col-span-2 text-center text-xs text-slate-500 py-3">尚無 PR 紀錄，完成正式訓練後解鎖！</div>`;
    return;
  }

  entries.forEach(([_, item]) => {
    const ratio = bodyWeight > 0 ? (item.bestWeight / bodyWeight).toFixed(2) : '1.0';
    const card = document.createElement('div');
    card.className = 'bg-iron-950 border border-iron-800 rounded-xl p-3 space-y-1';
    card.innerHTML = `
      <div class="text-[11px] font-bold text-slate-300 truncate">${item.exerciseName}</div>
      <div class="flex items-baseline justify-between pt-0.5">
        <span class="text-[10px] text-slate-500 font-mono">e1RM</span>
        <span class="text-base font-mono font-black text-accent-green">${item.e1rm} <span class="text-[9px] text-slate-400">kg</span></span>
      </div>
      <div class="text-[10px] text-slate-400 font-mono flex justify-between">
        <span>最大 ${item.bestWeight}kg</span>
        <span class="text-accent-amber font-bold">${ratio}x BW</span>
      </div>
    `;
    container.appendChild(card);
  });
}

// 渲染歷史訓練歸檔清單 (Session Cards)
function renderWorkoutSessionsList() {
  const container = document.getElementById('workoutSessionsContainer');
  const countBadge = document.getElementById('totalSessionsCountBadge');
  countBadge.textContent = `${state.sessions.length} 次訓練`;
  container.innerHTML = '';

  if (state.sessions.length === 0) {
    container.innerHTML = `<div class="text-center py-4 text-xs text-slate-500">尚無歷史訓練歸檔。</div>`;
    return;
  }

  state.sessions.forEach(sess => {
    const card = document.createElement('div');
    card.className = 'bg-iron-950 border border-iron-800 rounded-xl p-3 space-y-2';

    const exBrief = sess.exercises.map(e => `${e.exerciseName} (${e.sets.length}組)`).join(' • ');

    card.innerHTML = `
      <div class="flex items-start justify-between">
        <div>
          <div class="flex items-center gap-2">
            <strong class="text-white text-xs">${sess.routineName}</strong>
            <span class="text-[10px] font-mono text-slate-500">${sess.date}</span>
          </div>
          <div class="text-[10px] text-slate-400 font-mono mt-0.5">
            ${sess.totalSets} 組完成 • ${sess.totalVolume.toLocaleString()} kg 容量
          </div>
        </div>
        <div class="flex items-center gap-1">
          <button data-action="view-share-card" data-session-id="${sess.id}" class="p-1 rounded-lg bg-iron-800 text-slate-300 hover:text-accent-green text-[10px] flex items-center gap-1 tap-active" title="生成分享圖卡">
            <i data-lucide="share-2" class="w-3 h-3"></i> 圖卡
          </button>
          <button data-action="delete-session" data-session-id="${sess.id}" class="p-1 text-slate-500 hover:text-rose-400 tap-active" title="刪除此訓練">
            <i data-lucide="trash-2" class="w-3 h-3"></i>
          </button>
        </div>
      </div>
      <div class="text-[10px] text-slate-500 truncate font-mono border-t border-iron-850 pt-1.5">${exBrief}</div>
    `;

    container.appendChild(card);
  });

  if (window.lucide) lucide.createIcons();
}

// ======================= 9. HTML5 Canvas 成果分享卡片生成 =======================

function openWorkoutSummaryModal(session) {
  const modal = document.getElementById('shareCardModal');
  const canvas = document.getElementById('summaryCardCanvas');
  const ctx = canvas.getContext('2d');

  // 繪製黑底硬派海報風格結算圖 (600 x 750)
  ctx.fillStyle = '#070a10';
  ctx.fillRect(0, 0, 600, 750);

  // 頂部金屬邊框與裝飾線
  const grad = ctx.createLinearGradient(0, 0, 600, 0);
  grad.addColorStop(0, '#10b981');
  grad.addColorStop(0.5, '#f59e0b');
  grad.addColorStop(1, '#10b981');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 600, 6);

  // Logo 與品牌標題
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 24px monospace';
  ctx.fillText('IRONLOG PRO', 40, 50);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 14px sans-serif';
  ctx.fillText('WORKOUT SUMMARY REPORT', 40, 72);

  // 課表名稱與日期
  ctx.fillStyle = '#10b981';
  ctx.font = '900 28px sans-serif';
  ctx.fillText(session.routineName, 40, 125);

  ctx.fillStyle = '#64748b';
  ctx.font = '500 14px monospace';
  ctx.fillText(`DATE: ${session.date}   |   DURATION: ${session.durationMinutes || 45} MINS`, 40, 150);

  // 數據統計大數字框 (容量 & 組數)
  ctx.fillStyle = '#121725';
  ctx.roundRect(40, 175, 520, 90, 16);
  ctx.fill();

  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 12px sans-serif';
  ctx.fillText('TOTAL VOLUME LOAD', 65, 205);
  ctx.fillText('COMPLETED SETS', 345, 205);

  ctx.fillStyle = '#10b981';
  ctx.font = '900 32px monospace';
  ctx.fillText(`${session.totalVolume.toLocaleString()} KG`, 65, 245);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 32px monospace';
  ctx.fillText(`${session.totalSets} SETS`, 345, 245);

  // 動作明細清單
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '700 16px sans-serif';
  ctx.fillText('EXERCISE BREAKDOWN', 40, 305);

  let curY = 335;
  session.exercises.slice(0, 5).forEach((ex, idx) => {
    ctx.fillStyle = '#121725';
    ctx.roundRect(40, curY, 520, 55, 10);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 14px sans-serif';
    ctx.fillText(ex.exerciseName, 55, curY + 25);

    // 最大負重
    const maxW = Math.max(...ex.sets.map(s => s.weight), 0);
    const setsCnt = ex.sets.length;
    ctx.fillStyle = '#f59e0b';
    ctx.font = '800 13px monospace';
    ctx.fillText(`${setsCnt} 組  •  TOP ${maxW} KG`, 55, curY + 45);

    curY += 65;
  });

  // 底部硬派標籤
  ctx.fillStyle = '#334155';
  ctx.font = '600 12px monospace';
  ctx.fillText('NO PAIN NO GAIN  •  FORGED IN IRON', 40, 715);

  modal.classList.remove('hidden');
}

// 下載結算圖卡
function downloadShareCard() {
  const canvas = document.getElementById('summaryCardCanvas');
  const link = document.createElement('a');
  link.download = `IronLog-Workout-${new Date().toISOString().split('T')[0]}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
  alertToast('已儲存訓練結算圖！');
}

// ======================= 10. 動作選擇庫與快速打字建立 =======================

function openExercisePicker(mode = 'workout') {
  state.pickerTarget.mode = mode;
  const modal = document.getElementById('exercisePickerModal');
  const searchInput = document.getElementById('pickerSearchOrAddInput');
  searchInput.value = '';
  document.getElementById('quickCreateExBtn').classList.add('hidden');
  document.getElementById('quickCreateCatRow').classList.add('hidden');
  renderPickerExerciseList('全部', '');
  modal.classList.remove('hidden');
  setTimeout(() => searchInput.focus(), 100);
}

function renderPickerExerciseList(category = '全部', query = '') {
  const list = document.getElementById('pickerExerciseItemsList');
  const quickCreateBtn = document.getElementById('quickCreateExBtn');
  const quickCreateCatRow = document.getElementById('quickCreateCatRow');
  list.innerHTML = '';

  const cleanQuery = query.trim().toLowerCase();

  const filtered = state.exercises.filter(e => {
    const matchCat = (category === '全部' || e.category === category);
    const matchQuery = !cleanQuery || e.name.toLowerCase().includes(cleanQuery);
    return matchCat && matchQuery;
  });

  const exactMatch = state.exercises.some(e => e.name.toLowerCase() === cleanQuery);
  if (cleanQuery && !exactMatch) {
    quickCreateBtn.classList.remove('hidden');
    quickCreateCatRow.classList.remove('hidden');
  } else {
    quickCreateBtn.classList.add('hidden');
    quickCreateCatRow.classList.add('hidden');
  }

  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="text-center py-6 space-y-1.5">
        <p class="text-xs text-slate-400">未找到「<strong class="text-white">${query}</strong>」</p>
        <p class="text-[11px] text-accent-green font-bold">點擊右上角「＋ 建立」立即新增此動作！</p>
      </div>
    `;
    return;
  }

  filtered.forEach(ex => {
    const card = document.createElement('div');
    card.className = 'p-2.5 rounded-xl bg-iron-950 border border-iron-800 hover:border-accent-green flex items-center justify-between text-xs cursor-pointer tap-active transition';
    card.innerHTML = `
      <div>
        <strong class="text-white text-xs block">${ex.name}</strong>
        <span class="text-[10px] text-slate-400 font-mono">${ex.category} ${ex.isCompound ? '• 複合動作' : ''}</span>
      </div>
      <span class="text-accent-green font-bold text-xs flex items-center gap-1">
        <i data-lucide="plus" class="w-3.5 h-3.5"></i> 加入
      </span>
    `;

    card.addEventListener('click', () => {
      addExerciseToTarget(ex);
    });

    list.appendChild(card);
  });

  if (window.lucide) lucide.createIcons();
}

function addExerciseToTarget(ex) {
  if (state.pickerTarget.mode === 'workout') {
    if (!state.activeWorkout) {
      state.activeWorkout = {
        routineId: null,
        routineName: '自訂現場訓練',
        category: ex.category || '全身',
        startTime: Date.now(),
        mobilityChecks: MOBILITY_PROTOCOLS[ex.category] || MOBILITY_PROTOCOLS['全身'],
        exercises: []
      };
    }

    const ghost = getExerciseGhostData(ex.id);
    const defaultW = ghost ? ghost.weight : 40;
    const defaultR = ghost ? ghost.reps : 8;

    state.activeWorkout.exercises.push({
      exerciseId: ex.id,
      isDumbbellEachSide: false,
      loadMode: 'normal',
      pinNote: ex.pinNote || '',
      sets: [
        { id: 's-' + Date.now() + '-1', setType: 'working', weight: defaultW, reps: defaultR, rpe: 8, isCompleted: false },
        { id: 's-' + Date.now() + '-2', setType: 'working', weight: defaultW, reps: defaultR, rpe: 8, isCompleted: false },
        { id: 's-' + Date.now() + '-3', setType: 'working', weight: defaultW, reps: defaultR, rpe: 8, isCompleted: false }
      ]
    });
    saveState();
    renderWorkoutSheet();
    alertToast(`已加入「${ex.name}」`);
  } else if (state.pickerTarget.mode === 'routine') {
    state.editingRoutine.exercises.push({
      exerciseId: ex.id,
      targetSets: 3,
      targetReps: 8
    });
    renderTemplateExercisesEditor();
    alertToast(`已加入課表範本`);
  }

  document.getElementById('exercisePickerModal').classList.add('hidden');
  sound.vibrate(25);
}

function createAndAddCustomExercise() {
  const input = document.getElementById('pickerSearchOrAddInput');
  const name = input.value.trim();
  if (!name) return;

  const category = document.getElementById('quickCreateCatSelect').value || '胸部';
  const isCompound = document.getElementById('quickCreateCompoundCheck').checked;

  let existing = state.exercises.find(e => e.name.toLowerCase() === name.toLowerCase());
  if (!existing) {
    existing = {
      id: 'custom-' + Date.now(),
      name,
      category,
      isCompound,
      pinNote: ''
    };
    state.exercises.unshift(existing);
    saveState();
  }

  addExerciseToTarget(existing);
}

// 僅今日臨時替換動作
function openSwapTodayModal(exerciseId, exIndex) {
  state.swapTarget.exerciseIndex = exIndex;
  state.swapTarget.originalExerciseId = exerciseId;

  const modal = document.getElementById('swapTodayModal');
  const label = document.getElementById('swapTodayPromptLabel');
  const list = document.getElementById('swapTodayAltsList');

  const curEx = state.exercises.find(e => e.id === exerciseId);
  label.textContent = `原動作：${curEx ? curEx.name : ''}（僅替換本次訓練）`;
  list.innerHTML = '';

  const alts = state.exercises.filter(e => e.category === (curEx ? curEx.category : '胸部') && e.id !== exerciseId);

  alts.forEach(alt => {
    const card = document.createElement('div');
    card.className = 'p-3 rounded-xl bg-iron-950 border border-iron-800 hover:border-accent-blue flex items-center justify-between text-xs cursor-pointer tap-active transition';
    card.innerHTML = `
      <div>
        <strong class="text-white text-sm block">${alt.name}</strong>
        <span class="text-[10px] text-slate-400 font-mono">${alt.category}</span>
      </div>
      <button class="px-3 py-1.5 rounded-lg bg-accent-blue/20 text-accent-blue font-bold text-xs">
        確認替換
      </button>
    `;

    card.addEventListener('click', () => {
      state.activeWorkout.exercises[exIndex].exerciseId = alt.id;
      state.activeWorkout.exercises[exIndex].pinNote = alt.pinNote || '';
      saveState();
      renderWorkoutSheet();
      modal.classList.add('hidden');
      alertToast(`已臨時替換為「${alt.name}」`);
      sound.vibrate(30);
    });

    list.appendChild(card);
  });

  modal.classList.remove('hidden');
}

// ======================= 11. 手動計時器控制 =======================

function toggleManualTimer() {
  if (state.timer.isRunning) {
    clearInterval(state.timer.intervalId);
    state.timer.isRunning = false;
    updateManualTimerDisplay();
  } else {
    if (state.timer.remainingSeconds <= 0) {
      state.timer.remainingSeconds = state.timer.totalSeconds;
    }
    state.timer.isRunning = true;
    updateManualTimerDisplay();

    state.timer.intervalId = setInterval(() => {
      state.timer.remainingSeconds--;
      updateManualTimerDisplay();

      if (state.timer.remainingSeconds <= 0) {
        clearInterval(state.timer.intervalId);
        state.timer.isRunning = false;
        sound.timerDone();
        alertToast('⏰ 組間休息時間到！');
      }
    }, 1000);
  }
}

function resetManualTimer() {
  if (state.timer.intervalId) clearInterval(state.timer.intervalId);
  state.timer.isRunning = false;
  state.timer.remainingSeconds = state.timer.totalSeconds;
  updateManualTimerDisplay();
}

function updateManualTimerDisplay() {
  const display = document.getElementById('manualTimerDisplay');
  const total = state.timer.remainingSeconds;
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  display.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function alertToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-iron-900 border border-accent-green text-white font-bold px-4 py-2 rounded-xl shadow-2xl text-xs flex items-center gap-2 animate-bounce';
  toast.innerHTML = `<i data-lucide="bell" class="w-4 h-4 text-accent-green"></i><span>${msg}</span>`;
  document.body.appendChild(toast);
  if (window.lucide) lucide.createIcons();
  setTimeout(() => toast.remove(), 2600);
}

// ======================= 12. 全域事件監聽與行為綁定 =======================

function setupEventListeners() {
  // 底部導航分頁切換
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetNav = btn.getAttribute('data-nav');
      switchNavTab(targetNav);
      sound.vibrate(15);
    });
  });

  // 現場訓練工作表內部事件委託
  const workoutContainer = document.getElementById('workoutCardsContainer');

  workoutContainer.addEventListener('input', (e) => {
    const input = e.target;
    const field = input.getAttribute('data-field');
    const exIdx = parseInt(input.getAttribute('data-ex-index'));
    const setIdx = parseInt(input.getAttribute('data-set-index'));

    if (field && !isNaN(exIdx) && !isNaN(setIdx)) {
      state.activeWorkout.exercises[exIdx].sets[setIdx][field] = parseFloat(input.value) || 0;
      saveState();
    }
  });

  workoutContainer.addEventListener('change', (e) => {
    const target = e.target;
    // 置頂備忘
    if (target.getAttribute('data-action') === 'edit-pin-note') {
      const exIdx = parseInt(target.getAttribute('data-ex-index'));
      const exId = target.getAttribute('data-ex-id');
      const val = target.value.trim();
      state.activeWorkout.exercises[exIdx].pinNote = val;
      const ex = state.exercises.find(item => item.id === exId);
      if (ex) ex.pinNote = val;
      saveState();
      alertToast('動作備忘已儲存');
    }
    // 負重模式切換
    else if (target.getAttribute('data-action') === 'change-load-mode') {
      const exIdx = parseInt(target.getAttribute('data-ex-index'));
      state.activeWorkout.exercises[exIdx].loadMode = target.value;
      saveState();
      alertToast(`已切換為：${target.options[target.selectedIndex].text}`);
    }
  });

  workoutContainer.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    const action = target.getAttribute('data-action');
    const exIdx = parseInt(target.getAttribute('data-ex-index'));
    const setIdx = parseInt(target.getAttribute('data-set-index'));

    // 1. 打勾與取消打勾 (防止誤觸)
    if (action === 'toggle-set-complete') {
      const set = state.activeWorkout.exercises[exIdx].sets[setIdx];
      set.isCompleted = !set.isCompleted;

      if (set.isCompleted) {
        sound.check();
      } else {
        sound.vibrate(15);
      }

      saveState();
      renderWorkoutSheet();
    }

    // 2. 點擊 Ghost Data 直接帶入該組
    else if (action === 'apply-ghost-data') {
      const exItem = state.activeWorkout.exercises[exIdx];
      const ghost = getExerciseGhostData(exItem.exerciseId);
      if (ghost) {
        const set = exItem.sets[setIdx];
        set.weight = ghost.weight;
        set.reps = ghost.reps;
        saveState();
        renderWorkoutSheet();
        sound.vibrate(20);
        alertToast(`已帶入前次：${ghost.weight}kg × ${ghost.reps}`);
      }
    }

    // 3. 現場當組直接刪除 (垃圾桶)
    else if (action === 'delete-single-set') {
      state.activeWorkout.exercises[exIdx].sets.splice(setIdx, 1);
      saveState();
      renderWorkoutSheet();
      sound.vibrate(20);
    }

    // 4. 切換組別類型 (1/2/3/W/D/F)
    else if (action === 'toggle-set-type') {
      const set = state.activeWorkout.exercises[exIdx].sets[setIdx];
      const types = ['working', 'warmup', 'drop', 'failure'];
      let next = (types.indexOf(set.setType) + 1) % types.length;
      set.setType = types[next];
      saveState();
      renderWorkoutSheet();
      sound.vibrate(15);
    }

    // 5. 快速累加按鈕 (+1.25 / +2.5 / +5)
    else if (action === 'quick-add-weight') {
      const delta = parseFloat(target.getAttribute('data-delta'));
      const set = state.activeWorkout.exercises[exIdx].sets[setIdx];
      set.weight = Math.max(0, (set.weight || 0) + delta);
      saveState();
      renderWorkoutSheet();
      sound.vibrate(20);
    }

    // 6. 複製上一組 (Copy Last)
    else if (action === 'copy-last-set') {
      const prev = state.activeWorkout.exercises[exIdx].sets[setIdx - 1];
      const cur = state.activeWorkout.exercises[exIdx].sets[setIdx];
      if (prev && cur) {
        cur.weight = prev.weight;
        cur.reps = prev.reps;
        cur.rpe = prev.rpe;
        saveState();
        renderWorkoutSheet();
        sound.vibrate(20);
      }
    }

    // 7. 單邊啞鈴 (×2) 切換
    else if (action === 'toggle-dumbbell') {
      const exItem = state.activeWorkout.exercises[exIdx];
      exItem.isDumbbellEachSide = !exItem.isDumbbellEachSide;
      saveState();
      renderWorkoutSheet();
      sound.vibrate(20);
    }

    // 8. 複合動作一鍵排熱身組
    else if (action === 'generate-warmup') {
      generateWarmupSets(exIdx);
    }

    // 9. 僅今日臨時替換動作
    else if (action === 'swap-today') {
      const exId = target.getAttribute('data-ex-id');
      openSwapTodayModal(exId, exIdx);
    }

    // 10. 新增一組
    else if (action === 'add-set') {
      const sets = state.activeWorkout.exercises[exIdx].sets;
      const last = sets[sets.length - 1] || { weight: 50, reps: 8, rpe: 8 };
      sets.push({
        id: 's-' + Date.now(),
        setType: 'working',
        weight: last.weight,
        reps: last.reps,
        rpe: last.rpe,
        isCompleted: false
      });
      saveState();
      renderWorkoutSheet();
      sound.vibrate(20);
    }

    // 11. 移除動作
    else if (action === 'remove-workout-ex') {
      if (confirm('確定從今日訓練移除此動作？')) {
        state.activeWorkout.exercises.splice(exIdx, 1);
        saveState();
        renderWorkoutSheet();
      }
    }
  });

  // 部位活動度展開/折疊
  document.getElementById('toggleMobilityBtn').addEventListener('click', () => {
    const list = document.getElementById('mobilityItemsList');
    const isHidden = list.classList.toggle('hidden');
    document.getElementById('toggleMobilityText').textContent = isHidden ? '展開' : '收起';
    document.getElementById('toggleMobilityIcon').setAttribute('data-lucide', isHidden ? 'chevron-down' : 'chevron-up');
    if (window.lucide) lucide.createIcons();
  });

  // 手動計時器控制
  document.getElementById('manualTimerToggleBtn').addEventListener('click', toggleManualTimer);
  document.getElementById('timerPlus30Btn').addEventListener('click', () => {
    state.timer.remainingSeconds += 30;
    updateManualTimerDisplay();
    sound.vibrate(20);
  });
  document.getElementById('timerResetBtn').addEventListener('click', () => {
    resetManualTimer();
    sound.vibrate(25);
  });
  document.getElementById('timerMuteToggleBtn').addEventListener('click', () => {
    state.timer.isMuted = !state.timer.isMuted;
    document.getElementById('timerMuteIcon').setAttribute('data-lucide', state.timer.isMuted ? 'volume-x' : 'volume-2');
    if (window.lucide) lucide.createIcons();
    alertToast(state.timer.isMuted ? '計時器已靜音' : '計時器聲音已開啟');
  });

  // 開啟現場計算工具箱
  document.getElementById('openGymToolboxBtn').addEventListener('click', () => {
    document.getElementById('gymToolboxModal').classList.remove('hidden');
  });
  document.getElementById('closeGymToolboxBtn').addEventListener('click', () => {
    document.getElementById('gymToolboxModal').classList.add('hidden');
  });

  // 開啟記錄體重體脂 Modal
  document.getElementById('openBodyLogModalBtn').addEventListener('click', () => {
    document.getElementById('bodyLogModal').classList.remove('hidden');
  });
  document.getElementById('closeBodyLogModalBtn').addEventListener('click', () => {
    document.getElementById('bodyLogModal').classList.add('hidden');
  });
  document.getElementById('cancelBodyLogBtn').addEventListener('click', () => {
    document.getElementById('bodyLogModal').classList.add('hidden');
  });
  document.getElementById('saveBodyLogBtn').addEventListener('click', () => {
    const w = parseFloat(document.getElementById('bodyWeightInput').value);
    const bf = parseFloat(document.getElementById('bodyFatInput').value) || null;
    if (!w || w <= 0) return alert('請輸入有效體重');

    const dateStr = new Date().toISOString().split('T')[0];
    state.bodyLogs.push({
      date: dateStr,
      timestamp: Date.now(),
      weight: w,
      bodyFat: bf
    });
    saveState();
    renderAnalyticsView();
    document.getElementById('bodyLogModal').classList.add('hidden');
    alertToast(`已記錄體重：${w} kg`);
  });

  // 完成今日訓練 (歸檔防呆)
  document.getElementById('finishWorkoutBtn').addEventListener('click', () => {
    let completedCount = 0;
    let totalVol = 0;
    const sessionExercises = [];

    state.activeWorkout.exercises.forEach(ex => {
      const doneSets = ex.sets.filter(s => s.isCompleted);
      if (doneSets.length > 0) {
        completedCount += doneSets.length;
        const factor = ex.isDumbbellEachSide ? 2 : 1;
        doneSets.forEach(s => {
          totalVol += (s.weight * s.reps * factor);
          s.e1rm = calculateE1RM(s.weight, s.reps, s.rpe || 8);
        });
        const exObj = state.exercises.find(e => e.id === ex.exerciseId);
        sessionExercises.push({
          exerciseId: ex.exerciseId,
          exerciseName: exObj ? exObj.name : '自訂動作',
          category: exObj ? exObj.category : '全身',
          sets: doneSets
        });
      }
    });

    if (completedCount === 0) {
      alert('防呆提醒：今日尚未完成任何組數，請至少打勾完成 1 組後再進行歸檔！');
      return;
    }

    const durationMins = Math.max(15, Math.round((Date.now() - (state.activeWorkout.startTime || Date.now())) / (60 * 1000)));

    const newSession = {
      id: 'sess-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
      routineName: state.activeWorkout.routineName,
      category: state.activeWorkout.category,
      durationMinutes: durationMins,
      totalVolume: totalVol,
      totalSets: completedCount,
      exercises: sessionExercises
    };

    state.sessions.unshift(newSession);

    // 若排程是天數循環模式，完成後自動前進至下一節點！
    if (state.schedule.mode === 'cycle') {
      state.schedule.cycleIndex++;
    }

    state.activeWorkout = null;
    saveState();

    sound.pr();
    alertToast('🎉 今日訓練完成！組數已成功歸檔！');
    switchNavTab('tab-analytics');

    // 自動彈出成果結算分享卡
    setTimeout(() => openWorkoutSummaryModal(newSession), 500);
  });

  // 成果分享卡關閉與下載
  document.getElementById('closeShareCardModalBtn').addEventListener('click', () => {
    document.getElementById('shareCardModal').classList.add('hidden');
  });
  document.getElementById('downloadShareCardBtn').addEventListener('click', downloadShareCard);

  // 排程模式切換 (固定週排程 vs 天數循環)
  document.querySelectorAll('.schedule-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.schedule.mode = btn.getAttribute('data-mode');
      saveState();
      renderRoutinesView();
      resolveScheduledWorkoutForToday();
      sound.vibrate(20);
    });
  });

  // 新增循環節點
  document.getElementById('addCycleStepBtn').addEventListener('click', () => {
    const routineOptions = [...state.routines.map(r => ({ id: r.id, name: r.name })), { id: 'rest', name: '休 (Rest Day)' }];
    const choice = prompt('請選擇要新增的節點課表：\n' + routineOptions.map((r, i) => `${i + 1}. ${r.name}`).join('\n'));
    const idx = parseInt(choice) - 1;
    if (routineOptions[idx]) {
      state.schedule.cycleSteps.push(routineOptions[idx].id);
      saveState();
      renderCycleStepsList();
      alertToast(`已新增節點：${routineOptions[idx].name}`);
    }
  });

  // 課表列表事件委託 (開始、複製、編輯、刪除)
  document.getElementById('routinesListContainer').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    const rId = btn.getAttribute('data-routine-id');

    if (action === 'start-routine') {
      loadRoutineIntoActiveWorkout(rId, true);
      switchNavTab('tab-workout');
      sound.vibrate(30);
    } else if (action === 'duplicate-routine') {
      duplicateRoutine(rId);
    } else if (action === 'edit-routine') {
      openRoutineEditor(rId);
    } else if (action === 'delete-routine') {
      if (confirm('確定刪除此課表範本？')) {
        state.routines = state.routines.filter(r => r.id !== rId);
        saveState();
        renderRoutinesView();
      }
    }
  });

  // 課表編輯器動作排序與刪除
  document.getElementById('templateExercisesList').addEventListener('input', (e) => {
    const idx = parseInt(e.target.getAttribute('data-idx'));
    const field = e.target.getAttribute('data-field');
    if (!isNaN(idx) && field) {
      state.editingRoutine.exercises[idx][field] = parseInt(e.target.value) || 1;
    }
  });

  document.getElementById('templateExercisesList').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    const idx = parseInt(btn.getAttribute('data-idx'));

    if (action === 'move-up' && idx > 0) {
      const temp = state.editingRoutine.exercises[idx];
      state.editingRoutine.exercises[idx] = state.editingRoutine.exercises[idx - 1];
      state.editingRoutine.exercises[idx - 1] = temp;
      renderTemplateExercisesEditor();
    } else if (action === 'move-down' && idx < state.editingRoutine.exercises.length - 1) {
      const temp = state.editingRoutine.exercises[idx];
      state.editingRoutine.exercises[idx] = state.editingRoutine.exercises[idx + 1];
      state.editingRoutine.exercises[idx + 1] = temp;
      renderTemplateExercisesEditor();
    } else if (action === 'delete-template-ex') {
      state.editingRoutine.exercises.splice(idx, 1);
      renderTemplateExercisesEditor();
    }
  });

  // 課表庫管理按鈕
  document.getElementById('createNewRoutineBtn').addEventListener('click', () => openRoutineEditor(null));
  document.getElementById('closeRoutineEditorBtn').addEventListener('click', () => {
    document.getElementById('routineEditorModal').classList.add('hidden');
  });
  document.getElementById('cancelRoutineEditBtn').addEventListener('click', () => {
    document.getElementById('routineEditorModal').classList.add('hidden');
  });
  document.getElementById('saveRoutineTemplateBtn').addEventListener('click', () => {
    const name = document.getElementById('routineNameInput').value.trim();
    if (!name) return alert('請填寫課表名稱');

    state.editingRoutine.name = name;
    state.editingRoutine.category = document.getElementById('routineCategorySelect').value;

    const existIdx = state.routines.findIndex(r => r.id === state.editingRoutine.id);
    if (existIdx >= 0) state.routines[existIdx] = state.editingRoutine;
    else state.routines.push(state.editingRoutine);

    saveState();
    renderRoutinesView();
    document.getElementById('routineEditorModal').classList.add('hidden');
    alertToast(`課表「${name}」已儲存`);
  });

  // 歷史訓練歸檔卡片事件 (生成圖卡 / 刪除)
  document.getElementById('workoutSessionsContainer').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    const sessId = btn.getAttribute('data-session-id');

    if (action === 'view-share-card') {
      const sess = state.sessions.find(s => s.id === sessId);
      if (sess) openWorkoutSummaryModal(sess);
    } else if (action === 'delete-session') {
      if (confirm('確定刪除該次訓練紀錄？刪除後數據與 PR 會同步扣除重新計算。')) {
        state.sessions = state.sessions.filter(s => s.id !== sessId);
        saveState();
        renderAnalyticsView();
        alertToast('已刪除該次訓練歸檔');
      }
    }
  });

  // 新增動作庫抽屜與打字搜尋/建立
  document.getElementById('openAddExToWorkoutBtn').addEventListener('click', () => openExercisePicker('workout'));
  document.getElementById('addExerciseToTemplateBtn').addEventListener('click', () => openExercisePicker('routine'));
  document.getElementById('closePickerModalBtn').addEventListener('click', () => {
    document.getElementById('exercisePickerModal').classList.add('hidden');
  });
  document.getElementById('closeSwapTodayBtn').addEventListener('click', () => {
    document.getElementById('swapTodayModal').classList.add('hidden');
  });

  const pickerInput = document.getElementById('pickerSearchOrAddInput');
  pickerInput.addEventListener('input', (e) => {
    const activeCatBtn = document.querySelector('.picker-filter-btn.bg-accent-green');
    const cat = activeCatBtn ? activeCatBtn.getAttribute('data-cat') : '全部';
    renderPickerExerciseList(cat, e.target.value);
  });
  pickerInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      createAndAddCustomExercise();
    }
  });
  document.getElementById('quickCreateExBtn').addEventListener('click', createAndAddCustomExercise);

  document.querySelectorAll('.picker-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.picker-filter-btn').forEach(b => {
        b.className = 'picker-filter-btn px-3 py-1 rounded-full text-xs font-bold bg-iron-800 text-slate-300';
      });
      btn.className = 'picker-filter-btn px-3 py-1 rounded-full text-xs font-bold bg-accent-green text-iron-950';
      const cat = btn.getAttribute('data-cat');
      const query = document.getElementById('pickerSearchOrAddInput').value;
      renderPickerExerciseList(cat, query);
    });
  });

  // 一鍵清空所有訓練紀錄與 PR (保留課表與排程)
  document.getElementById('clearAllHistoryBtn').addEventListener('click', () => {
    if (confirm('確定要清空所有歷史訓練紀錄與 PR 嗎？\n\n（您的自訂課表範本與每週排程會完整保留，僅清除歷史訓練紀錄）')) {
      state.sessions = [];
      saveState();
      renderAnalyticsView();
      alertToast('已成功清空所有訓練紀錄與 PR！');
      sound.vibrate(30);
    }
  });

  // 徹底出廠重置
  document.getElementById('factoryResetBtn').addEventListener('click', () => {
    if (confirm('⚠️ 警告：這將徹底清除所有資料（包含所有課表、排程、歷史紀錄），恢復全新狀態！確定要繼續嗎？')) {
      localStorage.clear();
      state.exercises = [...DEFAULT_EXERCISES];
      state.routines = [...DEFAULT_ROUTINES];
      state.schedule = {
        mode: 'weekly',
        weeklySplit: { 1: 'push-a', 2: 'pull-a', 3: null, 4: null, 5: 'leg-a', 6: null, 0: null },
        cycleSteps: ['push-a', 'pull-a', 'leg-a', 'rest'],
        cycleIndex: 0
      };
      state.sessions = [];
      state.bodyLogs = [];
      state.activeWorkout = null;
      saveState();
      location.reload();
    }
  });

  // 匯出 JSON 備份
  document.getElementById('exportJsonBackupBtn').addEventListener('click', () => {
    const backup = {
      version: '5.0',
      exportDate: new Date().toISOString(),
      exercises: state.exercises,
      routines: state.routines,
      schedule: state.schedule,
      sessions: state.sessions,
      bodyLogs: state.bodyLogs,
      activeWorkout: state.activeWorkout
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ironlog-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    alertToast('備份已下載至手機本地');
  });

  // 匯入 JSON 還原
  document.getElementById('importJsonBackupInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported) {
          if (imported.exercises) state.exercises = imported.exercises;
          if (imported.routines) state.routines = imported.routines;
          if (imported.schedule) state.schedule = imported.schedule;
          if (imported.sessions) state.sessions = imported.sessions;
          if (imported.bodyLogs) state.bodyLogs = imported.bodyLogs;
          if (imported.activeWorkout) state.activeWorkout = imported.activeWorkout;
          saveState();
          renderWorkoutSheet();
          renderRoutinesView();
          renderAnalyticsView();
          alertToast('🎉 備份已成功還原！');
        }
      } catch (err) {
        alert('解析檔案失敗，請檢查檔案格式');
      }
    };
    reader.readAsText(file);
  });
}

function switchNavTab(targetNav) {
  state.currentNav = targetNav;

  document.querySelectorAll('.tab-pane').forEach(el => el.classList.add('hidden'));
  const activePane = document.getElementById(targetNav);
  if (activePane) activePane.classList.remove('hidden');

  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    const isCurrent = btn.getAttribute('data-nav') === targetNav;
    if (isCurrent) {
      btn.className = 'nav-tab-btn active flex flex-col items-center justify-center py-1.5 rounded-xl text-accent-green transition tap-active';
    } else {
      btn.className = 'nav-tab-btn flex flex-col items-center justify-center py-1.5 rounded-xl text-slate-400 hover:text-slate-200 transition tap-active';
    }
  });

  if (targetNav === 'tab-workout') {
    renderWorkoutSheet();
  } else if (targetNav === 'tab-routines') {
    renderRoutinesView();
  } else if (targetNav === 'tab-analytics') {
    renderAnalyticsView();
  }

  if (window.lucide) lucide.createIcons();
}

// ======================= 13. 應用程式入口 =======================
window.addEventListener('DOMContentLoaded', () => {
  loadState();
  initGymToolbox();
  setupEventListeners();
  renderWorkoutSheet();
  updateManualTimerDisplay();

  if (window.lucide) lucide.createIcons();
});
