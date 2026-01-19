import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Database,
  Save,
  Download,
  AlertTriangle,
  RefreshCw,
  Calculator,
  Briefcase,
  UserX,
  Layers,
  Undo2,
  Eye,
  EyeOff
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

// Firebase Imports (Safe)
// @ts-ignore
import { initializeApp, getApps, getApp } from 'firebase/app';
// @ts-ignore
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
// @ts-ignore
import { getFirestore, doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';

// ==========================================
// SECTION 0: SAFETY & CONFIG
// ==========================================

class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("Critical Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-red-50 text-red-900 p-8">
          <AlertTriangle size={64} className="mb-4 text-red-600" />
          <h1 className="text-3xl font-bold mb-2">系統發生錯誤</h1>
          <p className="mb-6 opacity-80">請嘗試重新整理頁面，或聯絡技術支援。</p>
          <div className="bg-white p-4 rounded border border-red-200 font-mono text-xs overflow-auto max-w-2xl w-full mb-6">
            {this.state.error?.toString()}
          </div>
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold flex items-center gap-2">
            <RefreshCw size={18} /> 重新啟動系統
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

let app: any = null;
let auth: any = null;
let db: any = null;
let isFirebaseReady = false;

const firebaseConfig = {
  apiKey: "AIzaSyAvl1XfKbQvVueXHAjv6bjUnvJmRMEp3UM",
  authDomain: "curriculum-manager01.firebaseapp.com",
  projectId: "curriculum-manager01",
  storageBucket: "curriculum-manager01.firebasestorage.app",
  messagingSenderId: "949862664220",
  appId: "1:949862664220:web:bb114560a402f0911c77d9"
};

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
  db = getFirestore(app);
  isFirebaseReady = true;
  console.log("Firebase initialized successfully.");
} catch (e) {
  console.warn("Firebase Init Error (Offline Mode Active):", e);
}

const appId = 'curriculum-manager-v5'; 

const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    if (!isFirebaseReady || !auth) return;
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (e) {
        console.error("Auth error:", e);
      }
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);
  return user;
};

// ==========================================
// SECTION 1: CONSTANTS & UTILS
// ==========================================

const SUBJECT_ORDER = ['中文', '英文', '數學', '常識', '科學', '人文', '視藝', '音樂', '體育', '普通話', '科技', '綜合課', '導修'];

const sortSubjects = (subjects: any[]) => {
  const unique = subjects.filter((v, i, a) => a.findIndex(t => (t.subject === v.subject && t.teacher === v.teacher)) === i);
  return unique.sort((a, b) => {
    const idxA = SUBJECT_ORDER.findIndex(k => a.subject.includes(k));
    const idxB = SUBJECT_ORDER.findIndex(k => b.subject.includes(k));
    const rankA = idxA === -1 ? 999 : idxA;
    const rankB = idxB === -1 ? 999 : idxB;
    return rankA - rankB;
  });
};

const INITIAL_SCHEDULE = [
  {
    id: 1, day: 'Day 1', theme: '啟動與探索 (Discovery)',
    activities: [{ time: '08:30', title: '開幕禮', level: '全校', elements: ['Communication'], skills: ['AI 認知'], staff: '陳主任' }]
  },
  {
    id: 2, day: 'Day 2', theme: 'STREAM 創客挑戰',
    activities: [{ time: '09:00', title: '智能家居製作', level: 'P4-P6', elements: ['Critical Thinking'], skills: ['解決問題'], staff: 'STEM 組' }]
  }
];

const FIVE_C_PLUS = [
  { code: 'Communication', label: '溝通', color: 'bg-blue-100 text-blue-800' },
  { code: 'Contribution', label: '貢獻', color: 'bg-green-100 text-green-800' },
  { code: 'Creativity', label: '創意', color: 'bg-purple-100 text-purple-800' },
  { code: 'Critical Thinking', label: '慎思', color: 'bg-red-100 text-red-800' },
  { code: 'Collaboration', label: '協作', color: 'bg-yellow-100 text-yellow-800' },
  { code: 'Values', label: '價值', color: 'bg-pink-100 text-pink-800' }
];

const AGILE_SKILLS = ["AI數位", "適應性", "好奇心", "解難", "韌性", "領導力"];
const STAFFING_LEVELS = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];
const CLASS_SUFFIXES = ['A', 'B', 'C', 'D', 'E'];
const ALL_CLASSES = STAFFING_LEVELS.flatMap(lvl => CLASS_SUFFIXES.map(s => `${lvl.replace('P','')}${s}`))
  .filter(cls => cls !== '1E' && cls !== '3E');

