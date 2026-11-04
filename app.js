/**
 * IronLog - 核心重構腳本
 * 聚焦：自訂課表範本、每週排程、部位熱身建議、極速現場打勾、GitHub熱圖
 */

// ======================= 1. 預設資料庫 (動作庫、課表範本、排程) =======================
const DEFAULT_EXERCISES = [
  { id: 'bench-press', name: '平板槓鈴臥推 (Bench Press)', category: '胸部', isCompound: true, pinNote: '握距中指對準壓紋圈，沉肩收核心' },
  { id: 'incline-db-press', name: '上斜啞鈴臥推 (Incline DB Press)', category: '胸部', isCompound: false, pinNote: '椅背調整至 30 度斜角' },
  { id: 'dips', name: '雙槓臂屈伸 (Dips)', category: '胸部', isCompound: true, pinNote: '軀幹微前傾著重下胸' },
  { id: 'cable-fly', name: '滑輪夾胸 (Cable Fly)', category: '胸部', isCompound: false, pinNote: '滑輪高度調整至肩膀水平' },
  
  { id: 'squat', name: '槓鈴頸後深蹲 (Back Squat)', category: '腿部', isCompound: true, pinNote: '站距略寬於肩，腳尖朝外30度' },
  { id: 'leg-press', name: '45度仰臥腿推機 (Leg Press)', category: '腿部', isCompound: true, pinNote: '背板貼平，膝蓋不內扣' },
  { id: 'rdl', name: '羅馬尼亞硬舉 (RDL)', category: '腿部', isCompound: true, pinNote: '髖關節鉸鏈後推，維持背部平直' },
  { id: 'leg-extension', name: '坐姿機械腿屈伸 (Leg Extension)', category: '腿部', isCompound: false, pinNote: '椅背孔位第 3 格' },
  
  { id: 'deadlift', name: '傳統硬舉 (Conventional Deadlift)', category: '背部', isCompound: true, pinNote: '槓鈴貼近小腿脛骨起槓' },
  { id: 'barbell-row', name: '槓鈴划船 (Barbell Row)', category: '背部', isCompound: true, pinNote: '軀幹前傾45度，拉向肚臍位置' },
  { id: 'lat-pulldown', name: '高位滑輪下拉 (Lat Pulldown)', category: '背部', isCompound: true, pinNote: '大腿擋板卡緊，胸口微挺' },
  { id: 'pull-up', name: '引體向上 (Pull-Up)', category: '背部', isCompound: true, pinNote: '肩胛下沉再帶動手肘向後下拉' },
  
  { id: 'ohp', name: '槓鈴站姿肩推 (Overhead Press)', category: '肩部', isCompound: true, pinNote: '夾緊臀部夾緊腹部，直上直下' },
  { id: 'db-shoulder-press', name: '坐姿啞鈴肩推 (DB Shoulder Press)', category: '肩部', isCompound: true, pinNote: '啞鈴下沉至耳旁水平' },
  { id: 'lateral-raise', name: '啞鈴側平舉 (Lateral Raise)', category: '肩部', isCompound: false, pinNote: '手肘微曲，像倒水般帶動' },
  
  { id: 'bicep-curl', name: '啞鈴/槓鈴彎舉 (Bicep Curl)', category: '手臂', isCompound: false, pinNote: '手肘固定於身體兩側' },
  { id: 'tricep-pushdown', name: '滑輪三頭肌下壓 (Tricep Pushdown)', category: '手臂', isCompound: false, pinNote: '大臂夾緊不晃動' }
];

// 預設經典 3 大課表範本
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

// 預設每週排程 (1:週一, 2:週二, 3:週三, 4:週四, 5:週五, 6:週六, 0:週日)
const DEFAULT_WEEKLY_SPLIT = {
  1: 'push-a',
  2: 'pull-a',
  3: null, // 休息日
  4: 'leg-a',
  5: 'push-a',
  6: null,
  0: null
};

// 部位專屬動態活動度熱身項目
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

// 豐富的歷史真實數據 (供熱圖與折線圖使用)
const INITIAL_HISTORY = [
  // 12 天前
  { id: 'h1', date: '2026-10-24', timestamp: 1792828800000, exerciseId: 'bench-press', exerciseName: '平板槓鈴臥推 (Bench Press)', category: '胸部', weight: 75, reps: 8, rpe: 8, setType: 'working', e1rm: 105.2 },
  { id: 'h2', date: '2026-10-24', timestamp: 1792828860000, exerciseId: 'bench-press', exerciseName: '平板槓鈴臥推 (Bench Press)', category: '胸部', weight: 75, reps: 8, rpe: 8, setType: 'working', e1rm: 105.2 },
  // 9 天前
  { id: 'h3', date: '2026-10-27', timestamp: 1793088000000, exerciseId: 'squat', exerciseName: '槓鈴頸後深蹲 (Back Squat)', category: '腿部', weight: 100, reps: 6, rpe: 8, setType: 'working', e1rm: 125.0 },
  { id: 'h4', date: '2026-10-27', timestamp: 1793088060000, exerciseId: 'squat', exerciseName: '槓鈴頸後深蹲 (Back Squat)', category: '腿部', weight: 105, reps: 6, rpe: 8.5, setType: 'working', e1rm: 129.5 },
  // 7 天前
  { id: 'h5', date: '2026-10-29', timestamp: 1793260800000, exerciseId: 'deadlift', exerciseName: '傳統硬舉 (Conventional Deadlift)', category: '背部', weight: 130, reps: 5, rpe: 8, setType: 'working', e1rm: 160.2 },
  { id: 'h6', date: '2026-10-29', timestamp: 1793260860000, exerciseId: 'barbell-row', exerciseName: '槓鈴划船 (Barbell Row)', category: '背部', weight: 65, reps: 8, rpe: 8, setType: 'working', e1rm: 91.2 },
  // 5 天前
  { id: 'h7', date: '2026-10-31', timestamp: 1793433600000, exerciseId: 'bench-press', exerciseName: '平板槓鈴臥推 (Bench Press)', category: '胸部', weight: 80, reps: 8, rpe: 8, setType: 'working', e1rm: 112.2 },
  { id: 'h8', date: '2026-10-31', timestamp: 1793433660000, exerciseId: 'incline-db-press', exerciseName: '上斜啞鈴臥推 (Incline DB Press)', category: '胸部', weight: 28, reps: 10, rpe: 8, setType: 'working', e1rm: 42.1 },
  // 3 天前
  { id: 'h9', date: '2026-11-02', timestamp: 1793606400000, exerciseId: 'squat', exerciseName: '槓鈴頸後深蹲 (Back Squat)', category: '腿部', weight: 115, reps: 6, rpe: 8.5, setType: 'working', e1rm: 141.8 },
  // 昨天
  { id: 'h10', date: '2026-11-04', timestamp: 1793779200000, exerciseId: 'deadlift', exerciseName: '傳統硬舉 (Conventional Deadlift)', category: '背部', weight: 140, reps: 5, rpe: 8, setType: 'working', e1rm: 172.6 },
  { id: 'h11', date: '2026-11-04', timestamp: 1793779260000, exerciseId: 'lat-pulldown', exerciseName: '高位滑輪下拉 (Lat Pulldown)', category: '背部', weight: 60, reps: 10, rpe: 8, setType: 'working', e1rm: 85.0 }
];

