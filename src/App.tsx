import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Users, 
  Lightbulb, 
  Brain, 
  Heart, 
  Calendar, 
  Clock, 
  Monitor, 
  CheckSquare, 
  Map, 
  Camera, 
  Compass, 
  Flag,
  PenTool,
  Smile,
  AlertTriangle,
  BarChart,
  ChevronRight,
  ChevronLeft,
  Calculator,
  Coins,
  Palette,
  ShoppingBag,
  Bus,
  Ship,
  ArrowRight,
  Cpu,
  Award,
  RefreshCw,
  MessageCircle,
  MapPin,
  Download,
  FileText,
  Settings,
  Filter,
  Square,
  ChevronDown,
  ChevronUp,
  X,
  UserMinus,
  UserPlus,
  Trash2
} from 'lucide-react';
import { 
  BarChart as RechartBar, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell 
} from 'recharts';

// --- 1. DATA CONSTANTS & TYPES ---

interface TimeSlot {
  id: string;
  start: string;
  end: string;
  type: 'lesson' | 'recess';
  name: string;
}

const TIME_SLOTS: TimeSlot[] = [
  { id: 'L1', start: '08:35', end: '09:10', type: 'lesson', name: '第一節' },
  { id: 'L2', start: '09:10', end: '09:45', type: 'lesson', name: '第二節' },
  { id: 'R1', start: '09:45', end: '10:00', type: 'recess', name: '小息一' },
  { id: 'L3', start: '10:00', end: '10:35', type: 'lesson', name: '第三節' },
  { id: 'L4', start: '10:35', end: '11:10', type: 'lesson', name: '第四節' },
  { id: 'R2', start: '11:10', end: '11:25', type: 'recess', name: '小息二' },
  { id: 'L5', start: '11:25', end: '12:00', type: 'lesson', name: '第五節' },
  { id: 'L6', start: '12:00', end: '12:35', type: 'lesson', name: '第六節' },
];

// --- STAFFING SYSTEM DATA ---
interface Teacher {
  id: string;
  name: string;
  originalWorkload: { [key: string]: number };
  schedule: { [day: string]: { [period: number]: string } };
}

interface ClassAssignment {
  classId: string;
  period: number;
  teachers: string[];
  capacity: number; // 1 or 2
}

// 1. 班主任數據
const CLASS_TEACHERS_MOCK: { [key: string]: string[] } = {
  '1A': ['袁紫茵', '何詠賢'], '1B': ['黃雅珍', '陳曉晴'], '1C': ['陳淑芳', '陳佩容'], '1D': ['李運娣', '陳慧淇'],
  '2A': ['陳子殷'], '2B': ['侯慧穎'], '2C': ['譚慧琨'], '2D': ['楊靖霖'], '2E': ['方慧菁'],
  '3A': ['蘇靜怡'], '3B': ['王栢榮'], '3C': ['廖小玲'], '3D': ['鄺保羅'],
  '4A': ['陳珮儀'], '4B': ['丁紹斌'], '4C': ['張展瑋'], '4D': ['呂常欣'], '4E': ['黃浩謙'],
  '5A': ['鄭愷詩'], '5B': ['黃多蔚'], '5C': ['邵家兒'], '5D': ['羅佩珊'], '5E': ['許婉寧'],
  '6A': ['陳偉芬'], '6B': ['林錦屏'], '6C': ['黎保妤'], '6D': ['黃馨慧'], '6E': ['王美麗']
};

const ALL_CLASSES = Object.keys(CLASS_TEACHERS_MOCK);
const STAFFING_DAYS = ['Day 1', 'Day 2', 'Day 3', 'Day 4'];
const STAFFING_LEVELS = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];
const STAFFING_PERIODS = [1, 2, 3, 4, 5, 6];

// 2. CONSOLIDATED TEACHER LIST (Real names only)
const EXTRA_TEACHERS = [
  '陳淑怡', '楊雅恩', '沈詠兒', 
  '校長', '副校長', '主任'
];

const getMasterTeacherList = () => {
  const teacherSet = new Set<string>();
  Object.values(CLASS_TEACHERS_MOCK).forEach(tList => tList.forEach(t => teacherSet.add(t)));
  EXTRA_TEACHERS.forEach(t => teacherSet.add(t));
  return Array.from(teacherSet).sort();
};

const MASTER_TEACHER_LIST = getMasterTeacherList();

// 3. Generate Realistic Schedules
const generateMockSchedules = () => {
  const schedules: { [name: string]: { [day: string]: { [period: number]: string } } } = {};
  
  MASTER_TEACHER_LIST.forEach((name, idx) => {
    schedules[name] = {};
    
    // Find if this teacher is a class teacher of any class
    let myClass = '';
    Object.entries(CLASS_TEACHERS_MOCK).forEach(([cls, teachers]) => {
      if (teachers.includes(name)) myClass = cls;
    });

    STAFFING_DAYS.forEach(day => {
      schedules[name][day] = {};
      const dailyLoad = 4; // Standardize load for clearer charts
      
      for (let i = 1; i <= dailyLoad; i++) {
        // If they are a class teacher, assign them to their class for the first few periods
        if (myClass && i <= 3) {
           schedules[name][day][i] = `${myClass} 班務`;
        } else {
           // Assign random subject to random class
           const classIdx = (idx + i) % ALL_CLASSES.length;
           const className = ALL_CLASSES[classIdx];
           schedules[name][day][i] = `${className} 科任`;
        }
      }
    });
  });
  return schedules;
};