// ==========================================
// SECTION 2: COMPONENTS
// ==========================================

const SetupWizard = ({ onComplete }: { onComplete: (config: any) => void }) => {
  const [selectedGrades, setSelectedGrades] = useState<string[]>(['P1', 'P2', 'P3', 'P4', 'P5', 'P6']);
  const [daysCount, setDaysCount] = useState(4);
  const [periodsCount, setPeriodsCount] = useState(6);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]); 

  const toggleGrade = (grade: string) => {
    setSelectedGrades(prev => prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade].sort());
  };

  return (
    <div className="h-screen w-full bg-slate-50 flex items-center justify-center font-sans p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 p-8 md:p-12 flex flex-col animate-fadeIn">
        <div className="mb-10 text-center">
          <div className="inline-block bg-indigo-600 p-4 rounded-2xl mb-4 shadow-lg shadow-indigo-200"><Brain size={48} className="text-white" /></div>
          <h1 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">課程指揮中心 <span className="text-indigo-600">V6.6</span></h1>
          <p className="text-slate-500 font-medium">Smart Pool Sync • Undo Function • Cloud Deep</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10">
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
               <input type="date" value={startDate} onChange={(e: any) => setStartDate(e.target.value)} className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 text-slate-700 font-bold outline-none focus:border-indigo-600 focus:bg-indigo-50 transition-colors"/>
            </div>
          </div>
          <div className="space-y-8">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <div className="mb-6">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block flex items-center gap-2"><Clock size={14}/> 活動日數</label>
                  <div className="flex items-center gap-4">
                    <input type="range" min="1" max="5" value={daysCount} onChange={(e: any) => setDaysCount(parseInt(e.target.value))} className="flex-1 accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"/>
                    <span className="text-2xl font-black text-indigo-600 w-12 text-center">{daysCount}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block flex items-center gap-2"><Clock size={14}/> 每日堂數</label>
                  <div className="flex items-center gap-4">
                    <input type="range" min="4" max="9" value={periodsCount} onChange={(e: any) => setPeriodsCount(parseInt(e.target.value))} className="flex-1 accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"/>
                    <span className="text-2xl font-black text-indigo-600 w-12 text-center">{periodsCount}</span>
                  </div>
                </div>
            </div>
            <div className={`flex items-center gap-3 text-xs p-3 rounded border font-bold ${isFirebaseReady ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
               <Cloud size={16}/>
               <span>{isFirebaseReady ? "雲端資料庫已連線 (Online)" : "離線模式 (Local Only)"}</span>
            </div>
          </div>
        </div>

        <button onClick={() => onComplete({ selectedGrades, daysCount, periodsCount, startDate })} disabled={selectedGrades.length === 0} className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${selectedGrades.length > 0 ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl hover:shadow-2xl hover:-translate-y-1' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
          啟動指揮中心 <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

const DashboardView = ({ config }: any) => {
  const today = new Date();
  const start = new Date(config.startDate);
  // @ts-ignore
  const diffTime = start - today;
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

const VenueAllocationSystem = ({ config, activeDay }: { config: any, activeDay: string }) => {
  const VENUES = ['禮堂', '雨天操場'];
  const [schedule, setSchedule] = useState<any>({});
  const [draggedClass, setDraggedClass] = useState<any>(null);
  const [activeGradeFilter, setActiveGradeFilter] = useState<string>('ALL');

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
  
  const handleExportCSV = () => {
    const headers = ['Day', 'Venue', 'Period', 'Classes'];
    const rows = [headers];
    
    for (let d = 1; d <= config.daysCount; d++) {
        const dKey = `Day ${d}`;
        if(schedule[dKey]) {
             VENUES.forEach(v => {
                 for(let p=1; p<=config.periodsCount; p++) {
                     const classes = schedule[dKey][v]?.[p] || [];
                     if(classes.length > 0) {
                         rows.push([dKey, v, `Period ${p}`, classes.join('; ')]);
                     }
                 }
             });
        }
    }
    
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `venue_allocation_${activeDay}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const availableClasses = ALL_CLASSES
    .filter(c => config.selectedGrades.includes('P'+c.charAt(0)))
    .filter(c => activeGradeFilter === 'ALL' || c.startsWith(activeGradeFilter.replace('P','')));

  return (
    <div className="flex h-full bg-slate-50 flex-col">
       <div className="bg-white border-b px-4 py-2 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400 mr-2"/>
            <button onClick={() => setActiveGradeFilter('ALL')} className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${activeGradeFilter==='ALL'?'bg-indigo-600 text-white':'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>全部</button>
            {STAFFING_LEVELS.map(lvl => (
               <button key={lvl} onClick={() => setActiveGradeFilter(lvl)} className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${activeGradeFilter===lvl?'bg-indigo-600 text-white':'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{lvl}</button>
            ))}
          </div>
          <button onClick={handleExportCSV} className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 text-white rounded text-xs font-bold hover:bg-black"><Download size={14}/> 匯出 CSV</button>
       </div>

       <div className="flex flex-1 overflow-hidden">
        <div className="w-40 bg-white border-r p-4 overflow-y-auto flex-shrink-0">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-xs uppercase tracking-wider"><Users size={14}/> 班級列表 ({activeGradeFilter})</h3>
          <div className="space-y-2">
            {availableClasses.map(cls => (
              <div key={cls} draggable onDragStart={(e) => handleDragStart(e, cls)} className="bg-white border border-slate-200 p-2 rounded shadow-sm cursor-grab active:cursor-grabbing hover:border-indigo-400 hover:text-indigo-600 transition-colors text-center font-bold text-slate-600 text-sm">{cls}</div>
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
                        {schedule[activeDay]?.[venue]?.[p]?.map((cls: string) => {
                          const isRelevant = activeGradeFilter === 'ALL' || cls.startsWith(activeGradeFilter.replace('P',''));
                          return (
                            <div key={cls} className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 ${isRelevant ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-400'}`}>
                              {cls}
                              <button onClick={() => handleRemoveClass(venue, p, cls)} className="hover:text-red-500"><X size={10}/></button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

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
          <input type="text" placeholder="輸入指令..." className="flex-1 border rounded-lg px-4 py-2" value={aiPrompt} onChange={(e: any) => setAiPrompt(e.target.value)} />
          <button onClick={handleAiGenerate} disabled={isGenerating} className="bg-indigo-600 text-white px-6 py-2 rounded-lg">{isGenerating ? '...' : '生成'}</button>
        </div>
      </div>
    </div>
  );
};

// --- Staffing System (V6.6) ---
const StaffingSystem = ({ config, activeDay, setActiveDay, user }: any) => {
  const [showConfig, setShowConfig] = useState(true);
  const [defaultCapacity, setDefaultCapacity] = useState(2); 
  const [schedule, setSchedule] = useState<any>({});
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [draggedTeacher, setDraggedTeacher] = useState<any>(null);
  const [selectedClassInfo, setSelectedClassInfo] = useState<any>(null);
  const [csvEncoding, setCsvEncoding] = useState('Big5');
  const [isSaving, setIsSaving] = useState(false);
  
  // Data State
  const [teacherList, setTeacherList] = useState<any[]>([]); 
  const [teacherDetails, setTeacherDetails] = useState<any>({}); 
  const [classTeacherInfo, setClassTeacherInfo] = useState<any>({});
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // States
  const [assignMode, setAssignMode] = useState<'AVERAGE' | 'JOB_BASED'>('AVERAGE');
  const [excludedTeachers, setExcludedTeachers] = useState<string[]>([]);
  const [jobTargets, setJobTargets] = useState<any>({ '副校長': 1, '主任': 3 });
  const [activePoolPeriod, setActivePoolPeriod] = useState(1);
  const [autoExcludedReasons, setAutoExcludedReasons] = useState<any>({}); 
  
  // V6.6: Selection State for highlighting cell
  const [activeCell, setActiveCell] = useState<{classId: string, period: number} | null>(null);

  // Undo History
  const [history, setHistory] = useState<any[]>([]);

  const saveHistory = () => {
    setHistory(prev => {
      const newHistory = [...prev, JSON.parse(JSON.stringify(schedule))]; 
      return newHistory.slice(-20); 
    });
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previousSchedule = history[history.length - 1];
    setSchedule(previousSchedule);
    setHistory(prev => prev.slice(0, -1));
  };

  // Load Data
  useEffect(() => {
    if (!isFirebaseReady || !db) return;
    const unsubT = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'teachers', 'main_list'), (docSnap: any) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (d.teacherList) {
          setTeacherList(d.teacherList);
          setTeacherDetails(d.teacherDetails || {});
          setClassTeacherInfo(d.classTeacherInfo || {});
          if(d.autoExcludedReasons) setAutoExcludedReasons(d.autoExcludedReasons);
          if(d.excludedTeachers) {
             setExcludedTeachers(prev => [...new Set([...prev, ...d.excludedTeachers])]);
          }
          setIsDataLoaded(true);
        }
      }
    });
    const unsubS = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'schedules', activeDay), (docSnap: any) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (d.slots) setSchedule((p: any) => ({ ...p, [activeDay]: d.slots }));
      }
    });
    return () => { unsubT(); unsubS(); };
  }, [user, activeDay]);

  // V6.5: Updated Save Logic to persist Exclusions
  const handleSaveToCloud = async () => {
    if (!isFirebaseReady || !db) return alert("Firebase 未連線");
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'schedules', activeDay), {
        slots: schedule[activeDay] || [],
        updatedAt: new Date().toISOString()
      });
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config'), config);
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'teachers', 'main_list'), {
         excludedTeachers: excludedTeachers, 
      }, { merge: true });

      alert("✅ 編配資料及排斥名單已儲存至雲端！");
    } catch (e) {
      console.error(e);
      alert("儲存失敗");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportCSV = () => {
      const dayData = schedule[activeDay] || [];
      const headers = ['Class', 'Period', 'Teachers', 'Target'];
      const rows = [headers];
      
      const filteredClasses = ALL_CLASSES.filter(c => config.selectedGrades.includes('P'+c.charAt(0)));
      
      filteredClasses.forEach(cls => {
          for(let p=1; p<=config.periodsCount; p++) {
              const slot = dayData.find((s:any) => s.classId === cls && s.period === p);
              if(slot && slot.teachers.length > 0) {
                  rows.push([cls, `P${p}`, slot.teachers.join('; '), slot.capacity]);
              }
          }
      });
      
      const csvContent = "\uFEFF" + rows.map(e => e.join(",")).join("\n"); 
      const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `staffing_schedule_${activeDay}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleFileUpload = (e: any) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split('\n').filter((l: string) => l.trim());
      
      const isTeacherListFile = lines[0].includes("姓名") || lines[0].includes("特別活動") || lines[1].includes("姓名");
      
      if (isTeacherListFile) {
         console.log("Processing Special Duties List...");
         const newExclusions: string[] = [];
         const newReasons: any = {};
         for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map((c: string) => c.trim().replace(/"/g, '')); 
            const activity = cols[1] || '';
            const name = cols[2];
            const activityUpper = activity.toUpperCase().replace(/\s/g, '');
            if (name && (activityUpper.includes("P.6LAOH") || activityUpper.includes("P.5LAOH") || activityUpper.includes("LAOH"))) {
               newExclusions.push(name);
               newReasons[name] = activity;
            }
         }
         
         setExcludedTeachers(prev => [...new Set([...prev, ...newExclusions])]);
         setAutoExcludedReasons(prev => ({...prev, ...newReasons}));
         alert(`✅ 已匯入特別職務名單，自動排除 ${newExclusions.length} 位老師 (LAOH)`);
         
         if (isFirebaseReady && db) {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'teachers', 'main_list'), {
               excludedTeachers: newExclusions,
               autoExcludedReasons: newReasons
            }, { merge: true });
         }

      } else {
         console.log("Processing Main Schedule...");
         const newTeachers: any[] = [];
         const newDetails: any = {};
         const newClassInfo: any = {};
         ALL_CLASSES.forEach(c => newClassInfo[c] = { head: '-', subjects: [] });

         for (let i = 2; i < lines.length; i++) {
           const cols = lines[i].split(',').map((c: string) => c.trim());
           const job = cols[0]; 
           const name = cols[1]; 
           const isClassHead = cols[2]; 

           if (!name) continue;
           newTeachers.push(name);
           newDetails[name] = { job: job || '教師' }; 

           if (isClassHead && isClassHead.trim() !== '') {
              const headClass = isClassHead.trim();
              if(newClassInfo[headClass]) newClassInfo[headClass].head = name;
           }

           for (let j = 3; j < cols.length; j++) {
              const content = cols[j];
              if (content && content.length > 2) {
                const parts = content.split(' ');
                if (parts.length >= 1) {
                  const cls = parts[0].trim();
                  const subj = parts[1] || '班主任';
                  if (newClassInfo[cls]) {
                    newClassInfo[cls].subjects.push({ subject: subj, teacher: name });
                  }
                }
              }
           }
         }

         Object.keys(newClassInfo).forEach(cls => {
           newClassInfo[cls].subjects = sortSubjects(newClassInfo[cls].subjects);
         });

         const sorted = newTeachers.sort();
         setTeacherList(sorted);
         setTeacherDetails(newDetails);
         setClassTeacherInfo(newClassInfo);
         setIsDataLoaded(true);
         
         if (isFirebaseReady && db) {
           await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'teachers', 'main_list'), {
             teacherList: sorted,
             teacherDetails: newDetails,
             classTeacherInfo: newClassInfo
           }, { merge: true });
           alert("✅ 總時間表匯入成功！");
         }
      }
    };
    reader.readAsText(file, csvEncoding);
  };

  useEffect(() => {
    setSchedule((prev: any) => {
      if (prev[activeDay] && prev[activeDay].length > 0) return prev;
      const next = { ...prev };
      if (!next[activeDay]) {
        next[activeDay] = [];
        ALL_CLASSES.filter(c => config.selectedGrades.includes('P'+c.charAt(0))).forEach(cls => {
          for (let p = 1; p <= config.periodsCount; p++) {
            next[activeDay].push({ classId: cls, period: p, teachers: [], capacity: defaultCapacity });
          }
        });
      }
      return next;
    });
  }, [config, defaultCapacity, activeDay]);

  const handleCapacityChange = (newCap: number) => {
    saveHistory(); 
    setDefaultCapacity(newCap);
    setSchedule((prev: any) => {
      const currentSlots = prev[activeDay] || [];
      const updatedSlots = currentSlots.map((slot: any) => ({ ...slot, capacity: newCap }));
      return { ...prev, [activeDay]: updatedSlots };
    });
  };

  const toggleSlotCapacity = (classId: string, period: number) => {
    saveHistory(); 
    setSchedule((prev: any) => {
      const dayData = [...(prev[activeDay] || [])];
      const idx = dayData.findIndex((s: any) => s.classId === classId && s.period === period);
      if (idx >= 0) {
        dayData[idx] = { ...dayData[idx], capacity: dayData[idx].capacity === 1 ? 2 : 1 };
      }
      return { ...prev, [activeDay]: dayData };
    });
  };

  const handlePoolDrop = (e: any) => {
    e.preventDefault();
    if (!draggedTeacher) return;
    const { name, fromClass, fromPeriod } = draggedTeacher;
    if (fromClass !== 'POOL') {
       saveHistory(); 
       setSchedule((prev: any) => {
          const dayData = [...(prev[activeDay] || [])];
          const srcIdx = dayData.findIndex((s: any) => s.classId === fromClass && s.period === fromPeriod);
          if (srcIdx >= 0) {
             dayData[srcIdx] = { 
               ...dayData[srcIdx], 
               teachers: dayData[srcIdx].teachers.filter((t: string) => t !== name) 
             };
          }
          return { ...prev, [activeDay]: dayData };
       });
    }
    setDraggedTeacher(null);
  };

  const handleDrop = (e: any, targetClass: string, targetPeriod: number) => {
    e.preventDefault();
    if (!draggedTeacher) return;
    const { name, fromClass, fromPeriod } = draggedTeacher;
    if (fromClass === targetClass && fromPeriod === targetPeriod) return;
    
    saveHistory(); 
    setSchedule((prev: any) => {
      const dayData = [...(prev[activeDay] || [])];
      // Remove
      if (fromClass !== 'POOL') {
         const srcIdx = dayData.findIndex((s: any) => s.classId === fromClass && s.period === fromPeriod);
         if (srcIdx >= 0) dayData[srcIdx] = { ...dayData[srcIdx], teachers: dayData[srcIdx].teachers.filter((t: string) => t !== name) };
      }
      // Add
      const tgtIdx = dayData.findIndex((s: any) => s.classId === targetClass && s.period === targetPeriod);
      if (tgtIdx >= 0 && !dayData[tgtIdx].teachers.includes(name)) {
        dayData[tgtIdx] = { ...dayData[tgtIdx], teachers: [...dayData[tgtIdx].teachers, name] };
      }
      return { ...prev, [activeDay]: dayData };
    });
    setDraggedTeacher(null);
  };

  const handleCellClick = (cls: string, period: number) => {
    const info = classTeacherInfo[cls] || { head: '-', subjects: [] };
    setSelectedClassInfo({ id: cls, info });
    // V6.6: Sync Pool Period and Highlight Cell
    setActivePoolPeriod(period);
    setActiveCell({ classId: cls, period: period });
  };

  const handleAutoAssign = () => {
    if (!isDataLoaded && !window.confirm("尚未上載 CSV，將使用模擬數據。是否繼續？")) return;
    
    saveHistory(); 

    const daySchedule = schedule[activeDay] || [];
    const totalSlotsNeeded = daySchedule.reduce((acc: any, slot: any) => acc + slot.capacity, 0);
    
    const availableTeachers = (isDataLoaded ? teacherList : ['T1']).filter((t: string) => !excludedTeachers.includes(t));
    const totalTeachers = availableTeachers.length;
    
    const baselineLoad = Math.ceil(totalSlotsNeeded / (totalTeachers || 1));
    
    if(!window.confirm(`智能編配 (V6.3)\n\n平均基準線: ${baselineLoad} 節/人\n策略：1.班主任 2.科任 3.輪替補位 4.班主任補位 5.最低者補位`)) return;
    
    const newSchedule = { ...schedule };
    const dayAssignments = JSON.parse(JSON.stringify(newSchedule[activeDay] || [])); 
    
    const currentLoad: any = {};
    availableTeachers.forEach((t: string) => currentLoad[t] = 0);
    dayAssignments.forEach((slot: any) => {
        slot.teachers.forEach((t: any) => {
             if (currentLoad[t] !== undefined) currentLoad[t]++;
        });
    });

    const isTeacherAvailable = (tName: string, slot: any) => {
        if (slot.teachers.includes(tName)) return false;
        const isBusy = dayAssignments.some((s: any) => s.period === slot.period && s.classId !== slot.classId && s.teachers.includes(tName));
        return !isBusy;
    };

    dayAssignments.forEach((slot: any) => {
      const needed = slot.capacity - slot.teachers.length;
      if (needed <= 0) return;
      
      const info = classTeacherInfo[slot.classId];
      const classHead = info?.head;
      const subjects = info?.subjects?.map((s:any) => s.teacher) || [];
      
      if (classHead && isTeacherAvailable(classHead, slot) && currentLoad[classHead] < baselineLoad && slot.teachers.length < slot.capacity) {
           slot.teachers.push(classHead);
           currentLoad[classHead]++;
      }
      
      if (slot.teachers.length < slot.capacity) {
         for (const t of subjects) {
             if (isTeacherAvailable(t, slot) && currentLoad[t] < baselineLoad && slot.teachers.length < slot.capacity) {
                 slot.teachers.push(t);
                 currentLoad[t]++;
                 if (slot.teachers.length >= slot.capacity) break;
             }
         }
      }
    });

    dayAssignments.forEach((slot: any) => {
       const needed = slot.capacity - slot.teachers.length;
       if (needed <= 0) return;

       let candidates = availableTeachers.filter((t: string) => currentLoad[t] < baselineLoad && isTeacherAvailable(t, slot));
       candidates.sort((a: string, b: string) => currentLoad[a] - currentLoad[b]);
       
       for (let i = 0; i < needed; i++) {
           if (candidates.length > 0) {
               const t = candidates.shift(); 
               slot.teachers.push(t);
               currentLoad[t]++;
           }
       }
    });

    dayAssignments.forEach((slot: any) => {
        if (slot.teachers.length >= slot.capacity) return;
        const info = classTeacherInfo[slot.classId];
        const classHead = info?.head;
        if (classHead && isTeacherAvailable(classHead, slot)) {
            slot.teachers.push(classHead);
            currentLoad[classHead]++;
        }
    });

    dayAssignments.forEach((slot: any) => {
        if (slot.teachers.length >= slot.capacity) return;
        
        let candidates = availableTeachers.filter((t: string) => isTeacherAvailable(t, slot));
        candidates.sort((a: string, b: string) => currentLoad[a] - currentLoad[b]);
        
        if (candidates.length > 0) {
            const t = candidates[0];
            slot.teachers.push(t);
            currentLoad[t]++;
        }
    });

    setSchedule({ ...newSchedule, [activeDay]: dayAssignments });
  };
  
  const handleClearDay = () => {
     if(!window.confirm("確定清空？")) return;
     saveHistory();
     setSchedule((prev: any) => ({ ...prev, [activeDay]: prev[activeDay].map((slot: any) => ({ ...slot, teachers: [] })) }));
  };

  const toggleExcluded = (t: string) => {
    setExcludedTeachers(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const statsData = useMemo(() => {
    const data: any[] = [];
    const currentAssignments = schedule[activeDay] || [];
    const teachersPool = isDataLoaded ? teacherList : ['T1'];
    const totalSlots = currentAssignments.reduce((acc: any, slot: any) => acc + slot.capacity, 0);
    const avgBaseline = Math.ceil(totalSlots / teachersPool.length);

    teachersPool.forEach((tName: string) => {
      let current = 0;
      currentAssignments.forEach((slot: any) => { if (slot.teachers.includes(tName)) current++; });
      if (current > 0 || isDataLoaded) {
        data.push({ name: tName, current, baseline: avgBaseline });
      }
    });
    return data.sort((a, b) => b.current - a.current);
  }, [schedule, activeDay, teacherList, isDataLoaded]);

  // V6.5 Smart Pool
  const poolTeachers = useMemo(() => {
    if (!isDataLoaded) return [];
    const currentAssignments = schedule[activeDay] || [];
    
    // Get subject teachers of the selected class
    const relevantTeachers = selectedClassInfo ? 
       [selectedClassInfo.info.head, ...selectedClassInfo.info.subjects.map((s:any)=>s.teacher)] 
       : [];

    return teacherList.filter(t => 
      !excludedTeachers.includes(t) &&
      !currentAssignments.some((s: any) => s.period === activePoolPeriod && s.teachers.includes(t))
    ).map(t => ({
      name: t,
      isRelevant: relevantTeachers.includes(t)
    })).sort((a, b) => (b.isRelevant ? 1 : 0) - (a.isRelevant ? 1 : 0)); // Sort relevant first
  }, [schedule, activeDay, activePoolPeriod, teacherList, excludedTeachers, isDataLoaded, selectedClassInfo]);

  const filteredClasses = ALL_CLASSES.filter(c => config.selectedGrades.includes('P'+c.charAt(0)));

  return (
    <div className="h-full flex flex-col bg-slate-50 relative">
      <div className="bg-white border-b px-4 py-2 flex justify-between items-center shadow-sm z-20">
        <div className="flex items-center gap-4">
           <button onClick={() => setShowConfig(!showConfig)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500"><Settings size={18} /></button>
           <button onClick={handleUndo} disabled={history.length === 0} className={`p-1.5 rounded border flex items-center gap-1 ${history.length > 0 ? 'bg-white text-indigo-600 hover:bg-indigo-50 border-indigo-200' : 'bg-slate-100 text-slate-300 border-slate-200'}`}><Undo2 size={16}/> 撤銷</button>
           <div className="flex bg-slate-100 p-0.5 rounded">
             {Array.from({length: config.daysCount}, (_, i) => `Day ${i+1}`).map((d: any) => (
               <button key={d} onClick={() => setActiveDay(d)} className={`px-3 py-1 text-xs font-bold rounded ${activeDay === d ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>{d}</button>
             ))}
           </div>
        </div>
        <div className="flex gap-2">
           <button onClick={() => setShowStatsModal(true)} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded text-xs font-bold hover:bg-slate-50"><BarChart size={14}/> 統計</button>
           <button onClick={handleAutoAssign} className={`flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-bold hover:bg-indigo-700 shadow-sm`}><Calculator size={14}/> 智能編配</button>
           <button onClick={handleSaveToCloud} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700 shadow-sm"><Save size={14}/> {isSaving ? '儲存中...' : '儲存編配'}</button>
           <button onClick={handleExportCSV} className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 text-white rounded text-xs font-bold hover:bg-black"><Download size={14}/> 匯出 CSV</button>
           <button onClick={handleClearDay} className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded text-xs font-bold"><Trash2 size={14}/></button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        {showConfig && (
          <div className="w-72 bg-white border-r shadow-xl z-10 flex flex-col h-full overflow-y-auto">
             <div className="p-4 space-y-6">
                {/* 1. Upload */}
                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-bold text-indigo-700 uppercase flex items-center gap-1"><Upload size={12}/> 匯入 CSV</label>
                    <select value={csvEncoding} onChange={(e) => setCsvEncoding(e.target.value)} className="text-[9px] border rounded bg-white px-1">
                      <option value="Big5">Big5</option>
                      <option value="UTF-8">UTF-8</option>
                    </select>
                  </div>
                  <input type="file" accept=".csv" onChange={handleFileUpload} className="block w-full text-[10px]"/>
                  {isDataLoaded && <div className="mt-1 text-[10px] text-green-600 font-bold">✅ 資料已同步</div>}
                </div>

                {/* 2. Teacher Pool (New Position) */}
                <div className="border-b pb-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-bold text-slate-400 block uppercase flex items-center gap-1"><Layers size={12}/> 第 {activePoolPeriod} 節教師池 ({poolTeachers.length})</label>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {Array.from({length: config.periodsCount}, (_, i) => i+1).map(p => (
                      <button key={p} onClick={() => setActivePoolPeriod(p)} className={`w-6 h-6 text-[10px] rounded font-bold transition-colors ${activePoolPeriod===p?'bg-indigo-600 text-white':'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{p}</button>
                    ))}
                  </div>
                  <div 
                    onDragOver={(e) => e.preventDefault()} 
                    onDrop={handlePoolDrop}
                    className="min-h-[100px] max-h-[200px] overflow-y-auto bg-slate-50 rounded border-2 border-dashed border-slate-200 p-2 transition-colors hover:border-indigo-300"
                  >
                     {poolTeachers.length > 0 ? (
                       <div className="flex flex-wrap gap-1">
                         {poolTeachers.map((tObj: any) => (
                           <div 
                             key={tObj.name} 
                             draggable 
                             onDragStart={(e) => { setDraggedTeacher({name:tObj.name, fromClass:'POOL', fromPeriod:activePoolPeriod}); e.dataTransfer.effectAllowed="move"; }} 
                             className={`px-2 py-1 border rounded text-[10px] shadow-sm cursor-grab select-none transition-all ${tObj.isRelevant ? 'bg-indigo-600 text-white border-indigo-700 font-bold scale-105' : 'bg-white border-slate-300 hover:border-indigo-500 hover:text-indigo-600'}`}
                           >
                             {tObj.name}
                           </div>
                         ))}
                       </div>
                     ) : (
                       <div className="h-full flex flex-col items-center justify-center text-slate-300 text-xs italic">
                         <span>本節無可用教師</span>
                         <span className="text-[9px] mt-1">或拖曳至此釋放</span>
                       </div>
                     )}
                  </div>
                </div>

                {/* 3. Class Info (Moved Here) */}
                <div className="border-b pb-4 mb-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2"><BookOpen size={14}/> 班級師資資訊</h4>
                  {selectedClassInfo ? (
                    <div className="bg-slate-50 rounded border border-slate-200 p-3 shadow-inner">
                       <div className="flex justify-between mb-2 border-b pb-1">
                         <span className="font-bold text-indigo-700">{selectedClassInfo.id}</span>
                         <span className="text-[10px] text-slate-500">班主任: {selectedClassInfo.info.head}</span>
                       </div>
                       <div className="h-32 overflow-y-auto custom-scrollbar space-y-1">
                         {selectedClassInfo.info.subjects.map((s:any, i:number) => (
                           <div key={i} className="flex justify-between text-[10px] bg-white p-1 rounded border border-slate-100">
                             <span className="text-slate-500">{s.subject}</span><span className="font-bold">{s.teacher}</span>
                           </div>
                         ))}
                       </div>
                    </div>
                  ) : (
                    <div className="text-center text-slate-300 text-xs py-4 border-2 border-dashed rounded">點擊課節查看詳情</div>
                  )}
                </div>
                
                {/* 4. Mode & Capacity */}
                <div className="space-y-4 border-b pb-4">
                   <div>
                     <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">編配模式</label>
                     <div className="flex gap-1">
                       <button onClick={() => setAssignMode('AVERAGE')} className={`flex-1 py-1 text-[10px] rounded border ${assignMode==='AVERAGE'?'bg-slate-800 text-white':'bg-white text-slate-600'}`}>平均 (預設)</button>
                       <button onClick={() => setAssignMode('JOB_BASED')} className={`flex-1 py-1 text-[10px] rounded border ${assignMode==='JOB_BASED'?'bg-indigo-600 text-white':'bg-white text-slate-600'}`}>職位權重</button>
                     </div>
                   </div>
                   {assignMode === 'JOB_BASED' && (
                     <div className="bg-slate-50 p-2 rounded border border-slate-200">
                       <div className="flex justify-between text-[10px] mb-1"><span>副校長上限:</span><input type="number" className="w-10 text-center border rounded" value={jobTargets['副校長']||0} onChange={e=>setJobTargets({...jobTargets, '副校長': parseInt(e.target.value)})}/></div>
                       <div className="flex justify-between text-[10px]"><span>主任上限:</span><input type="number" className="w-10 text-center border rounded" value={jobTargets['主任']||0} onChange={e=>setJobTargets({...jobTargets, '主任': parseInt(e.target.value)})}/></div>
                     </div>
                   )}
                   <div>
                     <label className="text-[10px] font-bold text-slate-400 mb