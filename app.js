/**
 * IronLog Pro - 核心應用程式邏輯 (Hevy + Fitbod Clean Workflow)
 * 具備訓練工作表打勾流、肌群疲勞恢復模型、Chart.js 進階圖表、槓片速算抽屜
 */

// ======================= 1. 預設動作庫與替代關係 =======================
const DEFAULT_EXERCISES = [
  {
    id: 'bench-press',
    name: '平板槓鈴臥推 (Bench Press)',
    category: '胸部',
    equipment: '槓鈴',
    alternatives: ['db-bench-press', 'chest-press-machine', 'dips']
  },
  {
    id: 'db-bench-press',
    name: '平板啞鈴臥推 (DB Bench Press)',
    category: '胸部',
    equipment: '啞鈴',
    alternatives: ['bench-press', 'incline-db-press']
  },
  {
    id: 'incline-db-press',
    name: '上斜啞鈴臥推 (Incline DB Press)',
    category: '胸部',
    equipment: '啞鈴',
    alternatives: ['bench-press', 'chest-press-machine']
  },
  {
    id: 'chest-press-machine',
    name: '坐姿機械胸推 (Chest Press Machine)',
    category: '胸部',
    equipment: '機械',
    alternatives: ['bench-press', 'db-bench-press']
  },
  {
    id: 'squat',
    name: '槓鈴頸後深蹲 (Back Squat)',
    category: '腿部',
    equipment: '槓鈴',
    alternatives: ['leg-press', 'front-squat', 'goblet-squat']
  },
  {
    id: 'front-squat',
    name: '槓鈴前蹲舉 (Front Squat)',
    category: '腿部',
    equipment: '槓鈴',
    alternatives: ['squat', 'leg-press']
  },
  {
    id: 'leg-press',
    name: '45度仰臥腿推機 (Leg Press)',
    category: '腿部',
    equipment: '機械',
    alternatives: ['squat', 'front-squat']
  },
  {
    id: 'rdl',
    name: '羅馬尼亞硬舉 (RDL)',
    category: '腿部',
    equipment: '槓鈴',
    alternatives: ['deadlift', 'leg-curl']
  },
  {
    id: 'deadlift',
    name: '傳統硬舉 (Conventional Deadlift)',
    category: '背部',
    equipment: '槓鈴',
    alternatives: ['sumo-deadlift', 'barbell-row']
  },
  {
    id: 'sumo-deadlift',
    name: '相撲硬舉 (Sumo Deadlift)',
    category: '背部',
    equipment: '槓鈴',
    alternatives: ['deadlift', 'rdl']
  },
  {
    id: 'barbell-row',
    name: '槓鈴划船 (Barbell Row)',
    category: '背部',
    equipment: '槓鈴',
    alternatives: ['lat-pulldown', 'seated-cable-row']
  },
  {
    id: 'lat-pulldown',
    name: '高位滑輪下拉 (Lat Pulldown)',
    category: '背部',
    equipment: '滑輪',
    alternatives: ['pull-up', 'barbell-row']
  },
  {
    id: 'pull-up',
    name: '引體向上 (Pull-Up)',
    category: '背部',
    equipment: '自體重',
    alternatives: ['lat-pulldown', 'barbell-row']
  },
  {
    id: 'ohp',
    name: '槓鈴站姿肩推 (Overhead Press)',
    category: '肩部',
    equipment: '槓鈴',
    alternatives: ['db-shoulder-press', 'lateral-raise']
  },
  {
    id: 'db-shoulder-press',
    name: '坐姿啞鈴肩推 (DB Shoulder Press)',
    category: '肩部',
    equipment: '啞鈴',
    alternatives: ['ohp', 'lateral-raise']
  },
  {
    id: 'lateral-raise',
    name: '啞鈴側平舉 (Lateral Raise)',
    category: '肩部',
    equipment: '啞鈴',
    alternatives: ['cable-lateral-raise', 'ohp']
  },
  {
    id: 'bicep-curl',
    name: '槓鈴/啞鈴彎舉 (Bicep Curl)',
    category: '手臂/核心',
    equipment: '啞鈴',
    alternatives: ['tricep-pushdown']
  },
  {
    id: 'tricep-pushdown',
    name: '滑輪三頭肌下壓 (Tricep Pushdown)',
    category: '手臂/核心',
    equipment: '滑輪',
    alternatives: ['dips', 'bicep-curl']
  },
  {
    id: 'dips',
    name: '雙槓臂屈伸 (Dips)',
    category: '胸部',
    equipment: '自體重',
    alternatives: ['chest-press-machine', 'tricep-pushdown']
  }
];

// 槓片規格與色彩
const PLATE_SPECS = [
  { weight: 25, color: '#ef4444', textColor: '#ffffff', label: '25', height: 'h-16', width: 'w-4', border: 'border-red-600' },
  { weight: 20, color: '#3b82f6', textColor: '#ffffff', label: '20', height: 'h-15', width: 'w-3.5', border: 'border-blue-600' },
  { weight: 15, color: '#eab308', textColor: '#000000', label: '15', height: 'h-13', width: 'w-3.5', border: 'border-yellow-600' },
  { weight: 10, color: '#10b981', textColor: '#ffffff', label: '10', height: 'h-11', width: 'w-3', border: 'border-emerald-600' },
  { weight: 5, color: '#f8fafc', textColor: '#0f172a', label: '5', height: 'h-9', width: 'w-3', border: 'border-slate-300' },
  { weight: 2.5, color: '#1e293b', textColor: '#f8fafc', label: '2.5', height: 'h-8', width: 'w-2.5', border: 'border-slate-600' },
  { weight: 1.25, color: '#94a3b8', textColor: '#0f172a', label: '1.25', height: 'h-6', width: 'w-2', border: 'border-slate-400' }
];

// RTS 官方 RPE 矩陣 (前5下精確對照)
const RTS_RPE_TABLE = {
  1: { 10: 1.000, 9.5: 0.978, 9: 0.955, 8.5: 0.939, 8: 0.922 },
  2: { 10: 0.955, 9.5: 0.939, 9: 0.922, 8.5: 0.907, 8: 0.892 },
  3: { 10: 0.922, 9.5: 0.907, 9: 0.892, 8.5: 0.878, 8: 0.863 },
  4: { 10: 0.892, 9.5: 0.878, 9: 0.863, 8.5: 0.849, 8: 0.834 },
  5: { 10: 0.863, 9.5: 0.849, 9: 0.834, 8.5: 0.819, 8: 0.811 },
  6: { 10: 0.834, 9.5: 0.819, 9: 0.804, 8.5: 0.790, 8: 0.774 },
  8: { 10: 0.774, 9.5: 0.760, 9: 0.744, 8.5: 0.728, 8: 0.713 },
  10: { 10: 0.713, 9.5: 0.697, 9: 0.681, 8.5: 0.665, 8: 0.649 },
  12: { 10: 0.649, 9.5: 0.632, 9: 0.617, 8.5: 0.601, 8: 0.584 }
};

