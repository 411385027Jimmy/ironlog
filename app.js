/**
 * IronLog PWA - 核心應用程式邏輯
 * 專為健身房現場操作優化：防手抖、高對比、單手大按鈕、離線持久化
 */

// ======================= 1. 預設資料與常數 =======================
const DEFAULT_EXERCISES = [
  { id: 'bench-press', name: '平板槓鈴臥推 (Bench Press)', category: '胸部' },
  { id: 'incline-db-press', name: '上斜啞鈴臥推 (Incline DB Press)', category: '胸部' },
  { id: 'squat', name: '槓鈴頸後深蹲 (Back Squat)', category: '腿部' },
  { id: 'front-squat', name: '槓鈴前蹲舉 (Front Squat)', category: '腿部' },
  { id: 'deadlift', name: '傳統硬舉 (Conventional Deadlift)', category: '背部' },
  { id: 'sumo-deadlift', name: '相撲硬舉 (Sumo Deadlift)', category: '背部' },
  { id: 'barbell-row', name: '槓鈴划船 (Barbell Row)', category: '背部' },
  { id: 'pull-up', name: '負重/自體引體向上 (Pull-Up)', category: '背部' },
  { id: 'ohp', name: '槓鈴站姿肩推 (Overhead Press)', category: '肩部' },
  { id: 'rdl', name: '羅馬尼亞硬舉 (RDL)', category: '腿部' },
  { id: 'dips', name: '雙槓臂屈伸 (Dips)', category: '胸部' }
];

// 槓片規格與國際標準塗裝配色 (IPF / IWF 色彩規範)
const PLATE_SPECS = [
  { weight: 25, color: '#ef4444', textColor: '#ffffff', label: '25', height: 'h-20', width: 'w-6', border: 'border-red-600' },
  { weight: 20, color: '#3b82f6', textColor: '#ffffff', label: '20', height: 'h-18', width: 'w-5', border: 'border-blue-600' },
  { weight: 15, color: '#eab308', textColor: '#000000', label: '15', height: 'h-16', width: 'w-5', border: 'border-yellow-600' },
  { weight: 10, color: '#22c55e', textColor: '#ffffff', label: '10', height: 'h-14', width: 'w-4', border: 'border-green-600' },
  { weight: 5, color: '#f8fafc', textColor: '#0f172a', label: '5', height: 'h-12', width: 'w-4', border: 'border-slate-300' },
  { weight: 2.5, color: '#1e293b', textColor: '#f8fafc', label: '2.5', height: 'h-10', width: 'w-3.5', border: 'border-slate-600' },
  { weight: 1.25, color: '#94a3b8', textColor: '#0f172a', label: '1.25', height: 'h-8', width: 'w-3', border: 'border-slate-400' }
];

// RTS (Reactive Training Systems) 官方 RPE 百分比對照矩陣
const RTS_RPE_CHART = {
  // reps: { rpe: %1RM }
  1: { 10: 1.000, 9.5: 0.978, 9: 0.955, 8.5: 0.939, 8: 0.922, 7.5: 0.907, 7: 0.892, 6.5: 0.878, 6: 0.863 },
  2: { 10: 0.955, 9.5: 0.939, 9: 0.922, 8.5: 0.907, 8: 0.892, 7.5: 0.878, 7: 0.863, 6.5: 0.849, 6: 0.834 },
  3: { 10: 0.922, 9.5: 0.907, 9: 0.892, 8.5: 0.878, 8: 0.863, 7.5: 0.849, 7: 0.834, 6.5: 0.819, 6: 0.804 },
  4: { 10: 0.892, 9.5: 0.878, 9: 0.863, 8.5: 0.849, 8: 0.834, 7.5: 0.819, 7: 0.804, 6.5: 0.790, 6: 0.774 },
  5: { 10: 0.863, 9.5: 0.849, 9: 0.834, 8.5: 0.819, 8: 0.811, 7.5: 0.790, 7: 0.774, 6.5: 0.760, 6: 0.744 },
  6: { 10: 0.834, 9.5: 0.819, 9: 0.804, 8.5: 0.790, 8: 0.774, 7.5: 0.760, 7: 0.744, 6.5: 0.728, 6: 0.713 },
  7: { 10: 0.804, 9.5: 0.790, 9: 0.774, 8.5: 0.760, 8: 0.744, 7.5: 0.728, 7: 0.713, 6.5: 0.697, 6: 0.681 },
  8: { 10: 0.774, 9.5: 0.760, 9: 0.744, 8.5: 0.728, 8: 0.713, 7.5: 0.697, 7: 0.681, 6.5: 0.665, 6: 0.649 },
  9: { 10: 0.744, 9.5: 0.728, 9: 0.713, 8.5: 0.697, 8: 0.681, 7.5: 0.665, 7: 0.649, 6.5: 0.632, 6: 0.617 },
  10: { 10: 0.713, 9.5: 0.697, 9: 0.681, 8.5: 0.665, 8: 0.649, 7.5: 0.632, 7: 0.617, 6.5: 0.601, 6: 0.584 },
  11: { 10: 0.681, 9.5: 0.665, 9: 0.649, 8.5: 0.632, 8: 0.617, 7.5: 0.601, 7: 0.584, 6.5: 0.569, 6: 0.553 },
  12: { 10: 0.649, 9.5: 0.632, 9: 0.617, 8.5: 0.601, 8: 0.584, 7.5: 0.569, 7: 0.553, 6.5: 0.538, 6: 0.522 }
};

// ======================= 2. 本地儲存資料結構 =======================
const STORAGE_KEYS = {
  EXERCISES: 'ironlog_exercises_v1',
  LOGS: 'ironlog_history_v1',
  SETTINGS: 'ironlog_settings_v1'
};