const TEACHER_SCHEDULES = generateMockSchedules();

// --- P1 - P3 DATA (Standard JS Objects) ---
const P1_DATA = [
  {
    day: 'Day 1', date: '1月19日 (一)', theme: '自理意識覺醒',
    lessons: {
      1: { title: '繪本：《我長大了》', activity: '互動故事 + 角色扮演', stream: 'Reading', val: '責任感' },
      2: { title: '書包大解構', activity: '分類必需品 (Maths分類)', stream: 'Maths', val: '自律' },
      3: { title: '課室整理術', activity: '還原課室比賽', stream: 'Tech', val: '公德心' },
      4: { title: '整理術實踐', activity: '製作自理檢查表', stream: 'Art', val: '勤勞' },
      5: { title: '小手肌訓練', activity: '夾豆子挑戰', stream: 'Eng', val: '堅毅' },
      6: { title: '反思紀錄', activity: '心情日記', stream: 'Meta', val: '承擔' },
    }
  },
  { day: 'Day 2', date: '1月20日 (二)', theme: '儀容整潔', lessons: { 1: { title: '鈕扣與拉鍊', activity: '小手肌操作', stream: 'Eng', val: '自律' } } }, 
  { day: 'Day 3', date: '1月21日 (三)', theme: '餐桌禮儀', lessons: { 1: { title: '筷子武林', activity: '槓桿原理', stream: 'Sci', val: '禮貌' } } },
  { day: 'Day 4', date: '1月22日 (四)', theme: '畢業挑戰', lessons: { 1: { title: '綜合障礙賽', activity: '穿衣/執拾接力', stream: 'PE', val: '堅毅' } } }
];

const P2_DATA = [
  {
    day: 'Day 1', date: '1月19日 (一)', theme: '社區搜查線',
    lessons: {
      1: { title: '繪本：機械人007', activity: '【電子繪本】認識社區設施與公德心', stream: 'Reading', val: '關愛' },
      2: { title: 'AI 偵探訓練', activity: '平板拍照與語音記錄訓練', stream: 'Tech', val: '勤勞' },
      3: { title: '實地考察 (準備)', activity: '分組與任務分配', stream: 'Social', val: '合作' },
      4: { title: '實地考察 (校園)', activity: '搜尋社區痛點 (垃圾/損壞)', stream: 'Inquiry', val: '責任' },
      5: { title: '數據整理', activity: '照片分類與標記', stream: 'Maths', val: '條理' },
      6: { title: '偵探日誌', activity: '反思與畫圖', stream: 'Art', val: '同理' },
    }
  },
  { day: 'Day 2', date: '1月20日 (二)', theme: '綠色改造師', lessons: { 1: { title: '問題分析', activity: '匯報考察發現', stream: 'Comm', val: '承擔' } } },
  { day: 'Day 3', date: '1月21日 (三)', theme: '公德推廣日', lessons: { 1: { title: '海報設計', activity: 'Canva 製作', stream: 'Tech', val: '創意' } } },
  { day: 'Day 4', date: '1月22日 (四)', theme: '成果發布', lessons: { 1: { title: '展覽導賞', activity: '小小導賞員', stream: 'Comm', val: '自信' } } }
];

const P3_DATA = [
  {
    day: 'Day 1', date: '1月19日 (一)', theme: '維港探索行 (戶外)',
    lessons: {
      1: { title: '戶外考察', activity: '詳情請見「P3 戶外全景圖」', stream: 'Inquiry', val: '守法' },
      2: { title: '戶外考察', activity: 'K11 / 中環 / 渡輪體驗', stream: 'Inquiry', val: '觀察' },
      3: { title: '戶外考察', activity: '建築特色記錄', stream: 'Art', val: '欣賞' },
      4: { title: '戶外考察', activity: '交通工具體驗', stream: 'Social', val: '秩序' },
      5: { title: '戶外考察', activity: '回程', stream: 'Social', val: '合作' },
      6: { title: '考察總結', activity: '口頭反思分享', stream: 'Comm', val: '反思' },
    }
  },
  {
    day: 'Day 2', date: '1月20日 (二)', theme: '整理與規劃',
    lessons: {
      1: { title: '遊客護照整理', activity: '整理 Day 1 照片與數據 (Maths)', stream: 'Tech', val: '責任' },
      2: { title: 'VR 虛擬導賞', activity: '重溫未去景點 / 補充學習', stream: 'Tech', val: '好奇' },
      3: { title: '行程規劃師', activity: '設計「粉嶺一日遊」路線', stream: 'Social', val: '規劃' },
      4: { title: 'AGILE 情境挑戰', activity: '應對行程突發狀況 (Resilience)', stream: 'Life', val: '適應' },
      5: { title: '小組分工', activity: '準備 Day 3 市集攤位設計', stream: 'Comm', val: '合作' },
      6: { title: '資料搜集', activity: '平板搜尋旅遊資訊', stream: 'Tech', val: '自學' },
    }
  },
  {
    day: 'Day 3', date: '1月21日 (三)', theme: '創作與市集 (Maths x VA)',
    lessons: {
      1: { title: '貨幣換算所', activity: '【數學工具】外幣兌換資金', stream: 'Maths', val: '誠信' },
      2: { title: '視藝：草圖設計', activity: '設計香港特色擺設 (Visual Arts)', stream: 'Art', val: '創意' },
      3: { title: '視藝：動手製作', activity: '利用輕黏土/熱縮片製作', stream: 'Eng', val: '堅毅' },
      4: { title: '貫賣遊戲 (市集)', activity: '【數學工具】除法購物與找贖', stream: 'Maths', val: '應用' },
      5: { title: '市集評賞', activity: '互相欣賞作品與設計理念', stream: 'Art', val: '欣賞' },
      6: { title: '理財反思', activity: '總結消費與儲蓄 (Financial)', stream: 'Values', val: '節儉' },
    }
  },
  {
    day: 'Day 4', date: '1月22日 (四)', theme: '國際旅遊展',
    lessons: {
      1: { title: '攤位佈置', activity: '建立小組旅行社攤位', stream: 'Art', val: '合作' },
      2: { title: '推介大會', activity: '向同學推銷行程 (Speaking)', stream: 'Comm', val: '自信' },
      3: { title: '遊客互評', activity: '持有護照蓋印投票', stream: 'Social', val: '公正' },
      4: { title: '智能分析', activity: '統計最受歡迎景點 (Data)', stream: 'Maths', val: '分析' },
      5: { title: '時光膠囊', activity: '寫給未來的信', stream: 'Lit', val: '希望' },
      6: { title: '閉幕禮', activity: '頒獎與慶祝', stream: 'All', val: '感恩' },
    }
  }
];