// ======================= 2. 本地儲存與全域狀態 =======================
const STORAGE_KEYS = {
  EXERCISES: 'ironlog_pro_exercises',
  HISTORY: 'ironlog_pro_history',
  ACTIVE_WORKOUT: 'ironlog_pro_active_workout',
  SETTINGS: 'ironlog_pro_settings'
};

// 豐富的歷史真實數據，使首次使用即具備圖表與恢復展示
const INITIAL_DEMO_HISTORY = [
  // 6 天前 (深蹲主項)
  { id: 'h1', date: '2026-10-29', timestamp: 1793260800000, exerciseId: 'squat', exerciseName: '槓鈴頸後深蹲 (Back Squat)', category: '腿部', weight: 110, reps: 5, rpe: 8, setType: 'working', e1rm: 135.6 },
  { id: 'h2', date: '2026-10-29', timestamp: 1793260860000, exerciseId: 'squat', exerciseName: '槓鈴頸後深蹲 (Back Squat)', category: '腿部', weight: 115, reps: 5, rpe: 8.5, setType: 'working', e1rm: 140.4 },
  { id: 'h3', date: '2026-10-29', timestamp: 1793260920000, exerciseId: 'squat', exerciseName: '槓鈴頸後深蹲 (Back Squat)', category: '腿部', weight: 120, reps: 5, rpe: 9, setType: 'working', e1rm: 143.9 },
  // 4 天前 (臥推主項)
  { id: 'h4', date: '2026-10-31', timestamp: 1793433600000, exerciseId: 'bench-press', exerciseName: '平板槓鈴臥推 (Bench Press)', category: '胸部', weight: 75, reps: 8, rpe: 8, setType: 'working', e1rm: 105.2 },
  { id: 'h5', date: '2026-10-31', timestamp: 1793433660000, exerciseId: 'bench-press', exerciseName: '平板槓鈴臥推 (Bench Press)', category: '胸部', weight: 80, reps: 8, rpe: 8.5, setType: 'working', e1rm: 110.0 },
  { id: 'h6', date: '2026-10-31', timestamp: 1793433720000, exerciseId: 'incline-db-press', exerciseName: '上斜啞鈴臥推 (Incline DB Press)', category: '胸部', weight: 28, reps: 10, rpe: 8.5, setType: 'working', e1rm: 42.1 },
  // 2 天前 (硬舉與背部)
  { id: 'h7', date: '2026-11-02', timestamp: 1793606400000, exerciseId: 'deadlift', exerciseName: '傳統硬舉 (Conventional Deadlift)', category: '背部', weight: 140, reps: 5, rpe: 8, setType: 'working', e1rm: 172.6 },
  { id: 'h8', date: '2026-11-02', timestamp: 1793606460000, exerciseId: 'barbell-row', exerciseName: '槓鈴划船 (Barbell Row)', category: '背部', weight: 70, reps: 8, rpe: 8, setType: 'working', e1rm: 98.2 }
];

const state = {
  exercises: [],
  history: [],
  settings: {
    barWeight: 20,
    restDuration: 90
  },
  // 當前進行中的訓練工作表 (Workout Sheet)
  activeWorkout: {
    startTime: Date.now(),
    exercises: [
      {
        exerciseId: 'bench-press',
        sets: [
          { id: 's1', setType: 'working', weight: 80, reps: 8, rpe: 8, isCompleted: false },
          { id: 's2', setType: 'working', weight: 80, reps: 8, rpe: 8, isCompleted: false },
          { id: 's3', setType: 'working', weight: 80, reps: 8, rpe: 8.5, isCompleted: false }
        ]
      },
      {
        exerciseId: 'incline-db-press',
        sets: [
          { id: 's4', setType: 'working', weight: 30, reps: 10, rpe: 8, isCompleted: false },
          { id: 's5', setType: 'working', weight: 30, reps: 10, rpe: 8.5, isCompleted: false }
        ]
      }
    ]
  },
  currentNav: 'tab-workout',
  // 計時器
  timer: {
    intervalId: null,
    remainingSeconds: 0,
    isRunning: false
  },
  // 抽屜臨時狀態
  currentPlateTarget: {
    weight: 80,
    originSetRef: null
  },
  currentSwapExerciseId: null,
  // Chart.js 實例快取
  charts: {
    strength: null,
    muscle: null
  }
};

// ======================= 3. 音效與震動回饋 =======================
class HapticFeedback {
  constructor() {
    this.audioCtx = null;
  }

  initAudio() {
    if (!this.audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.audioCtx = new AC();
    }
  }

  beep(freq = 880, type = 'sine', duration = 0.15) {
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {}
  }

  playCheckSound() {
    this.beep(880, 'sine', 0.08);
    this.vibrate(25);
  }

  playPRCelebration() {
    this.beep(523, 'triangle', 0.1);
    setTimeout(() => this.beep(659, 'triangle', 0.1), 100);
    setTimeout(() => this.beep(784, 'triangle', 0.12), 200);
    setTimeout(() => this.beep(1046, 'sine', 0.35), 320);
    this.vibrate([80, 50, 120, 50, 200]);
  }

  playTimerDone() {
    this.beep(784, 'square', 0.12);
    setTimeout(() => this.beep(880, 'square', 0.12), 160);
    setTimeout(() => this.beep(1046, 'square', 0.3), 320);
    this.vibrate([150, 100, 150, 100, 300]);
  }

  vibrate(pattern = 25) {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
  }
}

const feedback = new HapticFeedback();

// ======================= 4. 計算函式 (e1RM, 槓片, 肌群恢復) =======================

function calculateE1RM(weight, reps, rpe = 8) {
  if (weight <= 0 || reps <= 0) return 0;
  const repKey = Math.min(Math.max(1, Math.round(reps)), 12);
  const rpeKey = Math.min(Math.max(6, rpe), 10);

  if (RTS_RPE_TABLE[repKey] && RTS_RPE_TABLE[repKey][rpeKey]) {
    return Math.round((weight / RTS_RPE_TABLE[repKey][rpeKey]) * 10) / 10;
  }
  const rir = Math.max(0, 10 - rpe);
  return Math.round((weight * (1 + (reps + rir) / 30)) * 10) / 10;
}

function calculatePlates(totalWeight, barWeight = 20) {
  if (totalWeight < barWeight) {
    return { sideWeight: 0, plates: [], remainder: 0, isValid: false };
  }
  const sideWeight = (totalWeight - barWeight) / 2;
  let remaining = sideWeight;
  const plates = [];

  for (const spec of PLATE_SPECS) {
    if (remaining <= 0) break;
    const count = Math.floor((remaining + 0.0001) / spec.weight);
    if (count > 0) {
      plates.push({ ...spec, count });
      remaining = Math.round((remaining - count * spec.weight) * 100) / 100;
    }
  }
  return { sideWeight, plates, remainder: remaining, isValid: true };
}

/**
 * Fitbod 風格肌群疲勞恢復模型
 * 依據距今訓練天數與近 7 天總訓練組數計算恢復度 (0~100%)
 */