// 初始化預設訓練日誌種子資料（便於初次體驗漸進超負荷與上次表現功能）
const SEED_LOGS = [
  {
    id: 'seed-1',
    date: '2026-10-28',
    timestamp: 1793174400000,
    exerciseId: 'bench-press',
    exerciseName: '平板槓鈴臥推 (Bench Press)',
    weight: 80,
    reps: 8,
    rpe: 8,
    setType: 'working',
    e1rm: 112.2
  },
  {
    id: 'seed-2',
    date: '2026-10-28',
    timestamp: 1793174460000,
    exerciseId: 'bench-press',
    exerciseName: '平板槓鈴臥推 (Bench Press)',
    weight: 80,
    reps: 8,
    rpe: 8.5,
    setType: 'working',
    e1rm: 110.0
  },
  {
    id: 'seed-3',
    date: '2026-10-26',
    timestamp: 1793001600000,
    exerciseId: 'squat',
    exerciseName: '槓鈴頸後深蹲 (Back Squat)',
    weight: 120,
    reps: 5,
    rpe: 8,
    setType: 'working',
    e1rm: 148.0
  }
];

// 應用程式全域狀態
const state = {
  exercises: [],
  logs: [],
  settings: {
    barWeight: 20,
    restDuration: 90
  },
  currentTab: 'tab-plate',
  activeSetType: 'working',
  activeLogRpe: 8,
  // 計時器狀態
  timer: {
    intervalId: null,
    remainingSeconds: 0,
    totalSeconds: 90,
    isRunning: false
  }
};

// ======================= 3. 音效與震動模組 (現場觸覺與聽覺回饋) =======================
class FeedbackManager {
  constructor() {
    this.audioCtx = null;
  }

  initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
  }

  // 播放簡潔清晰的音效 (不需外部 mp3)
  beep(freq = 880, type = 'sine', duration = 0.15) {
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }

  // 計時器倒數結束的三聲提示
  playTimerDone() {
    this.beep(784, 'square', 0.15); // G5
    setTimeout(() => this.beep(880, 'square', 0.15), 180); // A5
    setTimeout(() => this.beep(1046, 'square', 0.35), 360); // C6
    this.vibrate([150, 100, 150, 100, 300]);
  }

  // PR 突破時的激勵三和弦
  playPRCelebration() {
    this.beep(523.25, 'triangle', 0.12);
    setTimeout(() => this.beep(659.25, 'triangle', 0.12), 120);
    setTimeout(() => this.beep(783.99, 'triangle', 0.15), 240);
    setTimeout(() => this.beep(1046.50, 'sine', 0.4), 380);
    this.vibrate([100, 80, 150, 80, 250]);
  }

  // 觸覺微震動 (提供如同原生 App 的實體按鈕回饋)
  vibrate(pattern = 30) {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }
}

const feedback = new FeedbackManager();

// ======================= 4. 槓片與熱身計算演算法 =======================

/**
 * 計算兩側槓片配置 (貪婪配算法)
 * @param {number} totalWeight 總目標重量 (kg)
 * @param {number} barWeight 槓鈴本體重 (kg)
 * @returns {Object} { sideWeight, plates: [{weight, count}], remainder, isValid }
 */
function calculatePlates(totalWeight, barWeight = 20) {
  if (totalWeight < barWeight) {
    return {
      sideWeight: 0,
      plates: [],
      remainder: totalWeight - barWeight,
      isValid: false,
      error: `目標重量低於槓鈴本體 (${barWeight} kg)`
    };
  }

  const sideWeight = (totalWeight - barWeight) / 2;
  let remaining = sideWeight;
  const plates = [];

  for (const spec of PLATE_SPECS) {
    if (remaining <= 0) break;
    const count = Math.floor((remaining + 0.0001) / spec.weight);
    if (count > 0) {
      plates.push({
        ...spec,
        count
      });
      remaining = Math.round((remaining - count * spec.weight) * 100) / 100;
    }
  }

  return {
    sideWeight,
    plates,
    remainder: remaining,
    isValid: true
  };
}

/**
 * 生成 4~5 組科學熱身排程 (Warmup Protocol)
 * 漸進活化神經、適應負重，同時避免肌力疲勞
 * @param {number} targetWeight 目標正式組重量
 * @param {number} barWeight 槓重
 */
function generateWarmupProtocol(targetWeight, barWeight = 20) {
  const steps = [];

  // Step 1: 空槓活動度與關節溫熱
  steps.push({
    title: 'Set 1: 空槓關節活化',
    weight: barWeight,
    reps: '10 次',
    intensity: '關節活動',
    desc: '專注動作軌跡、核心收緊與本體感覺'
  });

  if (targetWeight <= barWeight) {
    return steps;
  }

  // 輔助函式：四捨五入至最接近的 2.5kg (健身房常規跳階)
  const round2_5 = (val) => Math.max(barWeight, Math.round(val / 2.5) * 2.5);

  const netLoad = targetWeight - barWeight;

  if (netLoad >= 15) {
    // Step 2: 50% 啟動組
    const w50 = round2_5(barWeight + netLoad * 0.45);
    steps.push({
      title: 'Set 2: 神經啟動',
      weight: w50,
      reps: '5 次',
      intensity: '50% 工作重',
      desc: '平穩推蹬，確保兩側平衡'
    });
  }

  if (netLoad >= 30) {
    // Step 3: 70% 力量過渡組
    const w70 = round2_5(barWeight + netLoad * 0.70);
    steps.push({
      title: 'Set 3: 爆發衝動',
      weight: w70,
      reps: '3 次',
      intensity: '70% 工作重',
      desc: '發力快速，保留充足體力'
    });
  }

  if (netLoad >= 50) {
    // Step 4: 85% 神經適應組 (Potentiation)
    const w85 = round2_5(barWeight + netLoad * 0.85);
    steps.push({
      title: 'Set 4: 重量適應',
      weight: w85,
      reps: '1~2 次',
      intensity: '85% 工作重',
      desc: '感受真實壓迫感，嚴禁力竭'
    });
  }

  // Step 5: 目標正式組
  steps.push({
    title: 'Set 5: 正式工作組',
    weight: targetWeight,
    reps: '目標次數',
    intensity: '100% 工作重',
    desc: '深呼吸固定腹內壓，全力以赴！'
  });

  return steps;
}

