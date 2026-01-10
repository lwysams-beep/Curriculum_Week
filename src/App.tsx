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
  Download
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
import { initializeApp } from 'firebase/app';
// @ts-ignore
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
// @ts-ignore
import { getFirestore, doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';

// ==========================================
// SECTION 0: FIREBASE CONFIG & UTILS
// ==========================================

const firebaseConfig = {
  apiKey: "AIzaSyAvl1XfKbQvVueXHAjv6bjUnvJmRMEp3UM",
  authDomain: "curriculum-manager01.firebaseapp.com",
  projectId: "curriculum-manager01",
  storageBucket: "curriculum-manager01.firebasestorage.app",
  messagingSenderId: "949862664220",
  appId: "1:949862664220:web:bb114560a402f0911c77d9"
};

// Initialize Firebase safely
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'curriculum-manager-v5'; 

// Hook for Auth
const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
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
      { time: '08:30', title: '開幕禮', level: '全校', elements: ['Communication'], skills: ['AI 認知'], staff: '陳主任' },
      { time: '10:00', title: '情緒小偵探', level: 'P1-P3', elements: ['Collaboration'], skills: ['社交情緒'], staff: '李老師' }
    ]
  },
  {
    id: 2,
    day: 'Day 2',
    theme: 'STREAM 創客挑戰 (Maker)',
    activities: [
      { time: '09:00', title: '智能家居製作', level: 'P4-P6', elements: ['Critical Thinking'], skills: ['解決問題'], staff: 'STEM 組' }
    ]
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
// SECTION 2: SUB-COMPONENTS
// ==========================================

// --- Setup Wizard ---
const SetupWizard = ({ onComplete }: { onComplete: (config: any) => void }) => {
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
          <h1 className="text-3xl font-black text-slate-800 mb-2">課程指揮中心 <span className="text-indigo-600">V5.4 Cloud Optimized</span></h1>
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
                 onChange={(e: any) => setStartDate(e.target.value)} 
                 className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 text-slate-700 font-bold outline-none focus:border-indigo-600 focus:bg-indigo-50 transition-colors"
               />
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                <div className="mb-6">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block flex items-center gap-2"><Clock size={14}/> 活動日數 (Days)</label>
                  <input type="range" min="1" max="5" value={daysCount} onChange={(e: any) => setDaysCount(parseInt(e.target.value))} className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mb-2"/>
                  <div className="flex justify-between text-xs text-slate-500 font-mono"><span>1</span><span className="text-indigo-600 font-bold text-lg">{daysCount} Days</span><span>5</span></div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block flex items-center gap-2"><Clock size={14}/> 每日堂數 (Periods)</label>
                  <input type="range" min="4" max="9" value={periodsCount} onChange={(e: any) => setPeriodsCount(parseInt(e.target.value))} className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mb-2"/>
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

// --- Staffing System (Optimized & Cloud Saving) ---
const StaffingSystem = ({ config, activeDay, setActiveDay, user }: any) => {
  const [showConfig, setShowConfig] = useState(true);
  const [defaultCapacity, setDefaultCapacity] = useState(2); 
  const [schedule, setSchedule] = useState<any>({});
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [draggedTeacher, setDraggedTeacher] = useState<any>(null);
  const [selectedClassInfo, setSelectedClassInfo] = useState<any>(null);
  const [csvEncoding, setCsvEncoding] = useState('Big5'); // Default to Big5 for HK Excel
  
  // Real Teacher Data State
  const [teacherList, setTeacherList] = useState<any[]>([]); 
  const [classTeacherInfo, setClassTeacherInfo] = useState<any>({});
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Firestore Sync - Load Data (Teachers & Schedule)
  useEffect(() => {
    if (!user || !db) return;
    
    // 1. Load Teachers List
    const unsubTeachers = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'teacher_list'), (docSnap: any) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.teacherList) {
          setTeacherList(data.teacherList);
          setClassTeacherInfo(data.classTeacherInfo || {});
          setIsDataLoaded(true);
        }
      }
    });

    // 2. Load Schedule for Active Day
    // Path: artifacts/{appId}/public/data/schedules/{activeDay}
    const unsubSchedule = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', `schedule_${activeDay}`), (docSnap: any) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.slots) {
          // Merge loaded schedule with current structure to ensure integrity
          setSchedule((prev: any) => ({
             ...prev,
             [activeDay]: data.slots
          }));
          console.log(`Loaded schedule for ${activeDay}`);
        }
      }
    });

    return () => {
      unsubTeachers();
      unsubSchedule();
    };
  }, [user, activeDay]); // Re-run when day changes to load that day's schedule

  // Save Schedule to Cloud
  const saveScheduleToCloud = async () => {
    if (!user || !db) return;
    setIsSaving(true);
    try {
      const dayData = schedule[activeDay] || [];
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', `schedule_${activeDay}`), {
        slots: dayData,
        lastUpdated: new Date().toISOString(),
        updatedBy: user.uid
      });
      alert(`✅ ${activeDay} 編配資料已儲存至雲端！`);
    } catch (e) {
      console.error("Save failed", e);
      alert("儲存失敗，請檢查網絡連線");
    } finally {
      setIsSaving(false);
    }
  };

  // CSV Parsing Logic (With Encoding Fix)
  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split('\n').filter((l: string) => l.trim());
      
      const newTeacherList: any[] = [];
      const newClassInfo: any = {};
      ALL_CLASSES.forEach(cls => newClassInfo[cls] = { head: '待定', subjects: [] });

      // Start from Row 3 (Index 2)
      for (let i = 2; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c: string) => c.trim());
        const name = cols[1]; // B Column
        
        if (!name) continue; 
        newTeacherList.push(name);

        // Parsing logic based on "6A 數學" format in grid
        for (let j = 3; j < cols.length; j++) {
          const content = cols[j];
          if (content && content.length > 2) {
            const parts = content.split(' '); // Split "6A 數學"
            if (parts.length >= 1) {
              const cls = parts[0].trim();
              const subj = parts[1] ? parts[1].trim() : '班主任課'; // Default if no subject

              if (newClassInfo[cls]) {
                newClassInfo[cls].subjects.push({ subject: subj, teacher: name });
                // Simple heuristic for head teacher
                if (newClassInfo[cls].head === '待定' && subj.includes('班主任')) newClassInfo[cls].head = name; 
              }
            }
          }
        }
      }

      const sortedTeachers = newTeacherList.sort();
      setTeacherList(sortedTeachers);
      setClassTeacherInfo(newClassInfo);
      setIsDataLoaded(true);

      if (user && db) {
        try {
          await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'teacher_list'), {
            teacherList: sortedTeachers,
            classTeacherInfo: newClassInfo,
            updatedAt: new Date().toISOString()
          });
          alert(`✅ 成功匯入 ${sortedTeachers.length} 位教師資料！(編碼: ${csvEncoding})`);
        } catch (err) {
          console.error("Cloud save failed:", err);
        }
      }
    };
    // Use selected encoding to fix garbled text
    reader.readAsText(file, csvEncoding);
  };

  // Init Schedule Grid Structure (Empty)
  useEffect(() => {
    setSchedule((prev: any) => {
      // If already has data for this day from cloud, don't overwrite with empty
      if (prev[activeDay] && prev[activeDay].length > 0) return prev;

      const nextSchedule = { ...prev };
      // Only init for active day to save memory, or init all? 
      // Let's init active day if missing
      if (!nextSchedule[activeDay]) {
        nextSchedule[activeDay] = [];
        ALL_CLASSES.filter(c => config.selectedGrades.includes('P'+c.charAt(0))).forEach(cls => {
          for (let p = 1; p <= config.periodsCount; p++) {
            nextSchedule[activeDay].push({ classId: cls, period: p, teachers: [], capacity: defaultCapacity });
          }
        });
      }
      return nextSchedule;
    });
  }, [config, defaultCapacity, activeDay]);

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

  const handleCellClick = (classId: string) => {
    const info = classTeacherInfo[classId] || { head: 'N/A', subjects: [] };
    setSelectedClassInfo({ id: classId, info });
  };
  
  const handleAutoAssign = () => {
    // ... (Keep existing logic, omitted for brevity but assumed present)
    const daySchedule = schedule[activeDay] || [];
    const totalSlotsNeeded = daySchedule.reduce((acc: any, slot: any) => acc + slot.capacity, 0);
    const totalTeachers = isDataLoaded ? teacherList.length : 1;
    const baselineLoad = Math.ceil(totalSlotsNeeded / totalTeachers) || 1;
    
    if(!window.confirm("執行智能編配？(將覆蓋當前頁面)")) return;
    
    const newSchedule = { ...schedule };
    const dayAssignments = [...(newSchedule[activeDay] || [])];
    const currentLoad: any = {};
    (isDataLoaded ? teacherList : []).forEach(t => currentLoad[t] = 0);
    dayAssignments.forEach((slot: any) => slot.teachers.forEach((t: any) => currentLoad[t] = (currentLoad[t]||0) + 1));

    dayAssignments.forEach((slot: any) => {
      const needed = slot.capacity - slot.teachers.length;
      if (needed <= 0) return;
      
      let candidates = (isDataLoaded ? teacherList : []).map(tName => {
        if (slot.teachers.includes(tName)) return null;
        const isBusy = dayAssignments.some((s: any) => s.period === slot.period && s.teachers.includes(tName));
        if (isBusy) return null;
        let score = 100;
        if (currentLoad[tName] >= baselineLoad) score -= 50;
        if (classTeacherInfo[slot.classId]?.head === tName) score += 30;
        if (classTeacherInfo[slot.classId]?.subjects.some((s:any) => s.teacher === tName)) score += 15;
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

  const filteredClasses = ALL_CLASSES.filter(c => config.selectedGrades.includes('P'+c.charAt(0)));

  return (
    <div className="h-full flex flex-col bg-slate-50 relative overflow-hidden">
      {/* Top Bar */}
      <div className="bg-white border-b px-4 py-2 flex justify-between items-center shadow-sm z-20 flex-shrink-0">
        <div className="flex items-center gap-4">
           <button onClick={() => setShowConfig(!showConfig)} className={`p-1.5 rounded border transition-colors ${showConfig ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'}`}><Settings size={18} /></button>
           <div className="flex bg-slate-100 p-0.5 rounded">
             {Array.from({length: config.daysCount}, (_, i) => `Day ${i+1}`).map((d: any) => (
               <button key={d} onClick={() => setActiveDay(d)} className={`px-3 py-1 text-xs font-bold rounded transition-all ${activeDay === d ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>{d}</button>
             ))}
           </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleAutoAssign} disabled={!isDataLoaded} className={`flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-bold hover:bg-indigo-700 ${!isDataLoaded && 'opacity-50'}`}><Cpu size={14}/> 智能編配</button>
          <button onClick={saveScheduleToCloud} disabled={isSaving} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700"><Save size={14}/> {isSaving ? '儲存中...' : '儲存到雲端'}</button>
          <button onClick={handleClearDay} className="flex items-center gap-1 px-3 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded text-xs font-bold"><Trash2 size={14}/> 清空</button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        {showConfig && (
          <div className="w-64 bg-white border-r flex-shrink-0 shadow-lg z-10 flex flex-col h-full overflow-y-auto">
             <div className="p-4 space-y-6">
                {/* CSV Import */}
                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-bold text-indigo-700 uppercase flex items-center gap-1"><Upload size={12}/> 匯入教師資料</label>
                    <select value={csvEncoding} onChange={(e) => setCsvEncoding(e.target.value)} className="text-[10px] border rounded bg-white text-slate-600 px-1">
                      <option value="Big5">Big5 (港台)</option>
                      <option value="UTF-8">UTF-8</option>
                    </select>
                  </div>
                  <input type="file" accept=".csv" onChange={handleFileUpload} className="block w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:bg-indigo-600 file:text-white"/>
                  {isDataLoaded && <div className="mt-1 text-[10px] text-green-600 font-bold flex items-center gap-1"><CheckCircle size={10}/> 已載入 {teacherList.length} 筆資料</div>}
                </div>
                
                {/* Capacity Slider */}
                <div>
                   <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">預設人手</label>
                   <div className="flex items-center gap-2">
                     <input type="range" min="1" max="4" step="1" value={defaultCapacity} onChange={(e: any) => setDefaultCapacity(parseInt(e.target.value))} className="flex-1 accent-indigo-600 h-1.5 bg-slate-200 rounded-lg"/>
                     <span className="text-sm font-bold text-indigo-600">{defaultCapacity}</span>
                   </div>
                </div>

                {/* Class Info */}
                {selectedClassInfo ? (
                  <div className="bg-slate-50 rounded border border-slate-200 p-3">
                     <div className="flex justify-between mb-2 border-b pb-1">
                       <span className="font-bold text-indigo-700">{selectedClassInfo.id}</span>
                       <span className="text-[10px] text-slate-500">班主任: {selectedClassInfo.info.head}</span>
                     </div>
                     <div className="h-48 overflow-y-auto custom-scrollbar">
                       {selectedClassInfo.info.subjects.map((s:any, i:number) => (
                         <div key={i} className="flex justify-between text-[10px] py-0.5"><span className="text-slate-500">{s.subject}</span><span className="font-bold">{s.teacher}</span></div>
                       ))}
                     </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-300 text-xs py-4 border-2 border-dashed rounded">點擊課節查看詳情</div>
                )}
             </div>
          </div>
        )}

        {/* Main Grid (Compact View) */}
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
                             <div key={i} draggable onDragStart={(e) => handleDragStart(e, t, cls, p)} className="cursor-grab active:cursor-grabbing px-1 h-4 flex items-center text-[9px] bg-white border border-slate-300 rounded shadow-sm hover:border-indigo-500 hover:text-indigo-600 whitespace-nowrap">
                               {t}
                             </div>
                           ))}
                         </div>
                         <button onClick={(e) => {e.stopPropagation(); toggleSlotCapacity(cls, p)}} className="absolute bottom-0 right-0 w-3 h-3 bg-slate-200 hover:bg-slate-300 text-[8px] flex items-center justify-center rounded-tl text-slate-600 font-bold leading-none">{slot.capacity}</button>
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

// --- Main App ---
const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // System State
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
          <span>V5.4 Cloud Opt.</span>
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