function calculateMuscleRecovery() {
  const muscleGroups = ['胸部', '背部', '腿部', '肩部', '手臂/核心'];
  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  const results = {};

  muscleGroups.forEach(group => {
    // 篩選屬於該肌群的歷史組數
    const groupLogs = state.history.filter(h => {
      const ex = state.exercises.find(e => e.id === h.exerciseId);
      return (ex && ex.category === group) || h.category === group;
    }).sort((a, b) => b.timestamp - a.timestamp);

    if (groupLogs.length === 0) {
      // 從未訓練過，100% 恢復
      results[group] = {
        pct: 100,
        daysAgo: null,
        recentSets: 0,
        statusText: '完全充血恢復',
        color: 'text-hevy-green',
        bg: 'bg-hevy-green'
      };
      return;
    }

    const lastLog = groupLogs[0];
    const daysAgo = Math.max(0, Math.floor((now - lastLog.timestamp) / ONE_DAY_MS));

    // 計算過去 7 天的總組數
    const sevenDaysAgo = now - 7 * ONE_DAY_MS;
    const recentSets = groupLogs.filter(h => h.timestamp >= sevenDaysAgo).length;

    let recoveryPct = 100;
    if (daysAgo === 0) {
      recoveryPct = Math.max(15, 30 - recentSets * 2);
    } else if (daysAgo === 1) {
      recoveryPct = Math.min(65, 45 + (10 - recentSets) * 2);
    } else if (daysAgo === 2) {
      recoveryPct = Math.min(85, 75 + (10 - recentSets));
    } else {
      recoveryPct = 100;
    }

    let statusText = '完全充血恢復';
    let color = 'text-hevy-green';
    let bg = 'bg-hevy-green';

    if (recoveryPct < 40) {
      statusText = '疲勞修復中';
      color = 'text-rose-400';
      bg = 'bg-rose-500';
    } else if (recoveryPct < 80) {
      statusText = '恢復過渡中';
      color = 'text-amber-400';
      bg = 'bg-amber-500';
    }

    results[group] = {
      pct: Math.round(recoveryPct),
      daysAgo,
      recentSets,
      statusText,
      color,
      bg
    };
  });

  return results;
}

// 取得某動作的歷史最佳 PR 與前次表現
function getExerciseHistoryStats(exerciseId) {
  const logs = state.history.filter(h => h.exerciseId === exerciseId);
  if (logs.length === 0) {
    return { lastSet: null, bestWeight: 0, bestE1rm: 0 };
  }

  // 排序找出最新一組
  const sortedByTime = [...logs].sort((a, b) => b.timestamp - a.timestamp);
  const lastSet = sortedByTime[0];

  const bestWeight = Math.max(...logs.map(l => l.weight || 0));
  const bestE1rm = Math.max(...logs.map(l => l.e1rm || 0));

  return { lastSet, bestWeight, bestE1rm };
}

// ======================= 5. 資料持久化 =======================
function loadLocalData() {
  try {
    const rawEx = localStorage.getItem(STORAGE_KEYS.EXERCISES);
    state.exercises = rawEx ? JSON.parse(rawEx) : [...DEFAULT_EXERCISES];

    const rawHist = localStorage.getItem(STORAGE_KEYS.HISTORY);
    state.history = rawHist ? JSON.parse(rawHist) : [...INITIAL_DEMO_HISTORY];

    const rawWorkout = localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKOUT);
    if (rawWorkout) {
      state.activeWorkout = JSON.parse(rawWorkout);
    }

    const rawSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (rawSettings) {
      state.settings = { ...state.settings, ...JSON.parse(rawSettings) };
    }
  } catch (e) {
    console.error('Storage load failed', e);
    state.exercises = [...DEFAULT_EXERCISES];
    state.history = [...INITIAL_DEMO_HISTORY];
  }
}

function saveLocalData() {
  try {
    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(state.exercises));
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(state.history));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT, JSON.stringify(state.activeWorkout));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
  } catch (e) {
    console.error('Storage save failed', e);
  }
}

// ======================= 6. UI 渲染：訓練工作表 (Workout Sheet) =======================