// ======================= 5. RPE 與 e1RM 演算法 =======================

/**
 * 依據重量、次數、RPE 計算估算 1RM (e1RM)
 * 優先使用 RTS 官方健力係數矩陣，若超出矩陣則結合 Epley 補間
 */
function calculateE1RM(weight, reps, rpe) {
  if (weight <= 0 || reps <= 0) return 0;
  
  // 1. 查表 RTS 百分比
  const repKey = Math.min(Math.max(1, Math.round(reps)), 12);
  const rpeKey = Math.min(Math.max(6, rpe), 10);

  if (RTS_RPE_CHART[repKey] && RTS_RPE_CHART[repKey][rpeKey]) {
    const percentage = RTS_RPE_CHART[repKey][rpeKey];
    return Math.round((weight / percentage) * 10) / 10;
  }

  // 2. 超出表格範圍時，採用 Epley 公式加上保留次數 (RIR)
  // RIR (Reps in Reserve) = 10 - rpe
  const rir = Math.max(0, 10 - rpe);
  const effectiveReps = reps + rir;
  const e1rmEpley = weight * (1 + effectiveReps / 30);
  return Math.round(e1rmEpley * 10) / 10;
}

/**
 * 給定 e1RM，反推在指定次數與 RPE 下的建議訓練重量
 */
function reverseWeightFrom1RM(e1rm, targetReps, targetRpe) {
  if (e1rm <= 0) return 0;
  const repKey = Math.min(Math.max(1, Math.round(targetReps)), 12);
  const rpeKey = Math.min(Math.max(6, targetRpe), 10);

  let percentage = 0.8;
  if (RTS_RPE_CHART[repKey] && RTS_RPE_CHART[repKey][rpeKey]) {
    percentage = RTS_RPE_CHART[repKey][rpeKey];
  } else {
    const rir = Math.max(0, 10 - targetRpe);
    percentage = 1 / (1 + (targetReps + rir) / 30);
  }

  const weight = e1rm * percentage;
  // 四捨五入至最接近 0.5kg
  return Math.round(weight * 2) / 2;
}

// ======================= 6. 資料庫儲存與載入 =======================

function loadLocalData() {
  try {
    const storedExercises = localStorage.getItem(STORAGE_KEYS.EXERCISES);
    state.exercises = storedExercises ? JSON.parse(storedExercises) : [...DEFAULT_EXERCISES];

    const storedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
    state.logs = storedLogs ? JSON.parse(storedLogs) : [...SEED_LOGS];

    const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (storedSettings) {
      state.settings = { ...state.settings, ...JSON.parse(storedSettings) };
    }
  } catch (e) {
    console.error('Failed to load local storage data:', e);
    state.exercises = [...DEFAULT_EXERCISES];
    state.logs = [...SEED_LOGS];
  }
}

function saveLocalData() {
  try {
    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(state.exercises));
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(state.logs));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
  } catch (e) {
    console.error('Failed to save to local storage:', e);
  }
}

// ======================= 7. UI 渲染：槓片計算機 =======================

