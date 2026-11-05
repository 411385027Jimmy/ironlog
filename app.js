/**
 * IronLog Pro - 核心應用程式邏輯 (v6.0 全面重構版)
 * 包含：打勾流水線、雙軌排程模式、部位熱身、動作知識庫指南、Form Check 側拍影片回放 (IndexedDB)、
 * 現場計算工具箱、SVG動態肌群疲勞、雙軸進度圖、Canvas結算分享卡
 */

// ======================= 1. 動作知識庫與預設資料 =======================
const DEFAULT_EXERCISES = [
  // 胸部
  { id: 'bench-press', name: '平板槓鈴臥推 (Bench Press)', category: '胸部', isCompound: true, pinNote: '握距中指對準刻痕，沉肩收核心' },
  { id: 'incline-db-press', name: '上斜啞鈴臥推 (Incline DB Press)', category: '胸部', isCompound: false, pinNote: '椅背調整至 30 度角，手肘內夾45度' },
  { id: 'incline-barbell-press', name: '上斜槓鈴臥推 (Incline BB Press)', category: '胸部', isCompound: true, pinNote: '落點於鎖骨下方2公分，挺胸沈肩' },
  { id: 'db-bench-press', name: '啞鈴平板臥推 (Flat DB Press)', category: '胸部', isCompound: false, pinNote: '底端小臂垂直地面，頂部自然靠攏不撞擊' },
  { id: 'dips', name: '雙槓臂屈伸 (Dips)', category: '胸部', isCompound: true, pinNote: '軀幹前傾著重下胸，下放至大臂平行地面' },
  { id: 'cable-fly', name: '滑輪夾胸 (Cable Fly)', category: '胸部', isCompound: false, pinNote: '滑輪高度調整至肩膀水平，手臂微屈抱大樹' },
  { id: 'pec-deck', name: '蝴蝶機夾胸 (Pec Deck Fly)', category: '胸部', isCompound: false, pinNote: '握把高度對齊乳頭連線，頂峰收縮停頓1秒' },
  { id: 'push-up', name: '伏地挺身 (Push-Up)', category: '胸部', isCompound: false, pinNote: '腹臀夾緊成一平板，鼻尖輕觸地面' },
  { id: 'decline-press', name: '下斜臥推 (Decline Press)', category: '胸部', isCompound: true, pinNote: '小腿勾牢固定，落點於下胸緣' },

  // 腿部
  { id: 'squat', name: '槓鈴頸後深蹲 (Back Squat)', category: '腿部', isCompound: true, pinNote: '站距略寬於肩，腳尖朝外30度，膝對腳尖' },
  { id: 'front-squat', name: '槓鈴頸前深蹲 (Front Squat)', category: '腿部', isCompound: true, pinNote: '手肘高抬鎖骨架槓，軀幹直立' },
  { id: 'leg-press', name: '45度仰臥腿推機 (Leg Press)', category: '腿部', isCompound: true, pinNote: '背板貼平，下背不離椅，膝蓋不內扣' },
  { id: 'hack-squat', name: '哈克深蹲 (Hack Squat)', category: '腿部', isCompound: true, pinNote: '腳掌偏下方站位強調股四頭，臀貼靠板' },
  { id: 'rdl', name: '羅馬尼亞硬舉 (RDL)', category: '腿部', isCompound: true, pinNote: '髖關節後推，背部平直微屈膝感受膕旁拉扯' },
  { id: 'leg-extension', name: '坐姿腿屈伸 (Leg Extension)', category: '腿部', isCompound: false, pinNote: '椅背調整至膝關節對齊轉軸，頂峰收縮伸膝' },
  { id: 'leg-curl', name: '俯臥/坐姿腿彎舉 (Leg Curl)', category: '腿部', isCompound: false, pinNote: '腳踝卡墊貼實，骨盆不抬起，勾腿頂峰停頓' },
  { id: 'bulgarian-split-squat', name: '保加利亞分腿蹲 (Bulgarian Split)', category: '腿部', isCompound: false, pinNote: '後腳背搭凳，軀幹微前傾著重臀大肌' },
  { id: 'hip-thrust', name: '槓鈴臀推 (Barbell Hip Thrust)', category: '腿部', isCompound: true, pinNote: '肩胛骨下角抵椅邊，頂部髖關節完全展開夾臀' },
  { id: 'calf-raise', name: '站姿/坐姿提踵 (Calf Raise)', category: '腿部', isCompound: false, pinNote: '前腳掌踩板，底端充分拉伸小腿，頂端停頓' },

  // 背部
  { id: 'deadlift', name: '傳統硬舉 (Conventional Deadlift)', category: '背部', isCompound: true, pinNote: '槓鈴貼小腿脛骨起槓，鎖緊背闊肌伸髖直立' },
  { id: 'sumo-deadlift', name: '相撲硬舉 (Sumo Deadlift)', category: '背部', isCompound: true, pinNote: '寬站距腳尖朝外，軀幹立挺，蹬地展開雙膝' },
  { id: 'barbell-row', name: '俯身槓鈴划船 (Barbell Row)', category: '背部', isCompound: true, pinNote: '俯身約45度，背平核心緊，拉向肚臍下腹' },
  { id: 'lat-pulldown', name: '高位滑輪下拉 (Lat Pulldown)', category: '背部', isCompound: true, pinNote: '大腿擋板卡緊，胸口微挺，手肘引導向後下拉' },
  { id: 'pull-up', name: '引體向上 (Pull-Up)', category: '背部', isCompound: true, pinNote: '肩胛下沉帶動手肘向後下拉，下巴過槓' },
  { id: 'seated-cable-row', name: '坐姿滑輪划船 (Seated Cable Row)', category: '背部', isCompound: true, pinNote: '挺胸腰背挺直，拉至下腹夾緊肩胛骨' },
  { id: 't-bar-row', name: 'T槓划船 (T-Bar Row)', category: '背部', isCompound: true, pinNote: '核心繃緊抵禦剪力，手肘緊貼軀幹後拉' },
  { id: 'db-row', name: '單臂啞鈴划船 (One-Arm DB Row)', category: '背部', isCompound: false, pinNote: '支撐手推實平板凳，手肘朝骨盆斜後方拉起' },
  { id: 'face-pull', name: '繩索面拉 (Face Pull)', category: '背部', isCompound: false, pinNote: '繩索對準雙眼或眉毛高度拉開，肩胛外旋' },
  { id: 'straight-arm-pulldown', name: '直臂滑輪下壓 (Straight-Arm Pulldown)', category: '背部', isCompound: false, pinNote: '手肘微曲鎖定，背闊肌帶動手臂弧形壓向大腿' },

  // 肩部
  { id: 'ohp', name: '槓鈴站姿肩推 (Overhead Press)', category: '肩部', isCompound: true, pinNote: '收緊核心與臀部，起槓微避開下巴直上直下' },
  { id: 'db-shoulder-press', name: '坐姿啞鈴肩推 (DB Shoulder Press)', category: '肩部', isCompound: true, pinNote: '椅背約75~80度，下沉至耳旁水平推起' },
  { id: 'lateral-raise', name: '啞鈴側平舉 (DB Lateral Raise)', category: '肩部', isCompound: false, pinNote: '軀幹微前傾，手肘微彎引導抬起至水平' },
  { id: 'cable-lateral-raise', name: '繩索側平舉 (Cable Lateral Raise)', category: '肩部', isCompound: false, pinNote: '滑輪調至手腕高度，側身向斜上方拉出全程張力' },
  { id: 'reverse-pec-deck', name: '蝴蝶機反向飛鳥 (Reverse Pec Deck)', category: '肩部', isCompound: false, pinNote: '握把與肩同高，手臂微屈向兩側展開鍛鍊後三角' },
  { id: 'upright-row', name: '槓鈴/啞鈴直立划船 (Upright Row)', category: '肩部', isCompound: false, pinNote: '握距稍寬於肩，手肘引導提起至胸口高度' },
  { id: 'arnold-press', name: '阿諾肩推 (Arnold Press)', category: '肩部', isCompound: false, pinNote: '胸前掌心朝內起步，推起時旋轉掌心朝前' },

  // 手臂
  { id: 'bicep-curl', name: '啞鈴/槓鈴彎舉 (Bicep Curl)', category: '手臂', isCompound: false, pinNote: '手肘固定於身體兩側不晃動，頂端旋後充分收縮' },
  { id: 'hammer-curl', name: '啞鈴槌式彎舉 (Hammer Curl)', category: '手臂', isCompound: false, pinNote: '掌心相對垂直向上，強化肱橈肌與肱肌厚度' },
  { id: 'incline-curl', name: '上斜啞鈴彎舉 (Incline DB Curl)', category: '手臂', isCompound: false, pinNote: '椅背45~60度，手臂自然下垂拉長二頭肌長頭' },
  { id: 'tricep-pushdown', name: '滑輪三頭肌下壓 (Tricep Pushdown)', category: '手臂', isCompound: false, pinNote: '大臂夾緊軀幹，下壓到底完全伸直手肘鎖死' },
  { id: 'skull-crusher', name: '仰臥臂屈伸/碎顱者 (Skull Crusher)', category: '手臂', isCompound: false, pinNote: '大臂朝頭頂方向微傾15度，曲肘落向頭頂後方' },
  { id: 'overhead-tricep-extension', name: '繩索過頭臂屈伸 (Overhead Extension)', category: '手臂', isCompound: false, pinNote: '手肘朝前收攏，過頭伸展充分拉長三頭長頭' },

  // 核心
  { id: 'hanging-leg-raise', name: '懸垂舉腿 (Hanging Leg Raise)', category: '核心', isCompound: false, pinNote: '骨盆主動後傾帶動雙腿上捲，不靠慣性擺盪' },
  { id: 'ab-wheel', name: '健腹輪 (Ab Wheel Rollout)', category: '核心', isCompound: false, pinNote: '骨盆微後傾背部微圓，向前推出至張力極限後拉回' },
  { id: 'plank', name: '平板支撐 (Plank)', category: '核心', isCompound: false, pinNote: '手肘撐於肩正下方，收腹夾臀全身成一直線' }
];