function renderWorkoutSheet() {
  const container = document.getElementById('workoutSheetsContainer');
  const summaryBadge = document.getElementById('todaySummaryStats');
  container.innerHTML = '';

  let totalCompletedSets = 0;
  let totalVolumeKg = 0;

  // 渲染頂部肌群恢復快速走馬燈膠囊
  renderQuickRecoveryCapsules();

  if (state.activeWorkout.exercises.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 bg-iron-900 border border-iron-800 rounded-2xl p-6 space-y-3">
        <i data-lucide="dumbbell" class="w-8 h-8 text-slate-500 mx-auto"></i>
        <h3 class="font-bold text-slate-300 text-sm">今日課表尚無動作</h3>
        <p class="text-xs text-slate-500">點擊下方「＋ 新增動作」開始今日高強度訓練！</p>
      </div>
    `;
    summaryBadge.textContent = '0 組 • 0 kg 容量';
    if (window.lucide) lucide.createIcons();
    return;
  }

  state.activeWorkout.exercises.forEach((item, exIndex) => {
    const exObj = state.exercises.find(e => e.id === item.exerciseId) || { name: '未知動作', category: '全身' };
    const stats = getExerciseHistoryStats(item.exerciseId);

    // 計算該動作超負荷建議
    let overloadTipText = '建立基準數據';
    if (stats.lastSet) {
      overloadTipText = `上次 ${stats.lastSet.weight}kg × ${stats.lastSet.reps} ➔ 建議突破：${stats.lastSet.weight + 2.5}kg 或 ${stats.lastSet.reps + 1}次`;
    }

    const card = document.createElement('div');
    card.className = 'bg-iron-900 border border-iron-800 rounded-2xl p-4 shadow-xl space-y-3';

    // 卡片標頭：動作名稱 + 快捷按鈕 (槓片、替換、刪除)
    card.innerHTML = `
      <div class="flex items-start justify-between">
        <div>
          <div class="flex items-center gap-2">
            <h3 class="font-black text-white text-base tracking-tight">${exObj.name}</h3>
            <span class="text-[10px] font-bold px-1.5 py-0.2 rounded bg-iron-800 text-slate-300">${exObj.category}</span>
          </div>
          <div class="text-[11px] text-hevy-green font-semibold mt-0.5 flex items-center gap-1">
            <i data-lucide="zap" class="w-3 h-3"></i>
            <span>${overloadTipText}</span>
          </div>
        </div>

        <div class="flex items-center gap-1">
          <button data-action="plate" data-ex-index="${exIndex}" class="p-1.5 rounded-lg bg-iron-800 hover:bg-iron-750 text-slate-300 hover:text-hevy-amber text-xs flex items-center gap-1" title="槓片計算與熱身">
            <i data-lucide="disc" class="w-3.5 h-3.5 text-hevy-amber"></i>
            <span class="text-[10px] font-bold font-mono">槓片</span>
          </button>
          <button data-action="swap" data-ex-id="${item.exerciseId}" data-ex-index="${exIndex}" class="p-1.5 rounded-lg bg-iron-800 hover:bg-iron-750 text-slate-300 hover:text-hevy-blue text-xs flex items-center gap-1" title="替代動作">
            <i data-lucide="arrow-left-right" class="w-3.5 h-3.5 text-hevy-blue"></i>
          </button>
          <button data-action="remove-ex" data-ex-index="${exIndex}" class="p-1.5 rounded-lg bg-iron-800 hover:bg-rose-900/40 text-slate-500 hover:text-rose-400 text-xs" title="移除動作">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>

      <!-- Hevy 經典表格清單 (Workout Sheet) -->
      <div class="space-y-1.5">
        <div class="grid grid-cols-12 text-[10px] font-bold font-mono text-slate-400 px-2 py-1">
          <span class="col-span-2">組別</span>
          <span class="col-span-3">前次表現</span>
          <span class="col-span-3 text-center">公斤 (KG)</span>
          <span class="col-span-2 text-center">次數</span>
          <span class="col-span-2 text-center">完成</span>
        </div>

        <div class="space-y-1" id="setsContainer-${exIndex}">
          <!-- 組別行 -->
        </div>

        <!-- 新增組數按鈕 -->
        <button data-action="add-set" data-ex-index="${exIndex}" class="w-full py-2 rounded-xl bg-iron-850 hover:bg-iron-800 border border-dashed border-iron-750 text-xs font-bold text-slate-400 hover:text-white flex items-center justify-center gap-1 mt-1 transition">
          <i data-lucide="plus" class="w-3.5 h-3.5"></i> 新增一組
        </button>
      </div>
    `;

    container.appendChild(card);

    // 渲染該動作的所有組數行
    const setsBox = card.querySelector(`#setsContainer-${exIndex}`);
    item.sets.forEach((set, setIndex) => {
      if (set.isCompleted) {
        totalCompletedSets++;
        totalVolumeKg += (set.weight * set.reps);
      }

      const row = document.createElement('div');
      const isDone = set.isCompleted;

      // 類型標籤 (W: 熱身, 數字: 正式組, D: 遞減, F: 力竭)
      let setTypeBadge = `${setIndex + 1}`;
      let setTypeClass = 'bg-iron-800 text-slate-300';
      if (set.setType === 'warmup') {
        setTypeBadge = 'W';
        setTypeClass = 'bg-amber-500/20 text-amber-400';
      } else if (set.setType === 'drop') {
        setTypeBadge = 'D';
        setTypeClass = 'bg-purple-500/20 text-purple-400';
      } else if (set.setType === 'failure') {
        setTypeBadge = 'F';
        setTypeClass = 'bg-rose-500/20 text-rose-400';
      }

      row.className = `grid grid-cols-12 items-center gap-1 p-1.5 rounded-xl transition ${isDone ? 'bg-iron-950/40 text-slate-500' : 'bg-iron-950/90 text-white'}`;
      
      const prevText = stats.lastSet ? `${stats.lastSet.weight}k×${stats.lastSet.reps}` : '—';

      row.innerHTML = `
        <!-- 組別標籤 (點擊可切換 熱身/正式) -->
        <div class="col-span-2 flex items-center">
          <button data-action="toggle-set-type" data-ex-index="${exIndex}" data-set-index="${setIndex}" class="w-7 h-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center ${setTypeClass} tap-active" title="點擊切換熱身/正式組">
            ${setTypeBadge}
          </button>
        </div>

        <!-- 前次表現紀錄 -->
        <div class="col-span-3 text-[11px] font-mono text-slate-500 truncate">
          ${prevText}
        </div>

        <!-- 重量輸入框 -->
        <div class="col-span-3">
          <input type="number" step="0.5" value="${set.weight}" data-field="weight" data-ex-index="${exIndex}" data-set-index="${setIndex}"
            class="w-full bg-iron-900 border border-iron-750 focus:border-hevy-green text-center text-sm font-mono font-black py-1.5 rounded-lg text-white ${isDone ? 'opacity-60' : ''}" inputmode="decimal">
        </div>

        <!-- 次數輸入框 -->
        <div class="col-span-2">
          <input type="number" step="1" value="${set.reps}" data-field="reps" data-ex-index="${exIndex}" data-set-index="${setIndex}"
            class="w-full bg-iron-900 border border-iron-750 focus:border-hevy-green text-center text-sm font-mono font-bold py-1.5 rounded-lg text-white ${isDone ? 'opacity-60' : ''}" inputmode="numeric">
        </div>

        <!-- 完成打勾按鈕 (Hevy 招牌 Checkmark) -->
        <div class="col-span-2 flex justify-center">
          <button data-action="toggle-complete" data-ex-index="${exIndex}" data-set-index="${setIndex}"
            class="w-8 h-8 rounded-xl font-bold flex items-center justify-center transition tap-active ${isDone ? 'bg-hevy-green text-iron-950 shadow-md shadow-hevy-green/30 check-pop' : 'bg-iron-800 border border-iron-700 text-slate-500 hover:text-slate-300'}">
            <i data-lucide="check" class="w-4 h-4 stroke-[3]"></i>
          </button>
        </div>
      `;

      setsBox.appendChild(row);
    });
  });

  summaryBadge.textContent = `${totalCompletedSets} 組完成 • ${totalVolumeKg.toLocaleString()} kg 容量`;
  if (window.lucide) lucide.createIcons();
}

// 快速肌群恢復走馬燈膠囊
function renderQuickRecoveryCapsules() {
  const container = document.getElementById('quickRecoveryScroll');
  const recoveryMap = calculateMuscleRecovery();
  container.innerHTML = '';

  for (const [groupName, rec] of Object.entries(recoveryMap)) {
    const pill = document.createElement('div');
    pill.className = 'flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-iron-900 border border-iron-800 text-[11px] shrink-0 font-medium cursor-pointer tap-active';
    pill.innerHTML = `
      <span class="w-2 h-2 rounded-full ${rec.bg}"></span>
      <span class="text-slate-300">${groupName}</span>
      <span class="font-mono font-bold ${rec.color}">${rec.pct}%</span>
    `;
    pill.addEventListener('click', () => switchNavTab('tab-recovery'));
    container.appendChild(pill);
  }
}

// ======================= 7. UI 渲染：進步數據與 Chart.js 分析 =======================

function renderAnalyticsView() {
  // 1. 核心三項指標
  const totalVolume = state.history.reduce((sum, h) => sum + (h.weight * h.reps), 0);
  const totalSets = state.history.length;
  document.getElementById('statTotalVolume').textContent = (totalVolume >= 1000 ? (totalVolume / 1000).toFixed(1) + 'k' : totalVolume);
  document.getElementById('statTotalSets').textContent = totalSets;

  // 計算歷史 PR 數量
  const prMap = {};
  state.history.forEach(h => {
    if (!prMap[h.exerciseId] || h.e1rm > prMap[h.exerciseId].e1rm) {
      prMap[h.exerciseId] = h;
    }
  });
  document.getElementById('statTotalPRs').textContent = Object.keys(prMap).length;

  // 2. 填入折線圖動作下拉選單
  const select = document.getElementById('analyticsExerciseFilter');
  const currentVal = select.value;
  select.innerHTML = '';

  const availableExIds = [...new Set(state.history.map(h => h.exerciseId))];
  availableExIds.forEach(id => {
    const ex = state.exercises.find(e => e.id === id);
    if (ex) {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = ex.name;
      select.appendChild(opt);
    }
  });

  if (currentVal && availableExIds.includes(currentVal)) {
    select.value = currentVal;
  } else if (availableExIds.length > 0) {
    select.value = availableExIds[0];
  }

  // 3. 繪製估算 1RM 進步折線圖
  renderStrengthLineChart(select.value);

  // 4. 繪製各肌群組數分佈長條圖
  renderMuscleVolumeBarChart();

  // 5. 繪製 PR 榮譽牆
  renderPrGrid(prMap);
}