function renderPlateCalculator() {
  const targetWeight = parseFloat(document.getElementById('targetWeightInput').value) || 0;
  const barWeight = state.settings.barWeight;

  const result = calculatePlates(targetWeight, barWeight);
  const graphicContainer = document.getElementById('barbellGraphic');
  const summaryContainer = document.getElementById('platesListSummary');
  const sideWeightBadge = document.getElementById('sideWeightBadge');
  const remainderWarning = document.getElementById('plateRemainderWarning');
  const remainderText = document.getElementById('plateRemainderText');

  sideWeightBadge.textContent = `單邊 ${result.sideWeight} kg`;

  // 繪製槓片切面視覺圖
  graphicContainer.innerHTML = '';

  if (!result.isValid) {
    remainderWarning.classList.remove('hidden');
    remainderText.textContent = result.error;
    summaryContainer.innerHTML = `<span class="text-xs text-rose-400 font-mono">請將總重量設定高於空槓 (${barWeight}kg)</span>`;
    return;
  }

  if (result.remainder > 0) {
    remainderWarning.classList.remove('hidden');
    remainderText.textContent = `提醒：單側有 ${result.remainder} kg 無法被標準片整除，請依現場微量片配平。`;
  } else {
    remainderWarning.classList.add('hidden');
  }

  // 槓鈴桿本體切面 (Sleeve)
  const barbellBar = document.createElement('div');
  barbellBar.className = 'absolute left-0 right-0 h-4 bg-gradient-to-b from-slate-400 via-slate-200 to-slate-500 rounded-sm z-0 top-1/2 -translate-y-1/2';
  graphicContainer.appendChild(barbellBar);

  // 內側擋圈 (Inner Collar)
  const innerCollar = document.createElement('div');
  innerCollar.className = 'w-3 h-16 bg-gradient-to-r from-amber-600 to-amber-500 rounded-sm z-10 mr-1.5 shadow-md flex-shrink-0';
  innerCollar.title = '內側擋圈 (Collar)';
  graphicContainer.appendChild(innerCollar);

  // 渲染所有掛載的片 (由內至外)
  if (result.plates.length === 0) {
    const emptyLabel = document.createElement('div');
    emptyLabel.className = 'z-10 ml-4 text-xs font-mono text-slate-400 italic';
    emptyLabel.textContent = '(空槓，無需掛片)';
    graphicContainer.appendChild(emptyLabel);
    summaryContainer.innerHTML = `<span class="text-xs font-mono text-slate-400">目前為空槓 (${barWeight} kg)，兩側無需掛片</span>`;
  } else {
    summaryContainer.innerHTML = '';
    result.plates.forEach(p => {
      // 繪製圖形
      for (let i = 0; i < p.count; i++) {
        const plateEl = document.createElement('div');
        plateEl.className = `${p.width} ${p.height} ${p.border} rounded-md z-10 mr-1 flex items-center justify-center font-black text-[9px] shadow-lg transition-transform hover:scale-105 flex-shrink-0`;
        plateEl.style.backgroundColor = p.color;
        plateEl.style.color = p.textColor;
        plateEl.style.borderWidth = '1px';
        plateEl.textContent = p.label;
        graphicContainer.appendChild(plateEl);
      }

      // 文字標籤
      const tag = document.createElement('div');
      tag.className = 'px-2.5 py-1 rounded-lg text-xs font-bold font-mono flex items-center gap-1 border shadow-sm';
      tag.style.backgroundColor = `${p.color}20`;
      tag.style.borderColor = `${p.color}60`;
      tag.style.color = p.color === '#f8fafc' ? '#e2e8f0' : p.color;
      tag.innerHTML = `<span>${p.weight} kg</span> <span class="text-white text-[10px] bg-iron-800 px-1.5 py-0.2 rounded">× ${p.count}</span>`;
      summaryContainer.appendChild(tag);
    });

    // 最外層夾簧扣環 (Clip / Collar clamp)
    const outerClip = document.createElement('div');
    outerClip.className = 'w-3 h-8 bg-slate-300 border border-slate-400 rounded-sm z-10 ml-0.5 shadow flex-shrink-0';
    outerClip.title = '槓鈴安全夾 (Collar Clip)';
    graphicContainer.appendChild(outerClip);
  }

  // 渲染熱身排程
  renderWarmupSchedule(targetWeight, barWeight);
}

function renderWarmupSchedule(targetWeight, barWeight) {
  const container = document.getElementById('warmupListContainer');
  const warmupSteps = generateWarmupProtocol(targetWeight, barWeight);

  container.innerHTML = '';
  warmupSteps.forEach((step, idx) => {
    const card = document.createElement('div');
    card.className = 'p-2.5 rounded-xl bg-iron-950/80 border border-iron-800 flex items-center justify-between text-xs hover:border-iron-700 transition';

    // 計算該熱身組槓片
    const plateCalc = calculatePlates(step.weight, barWeight);
    let plateSummaryText = '空槓';
    if (plateCalc.plates.length > 0) {
      plateSummaryText = plateCalc.plates.map(p => `${p.weight}k×${p.count}`).join(' + ');
    }

    card.innerHTML = `
      <div class="space-y-0.5">
        <div class="flex items-center gap-2">
          <span class="font-bold text-slate-200">${step.title}</span>
          <span class="text-[10px] px-1.5 py-0.2 rounded bg-iron-800 text-amber-400 font-mono">${step.intensity}</span>
        </div>
        <div class="text-[11px] text-slate-400">
          <span>單邊：<strong class="text-amber-400 font-mono">${plateSummaryText}</strong></span>
          <span class="mx-1">•</span>
          <span>${step.desc}</span>
        </div>
      </div>
      <div class="text-right shrink-0 ml-3">
        <div class="font-mono font-black text-sm text-white">${step.weight} <span class="text-[10px] text-slate-400">kg</span></div>
        <div class="font-mono text-amber-400 font-semibold text-[11px]">${step.reps}</div>
      </div>
    `;

    // 點擊卡片可快速代入目標重量
    card.addEventListener('click', () => {
      document.getElementById('targetWeightInput').value = step.weight;
      renderPlateCalculator();
      feedback.vibrate(25);
    });

    container.appendChild(card);
  });
}

// ======================= 8. UI 渲染：訓練日誌與漸進超負荷 =======================

function populateExerciseSelect() {
  const select = document.getElementById('exerciseSelect');
  const currentVal = select.value;
  select.innerHTML = '';

  // 依肌群分類
  const categories = {};
  state.exercises.forEach(ex => {
    if (!categories[ex.category]) categories[ex.category] = [];
    categories[ex.category].push(ex);
  });

  for (const [catName, list] of Object.entries(categories)) {
    const optGroup = document.createElement('optgroup');
    optGroup.label = `── ${catName} ──`;
    list.forEach(ex => {
      const opt = document.createElement('option');
      opt.value = ex.id;
      opt.textContent = ex.name;
      optGroup.appendChild(opt);
    });
    select.appendChild(optGroup);
  }

  if (currentVal && state.exercises.some(e => e.id === currentVal)) {
    select.value = currentVal;
  }
}