// 動作示範與運動指南 (40+主流動作靜態知識庫字典)
const EXERCISE_GUIDES = {
  'bench-press': {
    name: '平板槓鈴臥推 (Bench Press)',
    primary: '胸大肌 (胸肌中束、整體厚度)',
    secondary: '前三角肌、肱三頭肌',
    setup: [
      '躺於臥推凳上，雙眼正對槓鈴正下方，背部自然反弓，肩胛骨向後向下收緊並牢靠貼實椅面。',
      '雙腳全腳掌踩實地面（足跟不可離地），雙手虎口鎖握槓鈴，握距約 1.5 倍肩寬（下放到底時前臂垂直地面）。',
      '深吸氣啟動核心與腹內壓，推起槓鈴移至肩膀正上方就緒。'
    ],
    execution: [
      '【離心下放】：吸氣控制槓鈴勻速（2~3秒）慢降至胸骨中下段（約乳頭連線處），手肘與軀幹呈約 45~75 度角，切勿外展90度。',
      '【觸胸轉換】：底部輕觸胸口或懸停 0.5 秒，胸肌維持緊繃張力，不利用胸骨彈震借力。',
      '【向心推起】：腳踩地面傳遞地面反作用力，胸肌全力向內收縮推起槓鈴，回到頂點手肘微屈不鎖死。'
    ],
    cues: [
      '常見代償：切忌聳肩或肩胛骨前突（會造成肩峰撞擊），過程中下背始終維持微弓，臀部緊貼椅面不可抬起。',
      '呼吸節奏：離心下放時深吸氣蓄積腹內壓，推過黏滯點（Sticking Point）後順勢吐氣。'
    ]
  },
  'incline-db-press': {
    name: '上斜啞鈴臥推 (Incline DB Press)',
    primary: '胸大肌上束 (鎖骨端胸肌)',
    secondary: '前三角肌、肱三頭肌',
    setup: [
      '將斜板角度調整為 30°~45°（角度過高容易轉移至肩膀前束），膝蓋頂起啞鈴順勢躺下。',
      '雙腳踩實地面，肩胛骨向後向下鎖死，挺胸微拱腰，手腕保持中立不後折。'
    ],
    execution: [
      '【離心下放】：勻速下沉啞鈴至胸肌外側高度，手肘內夾約 45°~60°，感受上胸深層拉伸。',
      '【向心推起】：上胸主動發力，推向鎖骨正上方，在頂點自然微靠攏，感受上胸強烈收縮。',
      '【頂點控制】：推至最高點停留 0.5 秒，手肘微屈不完全鎖死，保持胸肌張力。'
    ],
    cues: [
      '常見代償：避免斜板角度過陡（如60度）變成練肩膀，下放時不要讓啞鈴過度向外擺盪。',
      '呼吸節奏：啞鈴下放時深吸氣，推起發力時用力吐氣。'
    ]
  },
  'incline-barbell-press': {
    name: '上斜槓鈴臥推 (Incline BB Press)',
    primary: '胸大肌上束',
    secondary: '前三角肌、肱三頭肌',
    setup: [
      '斜椅設定 30 度，雙眼垂直槓鈴，握距略窄於平板臥推（約1.4倍肩寬），鎖定肩胛下沉。'
    ],
    execution: [
      '【離心下放】：下放槓鈴落點於鎖骨下方約 2~3 公分處，手肘指向兩側偏前方。',
      '【向心推起】：推起軌跡略朝面部上方弧度上升，頂點推至眼睛水平正上方。',
      '【張力維持】：下放速度保持 2 秒控制，避免砸胸反彈。'
    ],
    cues: [
      '常見代償：手腕過度後翻造成腕隧道壓迫，起槓前務必讓槓鈴重力線落在掌根上。',
      '呼吸節奏：離心慢吸氣，推起過半吐氣。'
    ]
  },
  'db-bench-press': {
    name: '啞鈴平板臥推 (Flat DB Press)',
    primary: '胸大肌 (整體胸肌、深層收縮)',
    secondary: '前三角肌、肱三頭肌',
    setup: [
      '坐在平板椅邊，將啞鈴立於大腿上方，順勢後躺並用大腿協助將啞鈴頂至胸前。',
      '肩胛骨收攏下沉，雙腳大步踩地，手腕與前臂始終保持垂直地面。'
    ],
    execution: [
      '【深層拉伸】：下放時啞鈴下沿接觸胸肌外側，比槓鈴擁有更大的活動度與拉伸感。',
      '【向心擠壓】：胸肌發力將大臂向內擠壓，啞鈴在頂部微聚攏但不相撞。',
      '【節奏】：離心 2 秒，頂峰停留 1 秒，充分感受胸肌中縫收緊。'
    ],
    cues: [
      '常見代償：啞鈴碰撞發出撞擊聲會瞬間喪失胸肌張力；手肘切勿直角外展90度。',
      '呼吸節奏：下放深吸氣挺胸，上推擠壓時緩慢吐氣。'
    ]
  },
  'dips': {
    name: '雙槓臂屈伸 (Dips)',
    primary: '胸大肌下束 (下胸輪廓)',
    secondary: '肱三頭肌、前三角肌',
    setup: [
      '雙手撐於雙槓上，雙臂伸直懸空支撐，軀幹前傾約 30 度，膝蓋微彎小腿交叉。'
    ],
    execution: [
      '【離心下沉】：屈肘下放身體，手肘向後向外約45度，軀幹始終維持前傾，下放至大臂平行地面。',
      '【向心撐起】：下胸與三頭同時發力將身體推回起點，推至頂點胸肌強力收縮。',
      '【活動度控制】：肩關節活動度受限者下放至大臂與地面平行即可，避免肩峰下擠壓。'
    ],
    cues: [
      '常見代償：身體過於垂直會將受力轉移到三頭肌；下沉過深可能造成前胸鎖骨韌帶與肩關節拉傷。',
      '呼吸節奏：下沉時吸氣，推起身體時吐氣。'
    ]
  },
  'cable-fly': {
    name: '滑輪夾胸 (Cable Fly)',
    primary: '胸大肌 (胸肌內側與頂峰孤立收縮)',
    secondary: '前三角肌',
    setup: [
      '將兩側滑輪調整至胸部或略高位置，雙手握把手向前邁出一步成弓箭步，背部挺直核心收緊。'
    ],
    execution: [
      '【展胸拉伸】：吸氣時雙手微屈如環抱大樹，手臂向兩側後方打開至胸肌充分拉伸。',
      '【內夾收縮】：呼氣時胸肌主動收縮，雙手沿弧線向胸前合攏，頂點雙手靠近停留 1 秒。',
      '【動作軌跡】：想像用左右上臂大臂向內碰在一起，而非用手掌去合攏。'
    ],
    cues: [
      '常見代償：手肘過度屈伸變成推胸；借用腰部擺動甩重量。',
      '呼吸節奏：展臂吸氣，合攏夾胸時長吐氣。'
    ]
  },
  'pec-deck': {
    name: '蝴蝶機夾胸 (Pec Deck Fly)',
    primary: '胸大肌內側與中束',
    secondary: '前三角肌',
    setup: [
      '調整座椅高度使握把中心落在乳頭至胸部中段水平線，後背與後腦勺貼緊靠背。'
    ],
    execution: [
      '【水平內收】：肩胛骨後收貼緊靠背，雙肘微屈固定角度，胸肌發力向前向內夾攏。',
      '【頂峰擠壓】：雙臂合攏時停頓 1 秒，用力擠壓胸肌中縫。',
      '【離心控制】：2~3秒均勻慢速還原至胸大肌拉伸位，配重片不完全相撞。'
    ],
    cues: [
      '常見代償：聳肩、胸口塌陷向前探頭；手肘角度隨動作變形。',
      '呼吸節奏：夾攏時吐氣，還原拉伸時吸氣。'
    ]
  },
  'push-up': {
    name: '伏地挺身 (Push-Up)',
    primary: '胸大肌、核心肌群',
    secondary: '前三角肌、肱三頭肌',
    setup: [
      '雙手略寬於肩撐地，指尖朝前微外展，雙腿向後蹬直，核心與臀肌夾緊成一直線。'
    ],
    execution: [
      '【離心慢放】：屈肘下沉軀幹，手肘內夾45度，下沉至胸口或鼻尖輕觸地面。',
      '【向心撐起】：雙手推實地面，胸肌發力推回頂點，肩胛骨在頂端自然展開。'
    ],
    cues: [
      '常見代償：骨盆塌陷塌腰（核心鬆懈）；手肘外展成90度Ｔ字形導致肩撞擊。',
      '呼吸節奏：下沉吸氣，撐起吐氣。'
    ]
  },
  'decline-press': {
    name: '下斜臥推 (Decline Press)',
    primary: '胸大肌下束 (下胸輪廓)',
    secondary: '肱三頭肌',
    setup: [
      '躺在下斜板上（約15~30度），腳踝牢牢勾住防護泡棉，握距同平板臥推。'
    ],
    execution: [
      '【軌跡控制】：槓鈴下放落點位於胸肌下緣（劍突附近），推起直上至胸上方。',
      '【安全回位】：回槓時需格外注意槓鈴掛鉤位置，避免力竭滑落。'
    ],
    cues: [
      '常見代償：倒衝血時間過長容易頭暈，組間請坐起深呼吸休息。',
      '呼吸節奏：下放吸氣，推起吐氣。'
    ]
  },

  // 腿部
  'squat': {
    name: '槓鈴頸後深蹲 (Back Squat)',
    primary: '股四頭肌、臀大肌',
    secondary: '內收肌、膕旁肌、豎脊肌、核心肌群',
    setup: [
      '槓鈴置於斜方肌上束（高槓）或肩胛骨脊上方（低槓），雙手牢固握槓，手肘向後收緊形成背部肌肉支架。',
      '雙腳站距與肩同寬或略寬，腳尖朝外 15°~30°，深吸一口氣進行腹式呼吸（瓦式呼吸 Valsalva Maneuver）鎖死核心。'
    ],
    execution: [
      '【下蹲階段】：髖關節與膝關節同時啟動，膝蓋朝腳尖方向推開，屁股向後向下坐，下蹲至髖關節折線低於膝關節上緣（全蹲或水平蹲）。',
      '【底端轉換】：底部不彈震借力，維持背部平直與核心腹內壓，骨盆不發生嚴重後傾（避免屁股眨眼 Butt Wink）。',
      '【向心起立】：全腳掌蹬地，臀大肌與大腿前側同時發力向上站起，站起過程中膝蓋保持朝外不內扣。'
    ],
    cues: [
      '常見代償：膝蓋內扣（X型腿）、重心移至腳尖（腳後跟浮起）、早安深蹲（屁股先起軀幹過度前傾）。',
      '呼吸節奏：下蹲前深吸一大口氣至腹部蓄壓屏住，蹲起通過黏滯點後用力吐氣。'
    ]
  },
  'front-squat': {
    name: '槓鈴頸前深蹲 (Front Squat)',
    primary: '股四頭肌 (孤立刺激強度高)',
    secondary: '核心肌群、上背部肌群',
    setup: [
      '將槓鈴架於三角肌前束上方，手肘高抬平行地面，大臂夾角保持水平。',
      '站距略窄於頸後深蹲，腳尖朝外，軀幹維持高度直立。'
    ],
    execution: [
      '【直立下蹲】：保持手肘抬高不垂落，屈髖屈膝直直向下坐，深蹲到底部。',
      '【向心驅動】：腳後跟踩實地面向上推起，胸口主動向上挺拔引導軀幹。'
    ],
    cues: [
      '常見代償：手肘垂落導致槓鈴前滑掉落；上背無力弓背駝圓。',
      '呼吸節奏：下蹲前瓦氏吸氣蓄壓，起立後吐氣。'
    ]
  },
  'leg-press': {
    name: '45度仰臥腿推機 (Leg Press)',
    primary: '股四頭肌、臀大肌',
    secondary: '內收肌、膕旁肌',
    setup: [
      '背部與骨盆牢靠貼實靠板，雙手緊握兩側握把將臀部壓死在椅墊上。',
      '雙腳置於踏板中段，與肩同寬，腳尖微朝外。'
    ],
    execution: [
      '【深沉屈膝】：釋放安全卡榫，屈膝勻速下放踏板，膝蓋朝腳尖外側打開，下放至大腿貼近胸部（但骨盆不可捲起懸空）。',
      '【推蹬向上】：腳掌全腳掌均勻蹬板，推至頂點膝蓋保持微屈（嚴禁膝蓋超伸完全鎖死）。'
    ],
    cues: [
      '常見代償：骨盆後捲下背懸空（會對腰椎造成極大剪力）；推到底時膝關節反折鎖死。',
      '呼吸節奏：踏板下放時吸氣，推起時用力吐氣。'
    ]
  },
  'hack-squat': {
    name: '哈克深蹲 (Hack Squat)',
    primary: '股四頭肌 (外側與股直肌強化)',
    secondary: '臀大肌',
    setup: [
      '背部完全貼牢儀器靠墊，雙肩頂住護墊，雙腳置於踏板中下位置，站距同肩寬。'
    ],
    execution: [
      '【深沉折疊】：下蹲時膝關節向前推移，背部沿滑軌軌跡向下滑行，蹲至大腿小腿呈90度或更深。',
      '【大腿主導】：股四頭肌持續繃緊發力推起滑軌，頂端手抓扶手控制節奏。'
    ],
    cues: [
      '常見代償：腳跟離板（腳底應全腳掌踩實）；推起時膝蓋顫抖內夾。',
      '呼吸節奏：下滑吸氣，推升吐氣。'
    ]
  },
  'rdl': {
    name: '羅馬尼亞硬舉 (RDL)',
    primary: '膕旁肌 (大腿後側)、臀大肌',
    secondary: '豎脊肌、核心肌群',
    setup: [
      '站姿起槓，手握槓鈴約與肩同寬，挺胸沈肩，雙膝微屈（保持微屈角度在整個動作中鎖定不變）。'
    ],
    execution: [
      '【主動後移髖部】：想像屁股後方有牆，屁股主動向後推，上半身沿髖關節鉸鏈（Hip Hinge）前傾。',
      '【貼脛下移】：槓鈴始終貼近大腿下行，至膝蓋下方感受大腿後側膕旁肌強烈緊繃拉伸。',
      '【伸髖收臀】：臀部用力向前推回直立站姿，在頂端夾緊臀大肌。'
    ],
    cues: [
      '常見代償：膝蓋主動彎曲過多變成深蹲；彎腰駝背下放槓鈴造成腰椎受傷。',
      '呼吸節奏：屈髖後移時吸氣，向前伸髖夾臀時吐氣。'
    ]
  },
  'leg-extension': {
    name: '坐姿腿屈伸 (Leg Extension)',
    primary: '股四頭肌 (單關節孤立刺激)',
    secondary: '無',
    setup: [
      '調整椅背使膝蓋旋轉軸線精確對齊機台轉軸，小腿護墊置於腳踝上方 2 公分處。'
    ],
    execution: [
      '【向上踢腿】：股四頭肌主動發力向上伸展雙腿，直至雙膝完全伸直。',
      '【頂峰擠壓】：在最高點停頓鎖緊 1 秒，感受股四頭肌燃燒。',
      '【離心慢放】：2~3秒勻速下放，配重塊不著地立即進行下一跳。'
    ],
    cues: [
      '常見代償：屁股浮離座位借力；利用爆發力快速甩起重量。',
      '呼吸節奏：踢腿伸直時吐氣，還原下放時吸氣。'
    ]
  },
  'leg-curl': {
    name: '俯臥/坐姿腿彎舉 (Leg Curl)',
    primary: '膕旁肌 (大腿後側)',
    secondary: '腓腸肌 (小腿)',
    setup: [
      '俯臥或坐於機台上，將護墊置於腳跟阿基里斯腱上方，骨盆貼緊椅墊，雙手抓緊握把。'
    ],
    execution: [
      '【收縮彎曲】：大腿後側發力將滾輪快速勾向臀部，頂端停留 1 秒。',
      '【離心控制】：吸氣慢速（2~3秒）還原至雙腿微屈位置，維持後側張力。'
    ],
    cues: [
      '常見代償：骨盆在勾腿時向上抬起（臀部懸空），造成腰椎代償代發力。',
      '呼吸節奏：勾腿用力時吐氣，緩慢下放時吸氣。'
    ]
  },
  'bulgarian-split-squat': {
    name: '保加利亞分腿蹲 (Bulgarian Split)',
    primary: '臀大肌、股四頭肌 (單腳穩定性訓練)',
    secondary: '內收肌、核心',
    setup: [
      '後腳腳背搭在後方臥推凳上，前腳向前邁出約 2~3 個腳掌長度，保持骨盆朝向正前方。'
    ],
    execution: [
      '【下蹲下沉】：軀幹微前傾約 15 度（側重臀大肌），垂直下沉至前腳大腿接近水平。',
      '【前腳驅動】：主要靠前腳腳掌踩實地面站起，後腳僅提供平衡支撐，不主動蹬地。'
    ],
    cues: [
      '常見代償：重心全落在後腳導致後腿髖屈肌拉扯過緊；骨盆向左右傾斜旋轉。',
      '呼吸節奏：下蹲吸氣，站起推回時吐氣。'
    ]
  },
  'hip-thrust': {
    name: '槓鈴臀推 (Barbell Hip Thrust)',
    primary: '臀大肌 (最大力量輸出)',
    secondary: '膕旁肌、股四頭肌',
    setup: [
      '背部靠在臥推凳邊緣（肩胛骨下角），槓鈴置於髖關節折線處（務必使用厚海綿護墊），雙腳踩地。'
    ],
    execution: [
      '【伸髖頂起】：足跟發力踩地，臀大肌全力收縮將髖關節完全頂開，大腿與軀幹呈水平一條線。',
      '【頂峰停頓】：頂端停留 1~2 秒，下巴微收雙眼直視前方（不後仰頭頸部）。',
      '【下沉復位】：緩慢下沉髖部至離地約 15 公分處，隨即再次頂起。'
    ],
    cues: [
      '常見代償：過度頂起導致腰椎反弓超伸（下背代償疼痛）；腳跟離地變成大腿前側發力。',
      '呼吸節奏：下沉時吸氣，頂峰伸髖時用力吐氣。'
    ]
  },
  'calf-raise': {
    name: '站姿/坐姿提踵 (Calf Raise)',
    primary: '腓腸肌 (站姿側重)、比目魚肌 (坐姿側重)',
    secondary: '腳底足底筋膜',
    setup: [
      '前腳掌 1/3 踏在墊木或腳踏板邊緣，腳後跟完全懸空，身體維持直立。'
    ],
    execution: [
      '【深度下沉】：腳後跟深沈至踏板下方，感受小腿肌腱完全被拉伸。',
      '【向心提踵】：大腳趾球主動蹬地提起腳後跟至最高點，頂點保持 1 秒。'
    ],
    cues: [
      '常見代償：膝蓋微彎借力彈跳，提踵幅度過小未達全行程。',
      '呼吸節奏：蹬起時吐氣，下放拉伸時吸氣。'
    ]
  },

  // 背部
  'deadlift': {
    name: '傳統硬舉 (Conventional Deadlift)',
    primary: '豎脊肌、臀大肌、膕旁肌 (後側鏈之王)',
    secondary: '背闊肌、斜方肌、前臂握力、全身核心',
    setup: [
      '雙腳站距與髖同寬，槓鈴中線對準足弓中央（距脛骨約 2.5 公分）。',
      '屈髖俯身握槓，握距剛好在大腿兩側外緣，手臂垂直向下如掛鉤。',
      '屈膝使脛骨輕觸槓鈴，挺胸沉肩，用力將肩胛骨向後向下鎖死（保護脊柱）。'
    ],
    execution: [
      '【起槓推地】：腳掌全腳掌像要把地面踩穿一樣用力蹬地，槓鈴緊貼小腿上升。',
      '【膝髖協同】：槓鈴過膝後，臀部強力向前推進（鎖定伸髖），站直身體與脊椎成一直線。',
      '【下放軌跡】：沿原路徑屈髖先將臀部向後推，槓鈴過膝後再屈膝下放至地面。'
    ],
    cues: [
      '常見代償：起槓時腰部駝圓（脊椎剪力爆表）；過度後仰腰椎鎖定；槓鈴離身體太遠。',
      '呼吸節奏：拉起前深吸氣並腹內壓屏氣，拉起完全站直後或下放觸地時吐氣。'
    ]
  },
  'sumo-deadlift': {
    name: '相撲硬舉 (Sumo Deadlift)',
    primary: '臀大肌、大腿內收肌群',
    secondary: '股四頭肌、豎脊肌、背闊肌',
    setup: [
      '寬站距，雙腳盡量靠近槓鈴片，腳尖朝外 45°~60°，雙手握距窄於雙腿內側。',
      '軀幹較傳統硬舉更為垂直，髖關節充分打開外旋。'
    ],
    execution: [
      '【下沉撐髖】：向下坐並向外撐開膝蓋，收緊背闊肌拉緊槓鈴（去除槓鈴多餘空隙 slack）。',
      '【蹬地展膝】：全腳掌垂直向外向斜下方踩穿地面，膝關節與髖關節同時伸展鎖死。'
    ],
    cues: [
      '常見代償：起槓時屁股先向上飄；膝蓋在起拉時向內塌陷。',
      '呼吸節奏：起拉前蓄滿腹內壓，鎖死後吐氣。'
    ]
  },
  'barbell-row': {
    name: '俯身槓鈴划船 (Barbell Row)',
    primary: '背闊肌、中下斜方肌、菱形肌',
    secondary: '三角肌後束、肱二頭肌、豎脊肌',
    setup: [
      '雙腳與肩同寬，屈髖俯身約 45 度（背部保持平直不駝背），雙膝微彎穩定下盤。',
      '正握或反握槓鈴，握距略寬於肩，雙臂自然下垂。'
    ],
    execution: [
      '【肘部引導】：背肌發力，手肘沿著身體兩側緊貼向後上方拉起，槓鈴軌跡拉向肚臍或下腹部。',
      '【肩胛夾緊】：頂點用力將兩側肩胛骨向中央夾攏，停留 0.5 秒。',
      '【離心下放】：吸氣控制槓鈴慢速下降，背闊肌維持緊繃張力直到手臂伸直。'
    ],
    cues: [
      '常見代償：利用軀幹上下甩動借力（腰椎受傷主因）；聳肩將受力轉移到上斜方肌。',
      '呼吸節奏：拉起發力時吐氣，下放槓鈴時吸氣。'
    ]
  },
  'lat-pulldown': {
    name: '高位滑輪下拉 (Lat Pulldown)',
    primary: '背闊肌 (增加背部寬度)',
    secondary: '大圓肌、菱形肌、肱二頭肌',
    setup: [
      '大腿護墊調整至緊緊卡牢雙腿，雙手握寬握把折彎處外側，胸部挺拔，軀幹微後傾 10~15 度。'
    ],
    execution: [
      '【肩胛先行】：下拉前先做肩胛骨下沉（Depression），啟動背闊肌下部。',
      '【肘向下拉】：想像手肘像向下插進褲子後口袋一樣向下拉，握把拉至鎖骨或上胸高度。',
      '【頂峰擠壓】：在胸前停頓 1 秒，肩胛骨完全收縮夾緊。',
      '【勻速放回】：2~3秒控制還原，手臂伸直但肩胛骨不完全脫臼放鬆。'
    ],
    cues: [
      '常見代償：後仰幅度過大（變成仰臥划船）；用手腕向前扣借力。',
      '呼吸節奏：下拉時挺胸吐氣，還原上升時吸氣。'
    ]
  },
  'pull-up': {
    name: '引體向上 (Pull-Up)',
    primary: '背闊肌、大圓肌 (自重黃金訓練)',
    secondary: '肱二頭肌、肱肌、核心肌群',
    setup: [
      '雙手正握單槓，握距約 1.5 倍肩寬，身體完全懸掛，腹肌微收避免身體擺盪。'
    ],
    execution: [
      '【肩胛下壓】：先主動下沉肩胛骨，帶動手肘向身體兩側後下方猛烈拉動。',
      '【胸口迎槓】：身體向斜上方拉起，直至下巴過槓或上胸貼近單槓。',
      '【離心下沉】：均勻控制下放身體至手臂幾乎完全伸直，避免重重落下震傷肩關節。'
    ],
    cues: [
      '常見代償：雙腿屈膝踢蹬借力（甩腿）；弓背縮脖子去勾單槓。',
      '呼吸節奏：拉起身體時用力吐氣，下放時吸氣。'
    ]
  },
  'seated-cable-row': {
    name: '坐姿滑輪划船 (Seated Cable Row)',
    primary: '背闊肌厚度、菱形肌、中斜方肌',
    secondary: '肱二頭肌、三角肌後束',
    setup: [
      '雙腳踩緊腳踏板，雙膝微彎，握住 V 型手把，軀幹保持垂直於地面。'
    ],
    execution: [
      '【後拉夾背】：挺胸肩胛後縮，手肘貼緊軀幹拉向肚臍，頂點用力夾背 1 秒。',
      '【離心延伸】：手臂向前伸展送出，肩胛骨向前滑動充分拉長背部，但腰背不大幅彎曲。'
    ],
    cues: [
      '常見代償：身體過度前後搖擺借力，拉動時聳肩。',
      '呼吸節奏：後拉時吐氣，前送時吸氣。'
    ]
  },
  't-bar-row': {
    name: 'T槓划船 (T-Bar Row)',
    primary: '背部中縫厚度、菱形肌、背闊肌',
    secondary: '三角肌後束、豎脊肌',
    setup: [
      '雙腳跨立於 T 槓兩側，膝蓋微彎，髖後推屈身約 45 度，背平雙手扣緊把手。'
    ],
    execution: [
      '【爆發拉起】：腹部緊繃，手肘引導將 T 槓拉向胸腹交界處，肩胛骨劇烈合攏。',
      '【離心慢放】：下落保持 2 秒控制，感受背肌厚度被拉開。'
    ],
    cues: [
      '常見代償：重量過重導致腰部過度反曲或駝背；動作幅度縮短成微幅抖動。',
      '呼吸節奏：拉起吐氣，下沉吸氣。'
    ]
  },
  'db-row': {
    name: '單臂啞鈴划船 (One-Arm DB Row)',
    primary: '背闊肌單側孤立發展',
    secondary: '菱形肌、肱二頭肌',
    setup: [
      '一側膝蓋與手掌支撐於平板凳上，另一腳踩地支撐，軀幹與地面近乎平行。'
    ],
    execution: [
      '【弧形拉起】：手持啞鈴自然下垂，手肘朝著骨盆臀部方向呈弧形向後拉起。',
      '【頂點收縮】：大臂拉至略高於軀幹水平，背闊肌下束完全擠壓。'
    ],
    cues: [
      '常見代償：軀幹大幅旋轉（靠腰部扭轉借力）；手腕彎曲過度使用前臂。',
      '呼吸節奏：拉至頂點吐氣，下放時吸氣。'
    ]
  },
  'face-pull': {
    name: '繩索面拉 (Face Pull)',
    primary: '三角肌後束、菱形肌、外旋肌群 (肩關節保健神器)',
    secondary: '中下斜方肌',
    setup: [
      '將滑輪調至頭部或眼睛高度，使用雙頭繩索，拇指朝向自己或反握手柄。'
    ],
    execution: [
      '【外旋拉開】：手肘抬高向外拉開繩索，雙手分開拉向雙眼兩側或太陽穴。',
      '【外旋鎖定】：頂點做肩外旋動作（拳頭向後上方翻轉），夾緊後肩與上背 1 秒。'
    ],
    cues: [
      '常見代償：手肘低於手腕（變成二頭肌彎舉）；身體後仰借力。',
      '呼吸節奏：後拉時吐氣，前送時吸氣。'
    ]
  },
  'straight-arm-pulldown': {
    name: '直臂滑輪下壓 (Straight-Arm Pulldown)',
    primary: '背闊肌孤立長度伸展',
    secondary: '大圓肌、胸小肌、肱三頭肌長頭',
    setup: [
      '面對滑輪退後一步，雙手握直槓或繩索，手臂微屈鎖定關節角度，軀幹前傾約 30 度。'
    ],
    execution: [
      '【弧形下壓】：手肘固定微屈不變，背闊肌全力下壓手臂，沿大弧線下壓至大腿前側。',
      '【頂端挺胸】：下壓到底時挺胸收緊肩胛，感受背闊肌下緣強力收縮。'
    ],
    cues: [
      '常見代償：手肘彎曲伸展變成三頭下壓；核心鬆弛造成腰椎擺動。',
      '呼吸節奏：下壓時吐氣，回升時吸氣。'
    ]
  },

  // 肩部
  'ohp': {
    name: '槓鈴站姿肩推 (Overhead Press)',
    primary: '前三角肌、中三角肌',
    secondary: '肱三頭肌、斜方肌、核心肌群',
    setup: [
      '槓鈴架於胸骨上端鎖骨處，雙手握距略寬於肩，小臂垂直地面。',
      '雙腳與肩同寬踩實地面，核心繃緊，臀大肌夾死，維持軀幹如鋼板般堅固。'
    ],
    execution: [
      '【垂直推起】：頭部微向後仰避開槓鈴軌跡，三角肌主動發力垂直向上推起槓鈴。',
      '【頭部穿過】：槓鈴過頭頂後，頭部自然向前回到中立位，槓鈴鎖定在耳朵正上方。',
      '【頂點支撐】：手臂伸直，斜方肌主動上提聳起包覆肩關節，穩定 0.5 秒。'
    ],
    cues: [
      '常見代償：下背過度反弓塌腰（極易傷腰）；手肘向後滑落導致肩部剪力增加。',
      '呼吸節奏：推起前深吸氣蓄壓，推至頂點鎖定後吐氣。'
    ]
  },
  'db-shoulder-press': {
    name: '坐姿啞鈴肩推 (DB Shoulder Press)',
    primary: '前三角肌、中三角肌',
    secondary: '肱三頭肌',
    setup: [
      '椅背微傾斜 75°~80°（避免完全 90° 直角造成肩峰壓迫），雙手用膝蓋頂起啞鈴至肩膀兩側。'
    ],
    execution: [
      '【推舉上升】：手肘朝兩側略偏前方（約肩胛骨平面 30 度），向上推起啞鈴至頭頂。',
      '【離心下沉】：慢速 2 秒下沉啞鈴至耳旁水平，維持肩膀持續張力。'
    ],
    cues: [
      '常見代償：手肘完全打開 180 度大字型推舉（易導致肩夾擠）；啞鈴頂部猛烈碰撞。',
      '呼吸節奏：推起時吐氣，下落時吸氣。'
    ]
  },
  'lateral-raise': {
    name: '啞鈴側平舉 (DB Lateral Raise)',
    primary: '中三角肌 (打造倒三角寬肩膀核心動作)',
    secondary: '前三角肌、上斜方肌',
    setup: [
      '雙手持啞鈴於身體兩側或大腿前方，雙腳與肩同寬，軀幹微前傾約 10~15 度。'
    ],
    execution: [
      '【手肘引導】：手肘微屈約 15 度並在整個過程中鎖定，手肘引導啞鈴向兩側斜前方抬起（肩胛骨平面）。',
      '【抬至水平】：抬至手肘與肩膀同高水平線即可，小拇指微向上旋轉（如倒水）。',
      '【離心慢放】：2~3秒控制緩慢下放，在啞鈴觸碰大腿前立刻再度抬起。'
    ],
    cues: [
      '常見代償：聳肩借力（上斜方肌代償變酸）；利用雙腿屈伸彈跳甩重量。',
      '呼吸節奏：向兩側抬起時吐氣，下放慢控時吸氣。'
    ]
  },
  'cable-lateral-raise': {
    name: '繩索側平舉 (Cable Lateral Raise)',
    primary: '中三角肌 (全程等張力刺激)',
    secondary: '前三角肌',
    setup: [
      '滑輪調整至手腕或腳踝高度，側對滑輪機，單手握把手，身體微向外傾斜。'
    ],
    execution: [
      '【外展發力】：中三角肌發力向斜外側上方拉出把手至肩膀水平高度。',
      '【全程張力】：頂峰停頓 1 秒，下放時滑輪拉力持續對肌肉施加恆定阻力。'
    ],
    cues: [
      '常見代償：軀幹向後仰甩動借力；手腕高於手肘。',
      '呼吸節奏：抬起時吐氣，還原時吸氣。'
    ]
  },
  'reverse-pec-deck': {
    name: '蝴蝶機反向飛鳥 (Reverse Pec Deck)',
    primary: '三角肌後束 (立體肩部關鍵)',
    secondary: '菱形肌、中下斜方肌',
    setup: [
      '胸口貼緊靠板，座椅調至握把高度對齊肩膀水平線，雙手掌心相對或朝下。'
    ],
    execution: [
      '【水平外展】：手肘微屈鎖定，三角肌後束發力將把手向兩側後方拉開。',
      '【後束擠壓】：拉至大臂與軀幹平行即可，避免過度後縮肩胛骨導致背肌搶走張力。'
    ],
    cues: [
      '常見代償：聳肩；後背菱形肌主動過度夾緊使後肩失去孤立張力。',
      '呼吸節奏：向後展開時吐氣，向前還原時吸氣。'
    ]
  },
  'upright-row': {
    name: '槓鈴/啞鈴直立划船 (Upright Row)',
    primary: '中三角肌、斜方肌',
    secondary: '前三角肌、肱二頭肌',
    setup: [
      '握距略寬於肩（窄握易傷肩），槓鈴貼近身體前方，沉肩鎖背。'
    ],
    execution: [
      '【手肘引導提拉】：手肘引導向上提拉，拉至胸口高度（手肘略高於前臂）。',
      '【下放延伸】：控制節奏慢下放至手臂自然伸直。'
    ],
    cues: [
      '常見代償：握距太窄且拉得過高（高於胸骨）易引發肩夾擠綜合症。',
      '呼吸節奏：向上提拉時吐氣，下放時吸氣。'
    ]
  },
  'arnold-press': {
    name: '阿諾肩推 (Arnold Press)',
    primary: '前三角肌、中三角肌 (全角度旋轉刺激)',
    secondary: '肱三頭肌',
    setup: [
      '坐姿手持啞鈴於胸前，掌心朝向自己，手肘緊貼軀幹。'
    ],
    execution: [
      '【邊旋邊推】：向上推起的同時向外旋轉大臂，推至頂點時掌心朝前。',
      '【旋轉還原】：下放時沿原路徑旋轉收回胸前掌心朝內。'
    ],
    cues: [
      '常見代償：重量過大造成手腕失衡扭傷。',
      '呼吸節奏：旋轉推起吐氣，還原吸氣。'
    ]
  },

  // 手臂
  'bicep-curl': {
    name: '啞鈴/槓鈴彎舉 (Bicep Curl)',
    primary: '肱二頭肌 (長頭與短頭)',
    secondary: '肱肌、前臂屈肌群',
    setup: [
      '站姿雙腳與肩同寬，手持槓鈴或啞鈴垂於大腿前，手肘緊貼身體兩側，沉肩鎖定。'
    ],
    execution: [
      '【向上彎屈】：手肘為軸心，二頭肌主動發力向上彎舉重量，頂端掌心向上旋後。',
      '【頂峰擠壓】：在最高點強力擠壓二頭肌 1 秒，但手肘不上抬借力。',
      '【離心慢放】：2~3秒控制緩慢放至手臂自然下垂。'
    ],
    cues: [
      '常見代償：身體前後甩動借力（腰椎代償）；手肘向前大幅移動（前三角肌代償搶力）。',
      '呼吸節奏：向上彎舉時吐氣，離心慢放時吸氣。'
    ]
  },
  'hammer-curl': {
    name: '啞鈴槌式彎舉 (Hammer Curl)',
    primary: '肱橈肌、肱肌 (增加上臂厚度與前臂粗壯度)',
    secondary: '肱二頭肌長頭',
    setup: [
      '雙手掌心相對（中立握姿），手持啞鈴垂於兩側，腰背平直。'
    ],
    execution: [
      '【垂直上提】：大臂固定，掌心相對保持不變向上彎起啞鈴至胸前水平。',
      '【頂端頂峰】：收縮 1 秒後勻速下放。'
    ],
    cues: [
      '常見代償：手腕下垂無力；手肘向兩側外展。',
      '呼吸節奏：彎起吐氣，下放吸氣。'
    ]
  },
  'incline-curl': {
    name: '上斜啞鈴彎舉 (Incline DB Curl)',
    primary: '肱二頭肌長頭 (打造飽滿肌峰)',
    secondary: '肱肌',
    setup: [
      '躺在 45°~60° 斜椅上，雙臂自然垂直向下懸垂，讓長頭處於被動拉伸狀態。'
    ],
    execution: [
      '【孤立彎舉】：大臂固定垂直地面不動，二頭肌長頭強烈收縮向上彎起啞鈴。',
      '【充分拉長】：還原時下放至手臂完全伸展拉長。'
    ],
    cues: [
      '常見代償：肩膀向前送出借力；頭部離開椅背。',
      '呼吸節奏：彎舉時吐氣，下沉拉伸時吸氣。'
    ]
  },
  'tricep-pushdown': {
    name: '滑輪三頭肌下壓 (Tricep Pushdown)',
    primary: '肱三頭肌 (外側頭、內側頭)',
    secondary: '肱三頭肌長頭',
    setup: [
      '雙手握直槓、V槓或繩索，大臂緊緊夾在身體兩側肋骨旁，軀幹微前傾。'
    ],
    execution: [
      '【下壓鎖死】：大臂完全固定不動，三頭肌發力伸展小臂向下壓直。',
      '【頂峰擠壓】：在最底端將手臂完全伸直，三頭肌強烈收縮鎖死 1 秒（繩索可向兩側分開）。',
      '【回放控制】：小臂勻速抬至略高於水平位置（約90度），大臂不晃動。'
    ],
    cues: [
      '常見代償：用體重向下壓（俯身壓槓）；大臂前後擺動如划船借力。',
      '呼吸節奏：下壓伸直時吐氣，回放彎曲時吸氣。'
    ]
  },
  'skull-crusher': {
    name: '仰臥臂屈伸/碎顱者 (Skull Crusher)',
    primary: '肱三頭肌長頭與中束',
    secondary: '肘肌',
    setup: [
      '平躺於臥推凳上，雙手窄握曲槓或啞鈴，大臂朝向頭頂微傾斜 15 度（維持長頭持續張力）。'
    ],
    execution: [
      '【屈肘下落】：保持大臂傾斜角不動，屈曲手肘將槓鈴慢速降至頭頂後方或額頭上方。',
      '【伸肘推起】：三頭肌集中發力將手臂伸展推回起始位置。'
    ],
    cues: [
      '常見代償：手肘向兩側大幅外外展（應盡量向內夾）；槓鈴直接降在額頭上增加受傷風險。',
      '呼吸節奏：屈肘下放時吸氣，推起伸直時吐氣。'
    ]
  },
  'overhead-tricep-extension': {
    name: '繩索過頭臂屈伸 (Overhead Extension)',
    primary: '肱三頭肌長頭 (最深層拉伸)',
    secondary: '外側頭',
    setup: [
      '背對滑輪機，將繩索拉至頭後方，手肘朝前收攏，上臂貼近雙耳兩側。'
    ],
    execution: [
      '【過頭伸展】：三頭肌長頭收縮帶動小臂向前上方伸直展開繩索。',
      '【深層拉回】：慢速還原至頭後方，感受長頭如皮筋般被充分拉長。'
    ],
    cues: [
      '常見代償：腰部過度反弓塌腰；手肘向兩側外散。',
      '呼吸節奏：向前伸展時吐氣，拉回時吸氣。'
    ]
  },

  // 核心
  'hanging-leg-raise': {
    name: '懸垂舉腿 (Hanging Leg Raise)',
    primary: '腹直肌下部、髂腰肌',
    secondary: '前臂握力、腹斜肌',
    setup: [
      '雙手懸掛在單槓上，身體自然放直，骨盆微後傾收緊核心。'
    ],
    execution: [
      '【骨盆捲起】：主動捲動骨盆向上翻，將雙腿（或屈膝）舉至大腿高於水平線。',
      '【頂點收腹】：在頂點停頓 1 秒，腹部緊緊收縮。',
      '【離心慢放】：緩慢放低雙腿，避免利用回彈慣性擺動。'
    ],
    cues: [
      '常見代償：純粹甩腿而骨盆未捲動（僅練到髖屈肌而非腹肌）。',
      '呼吸節奏：舉腿時呼氣，下放時吸氣。'
    ]
  },
  'ab-wheel': {
    name: '健腹輪 (Ab Wheel Rollout)',
    primary: '腹直肌整體、腹橫肌 (深層核心力量)',
    secondary: '背闊肌、胸肌',
    setup: [
      '雙膝跪地，雙手握緊滾輪握把，骨盆後傾微收下巴，背部維持微拱貓背姿勢。'
    ],
    execution: [
      '【向前推出】：核心抗伸展發力，向前緩慢推動滾輪至張力極限位置。',
      '【腹肌拉回】：腹肌強力收縮發力，帶動滾輪拉回起始位置。'
    ],
    cues: [
      '常見代償：向前推時塌腰骨盆前傾（會給腰椎帶來極大剪力傷害）。',
      '呼吸節奏：推出時吸氣收緊腹內壓，拉回時用力吐氣。'
    ]
  },
  'plank': {
    name: '平板支撐 (Plank)',
    primary: '腹橫肌、腹直肌、全身深層抗伸展核心',
    secondary: '臀大肌、肩胛穩定肌群',
    setup: [
      '手肘撐地於肩膀正下方，雙腳與髖同寬，頭部、脊椎、臀部成一直線。'
    ],
    execution: [
      '【主動張力】：手肘與腳尖主動向中間收攏對抗地面，臀大肌夾緊，骨盆維持微後傾。'
    ],
    cues: [
      '常見代償：塌腰撅屁股；低頭或過度仰頭破壞頸椎中立。',
      '呼吸節奏：維持核心緊繃的同時進行淺長均勻腹式呼吸。'
    ]
  }
};