function renderStrengthLineChart(exerciseId) {
  const ctx = document.getElementById('strengthProgressChart');
  if (!ctx || !window.Chart) return;

  const logs = state.history
    .filter(h => h.exerciseId === exerciseId)
    .sort((a, b) => a.timestamp - b.timestamp);

  const labels = logs.map(l => l.date ? l.date.slice(5) : '');
  const dataPoints = logs.map(l => l.e1rm || calculateE1RM(l.weight, l.reps, l.rpe));

  if (state.charts.strength) {
    state.charts.strength.destroy();
  }

  state.charts.strength = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels.length > 0 ? labels : ['無資料'],
      datasets: [{
        label: '估算 1RM (kg)',
        data: dataPoints.length > 0 ? dataPoints : [0],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#10b981',
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          grid: { color: '#1a2236' },
          ticks: { color: '#64748b', font: { size: 10 } }
        },
        y: {
          grid: { color: '#1a2236' },
          ticks: { color: '#64748b', font: { size: 10 } }
        }
      }
    }
  });
}

function renderMuscleVolumeBarChart() {
  const ctx = document.getElementById('muscleVolumeChart');
  if (!ctx || !window.Chart) return;

  const muscleGroups = ['胸部', '背部', '腿部', '肩部', '手臂'];
  const recoveryMap = calculateMuscleRecovery();
  const counts = muscleGroups.map(g => {
    const key = g === '手臂' ? '手臂/核心' : g;
    return recoveryMap[key] ? recoveryMap[key].recentSets : 0;
  });

  if (state.charts.muscle) {
    state.charts.muscle.destroy();
  }

  state.charts.muscle = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: muscleGroups,
      datasets: [{
        label: '近7天完成組數',
        data: counts,
        backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#06b6d4'],
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#94a3b8', font: { size: 11, weight: 'bold' } }
        },
        y: {
          grid: { color: '#1a2236' },
          ticks: { color: '#64748b', font: { size: 10 }, stepSize: 2 }
        }
      }
    }
  });
}