function updateExerciseStatsAndTips() {
  const selectedExId = document.getElementById('exerciseSelect').value;
  const exLogs = state.logs
    .filter(l => l.exerciseId === selectedExId)
    .sort((a, b) => b.timestamp - a.timestamp);

  const lastDateEl = document.getElementById('lastPerfDate');
  const lastDetailsEl = document.getElementById('lastPerfDetails');
  const tipTextEl = document.getElementById('overloadTipText');

  if (exLogs.length === 0) {
    lastDateEl.textContent = '暫無紀錄';
    lastDetailsEl.textContent = '此動作尚無歷史組數，完成今日第一組以建立超負荷基準！';
    tipTextEl.textContent = '建議選擇能標準完成 8~10 下的重量，建立第一組基礎標竿。';
    return;
  }

  // 最近一次訓練日期
  const lastLog = exLogs[0];
  const lastSessionDate = lastLog.date;
  const lastSessionLogs = exLogs.filter(l => l.date === lastSessionDate && l.setType === 'working');
  const workingSets = lastSessionLogs.length > 0 ? lastSessionLogs : exLogs.filter(l => l.date === lastSessionDate);

  // 找出該次最佳組
  const bestSetOfSession = workingSets.reduce((max, cur) => cur.weight > max.weight ? cur : max, workingSets[0]);

  lastDateEl.textContent = `上次訓練：${lastSessionDate}`;
  lastDetailsEl.innerHTML = `
    <div class="flex items-center gap-2">
      <span class="text-amber-400 font-mono font-black text-base">${bestSetOfSession.weight} kg</span>
      <span class="text-slate-300">×</span>
      <span class="text-white font-mono font-bold">${bestSetOfSession.reps} 下</span>
      <span class="text-xs font-mono text-slate-400">@ RPE ${bestSetOfSession.rpe}</span>
      <span class="text-[11px] text-slate-500 font-mono">(e1RM: ${bestSetOfSession.e1rm}kg)</span>
    </div>
  `;

  // 智慧漸進超負荷教練建議
  const targetWeightOverload = bestSetOfSession.weight + 2.5;
  const targetRepsOverload = bestSetOfSession.reps + 1;

  tipTextEl.innerHTML = `
    今日突破重點：試試 <span class="font-mono font-bold text-amber-400">${targetWeightOverload} kg × ${bestSetOfSession.reps} 次</span>（重量超負荷）或維持 <span class="font-mono font-bold text-amber-400">${bestSetOfSession.weight} kg × ${targetRepsOverload} 次</span>（次數超負荷）！
  `;

  // 自動將輸入框預設為上次組數的重量與次數
  document.getElementById('logWeightInput').value = bestSetOfSession.weight;
  document.getElementById('logRepsInput').value = bestSetOfSession.reps;
}

function renderTodaySets() {
  const container = document.getElementById('todaySetsList');
  const totalVolumeBadge = document.getElementById('todayTotalVolumeBadge');
  const todayStr = new Date().toISOString().split('T')[0];

  const todayLogs = state.logs.filter(l => l.date === todayStr);

  // 計算今日總容量 Volume Load (Weight * Reps)
  const totalVolume = todayLogs.reduce((acc, l) => acc + (l.weight * l.reps), 0);
  totalVolumeBadge.textContent = `${totalVolume.toLocaleString()} kg 容量`;

  if (todayLogs.length === 0) {
    container.innerHTML = `
      <div class="text-center py-6 text-slate-500 text-xs">
        今天尚未記錄任何組數，點擊上方按鈕開始記錄！
      </div>
    `;
    document.getElementById('currentSetNumLabel').textContent = 'Set 1';
    return;
  }

  // 更新當前 Set 標籤
  const currentExId = document.getElementById('exerciseSelect').value;
  const currentExTodayCount = todayLogs.filter(l => l.exerciseId === currentExId).length;
  document.getElementById('currentSetNumLabel').textContent = `Set ${currentExTodayCount + 1}`;

  container.innerHTML = '';
  // 最新的排在前面
  todayLogs.slice().reverse().forEach((log) => {
    const item = document.createElement('div');
    item.className = 'p-3 rounded-xl bg-iron-950 border border-iron-800 flex items-center justify-between text-xs';

    const setTypeTag = {
      working: '<span class="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold text-[10px]">正式組</span>',
      warmup: '<span class="px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-bold text-[10px]">熱身組</span>',
      failure: '<span class="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold text-[10px]">力竭</span>',
      drop: '<span class="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold text-[10px]">遞減</span>'
    }[log.setType] || '';

    item.innerHTML = `
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <strong class="text-white text-sm">${log.exerciseName}</strong>
          ${setTypeTag}
        </div>
        <div class="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
          <span class="text-amber-400 font-bold text-xs">${log.weight} kg × ${log.reps} 次</span>
          <span>@ RPE ${log.rpe}</span>
          <span>e1RM: ${log.e1rm}kg</span>
        </div>
      </div>
      <button data-delete-id="${log.id}" class="delete-log-btn text-slate-500 hover:text-rose-400 p-2 rounded-lg" title="刪除此紀錄">
        <i data-lucide="trash-2" class="w-4 h-4"></i>
      </button>
    `;

    container.appendChild(item);
  });

  if (window.lucide) lucide.createIcons();
}

// 檢查是否創下歷史 PR
function checkForPR(exerciseId, newE1rm, newWeight) {
  const previousLogs = state.logs.filter(l => l.exerciseId === exerciseId);
  if (previousLogs.length <= 1) return false; // 初始基準

  const maxPrevE1rm = Math.max(...previousLogs.slice(1).map(l => l.e1rm || 0));
  const maxPrevWeight = Math.max(...previousLogs.slice(1).map(l => l.weight || 0));

  return newE1rm > maxPrevE1rm || newWeight > maxPrevWeight;
}

// ======================= 9. UI 渲染：RPE 與 e1RM 換算器 =======================