// 兜底通用指南產生器 (Fallback: 確保任意自訂動作皆有專業指導)
function getExerciseGuide(exerciseId, exerciseName, category = '胸部') {
  if (EXERCISE_GUIDES[exerciseId]) {
    return EXERCISE_GUIDES[exerciseId];
  }

  // 嘗試動作名稱模糊匹配
  for (const [key, guide] of Object.entries(EXERCISE_GUIDES)) {
    if (exerciseName && (exerciseName.includes(guide.name.split(' ')[0]) || guide.name.includes(exerciseName))) {
      return guide;
    }
  }

  // 根據肌群產生專業通用指南
  const muscleDefaults = {
    '胸部': {
      primary: '胸大肌 (依角度包含上束、中束或下束)',
      secondary: '前三角肌、肱三頭肌',
      setup: [
        '調整器械或臥推椅至穩定位置，沉肩收核心，肩胛骨向後向下鎖死貼牢支撐面。',
        '手腕保持中立挺直，虎口握實握把或槓鈴，手肘內夾約 45°~70°（切忌90°垂直外展）。'
      ],
      execution: [
        '【離心下放】：吸氣控制 2~3 秒勻速下降，感受胸大肌纖維被充分拉伸，配重不猛烈碰撞。',
        '【向心推起】：胸部主動發力向內收攏推動重量，頂峰收縮停留 1 秒，手肘微屈不完全鎖死。'
      ],
      cues: [
        '關鍵代償：切忌聳肩或探頭代償；推起時肩胛骨勿脫離靠墊。',
        '呼吸原則：離心下放時吸氣，向心推擠用力時均勻吐氣。'
      ]
    },
    '背部': {
      primary: '背闊肌、斜方肌、菱形肌',
      secondary: '肱二頭肌、三角肌後束、豎脊肌',
      setup: [
        '調整座椅或站位，保持脊柱中立，雙腳穩固支撐，胸口微挺引導核心收緊。',
        '先以手肘引導方向，起步前先啟動肩胛骨向後向下收縮（肩胛骨先行原則）。'
      ],
      execution: [
        '【向心拉動】：背肌主導發力，以手肘為引導向後下方拉動，頂點兩側肩胛骨劇烈夾攏 1 秒。',
        '【離心延伸】：2~3秒控制勻速送回重量，感受背闊肌被充分拉長延伸，但腰椎維持平直。'
      ],
      cues: [
        '關鍵代償：切勿利用軀幹甩動借力；手腕避免向前彎扣。',
        '呼吸原則：向後拉起時挺胸吐氣，向前送出時深吸氣。'
      ]
    },
    '腿部': {
      primary: '股四頭肌、臀大肌、大腿後側膕旁肌',
      secondary: '內收肌群、小腿肌群、核心肌群',
      setup: [
        '確認雙腳踩實地面或踏板，足跟始終不可懸空，膝蓋對準腳尖朝向（微外展）。',
        '吸氣鼓起腹部啟動腹內壓，下背緊貼靠板或維持脊椎自然生理弧度。'
      ],
      execution: [
        '【下蹲/彎曲】：屈髖屈膝平穩下沉，保持膝關節朝腳尖方向推開不內扣，下蹲至大腿與地面或踏板平行。',
        '【推起/蹬伸】：全腳掌均勻蹬地發力站起或推動，頂點膝關節維持微屈，嚴禁膝關節反折鎖死！'
      ],
      cues: [
        '關鍵代償：膝蓋內扣（X腿代償）；骨盆過度後捲導致腰椎代償。',
        '呼吸原則：下沉時深吸蓄積腹內壓，推升過黏滯點後順勢吐氣。'
      ]
    },
    '肩部': {
      primary: '三角肌 (前束、中束、後束)',
      secondary: '上斜方肌、肱三頭肌',
      setup: [
        '站姿或坐姿保持腰背挺拔，核心收緊，避免下背過度反弓塌腰。',
        '手肘微屈約 15°，在肩胛骨平面（前傾約 15°~30°）進行動作，避免純冠狀面外展壓迫肩峰。'
      ],
      execution: [
        '【向心發力】：三角肌主動發力帶動手肘抬起或推舉，動作頂點維持 1 秒頂峰收縮。',
        '【離心慢控】：勻速 2 秒下放，肌肉保持持續張力，不在底端完全放鬆。'
      ],
      cues: [
        '關鍵代償：聳肩使上斜方肌代償變酸；利用軀幹後仰甩動。',
        '呼吸原則：發力抬起時吐氣，下放控制時吸氣。'
      ]
    },
    '手臂': {
      primary: '肱二頭肌 / 肱三頭肌',
      secondary: '前臂肌群',
      setup: [
        '大臂始終緊貼軀幹或固定在托板上，手肘作為唯一旋轉軸心，避免大臂前後晃動。',
        '手腕維持中立剛硬，不前後甩腕。'
      ],
      execution: [
        '【向心收縮】：目標手臂肌群主動發力完成關節屈伸，頂峰極度擠壓 1 秒。',
        '【離心還原】：2~3秒勻速下放還原至微屈位，保持張力不消失。'
      ],
      cues: [
        '關鍵代償：身體前後擺動借力；大臂離開固定點搶力。',
        '呼吸原則：用力收縮時吐氣，緩慢還原時吸氣。'
      ]
    },
    '核心': {
      primary: '腹直肌、腹橫肌、腹斜肌',
      secondary: '豎脊肌、髖屈肌群',
      setup: [
        '骨盆主動維持微後傾，收緊肚臍向脊椎方向貼靠，避免腰部懸空。'
      ],
      execution: [
        '【腹肌捲動】：以腹部收縮帶動骨盆或胸骨捲動，頂點停留 1 秒強力擠壓。',
        '【離心抗伸展】：慢速控制還原，核心始終維持腹內壓緊繃。'
      ],
      cues: [
        '關鍵代償：脖子過度發力酸痛（應收下巴）；塌腰代償。',
        '呼吸原則：腹肌用力捲縮時徹底吐氣，還原時均勻吸氣。'
      ]
    }
  };

  const matched = muscleDefaults[category] || muscleDefaults['胸部'];
  return {
    name: exerciseName || '自訂動作',
    primary: matched.primary,
    secondary: matched.secondary,
    setup: matched.setup,
    execution: matched.execution,
    cues: matched.cues
  };
}