function renderPrGrid(prMap) {
  const container = document.getElementById('analyticsPrGrid');
  container.innerHTML = '';

  const entries = Object.entries(prMap);
  if (entries.length === 0) {
    container.innerHTML = `<div class="col-span-2 text-center text-xs text-slate-500 py-4">尚無 PR 紀錄，完成組數以建立數據！</div>`;
    return;
  }

  entries.forEach(([exId, log]) => {
    const card = document.createElement('div');
    card.className = 'bg-iron-950 border border-iron-800 rounded-xl p-3 space-y-1';
    card.innerHTML = `
      <div class="text-[11px] font-bold text-slate-300 truncate">${log.exerciseName}</div>
      <div class="flex items-baseline justify-between pt-1">
        <span class="text-[10px] text-slate-500 font-mono">e1RM</span>
        <span class="text-base font-mono font-black text-hevy-green">${log.e1rm} <span class="text-[10px] text-slate-400">kg</span></span>
      </div>
      <div class="flex items-baseline justify-between text-[11px] text-slate-400 font-mono">
        <span>最大負重</span>
        <span class="text-white font-bold">${log.weight} kg × ${log.reps}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

// ======================= 8. UI 渲染：肌群恢復儀表板 (Fitbod Recovery) =======================

function renderRecoveryView() {
  const container = document.getElementById('muscleRecoveryCardsContainer');
  const recoBox = document.getElementById('recommendationText');
  container.innerHTML = '';

  const recoveryMap = calculateMuscleRecovery();

  // 智慧判斷今日最推薦練什麼
  const sortedMuscles = Object.entries(recoveryMap).sort((a, b) => b[1].pct - a[1].pct);
  const bestToTrain = sortedMuscles.filter(([_, rec]) => rec.pct >= 85).map(([name]) => name);

  if (bestToTrain.length > 0) {
    recoBox.innerHTML = `今日最佳就緒：<strong class="text-hevy-green">${bestToTrain.slice(0, 2).join(' & ')}</strong> 已完全充血恢復，推薦今日安排為主訓部位！`;
  } else {
    recoBox.innerHTML = `各大主要肌群均在修復重建中，建議今日進行輕度活動度伸展或有氧主動恢復。`;
  }

  for (const [groupName, rec] of Object.entries(recoveryMap)) {
    const card = document.createElement('div');
    card.className = 'bg-iron-900 border border-iron-800 rounded-xl p-3.5 space-y-2';

    const daysText = rec.daysAgo === null ? '從未訓練' : (rec.daysAgo === 0 ? '今天訓練過' : `${rec.daysAgo} 天前訓練`);

    card.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="font-extrabold text-sm text-white">${groupName}</span>
          <span class="text-[10px] px-2 py-0.5 rounded-full bg-iron-800 font-mono text-slate-400">${daysText}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-xs font-mono font-bold ${rec.color}">${rec.statusText}</span>
          <span class="text-xs font-mono font-black text-white">${rec.pct}%</span>
        </div>
      </div>

      <!-- 進度條 -->
      <div class="w-full bg-iron-950 rounded-full h-2 overflow-hidden">
        <div class="h-full rounded-full ${rec.bg} transition-all duration-500" style="width: ${rec.pct}%"></div>
      </div>

      <div class="flex justify-between text-[11px] text-slate-400 font-mono">
        <span>近 7 天累積組數：${rec.recentSets} Sets</span>
        <button data-action="quick-add-group" data-group="${groupName}" class="text-hevy-green hover:underline text-[11px] font-bold">
          ＋ 加入此肌群動作
        </button>
      </div>
    `;

    container.appendChild(card);
  }
}

// ======================= 9. 抽屜模態操作 (槓片、替代動作、新增動作) =======================

// 展開槓片速算抽屜
function openPlateSheet(weight, targetSetRef = null) {
  state.currentPlateTarget.weight = weight;
  state.currentPlateTarget.originSetRef = targetSetRef;

  const modal = document.getElementById('plateSheetModal');
  const input = document.getElementById('sheetWeightInput');
  input.value = weight;
  renderPlateSheetGraphic();
  modal.classList.remove('hidden');
}

function renderPlateSheetGraphic() {
  const weight = parseFloat(document.getElementById('sheetWeightInput').value) || 0;
  const barWeight = state.settings.barWeight;
  const result = calculatePlates(weight, barWeight);

  document.getElementById('sheetTargetWeightLabel').textContent = `目標重量：${weight} kg (空槓 ${barWeight} kg)`;
  document.getElementById('sheetSideWeightBadge').textContent = `單邊 ${result.sideWeight} kg`;

  const graphic = document.getElementById('sheetBarbellGraphic');
  const summary = document.getElementById('sheetPlatesTextSummary');
  const warmupBox = document.getElementById('sheetWarmupStepsContainer');

  graphic.innerHTML = '';
  summary.innerHTML = '';
  warmupBox.innerHTML = '';

  if (!result.isValid) {
    summary.innerHTML = `<span class="text-xs text-rose-400">總重量低於空槓重 (${barWeight}kg)</span>`;
    return;
  }

  // 繪製槓心
  const bar = document.createElement('div');
  bar.className = 'absolute left-0 right-0 h-3 bg-gradient-to-b from-slate-300 via-slate-100 to-slate-400 rounded-sm z-0 top-1/2 -translate-y-1/2';
  graphic.appendChild(bar);

  // 擋圈
  const collar = document.createElement('div');
  collar.className = 'w-2.5 h-14 bg-gradient-to-r from-amber-600 to-amber-500 rounded-sm z-10 mr-1.5 shrink-0';
  graphic.appendChild(collar);

  if (result.plates.length === 0) {
    summary.innerHTML = `<span class="text-xs font-mono text-slate-400">目前為空槓，無需掛片</span>`;
  } else {
    result.plates.forEach(p => {
      for (let i = 0; i < p.count; i++) {
        const plateEl = document.createElement('div');
        plateEl.className = `${p.width} ${p.height} ${p.border} rounded-sm z-10 mr-1 flex items-center justify-center font-black text-[9px] shadow shrink-0`;
        plateEl.style.backgroundColor = p.color;
        plateEl.style.color = p.textColor;
        plateEl.textContent = p.label;
        graphic.appendChild(plateEl);
      }

      const tag = document.createElement('span');
      tag.className = 'px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-iron-850 border border-iron-700 text-slate-200';
      tag.textContent = `${p.weight}k × ${p.count}`;
      summary.appendChild(tag);
    });

    // 夾簧
    const clip = document.createElement('div');
    clip.className = 'w-2 h-7 bg-slate-300 rounded-sm z-10 ml-0.5 shrink-0';
    graphic.appendChild(clip);
  }

  // 渲染科學熱身排程 (空槓, 50%, 70%, 85%)
  const warmupPresets = [
    { name: 'Set 1: 空槓活動度', w: barWeight, reps: '10 次' },
    { name: 'Set 2: 神經啟動', w: Math.max(barWeight, Math.round((barWeight + (weight - barWeight) * 0.5) / 2.5) * 2.5), reps: '5 次' },
    { name: 'Set 3: 力量衝動', w: Math.max(barWeight, Math.round((barWeight + (weight - barWeight) * 0.7) / 2.5) * 2.5), reps: '3 次' },
    { name: 'Set 4: 重量適應', w: Math.max(barWeight, Math.round((barWeight + (weight - barWeight) * 0.85) / 2.5) * 2.5), reps: '1~2 次' }
  ];

  warmupPresets.forEach(step => {
    const pCalc = calculatePlates(step.w, barWeight);
    const pText = pCalc.plates.length > 0 ? pCalc.plates.map(p => `${p.weight}k×${p.count}`).join('+') : '空槓';

    const card = document.createElement('div');
    card.className = 'p-2 rounded-xl bg-iron-950 border border-iron-800 hover:border-hevy-green flex items-center justify-between text-xs cursor-pointer tap-active';
    card.innerHTML = `
      <div>
        <span class="font-bold text-slate-200">${step.name}</span>
        <span class="text-[10px] text-slate-400 block font-mono">單邊掛：<strong class="text-hevy-amber">${pText}</strong></span>
      </div>
      <div class="text-right font-mono">
        <span class="font-black text-sm text-white">${step.w} kg</span>
        <span class="text-[10px] text-hevy-green block">${step.reps}</span>
      </div>
    `;

    // 點擊帶入
    card.addEventListener('click', () => {
      document.getElementById('sheetWeightInput').value = step.w;
      renderPlateSheetGraphic();
      feedback.vibrate(20);
    });

    warmupBox.appendChild(card);
  });
}

// 展開替換動作抽屜
function openSwapModal(exerciseId, exIndex) {
  state.currentSwapExerciseId = exerciseId;
  const currentEx = state.exercises.find(e => e.id === exerciseId);
  const modal = document.getElementById('swapExerciseModal');
  const label = document.getElementById('swapOriginNameLabel');
  const list = document.getElementById('swapAlternativesList');

  label.textContent = `原動作：${currentEx ? currentEx.name : ''} (${currentEx ? currentEx.equipment : ''})`;
  list.innerHTML = '';

  // 找出同肌群或替代陣列裡的動作
  const alts = state.exercises.filter(e => {
    if (e.id === exerciseId) return false;
    return (currentEx.alternatives && currentEx.alternatives.includes(e.id)) || e.category === currentEx.category;
  });

  alts.forEach(alt => {
    const card = document.createElement('div');
    card.className = 'p-3 rounded-xl bg-iron-950 border border-iron-800 hover:border-hevy-blue flex items-center justify-between text-xs cursor-pointer tap-active transition';
    card.innerHTML = `
      <div class="space-y-0.5">
        <strong class="text-white text-sm block">${alt.name}</strong>
        <span class="text-[10px] px-1.5 py-0.2 rounded bg-iron-800 text-slate-300">${alt.equipment} • ${alt.category}</span>
      </div>
      <button class="px-3 py-1.5 rounded-lg bg-hevy-blue/20 text-hevy-blue font-bold text-xs">
        確認替換
      </button>
    `;

    card.addEventListener('click', () => {
      state.activeWorkout.exercises[exIndex].exerciseId = alt.id;
      saveLocalData();
      renderWorkoutSheet();
      modal.classList.add('hidden');
      alertToast(`已將動作替換為「${alt.name}」`);
      feedback.vibrate(30);
    });

    list.appendChild(card);
  });

  modal.classList.remove('hidden');
}

// 展開新增動作庫抽屜
function openAddExerciseModal(filterCat = '全部') {
  const modal = document.getElementById('addExerciseModal');
  const list = document.getElementById('exerciseLibraryList');
  list.innerHTML = '';

  const filtered = filterCat === '全部' 
    ? state.exercises 
    : state.exercises.filter(e => e.category === filterCat);

  filtered.forEach(ex => {
    const card = document.createElement('div');
    card.className = 'p-2.5 rounded-xl bg-iron-950 border border-iron-800 hover:border-hevy-green flex items-center justify-between text-xs cursor-pointer tap-active transition';
    card.innerHTML = `
      <div>
        <strong class="text-white text-xs block">${ex.name}</strong>
        <span class="text-[10px] text-slate-400 font-mono">${ex.category} • ${ex.equipment || '自訂'}</span>
      </div>
      <span class="text-hevy-green font-bold text-xs flex items-center gap-1">
        <i data-lucide="plus" class="w-3.5 h-3.5"></i> 加入
      </span>
    `;

    card.addEventListener('click', () => {
      // 取得上次做這個動作的預設重量
      const stats = getExerciseHistoryStats(ex.id);
      const defaultWeight = stats.lastSet ? stats.lastSet.weight : 60;
      const defaultReps = stats.lastSet ? stats.lastSet.reps : 8;

      state.activeWorkout.exercises.push({
        exerciseId: ex.id,
        sets: [
          { id: 's-' + Date.now(), setType: 'working', weight: defaultWeight, reps: defaultReps, rpe: 8, isCompleted: false },
          { id: 's-' + (Date.now() + 1), setType: 'working', weight: defaultWeight, reps: defaultReps, rpe: 8, isCompleted: false },
          { id: 's-' + (Date.now() + 2), setType: 'working', weight: defaultWeight, reps: defaultReps, rpe: 8, isCompleted: false }
        ]
      });

      saveLocalData();
      renderWorkoutSheet();
      modal.classList.add('hidden');
      alertToast(`已加入「${ex.name}」到今日課表`);
      feedback.vibrate(30);
    });

    list.appendChild(card);
  });

  if (window.lucide) lucide.createIcons();
  modal.classList.remove('hidden');
}

// ======================= 10. 組間計時器邏輯 =======================
function startTimer(seconds) {
  if (state.timer.intervalId) {
    clearInterval(state.timer.intervalId);
  }
  state.timer.remainingSeconds = seconds;
  state.timer.isRunning = true;
  updateTimerUI();

  state.timer.intervalId = setInterval(() => {
    state.timer.remainingSeconds--;
    updateTimerUI();

    if (state.timer.remainingSeconds <= 0) {
      clearInterval(state.timer.intervalId);
      state.timer.isRunning = false;
      feedback.playTimerDone();
      alertToast('⏰ 組間休息時間到！準備下一組！');
    }
  }, 1000);
}

function stopTimer() {
  if (state.timer.intervalId) {
    clearInterval(state.timer.intervalId);
    state.timer.intervalId = null;
  }
  state.timer.isRunning = false;
  state.timer.remainingSeconds = 0;
  updateTimerUI();
}

function updateTimerUI() {
  const display = document.getElementById('timerDisplay');
  const widget = document.getElementById('restTimerWidget');
  const total = state.timer.remainingSeconds;

  const mins = Math.floor(total / 60);
  const secs = total % 60;
  display.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  if (state.timer.isRunning) {
    widget.classList.add('border-hevy-green', 'bg-hevy-green/10');
  } else {
    widget.classList.remove('border-hevy-green', 'bg-hevy-green/10');
  }
}

// 簡易 Toast 提示
function alertToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-iron-900 border border-hevy-green text-white font-bold px-4 py-2 rounded-xl shadow-2xl text-xs flex items-center gap-2 animate-bounce';
  toast.innerHTML = `<i data-lucide="bell" class="w-4 h-4 text-hevy-green"></i><span>${msg}</span>`;
  document.body.appendChild(toast);
  if (window.lucide) lucide.createIcons();
  setTimeout(() => toast.remove(), 2800);
}