function renderRpeCalculator() {
  const weight = parseFloat(document.getElementById('calcWeightInput').value) || 0;
  const reps = parseInt(document.getElementById('calcRepsInput').value) || 1;
  const rpe = parseFloat(document.getElementById('calcRpeSelect').value) || 10;

  const e1rm = calculateE1RM(weight, reps, rpe);
  document.getElementById('calculated1RMDisplay').textContent = e1rm.toFixed(1);

  // 反推
  const targetReps = parseInt(document.getElementById('targetRepsReverseSelect').value) || 3;
  const targetRpe = parseFloat(document.getElementById('targetRpeReverseSelect').value) || 8;
  const targetWeight = reverseWeightFrom1RM(e1rm, targetReps, targetRpe);
  document.getElementById('reverseWeightResult').textContent = targetWeight.toFixed(1);

  // 生成 RM 對照表 (1RM ~ 10RM 及 90%, 80%, 70%)
  const tableBody = document.getElementById('rmTableBody');
  tableBody.innerHTML = '';

  const rmPresets = [
    { label: '1RM', pct: 1.00, reps: 1, goal: '最大神經肌力極限' },
    { label: '3RM', pct: 0.92, reps: 3, goal: '高強度力量突破' },
    { label: '5RM', pct: 0.86, reps: 5, goal: '力量底層基礎 (經典5x5)' },
    { label: '8RM', pct: 0.77, reps: 8, goal: '肌肥大與肌力並重' },
    { label: '10RM', pct: 0.71, reps: 10, goal: '肌肥大肌耐力區間' },
    { label: '12RM', pct: 0.65, reps: 12, goal: '肌耐力與代謝壓力' }
  ];

  rmPresets.forEach(row => {
    const recWeight = Math.round((e1rm * row.pct) * 2) / 2;
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-iron-850/50';
    tr.innerHTML = `
      <td class="py-2 px-1 text-white font-bold">${row.label}</td>
      <td class="py-2 px-1 text-slate-400">${Math.round(row.pct * 100)}%</td>
      <td class="py-2 px-1 text-amber-400 font-bold">${recWeight} kg</td>
      <td class="py-2 px-1 text-slate-400 text-[11px]">${row.goal}</td>
    `;
    tableBody.appendChild(tr);
  });
}

// ======================= 10. UI 渲染：歷史與個人 PR 榮譽榜 =======================

function renderHistoryAndPRs() {
  const container = document.getElementById('prListContainer');
  container.innerHTML = '';

  // 遍歷所有動作計算最佳 PR
  state.exercises.forEach(ex => {
    const exLogs = state.logs.filter(l => l.exerciseId === ex.id);
    if (exLogs.length === 0) return;

    let bestWeight = 0;
    let bestE1rm = 0;
    let bestReps = 0;

    exLogs.forEach(l => {
      if (l.weight > bestWeight) bestWeight = l.weight;
      if (l.e1rm > bestE1rm) {
        bestE1rm = l.e1rm;
        bestReps = l.reps;
      }
    });

    const card = document.createElement('div');
    card.className = 'bg-iron-950 border border-iron-800 rounded-xl p-3 space-y-1';
    card.innerHTML = `
      <div class="text-[11px] font-bold text-slate-300 truncate" title="${ex.name}">${ex.name}</div>
      <div class="flex items-baseline justify-between pt-1">
        <span class="text-xs text-slate-500 font-mono">e1RM</span>
        <span class="text-base font-mono font-black text-amber-400">${bestE1rm} <span class="text-[10px] text-slate-400">kg</span></span>
      </div>
      <div class="flex items-baseline justify-between text-[11px] text-slate-400 font-mono">
        <span>最大負重</span>
        <span class="text-slate-200 font-bold">${bestWeight} kg</span>
      </div>
    `;
    container.appendChild(card);
  });

  if (container.children.length === 0) {
    container.innerHTML = `<div class="col-span-2 text-center py-4 text-xs text-slate-500">尚無 PR 紀錄，開始訓練並記錄吧！</div>`;
  }
}

// ======================= 11. 常駐組間休息計時器邏輯 =======================

