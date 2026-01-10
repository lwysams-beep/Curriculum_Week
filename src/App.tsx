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
  Database,
  Save,
  Download,
  AlertTriangle,
  RefreshCw,
  Calculator
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

// Firebase Initialization
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
// SECTION 1: CONSTANTS
// ==========================================

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
const ALL_CLASSES = STAFFING_LEVELS.flatMap(lvl => CLASS_SUFFIXES.map(s => `${lvl.replace('P','')}${s}`)); 

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
          <h1 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">課程指揮中心 <span className="text-indigo-600">V5.7</span></h1>
          <p className="text-slate-500 font-medium">Safe Mode • Cloud Enabled • Compact View</p>
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

const StaffingSystem = ({ config, activeDay, setActiveDay, user }: any) => {
  const [showConfig, setShowConfig] = useState(true);
  const [defaultCapacity, setDefaultCapacity] = useState(2); 
  const [schedule, setSchedule] = useState<any>({});
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [draggedTeacher, setDraggedTeacher] = useState<any>(null);
  const [selectedClassInfo, setSelectedClassInfo] = useState<any>(null);
  const [csvEncoding, setCsvEncoding] = useState('Big5');
  const [isSaving, setIsSaving] = useState(false);
  
  const [teacherList, setTeacherList] = useState<any[]>([]); 
  const [classTeacherInfo, setClassTeacherInfo] = useState<any>({});
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Load Data
  useEffect(() => {
    if (!isFirebaseReady || !db) return;
    const unsubT = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'teachers', 'main_list'), (docSnap: any) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (d.teacherList) {
          setTeacherList(d.teacherList);
          setClassTeacherInfo(d.classTeacherInfo || {});
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

  const handleSaveToCloud = async () => {
    if (!isFirebaseReady || !db) return alert("Firebase 未連線");
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'schedules', activeDay), {
        slots: schedule[activeDay] || [],
        updatedAt: new Date().toISOString()
      });
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config'), config);
      alert("✅ 儲存成功！");
    } catch (e) {
      console.error(e);
      alert("儲存失敗");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split('\n').filter((l: string) => l.trim());
      const newTeachers: any[] = [];
      const newClassInfo: any = {};
      ALL_CLASSES.forEach(c => newClassInfo[c] = { head: '-', subjects: [] });

      for (let i = 2; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c: string) => c.trim());
        const name = cols[1];
        if (!name) continue;
        newTeachers.push(name);
        for (let j = 3; j < cols.length; j++) {
           const content = cols[j];
           if (content && content.length > 2) {
             const parts = content.split(' ');
             if (parts.length >= 1) {
               const cls = parts[0].trim();
               const subj = parts[1] || '班主任';
               if (newClassInfo[cls]) {
                 newClassInfo[cls].subjects.push({ subject: subj, teacher: name });
                 if (newClassInfo[cls].head === '-' && subj.includes('班主任')) newClassInfo[cls].head = name;
               }
             }
           }
        }
      }
      const sorted = newTeachers.sort();
      setTeacherList(sorted);
      setClassTeacherInfo(newClassInfo);
      setIsDataLoaded(true);
      
      if (isFirebaseReady && db) {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'teachers', 'main_list'), {
          teacherList: sorted,
          classTeacherInfo: newClassInfo
        });
        alert("匯入並同步至雲端成功！");
      }
    };
    reader.readAsText(file, csvEncoding);
  };

  // Schedule Init
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
    setDefaultCapacity(newCap);
    setSchedule((prev: any) => {
      const currentSlots = prev[activeDay] || [];
      // Immedately update all slots for current day
      const updatedSlots = currentSlots.map((slot: any) => ({ ...slot, capacity: newCap }));
      return { ...prev, [activeDay]: updatedSlots };
    });
  };

  const toggleSlotCapacity = (classId: string, period: number) => {
    setSchedule((prev: any) => {
      const dayData = [...(prev[activeDay] || [])];
      const idx = dayData.findIndex((s: any) => s.classId === classId && s.period === period);
      if (idx >= 0) {
        dayData[idx] = { ...dayData[idx], capacity: dayData[idx].capacity === 1 ? 2 : 1 };
      }
      return { ...prev, [activeDay]: dayData };
    });
  };

  const handleDrop = (e: any, targetClass: string, targetPeriod: number) => {
    e.preventDefault();
    if (!draggedTeacher) return;
    const { name, fromClass, fromPeriod } = draggedTeacher;
    if (fromClass === targetClass && fromPeriod === targetPeriod) return;
    
    setSchedule((prev: any) => {
      const dayData = [...(prev[activeDay] || [])];
      const srcIdx = dayData.findIndex((s: any) => s.classId === fromClass && s.period === fromPeriod);
      if (srcIdx >= 0) dayData[srcIdx] = { ...dayData[srcIdx], teachers: dayData[srcIdx].teachers.filter((t: string) => t !== name) };
      const tgtIdx = dayData.findIndex((s: any) => s.classId === targetClass && s.period === targetPeriod);
      if (tgtIdx >= 0 && !dayData[tgtIdx].teachers.includes(name)) {
        dayData[tgtIdx] = { ...dayData[tgtIdx], teachers: [...dayData[tgtIdx].teachers, name] };
      }
      return { ...prev, [activeDay]: dayData };
    });
    setDraggedTeacher(null);
  };

  const handleCellClick = (cls: string) => {
    const info = classTeacherInfo[cls] || { head: '-', subjects: [] };
    setSelectedClassInfo({ id: cls, info });
  };

  const handleAutoAssign = () => {
    if (!isDataLoaded && !window.confirm("尚未上載 CSV，將使用模擬數據。是否繼續？")) return;
    
    const daySchedule = schedule[activeDay] || [];
    const totalSlotsNeeded = daySchedule.reduce((acc: any, slot: any) => acc + slot.capacity, 0);
    const teachersPool = isDataLoaded ? teacherList : ['T1', 'T2', 'T3']; // Fallback
    const baselineLoad = Math.ceil(totalSlotsNeeded / teachersPool.length) || 1;
    
    if(!window.confirm(`智能編配 (V5.7)\n\n當日人次: ${totalSlotsNeeded}\n可用教師: ${teachersPool.length}\n平均基準線: ${baselineLoad} 節/人`)) return;
    
    const newSchedule = { ...schedule };
    const dayAssignments = JSON.parse(JSON.stringify(newSchedule[activeDay] || [])); // Deep copy
    
    const currentLoad: any = {};
    teachersPool.forEach((t: string) => currentLoad[t] = 0);
    // Count existing loads
    dayAssignments.forEach((slot: any) => slot.teachers.forEach((t: any) => currentLoad[t] = (currentLoad[t]||0) + 1));

    dayAssignments.forEach((slot: any) => {
      const needed = slot.capacity - slot.teachers.length;
      if (needed <= 0) return;
      
      let candidates = teachersPool.map((tName: string) => {
        // Basic eligibility
        if (slot.teachers.includes(tName)) return null;
        // Busy check (same period different class)
        const isBusy = dayAssignments.some((s: any) => s.period === slot.period && s.classId !== slot.classId && s.teachers.includes(tName));
        if (isBusy) return null;

        let score = 100;
        
        // 1. Baseline Load Balance
        if (currentLoad[tName] >= baselineLoad) score -= 500; // Heavy penalty if exceeding average

        // 2. Role Priority (Using real CSV data)
        const info = classTeacherInfo[slot.classId];
        if (info) {
          if (info.head === tName) score += 50; // Class teacher priority
          if (info.subjects.some((s:any) => s.teacher === tName)) score += 30; // Subject teacher priority
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
  
  const handleClearDay = () => {
     if(!window.confirm("確定清空？")) return;
     setSchedule((prev: any) => ({ ...prev, [activeDay]: prev[activeDay].map((slot: any) => ({ ...slot, teachers: [] })) }));
  };

  // Improved Stats Data for Composite Chart
  const statsData = useMemo(() => {
    const data: any[] = [];
    const currentAssignments = schedule[activeDay] || [];
    const totalSlots = currentAssignments.reduce((acc: any, slot: any) => acc + slot.capacity, 0);
    const teachersPool = isDataLoaded ? teacherList : ['T1'];
    const baseline = Math.ceil(totalSlots / teachersPool.length);

    teachersPool.forEach((tName: string) => {
      let current = 0;
      currentAssignments.forEach((slot: any) => { if (slot.teachers.includes(tName)) current++; });
      if (current > 0 || isDataLoaded) { // Show all teachers if data loaded
        data.push({ name: tName, current, baseline });
      }
    });
    return data.sort((a, b) => b.current - a.current);
  }, [schedule, activeDay, teacherList, isDataLoaded]);

  const filteredClasses = ALL_CLASSES.filter(c => config.selectedGrades.includes('P'+c.charAt(0)));

  return (
    <div className="h-full flex flex-col bg-slate-50 relative">
      <div className="bg-white border-b px-4 py-2 flex justify-between items-center shadow-sm z-20">
        <div className="flex items-center gap-4">
           <button onClick={() => setShowConfig(!showConfig)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500"><Settings size={18} /></button>
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
           <button onClick={handleClearDay} className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded text-xs font-bold"><Trash2 size={14}/></button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {showConfig && (
          <div className="w-64 bg-white border-r shadow-xl z-10 flex flex-col overflow-y-auto">
             <div className="p-4 space-y-6">
                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-bold text-indigo-700 uppercase flex items-center gap-1"><Upload size={12}/> 匯入教師 (CSV)</label>
                    <select value={csvEncoding} onChange={(e) => setCsvEncoding(e.target.value)} className="text-[9px] border rounded bg-white px-1">
                      <option value="Big5">Big5</option>
                      <option value="UTF-8">UTF-8</option>
                    </select>
                  </div>
                  <input type="file" accept=".csv" onChange={handleFileUpload} className="block w-full text-[10px]"/>
                  {isDataLoaded && <div className="mt-1 text-[10px] text-green-600 font-bold">已載入 {teacherList.length} 位教師</div>}
                </div>
                
                <div>
                   <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">預設人手 (即時更新)</label>
                   <div className="flex items-center gap-2">
                     <input type="range" min="1" max="4" step="1" value={defaultCapacity} onChange={(e: any) => handleCapacityChange(parseInt(e.target.value))} className="flex-1 accent-indigo-600 h-1.5 bg-slate-200 rounded-lg"/>
                     <span className="text-sm font-bold text-indigo-600">{defaultCapacity}</span>
                   </div>
                </div>

                {selectedClassInfo ? (
                  <div className="bg-slate-50 rounded border border-slate-200 p-3 shadow-inner">
                     <div className="flex justify-between mb-2 border-b pb-1">
                       <span className="font-bold text-indigo-700">{selectedClassInfo.id}</span>
                       <span className="text-[10px] text-slate-500">班主任: {selectedClassInfo.info.head}</span>
                     </div>
                     <div className="h-64 overflow-y-auto custom-scrollbar space-y-1">
                       {selectedClassInfo.info.subjects.map((s:any, i:number) => (
                         <div key={i} className="flex justify-between text-[10px] bg-white p-1 rounded border border-slate-100">
                           <span className="text-slate-500">{s.subject}</span><span className="font-bold">{s.teacher}</span>
                         </div>
                       ))}
                     </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-300 text-xs py-10 border-2 border-dashed rounded">點擊右側課節<br/>查看師資</div>
                )}
             </div>
          </div>
        )}

        <div className="flex-1 overflow-auto bg-slate-100/50 p-4">
          <div className="bg-white rounded shadow-sm border border-slate-300 min-w-[800px]">
             <div className="grid bg-slate-50 border-b sticky top-0 z-10" style={{ gridTemplateColumns: `60px repeat(${config.periodsCount}, 1fr)` }}>
               <div className="p-2 text-center text-[10px] font-bold text-slate-500 border-r">班別</div>
               {Array.from({length: config.periodsCount}, (_, i) => i+1).map(p => (
                 <div key={p} className="p-2 text-center border-r last:border-r-0 text-[10px] font-bold text-slate-500">P{p}</div>
               ))}
             </div>
             <div className="divide-y divide-slate-200">
               {filteredClasses.map(cls => (
                 <div key={cls} className="grid hover:bg-slate-50 transition-colors group" style={{ gridTemplateColumns: `60px repeat(${config.periodsCount}, 1fr)` }}>
                   <div className="p-1 font-bold text-slate-700 border-r flex items-center justify-center bg-slate-100/50 text-sm">{cls}</div>
                   {Array.from({length: config.periodsCount}, (_, i) => i+1).map(p => {
                     const slot = schedule[activeDay]?.find((s: any) => s.classId === cls && s.period === p);
                     if (!slot) return <div key={p} className="border-r bg-slate-100/20"></div>;
                     return (
                       <div 
                         key={p} 
                         className={`border-r last:border-r-0 min-h-[45px] p-0.5 relative cursor-pointer ${selectedClassInfo?.id === cls ? 'bg-indigo-50/30' : ''}`}
                         onClick={() => handleCellClick(cls)} 
                         onDragOver={(e) => e.preventDefault()}
                         onDrop={(e) => handleDrop(e, cls, p)}
                       >
                         <div className="flex flex-wrap gap-0.5 content-start">
                           {slot.teachers.map((t: string, i: number) => (
                             <div key={i} draggable onDragStart={(e) => { setDraggedTeacher({name:t, fromClass:cls, fromPeriod:p}); e.dataTransfer.effectAllowed="move"; }} className="cursor-grab active:cursor-grabbing px-1 h-4 flex items-center text-[9px] bg-white border border-slate-300 rounded shadow-sm hover:border-indigo-500 hover:text-indigo-600 whitespace-nowrap">
                               {t}
                             </div>
                           ))}
                         </div>
                         <button onClick={(e) => {e.stopPropagation(); toggleSlotCapacity(cls, p)}} className="absolute bottom-0 right-0 w-3 h-3 bg-slate-200 hover:bg-slate-300 text-[8px] flex items-center justify-center rounded-tl text-slate-600 font-bold leading-none z-10">{slot.capacity}</button>
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
              <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3"><BarChart className="text-indigo-600" /> 人手編配統計</h2>
                <p className="text-sm text-slate-500 mt-1">基準線 (Baseline): 藍色代表已編，灰色代表平均建議值</p>
              </div>
              <button onClick={() => setShowStatsModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={24} className="text-slate-500" /></button>
            </div>
            <div className="flex-1 p-8 overflow-hidden flex flex-col">
              <div className="flex-1 min-h-0 border border-slate-100 rounded-xl bg-slate-50/50 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartBar data={statsData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} tick={{fontSize: 10, fill: '#64748b'}} height={80}/>
                    <YAxis tick={{fontSize: 12, fill: '#64748b'}} />
                    <Tooltip cursor={{fill: 'rgba(99, 102, 241, 0.05)'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}/>
                    <Legend verticalAlign="top" height={36}/>
                    <Bar dataKey="baseline" name="建議平均 (Baseline)" fill="#cbd5e1" radius={[4, 4, 4, 4]} barSize={12} />
                    <Bar dataKey="current" name="實際編配 (Current)" fill="#4f46e5" radius={[4, 4, 4, 4]} barSize={12}>
                       {statsData.map((entry: any, index: number) => (
                         <Cell key={`cell-${index}`} fill={entry.current > entry.baseline + 2 ? '#ef4444' : (entry.current < entry.baseline - 2 ? '#f59e0b' : '#4f46e5')} />
                       ))}
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

const AppContent = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSystemStarted, setIsSystemStarted] = useState(false);
  const [sysConfig, setSysConfig] = useState<any>(null);
  const [activeDay, setActiveDay] = useState('Day 1');
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
      <nav className={`${isSidebarOpen ? 'w-56' : 'w-0'} bg-white border-r flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden flex flex-col relative z-30`}>
        <div className="p-4 border-b flex items-center gap-2 bg-indigo-900 text-white h-16">
          <Brain className="flex-shrink-0" />
          <span className="font-bold truncate">課程指揮中心</span>
        </div>
        <div className="flex-1 overflow-y-auto py-4 space-y-1">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-slate-50 text-slate-600 ${activeTab==='dashboard'?'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600':''}`}><Layout size={18} /><span className="text-sm font-bold">總覽儀表板</span></button>
          <button onClick={() => setActiveTab('staff')} className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-slate-50 text-slate-600 ${activeTab==='staff'?'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600':''}`}><Users size={18} /><span className="text-sm font-bold">人手分配</span></button>
          <button onClick={() => setActiveTab('venue')} className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-slate-50 text-slate-600 ${activeTab==='venue'?'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600':''}`}><MapPin size={18} /><span className="text-sm font-bold">地點分配</span></button>
          <button onClick={() => setActiveTab('ai-design')} className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-slate-50 text-slate-600 ${activeTab==='ai-design'?'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600':''}`}><Cpu size={18} /><span className="text-sm font-bold">AI 課程設計</span></button>
        </div>
        <div className="p-4 border-t text-[10px] text-slate-400 text-center flex flex-col items-center gap-1">
          <span>V5.7 Final</span>
          <span className={`flex items-center gap-1 ${user ? 'text-green-500' : 'text-slate-300'}`}><Cloud size={10} /> {user ? 'Online' : 'Offline'}</span>
        </div>
      </nav>
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <header className="bg-white h-16 border-b px-4 flex items-center justify-between shadow-sm z-20 flex-shrink-0">
           <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"><Menu size={20} /></button>
            <h1 className="text-lg font-bold text-slate-800 truncate">{activeTab === 'dashboard' ? '總覽儀表板' : activeTab === 'staff' ? '智能人手編配系統' : activeTab === 'venue' ? '地點分配' : 'AI 課程設計'}</h1>
           </div>
           <div className="flex items-center gap-3">
             <div className="bg-slate-100 p-1 rounded-lg flex items-center"><span className="text-xs font-bold text-slate-400 px-2 uppercase">Global Day:</span><select value={activeDay} onChange={(e) => setActiveDay(e.target.value)} className="bg-transparent text-sm font-bold text-indigo-700 outline-none">{Array.from({length: sysConfig.daysCount}, (_, i) => `Day ${i+1}`).map((d: any) => <option key={d} value={d}>{d}</option>)}</select></div>
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
}

const App = () => {
  return (
    <ErrorBoundary>
       <AppContent />
    </ErrorBoundary>
  );
};

export default App;