// ======================= 2. 本地儲存鍵值與全域狀態 =======================
const STORAGE_KEYS = {
  EXERCISES: 'ironlog_v4_exercises',
  ROUTINES: 'ironlog_v4_routines',
  WEEKLY_SPLIT: 'ironlog_v4_weekly_split',
  HISTORY: 'ironlog_v4_history',
  ACTIVE_WORKOUT: 'ironlog_v4_active_workout'
};

const state = {
  exercises: [],
  routines: [],
  weeklySplit: {},
  history: [],
  activeWorkout: null,
  currentNav: 'tab-workout',

  // 獨立手動組間計時器狀態 (不干擾連續動作)
  timer: {
    intervalId: null,
    totalSeconds: 90,
    remainingSeconds: 90,
    isRunning: false
  },

  // 編輯中的課表暫存
  editingRoutine: null,

  // 動作選擇器目前目標 (是加入到 activeWorkout 還是 editingRoutine)
  pickerTarget: {
    mode: 'workout' // 'workout' | 'routine'
  },

  // 僅今日替換動作目標
  swapTarget: {
    exerciseIndex: null,
    originalExerciseId: null
  },

  // 圖表實例快取
  charts: {
    strength: null,
    muscle: null
  }
};

// ======================= 3. 音效與震動管理器 =======================
class SoundHaptics {
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
  checkSound() {
    this.beep(880, 'sine', 0.08);
    this.vibrate(25);
  }
  prSound() {
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
const sound = new SoundHaptics();

// ======================= 4. 資料持久化與初始化 =======================
function loadState() {
  try {
    const rawEx = localStorage.getItem(STORAGE_KEYS.EXERCISES);
    state.exercises = rawEx ? JSON.parse(rawEx) : [...DEFAULT_EXERCISES];

    const rawRoutines = localStorage.getItem(STORAGE_KEYS.ROUTINES);
    state.routines = rawRoutines ? JSON.parse(rawRoutines) : [...DEFAULT_ROUTINES];

    const rawSplit = localStorage.getItem(STORAGE_KEYS.WEEKLY_SPLIT);
    state.weeklySplit = rawSplit ? JSON.parse(rawSplit) : { ...DEFAULT_WEEKLY_SPLIT };

    const rawHist = localStorage.getItem(STORAGE_KEYS.HISTORY);
    state.history = rawHist ? JSON.parse(rawHist) : [...INITIAL_HISTORY];

    const rawWorkout = localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKOUT);
    if (rawWorkout) {
      state.activeWorkout = JSON.parse(rawWorkout);
    } else {
      // 依當前星期幾預設載入今日排程範本
      const day = new Date().getDay();
      const routineId = state.weeklySplit[day] || state.routines[0].id;
      loadRoutineIntoActiveWorkout(routineId, false);
    }
  } catch (e) {
    console.error('Storage load error', e);
    state.exercises = [...DEFAULT_EXERCISES];
    state.routines = [...DEFAULT_ROUTINES];
    state.weeklySplit = { ...DEFAULT_WEEKLY_SPLIT };
    state.history = [...INITIAL_HISTORY];
    loadRoutineIntoActiveWorkout(state.routines[0].id, false);
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(state.exercises));
    localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(state.routines));
    localStorage.setItem(STORAGE_KEYS.WEEKLY_SPLIT, JSON.stringify(state.weeklySplit));
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(state.history));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT, JSON.stringify(state.activeWorkout));
  } catch (e) {
    console.error('Storage save error', e);
  }
}

// 根據歷史紀錄找出某動作的「前次最佳表現 (Ghost Data)」
function getExerciseGhostData(exerciseId) {
  const logs = state.history
    .filter(h => h.exerciseId === exerciseId && h.setType === 'working')
    .sort((a, b) => b.timestamp - a.timestamp);

  if (logs.length === 0) return null;
  const lastDate = logs[0].date;
  const sessionLogs = logs.filter(h => h.date === lastDate);
  // 取該次訓練重量最高的一組
  const bestSet = sessionLogs.reduce((max, cur) => cur.weight > max.weight ? cur : max, sessionLogs[0]);
  return bestSet;
}