function startTimer(seconds) {
  if (state.timer.intervalId) {
    clearInterval(state.timer.intervalId);
  }

  state.timer.totalSeconds = seconds;
  state.timer.remainingSeconds = seconds;
  state.timer.isRunning = true;

  updateTimerDisplay();

  state.timer.intervalId = setInterval(() => {
    state.timer.remainingSeconds--;
    updateTimerDisplay();

    if (state.timer.remainingSeconds <= 0) {
      clearInterval(state.timer.intervalId);
      state.timer.isRunning = false;
      feedback.playTimerDone();
      alertNotification('組間休息時間到！請準備下一組。');
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
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const display = document.getElementById('timerDisplay');
  const widget = document.getElementById('restTimerWidget');
  const total = state.timer.remainingSeconds;

  const mins = Math.floor(total / 60);
  const secs = total % 60;
  display.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  if (state.timer.isRunning) {
    widget.classList.add('border-amber-500', 'bg-amber-500/10');
  } else {
    widget.classList.remove('border-amber-500', 'bg-amber-500/10');
  }
}

// 簡易浮動提示 Toast
function alertNotification(msg) {
  const toast = document.createElement('div');
  toast.className = 'fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-iron-950 font-bold px-4 py-2.5 rounded-xl shadow-2xl text-xs flex items-center gap-2 animate-bounce';
  toast.innerHTML = `<i data-lucide="bell" class="w-4 h-4"></i><span>${msg}</span>`;
  document.body.appendChild(toast);
  if (window.lucide) lucide.createIcons();

  setTimeout(() => {
    toast.remove();
  }, 3200);
}

// ======================= 12. 事件監聽與使用者交互綁定 =======================

function setupEventListeners() {
  // 底部導航切換
  const navBtns = document.querySelectorAll('.nav-tab-btn');
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      switchTab(targetId);
      feedback.vibrate(20);
    });
  });

  // 槓片計算機：輸入變化
  const targetWeightInput = document.getElementById('targetWeightInput');
  targetWeightInput.addEventListener('input', () => renderPlateCalculator());

  // 槓片計算機：微調按鈕列
  document.querySelectorAll('.weight-adjust-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const delta = parseFloat(btn.getAttribute('data-weight-adjust'));
      const cur = parseFloat(targetWeightInput.value) || 0;
      targetWeightInput.value = Math.max(0, cur + delta);
      renderPlateCalculator();
      feedback.vibrate(25);
    });
  });

  // 槓鈴空槓切換
  document.querySelectorAll('.bar-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.bar-btn').forEach(b => {
        b.className = 'bar-btn px-3 py-1 rounded-md text-xs font-semibold text-slate-400 hover:text-white';
      });
      btn.className = 'bar-btn px-3 py-1 rounded-md text-xs font-semibold bg-amber-500 text-iron-950';
      state.settings.barWeight = parseFloat(btn.getAttribute('data-bar'));
      saveLocalData();
      renderPlateCalculator();
      feedback.vibrate(25);
    });
  });

  // 快速切換熱身組展開/折疊
  const toggleWarmupDetail = document.getElementById('toggleWarmupDetail');
  toggleWarmupDetail.addEventListener('click', () => {
    const list = document.getElementById('warmupListContainer');
    list.classList.toggle('hidden');
    toggleWarmupDetail.textContent = list.classList.contains('hidden') ? '展開掛片' : '收合掛片';
  });

  // 現場訓練日誌：動作選單變更
  const exerciseSelect = document.getElementById('exerciseSelect');
  exerciseSelect.addEventListener('change', () => {
    updateExerciseStatsAndTips();
    renderTodaySets();
  });

  // 組別類型切換
  document.querySelectorAll('.set-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.set-type-btn').forEach(b => {
        b.className = 'set-type-btn px-2.5 py-1 text-[11px] font-bold rounded bg-iron-800 text-slate-400 hover:text-white';
      });
      btn.className = 'set-type-btn px-2.5 py-1 text-[11px] font-bold rounded bg-amber-500 text-iron-950';
      state.activeSetType = btn.getAttribute('data-type');
      feedback.vibrate(20);
    });
  });

  // RPE 膠囊切換
  document.querySelectorAll('.rpe-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.rpe-btn').forEach(b => {
        b.className = 'rpe-btn py-2 rounded-lg bg-iron-950 border border-iron-800 text-xs font-mono font-bold text-slate-300';
      });
      btn.className = 'rpe-btn py-2 rounded-lg bg-amber-500 text-iron-950 font-mono font-black border border-amber-400';
      state.activeLogRpe = parseFloat(btn.getAttribute('data-rpe'));
      
      const rir = Math.max(0, 10 - state.activeLogRpe);
      document.getElementById('selectedRpeDesc').textContent = `RPE ${state.activeLogRpe} (${rir === 0 ? '力竭' : `還能做 ${rir} 次`})`;
      feedback.vibrate(20);
    });
  });

  // 訓練日誌重量與次數微調按鈕
  document.querySelectorAll('.log-weight-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const delta = parseFloat(btn.getAttribute('data-log-weight'));
      const input = document.getElementById('logWeightInput');
      input.value = Math.max(0, (parseFloat(input.value) || 0) + delta);
      feedback.vibrate(25);
    });
  });

  document.querySelectorAll('.log-reps-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const delta = parseInt(btn.getAttribute('data-log-reps'));
      const input = document.getElementById('logRepsInput');
      input.value = Math.max(1, (parseInt(input.value) || 0) + delta);
      feedback.vibrate(25);
    });
  });

  // 一鍵記錄當前組按鈕
  document.getElementById('saveSetBtn').addEventListener('click', () => {
    const exerciseId = exerciseSelect.value;
    const exerciseObj = state.exercises.find(e => e.id === exerciseId);
    const weight = parseFloat(document.getElementById('logWeightInput').value) || 0;
    const reps = parseInt(document.getElementById('logRepsInput').value) || 1;
    const rpe = state.activeLogRpe;
    const setType = state.activeSetType;

    const e1rm = calculateE1RM(weight, reps, rpe);
    const todayStr = new Date().toISOString().split('T')[0];

    const newLog = {
      id: 'log-' + Date.now(),
      date: todayStr,
      timestamp: Date.now(),
      exerciseId,
      exerciseName: exerciseObj ? exerciseObj.name : '自訂動作',
      weight,
      reps,
      rpe,
      setType,
      e1rm
    };

    // 檢查是否創下 PR
    const isPR = checkForPR(exerciseId, e1rm, weight);

    state.logs.unshift(newLog);
    saveLocalData();

    feedback.beep(660, 'sine', 0.1);
    if (isPR) {
      setTimeout(() => feedback.playPRCelebration(), 150);
      alertNotification(`🔥 恭喜！打破個人最佳紀錄 (PR: ${e1rm} kg)！`);
    } else {
      alertNotification(`已記錄：${weight}kg × ${reps} @ RPE ${rpe}`);
    }

    renderTodaySets();
    updateExerciseStatsAndTips();
    renderHistoryAndPRs();

    // 自動啟動組間休息計時器 (預設 90s)
    startTimer(state.settings.restDuration || 90);
  });

  // 刪除組數事件委託
  document.getElementById('todaySetsList').addEventListener('click', (e) => {
    const btn = e.target.closest('.delete-log-btn');
    if (!btn) return;
    const logId = btn.getAttribute('data-delete-id');
    state.logs = state.logs.filter(l => l.id !== logId);
    saveLocalData();
    renderTodaySets();
    updateExerciseStatsAndTips();
    renderHistoryAndPRs();
    feedback.vibrate(25);
  });

  // 清空今日組數
  document.getElementById('clearTodaySetsBtn').addEventListener('click', () => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (confirm('確定要清空今天的所有組數紀錄嗎？')) {
      state.logs = state.logs.filter(l => l.date !== todayStr);
      saveLocalData();
      renderTodaySets();
      updateExerciseStatsAndTips();
      renderHistoryAndPRs();
    }
  });

  // 新增自訂動作 Modal
  const modal = document.getElementById('addExerciseModal');
  document.getElementById('addNewExerciseBtn').addEventListener('click', () => {
    modal.classList.remove('hidden');
    document.getElementById('newExerciseNameInput').focus();
  });
  document.getElementById('closeModalBtn').addEventListener('click', () => modal.classList.add('hidden'));
  document.getElementById('cancelAddExerciseBtn').addEventListener('click', () => modal.classList.add('hidden'));

  document.getElementById('confirmAddExerciseBtn').addEventListener('click', () => {
    const nameInput = document.getElementById('newExerciseNameInput');
    const catSelect = document.getElementById('newExerciseCategory');
    const name = nameInput.value.trim();
    if (!name) return alert('請輸入動作名稱！');

    const newEx = {
      id: 'ex-' + Date.now(),
      name,
      category: catSelect.value
    };

    state.exercises.push(newEx);
    saveLocalData();
    populateExerciseSelect();
    exerciseSelect.value = newEx.id;
    updateExerciseStatsAndTips();
    modal.classList.add('hidden');
    nameInput.value = '';
    alertNotification(`已新增動作：「${name}」`);
  });

  // RPE / e1RM 輸入監聽
  ['calcWeightInput', 'calcRepsInput', 'calcRpeSelect', 'targetRepsReverseSelect', 'targetRpeReverseSelect'].forEach(id => {
    document.getElementById(id).addEventListener('input', renderRpeCalculator);
  });

  // 計時器組件點擊展開快捷抽屜
  const timerWidget = document.getElementById('restTimerWidget');
  const timerDrawer = document.getElementById('timerDrawer');
  document.getElementById('timerToggleBtn').addEventListener('click', () => {
    timerDrawer.classList.toggle('hidden');
  });
  document.getElementById('closeTimerDrawerBtn').addEventListener('click', () => {
    timerDrawer.classList.add('hidden');
  });
  document.getElementById('timerStopBtn').addEventListener('click', () => {
    stopTimer();
    feedback.vibrate(30);
  });

  // 快捷時間按鈕
  document.querySelectorAll('.timer-quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sec = parseInt(btn.getAttribute('data-quick-time'));
      state.settings.restDuration = sec;
      saveLocalData();
      startTimer(sec);
      timerDrawer.classList.add('hidden');
      feedback.vibrate(25);
    });
  });

  // 匯出 JSON 備份
  document.getElementById('exportDataBtn').addEventListener('click', () => {
    const backupData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      exercises: state.exercises,
      logs: state.logs,
      settings: state.settings
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ironlog-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    alertNotification('備份已成功下載！');
  });

  // 匯入還原 JSON
  document.getElementById('importFileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported && Array.isArray(imported.exercises) && Array.isArray(imported.logs)) {
          state.exercises = imported.exercises;
          state.logs = imported.logs;
          if (imported.settings) state.settings = imported.settings;
          saveLocalData();
          populateExerciseSelect();
          updateExerciseStatsAndTips();
          renderTodaySets();
          renderHistoryAndPRs();
          alertNotification('🎉 資料已成功還原！');
        } else {
          alert('匯入的 JSON 格式不正確。');
        }
      } catch (err) {
        alert('解析檔案失敗，請確認為合法的 JSON 檔案。');
      }
    };
    reader.readAsText(file);
  });

  // 重置資料
  document.getElementById('clearAllDataBtn').addEventListener('click', () => {
    if (confirm('確定要將所有動作與日誌重置為預設值嗎？此動作無法復原！')) {
      localStorage.removeItem(STORAGE_KEYS.EXERCISES);
      localStorage.removeItem(STORAGE_KEYS.LOGS);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      loadLocalData();
      populateExerciseSelect();
      updateExerciseStatsAndTips();
      renderTodaySets();
      renderHistoryAndPRs();
      alertNotification('已重置為預設初始資料。');
    }
  });

  // 快速重量按鈕 (常用三大項工作重切換)
  document.getElementById('quickPresetsBtn').addEventListener('click', () => {
    const presets = [60, 80, 100, 120, 140, 180];
    const cur = parseFloat(targetWeightInput.value) || 60;
    let nextIdx = presets.findIndex(p => p > cur);
    if (nextIdx === -1) nextIdx = 0;
    targetWeightInput.value = presets[nextIdx];
    renderPlateCalculator();
    feedback.vibrate(25);
  });
}

function switchTab(tabId) {
  state.currentTab = tabId;

  // 隱藏所有視圖
  document.querySelectorAll('.tab-pane').forEach(el => el.classList.add('hidden'));
  const activePane = document.getElementById(tabId);
  if (activePane) activePane.classList.remove('hidden');

  // 更新按鈕高亮
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    const isCurrent = btn.getAttribute('data-target') === tabId;
    if (isCurrent) {
      btn.className = 'nav-tab-btn active flex flex-col items-center justify-center py-1.5 rounded-xl text-amber-400 transition';
    } else {
      btn.className = 'nav-tab-btn flex flex-col items-center justify-center py-1.5 rounded-xl text-slate-400 hover:text-slate-200 transition';
    }
  });

  if (window.lucide) lucide.createIcons();
}

// ======================= 13. 應用程式入口 =======================
window.addEventListener('DOMContentLoaded', () => {
  loadLocalData();
  populateExerciseSelect();
  renderPlateCalculator();
  updateExerciseStatsAndTips();
  renderTodaySets();
  renderRpeCalculator();
  renderHistoryAndPRs();
  setupEventListeners();

  if (window.lucide) {
    lucide.createIcons();
  }
});