// --- 2. SUB-COMPONENTS ---

// 2.1 P2 E-Book Reader
const EBookReader = () => {
  const [page, setPage] = useState(0);
  const story = [
    { img: "🤖🏙️", text: "嗶嗶！我是機械人 007。我降落在粉嶺正覺蓮社學校門口，但我迷路了，能量只剩 10%...", q: "提問：如果你是風紀，你會建議 007 去哪裡充電？" },
    { img: "🛝🍂", text: "我來到公園，但滑梯下有好多垃圾。「警告！環境髒亂，無法充電！」我的眼睛變成了紅色。", q: "思考：為什麼髒亂的環境讓人不舒服？" },
    { img: "🧹✨", text: "二年級的「綠色小偵探」出現了！大家幫忙分類回收，擦掉塗鴉。公園變乾淨了！", q: "行動：我們可以用什麼方法分類這些垃圾？" },
    { img: "🔋😊", text: "嗶嗶——「檢測到公德心能量！」007 充滿電了！「謝謝粉嶺的小朋友，你們是社區英雄！」", q: "反思：你認為什麼是「公德心能量」？" }
  ];

  return (
    <div className="h-full flex flex-col animate-fadeIn">
      <div className="bg-emerald-600 text-white p-4 rounded-t-xl flex justify-between items-center">
        <h3 className="font-bold flex items-center gap-2"><BookOpen /> P2 電子繪本：機械人007的粉嶺奇遇</h3>
        <span className="text-xs bg-emerald-800 px-2 py-1 rounded">常識科：居住環境</span>
      </div>
      <div className="flex-1 bg-white border border-emerald-200 rounded-b-xl flex overflow-hidden">
        <div className="w-1/2 bg-slate-900 flex items-center justify-center text-8xl">{story[page].img}</div>
        <div className="w-1/2 p-8 flex flex-col justify-center bg-emerald-50">
          <p className="text-xl leading-loose text-slate-800 mb-8 font-medium">{story[page].text}</p>
          <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-400 shadow-sm">
            <p className="text-sm font-bold text-slate-500 mb-1">老師提問指引：</p>
            <p className="text-slate-700">{story[page].q}</p>
          </div>
          <div className="mt-8 flex justify-between">
            <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page===0} className="px-4 py-2 bg-slate-200 rounded hover:bg-slate-300 disabled:opacity-50">上一頁</button>
            <span className="self-center font-bold text-slate-400">{page+1} / {story.length}</span>
            <button onClick={() => setPage(Math.min(story.length-1, page + 1))} disabled={page===story.length-1} className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50">下一頁</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2.2 P3 Math Tool
const MathTool = () => {
  const [q, setQ] = useState<any>(null);
  const [showAns, setShowAns] = useState(false);

  const genMul = () => {
    const amt = Math.floor(Math.random() * 800) + 100;
    const rate = Math.floor(Math.random() * 6) + 3;
    setQ({
      type: 'mul',
      text: `【找換店】你是遊客，持有 ${amt} 單位外幣。匯率：1 外幣 = $${rate} 港幣。`,
      ans: `${amt} × ${rate} = $${amt * rate} (港幣)`
    });
    setShowAns(false);
  };

  const genDiv = () => {
    const total = Math.floor(Math.random() * 500) + 100;
    const price = Math.floor(Math.random() * 8) + 2;
    const rem = total % price;
    setQ({
      type: 'div',
      text: `【手信店】你有 $${total} 港幣。每件磁貼 $${price}。最多買幾件？剩多少錢？`,
      ans: `$${total} ÷ ${price} = ${Math.floor(total/price)} (件) ... $${rem} (餘款)`
    });
    setShowAns(false);
  };

  return (
    <div className="h-full flex flex-col animate-fadeIn">
      <div className="bg-amber-600 text-white p-4 rounded-t-xl flex justify-between items-center">
        <h3 className="font-bold flex items-center gap-2"><Calculator /> P3 數學工具：貨幣換算所</h3>
        <span className="text-xs bg-amber-800 px-2 py-1 rounded">數學科：多位數乘除</span>
      </div>
      <div className="flex-1 bg-slate-50 border border-amber-200 rounded-b-xl p-8 flex gap-8">
        <div className="w-1/3 space-y-4">
          <button onClick={genMul} className="w-full p-6 text-left bg-white border border-amber-200 rounded-xl shadow-sm hover:shadow-md transition-all group">
            <div className="font-bold text-amber-700 mb-1 group-hover:translate-x-1 transition-transform">情境 A：找換店 (乘法)</div>
            <div className="text-xs text-slate-500">角色：剛抵港遊客<br/>任務：外幣 ➔ 港幣</div>
          </button>
          <button onClick={genDiv} className="w-full p-6 text-left bg-white border border-green-200 rounded-xl shadow-sm hover:shadow-md transition-all group">
            <div className="font-bold text-green-700 mb-1 group-hover:translate-x-1 transition-transform">情境 B：手信店 (除法)</div>
            <div className="text-xs text-slate-500">角色：購物者<br/>任務：計算購買數量與餘額</div>
          </button>
        </div>
        <div className="w-2/3 bg-slate-900 rounded-xl p-8 flex flex-col items-center justify-center text-center relative">
          {q ? (
            <>
              <div className="text-white text-2xl font-medium mb-8 leading-relaxed whitespace-pre-line">{q.text}</div>
              {showAns ? (
                <div className="bg-white text-slate-900 px-6 py-4 rounded-xl font-mono text-2xl font-bold animate-bounceIn shadow-lg">{q.ans}</div>
              ) : (
                <button onClick={() => setShowAns(true)} className="px-6 py-2 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-500">顯示答案</button>
              )}
            </>
          ) : (
            <div className="text-slate-600 flex flex-col items-center"><Coins size={48} className="mb-2 opacity-50"/>請選擇左側題目</div>
          )}
        </div>
      </div>
    </div>
  );
};

// 2.3 P3 Outing Map
const OutingMap = ({ navigate }: { navigate: (day: string) => void }) => {
  return (
    <div className="h-full overflow-y-auto pr-2 animate-fadeIn">
      {/* Day 1 Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="flex items-center gap-3 border-b pb-4 mb-4">
          <Map className="text-blue-600" />
          <h2 className="text-xl font-bold text-slate-800">Day 1 戶外考察：維港探索行 (P3 專用)</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-8">
          {/* Group 1 */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 relative">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">組別一</div>
            <h3 className="font-bold text-blue-900 mb-4">九龍 ➔ 港島 (K11 出發)</h3>
            <div className="space-y-4 border-l-2 border-blue-200 pl-4 ml-2">
              <div className="text-sm">
                <span className="font-mono font-bold text-blue-600">08:35</span> <Bus className="inline w-4 h-4 mx-1"/> 學校出發
              </div>
              <div className="text-sm">
                <span className="font-mono font-bold text-blue-600">09:35</span> <MapPin className="inline w-4 h-4 mx-1"/> 到達 K11 MUSEA
              </div>
              <div className="bg-white p-2 rounded text-xs text-slate-600 shadow-sm">
                🚶 步行考察：星光大道 ➔ 藝術館 ➔ 太空館 ➔ 鐘樓
              </div>
              <div className="text-sm font-bold text-blue-700 bg-blue-100 inline-block px-2 rounded">
                <span className="font-mono">10:45</span> <Ship className="inline w-4 h-4 mx-1"/> 乘天星小輪
              </div>
              <div className="text-sm">
                <span className="font-mono font-bold text-blue-600">11:15</span> <MapPin className="inline w-4 h-4 mx-1"/> 到達中環碼頭
              </div>
              <div className="text-sm opacity-60">11:30 回程</div>
            </div>
          </div>

          {/* Group 2 */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-100 relative">
            <div className="absolute top-0 right-0 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">組別二</div>
            <h3 className="font-bold text-green-900 mb-4">港島 ➔ 九龍 (中環 出發)</h3>
            <div className="space-y-4 border-l-2 border-green-200 pl-4 ml-2">
               <div className="text-sm">
                <span className="font-mono font-bold text-green-600">08:35</span> <Bus className="inline w-4 h-4 mx-1"/> 學校出發
              </div>
              <div className="text-sm">
                <span className="font-mono font-bold text-green-600">09:45</span> <MapPin className="inline w-4 h-4 mx-1"/> 到達中環碼頭
              </div>
              <div className="text-sm font-bold text-green-700 bg-green-100 inline-block px-2 rounded">
                <span className="font-mono">09:45</span> <Ship className="inline w-4 h-4 mx-1"/> 乘天星小輪
              </div>
               <div className="text-sm">
                <span className="font-mono font-bold text-green-600">10:15</span> <MapPin className="inline w-4 h-4 mx-1"/> 到達尖沙咀碼頭
              </div>
              <div className="bg-white p-2 rounded text-xs text-slate-600 shadow-sm">
                🚶 步行考察：鐘樓 ➔ 文化中心 ➔ 藝術館 ➔ 星光大道 ➔ K11
              </div>
               <div className="text-sm opacity-60">11:30 由 K11 回程</div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Days 2-4 Section */}
      <div className="mt-8">
         <div className="flex items-center gap-3 border-b pb-4 mb-4">
          <Calendar className="text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-800">Day 2 - 4 校內活動全覽 (點擊方塊進入教材頁)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Day 2', 'Day 3', 'Day 4'].map((dayName) => {
             const dayData = P3_DATA.find(d => d.day === dayName);
             if (!dayData) return null;

             const bgColor = dayName === 'Day 2' ? 'bg-purple-50 border-purple-200' : (dayName === 'Day 3' ? 'bg-indigo-50 border-indigo-200' : 'bg-amber-50 border-amber-200');
             const headerColor = dayName === 'Day 2' ? 'bg-purple-100 text-purple-800 border-purple-200' : (dayName === 'Day 3' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' : 'bg-amber-100 text-amber-800 border-amber-200');

             return (
              <div key={dayName} className={`rounded-xl border overflow-hidden ${bgColor}`}>
                <div className={`p-3 font-bold text-center border-b ${headerColor}`}>
                  {dayName} ({dayData.date.split(' ')[0]}) <br/><span className="text-xs font-normal">{dayData.theme}</span>
                </div>
                <div className="p-2 space-y-1 text-sm">
                  {TIME_SLOTS.map(slot => {
                    if (slot.type === 'recess') {
                      return (
                         <div key={slot.id} className="bg-yellow-100/50 p-1 text-center text-xs text-yellow-700 rounded my-1 flex justify-center items-center gap-1 border border-yellow-200/50">
                           <Clock size={10} /> {slot.name} (休息)
                         </div>
                      );
                    }
                    
                    const lessonIdx = parseInt(slot.id.replace('L',''));
                    const lesson = dayData.lessons[lessonIdx];
                    
                    return (
                      <div 
                        key={slot.id} 
                        onClick={() => navigate(dayName)}
                        className="flex gap-2 p-2 bg-white/60 hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm rounded cursor-pointer transition-all items-center group"
                        title="點擊進入資源頁"
                      >
                        <div className="w-8 text-[10px] font-bold text-slate-400 font-mono">{slot.name}</div>
                        <div className="flex-1">
                          <span className="font-bold block text-slate-700 text-xs group-hover:text-indigo-600">{lesson?.title}</span>
                          <span className="text-[10px] text-slate-500 line-clamp-1">{lesson?.activity}</span>
                        </div>
                        <ChevronRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100" />
                      </div>
                    );
                  })}
                </div>
              </div>
             );
          })}
        </div>
      </div>
    </div>
  );
};