// 將課表範本載入到現場訓練表
function loadRoutineIntoActiveWorkout(routineId, overwriteConfirm = true) {
  if (overwriteConfirm && state.activeWorkout && state.activeWorkout.exercises.some(e => e.sets.some(s => s.isCompleted))) {
    if (!confirm('當前訓練有尚未結算的完成組數，確定要切換並重新載入新課表嗎？')) return;
  }

  const routine = state.routines.find(r => r.id === routineId) || state.routines[0];
  const mobility = MOBILITY_PROTOCOLS[routine.category] || MOBILITY_PROTOCOLS['全身'];

  state.activeWorkout = {
    routineId: routine.id,
    routineName: routine.name,
    category: routine.category,
    startTime: Date.now(),
    mobilityChecks: mobility.map(m => ({ text: m.text, done: false })),
    exercises: routine.exercises.map(item => {
      const ex = state.exercises.find(e => e.id === item.exerciseId) || { name: '自訂動作', isCompound: false, pinNote: '' };
      const ghost = getExerciseGhostData(item.exerciseId);
      const defaultWeight = ghost ? ghost.weight : 40;
      const defaultReps = ghost ? ghost.reps : (item.targetReps || 8);

      const sets = [];
      const setTotal = item.targetSets || 3;
      for (let i = 0; i < setTotal; i++) {
        sets.push({
          id: 'set-' + Date.now() + '-' + i,
          setType: 'working',
          weight: defaultWeight,
          reps: defaultReps,
          rpe: 8,
          isCompleted: false
        });
      }

      return {
        exerciseId: item.exerciseId,
        isDumbbellEachSide: false, // 是否單手啞鈴算兩側重量
        pinNote: ex.pinNote || '',
        sets
      };
    })
  };

  saveState();
  renderWorkoutSheet();
}

// 估算 1RM 公式 (Epley + RIR)
function calculateE1RM(weight, reps, rpe = 8) {
  if (weight <= 0 || reps <= 0) return 0;
  const rir = Math.max(0, 10 - rpe);
  const effectiveReps = reps + rir;
  return Math.round(weight * (1 + effectiveReps / 30) * 10) / 10;
}

// 輔助四捨五入至 2.5kg
function roundTo2_5(val) {
  return Math.max(20, Math.round(val / 2.5) * 2.5);
}

// ======================= 5. UI 渲染：現場訓練工作表 (Workout Sheet) =======================