// ======================= 2. Form Check 影片與要訣資料庫 (IndexedDB) =======================
const DB_NAME = 'ironlog_videos_db';
const DB_VERSION = 1;
const STORE_NAME = 'exercise_media';

class FormCheckDB {
  constructor() {
    this.db = null;
    this.initPromise = null;
    this.boundVideoIds = new Set();
  }

  async init() {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve) => {
      if (!window.indexedDB) {
        console.warn('IndexedDB not supported');
        resolve(null);
        return;
      }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'exerciseId' });
        }
      };
      req.onsuccess = (e) => {
        this.db = e.target.result;
        this.refreshCache().then(() => resolve(this.db));
      };
      req.onerror = (e) => {
        console.warn('IndexedDB open error:', e);
        resolve(null);
      };
    });

    return this.initPromise;
  }

  async refreshCache() {
    if (!this.db) return;
    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => {
          this.boundVideoIds.clear();
          (req.result || []).forEach(item => {
            if (item && (item.blob || (item.url && item.url.trim()))) {
              this.boundVideoIds.add(item.exerciseId);
            }
          });
          resolve();
        };
        req.onerror = () => resolve();
      } catch (e) {
        resolve();
      }
    });
  }

  hasVideo(exerciseId) {
    return this.boundVideoIds.has(exerciseId);
  }

  async get(exerciseId) {
    await this.init();
    if (!this.db) return null;
    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(exerciseId);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      } catch (e) {
        resolve(null);
      }
    });
  }

  async set(exerciseId, data) {
    await this.init();
    if (!this.db) return;
    return new Promise((resolve, reject) => {
      try {
        const tx = this.db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const record = { exerciseId, ...data, updatedAt: Date.now() };
        const req = store.put(record);
        req.onsuccess = () => {
          if (data.blob || (data.url && data.url.trim())) {
            this.boundVideoIds.add(exerciseId);
          } else {
            this.boundVideoIds.delete(exerciseId);
          }
          resolve();
        };
        req.onerror = (e) => reject(e);
      } catch (e) {
        reject(e);
      }
    });
  }

  async removeVideo(exerciseId) {
    const existing = await this.get(exerciseId) || { exerciseId };
    existing.blob = null;
    existing.url = '';
    await this.set(exerciseId, existing);
    this.boundVideoIds.delete(exerciseId);
  }

  async clearAll() {
    await this.init();
    if (!this.db) return;
    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.clear();
        req.onsuccess = () => {
          this.boundVideoIds.clear();
          resolve();
        };
        req.onerror = () => resolve();
      } catch (e) {
        resolve();
      }
    });
  }
}
const formCheckDB = new FormCheckDB();

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

  // 完成按鈕防呆與狀態更新：禁止永久鎖死，支援加練後更新
  if (state.activeWorkout.isTodayFinished) {
    finishBtn.classList.remove('opacity-50', 'pointer-events-none');
    finishBtn.innerHTML = `<i data-lucide="check-check" class="w-4 h-4 stroke-[3] text-accent-amber"></i> 今日已歸檔 (點擊更新)`;
  } else if (completedSets === 0) {
    finishBtn.classList.add('opacity-50');
    finishBtn.classList.remove('pointer-events-none');
    finishBtn.innerHTML = `<i data-lucide="check" class="w-4 h-4 stroke-[3]"></i> 完成今日訓練 (歸檔)`;
  } else {
    finishBtn.classList.remove('opacity-50', 'pointer-events-none');
    finishBtn.innerHTML = `<i data-lucide="check" class="w-4 h-4 stroke-[3]"></i> 完成今日訓練 (歸檔)`;
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
    const hasVideo = formCheckDB.hasVideo(item.exerciseId);

    const card = document.createElement('div');
    card.className = 'bg-iron-900 border border-iron-800 rounded-2xl p-4 shadow-xl space-y-3';

    const ghostStr = ghost ? `上次：${ghost.weight}kg × ${ghost.reps} @ RPE ${ghost.rpe}` : '首次訓練';

    card.innerHTML = `
      <!-- 動作標題、負重模式、快捷工具列 -->
      <div class="space-y-1.5 pb-2 border-b border-iron-800/80">
        <div class="flex items-start justify-between">
          <div class="cursor-pointer" data-action="open-guide" data-ex-index="${exIdx}" data-ex-id="${item.exerciseId}">
            <div class="flex items-center gap-1.5">
              <h3 class="font-extrabold text-white text-base tracking-tight hover:text-accent-green transition">${exObj.name}</h3>
              <i data-lucide="book-open" class="w-3.5 h-3.5 text-accent-green/70"></i>
            </div>
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

          <!-- 工具按鈕列 (指南、側拍影片、熱身、替換、刪除) -->
          <div class="flex items-center gap-1">
            <button data-action="open-guide" data-ex-index="${exIdx}" data-ex-id="${item.exerciseId}" class="p-1.5 rounded-lg bg-iron-800 hover:bg-iron-750 text-slate-300 hover:text-accent-green text-xs flex items-center gap-1 tap-active" title="查看動作示範與指南">
              <i data-lucide="book-open" class="w-3.5 h-3.5 text-accent-green"></i>
              <span class="text-[10px] font-bold">指南</span>
            </button>
            <button data-action="open-video" data-ex-index="${exIdx}" data-ex-id="${item.exerciseId}" class="p-1.5 rounded-lg text-xs flex items-center gap-1 tap-active transition ${hasVideo ? 'bg-accent-green/20 text-accent-green border border-accent-green/40 shadow-sm shadow-accent-green/20' : 'bg-iron-800 hover:bg-iron-750 text-slate-400'}" title="Form Check 側拍影片與要訣">
              <i data-lucide="video" class="w-3.5 h-3.5 ${hasVideo ? 'text-accent-green fill-accent-green/20' : ''}"></i>
              <span class="text-[10px] font-bold">${hasVideo ? '影片' : '側拍'}</span>
            </button>
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

function drawCanvasRoundRect(ctx, x, y, width, height, radius, fillStyle, strokeStyle) {
  ctx.save();
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, width, height, radius);
  } else {
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
  }
  if (fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }
  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle;
    ctx.stroke();
  }
  ctx.restore();
}

function openWorkoutSummaryModal(session) {
  const modal = document.getElementById('shareCardModal');
  const canvas = document.getElementById('summaryCardCanvas');
  const ctx = canvas.getContext('2d');

  const exercises = (session.exercises && session.exercises.length > 0) ? session.exercises : [];
  const dynamicHeight = Math.max(680, 360 + exercises.length * 68 + 70);

  canvas.width = 600;
  canvas.height = dynamicHeight;

  // 1. 純黑硬派底色
  ctx.fillStyle = '#070a10';
  ctx.fillRect(0, 0, 600, dynamicHeight);

  // 2. 頂部炫光漸層裝飾條
  const grad = ctx.createLinearGradient(0, 0, 600, 0);
  grad.addColorStop(0, '#10b981');
  grad.addColorStop(0.5, '#f59e0b');
  grad.addColorStop(1, '#10b981');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 600, 6);

  // 3. Logo 與副標
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 24px monospace';
  ctx.fillText('IRONLOG PRO', 40, 52);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 13px sans-serif';
  ctx.fillText('WORKOUT SUMMARY REPORT', 40, 74);

  // 4. 課表名稱與日期
  ctx.fillStyle = '#10b981';
  ctx.font = '900 26px sans-serif';
  const routineTitle = session.routineName || '自訂訓練';
  ctx.fillText(routineTitle.length > 18 ? routineTitle.slice(0, 18) + '...' : routineTitle, 40, 122);

  ctx.fillStyle = '#64748b';
  ctx.font = '600 13px monospace';
  ctx.fillText(`DATE: ${session.date || new Date().toISOString().split('T')[0]}   |   DURATION: ${session.durationMinutes || 45} MINS`, 40, 146);

  // 5. 數據統計大數字框 (高對比容量 & 組數)
  drawCanvasRoundRect(ctx, 40, 170, 520, 95, 16, '#111827', '#1f293d');

  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 12px sans-serif';
  ctx.fillText('TOTAL VOLUME LOAD', 65, 202);
  ctx.fillText('COMPLETED SETS', 345, 202);

  const totalVolNum = Number(session.totalVolume) || 0;
  const totalSetsNum = Number(session.totalSets) || 0;

  ctx.fillStyle = '#10b981';
  ctx.font = '900 32px monospace';
  ctx.fillText(`${totalVolNum.toLocaleString()} KG`, 65, 244);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 32px monospace';
  ctx.fillText(`${totalSetsNum} SETS`, 345, 244);

  // 6. 動作明細標題
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '800 15px sans-serif';
  ctx.fillText('EXERCISE BREAKDOWN', 40, 305);

  // 7. 動作清單迴圈 (完整呈現所有動作，高對比顯示名稱、組數與最高負重)
  let curY = 325;
  exercises.forEach((ex) => {
    drawCanvasRoundRect(ctx, 40, curY, 520, 56, 12, '#131d31', '#223250');

    // 動作名稱
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 14px sans-serif';
    const nameStr = ex.exerciseName || '訓練動作';
    ctx.fillText(nameStr.length > 28 ? nameStr.slice(0, 28) + '...' : nameStr, 58, curY + 25);

    // 組數與最高負重 TOP Weight
    const maxW = (ex.sets && ex.sets.length > 0) ? Math.max(...ex.sets.map(s => Number(s.weight) || 0), 0) : 0;
    const setsCnt = ex.sets ? ex.sets.length : 0;

    ctx.fillStyle = '#fbbf24';
    ctx.font = '800 13px monospace';
    ctx.fillText(`${setsCnt} COMPLETED SETS`, 58, curY + 45);

    ctx.fillStyle = '#34d399';
    ctx.font = '900 13px monospace';
    ctx.fillText(`TOP ${maxW} KG`, 430, curY + 45);

    curY += 68;
  });

  // 8. 底部硬派精神標籤
  ctx.fillStyle = '#475569';
  ctx.font = '700 12px monospace';
  ctx.fillText('NO PAIN NO GAIN  •  FORGED IN IRON  •  IRONLOG PRO', 40, dynamicHeight - 25);

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

// ======================= 9.5 動作示範指南與 Form Check 側拍影片回放控制器 =======================
let currentGuideExerciseId = null;
let currentVideoObjectUrl = null;

async function openExerciseGuideModal(exerciseId, exerciseName, category = '胸部', defaultTab = 'guide') {
  currentGuideExerciseId = exerciseId;
  const modal = document.getElementById('exerciseGuideModal');
  const nameEl = document.getElementById('guideModalExerciseName');
  const catBadge = document.getElementById('guideModalCategoryBadge');
  const muscleSummary = document.getElementById('guideModalMuscleSummary');

  nameEl.textContent = exerciseName;
  catBadge.textContent = category;

  // 取得動作指南 (支援40+主流字典與智能兜底)
  const guide = getExerciseGuide(exerciseId, exerciseName, category);
  muscleSummary.textContent = `主要受力：${guide.primary} | 次要輔助：${guide.secondary}`;

  // 1. 預備姿勢
  const setupList = document.getElementById('guideSetupList');
  setupList.innerHTML = (guide.setup || []).map((s, i) => `
    <li class="flex items-start gap-2">
      <span class="w-4 h-4 rounded-full bg-amber-500/20 text-accent-amber font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">${i + 1}</span>
      <span class="leading-relaxed">${s}</span>
    </li>
  `).join('');

  // 2. 動作過程
  const execList = document.getElementById('guideExecutionList');
  execList.innerHTML = (guide.execution || []).map((s, i) => `
    <li class="flex items-start gap-2">
      <span class="w-4 h-4 rounded-full bg-emerald-500/20 text-accent-green font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">${i + 1}</span>
      <span class="leading-relaxed">${s}</span>
    </li>
  `).join('');

  // 3. 關鍵發力與呼吸
  const cuesList = document.getElementById('guideCuesList');
  cuesList.innerHTML = (guide.cues || []).map(s => `
    <li class="flex items-start gap-2">
      <i data-lucide="check-circle" class="w-3.5 h-3.5 text-accent-blue shrink-0 mt-0.5"></i>
      <span class="leading-relaxed">${s}</span>
    </li>
  `).join('');

  // 載入側拍影片與要訣資料
  await loadVideoTabState(exerciseId);

  // 切換至指定頁籤
  switchGuideModalTab(defaultTab);

  modal.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

async function loadVideoTabState(exerciseId) {
  const player = document.getElementById('formCheckVideoPlayer');
  const placeholder = document.getElementById('formCheckVideoPlaceholder');
  const removeBtn = document.getElementById('removeBoundVideoBtn');
  const urlInput = document.getElementById('externalVideoUrlInput');
  const cueTextarea = document.getElementById('formCueNotesTextarea');

  // 清除先前的 ObjectURL 防止記憶體外洩
  if (currentVideoObjectUrl) {
    URL.revokeObjectURL(currentVideoObjectUrl);
    currentVideoObjectUrl = null;
  }
  player.pause();
  player.removeAttribute('src');
  player.load();

  const data = await formCheckDB.get(exerciseId) || {};
  cueTextarea.value = data.cueNote || '';
  urlInput.value = data.url || '';

  if (data.blob) {
    currentVideoObjectUrl = URL.createObjectURL(data.blob);
    player.src = currentVideoObjectUrl;
    player.classList.remove('hidden');
    placeholder.classList.add('hidden');
    removeBtn.classList.remove('hidden');
  } else if (data.url && data.url.trim()) {
    player.src = data.url.trim();
    player.classList.remove('hidden');
    placeholder.classList.add('hidden');
    removeBtn.classList.remove('hidden');
  } else {
    player.classList.add('hidden');
    placeholder.classList.remove('hidden');
    removeBtn.classList.add('hidden');
  }
}

function switchGuideModalTab(tab = 'guide') {
  const guideBtn = document.getElementById('guideTabBtn');
  const videoBtn = document.getElementById('videoTabBtn');
  const guidePane = document.getElementById('guideTabPane');
  const videoPane = document.getElementById('videoTabPane');
  const player = document.getElementById('formCheckVideoPlayer');

  if (tab === 'guide') {
    guideBtn.className = 'flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 bg-iron-800 text-white shadow-sm';
    videoBtn.className = 'flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 text-slate-400 hover:text-slate-200';
    guidePane.classList.remove('hidden');
    videoPane.classList.add('hidden');
    player.pause();
  } else {
    videoBtn.className = 'flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 bg-iron-800 text-white shadow-sm';
    guideBtn.className = 'flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 text-slate-400 hover:text-slate-200';
    guidePane.classList.add('hidden');
    videoPane.classList.remove('hidden');
    if (!player.classList.contains('hidden') && player.src) {
      player.play().catch(() => {});
    }
  }
  if (window.lucide) lucide.createIcons();
}

function initExerciseGuideModalEvents() {
  document.getElementById('closeGuideModalBtn').addEventListener('click', () => {
    const player = document.getElementById('formCheckVideoPlayer');
    player.pause();
    document.getElementById('exerciseGuideModal').classList.add('hidden');
  });

  document.getElementById('guideTabBtn').addEventListener('click', () => switchGuideModalTab('guide'));
  document.getElementById('videoTabBtn').addEventListener('click', () => switchGuideModalTab('video'));

  // 本地上傳按鈕觸發 hidden input
  document.getElementById('triggerVideoUploadBtn').addEventListener('click', () => {
    document.getElementById('formCheckFileInput').click();
  });

  // 選擇本地影片檔案 (IndexedDB 儲存 Blob)
  document.getElementById('formCheckFileInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file || !currentGuideExerciseId) return;

    if (!file.type.startsWith('video/')) {
      alert('請選取影片檔案 (MP4, WebM, MOV 等)');
      return;
    }

    const existing = await formCheckDB.get(currentGuideExerciseId) || {};
    existing.blob = file;
    existing.url = '';
    await formCheckDB.set(currentGuideExerciseId, existing);

    alertToast('✅ 本地側拍影片已成功儲存至 IndexedDB！');
    sound.vibrate(25);
    await loadVideoTabState(currentGuideExerciseId);
    renderWorkoutSheet();
    e.target.value = '';
  });

  // 外鏈儲存
  document.getElementById('saveExternalUrlBtn').addEventListener('click', async () => {
    const url = document.getElementById('externalVideoUrlInput').value.trim();
    if (!url || !currentGuideExerciseId) {
      alert('請輸入有效的影片直連網址');
      return;
    }

    const existing = await formCheckDB.get(currentGuideExerciseId) || {};
    existing.url = url;
    existing.blob = null;
    await formCheckDB.set(currentGuideExerciseId, existing);

    alertToast('✅ 已成功綁定外部影片網址！');
    sound.vibrate(25);
    await loadVideoTabState(currentGuideExerciseId);
    renderWorkoutSheet();
  });

  // 移除影片
  document.getElementById('removeBoundVideoBtn').addEventListener('click', async () => {
    if (!currentGuideExerciseId) return;
    if (confirm('確定要移除此動作的側拍影片嗎？（要訣備忘仍會保留）')) {
      await formCheckDB.removeVideo(currentGuideExerciseId);
      alertToast('已移除側拍影片');
      await loadVideoTabState(currentGuideExerciseId);
      renderWorkoutSheet();
    }
  });

  // 個人發力要訣備忘即時保存
  const cueTextarea = document.getElementById('formCueNotesTextarea');
  const indicator = document.getElementById('cueNotesSaveIndicator');
  let saveTimer = null;

  cueTextarea.addEventListener('input', () => {
    indicator.textContent = '儲存中...';
    indicator.className = 'text-[10px] text-accent-amber font-mono';

    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      if (!currentGuideExerciseId) return;
      const existing = await formCheckDB.get(currentGuideExerciseId) || {};
      existing.cueNote = cueTextarea.value;
      await formCheckDB.set(currentGuideExerciseId, existing);

      indicator.textContent = '已自動儲存';
      indicator.className = 'text-[10px] text-accent-green font-mono';
    }, 400);
  });
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

    // 12. 動作示範指南
    else if (action === 'open-guide') {
      const exItem = state.activeWorkout.exercises[exIdx];
      const exObj = state.exercises.find(e => e.id === exItem.exerciseId) || { name: '自訂動作', category: '胸部' };
      openExerciseGuideModal(exItem.exerciseId, exObj.name, exObj.category, 'guide');
    }

    // 13. Form Check 側拍影片
    else if (action === 'open-video') {
      const exItem = state.activeWorkout.exercises[exIdx];
      const exObj = state.exercises.find(e => e.id === exItem.exerciseId) || { name: '自訂動作', category: '胸部' };
      openExerciseGuideModal(exItem.exerciseId, exObj.name, exObj.category, 'video');
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

  // 完成今日訓練 (歸檔防呆與同日即時更新)
  document.getElementById('finishWorkoutBtn').addEventListener('click', () => {
    if (!state.activeWorkout || !state.activeWorkout.exercises) {
      alertToast('今日暫無進行中的訓練項目');
      return;
    }

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

    if (!confirm('確定結束今日訓練並歸檔？\n\n（歸檔後隨時可繼續加組加練，系統將即時更新當日紀錄）')) {
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const durationMins = Math.max(15, Math.round((Date.now() - (state.activeWorkout.startTime || Date.now())) / (60 * 1000)));

    let savedSession = null;
    const existingIndex = state.sessions.findIndex(s => s.date === todayStr);

    if (existingIndex !== -1) {
      // 即時更新當日已存在的歸檔紀錄
      state.sessions[existingIndex] = {
        ...state.sessions[existingIndex],
        routineName: state.activeWorkout.routineName,
        category: state.activeWorkout.category,
        durationMinutes: durationMins,
        totalVolume: totalVol,
        totalSets: completedCount,
        exercises: sessionExercises,
        timestamp: Date.now()
      };
      savedSession = state.sessions[existingIndex];
    } else {
      savedSession = {
        id: 'sess-' + Date.now(),
        date: todayStr,
        timestamp: Date.now(),
        routineName: state.activeWorkout.routineName,
        category: state.activeWorkout.category,
        durationMinutes: durationMins,
        totalVolume: totalVol,
        totalSets: completedCount,
        exercises: sessionExercises
      };
      state.sessions.unshift(savedSession);
    }

    // 若排程是天數循環模式且初次完成，自動前進至下一節點
    if (state.schedule.mode === 'cycle' && !state.activeWorkout.isTodayFinished) {
      state.schedule.cycleIndex++;
    }

    // 標記今日已歸檔，但不強制清空 activeWorkout，允許使用者繼續修改或加練！
    state.activeWorkout.isTodayFinished = true;
    saveState();
    renderWorkoutSheet();

    sound.pr();
    alertToast(existingIndex !== -1 ? '🎉 今日訓練已即時更新歸檔！' : '🎉 今日訓練完成！組數已成功歸檔！');

    // 自動彈出成果結算分享卡
    setTimeout(() => openWorkoutSummaryModal(savedSession), 400);
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
  document.getElementById('openAddExToWorkoutBtn').addEventListener('click', () => {
    if (!state.activeWorkout) {
      state.activeWorkout = {
        routineId: 'custom-today',
        routineName: '今日自主訓練',
        category: '全身',
        startTime: Date.now(),
        mobilityChecks: (MOBILITY_PROTOCOLS['全身'] || []).map(m => ({ text: m.text, done: false })),
        exercises: [],
        isTodayFinished: false
      };
      saveState();
      renderWorkoutSheet();
    }
    openExercisePicker('workout');
  });
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
      if (state.activeWorkout) {
        (state.activeWorkout.exercises || []).forEach(ex => {
          (ex.sets || []).forEach(s => s.isCompleted = false);
        });
        state.activeWorkout.isTodayFinished = false;
      }
      saveState();
      renderWorkoutSheet();
      renderAnalyticsView();
      alertToast('已成功清空所有訓練紀錄與 PR！');
      sound.vibrate(30);
    }
  });

  // 徹底出廠重置 (徹底清理 LocalStorage 與 IndexedDB 側拍影片)
  document.getElementById('factoryResetBtn').addEventListener('click', async () => {
    if (confirm('⚠️ 警告：這將徹底清除所有資料（包含所有課表、排程、歷史紀錄與側拍影片），恢復全新出廠狀態！確定要繼續嗎？')) {
      localStorage.clear();
      await formCheckDB.clearAll();
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
window.addEventListener('DOMContentLoaded', async () => {
  await formCheckDB.init();
  loadState();
  initGymToolbox();
  initExerciseGuideModalEvents();
  setupEventListeners();
  renderWorkoutSheet();
  updateManualTimerDisplay();

  if (window.lucide) lucide.createIcons();
});