// 2.4 Dashboard Component
const Dashboard = ({ changeTab }: { changeTab: (t: string) => void }) => (
  <div className="space-y-6 animate-fadeIn">
    <header className="mb-6">
      <h2 className="text-3xl font-bold text-slate-800">課程指揮中心 正覺蓮社學校 | V3.0 Final</h2>
      <p className="text-slate-500">整合 5C+、STREAM、價值觀教育及 AI 科技</p>
    </header>

    <div className="grid grid-cols-4 gap-6">
      <div onClick={() => changeTab('schedule')} className="bg-white p-6 rounded-xl border border-indigo-100 shadow-sm cursor-pointer hover:shadow-md transition-all group">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors"><Calendar className="text-indigo-600" /></div>
          <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">Master</span>
        </div>
        <h3 className="font-bold text-slate-800 text-lg">全校活動時間表</h3>
        <p className="text-sm text-slate-500 mt-2">查看 P1-P3 每日詳細流程</p>
      </div>

      <div onClick={() => changeTab('p2-tool')} className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm cursor-pointer hover:shadow-md transition-all group">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors"><BookOpen className="text-emerald-600" /></div>
          <span className="bg-emerald-600 text-white text-xs px-2 py-1 rounded-full">P2 Tool</span>
        </div>
        <h3 className="font-bold text-slate-800 text-lg">電子繪本閱讀器</h3>
        <p className="text-sm text-slate-500 mt-2">《機械人007》互動故事</p>
      </div>

      <div onClick={() => changeTab('p3-math')} className="bg-white p-6 rounded-xl border border-amber-100 shadow-sm cursor-pointer hover:shadow-md transition-all group">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-amber-50 rounded-lg group-hover:bg-amber-100 transition-colors"><Coins className="text-amber-600" /></div>
          <span className="bg-amber-600 text-white text-xs px-2 py-1 rounded-full">P3 Tool</span>
        </div>
        <h3 className="font-bold text-slate-800 text-lg">貨幣換算 & 戶外圖</h3>
        <p className="text-sm text-slate-500 mt-2">遊客情境算術 + 考察圖</p>
      </div>

      <div onClick={() => changeTab('staffing')} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-all group border-l-4 border-l-slate-800">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-slate-50 rounded-lg group-hover:bg-slate-100 transition-colors"><Users className="text-slate-600" /></div>
          <span className="bg-slate-600 text-white text-xs px-2 py-1 rounded-full">Admin</span>
        </div>
        <h3 className="font-bold text-slate-800 text-lg">智能人手編配</h3>
        <p className="text-sm text-slate-500 mt-2">AI 排課、工作量統計</p>
      </div>
    </div>
    
    <div className="bg-slate-900 text-slate-300 p-6 rounded-xl text-sm flex justify-between items-center">
      <div className="flex gap-4">
        <span className="flex items-center gap-2"><Brain size={16}/> 5C+ 架構</span>
        <span className="flex items-center gap-2"><Cpu size={16}/> AI 輔助</span>
        <span className="flex items-center gap-2"><Heart size={16}/> 價值觀教育</span>
      </div>
      <div>系統狀態：<span className="text-green-400">在線</span></div>
    </div>
  </div>
);