function renderWorkoutSheet() {
  if (!state.activeWorkout) return;

  // 1. 更新頂部今日課表看板
  const dayNames = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
  const currentDay = new Date().getDay();
  document.getElementById('todayDayNameBadge').textContent = dayNames[currentDay];
  document.getElementById('activeRoutineTitle').textContent = state.activeWorkout.routineName;

  // 2. 更新頂部進度條文字
  let totalSetsCount = 0;
  let completedSetsCount = 0;
  state.activeWorkout.exercises.forEach(ex => {
    ex.sets.forEach(s => {
      totalSetsCount++;
      if (s.isCompleted) completedSetsCount++;
    });
  });
  const progressPct = totalSetsCount > 0 ? Math.round((completedSetsCount / totalSetsCount) * 100) : 0;
  document.getElementById('headerSetsProgressText').textContent = `${completedSetsCount} / ${totalSetsCount} 組 (${progressPct}%)`;

  // 3. 渲染部位熱身與活動度打卡項目
  renderMobilitySection();

  // 4. 渲染動作卡片清單
  const container = document.getElementById('workoutCardsContainer');
  container.innerHTML = '';

  state.activeWorkout.exercises.forEach((item, exIdx) => {
    const exObj = state.exercises.find(e => e.id === item.exerciseId) || { name: '自訂動作', isCompound: false };
    const ghost = getExerciseGhostData(item.exerciseId);

    const card = document.createElement('div');
    card.className = 'bg-iron-900 border border-iron-800 rounded-2xl p-4 shadow-xl space-y-3';

    // 動作卡片標頭
    const ghostText = ghost ? `上次：${ghost.weight}kg × ${ghost.reps} @ RPE ${ghost.rpe}` : '尚無歷史紀錄';

    card.innerHTML = `
      <!-- 標題與彈性工具列 -->
      <div class="space-y-1.5 pb-2 border-b border-iron-800/80">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="font-extrabold text-white text-base tracking-tight">${exObj.name}</h3>
            <div class="flex items-center gap-2 mt-0.5 text-xs">
              <span class="text-slate-400 font-mono text-[11px]">${ghostText}</span>
              <button data-action="toggle-dumbbell" data-ex-index="${exIdx}" class="text-[10px] font-bold px-1.5 py-0.2 rounded transition tap-active ${item.isDumbbellEachSide ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/40' : 'bg-iron-800 text-slate-400'}">
                ${item.isDumbbellEachSide ? '單邊 (×2 容量)' : '總重'}
              </button>
            </div>
          </div>

          <!-- 動作功能按鈕 -->
          <div class="flex items-center gap-1">
            ${exObj.isCompound ? `
              <button data-action="generate-warmup" data-ex-index="${exIdx}" class="p-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-xs font-bold flex items-center gap-1 tap-active" title="產生熱身組">
                <i data-lucide="flame" class="w-3.5 h-3.5"></i>
                <span class="text-[10px]">熱身組</span>
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
            placeholder="點此設定常駐備註 (如：滑輪座椅第3孔、史密斯空槓10kg...)"
            class="w-full bg-transparent text-[11px] text-slate-300 placeholder-slate-600 focus:outline-none">
        </div>
      </div>

      <!-- 流水線表格表頭 -->
      <div class="space-y-1">
        <div class="grid grid-cols-12 text-[10px] font-bold font-mono text-slate-400 px-2 py-0.5">
          <span class="col-span-2">組別</span>
          <span class="col-span-3">前次對照</span>
          <span class="col-span-3 text-center">公斤 (KG)</span>
          <span class="col-span-2 text-center">次數</span>
          <span class="col-span-2 text-center">完成</span>
        </div>

        <!-- 組別清單容器 -->
        <div class="space-y-1.5" id="setsContainer-${exIdx}">
          <!-- 動態插入每一組 -->
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

    // 渲染組別列表
    const setsBox = card.querySelector(`#setsContainer-${exIdx}`);
    item.sets.forEach((set, setIdx) => {
      const isDone = set.isCompleted;
      const row = document.createElement('div');
      row.className = `p-1.5 rounded-xl border transition ${isDone ? 'bg-iron-950/40 border-iron-850/60 text-slate-500' : 'bg-iron-950 border-iron-800 text-white'}`;

      // 組別標籤
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

      const ghostStr = ghost ? `${ghost.weight}k×${ghost.reps}` : '—';

      row.innerHTML = `
        <div class="grid grid-cols-12 items-center gap-1">
          <!-- 組別按鈕 (點擊切換 1/2/3/W/D/F) -->
          <div class="col-span-2 flex items-center">
            <button data-action="toggle-set-type" data-ex-index="${exIdx}" data-set-index="${setIdx}"
              class="w-7 h-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center ${typeColor} tap-active" title="點擊切換類型">
              ${typeLabel}
            </button>
          </div>

          <!-- 前次淡灰色對照 -->
          <div class="col-span-3 text-[11px] font-mono text-slate-500 truncate">
            ${ghostStr}
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

          <!-- 打勾按鈕 (純打勾記錄與震動，不自動強制開跑計時) -->
          <div class="col-span-2 flex justify-center">
            <button data-action="toggle-set-complete" data-ex-index="${exIdx}" data-set-index="${setIdx}"
              class="w-8 h-8 rounded-xl font-bold flex items-center justify-center transition tap-active ${isDone ? 'bg-accent-green text-iron-950 shadow-md shadow-accent-green/30 check-pop' : 'bg-iron-800 border border-iron-700 text-slate-400 hover:text-white'}">
              <i data-lucide="check" class="w-4 h-4 stroke-[3]"></i>
            </button>
          </div>
        </div>

        <!-- 現場快填輔助列 (+1.25 / +2.5 / +5 / 複製上一組 / RPE標記) -->
        <div class="flex items-center justify-between pt-1.5 mt-1 border-t border-iron-850/80 text-[10px]">
          <div class="flex items-center gap-1">
            <span class="text-slate-500 font-mono">累加:</span>
            <button data-action="quick-add-weight" data-delta="1.25" data-ex-index="${exIdx}" data-set-index="${setIdx}" class="px-1.5 py-0.5 rounded bg-iron-850 hover:bg-iron-800 text-slate-300 font-mono tap-active">+1.25</button>
            <button data-action="quick-add-weight" data-delta="2.5" data-ex-index="${exIdx}" data-set-index="${setIdx}" class="px-1.5 py-0.5 rounded bg-iron-850 hover:bg-iron-800 text-slate-300 font-mono tap-active">+2.5</button>
            <button data-action="quick-add-weight" data-delta="5" data-ex-index="${exIdx}" data-set-index="${setIdx}" class="px-1.5 py-0.5 rounded bg-iron-850 hover:bg-iron-800 text-slate-300 font-mono tap-active">+5</button>
            ${setIdx > 0 ? `
              <button data-action="copy-last-set" data-ex-index="${exIdx}" data-set-index="${setIdx}" class="ml-1 px-1.5 py-0.5 rounded bg-iron-800 hover:bg-iron-750 text-accent-green font-mono flex items-center gap-0.5 tap-active" title="複製上一組重量與次數">
                <i data-lucide="copy" class="w-2.5 h-2.5"></i> 同上
              </button>
            ` : ''}
          </div>

          <!-- RPE 標記 -->
          <div class="flex items-center gap-1">
            <span class="text-slate-500 font-mono">RPE:</span>
            <select data-field="rpe" data-ex-index="${exIdx}" data-set-index="${setIdx}" class="bg-iron-850 border border-iron-750 text-slate-300 rounded px-1 py-0.5 font-mono text-[10px] focus:outline-none">
              <option value="10" ${set.rpe == 10 ? 'selected' : ''}>10 (力竭)</option>
              <option value="9.5" ${set.rpe == 9.5 ? 'selected' : ''}>9.5</option>
              <option value="9" ${set.rpe == 9 ? 'selected' : ''}>9 (保留1)</option>
              <option value="8.5" ${set.rpe == 8.5 ? 'selected' : ''}>8.5</option>
              <option value="8" ${set.rpe == 8 ? 'selected' : ''}>8 (保留2)</option>
              <option value="7.5" ${set.rpe == 7.5 ? 'selected' : ''}>7.5</option>
              <option value="7" ${set.rpe == 7 ? 'selected' : ''}>7 (保留3)</option>
              <option value="6" ${set.rpe == 6 ? 'selected' : ''}>6</option>
            </select>
          </div>
        </div>
      `;

      setsBox.appendChild(row);
    });
  });

  if (window.lucide) lucide.createIcons();
}

