// @ts-nocheck
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
  Menu,       // 新增：漢堡選單圖示
  ChevronLeft,// 新增：收起圖示
  Settings,
  Filter,
  UserMinus,
  X,
  GripHorizontal,
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

// ==========================================
// SECTION 1: GLOBAL DATA CONSTANTS
// ==========================================

const INITIAL_SCHEDULE = [
  {
    id: 1,
    day: '1月19日 (週一)',
    theme: '啟動與探索 (Discovery)',
    activities: [
      { time: '08:30 - 09:30', title: '開幕禮：未來城市設計師', level: '全校', elements: ['Communication', 'Values: 承擔精神'], skills: ['AI 認知', '好奇心'], staff: '陳主任 (統籌)' },
      { time: '10:00 - 12:00', title: '低小遊戲：情緒小偵探 (AI 表情識別)', level: 'P1-P3', elements: ['Collaboration', 'Empathy', 'Creativity'], skills: ['社交情緒', '適應性'], staff: '李老師, 張老師' }
    ]
  },
  {
    id: 2,
    day: '1月20日 (週二)',
    theme: 'STREAM 創客挑戰 (Maker)',
    activities: [
      { time: '09:00 - 12:30', title: '高小跨學科：智能家居原型製作', level: 'P4-P6', elements: ['Critical Thinking', 'Contribution', 'Creativity'], skills: ['解決複雜問題', '編程思維'], staff: 'STEM 組' }
    ]
  },
  {
    id: 3,
    day: '1月21日 (週三)',
    theme: '全方位社區考察 (Community)',
    activities: [
      { time: '09:00 - 15:00', title: '粉嶺社區價值觀考察團', level: 'P4-P6', elements: ['Communication', 'Values: 關愛', 'Values: 同理心'], skills: ['協作', '分析能力'], staff: '訓輔組' }
    ]
  },
  {
    id: 4,
    day: '1月22日 (週四)',
    theme: '成果分享與感恩 (Celebration)',
    activities: [
      { time: '10:00 - 12:00', title: '成果展示嘉年華 & 5C+ 頒獎禮', level: '全校', elements: ['Confidence', 'Appreciation', 'Values: 感恩'], skills: ['表達能力', '反思'], staff: '全體老師' }
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

// --- STAFFING SPECIFIC DATA ---
const STAFFING_DAYS = ['Day 1', 'Day 2', 'Day 3', 'Day 4'];
const STAFFING_PERIODS = [1, 2, 3, 4, 5, 6];
const STAFFING_LEVELS = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];

const CLASS_TEACHERS_MOCK = {
  '1A': ['袁紫茵', '何詠賢'], '1B': ['黃雅珍', '陳曉晴'], '1C': ['陳淑芳', '陳佩容'], '1D': ['李運娣', '陳慧淇'],
  '2A': ['陳子殷'], '2B': ['侯慧穎'], '2C': ['譚慧琨'], '2D': ['楊靖霖'], '2E': ['方慧菁'],
  '3A': ['蘇靜怡'], '3B': ['王栢榮'], '3C': ['廖小玲'], '3D': ['鄺保羅'],
  '4A': ['陳珮儀'], '4B': ['丁紹斌'], '4C': ['張展瑋'], '4D': ['呂常欣'], '4E': ['黃浩謙'],
  '5A': ['鄭愷詩'], '5B': ['黃多蔚'], '5C': ['邵家兒'], '5D': ['羅佩珊'], '5E': ['許婉寧'],
  '6A': ['陳偉芬'], '6B': ['林錦屏'], '6C': ['黎保妤'], '6D': ['黃馨慧'], '6E': ['王美麗']
};
const ALL_CLASSES = Object.keys(CLASS_TEACHERS_MOCK);
const EXTRA_TEACHERS = ['陳淑怡', '楊雅恩', '沈詠兒', '校長', '副校長', '主任'];

const getMasterTeacherList = () => {
  const teacherSet = new Set();
  Object.values(CLASS_TEACHERS_MOCK).forEach(tList => tList.forEach(t => teacherSet.add(t)));
  EXTRA_TEACHERS.forEach(t => teacherSet.add(t));
  return Array.from(teacherSet).sort();
};
const MASTER_TEACHER_LIST = getMasterTeacherList();

const TEACHER_SUBJECTS = {};
MASTER_TEACHER_LIST.forEach((t, i) => {
  const subjects = ['Chinese', 'English', 'Maths', 'GS'];
  if (i % 5 === 0) subjects.push('VA');
  if (i % 6 === 0) subjects.push('PE');
  TEACHER_SUBJECTS[t] = subjects;
});

const generateOriginalSchedules = () => {
  const schedules = {};
  MASTER_TEACHER_LIST.forEach((name) => {
    schedules[name] = {};
    STAFFING_DAYS.forEach(day => { schedules[name][day] = Math.floor(Math.random() * 4) + 3; });
  });
  return schedules;
};
const TEACHER_ORIGINAL_LOADS = generateOriginalSchedules();

// ==========================================
// SECTION 2: SUB-COMPONENTS
// ==========================================

// --- 2.1 Staffing System (Restored from V3.9) ---
const StaffingSystem = () => {
  const [showConfig, setShowConfig] = useState(true);
  const [selectedLevels, setSelectedLevels] = useState(['P1', 'P2', 'P3', 'P4', 'P5', 'P6']); 
  const [excludedTeachers, setExcludedTeachers] = useState([]);
  const [defaultCapacity, setDefaultCapacity] = useState(2); 
  const [currentDay, setCurrentDay] = useState('Day 1');
  const [schedule, setSchedule] = useState({});
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [draggedTeacher, setDraggedTeacher] = useState(null);

  // Initialize
  useEffect(() => {
    setSchedule(prev => {
      const nextSchedule = { ...prev };
      STAFFING_DAYS.forEach(day => {
        if (!nextSchedule[day]) {
          nextSchedule[day] = [];
          ALL_CLASSES.forEach(cls => {
            STAFFING_PERIODS.forEach(p => {
              nextSchedule[day].push({ classId: cls, period: p, teachers: [], capacity: defaultCapacity });
            });
          });
        } else {
          // Update capacity only, preserve teachers
          nextSchedule[day] = nextSchedule[day].map(slot => ({ ...slot, capacity: defaultCapacity }));
        }
      });
      return nextSchedule;
    });
  }, [defaultCapacity]);

  const toggleSlotCapacity = (classId, period) => {
    setSchedule(prev => {
      const daySchedule = [...(prev[currentDay] || [])];
      const slotIndex = daySchedule.findIndex(s => s.classId === classId && s.period === period);
      if (slotIndex >= 0) {
        const newCap = daySchedule[slotIndex].capacity === 1 ? 2 : 1;
        daySchedule[slotIndex] = { ...daySchedule[slotIndex], capacity: newCap };
      }
      return { ...prev, [currentDay]: daySchedule };
    });
  };

  const getTeacherLoadForDay = (teacherName, day, currentSchedule) => {
    let count = 0;
    currentSchedule.forEach(slot => { if (slot.teachers.includes(teacherName)) count++; });
    return count;
  };

  const handleAutoAssign = () => {
    if(!window.confirm(`確定執行「智能一鍵編配」嗎？\n(優先科任 -> 班主任 -> 負載平衡)`)) return;
    const newSchedule = { ...schedule };
    const dayAssignments = [...(newSchedule[currentDay] || [])];
    
    dayAssignments.forEach(slot => {
      const needed = slot.capacity - slot.teachers.length;
      if (needed <= 0) return;
      const isActivitySlot = slot.period === 3 || slot.period === 4;
      const requiredSubject = isActivitySlot ? 'VA' : 'General';
      let candidates = [];

      MASTER_TEACHER_LIST.forEach(tName => {
        if (excludedTeachers.includes(tName)) return;
        if (slot.teachers.includes(tName)) return; 
        const isBusy = dayAssignments.some(s => s.period === slot.period && s.teachers.includes(tName) && s.classId !== slot.classId);
        if (isBusy) return;

        let score = 0;
        if (requiredSubject === 'VA' && TEACHER_SUBJECTS[tName]?.includes('VA')) score += 50; 
        if (CLASS_TEACHERS_MOCK[slot.classId]?.includes(tName)) score += 30;
        const originalLoad = TEACHER_ORIGINAL_LOADS[tName]?.[currentDay] || 0;
        const currentLoad = getTeacherLoadForDay(tName, currentDay, dayAssignments);
        if (currentLoad < originalLoad) score += 10; else score -= 10;
        candidates.push({ name: tName, score });
      });
      candidates.sort((a, b) => b.score - a.score);
      const toAdd = candidates.slice(0, needed).map(c => c.name);
      slot.teachers = [...slot.teachers, ...toAdd];
    });
    setSchedule({ ...newSchedule, [currentDay]: dayAssignments });
  };

  const handleDragStart = (e, name, classId, period) => {
    setDraggedTeacher({ name, fromClass: classId, fromPeriod: period });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetClassId, targetPeriod) => {
    e.preventDefault();
    if (!draggedTeacher) return;
    const { name, fromClass, fromPeriod } = draggedTeacher;
    if (fromClass === targetClassId && fromPeriod === targetPeriod) return;

    setSchedule(prev => {
      const dayAssignments = [...(prev[currentDay] || [])];
      // Remove from source
      const sourceSlotIdx = dayAssignments.findIndex(s => s.classId === fromClass && s.period === fromPeriod);
      if (sourceSlotIdx >= 0) {
        dayAssignments[sourceSlotIdx] = { ...dayAssignments[sourceSlotIdx], teachers: dayAssignments[sourceSlotIdx].teachers.filter(t => t !== name) };
      }
      // Add to target
      const targetSlotIdx = dayAssignments.findIndex(s => s.classId === targetClassId && s.period === targetPeriod);
      if (targetSlotIdx >= 0) {
        const targetSlot = dayAssignments[targetSlotIdx];
        if (!targetSlot.teachers.includes(name)) {
           dayAssignments[targetSlotIdx] = { ...targetSlot, teachers: [...targetSlot.teachers, name] };
        }
      }
      return { ...prev, [currentDay]: dayAssignments };
    });
    setDraggedTeacher(null);
  };

  const handleRemoveDrop = (e) => {
    e.preventDefault();
    if (!draggedTeacher) return;
    const { name, fromClass, fromPeriod } = draggedTeacher;
    setSchedule(prev => {
      const dayAssignments = [...(prev[currentDay] || [])];
      const sourceSlotIdx = dayAssignments.findIndex(s => s.classId === fromClass && s.period === fromPeriod);
      if (sourceSlotIdx >= 0) {
        dayAssignments[sourceSlotIdx] = {
          ...dayAssignments[sourceSlotIdx],
          teachers: dayAssignments[sourceSlotIdx].teachers.filter(t => t !== name)
        };
      }
      return { ...prev, [currentDay]: dayAssignments };
    });
    setDraggedTeacher(null);
  };

  const teacherLoad = useMemo(() => {
    const counts = {};
    Object.values(schedule).forEach(dayList => {
       dayList.forEach(slot => { slot.teachers.forEach(t => { counts[t] = (counts[t] || 0) + 1; }); });
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count);
  }, [schedule]);

  const statsData = useMemo(() => {
    const data = [];
    const currentAssignments = schedule[currentDay] || [];
    MASTER_TEACHER_LIST.forEach(tName => {
      const original = TEACHER_ORIGINAL_LOADS[tName]?.[currentDay] || 0;
      const current = getTeacherLoadForDay(tName, currentDay, currentAssignments);
      if (original > 0 || current > 0) data.push({ name: tName, original, current });
    });
    return data.sort((a, b) => b.current - a.current);
  }, [schedule, currentDay]);

  const handleClearDay = () => {
    if(!window.confirm("確定要清空當天的所有人手編排嗎？")) return;
    setSchedule(prev => ({ ...prev, [currentDay]: prev[currentDay].map(slot => ({ ...slot, teachers: [] })) }));
  };

  const toggleLevel = (lvl) => setSelectedLevels(prev => prev.includes(lvl) ? prev.filter(l => l !== lvl) : [...prev, lvl]);
  const toggleExcludedTeacher = (t) => setExcludedTeachers(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  return (
    <div className="h-full flex flex-col animate-fadeIn bg-slate-50 relative overflow-hidden">
      {/* Top Controls Bar */}
      <div className="bg-white border-b px-6 py-3 flex justify-between items-center shadow-sm z-20 flex-shrink-0">
        <div className="flex items-center gap-4">
           <button onClick={() => setShowConfig(!showConfig)} className={`p-2 rounded-lg border transition-colors ${showConfig ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 hover:bg-slate-100'}`} title="顯示/隱藏設定"><Settings size={20} /></button>
           <div className="flex bg-slate-100 p-1 rounded-lg">
             {STAFFING_DAYS.map(d => (
               <button key={d} onClick={() => setCurrentDay(d)} className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${currentDay === d ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>{d}</button>
             ))}
           </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowStatsModal(true)} className="flex items-center gap-2 px-4 py-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-sm font-bold transition-colors"><BarChart size={18}/> 實時統計</button>
          <button onClick={handleAutoAssign} className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg text-sm font-bold hover:shadow-lg hover:from-indigo-700 hover:to-blue-700 transition-all active:scale-95"><Cpu size={18}/> 智能編配</button>
          <button onClick={handleClearDay} className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-bold transition-colors"><Trash2 size={18}/> 清空</button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Config */}
        {showConfig && (
          <div className="w-80 bg-white border-r flex-shrink-0 shadow-lg z-10 flex flex-col h-full">
             <div className="flex-1 overflow-y-auto p-5">
               <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-lg"><Filter size={20} className="text-indigo-500"/> 設定與篩選</h3>
               
               <div className="mb-8">
                 <label className="text-xs font-bold text-slate-400 mb-3 block uppercase tracking-wider">顯示年級</label>
                 <div className="grid grid-cols-3 gap-2">
                   {STAFFING_LEVELS.map(lvl => (
                     <button key={lvl} onClick={() => toggleLevel(lvl)} className={`py-2 text-xs font-bold rounded-md border transition-all ${selectedLevels.includes(lvl) ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>{lvl}</button>
                   ))}
                 </div>
               </div>

               <div className="mb-8">
                 <label className="text-xs font-bold text-slate-400 mb-3 block uppercase tracking-wider">全域預設人手</label>
                 <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                   <UserMinus size={18} className="text-slate-400"/>
                   <input type="range" min="1" max="3" step="1" value={defaultCapacity} onChange={(e) => setDefaultCapacity(parseInt(e.target.value))} className="flex-1 accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"/>
                   <span className="font-bold text-indigo-600 text-lg w-6 text-center">{defaultCapacity}</span>
                 </div>
               </div>

               <div className="mb-8">
                 <label className="text-xs font-bold text-slate-400 mb-3 block uppercase tracking-wider">排除教師 (請假)</label>
                 <div className="max-h-[200px] overflow-y-auto pr-1 space-y-1">
                   {MASTER_TEACHER_LIST.map(t => (
                     <div key={t} onClick={() => toggleExcludedTeacher(t)} className={`flex items-center gap-3 text-sm p-2 rounded-lg cursor-pointer transition-colors ${excludedTeachers.includes(t) ? 'bg-red-50 text-red-600' : 'hover:bg-slate-50 text-slate-700'}`}>
                       <div className={`w-4 h-4 rounded border flex items-center justify-center ${excludedTeachers.includes(t) ? 'bg-red-500 border-red-500' : 'border-slate-300 bg-white'}`}>{excludedTeachers.includes(t) && <X size={12} className="text-white"/>}</div>{t}
                     </div>
                   ))}
                 </div>
               </div>

               <div onDragOver={handleDragOver} onDrop={handleRemoveDrop} className={`border-2 border-dashed border-red-200 bg-red-50 rounded-xl p-4 flex flex-col items-center justify-center text-red-400 transition-colors cursor-default ${draggedTeacher ? 'bg-red-100 border-red-400 scale-105 shadow-inner' : ''}`}>
                 <Trash2 size={24} className="mb-2"/>
                 <span className="text-xs font-bold">拖曳教師至此移除</span>
               </div>
             </div>

             {/* Bottom Left Stats (Clickable) */}
             <div className="p-4 border-t bg-slate-50 cursor-pointer hover:bg-indigo-50 transition-colors group h-48 flex flex-col" onClick={() => setShowStatsModal(true)}>
               <div className="flex justify-between items-center mb-2">
                 <h4 className="font-bold text-xs text-slate-500 group-hover:text-indigo-600 flex items-center gap-2"><BarChart size={14}/> 實時工作量 Top 5</h4>
                 <span className="text-[10px] text-indigo-400 font-bold group-hover:underline">點擊放大</span>
               </div>
               <div className="flex-1 overflow-hidden">
                 <ResponsiveContainer width="100%" height="100%">
                   <RechartBar data={statsData.slice(0, 5)} layout="vertical" margin={{top:0, left:0, right:30, bottom:0}} barSize={10}>
                     <XAxis type="number" hide/>
                     <YAxis dataKey="name" type="category" width={50} tick={{fontSize: 10}} interval={0}/>
                     <Bar dataKey="current" fill="#6366f1" radius={[0, 4, 4, 0]} />
                   </RechartBar>
                 </ResponsiveContainer>
               </div>
             </div>
          </div>
        )}

        {/* Main Grid - Optimized for 1080p */}
        <div className="flex-1 overflow-auto bg-slate-100/50 p-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-w-[1200px]"> 
             <div className="grid grid-cols-[100px_repeat(6,1fr)] bg-slate-50/80 backdrop-blur border-b sticky top-0 z-10">
               <div className="p-4 text-center text-xs font-bold text-slate-500 uppercase border-r flex items-center justify-center">班別</div>
               {STAFFING_PERIODS.map(p => (
                 <div key={p} className="p-4 text-center border-r last:border-r-0"><div className="text-xs font-bold text-slate-500 mb-1">第 {p} 節</div></div>
               ))}
             </div>
             <div className="divide-y divide-slate-100">
               {ALL_CLASSES.filter(c => selectedLevels.includes('P'+c.charAt(0))).map(cls => (
                 <div key={cls} className="grid grid-cols-[100px_repeat(6,1fr)] hover:bg-slate-50/50 transition-colors group/row">
                   <div className="p-2 font-bold text-slate-700 border-r flex items-center justify-center bg-slate-50/30 text-lg">{cls}</div>
                   {STAFFING_PERIODS.map(p => {
                     const slot = schedule[currentDay]?.find(s => s.classId === cls && s.period === p);
                     if (!slot) return <div key={p} className="border-r bg-slate-50/20"></div>;
                     return (
                       <div key={p} className={`border-r p-1 last:border-r-0 min-h-[60px] relative transition-all ${draggedTeacher ? 'bg-indigo-50/30 border-dashed border-indigo-200' : ''}`} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, cls, p)}>
                         <div className="flex flex-wrap gap-1 content-start h-full pb-6">
                           {slot.teachers.map((t, i) => (
                             <div key={i} draggable onDragStart={(e) => handleDragStart(e, t, cls, p)} className="cursor-grab active:cursor-grabbing flex items-center gap-1.5 text-xs bg-white text-slate-700 pl-2 pr-1 py-1 rounded-md border border-slate-200 shadow-sm hover:shadow hover:border-indigo-300 hover:text-indigo-600 transition-all select-none">
                               <span className="font-bold">{t}</span><GripHorizontal size={12} className="text-slate-300" />
                             </div>
                           ))}
                           {slot.teachers.length === 0 && <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 text-xs italic pointer-events-none"><span>拖放至此</span></div>}
                         </div>
                         <div className="absolute bottom-0.5 right-0.5 flex gap-1">
                           <button onClick={() => toggleSlotCapacity(cls, p)} className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-100/80 hover:bg-slate-200 rounded text-[9px] text-slate-500 font-bold transition-colors border border-slate-200">目標: {slot.capacity}</button>
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
              <div><h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3"><BarChart className="text-indigo-600" /> 人手編配統計中心 (複合分析)</h2><p className="text-slate-500 mt-1 flex items-center gap-2"><span className="w-3 h-3 bg-slate-400 rounded-sm inline-block"></span> 原定節數 (Baseline) <span className="text-slate-300">|</span><span className="w-3 h-3 bg-indigo-600 rounded-sm inline-block"></span> 現時編配 (Current)</p></div>
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
                    <Bar dataKey="original" name="原定節數 (Original)" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="current" name="現時編配 (Current)" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={20}>
                       {statsData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.current > entry.original + 2 ? '#ef4444' : '#4f46e5'} />))}
                    </Bar>
                  </RechartBar>
                </ResponsiveContainer>
              </div>
              <p className="text-center text-sm text-slate-500 mt-6 bg-yellow-50 p-2 rounded-lg border border-yellow-100 inline-block mx-auto"><span className="text-yellow-600 font-bold">💡 提示：</span> 紅色柱狀代表該教師工作量已超過原定節數 2 節以上，建議進行人手調整。</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// SECTION 3: MAIN APP COMPONENT
// ==========================================

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default open
  
  // Dummy AI Design Component
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

  // Dashboard View
  const DashboardView = () => (
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
          <div className="bg-gradient-to-br from-orange-400 to-pink-500 p-8 rounded-2xl shadow-lg text-white flex flex-col justify-between"><h3 className="font-semibold opacity-90">距離活動開始</h3><p className="text-5xl font-bold">10 天</p><p className="text-sm opacity-90 mt-2">1月19日</p></div>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Calendar className="text-indigo-600" /> 課程統整周流程</h3></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{INITIAL_SCHEDULE.map(day => (<div key={day.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100"><h4 className="font-bold text-slate-800">{day.day}</h4><p className="text-sm text-indigo-600 mb-2">{day.theme}</p><ul className="space-y-1">{day.activities.map((act,i)=><li key={i} className="text-xs text-slate-500 truncate">• {act.title}</li>)}</ul></div>))}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-slate-50 font-sans text-slate-900 flex overflow-hidden">
      
      {/* 1. COLLAPSIBLE SIDEBAR */}
      <nav className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-white border-r flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden flex flex-col relative z-30`}>
        <div className="p-4 border-b flex items-center gap-2 bg-indigo-900 text-white h-16">
          <Brain className="flex-shrink-0" />
          <span className="font-bold truncate">課程指揮中心</span>
        </div>
        <div className="flex-1 overflow-y-auto py-4 space-y-1">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-slate-50 text-slate-600 transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600' : ''}`}><Layout size={20} /><span className="truncate">總覽儀表板</span></button>
          <button onClick={() => setActiveTab('staff')} className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-slate-50 text-slate-600 transition-colors ${activeTab === 'staff' ? 'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600' : ''}`}><Users size={20} /><span className="truncate">人手與資源分配</span></button>
          <button onClick={() => setActiveTab('ai-design')} className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-slate-50 text-slate-600 transition-colors ${activeTab === 'ai-design' ? 'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600' : ''}`}><Cpu size={20} /><span className="truncate">AI 課程設計</span></button>
          <button onClick={() => setActiveTab('export')} className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-slate-50 text-slate-600 transition-colors ${activeTab === 'export' ? 'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600' : ''}`}><Share2 size={20} /><span className="truncate">發布與報告</span></button>
        </div>
        <div className="p-4 border-t text-xs text-slate-400 text-center">V4.1 Ultimate</div>
      </nav>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Header Bar with Toggle */}
        <header className="bg-white h-16 border-b px-4 flex items-center justify-between shadow-sm z-20 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
              {isSidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="text-lg font-bold text-slate-800 truncate">
              {activeTab === 'dashboard' && '總覽儀表板'}
              {activeTab === 'staff' && '智能人手編配系統'}
              {activeTab === 'ai-design' && 'AI 課程設計助手'}
              {activeTab === 'export' && '總編輯控制台'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100">正覺蓮社學校</div>
            <div className="w-8 h-8 bg-indigo-900 rounded-full flex items-center justify-center text-white text-xs font-bold">陳</div>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden relative bg-slate-50">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'staff' && <StaffingSystem />}
          {activeTab === 'ai-design' && <AiDesignView />}
          {activeTab === 'export' && (
            <div className="h-full p-8 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <Share2 size={48} className="mx-auto mb-4 opacity-20"/>
                <p>總編輯功能模組 (參考 V3.6 代碼)</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
