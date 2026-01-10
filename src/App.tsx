import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Users, 
  Brain, 
  Target, 
  Cpu, 
  Heart, 
  FileText, 
  Share2, 
  Layout, 
  CheckCircle,
  BarChart,
  Code,
  Menu,
  ChevronLeft,
  Settings,
  Filter,
  UserMinus,
  X,
  GripHorizontal,
  Trash2,
  ArrowRight,
  MapPin,
  Clock,
  BookOpen,
  Info,
  Upload,
  Cloud,
  Database
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

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, onSnapshot } from 'firebase/firestore';

// ==========================================
// SECTION 0: FIREBASE CONFIG & UTILS
// ==========================================

// 解決 TypeScript 全域變數錯誤
const getGlobalVar = (key: string) => {
  if (typeof window !== 'undefined' && (window as any)[key]) {
    return (window as any)[key];
  }
  return undefined;
};

const getFirebaseConfig = () => {
  try {
    const rawConfig = getGlobalVar('__firebase_config');
    return rawConfig ? JSON.parse(rawConfig) : {};
  } catch (e) {
    return {};
  }
};

const firebaseConfig = getFirebaseConfig();
// 防呆機制：如果沒有 config，不初始化 app 以免崩潰
const app = Object.keys(firebaseConfig).length > 0 ? initializeApp(firebaseConfig) : undefined;
const auth = app ? getAuth(app) : undefined;
const db = app ? getFirestore(app) : undefined;
const appId = getGlobalVar('__app_id') || 'default-app-id';
const initialToken = getGlobalVar('__initial_auth_token');

// Hook for Auth
const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      if (initialToken) {
        // Handle custom token
      } 
      try {
        await signInAnonymously(auth);
      } catch (e) {
        console.error("Auth failed", e);
      }
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);
  return user;
};

// ==========================================
// SECTION 1: GLOBAL DATA CONSTANTS & MOCKS
// ==========================================

const INITIAL_SCHEDULE = [
  {
    id: 1,
    day: 'Day 1',
    theme: '啟動與探索 (Discovery)',
    activities: [
      { time: '08:30 - 09:30', title: '開幕禮：未來城市設計師', level: '全校', elements: ['Communication', 'Values: 承擔精神'], skills: ['AI 認知', '好奇心'], staff: '陳主任 (統籌)' },
      { time: '10:00 - 12:00', title: '低小遊戲：情緒小偵探 (AI 表情識別)', level: 'P1-P3', elements: ['Collaboration', 'Empathy', 'Creativity'], skills: ['社交情緒', '適應性'], staff: '李老師, 張老師' }
    ]
  },
  {
    id: 2,
    day: 'Day 2',
    theme: 'STREAM 創客挑戰 (Maker)',
    activities: [
      { time: '09:00 - 12:30', title: '高小跨學科：智能家居原型製作', level: 'P4-P6', elements: ['Critical Thinking', 'Contribution', 'Creativity'], skills: ['解決複雜問題', '編程思維'], staff: 'STEM 組' }
    ]
  }
];

const FIVE_C_PLUS = [
  { code: 'Communication', label: '溝通能力', color: 'bg-blue-100 text-blue-800' },
  { code: 'Contribution', label: '貢獻', color: 'bg-green-100 text-green-800' },
  { code: 'Creativity', label: '創造力', color: 'bg-purple-100 text-purple-800' },
  { code: 'Critical Thinking', label: '批判性思考', color: 'bg-red-100 text-red-800' },
  { code: 'Collaboration', label: '協作能力', color: 'bg-yellow-100 text-yellow-800' },
  { code: 'Values', label: '+ 價值觀教育', color: 'bg-pink-100 text-pink-800' }
];

const AGILE_SKILLS = ["數位能力 (AI/Big Data)", "適應性 (Adaptability)", "好奇心 (Curiosity)", "解決複雜問題", "韌性 (Resilience)", "領導力"];

const STAFFING_LEVELS = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];
const CLASS_SUFFIXES = ['A', 'B', 'C', 'D', 'E'];
const ALL_CLASSES = STAFFING_LEVELS.flatMap(lvl => CLASS_SUFFIXES.map(s => `${lvl.replace('P','')}${s}`)); 

// ==========================================
// SECTION 2: SUB-COMPONENTS
// ==========================================