// 渲染部位動態熱身打卡項目
function renderMobilitySection() {
  const container = document.getElementById('mobilityItemsList');
  const tag = document.getElementById('warmupCategoryTag');
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

// ======================= 6. 複合動作一鍵產生熱身組 =======================
function generateWarmupSets(exIndex) {
  const item = state.activeWorkout.exercises[exIndex];
  // 找出該動作第一個正式組重量
  const firstWorking = item.sets.find(s => s.setType === 'working') || item.sets[0];
  const targetWeight = firstWorking ? firstWorking.weight : 60;

  if (targetWeight <= 25) {
    alertToast('目標重量較輕，直接以空槓或正式組進行即可。');
    return;
  }

  // 計算 3~4 組階梯遞增組 (四捨五入至最接近 2.5kg)
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

  // 移除非正式組，將新熱身組插入在最前面
  const existingWorkings = item.sets.filter(s => s.setType !== 'warmup');
  item.sets = [...newWarmups, ...existingWorkings];

  saveState();
  renderWorkoutSheet();
  alertToast('已自動插入階梯熱身組！');
  sound.vibrate(30);
}

// ======================= 7. UI 渲染：課表範本庫與每週排程 (Routines & Split) =======================

function renderRoutinesView() {
  // 1. 渲染每週 7 天排程指派器
  renderWeeklySplitGrid();

  // 2. 渲染課表範本列表
  const container = document.getElementById('routinesListContainer');
  const countBadge = document.getElementById('routineCountBadge');
  countBadge.textContent = `${state.routines.length} 套範本`;
  container.innerHTML = '';

  state.routines.forEach((routine) => {
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
            <i data-lucide="play" class="w-3.5 h-3.5 fill-current"></i> 開始此課表
          </button>
          <button data-action="edit-routine" data-routine-id="${routine.id}" class="p-1.5 rounded-lg bg-iron-800 hover:bg-iron-750 text-slate-300 text-xs tap-active" title="編輯課表">
            <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
          </button>
          <button data-action="delete-routine" data-routine-id="${routine.id}" class="p-1.5 rounded-lg bg-iron-800 hover:bg-rose-950 text-slate-500 hover:text-rose-400 text-xs tap-active" title="刪除課表">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>

      <div class="pt-1">
        ${exListHtml}
      </div>
    `;

    container.appendChild(card);
  });

  if (window.lucide) lucide.createIcons();
}

// 渲染週一至週日排程方塊
function renderWeeklySplitGrid() {
  const grid = document.getElementById('weeklySplitGrid');
  grid.innerHTML = '';
  const days = [
    { num: 1, label: '一' },
    { num: 2, label: '二' },
    { num: 3, label: '三' },
    { num: 4, label: '四' },
    { num: 5, label: '五' },
    { num: 6, label: '六' },
    { num: 0, label: '日' }
  ];

  const currentDay = new Date().getDay();

  days.forEach(d => {
    const routineId = state.weeklySplit[d.num];
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
      // 點擊循環切換課表指派
      const routineOptions = [null, ...state.routines.map(r => r.id)];
      const currentIdx = routineOptions.indexOf(state.weeklySplit[d.num]);
      const nextIdx = (currentIdx + 1) % routineOptions.length;
      state.weeklySplit[d.num] = routineOptions[nextIdx];
      saveState();
      renderWeeklySplitGrid();
      sound.vibrate(20);
    });

    grid.appendChild(btn);
  });
}

// 課表編輯器邏輯 (Modal)
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

      <div class="flex items-center gap-1.5">
        <div class="flex items-center gap-1 font-mono text-[11px]">
          <input type="number" value="${item.targetSets}" min="1" max="10" data-idx="${idx}" data-field="targetSets"
            class="w-10 bg-iron-900 border border-iron-750 text-center rounded py-1 text-white">組
          <span>×</span>
          <input type="number" value="${item.targetReps}" min="1" max="30" data-idx="${idx}" data-field="targetReps"
            class="w-10 bg-iron-900 border border-iron-750 text-center rounded py-1 text-white">次
        </div>

        <button data-action="move-up" data-idx="${idx}" class="p-1 text-slate-400 hover:text-white ${idx === 0 ? 'opacity-30' : ''}" title="上移">
          <i data-lucide="chevron-up" class="w-3.5 h-3.5"></i>
        </button>
        <button data-action="move-down" data-idx="${idx}" class="p-1 text-slate-400 hover:text-white ${idx === state.editingRoutine.exercises.length - 1 ? 'opacity-30' : ''}" title="下移">
          <i data-lucide="chevron-down" class="w-3.5 h-3.5"></i>
        </button>
        <button data-action="delete-template-ex" data-idx="${idx}" class="p-1 text-slate-500 hover:text-rose-400" title="刪除">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    `;

    list.appendChild(row);
  });

  if (window.lucide) lucide.createIcons();
}

// ======================= 8. UI 渲染：數據分析與 GitHub 風格熱圖 (Analytics) =======================

function renderAnalyticsView() {
  // 1. 計算核心三項指標
  const totalVolume = state.history.reduce((sum, h) => {
    const factor = h.isDumbbellEachSide ? 2 : 1;
    return sum + (h.weight * h.reps * factor);
  }, 0);
  const totalSets = state.history.length;

  document.getElementById('statTotalVolume').textContent = totalVolume >= 1000 ? (totalVolume / 1000).toFixed(1) + 'k' : totalVolume;
  document.getElementById('statTotalSets').textContent = totalSets;

  // 計算歷史 PR 數量
  const prMap = {};
  state.history.forEach(h => {
    if (!prMap[h.exerciseId] || h.e1rm > prMap[h.exerciseId].e1rm) {
      prMap[h.exerciseId] = h;
    }
  });
  document.getElementById('statTotalPRs').textContent = Object.keys(prMap).length;

  // 2. 繪製 GitHub 日曆方塊熱圖 (Streak Heatmap)
  renderHeatmap();

  // 3. 填入折線圖動作選單
  const select = document.getElementById('analyticsExerciseSelect');
  const currentVal = select.value;
  select.innerHTML = '';
  const compoundExIds = ['bench-press', 'squat', 'deadlift', 'ohp', 'barbell-row'];
  compoundExIds.forEach(id => {
    const ex = state.exercises.find(e => e.id === id);
    if (ex) {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = ex.name;
      select.appendChild(opt);
    }
  });

  if (currentVal && compoundExIds.includes(currentVal)) {
    select.value = currentVal;
  } else {
    select.value = compoundExIds[0];
  }

  // 4. 繪製折線圖與肌群組數圖
  renderStrengthLineChart(select.value);
  renderMuscleVolumeBarChart();

  // 5. 渲染 PR 榮譽牆
  renderPrHonorGrid(prMap);
}

// 繪製類似 GitHub Commit 的方塊日曆熱圖
function renderHeatmap() {
  const container = document.getElementById('heatmapGridContainer');
  container.innerHTML = '';

  // 統計過去 60 天內每日的總練容量
  const daysCount = 63; // 9 週 x 7 天
  const now = new Date();
  const dateMap = {};

  // 將歷史紀錄按 YYYY-MM-DD 加總
  state.history.forEach(h => {
    const factor = h.isDumbbellEachSide ? 2 : 1;
    const vol = (h.weight * h.reps * factor) || 0;
    dateMap[h.date] = (dateMap[h.date] || 0) + vol;
  });

  // 建立 9 週直行，每行 7 格 (週一到週日)
  const columns = [];
  for (let w = 8; w >= 0; w--) {
    const colDays = [];
    for (let d = 0; d < 7; d++) {
      const targetDate = new Date();
      targetDate.setDate(now.getDate() - (w * 7 + (6 - d)));
      const dateStr = targetDate.toISOString().split('T')[0];
      const vol = dateMap[dateStr] || 0;
      colDays.push({ dateStr, vol });
    }
    columns.push(colDays);
  }

  // 繪製
  columns.forEach(col => {
    const colDiv = document.createElement('div');
    colDiv.className = 'flex flex-col gap-1';

    col.forEach(day => {
      const cell = document.createElement('div');
      cell.className = 'w-3.5 h-3.5 rounded-sm transition-transform hover:scale-125 cursor-pointer';

      // 依容量決定深淺 (GitHub 綠)
      if (day.vol === 0) {
        cell.className += ' bg-iron-850';
      } else if (day.vol < 2000) {
        cell.className += ' bg-emerald-950 border border-emerald-800';
      } else if (day.vol < 5000) {
        cell.className += ' bg-emerald-700';
      } else {
        cell.className += ' bg-emerald-400 shadow-sm shadow-emerald-400/30';
      }

      cell.title = `${day.dateStr}：${day.vol > 0 ? `${day.vol.toLocaleString()} kg 容量` : '休息'}`;
      colDiv.appendChild(cell);
    });

    container.appendChild(colDiv);
  });
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
      labels: labels.length > 0 ? labels : ['無數據'],
      datasets: [{
        label: '估算 1RM (kg)',
        data: dataPoints.length > 0 ? dataPoints : [0],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#10b981',
        pointRadius: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: '#1a2236' }, ticks: { color: '#64748b', font: { size: 9 } } },
        y: { grid: { color: '#1a2236' }, ticks: { color: '#64748b', font: { size: 9 } } }
      }
    }
  });
}