// ======================= 11. 事件監聽綁定 =======================
function setupEventListeners() {
  // 底部導航切換
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetNav = btn.getAttribute('data-nav');
      switchNavTab(targetNav);
      feedback.vibrate(15);
    });
  });

  // 工作表內部事件委託 (打勾、輸入修改、切換組別類型)
  const container = document.getElementById('workoutSheetsContainer');

  container.addEventListener('input', (e) => {
    const input = e.target;
    const field = input.getAttribute('data-field');
    const exIdx = parseInt(input.getAttribute('data-ex-index'));
    const setIdx = parseInt(input.getAttribute('data-set-index'));

    if (field && !isNaN(exIdx) && !isNaN(setIdx)) {
      state.activeWorkout.exercises[exIdx].sets[setIdx][field] = parseFloat(input.value) || 0;
      saveLocalData();
    }
  });

  container.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    const action = target.getAttribute('data-action');
    const exIdx = parseInt(target.getAttribute('data-ex-index'));
    const setIdx = parseInt(target.getAttribute('data-set-index'));

    // 1. 打勾完成一組 (Hevy 招牌 Checkmark)
    if (action === 'toggle-complete') {
      const set = state.activeWorkout.exercises[exIdx].sets[setIdx];
      set.isCompleted = !set.isCompleted;

      if (set.isCompleted) {
        feedback.playCheckSound();

        // 紀錄進歷史
        const exItem = state.activeWorkout.exercises[exIdx];
        const exObj = state.exercises.find(e => e.id === exItem.exerciseId);
        const e1rm = calculateE1RM(set.weight, set.reps, set.rpe || 8);

        // 檢查是否創下 PR
        const stats = getExerciseHistoryStats(exItem.exerciseId);
        const isPR = stats.bestE1rm > 0 && e1rm > stats.bestE1rm;

        state.history.unshift({
          id: 'h-' + Date.now(),
          date: new Date().toISOString().split('T')[0],
          timestamp: Date.now(),
          exerciseId: exItem.exerciseId,
          exerciseName: exObj ? exObj.name : '自訂動作',
          category: exObj ? exObj.category : '全身',
          weight: set.weight,
          reps: set.reps,
          rpe: set.rpe || 8,
          setType: set.setType || 'working',
          e1rm
        });

        if (isPR) {
          setTimeout(() => feedback.playPRCelebration(), 100);
          alertToast(`🔥 突破個人最佳紀錄！PR: ${e1rm} kg！`);
        }

        // 自動啟動組間休息計時
        startTimer(state.settings.restDuration || 90);
      }

      saveLocalData();
      renderWorkoutSheet();
    }

    // 2. 切換組別類型 (工作組 ➔ 熱身組 ➔ 遞減組 ➔ 力竭組)
    else if (action === 'toggle-set-type') {
      const set = state.activeWorkout.exercises[exIdx].sets[setIdx];
      const types = ['working', 'warmup', 'drop', 'failure'];
      let nextIdx = types.indexOf(set.setType) + 1;
      if (nextIdx >= types.length) nextIdx = 0;
      set.setType = types[nextIdx];
      saveLocalData();
      renderWorkoutSheet();
      feedback.vibrate(20);
    }

    // 3. 新增一組
    else if (action === 'add-set') {
      const currentSets = state.activeWorkout.exercises[exIdx].sets;
      const lastSet = currentSets[currentSets.length - 1] || { weight: 60, reps: 8, rpe: 8 };
      currentSets.push({
        id: 's-' + Date.now(),
        setType: 'working',
        weight: lastSet.weight,
        reps: lastSet.reps,
        rpe: lastSet.rpe,
        isCompleted: false
      });
      saveLocalData();
      renderWorkoutSheet();
      feedback.vibrate(20);
    }

    // 4. 點擊槓片按鈕
    else if (action === 'plate') {
      const sets = state.activeWorkout.exercises[exIdx].sets;
      const targetWeight = sets[0] ? sets[0].weight : 60;
      openPlateSheet(targetWeight);
      feedback.vibrate(25);
    }

    // 5. 點擊替換動作
    else if (action === 'swap') {
      const exId = target.getAttribute('data-ex-id');
      openSwapModal(exId, exIdx);
      feedback.vibrate(25);
    }

    // 6. 移除動作
    else if (action === 'remove-ex') {
      if (confirm('確定要從今日課表中移除此動作嗎？')) {
        state.activeWorkout.exercises.splice(exIdx, 1);
        saveLocalData();
        renderWorkoutSheet();
      }
    }
  });

  // 完成今日訓練大按鈕
  document.getElementById('finishWorkoutBtn').addEventListener('click', () => {
    alertToast('🎉 今日訓練完成！數據已同步至進步曲線！');
    feedback.playPRCelebration();
    saveLocalData();
    switchNavTab('tab-analytics');
  });

  // 新增動作按鈕
  document.getElementById('openAddExerciseSheetBtn').addEventListener('click', () => {
    openAddExerciseModal('全部');
  });

  // 關閉各抽屜
  document.getElementById('closePlateSheetBtn').addEventListener('click', () => {
    document.getElementById('plateSheetModal').classList.add('hidden');
  });
  document.getElementById('closeSwapModalBtn').addEventListener('click', () => {
    document.getElementById('swapExerciseModal').classList.add('hidden');
  });
  document.getElementById('closeAddModalBtn').addEventListener('click', () => {
    document.getElementById('addExerciseModal').classList.add('hidden');
  });

  // 槓片抽屜輸入監聽
  document.getElementById('sheetWeightInput').addEventListener('input', renderPlateSheetGraphic);
  document.querySelectorAll('.sheet-weight-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const delta = parseFloat(btn.getAttribute('data-sheet-delta'));
      const input = document.getElementById('sheetWeightInput');
      input.value = Math.max(0, (parseFloat(input.value) || 0) + delta);
      renderPlateSheetGraphic();
      feedback.vibrate(20);
    });
  });

  // 新增動作肌群分類按鈕列
  document.querySelectorAll('.cat-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-filter-btn').forEach(b => {
        b.className = 'cat-filter-btn px-3 py-1 rounded-full text-xs font-bold bg-iron-800 text-slate-300';
      });
      btn.className = 'cat-filter-btn px-3 py-1 rounded-full text-xs font-bold bg-hevy-green text-iron-950';
      const cat = btn.getAttribute('data-cat');
      openAddExerciseModal(cat);
      feedback.vibrate(15);
    });
  });

  // 建立自訂動作
  document.getElementById('createCustomExBtn').addEventListener('click', () => {
    const nameInput = document.getElementById('customExNameInput');
    const catSelect = document.getElementById('customExCatSelect');
    const name = nameInput.value.trim();
    if (!name) return alert('請輸入動作名稱');

    const newEx = {
      id: 'ex-' + Date.now(),
      name,
      category: catSelect.value,
      equipment: '自訂',
      alternatives: []
    };

    state.exercises.push(newEx);
    saveLocalData();
    nameInput.value = '';
    openAddExerciseModal(catSelect.value);
    alertToast(`已新增自訂動作「${name}」`);
  });

  // 數據分頁動作篩選
  document.getElementById('analyticsExerciseFilter').addEventListener('change', (e) => {
    renderStrengthLineChart(e.target.value);
  });

  // 肌群恢復分頁快速加入動作
  document.getElementById('tab-recovery').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="quick-add-group"]');
    if (!btn) return;
    const group = btn.getAttribute('data-group');
    switchNavTab('tab-workout');
    openAddExerciseModal(group);
  });

  // 常駐計時器微調
  document.getElementById('timerQuickPlusBtn').addEventListener('click', () => {
    state.timer.remainingSeconds += 30;
    updateTimerUI();
    feedback.vibrate(20);
  });
  document.getElementById('timerResetBtn').addEventListener('click', () => {
    stopTimer();
    feedback.vibrate(25);
  });
  document.getElementById('timerToggleBtn').addEventListener('click', () => {
    startTimer(state.settings.restDuration || 90);
  });

  // 設定與備份
  document.getElementById('settingsBarWeight').value = state.settings.barWeight;
  document.getElementById('settingsBarWeight').addEventListener('change', (e) => {
    state.settings.barWeight = parseFloat(e.target.value);
    saveLocalData();
  });

  document.getElementById('settingsRestDuration').value = state.settings.restDuration;
  document.getElementById('settingsRestDuration').addEventListener('change', (e) => {
    state.settings.restDuration = parseInt(e.target.value);
    saveLocalData();
  });

  // 匯出 JSON 備份
  document.getElementById('exportBackupBtn').addEventListener('click', () => {
    const backup = {
      version: '2.0',
      exportDate: new Date().toISOString(),
      exercises: state.exercises,
      history: state.history,
      activeWorkout: state.activeWorkout,
      settings: state.settings
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ironlog-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    alertToast('備份已下載至手機本地！');
  });

  // 匯入 JSON 還原
  document.getElementById('importBackupInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported && Array.isArray(imported.history)) {
          state.history = imported.history;
          if (imported.exercises) state.exercises = imported.exercises;
          if (imported.activeWorkout) state.activeWorkout = imported.activeWorkout;
          if (imported.settings) state.settings = imported.settings;
          saveLocalData();
          renderWorkoutSheet();
          renderAnalyticsView();
          renderRecoveryView();
          alertToast('🎉 備份已成功還原！');
        }
      } catch (err) {
        alert('解析檔案失敗，請檢查是否為正確的 JSON 檔案');
      }
    };
    reader.readAsText(file);
  });

  // 重置演示資料
  document.getElementById('resetDemoDataBtn').addEventListener('click', () => {
    if (confirm('確定重置所有日誌為初始演示資料？')) {
      state.history = [...INITIAL_DEMO_HISTORY];
      state.exercises = [...DEFAULT_EXERCISES];
      saveLocalData();
      renderWorkoutSheet();
      renderAnalyticsView();
      renderRecoveryView();
      alertToast('已重置為初始資料');
    }
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
      btn.className = 'nav-tab-btn active flex flex-col items-center justify-center py-1.5 rounded-xl text-hevy-green transition';
    } else {
      btn.className = 'nav-tab-btn flex flex-col items-center justify-center py-1.5 rounded-xl text-slate-400 hover:text-slate-200 transition';
    }
  });

  if (targetNav === 'tab-workout') {
    renderWorkoutSheet();
  } else if (targetNav === 'tab-analytics') {
    renderAnalyticsView();
  } else if (targetNav === 'tab-recovery') {
    renderRecoveryView();
  }

  if (window.lucide) lucide.createIcons();
}

// ======================= 12. 應用程式入口 =======================
window.addEventListener('DOMContentLoaded', () => {
  loadLocalData();
  setupEventListeners();
  renderWorkoutSheet();
  updateTimerUI();

  if (window.lucide) lucide.createIcons();
});