// 2.5 Master Schedule View
const MasterSchedule = ({ selectedLevel, selectedDay, setLevel, setDay }: any) => {
  const dataMap: any = { 'P1': P1_DATA, 'P2': P2_DATA, 'P3': P3_DATA };
  
  // Safety check: Optional chaining and fallback
  const currentData = dataMap[selectedLevel]?.find((d: any) => d.day === selectedDay);

  if (!currentData) return <div className="p-8 text-center text-slate-500">無法載入資料，請重試。</div>;

  return (
    <div className="h-full flex flex-col animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <div className="flex bg-white p-1 rounded-lg border border-slate-200">
          {['P1', 'P2', 'P3'].map(l => (
            <button key={l} onClick={() => setLevel(l)} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${selectedLevel === l ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}>{l}</button>
          ))}
        </div>
        <div className="flex bg-white p-1 rounded-lg border border-slate-200">
          {['Day 1', 'Day 2', 'Day 3', 'Day 4'].map(d => (
            <button key={d} onClick={() => setDay(d)} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${selectedDay === d ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}>{d}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 overflow-y-auto">
        <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
          <div>
            <span className="font-bold text-lg text-slate-800 mr-2">{selectedLevel} - {selectedDay}</span>
            <span className="text-slate-500 text-sm">{currentData.theme}</span>
          </div>
          <span className="text-xs bg-white border px-2 py-1 rounded text-slate-500">{currentData.date}</span>
        </div>
        <div className="divide-y divide-slate-100">
          {TIME_SLOTS.map(slot => {
            if (slot.type === 'recess') return (
              <div key={slot.id} className="bg-yellow-50/50 p-2 text-center text-xs text-yellow-700 font-bold flex justify-center gap-2"><Clock size={14}/> {slot.start}-{slot.end} 小息</div>
            );
            
            const lessonIdx = parseInt(slot.id.replace('L',''));
            
            // --- CRITICAL FIX: Force cast to 'any' to bypass TS7053 error ---
            const lessons: any = currentData.lessons;
            const lesson = lessons[lessonIdx];
            
            return (
              <div key={slot.id} className="p-4 flex gap-4 hover:bg-slate-50 transition-colors group">
                <div className="w-24 border-r pr-4 flex flex-col justify-center text-right">
                  <div className="font-bold text-slate-700">{slot.name}</div>
                  <div className="text-xs text-slate-400">{slot.start}-{slot.end}</div>
                </div>
                <div className="flex-1">
                  {lesson ? (
                    <>
                      <div className="flex justify-between mb-1">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                           {lesson.title}
                           <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 flex items-center gap-1 cursor-pointer hover:bg-slate-200">
                             <Download size={10} /> 下載教材
                           </span>
                        </h4>
                        <div className="flex gap-1">
                          <span className="text-[10px] px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">{lesson.stream}</span>
                          <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-700 rounded-full">+{lesson.val}</span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded inline-block w-full flex justify-between items-center">
                        {lesson.activity}
                        <FileText size={14} className="text-slate-400" />
                      </p>
                    </>
                  ) : <span className="text-slate-300 italic">--</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// 2.6 Staffing System Component
const StaffingSystem = () => {
  // State
  const [showConfig, setShowConfig] = useState(true);
  const [selectedLevels, setSelectedLevels] = useState<string[]>(['P1', 'P2', 'P3', 'P4']); 
  const [excludedTeachers, setExcludedTeachers] = useState<string[]>([]);
  const [defaultCapacity, setDefaultCapacity] = useState<number>(1);
  const [currentDay, setCurrentDay] = useState('Day 1');
  const [schedule, setSchedule] = useState<{ [day: string]: ClassAssignment[] }>({});

  // Initialize
  useEffect(() => {
    const initSchedule: { [day: string]: ClassAssignment[] } = {};
    STAFFING_DAYS.forEach(day => {
      initSchedule[day] = [];
      ALL_CLASSES.forEach(cls => {
        STAFFING_PERIODS.forEach(p => {
          initSchedule[day].push({ 
            classId: cls, 
            period: p, 
            teachers: [], 
            capacity: defaultCapacity 
          });
        });
      });
    });
    setSchedule(initSchedule);
  }, [defaultCapacity]); 

  // Logic
  const toggleSlotCapacity = (classId: string, period: number) => {
    setSchedule(prev => {
      const daySchedule = [...prev[currentDay]];
      const slotIndex = daySchedule.findIndex(s => s.classId === classId && s.period === period);
      if (slotIndex >= 0) {
        const newCap = daySchedule[slotIndex].capacity === 1 ? 2 : 1;
        daySchedule[slotIndex] = { ...daySchedule[slotIndex], capacity: newCap };
      }
      return { ...prev, [currentDay]: daySchedule };
    });
  };

  const handleAutoAssign = () => {
    if(!window.confirm(`確定執行「智能一鍵編配」嗎？\n\n系統將自動填入 ${currentDay} 的空缺。`)) return;

    const newSchedule = { ...schedule };
    const dayAssignments = newSchedule[currentDay];
    
    // Safety check
    if (!dayAssignments) return;

    let assignedCount = 0;

    const updatedAssignments = dayAssignments.map(slot => {
      const levelCode = 'P' + slot.classId.charAt(0);
      if (!selectedLevels.includes(levelCode)) return slot;

      let candidates: string[] = [];

      // A. Priority: Subject Teacher (Find in mock schedule)
      MASTER_TEACHER_LIST.forEach(teacherName => {
        if (excludedTeachers.includes(teacherName)) return; 
        
        const teacherSchedule = TEACHER_SCHEDULES[teacherName]?.[currentDay];
        if (!teacherSchedule) return;

        const teachingContent = teacherSchedule[slot.period];
        if (teachingContent && teachingContent.startsWith(slot.classId)) {
          candidates.push(teacherName);
        }
      });

      // B. Priority: Class Teacher (Always fallback to them)
      const classTeachers = CLASS_TEACHERS_MOCK[slot.classId] || [];
      const validClassTeachers = classTeachers.filter(name => !excludedTeachers.includes(name));
      validClassTeachers.forEach(ct => { if (!candidates.includes(ct)) candidates.push(ct); });

      // Fill Slot
      const currentAssigned = [...slot.teachers];
      let slotsNeeded = slot.capacity - currentAssigned.length;

      if (slotsNeeded > 0) {
        const uniqueCandidates = Array.from(new Set(candidates));
        const toAdd = uniqueCandidates.filter(c => !currentAssigned.includes(c)).slice(0, slotsNeeded);
        if (toAdd.length > 0) {
          assignedCount += toAdd.length;
          return { ...slot, teachers: [...currentAssigned, ...toAdd] };
        }
      }
      return slot;
    });

    setSchedule({ ...newSchedule, [currentDay]: updatedAssignments });
    
    // UI Feedback
    setTimeout(() => alert(`✅ 成功！\n\n已為 [${currentDay}] 自動編配了 ${assignedCount} 人次。\n請查看並手動調整剩餘空缺。`), 100);
  };

  const handleClearDay = () => {
    if(!window.confirm("確定要清空當天的所有人手編排嗎？")) return;
    const newSchedule = { ...schedule };
    newSchedule[currentDay] = newSchedule[currentDay].map(slot => ({ ...slot, teachers: [] }));
    setSchedule(newSchedule);
  };

  const toggleLevel = (lvl: string) => setSelectedLevels(prev => prev.includes(lvl) ? prev.filter(l => l !== lvl) : [...prev, lvl]);
  
  const toggleExcludedTeacher = (t: string) => setExcludedTeachers(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  // Calculations for charts
  const teacherLoad = useMemo(() => {
    const counts: {[key:string]: number} = {};
    Object.values(schedule).forEach(dayList => {
       dayList.forEach(slot => {
          slot.teachers.forEach(t => {
             counts[t] = (counts[t] || 0) + 1;
          });
       });
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a,b) => b.count - a.count)
      .slice(0, 10);
  }, [schedule]);

  return (
    <div className="h-full flex flex-col animate-fadeIn overflow-hidden">
      {/* Top Controls */}
      <div className="bg-white border-b p-4 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-4">
           <button onClick={() => setShowConfig(!showConfig)} className={`p-2 rounded-lg border ${showConfig ? 'bg-slate-800 text-white' : 'bg-white text-slate-600'}`}>
             <Settings size={20} />
           </button>
           <div className="flex bg-slate-100 p-1 rounded-lg">
             {STAFFING_DAYS.map(d => (
               <button key={d} onClick={() => setCurrentDay(d)} className={`px-4 py-1.5 text-sm font-bold rounded ${currentDay === d ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>
                 {d}
               </button>
             ))}
           </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleClearDay} className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-bold transition-colors">
            <Trash2 size={16}/> 清空
          </button>
          <button onClick={handleAutoAssign} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-md transition-all active:scale-95">
            <Cpu size={18}/> AI 智能編配
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Config Sidebar */}
        {showConfig && (
          <div className="w-64 bg-slate-50 border-r overflow-y-auto p-4 flex-shrink-0 transition-all">
             <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Filter size={16}/> 編配篩選</h3>
             
             <div className="mb-6">
               <label className="text-xs font-bold text-slate-500 mb-2 block uppercase">年級選擇</label>
               <div className="flex flex-wrap gap-2">
                 {STAFFING_LEVELS.map(lvl => (
                   <button 
                     key={lvl} 
                     onClick={() => toggleLevel(lvl)}
                     className={`px-3 py-1 text-xs rounded border ${selectedLevels.includes(lvl) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600'}`}
                   >
                     {lvl}
                   </button>
                 ))}
               </div>
             </div>

             <div className="mb-6">
               <label className="text-xs font-bold text-slate-500 mb-2 block uppercase">預設人手/班</label>
               <div className="flex items-center gap-2 bg-white p-2 rounded border">
                 <UserMinus size={16} className="text-slate-400"/>
                 <input 
                   type="range" min="1" max="2" step="1" 
                   value={defaultCapacity} onChange={(e) => setDefaultCapacity(parseInt(e.target.value))}
                   className="flex-1"
                 />
                 <span className="font-bold text-indigo-600">{defaultCapacity}</span>
               </div>
             </div>

             <div className="mb-6">
               <label className="text-xs font-bold text-slate-500 mb-2 block uppercase">排除教師 (請假/公務)</label>
               <div className="h-48 overflow-y-auto bg-white border rounded p-2 space-y-1">
                 {MASTER_TEACHER_LIST.map(t => (
                   <div key={t} onClick={() => toggleExcludedTeacher(t)} className={`flex items-center gap-2 text-sm p-1 rounded cursor-pointer ${excludedTeachers.includes(t) ? 'bg-red-50 text-red-600 line-through' : 'hover:bg-slate-50'}`}>
                     <div className={`w-3 h-3 rounded-full border ${excludedTeachers.includes(t) ? 'bg-red-500 border-red-500' : 'border-slate-300'}`}></div>
                     {t}
                   </div>
                 ))}
               </div>
             </div>

             <div className="border-t pt-4">
               <h4 className="font-bold text-xs text-slate-500 mb-2">實時工作量 Top 5</h4>
               {teacherLoad.slice(0,5).map((t, i) => (
                 <div key={t.name} className="flex justify-between text-xs mb-1">
                   <span>{i+1}. {t.name}</span>
                   <span className="font-bold">{t.count} 節</span>
                 </div>
               ))}
             </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="flex-1 overflow-auto bg-slate-100 p-4">
          <div className="min-w-[800px] bg-white rounded-lg shadow-sm border border-slate-200">
             {/* Grid Header */}
             <div className="grid grid-cols-[80px_repeat(6,1fr)] bg-slate-50 border-b sticky top-0 z-10">
               <div className="p-3 text-center text-xs font-bold text-slate-500 uppercase border-r flex items-center justify-center">班別</div>
               {STAFFING_PERIODS.map(p => (
                 <div key={p} className="p-3 text-center text-xs font-bold text-slate-700 border-r last:border-r-0">
                   第 {p} 節
                 </div>
               ))}
             </div>

             {/* Grid Body */}
             <div className="divide-y">
               {ALL_CLASSES.filter(c => selectedLevels.includes('P'+c.charAt(0))).map(cls => (
                 <div key={cls} className="grid grid-cols-[80px_repeat(6,1fr)] hover:bg-slate-50 transition-colors">
                   <div className="p-3 font-bold text-slate-700 border-r flex items-center justify-center bg-slate-50/50">
                     {cls}
                   </div>
                   {STAFFING_PERIODS.map(p => {
                     const slot = schedule[currentDay]?.find(s => s.classId === cls && s.period === p);
                     if (!slot) return <div key={p} className="border-r"></div>;
                     
                     const isFull = slot.teachers.length >= slot.capacity;
                     
                     return (
                       <div key={p} className="border-r p-2 last:border-r-0 min-h-[80px] relative group">
                         <div className="flex flex-wrap gap-1 mb-6">
                           {slot.teachers.map((t, i) => (
                             <span key={i} className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200">
                               {t}
                             </span>
                           ))}
                           {slot.teachers.length === 0 && (
                             <span className="text-xs text-slate-300 italic self-center mx-auto mt-2">-- 空缺 --</span>
                           )}
                         </div>
                         
                         {/* Controls */}
                         <div className="absolute bottom-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => toggleSlotCapacity(cls, p)} className="p-1 hover:bg-slate-200 rounded" title="切換人數上限">
                             {slot.capacity === 1 ? <Users size={12} className="text-slate-400"/> : <Users size={12} className="text-indigo-600"/>}
                           </button>
                         </div>
                       </div>
                     );
                   })}
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---
const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [level, setLevel] = useState('P1');
  const [day, setDay] = useState('Day 1');

  const navigateToSchedule = (targetDay: string) => {
    setDay(targetDay);
    setActiveTab('schedule');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Top Bar */}
      <div className="bg-slate-900 text-white h-14 flex items-center justify-between px-4 sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-4">
           {activeTab !== 'dashboard' ? (
             <button onClick={() => setActiveTab('dashboard')} className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors font-bold">
               <ChevronLeft size={20} /> 返回
             </button>
           ) : (
             <div className="flex items-center gap-2 font-bold text-lg"><Brain className="text-indigo-400"/> 正覺蓮社學校 | 課程統整週</div>
           )}
        </div>
        <div className="text-sm font-mono opacity-50">V3.0 Final</div>
      </div>

      {/* Content Area */}
      <main className="h-[calc(100vh-56px)] overflow-hidden">
        {activeTab === 'dashboard' && <Dashboard changeTab={setActiveTab} />}
        {activeTab === 'schedule' && <div className="h-full p-4"><MasterSchedule selectedLevel={level} selectedDay={day} setLevel={setLevel} setDay={setDay} /></div>}
        {activeTab === 'p2-tool' && <div className="h-full p-4 max-w-4xl mx-auto"><EBookReader /></div>}
        {activeTab === 'p3-math' && (
           <div className="h-full p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
             <MathTool />
             <OutingMap navigate={navigateToSchedule} />
           </div>
        )}
        {activeTab === 'staffing' && <StaffingSystem />}
      </main>
    </div>
  );
};

export default App;