// --- 2.0 Setup Wizard ---
const SetupWizard = ({ onComplete }: any) => {
  const [selectedGrades, setSelectedGrades] = useState<string[]>(['P1', 'P2', 'P3', 'P4', 'P5', 'P6']);
  const [daysCount, setDaysCount] = useState(4);
  const [periodsCount, setPeriodsCount] = useState(6);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]); 

  const toggleGrade = (grade: string) => {
    setSelectedGrades(prev => prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade].sort());
  };

  return (
    <div className="h-screen w-full bg-slate-50 flex items-center justify-center font-sans">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 p-10 flex flex-col animate-fadeIn">
        <div className="mb-8 text-center">
          <div className="inline-block bg-indigo-100 p-4 rounded-full mb-4"><Brain size={48} className="text-indigo-600" /></div>
          <h1 className="text-3xl font-black text-slate-800 mb-2">課程指揮中心 <span className="text-indigo-600">V5.3 Stable</span></h1>
          <p className="text-slate-500">系統初始化：設定活動架構、日期與雲端同步</p>
        </div>

        <div className="grid grid-cols-2 gap-10 mb-8">
          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">參與年級</label>
              <div className="grid grid-cols-3 gap-3">
                {STAFFING_LEVELS.map(level => (
                  <button key={level} onClick={() => toggleGrade(level)} className={`py-3 rounded-lg border-2 text-sm font-bold transition-all ${selectedGrades.includes(level) ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-white text-slate-400 hover:bg-slate-50'}`}>
                    {level}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
               <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block flex items-center gap-2"><Calendar size={14}/> 活動開始日期</label>
               <input 
                 type="date" 
                 value={startDate} 
                 onChange={(e) => setStartDate(e.target.value)} 
                 className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 text-slate-700 font-bold outline-none focus:border-indigo-600 focus:bg-indigo-50 transition-colors"
               />
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                <div className="mb-6">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block flex items-center gap-2"><Clock size={14}/> 活動日數 (Days)</label>
                  <input type="range" min="1" max="5" value={daysCount} onChange={(e) => setDaysCount(parseInt(e.target.value))} className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mb-2"/>
                  <div className="flex justify-between text-xs text-slate-500 font-mono"><span>1</span><span className="text-indigo-600 font-bold text-lg">{daysCount} Days</span><span>5</span></div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block flex items-center gap-2"><Clock size={14}/> 每日堂數 (Periods)</label>
                  <input type="range" min="4" max="9" value={periodsCount} onChange={(e) => setPeriodsCount(parseInt(e.target.value))} className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mb-2"/>
                  <div className="flex justify-between text-xs text-slate-500 font-mono"><span>4</span><span className="text-indigo-600 font-bold text-lg">{periodsCount} Periods</span><span>9</span></div>
                </div>
            </div>
            
            <div className="flex items-center gap-3 text-xs text-slate-400 bg-yellow-50 p-3 rounded border border-yellow-100">
               <Database size={16} className="text-yellow-600"/>
               <span>資料將自動同步至雲端資料庫 (Firestore)</span>
            </div>
          </div>
        </div>

        <button onClick={() => onComplete({ selectedGrades, daysCount, periodsCount, startDate })} disabled={selectedGrades.length === 0} className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${selectedGrades.length > 0 ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
          啟動指揮中心 <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

// --- AiDesignView ---
const AiDesignView = () => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const handleAiGenerate = () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    setTimeout(() => {
      setAiResponse(`【AI 建議方案】\n針對：「${aiPrompt}」\n活動：AR 綠色尋寶\n5C+：協作、慎思明辨\nAGILE：數位適應性`);
      setIsGenerating(false);
    }, 1000);
  };
  return (
    <div className="h-full p-6 flex flex-col bg-slate-50">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col p-6">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-indigo-800"><Brain /> AI 課程設計顧問</h2>
        <div className="flex-1 bg-slate-50 rounded-lg p-4 mb-4 overflow-y-auto border border-slate-100">
          {aiResponse ? <pre className="whitespace-pre-wrap text-slate-700">{aiResponse}</pre> : <div className="text-slate-400 text-center mt-20">請輸入課程主題...</div>}
        </div>
        <div className="flex gap-2">
          <input type="text" placeholder="輸入指令..." className="flex-1 border rounded-lg px-4 py-2" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} />
          <button onClick={handleAiGenerate} disabled={isGenerating} className="bg-indigo-600 text-white px-6 py-2 rounded-lg">{isGenerating ? '...' : '生成'}</button>
        </div>
      </div>
    </div>
  );
};

// --- Dashboard View ---
const DashboardView = ({ config }: any) => {
  const today = new Date();
  const start = new Date(config.startDate);
  // TypeScript Fix: Cast to number for arithmetic
  const diffTime = start.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  const countdownText = diffDays > 0 ? `${diffDays} 天` : (diffDays === 0 ? "今天！" : "已開始");
  const countdownColor = diffDays <= 3 ? "text-red-500" : "text-white";

  return (
    <div className="h-full overflow-y-auto p-8 bg-slate-50">
      <div className="max-w-[1600px] mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-gray-500 text-sm font-semibold mb-4 flex items-center gap-2"><Target size={16}/> 5C+ 核心元素</h3>
            <div className="space-y-3">{FIVE_C_PLUS.map(item => (<div key={item.code} className="flex justify-between text-sm"><span className="text-slate-600">{item.label}</span><div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full ${item.color.split(' ')[0].replace('bg-', 'bg-')}`} style={{width: '60%'}}></div></div></div>))}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-gray-500 text-sm font-semibold mb-4 flex items-center gap-2"><Cpu size={16}/> AGILE 技能</h3>
            <div className="flex flex-wrap gap-2">{AGILE_SKILLS.map(skill => (<span key={skill} className="px-3 py-1 bg-cyan-50 text-cyan-700 text-xs rounded-lg border border-cyan-100">{skill}</span>))}</div>
          </div>
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-2xl shadow-xl text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div>
              <h3 className="font-semibold opacity-90 flex items-center gap-2"><Clock size={18}/> 活動倒數計時</h3>
              <p className="text-sm opacity-80 mt-1">目標日期: {config.startDate}</p>
            </div>
            <div className="mt-4">
              <p className={`text-6xl font-black tracking-tighter ${countdownColor}`}>{countdownText}</p>
              <p className="text-sm opacity-90 mt-2 font-bold tracking-wide uppercase">Ready to Launch</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Calendar className="text-indigo-600" /> 課程統整周流程</h3></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{INITIAL_SCHEDULE.map(day => (<div key={day.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100"><h4 className="font-bold text-slate-800">{day.day}</h4><p className="text-sm text-indigo-600 mb-2">{day.theme}</p><ul className="space-y-1">{day.activities.map((act,i)=><li key={i} className="text-xs text-slate-500 truncate">• {act.title}</li>)}</ul></div>))}</div>
        </div>
      </div>
    </div>
  );
};

// --- Venue System ---
const VenueAllocationSystem = ({ config, activeDay }: any) => {
  const VENUES = ['禮堂', '雨天操場'];
  const [schedule, setSchedule] = useState<any>({});
  const [draggedClass, setDraggedClass] = useState<any>(null);

  useEffect(() => {
    setSchedule((prev: any) => {
      const newSched = { ...prev };
      for (let d = 1; d <= config.daysCount; d++) {
        const dayKey = `Day ${d}`;
        if (!newSched[dayKey]) {
          newSched[dayKey] = {};
          VENUES.forEach(v => {
            newSched[dayKey][v] = {};
            for (let p = 1; p <= config.periodsCount; p++) newSched[dayKey][v][p] = [];
          });
        }
      }
      return newSched;
    });
  }, [config]);

  const handleDragStart = (e: any, classId: string) => { setDraggedClass(classId); e.dataTransfer.effectAllowed = "copy"; };
  
  const handleDrop = (e: any, venue: string, period: number) => {
    e.preventDefault();
    if (!draggedClass) return;
    const dayKey = activeDay;
    setSchedule((prev: any) => {
      if (!prev[dayKey]) return prev;
      const newDaySched = { ...prev[dayKey] };
      const currentList = newDaySched[venue]?.[period] || [];
      if (!currentList.includes(draggedClass)) { newDaySched[venue][period] = [...currentList, draggedClass]; }
      return { ...prev, [dayKey]: newDaySched };
    });
    setDraggedClass(null);
  };

  const handleRemoveClass = (venue: string, period: number, classId: string) => {
    const dayKey = activeDay;
    setSchedule((prev: any) => {
      if (!prev[dayKey]) return prev;
      const newDaySched = { ...prev[dayKey] };
      newDaySched[venue][period] = newDaySched[venue][period].filter((c: string) => c !== classId);
      return { ...prev, [dayKey]: newDaySched };
    });
  };

  const availableClasses = ALL_CLASSES.filter(c => config.selectedGrades.includes('P'+c.charAt(0)));

  return (
    <div className="flex h-full bg-slate-50">
      <div className="w-48 bg-white border-r p-4 overflow-y-auto flex-shrink-0">
        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Users size={18}/> 班級列表</h3>
        <div className="space-y-2">
          {availableClasses.map(cls => (
            <div key={cls} draggable onDragStart={(e) => handleDragStart(e, cls)} className="bg-white border border-slate-200 p-2 rounded shadow-sm cursor-grab active:cursor-grabbing hover:border-indigo-400 hover:text-indigo-600 transition-colors text-center font-bold text-slate-600">{cls}</div>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-w-[800px]">
          {VENUES.map(venue => (
            <div key={venue} className="mb-8 last:mb-0">
              <div className="bg-slate-100 p-3 border-b border-slate-200 font-bold text-slate-700 flex items-center gap-2 sticky top-0"><MapPin size={18} className="text-indigo-600"/> {venue}</div>
              <div className="grid" style={{ gridTemplateColumns: `repeat(${config.periodsCount}, 1fr)` }}>
                {Array.from({ length: config.periodsCount }, (_, i) => i + 1).map(p => (
                  <div key={p} className="border-r border-b border-slate-200 min-h-[120px] p-2 bg-slate-50/30" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, venue, p)}>
                    <div className="text-xs font-bold text-slate-400 mb-2 text-center">第 {p} 節</div>
                    <div className="flex flex-wrap gap-1">
                      {schedule[activeDay]?.[venue]?.[p]?.map((cls: string) => (
                        <div key={cls} className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">{cls}<button onClick={() => handleRemoveClass(venue, p, cls)} className="hover:text-red-500"><X size={10}/></button></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Staffing System ---
const StaffingSystem = ({ config, activeDay, setActiveDay, user }: any) => {
  const [showConfig, setShowConfig] = useState(true);
  const [defaultCapacity, setDefaultCapacity] = useState(2); 
  const [schedule, setSchedule] = useState<any>({});
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [draggedTeacher, setDraggedTeacher] = useState<any>(null);
  const [selectedClassInfo, setSelectedClassInfo] = useState<any>(null);
  
  // Real Teacher Data State
  const [teacherList, setTeacherList] = useState<any[]>([]); 
  const [teacherOriginalLoads, setTeacherOriginalLoads] = useState<any>({});
  const [teacherSubjects, setTeacherSubjects] = useState<any>({});
  const [classTeacherInfo, setClassTeacherInfo] = useState<any>({});
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Mock Data Generators for fallback
  const TEACHER_NAMES = ['陳大文', '李小美', '張志強', '黃雅婷', '林國華'];
  const MASTER_TEACHER_LIST_MOCK = [...TEACHER_NAMES].sort();

  // Firestore Sync - Load Data
  useEffect(() => {
    if (!user || !db) return;
    try {
      const unsub = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'teacher_list'), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.teacherList && data.teacherList.length > 0) {
            console.log("Loaded teacher data from cloud");
            setTeacherList(data.teacherList);
            setTeacherOriginalLoads(data.teacherOriginalLoads || {});
            setTeacherSubjects(data.teacherSubjects || {});
            setClassTeacherInfo(data.classTeacherInfo || {});
            setIsDataLoaded(true);
          }
        }
      });
      return () => unsub();
    } catch(err) {
      console.error("Firestore Error", err);
    }
  }, [user]);

  // CSV Parsing Logic
  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      
      const newTeacherList: any[] = [];
      const newSubjects: any = {};
      const newLoads: any = {};
      const newClassInfo: any = {};

      ALL_CLASSES.forEach(cls => newClassInfo[cls] = { head: '待定', subjects: [] });

      for (let i = 2; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim());
        const name = cols[1];
        
        if (!name) continue; 

        newTeacherList.push(name);
        if (!newSubjects[name]) newSubjects[name] = [];
        newLoads[name] = {};

        let dailyLoadCount: any = {};

        for (let j = 3; j < cols.length; j++) {
          const content = cols[j];
          if (content) {
            const parts = content.split(' ');
            if (parts.length >= 2) {
              const cls = parts[0];
              const subj = parts[1];
              
              if (!newSubjects[name].includes(subj)) newSubjects[name].push(subj);

              if (newClassInfo[cls]) {
                newClassInfo[cls].subjects.push({ subject: subj, teacher: name });
                if (newClassInfo[cls].head === '待定') newClassInfo[cls].head = name; 
              }

              const periodsPerDayInCSV = 9; 
              const dayIndex = Math.floor((j - 3) / periodsPerDayInCSV) + 1;
              const dayKey = `Day ${dayIndex}`;
              dailyLoadCount[dayKey] = (dailyLoadCount[dayKey] || 0) + 1;
            }
          }
        }
        newLoads[name] = dailyLoadCount;
      }

      const sortedTeachers = newTeacherList.sort();
      setTeacherList(sortedTeachers);
      setTeacherSubjects(newSubjects);
      setTeacherOriginalLoads(newLoads);
      setClassTeacherInfo(newClassInfo);
      setIsDataLoaded(true);

      if (user && db) {
        try {
          await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'teacher_list'), {
            teacherList: sortedTeachers,
            teacherSubjects: newSubjects,
            teacherOriginalLoads: newLoads,
            classTeacherInfo: newClassInfo,
            updatedAt: new Date().toISOString()
          });
          alert(`成功匯入 ${sortedTeachers.length} 位教師資料並儲存至雲端！`);
        } catch (err) {
          console.error("Cloud save failed:", err);
          alert("雲端儲存失敗，僅更新本地顯示。");
        }
      }
    };
    reader.readAsText(file);
  };

  const activeTeacherList = isDataLoaded ? teacherList : MASTER_TEACHER_LIST_MOCK; 
  
  useEffect(() => {
    setSchedule((prev: any) => {
      const nextSchedule = { ...prev };
      for (let d = 1; d <= config.daysCount; d++) {
        const dayKey = `Day ${d}`;
        if (!nextSchedule[dayKey]) {
          nextSchedule[dayKey] = [];
          ALL_CLASSES.filter(c => config.selectedGrades.includes('P'+c.charAt(0))).forEach(cls => {
            for (let p = 1; p <= config.periodsCount; p++) {
              nextSchedule[dayKey].push({ classId: cls, period: p, teachers: [], capacity: defaultCapacity });
            }
          });
        }
      }
      return nextSchedule;
    });
  }, [config, defaultCapacity]);

  const toggleSlotCapacity = (classId: string, period: number) => {
    setSchedule((prev: any) => {
      const daySchedule = [...(prev[activeDay] || [])];
      const slotIndex = daySchedule.findIndex((s: any) => s.classId === classId && s.period === period);
      if (slotIndex >= 0) {
        const newCap = daySchedule[slotIndex].capacity === 1 ? 2 : 1;
        daySchedule[slotIndex] = { ...daySchedule[slotIndex], capacity: newCap };
      }
      return { ...prev, [activeDay]: daySchedule };
    });
  };

  const handleCellClick = (classId: string) => {
    const info = classTeacherInfo[classId] || { head: 'N/A', subjects: [] };
    setSelectedClassInfo({ id: classId, info });
  };

  const handleAutoAssign = () => {
    if (!isDataLoaded) { 
      if(!window.confirm("尚未上載 CSV，將使用模擬數據進行演示。是否繼續？")) return;
    }
    
    const daySchedule = schedule[activeDay] || [];
    const totalSlotsNeeded = daySchedule.reduce((acc: any, slot: any) => acc + slot.capacity, 0);
    const totalTeachers = activeTeacherList.length;
    const baselineLoad = Math.ceil(totalSlotsNeeded / totalTeachers) || 1;

    if(!window.confirm(`智能編配 (V5.2)\n\n當日人次: ${totalSlotsNeeded}\n可用教師: ${totalTeachers}\n基準線: ~${baselineLoad} 節/人`)) return;

    const newSchedule = { ...schedule };
    const dayAssignments = [...(newSchedule[activeDay] || [])];
    
    const currentLoad: any = {};
    activeTeacherList.forEach(t => currentLoad[t] = 0);
    dayAssignments.forEach((slot: any) => slot.teachers.forEach((t: any) => currentLoad[t] = (currentLoad[t]||0) + 1));

    dayAssignments.forEach((slot: any) => {
      const needed = slot.capacity - slot.teachers.length;
      if (needed <= 0) return;

      let candidates = activeTeacherList.map(tName => {
        if (slot.teachers.includes(tName)) return null;
        const isBusy = dayAssignments.some((s: any) => s.period === slot.period && s.teachers.includes(tName));
        if (isBusy) return null;

        let score = 100;
        if (currentLoad[tName] >= baselineLoad) score -= 50;
        
        const tInfo = classTeacherInfo[slot.classId];
        if (tInfo) {
          if (tInfo.head === tName) score += 30;
          if (tInfo.subjects.some((s: any) => s.teacher === tName)) score += 15;
        }

        return { name: tName, score };
      }).filter(Boolean) as {name: string, score: number}[];

      candidates.sort((a, b) => b.score - a.score);
      const toAdd = candidates.slice(0, needed).map(c => c.name);
      
      toAdd.forEach(t => currentLoad[t]++);
      slot.teachers = [...slot.teachers, ...toAdd];
    });
    setSchedule({ ...newSchedule, [activeDay]: dayAssignments });
  };

  const handleDragStart = (e: any, name: string, classId: string, period: number) => { setDraggedTeacher({ name, fromClass: classId, fromPeriod: period }); e.dataTransfer.effectAllowed = "move"; };
  const handleDragOver = (e: any) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };
  
  const handleDrop = (e: any, targetClassId: string, targetPeriod: number) => {
    e.preventDefault();
    if (!draggedTeacher) return;
    const { name, fromClass, fromPeriod } = draggedTeacher;
    if (fromClass === targetClassId && fromPeriod === targetPeriod) return;
    setSchedule((prev: any) => {
      const dayAssignments = [...(prev[activeDay] || [])];
      const sourceSlotIdx = dayAssignments.findIndex((s: any) => s.classId === fromClass && s.period === fromPeriod);
      if (sourceSlotIdx >= 0) dayAssignments[sourceSlotIdx] = { ...dayAssignments[sourceSlotIdx], teachers: dayAssignments[sourceSlotIdx].teachers.filter((t: string) => t !== name) };
      const targetSlotIdx = dayAssignments.findIndex((s: any) => s.classId === targetClassId && s.period === targetPeriod);
      if (targetSlotIdx >= 0 && !dayAssignments[targetSlotIdx].teachers.includes(name)) {
         dayAssignments[targetSlotIdx] = { ...dayAssignments[targetSlotIdx], teachers: [...dayAssignments[targetSlotIdx].teachers, name] };
      }
      return { ...prev, [activeDay]: dayAssignments };
    });
    setDraggedTeacher(null);
  };
  const handleRemoveDrop = (e: any) => {
    e.preventDefault();
    if (!draggedTeacher) return;
    const { name, fromClass, fromPeriod } = draggedTeacher;
    setSchedule((prev: any) => {
      const dayAssignments = [...(prev[activeDay] || [])];
      const sourceSlotIdx = dayAssignments.findIndex((s: any) => s.classId === fromClass && s.period === fromPeriod);
      if (sourceSlotIdx >= 0) dayAssignments[sourceSlotIdx] = { ...dayAssignments[sourceSlotIdx], teachers: dayAssignments[sourceSlotIdx].teachers.filter((t: string) => t !== name) };
      return { ...prev, [activeDay]: dayAssignments };
    });
    setDraggedTeacher(null);
  };

  const statsData = useMemo(() => {
    const data: any[] = [];
    const currentAssignments = schedule[activeDay] || [];
    const totalSlots = currentAssignments.reduce((acc: any, slot: any) => acc + slot.capacity, 0);
    const totalT = activeTeacherList.length || 1;
    const baseline = Math.ceil(totalSlots / totalT);

    activeTeacherList.forEach(tName => {
      let current = 0;
      currentAssignments.forEach((slot: any) => { if (slot.teachers.includes(tName)) current++; });
      if (current > 0) data.push({ name: tName, current, baseline });
    });
    return data.sort((a, b) => b.current - a.current);
  }, [schedule, activeDay, activeTeacherList]);

  const handleClearDay = () => {
    if(!window.confirm("確定清空？")) return;
    setSchedule((prev: any) => ({ ...prev, [activeDay]: prev[activeDay].map((slot: any) => ({ ...slot, teachers: [] })) }));
  };

  const filteredClasses = ALL_CLASSES.filter(c => config.selectedGrades.includes('P'+c.charAt(0)));

  return (
    <div className="h-full flex flex-col bg-slate-50 relative overflow-hidden">
      {/* Top Controls */}
      <div className="bg-white border-b px-6 py-3 flex justify-between items-center shadow-sm z-20 flex-shrink-0">
        <div className="flex items-center gap-4">
           <button onClick={() => setShowConfig(!showConfig)} className={`p-2 rounded-lg border transition-colors ${showConfig ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 hover:bg-slate-100'}`}><Settings size={20} /></button>
           <div className="flex bg-slate-100 p-1 rounded-lg">
             {Array.from({length: config.daysCount}, (_, i) => `Day ${i+1}`).map((d: any) => (
               <button key={d} onClick={() => setActiveDay(d)} className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${activeDay === d ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>{d}</button>
             ))}
           </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowStatsModal(true)} className="flex items-center gap-2 px-4 py-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-sm font-bold"><BarChart size={18}/> 統計</button>
          <button onClick={handleAutoAssign} className={`flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg text-sm font-bold hover:shadow-lg transition-all active:scale-95`}><Cpu size={18}/> 智能編配</button>
          <button onClick={handleClearDay} className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-bold"><Trash2 size={18}/> 清空</button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        {showConfig && (
          <div className="w-72 bg-white border-r flex-shrink-0 shadow-lg z-10 flex flex-col h-full">
              <div className="flex-1 overflow-y-auto p-5">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><Filter size={20} className="text-indigo-500"/> 設定與資料</h3>
                
                {/* CSV Upload Section */}
                <div className="mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                  <label className="text-xs font-bold text-indigo-700 mb-2 block flex items-center gap-2 uppercase tracking-wider"><Upload size={14}/> 匯入教師資料 (CSV)</label>
                  <input type="file" accept=".csv" onChange={handleFileUpload} className="block w-full text-xs text-slate-500 file:mr-2 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"/>
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-indigo-600 font-bold">
                    {isDataLoaded ? <><CheckCircle size={12}/> 資料已載入: {activeTeacherList.length} 位教師</> : <span className="text-slate-400">請上載 "總教師時間表.csv"</span>}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="text-xs font-bold text-slate-400 mb-3 block uppercase tracking-wider">預設人手 (Capacity)</label>
                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <UserMinus size={18} className="text-slate-400"/>
                    <input type="range" min="1" max="4" step="1" value={defaultCapacity} onChange={(e) => setDefaultCapacity(parseInt(e.target.value))} className="flex-1 accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"/>
                    <span className="font-bold text-indigo-600 text-lg w-6 text-center">{defaultCapacity}</span>
                  </div>
                </div>

                <div onDragOver={handleDragOver} onDrop={handleRemoveDrop} className="border-2 border-dashed border-red-200 bg-red-50 rounded-xl p-4 flex flex-col items-center justify-center text-red-400 transition-colors cursor-default mb-6">
                  <Trash2 size={24} className="mb-2"/>
                  <span className="text-xs font-bold">拖曳至此移除老師</span>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2"><BookOpen size={14}/> 班級師資資訊</h4>
                  {selectedClassInfo ? (
                    <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 animate-fadeIn">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl font-black text-indigo-800">{selectedClassInfo.id}</span>
                        <span className="text-xs bg-white px-2 py-1 rounded border border-indigo-200 text-indigo-600 font-bold">班主任: {selectedClassInfo.info.head}</span>
                      </div>
                      <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                        {selectedClassInfo.info.subjects.map((s: any, i: number) => (
                          <div key={i} className="flex justify-between text-xs border-b border-indigo-100 last:border-0 py-1">
                            <span className="text-slate-500">{s.subject}</span>
                            <span className="font-bold text-slate-700">{s.teacher}</span>
                          </div>
                        ))}
                        {selectedClassInfo.info.subjects.length === 0 && <span className="text-xs text-slate-400 italic">暫無資料</span>}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-slate-400 text-xs py-4 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      點擊右側課節<br/>查看該班任教老師
                    </div>
                  )}
                </div>
             </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="flex-1 overflow-auto bg-slate-100/50 p-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-w-[1000px]"> 
             <div className="grid bg-slate-50/80 backdrop-blur border-b sticky top-0 z-10" style={{ gridTemplateColumns: `80px repeat(${config.periodsCount}, 1fr)` }}>
               <div className="p-4 text-center text-xs font-bold text-slate-500 uppercase border-r flex items-center justify-center">班別</div>
               {Array.from({length: config.periodsCount}, (_, i) => i+1).map(p => (
                 <div key={p} className="p-4 text-center border-r last:border-r-0"><div className="text-xs font-bold text-slate-500 mb-1">第 {p} 節</div></div>
               ))}
             </div>
             <div className="divide-y divide-slate-100">
               {filteredClasses.map(cls => (
                 <div key={cls} className="grid hover:bg-slate-50/50 transition-colors group/row" style={{ gridTemplateColumns: `80px repeat(${config.periodsCount}, 1fr)` }}>
                   <div className="p-2 font-bold text-slate-700 border-r flex items-center justify-center bg-slate-50/30 text-lg">{cls}</div>
                   {Array.from({length: config.periodsCount}, (_, i) => i+1).map(p => {
                     const slot = schedule[activeDay]?.find((s: any) => s.classId === cls && s.period === p);
                     if (!slot) return <div key={p} className="border-r bg-slate-50/20"></div>;
                     return (
                       <div 
                         key={p} 
                         className={`border-r p-1 last:border-r-0 min-h-[80px] relative transition-all cursor-pointer ${selectedClassInfo?.id === cls ? 'bg-indigo-50/20' : ''}`}
                         onClick={() => handleCellClick(cls)} 
                         onDragOver={handleDragOver} 
                         onDrop={(e) => handleDrop(e, cls, p)}
                       >
                         <div className="flex flex-wrap gap-1 content-start h-full pb-6">
                           {slot.teachers.map((t: string, i: number) => (
                             <div key={i} draggable onDragStart={(e) => handleDragStart(e, t, cls, p)} className="cursor-grab active:cursor-grabbing flex items-center gap-1.5 text-xs bg-white text-slate-700 pl-2 pr-1 py-1 rounded-md border border-slate-200 shadow-sm hover:shadow hover:border-indigo-300 hover:text-indigo-600 transition-all select-none">
                               <span className="font-bold">{t}</span><GripHorizontal size={12} className="text-slate-300" />
                             </div>
                           ))}
                         </div>
                         <div className="absolute bottom-0.5 right-0.5 flex gap-1">
                           <button onClick={(e) => {e.stopPropagation(); toggleSlotCapacity(cls, p)}} className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-100/80 hover:bg-slate-200 rounded text-[9px] text-slate-500 font-bold transition-colors border border-slate-200">目標: {slot.capacity}</button>
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

      {showStatsModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-6 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden animate-scaleIn">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <div><h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3"><BarChart className="text-indigo-600" /> 人手編配統計 (V5 基準)</h2></div>
              <button onClick={() => setShowStatsModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={24} className="text-slate-500" /></button>
            </div>
            <div className="flex-1 p-8 overflow-hidden flex flex-col">
              <div className="flex-1 min-h-0 border border-slate-100 rounded-xl bg-slate-50/50 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartBar data={statsData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }} barGap={0}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} tick={{fontSize: 12, fill: '#64748b'}} height={60}/>
                    <YAxis tick={{fontSize: 12, fill: '#64748b'}} />
                    <Tooltip cursor={{fill: 'rgba(99, 102, 241, 0.05)'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}/>
                    <Legend verticalAlign="top" height={36}/>
                    <Bar dataKey="baseline" name="智能基準線 (Baseline)" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="current" name="現時編配 (Current)" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={20}>
                       {statsData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.current > entry.baseline + 2 ? '#ef4444' : '#4f46e5'} />))}
                    </Bar>
                  </RechartBar>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- 3.0 Main App ---
const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // System State
  const [isSystemStarted, setIsSystemStarted] = useState(false);
  const [sysConfig, setSysConfig] = useState<any>(null);
  const [activeDay, setActiveDay] = useState('Day 1');
  
  // Auth State
  const user = useAuth();

  const handleWizardComplete = (config: any) => {
    setSysConfig(config);
    setIsSystemStarted(true);
  };

  if (!isSystemStarted) {
    return <SetupWizard onComplete={handleWizardComplete} />;
  }

  return (
    <div className="h-screen bg-slate-50 font-sans text-slate-900 flex overflow-hidden">
      <nav className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-white border-r flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden flex flex-col relative z-30`}>
        <div className="p-4 border-b flex items-center gap-2 bg-indigo-900 text-white h-16">
          <Brain className="flex-shrink-0" />
          <span className="font-bold truncate">課程指揮中心</span>
        </div>
        <div className="flex-1 overflow-y-auto py-4 space-y-1">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-slate-50 text-slate-600 transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600' : ''}`}><Layout size={20} /><span className="truncate">總覽儀表板</span></button>
          <button onClick={() => setActiveTab('staff')} className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-slate-50 text-slate-600 transition-colors ${activeTab === 'staff' ? 'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600' : ''}`}><Users size={20} /><span className="truncate">人手分配</span></button>
          <button onClick={() => setActiveTab('venue')} className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-slate-50 text-slate-600 transition-colors ${activeTab === 'venue' ? 'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600' : ''}`}><MapPin size={20} /><span className="truncate">地點分配</span></button>
          <button onClick={() => setActiveTab('ai-design')} className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-slate-50 text-slate-600 transition-colors ${activeTab === 'ai-design' ? 'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600' : ''}`}><Cpu size={20} /><span className="truncate">AI 課程設計</span></button>
        </div>
        <div className="p-4 border-t text-xs text-slate-400 text-center flex flex-col items-center gap-1">
          <span>V5.3 Stable</span>
          <span className={`flex items-center gap-1 ${user ? 'text-green-500' : 'text-slate-300'}`}>
            <Cloud size={10} /> {user ? 'Online' : 'Offline'}
          </span>
        </div>
      </nav>

      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <header className="bg-white h-16 border-b px-4 flex items-center justify-between shadow-sm z-20 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
              {isSidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="text-lg font-bold text-slate-800 truncate">
              {activeTab === 'dashboard' && '總覽儀表板'}
              {activeTab === 'staff' && '智能人手編配系統'}
              {activeTab === 'venue' && `地點與場地分配 (${activeDay})`}
              {activeTab === 'ai-design' && 'AI 課程設計助手'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-1 rounded-lg flex items-center">
               <span className="text-xs font-bold text-slate-400 px-2 uppercase">Global Day:</span>
               <select value={activeDay} onChange={(e) => setActiveDay(e.target.value)} className="bg-transparent text-sm font-bold text-indigo-700 outline-none">
                 {Array.from({length: sysConfig.daysCount}, (_, i) => `Day ${i+1}`).map((d: any) => <option key={d} value={d}>{d}</option>)}
               </select>
            </div>
            <div className="w-8 h-8 bg-indigo-900 rounded-full flex items-center justify-center text-white text-xs font-bold">陳</div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative bg-slate-50">
          {activeTab === 'dashboard' && <DashboardView config={sysConfig} />}
          {activeTab === 'staff' && <StaffingSystem config={sysConfig} activeDay={activeDay} setActiveDay={setActiveDay} user={user} />}
          {activeTab === 'venue' && <VenueAllocationSystem config={sysConfig} activeDay={activeDay} />}
          {activeTab === 'ai-design' && <AiDesignView />}
        </div>
      </div>
    </div>
  );
};

export default App;