function renderMuscleVolumeBarChart() {
  const ctx = document.getElementById('muscleVolumeBarChart');
  if (!ctx || !window.Chart) return;

  const groups = ['胸部', '背部', '腿部', '肩部', '手臂'];
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentLogs = state.history.filter(h => h.timestamp >= sevenDaysAgo);

  const counts = groups.map(g => {
    return recentLogs.filter(h => h.category === g).length;
  });

  if (state.charts.muscle) {
    state.charts.muscle.destroy();
  }

  state.charts.muscle = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: groups,
      datasets: [{
        label: '有效組數',
        data: counts,
        backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#06b6d4'],
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10, weight: 'bold' } } },
        y: { grid: { color: '#1a2236' }, ticks: { color: '#64748b', font: { size: 9 }, stepSize: 2 } }
      }
    }
  });
}

function renderPrHonorGrid(prMap) {
  const container = document.getElementById('prHonorGrid');
  container.innerHTML = '';
  const entries = Object.entries(prMap);

  if (entries.length === 0) {
    container.innerHTML = `<div class="col-span-2 text-center text-xs text-slate-500 py-3">尚無 PR 紀錄，持續訓練以解鎖！</div>`;
    return;
  }

  entries.forEach(([_, log]) => {
    const card = document.createElement('div');
    card.className = 'bg-iron-950 border border-iron-800 rounded-xl p-3 space-y-1';
    card.innerHTML = `
      <div class="text-[11px] font-bold text-slate-300 truncate">${log.exerciseName}</div>
      <div class="flex items-baseline justify-between pt-0.5">
        <span class="text-[10px] text-slate-500 font-mono">e1RM</span>
        <span class="text-base font-mono font-black text-accent-green">${log.e1rm} <span class="text-[9px] text-slate-400">kg</span></span>
      </div>
      <div class="text-[10px] text-slate-400 font-mono flex justify-between">
        <span>最佳負重</span>
        <span class="text-white font-bold">${log.weight}kg × ${log.reps}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

// ======================= 9. 動作選擇庫與僅今日替換 (Modals) =======================

function openExercisePicker(mode = 'workout') {
  state.pickerTarget.mode = mode;
  const modal = document.getElementById('exercisePickerModal');
  renderPickerExerciseList('全部');
  modal.classList.remove('hidden');
}

function renderPickerExerciseList(category = '全部') {
  const list = document.getElementById('pickerExerciseItemsList');
  list.innerHTML = '';

  const filtered = category === '全部'
    ? state.exercises
    : state.exercises.filter(e => e.category === category);

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
      if (state.pickerTarget.mode === 'workout') {
        const ghost = getExerciseGhostData(ex.id);
        const defaultW = ghost ? ghost.weight : 40;
        const defaultR = ghost ? ghost.reps : 8;

        state.activeWorkout.exercises.push({
          exerciseId: ex.id,
          isDumbbellEachSide: false,
          pinNote: ex.pinNote || '',
          sets: [
            { id: 's-' + Date.now() + '-1', setType: 'working', weight: defaultW, reps: defaultR, rpe: 8, isCompleted: false },
            { id: 's-' + Date.now() + '-2', setType: 'working', weight: defaultW, reps: defaultR, rpe: 8, isCompleted: false },
            { id: 's-' + Date.now() + '-3', setType: 'working', weight: defaultW, reps: defaultR, rpe: 8, isCompleted: false }
          ]
        });
        saveState();
        renderWorkoutSheet();
        alertToast(`已將「${ex.name}」加入今日課表`);
      } else if (state.pickerTarget.mode === 'routine') {
        state.editingRoutine.exercises.push({
          exerciseId: ex.id,
          targetSets: 3,
          targetReps: 8
        });
        renderTemplateExercisesEditor();
      }

      document.getElementById('exercisePickerModal').classList.add('hidden');
      sound.vibrate(25);
    });

    list.appendChild(card);
  });

  if (window.lucide) lucide.createIcons();
}

// 僅今日臨時替換動作 (Swap for Today)
function openSwapTodayModal(exerciseId, exIndex) {
  state.swapTarget.exerciseIndex = exIndex;
  state.swapTarget.originalExerciseId = exerciseId;

  const modal = document.getElementById('swapTodayModal');
  const label = document.getElementById('swapTodayPromptLabel');
  const list = document.getElementById('swapTodayAltsList');

  const curEx = state.exercises.find(e => e.id === exerciseId);
  label.textContent = `原動作：${curEx ? curEx.name : ''}（僅替換本次訓練）`;
  list.innerHTML = '';

  // 推薦同肌群之動作
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

// ======================= 10. 獨立手動組間休息計時器 =======================

function toggleManualTimer() {
  if (state.timer.isRunning) {
    // 暫停
    clearInterval(state.timer.intervalId);
    state.timer.isRunning = false;
    updateManualTimerDisplay();
  } else {
    // 啟動倒數
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
        alertToast('⏰ 組間休息時間到！準備下一組！');
      }
    }, 1000);
  }
}

function resetManualTimer() {
  if (state.timer.intervalId) {
    clearInterval(state.timer.intervalId);
  }
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

// Toast 提示
function alertToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-iron-900 border border-accent-green text-white font-bold px-4 py-2 rounded-xl shadow-2xl text-xs flex items-center gap-2 animate-bounce';
  toast.innerHTML = `<i data-lucide="bell" class="w-4 h-4 text-accent-green"></i><span>${msg}</span>`;
  document.body.appendChild(toast);
  if (window.lucide) lucide.createIcons();
  setTimeout(() => toast.remove(), 2600);
}

// ======================= 11. 全域事件監聽綁定 =======================

function setupEventListeners() {
  // 底部 3 大分頁切換
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
    // 常駐筆記輸入完成失去焦點時儲存
    const input = e.target;
    if (input.getAttribute('data-action') === 'edit-pin-note') {
      const exIdx = parseInt(input.getAttribute('data-ex-index'));
      const exId = input.getAttribute('data-ex-id');
      const val = input.value.trim();

      // 同步更新至目前 activeWorkout 與全域動作庫
      state.activeWorkout.exercises[exIdx].pinNote = val;
      const ex = state.exercises.find(item => item.id === exId);
      if (ex) ex.pinNote = val;
      saveState();
      alertToast('動作備忘錄已儲存');
    }
  });

  workoutContainer.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    const action = target.getAttribute('data-action');
    const exIdx = parseInt(target.getAttribute('data-ex-index'));
    const setIdx = parseInt(target.getAttribute('data-set-index'));

    // 1. 純打勾完成一組 (不自動啟動計時器)
    if (action === 'toggle-set-complete') {
      const set = state.activeWorkout.exercises[exIdx].sets[setIdx];
      set.isCompleted = !set.isCompleted;

      if (set.isCompleted) {
        sound.checkSound();
        const exItem = state.activeWorkout.exercises[exIdx];
        const exObj = state.exercises.find(item => item.id === exItem.exerciseId);
        const e1rm = calculateE1RM(set.weight, set.reps, set.rpe || 8);

        // 檢查是否突破歷史 PR
        const ghost = getExerciseGhostData(exItem.exerciseId);
        const isPR = ghost && ghost.e1rm && e1rm > ghost.e1rm;

        state.history.unshift({
          id: 'hist-' + Date.now(),
          date: new Date().toISOString().split('T')[0],
          timestamp: Date.now(),
          exerciseId: exItem.exerciseId,
          exerciseName: exObj ? exObj.name : '自訂動作',
          category: exObj ? exObj.category : '全身',
          weight: set.weight,
          reps: set.reps,
          rpe: set.rpe || 8,
          setType: set.setType || 'working',
          e1rm,
          isDumbbellEachSide: exItem.isDumbbellEachSide
        });

        if (isPR) {
          setTimeout(() => sound.prSound(), 100);
          alertToast(`🔥 突破個人紀錄！e1RM: ${e1rm} kg！`);
        }
      }

      saveState();
      renderWorkoutSheet();
    }

    // 2. 切換組別屬性 (1/2/3/W/D/F)
    else if (action === 'toggle-set-type') {
      const set = state.activeWorkout.exercises[exIdx].sets[setIdx];
      const types = ['working', 'warmup', 'drop', 'failure'];
      let next = (types.indexOf(set.setType) + 1) % types.length;
      set.setType = types[next];
      saveState();
      renderWorkoutSheet();
      sound.vibrate(15);
    }

    // 3. 現場快填累加按鈕 (+1.25 / +2.5 / +5)
    else if (action === 'quick-add-weight') {
      const delta = parseFloat(target.getAttribute('data-delta'));
      const set = state.activeWorkout.exercises[exIdx].sets[setIdx];
      set.weight = Math.max(0, (set.weight || 0) + delta);
      saveState();
      renderWorkoutSheet();
      sound.vibrate(20);
    }

    // 4. 複製上一組 (Copy Last)
    else if (action === 'copy-last-set') {
      const prevSet = state.activeWorkout.exercises[exIdx].sets[setIdx - 1];
      const curSet = state.activeWorkout.exercises[exIdx].sets[setIdx];
      if (prevSet && curSet) {
        curSet.weight = prevSet.weight;
        curSet.reps = prevSet.reps;
        curSet.rpe = prevSet.rpe;
        saveState();
        renderWorkoutSheet();
        sound.vibrate(25);
      }
    }

    // 5. 單手啞鈴(×2) / 總重切換
    else if (action === 'toggle-dumbbell') {
      const exItem = state.activeWorkout.exercises[exIdx];
      exItem.isDumbbellEachSide = !exItem.isDumbbellEachSide;
      saveState();
      renderWorkoutSheet();
      sound.vibrate(20);
    }

    // 6. 產生熱身組
    else if (action === 'generate-warmup') {
      generateWarmupSets(exIdx);
    }

    // 7. 僅今日替換動作
    else if (action === 'swap-today') {
      const exId = target.getAttribute('data-ex-id');
      openSwapTodayModal(exId, exIdx);
    }

    // 8. 新增一組
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

    // 9. 移除動作
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

  // 獨立手動計時器控制
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

  // 切換課表快捷 (進入課表分頁)
  document.getElementById('switchRoutineQuickBtn').addEventListener('click', () => {
    switchNavTab('tab-routines');
  });

  // 臨時加入動作至今日訓練
  document.getElementById('openAddExToWorkoutBtn').addEventListener('click', () => {
    openExercisePicker('workout');
  });

  // 完成今日訓練大按鈕
  document.getElementById('finishWorkoutBtn').addEventListener('click', () => {
    alertToast('🎉 今日訓練完成！組數與數據已成功歸檔！');
    sound.prSound();
    saveState();
    switchNavTab('tab-analytics');
  });

  // 課表庫管理按鈕
  document.getElementById('createNewRoutineBtn').addEventListener('click', () => {
    openRoutineEditor(null);
  });

  document.getElementById('closeRoutineEditorBtn').addEventListener('click', () => {
    document.getElementById('routineEditorModal').classList.add('hidden');
  });
  document.getElementById('cancelRoutineEditBtn').addEventListener('click', () => {
    document.getElementById('routineEditorModal').classList.add('hidden');
  });

  // 儲存課表
  document.getElementById('saveRoutineTemplateBtn').addEventListener('click', () => {
    const name = document.getElementById('routineNameInput').value.trim();
    if (!name) return alert('請填寫課表名稱');

    state.editingRoutine.name = name;
    state.editingRoutine.category = document.getElementById('routineCategorySelect').value;

    const existIdx = state.routines.findIndex(r => r.id === state.editingRoutine.id);
    if (existIdx >= 0) {
      state.routines[existIdx] = state.editingRoutine;
    } else {
      state.routines.push(state.editingRoutine);
    }

    saveState();
    renderRoutinesView();
    document.getElementById('routineEditorModal').classList.add('hidden');
    alertToast(`課表「${name}」已儲存`);
  });

  // 課表列表事件委託 (開始此課表、編輯、刪除)
  document.getElementById('routinesListContainer').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    const rId = btn.getAttribute('data-routine-id');

    if (action === 'start-routine') {
      loadRoutineIntoActiveWorkout(rId, true);
      switchNavTab('tab-workout');
      sound.vibrate(30);
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

  // 課表編輯器內加入動作
  document.getElementById('addExerciseToTemplateBtn').addEventListener('click', () => {
    openExercisePicker('routine');
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

  // 關閉各抽屜 Modal
  document.getElementById('closePickerModalBtn').addEventListener('click', () => {
    document.getElementById('exercisePickerModal').classList.add('hidden');
  });
  document.getElementById('closeSwapTodayBtn').addEventListener('click', () => {
    document.getElementById('swapTodayModal').classList.add('hidden');
  });

  // 動作庫篩選按鈕
  document.querySelectorAll('.picker-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.picker-filter-btn').forEach(b => {
        b.className = 'picker-filter-btn px-3 py-1 rounded-full text-xs font-bold bg-iron-800 text-slate-300';
      });
      btn.className = 'picker-filter-btn px-3 py-1 rounded-full text-xs font-bold bg-accent-green text-iron-950';
      renderPickerExerciseList(btn.getAttribute('data-cat'));
    });
  });

  // 數據分頁動作切換
  document.getElementById('analyticsExerciseSelect').addEventListener('change', (e) => {
    renderStrengthLineChart(e.target.value);
  });

  // 匯出 JSON 備份
  document.getElementById('exportJsonBackupBtn').addEventListener('click', () => {
    const backup = {
      version: '4.0',
      exportDate: new Date().toISOString(),
      exercises: state.exercises,
      routines: state.routines,
      weeklySplit: state.weeklySplit,
      history: state.history,
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
        if (imported && Array.isArray(imported.history)) {
          state.history = imported.history;
          if (imported.exercises) state.exercises = imported.exercises;
          if (imported.routines) state.routines = imported.routines;
          if (imported.weeklySplit) state.weeklySplit = imported.weeklySplit;
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

// ======================= 12. 應用程式入口 =======================
window.addEventListener('DOMContentLoaded', () => {
  loadState();
  setupEventListeners();
  renderWorkoutSheet();
  updateManualTimerDisplay();

  if (window.lucide) lucide.createIcons();
});
