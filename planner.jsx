import React, { useState, useMemo, useEffect } from "react";
import {
  Calendar as CalIcon, LayoutDashboard, Code2, GraduationCap, Brain,
  Dumbbell, BarChart3, Settings as SettingsIcon, Plus, X, Check,
  ChevronLeft, ChevronRight, Trash2, Pencil, Flame, AlertTriangle,
  Clock, Target
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  CONSTANTS                                                          */
/* ------------------------------------------------------------------ */

const CATS = {
  Coding: { label: "Coding", emoji: "💻", ring: "#7C5CFF", bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500", border: "border-violet-200" },
  Academic: { label: "Academic", emoji: "📚", ring: "#2563EB", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", border: "border-blue-200" },
  Skill: { label: "Skill Development", emoji: "🧠", ring: "#16A34A", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-200" },
  Workout: { label: "Workout", emoji: "🏋️", ring: "#EA580C", bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500", border: "border-orange-200" },
  Test: { label: "Test", emoji: "📝", ring: "#DC2626", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500", border: "border-red-200" },
  Exam: { label: "Exam", emoji: "🎯", ring: "#CA8A04", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", border: "border-amber-200" },
  Personal: { label: "Personal", emoji: "•", ring: "#64748B", bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-400", border: "border-slate-200" },
};

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const uid = () => Math.random().toString(36).slice(2, 10);
const dkey = (d) => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`; };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate()+n); return x; };
const today = new Date();
const todayKey = dkey(today);

/* ------------------------------------------------------------------ */
/*  SEED DATA                                                          */
/* ------------------------------------------------------------------ */

const seedSubjects = [
  "Discrete Mathematics", "Data Structures", "Operating Systems",
  "Computer Architecture", "Database Management Systems", "Python Programming"
];

const seedCodingSchedule = {
  Monday: ["LeetCode", "Skillrack"],
  Tuesday: ["LeetCode", "CodeChef"],
  Wednesday: ["LeetCode", "HackerRank"],
  Thursday: ["LeetCode", "Skillrack"],
  Friday: ["LeetCode", "Codeforces"],
  Saturday: ["Skillrack"],
  Sunday: ["Review"],
};

const seedSkillRoadmap = [
  { id: uid(), skill: "Embedded Systems", progress: 20, topics: [
    { id: uid(), name: "Introduction to Embedded Systems", done: true },
    { id: uid(), name: "Microcontrollers", done: false },
    { id: uid(), name: "Microprocessors", done: false },
    { id: uid(), name: "GPIO", done: false },
    { id: uid(), name: "Timers", done: false },
    { id: uid(), name: "Interrupts", done: false },
    { id: uid(), name: "UART", done: false },
    { id: uid(), name: "SPI", done: false },
    { id: uid(), name: "I2C", done: false },
  ]},
  { id: uid(), skill: "IoT", progress: 0, topics: [] },
  { id: uid(), skill: "Embedded C", progress: 0, topics: [] },
  { id: uid(), skill: "C Programming", progress: 0, topics: [] },
];

function seedTasksForToday() {
  const base = [
    { category: "Coding", name: "LeetCode", priority: "High", duration: 45 },
    { category: "Coding", name: "Skillrack", priority: "Medium", duration: 30 },
    { category: "Academic", name: "Data Structures Study", priority: "High", duration: 90 },
    { category: "Skill", name: "Embedded Systems — Microcontrollers", priority: "Medium", duration: 45 },
    { category: "Workout", name: "Workout", priority: "Medium", duration: 40 },
    { category: "Personal", name: "Python Practice", priority: "Low", duration: 30 },
  ];
  return base.map((t, i) => ({
    id: uid(), date: todayKey, notes: "", completed: i === 0, ...t,
  }));
}

/* ------------------------------------------------------------------ */
/*  MAIN APP                                                           */
/* ------------------------------------------------------------------ */

export default function App() {
  const [view, setView] = useState("dashboard");
  const [tasks, setTasks] = useState(seedTasksForToday);
  const [subjects, setSubjects] = useState(seedSubjects);
  const [syllabus, setSyllabus] = useState({});
  const [exams, setExams] = useState([
    { id: uid(), subject: "Data Structures", date: "2026-08-31", time: "10:00 AM", priority: "Normal" },
  ]);
  const [codingSchedule, setCodingSchedule] = useState(seedCodingSchedule);
  const [skillRoadmap, setSkillRoadmap] = useState(seedSkillRoadmap);
  const [workoutPlan, setWorkoutPlan] = useState({});
  const [settings, setSettings] = useState({
    skillrackTestTime: "6:00 PM",
    limits: { Coding: 120, Academic: 240, Skill: 60, Workout: 60 },
  });
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [dayPanelOpen, setDayPanelOpen] = useState(false);

  useEffect(() => {
    const start = addDays(today, -3);
    const end = addDays(today, 45);
    setTasks((prev) => {
      const existingKeys = new Set(prev.map((t) => `${t.date}|${t.name}|${t.category}`));
      const additions = [];
      for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
        const dow = DAYS[d.getDay()];
        const dk = dkey(d);
        (codingSchedule[dow] || []).forEach((platform) => {
          const name = platform === "Review" ? "Review / Optional Coding Practice" : platform;
          const key = `${dk}|${name}|Coding`;
          if (!existingKeys.has(key)) {
            additions.push({ id: uid(), date: dk, category: "Coding", name, priority: "Medium", duration: 45, notes: "", completed: false, recurring: true });
            existingKeys.add(key);
          }
        });
        if (dow === "Saturday") {
          const key = `${dk}|Skillrack Weekly Test|Test`;
          if (!existingKeys.has(key)) {
            additions.push({ id: uid(), date: dk, category: "Test", name: "Skillrack Weekly Test", priority: "High", duration: 60, notes: `Scheduled ${settings.skillrackTestTime}`, completed: false, recurring: true });
            existingKeys.add(key);
          }
        }
        const w = workoutPlan[dow];
        if (w && w.name) {
          const key = `${dk}|${w.name}|Workout`;
          if (!existingKeys.has(key)) {
            additions.push({ id: uid(), date: dk, category: "Workout", name: w.name, priority: "Medium", duration: 40, notes: "", completed: false, recurring: true });
            existingKeys.add(key);
          }
        }
      }
      return additions.length ? [...prev, ...additions] : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codingSchedule, workoutPlan, settings.skillrackTestTime]);

  const tasksByDate = useMemo(() => {
    const m = {};
    tasks.forEach((t) => { (m[t.date] = m[t.date] || []).push(t); });
    return m;
  }, [tasks]);

  const dayProgress = (dk) => {
    const list = tasksByDate[dk] || [];
    if (!list.length) return { pct: 0, done: 0, total: 0 };
    const done = list.filter((t) => t.completed).length;
    return { pct: Math.round((done / list.length) * 100), done, total: list.length };
  };

  const daysUntil = (dateStr) => Math.ceil((new Date(dateStr + "T00:00:00") - new Date(todayKey + "T00:00:00")) / 86400000);

  const examPriority = (dateStr) => {
    const d = daysUntil(dateStr);
    if (d <= 7) return { label: "Very High", color: "text-red-600" };
    if (d <= 14) return { label: "High", color: "text-orange-600" };
    if (d <= 30) return { label: "Medium", color: "text-amber-600" };
    return { label: "Normal", color: "text-slate-500" };
  };

  const addTask = (t) => setTasks((p) => [...p, { id: uid(), completed: false, notes: "", duration: 30, priority: "Medium", ...t }]);
  const updateTask = (id, patch) => setTasks((p) => p.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const removeTask = (id) => setTasks((p) => p.filter((t) => t.id !== id));
  const toggleTask = (id) => setTasks((p) => p.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));

  const generateStudyPlan = (exam) => {
    const topics = syllabus[exam.subject] || [];
    if (!topics.length) return;
    const days = Math.max(daysUntil(exam.date) - 1, 1);
    const perDay = Math.max(1, Math.ceil(topics.length / Math.min(days, topics.length + 3)));
    const additions = [];
    let topicIdx = 0;
    let dayOffset = 0;
    while (topicIdx < topics.length && dayOffset < days) {
      const d = addDays(today, dayOffset);
      const dk = dkey(d);
      const existingLoad = (tasksByDate[dk] || []).filter((t) => t.category === "Academic")
        .reduce((s, t) => s + (t.duration || 0), 0);
      if (existingLoad < settings.limits.Academic) {
        const slice = topics.slice(topicIdx, topicIdx + perDay);
        if (slice.length) {
          additions.push({
            id: uid(), date: dk, category: "Academic",
            name: `${exam.subject} Study — ${slice.join(", ")}`,
            priority: examPriority(exam.date).label === "Normal" ? "Medium" : examPriority(exam.date).label,
            duration: 90, notes: "", completed: false, recurring: false,
          });
          topicIdx += perDay;
        }
      }
      dayOffset++;
    }
    if (topicIdx >= topics.length) {
      const revDk = dkey(addDays(new Date(exam.date + "T00:00:00"), -1));
      additions.push({
        id: uid(), date: revDk, category: "Academic",
        name: `${exam.subject} Revision — Full Syllabus`,
        priority: "Very High", duration: 120, notes: "", completed: false,
      });
    }
    setTasks((p) => [...p, ...additions]);
  };

  const weekStats = useMemo(() => {
    const start = addDays(today, -today.getDay());
    const days = Array.from({ length: 7 }, (_, i) => dkey(addDays(start, i)));
    const cats = ["Coding", "Academic", "Skill", "Workout"];
    const stats = {};
    cats.forEach((c) => { stats[c] = { planned: 0, completed: 0 }; });
    days.forEach((dk) => {
      (tasksByDate[dk] || []).forEach((t) => {
        if (stats[t.category]) {
          stats[t.category].planned++;
          if (t.completed) stats[t.category].completed++;
        }
      });
    });
    const totalPlanned = cats.reduce((s, c) => s + stats[c].planned, 0);
    const totalDone = cats.reduce((s, c) => s + stats[c].completed, 0);
    return { days, stats, totalPlanned, totalDone, pct: totalPlanned ? Math.round((totalDone/totalPlanned)*100) : 0 };
  }, [tasksByDate]);

  const streak = (cat) => {
    let n = 0;
    for (let i = 0; i < 60; i++) {
      const dk = dkey(addDays(today, -i));
      const list = (tasksByDate[dk] || []).filter((t) => cat === "Overall" || t.category === cat);
      if (!list.length) { if (i === 0) continue; break; }
      const allDone = list.every((t) => t.completed);
      if (allDone) n++; else break;
    }
    return n;
  };

  const upcomingExams = [...exams].sort((a,b) => a.date.localeCompare(b.date));

  const nav = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "calendar", label: "Calendar", icon: CalIcon },
    { id: "coding", label: "Coding", icon: Code2 },
    { id: "academics", label: "Academics", icon: GraduationCap },
    { id: "skills", label: "Skills", icon: Brain },
    { id: "workout", label: "Workout", icon: Dumbbell },
    { id: "review", label: "Weekly Review", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  const openDay = (dk) => { setSelectedDate(dk); setDayPanelOpen(true); };

  return (
    <div className="min-h-screen w-full flex text-[#1B1F27]" style={{ background: "#F6F7FA", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      <aside className="w-56 shrink-0 border-r border-slate-200 bg-white flex flex-col py-5 px-3">
        <div className="px-2 mb-6">
          <div className="font-display font-bold text-lg tracking-tight" style={{ color: "#1B1F27" }}>Command<span style={{ color: "#7C5CFF" }}>/</span>Center</div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">{MONTHS[today.getMonth()]} {today.getDate()}, {today.getFullYear()}</div>
        </div>
        <nav className="flex-1 space-y-0.5">
          {nav.map((n) => {
            const Icon = n.icon;
            const active = view === n.id;
            return (
              <button key={n.id} onClick={() => setView(n.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active ? "bg-[#1B1F27] text-white" : "text-slate-600 hover:bg-slate-100"}`}>
                <Icon size={16} strokeWidth={2} />
                {n.label}
              </button>
            );
          })}
        </nav>
        <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-snug">
          Data lives in this session only. Copy the code to run it locally with real persistence.
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {view === "dashboard" && (
          <Dashboard {...{ tasksByDate, dayProgress, upcomingExams, examPriority, codingSchedule, skillRoadmap, streak, openDay, toggleTask }} />
        )}
        {view === "calendar" && (
          <CalendarView {...{ tasksByDate, dayProgress, openDay }} />
        )}
        {view === "coding" && (
          <CodingView {...{ codingSchedule, setCodingSchedule }} />
        )}
        {view === "academics" && (
          <AcademicsView {...{ subjects, setSubjects, syllabus, setSyllabus, exams, setExams, examPriority, generateStudyPlan, daysUntil }} />
        )}
        {view === "skills" && (
          <SkillsView {...{ skillRoadmap, setSkillRoadmap }} />
        )}
        {view === "workout" && (
          <WorkoutView {...{ workoutPlan, setWorkoutPlan }} />
        )}
        {view === "review" && (
          <WeeklyReview {...{ weekStats }} />
        )}
        {view === "settings" && (
          <SettingsView {...{ settings, setSettings }} />
        )}
      </main>

      {dayPanelOpen && (
        <DayPanel
          dateKey={selectedDate}
          tasks={(tasksByDate[selectedDate] || []).slice().sort((a,b)=> (a.category>b.category?1:-1))}
          onClose={() => setDayPanelOpen(false)}
          onToggle={toggleTask}
          onAdd={addTask}
          onUpdate={updateTask}
          onRemove={removeTask}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SHARED BITS                                                        */
/* ------------------------------------------------------------------ */

function Ring({ pct, size = 34 }) {
  const r = (size - 4) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} stroke="#E5E7EB" strokeWidth="4" fill="none" />
      <circle cx={size/2} cy={size/2} r={r} stroke="#7C5CFF" strokeWidth="4" fill="none"
        strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100} strokeLinecap="round" />
    </svg>
  );
}

function Badge({ cat }) {
  const c = CATS[cat] || CATS.Personal;
  return <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded ${c.bg} ${c.text}`}>{c.emoji} {c.label}</span>;
}

function PriorityDot({ p }) {
  const color = p === "Very High" ? "bg-red-500" : p === "High" ? "bg-orange-500" : p === "Medium" ? "bg-amber-400" : "bg-slate-300";
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${color}`} title={p}></span>;
}

function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="font-display font-bold text-2xl tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  DASHBOARD                                                           */
/* ------------------------------------------------------------------ */

function Dashboard({ tasksByDate, dayProgress, upcomingExams, examPriority, codingSchedule, skillRoadmap, streak, openDay, toggleTask }) {
  const dk = todayKey;
  const list = (tasksByDate[dk] || []);
  const prog = dayProgress(dk);
  const dow = DAYS[today.getDay()];
  const nextExam = upcomingExams[0];

  return (
    <div className="p-8 max-w-6xl">
      <SectionHeader title={`${dow}, ${MONTHS[today.getMonth()]} ${today.getDate()}`} subtitle="Here's what your day looks like." />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Today's Progress" value={`${prog.pct}%`} sub={`${prog.done}/${prog.total} completed`} accent="#7C5CFF" />
        <StatCard label="Pending Tasks" value={prog.total - prog.done} sub="left to do" accent="#EA580C" />
        <StatCard label="Overall Streak" value={streak("Overall")} sub="days on track" icon={<Flame size={16} className="text-orange-500"/>} accent="#DC2626" />
        <StatCard label="Next Exam" value={nextExam ? examPriority(nextExam.date).label : "—"} sub={nextExam ? `${nextExam.subject}` : "none scheduled"} accent="#CA8A04" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-sm">Today's Tasks</h3>
            <button onClick={() => openDay(dk)} className="text-xs text-violet-600 font-medium hover:underline">Open full day →</button>
          </div>
          <div className="space-y-1.5">
            {list.length === 0 && <p className="text-sm text-slate-400">No tasks yet for today.</p>}
            {list.map((t) => (
              <label key={t.id} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input type="checkbox" checked={t.completed} onChange={() => toggleTask(t.id)}
                  className="w-4 h-4 rounded accent-violet-600" />
                <span className={`text-sm flex-1 ${t.completed ? "line-through text-slate-400" : "text-slate-700"}`}>{t.name}</span>
                <PriorityDot p={t.priority} />
                <Badge cat={t.category} />
              </label>
            ))}
          </div>
          <div className="mt-4 h-2 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${prog.pct}%` }} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-display font-semibold text-sm mb-3">Upcoming Exams</h3>
            {upcomingExams.length === 0 && <p className="text-sm text-slate-400">No exams scheduled.</p>}
            <div className="space-y-2">
              {upcomingExams.slice(0,4).map((e) => {
                const d = Math.ceil((new Date(e.date+"T00:00:00") - today) / 86400000);
                return (
                  <div key={e.id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">{e.subject}</span>
                    <span className={`font-mono text-xs ${examPriority(e.date).color}`}>{d >= 0 ? `${d}d` : "past"}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-display font-semibold text-sm mb-3">Today's Coding Focus</h3>
            <div className="flex flex-wrap gap-1.5">
              {(codingSchedule[dow] || []).map((p) => (
                <span key={p} className="text-xs px-2 py-1 rounded bg-violet-50 text-violet-700 font-medium">{p}</span>
              ))}
              {(codingSchedule[dow] || []).length === 0 && <span className="text-sm text-slate-400">Rest day</span>}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-display font-semibold text-sm mb-3">Learning Focus</h3>
            {skillRoadmap.filter(s => s.progress < 100).slice(0,2).map((s) => (
              <div key={s.id} className="mb-2 last:mb-0">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700 font-medium">{s.skill}</span>
                  <span className="text-slate-400 font-mono">{s.progress}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${s.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, accent, icon }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="text-[11px] uppercase tracking-wide text-slate-400 font-medium mb-1">{label}</div>
      <div className="font-display font-bold text-2xl flex items-center gap-1.5" style={{ color: accent }}>{icon}{value}</div>
      <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CALENDAR                                                            */
/* ------------------------------------------------------------------ */

function CalendarView({ tasksByDate, dayProgress, openDay }) {
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const year = cursor.getFullYear(), month = cursor.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  return (
    <div className="p-8 max-w-6xl">
      <SectionHeader
        title="Calendar"
        subtitle="Click any date to see everything you need to do."
        action={
          <div className="flex items-center gap-2">
            <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"><ChevronLeft size={16}/></button>
            <div className="font-display font-semibold text-sm w-32 text-center">{MONTHS[month]} {year}</div>
            <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"><ChevronRight size={16}/></button>
            <button onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))} className="ml-2 text-xs px-3 py-1.5 rounded-lg bg-[#1B1F27] text-white font-medium">Today</button>
          </div>
        }
      />

      <div className="grid grid-cols-7 gap-2 mb-2">
        {DAYS.map((d) => <div key={d} className="text-[11px] font-medium text-slate-400 uppercase tracking-wide text-center py-1">{d.slice(0,3)}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const dk = dkey(d);
          const list = tasksByDate[dk] || [];
          const prog = dayProgress(dk);
          const cats = [...new Set(list.map((t) => t.category))];
          const isToday = dk === todayKey;
          return (
            <button key={dk} onClick={() => openDay(dk)}
              className={`h-24 rounded-xl border p-2 text-left flex flex-col justify-between transition-colors bg-white hover:border-violet-300 ${isToday ? "border-violet-400 ring-1 ring-violet-200" : "border-slate-200"}`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${isToday ? "text-violet-600" : "text-slate-700"}`}>{d.getDate()}</span>
                {list.length > 0 && <Ring pct={prog.pct} size={20} />}
              </div>
              <div className="flex flex-wrap gap-1">
                {cats.slice(0,5).map((c) => <span key={c} className={`w-1.5 h-1.5 rounded-full ${CATS[c]?.dot}`} title={c}></span>)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  DAY PANEL (drawer)                                                  */
/* ------------------------------------------------------------------ */

function DayPanel({ dateKey, tasks, onClose, onToggle, onAdd, onUpdate, onRemove }) {
  const [form, setForm] = useState(null);
  const done = tasks.filter((t) => t.completed).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const grouped = {};
  tasks.forEach((t) => { (grouped[t.category] = grouped[t.category] || []).push(t); });
  const d = new Date(dateKey + "T00:00:00");

  const startAdd = () => setForm({ id: null, category: "Personal", name: "", priority: "Medium", duration: 30, notes: "", date: dateKey });
  const startEdit = (t) => setForm({ ...t });
  const save = () => {
    if (!form.name.trim()) return;
    if (form.id) onUpdate(form.id, form); else onAdd(form);
    setForm(null);
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative w-[420px] max-w-full bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 font-mono">{DAYS[d.getDay()]}</div>
              <div className="font-display font-bold text-lg">{MONTHS[d.getMonth()]} {d.getDate()}</div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18}/></button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-violet-500" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-mono text-slate-500">{pct}%</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {Object.keys(CATS).filter(c => grouped[c]).map((c) => (
            <div key={c}>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2 flex items-center gap-1">{CATS[c].emoji} {CATS[c].label}</div>
              <div className="space-y-1.5">
                {grouped[c].map((t) => (
                  <div key={t.id} className="group flex items-start gap-2 p-2 rounded-lg border border-slate-100 hover:border-slate-200">
                    <input type="checkbox" checked={t.completed} onChange={() => onToggle(t.id)} className="mt-0.5 w-4 h-4 rounded accent-violet-600" />
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm ${t.completed ? "line-through text-slate-400" : "text-slate-700"}`}>{t.name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <PriorityDot p={t.priority} />
                        <span className="text-[11px] text-slate-400 flex items-center gap-0.5"><Clock size={10}/>{t.duration}m</span>
                        {t.notes && <span className="text-[11px] text-slate-400 truncate">· {t.notes}</span>}
                      </div>
                    </div>
                    <div className="hidden group-hover:flex gap-1">
                      <button onClick={() => startEdit(t)} className="p-1 text-slate-400 hover:text-violet-600"><Pencil size={13}/></button>
                      <button onClick={() => onRemove(t.id)} className="p-1 text-slate-400 hover:text-red-600"><Trash2 size={13}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {tasks.length === 0 && <p className="text-sm text-slate-400 text-center py-8">Nothing planned for this day yet.</p>}

          {form && (
            <div className="border border-violet-200 bg-violet-50/40 rounded-lg p-3 space-y-2">
              <input autoFocus placeholder="Task name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
                className="w-full text-sm px-2 py-1.5 rounded border border-slate-200" />
              <div className="grid grid-cols-2 gap-2">
                <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="text-sm px-2 py-1.5 rounded border border-slate-200">
                  {Object.keys(CATS).map((c) => <option key={c} value={c}>{CATS[c].label}</option>)}
                </select>
                <select value={form.priority} onChange={(e) => setForm({...form, priority: e.target.value})} className="text-sm px-2 py-1.5 rounded border border-slate-200">
                  {["Low","Medium","High","Very High"].map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" placeholder="Minutes" value={form.duration} onChange={(e) => setForm({...form, duration: Number(e.target.value)})} className="text-sm px-2 py-1.5 rounded border border-slate-200" />
                <input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className="text-sm px-2 py-1.5 rounded border border-slate-200" />
              </div>
              <input placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} className="w-full text-sm px-2 py-1.5 rounded border border-slate-200" />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setForm(null)} className="text-xs px-3 py-1.5 rounded text-slate-500">Cancel</button>
                <button onClick={save} className="text-xs px-3 py-1.5 rounded bg-violet-600 text-white font-medium">Save</button>
              </div>
            </div>
          )}
        </div>

        {!form && (
          <div className="p-4 border-t border-slate-100">
            <button onClick={startAdd} className="w-full flex items-center justify-center gap-1.5 text-sm font-medium py-2 rounded-lg bg-[#1B1F27] text-white">
              <Plus size={15}/> Add Task
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CODING                                                              */
/* ------------------------------------------------------------------ */

const PLATFORMS = ["LeetCode", "Skillrack", "CodeChef", "HackerRank", "Codeforces", "Review"];

function CodingView({ codingSchedule, setCodingSchedule }) {
  const toggle = (day, p) => {
    setCodingSchedule((s) => {
      const list = s[day] || [];
      const next = list.includes(p) ? list.filter((x) => x !== p) : [...list, p];
      return { ...s, [day]: next };
    });
  };
  return (
    <div className="p-8 max-w-5xl">
      <SectionHeader title="Coding Practice" subtitle="Assign platforms to each day of the week. Editable anytime — nothing here is hard-coded." />
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-slate-400 text-xs uppercase">
              <th className="p-3 font-medium">Day</th>
              {PLATFORMS.map((p) => <th key={p} className="p-3 font-medium text-center">{p}</th>)}
            </tr>
          </thead>
          <tbody>
            {DAYS.slice(1).concat(DAYS[0]).map((day) => (
              <tr key={day} className="border-b border-slate-50 last:border-0">
                <td className="p-3 font-medium text-slate-700">{day}</td>
                {PLATFORMS.map((p) => (
                  <td key={p} className="p-3 text-center">
                    <input type="checkbox" checked={(codingSchedule[day]||[]).includes(p)} onChange={() => toggle(day, p)} className="w-4 h-4 accent-violet-600 rounded" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400 mt-3">Skillrack Weekly Test is scheduled separately in Settings and always appears on Saturdays.</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ACADEMICS                                                           */
/* ------------------------------------------------------------------ */

function AcademicsView({ subjects, setSubjects, syllabus, setSyllabus, exams, setExams, examPriority, generateStudyPlan, daysUntil }) {
  const [newSubject, setNewSubject] = useState("");
  const [topicInput, setTopicInput] = useState({});
  const [examForm, setExamForm] = useState({ subject: subjects[0] || "", date: "", time: "10:00 AM" });

  const addSubject = () => { if (newSubject.trim()) { setSubjects([...subjects, newSubject.trim()]); setNewSubject(""); } };
  const addTopic = (subj) => {
    const val = (topicInput[subj] || "").trim();
    if (!val) return;
    setSyllabus((s) => ({ ...s, [subj]: [...(s[subj]||[]), val] }));
    setTopicInput({ ...topicInput, [subj]: "" });
  };
  const removeTopic = (subj, i) => setSyllabus((s) => ({ ...s, [subj]: s[subj].filter((_,idx)=>idx!==i) }));
  const addExam = () => {
    if (!examForm.subject || !examForm.date) return;
    setExams((e) => [...e, { id: uid(), ...examForm }]);
    setExamForm({ subject: subjects[0] || "", date: "", time: "10:00 AM" });
  };

  return (
    <div className="p-8 max-w-5xl">
      <SectionHeader title="Academics" subtitle="Subjects, syllabus, and exam dates — the app builds your study calendar from these." />

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-display font-semibold text-sm mb-3">Subjects</h3>
          <div className="space-y-1.5 mb-3">
            {subjects.map((s) => (
              <div key={s} className="flex items-center justify-between text-sm px-2 py-1.5 rounded bg-slate-50">
                <span>{s}</span>
                <button onClick={() => setSubjects(subjects.filter(x=>x!==s))} className="text-slate-300 hover:text-red-500"><X size={14}/></button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={newSubject} onChange={(e)=>setNewSubject(e.target.value)} placeholder="Add subject" className="flex-1 text-sm px-2 py-1.5 rounded border border-slate-200" />
            <button onClick={addSubject} className="px-3 rounded bg-slate-800 text-white text-sm">Add</button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-display font-semibold text-sm mb-3">Schedule an Exam</h3>
          <div className="space-y-2">
            <select value={examForm.subject} onChange={(e)=>setExamForm({...examForm, subject:e.target.value})} className="w-full text-sm px-2 py-1.5 rounded border border-slate-200">
              {subjects.map((s) => <option key={s}>{s}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input type="date" value={examForm.date} onChange={(e)=>setExamForm({...examForm, date:e.target.value})} className="text-sm px-2 py-1.5 rounded border border-slate-200" />
              <input value={examForm.time} onChange={(e)=>setExamForm({...examForm, time:e.target.value})} placeholder="Time" className="text-sm px-2 py-1.5 rounded border border-slate-200" />
            </div>
            <button onClick={addExam} className="w-full py-1.5 rounded bg-amber-500 text-white text-sm font-medium">Add Exam</button>
          </div>
        </div>
      </div>

      <h3 className="font-display font-semibold text-sm mt-8 mb-3">Syllabus by Subject</h3>
      <div className="grid grid-cols-2 gap-4">
        {subjects.map((s) => (
          <div key={s} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-sm font-medium mb-2">{s}</div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {(syllabus[s]||[]).map((t,i) => (
                <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded flex items-center gap-1">
                  {t} <button onClick={()=>removeTopic(s,i)}><X size={11}/></button>
                </span>
              ))}
              {(syllabus[s]||[]).length === 0 && <span className="text-xs text-slate-400">No portions entered yet.</span>}
            </div>
            <div className="flex gap-2">
              <input value={topicInput[s]||""} onChange={(e)=>setTopicInput({...topicInput, [s]:e.target.value})}
                onKeyDown={(e)=> e.key==="Enter" && addTopic(s)}
                placeholder="Add topic + Enter" className="flex-1 text-xs px-2 py-1.5 rounded border border-slate-200" />
              <button onClick={()=>addTopic(s)} className="px-2 rounded bg-slate-100 text-slate-600 text-xs">Add</button>
            </div>
          </div>
        ))}
      </div>

      <h3 className="font-display font-semibold text-sm mt-8 mb-3">Upcoming Exams</h3>
      <div className="space-y-2">
        {exams.slice().sort((a,b)=>a.date.localeCompare(b.date)).map((e) => {
          const d = daysUntil(e.date);
          const pr = examPriority(e.date);
          return (
            <div key={e.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">{e.subject}</div>
                <div className="text-xs text-slate-400 mt-0.5">{e.date} · {e.time} · {(syllabus[e.subject]||[]).length} portions</div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-mono ${pr.color}`}>{d >= 0 ? `${d}d — ${pr.label}` : "past"}</span>
                <button onClick={() => generateStudyPlan(e)} className="text-xs px-3 py-1.5 rounded bg-blue-600 text-white font-medium flex items-center gap-1">
                  <Target size={12}/> Generate Study Plan
                </button>
                <button onClick={() => setExams(exams.filter(x=>x.id!==e.id))} className="text-slate-300 hover:text-red-500"><Trash2 size={14}/></button>
              </div>
            </div>
          );
        })}
        {exams.length === 0 && <p className="text-sm text-slate-400">No exams yet — add one above.</p>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SKILLS                                                              */
/* ------------------------------------------------------------------ */

function SkillsView({ skillRoadmap, setSkillRoadmap }) {
  const [topicInput, setTopicInput] = useState({});
  const [newSkill, setNewSkill] = useState("");

  const recalc = (skill) => {
    const total = skill.topics.length;
    const done = skill.topics.filter(t=>t.done).length;
    return total ? Math.round((done/total)*100) : skill.progress;
  };

  const addTopic = (skillId) => {
    const val = (topicInput[skillId]||"").trim();
    if (!val) return;
    setSkillRoadmap((list) => list.map((s) => s.id === skillId ? { ...s, topics: [...s.topics, { id: uid(), name: val, done:false }] } : s));
    setTopicInput({ ...topicInput, [skillId]: "" });
  };
  const toggleTopic = (skillId, topicId) => {
    setSkillRoadmap((list) => list.map((s) => {
      if (s.id !== skillId) return s;
      const topics = s.topics.map(t => t.id === topicId ? { ...t, done: !t.done } : t);
      const total = topics.length;
      const done = topics.filter(t=>t.done).length;
      return { ...s, topics, progress: total ? Math.round((done/total)*100) : s.progress };
    }));
  };
  const addSkill = () => {
    if (!newSkill.trim()) return;
    setSkillRoadmap((l) => [...l, { id: uid(), skill: newSkill.trim(), progress: 0, topics: [] }]);
    setNewSkill("");
  };

  return (
    <div className="p-8 max-w-5xl">
      <SectionHeader title="Skills & Learning Roadmap" subtitle="Long-term technical skills, broken into topics." />
      <div className="grid grid-cols-2 gap-4">
        {skillRoadmap.map((s) => (
          <div key={s.id} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-sm">{s.skill}</div>
              <span className="text-xs font-mono text-emerald-600">{recalc(s)}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-emerald-500" style={{ width: `${recalc(s)}%` }} />
            </div>
            <div className="space-y-1 mb-2 max-h-40 overflow-y-auto">
              {s.topics.map((t) => (
                <label key={t.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={t.done} onChange={()=>toggleTopic(s.id,t.id)} className="w-3.5 h-3.5 accent-emerald-600 rounded" />
                  <span className={t.done ? "line-through text-slate-400" : "text-slate-700"}>{t.name}</span>
                </label>
              ))}
              {s.topics.length === 0 && <p className="text-xs text-slate-400">No topics yet.</p>}
            </div>
            <div className="flex gap-2">
              <input value={topicInput[s.id]||""} onChange={(e)=>setTopicInput({...topicInput,[s.id]:e.target.value})}
                onKeyDown={(e)=> e.key==="Enter" && addTopic(s.id)}
                placeholder="Add topic + Enter" className="flex-1 text-xs px-2 py-1.5 rounded border border-slate-200" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-4 max-w-sm">
        <input value={newSkill} onChange={(e)=>setNewSkill(e.target.value)} placeholder="New skill (e.g. IoT)" className="flex-1 text-sm px-2 py-1.5 rounded border border-slate-200" />
        <button onClick={addSkill} className="px-3 rounded bg-emerald-600 text-white text-sm">Add Skill</button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  WORKOUT                                                             */
/* ------------------------------------------------------------------ */

function WorkoutView({ workoutPlan, setWorkoutPlan }) {
  const [editDay, setEditDay] = useState(null);
  const [form, setForm] = useState({ name: "", exercises: [] });
  const [exInput, setExInput] = useState({ name:"", sets:"", reps:"", rest:"" });

  const openEdit = (day) => {
    setEditDay(day);
    setForm(workoutPlan[day] ? { ...workoutPlan[day] } : { name: "", exercises: [] });
  };
  const addExercise = () => {
    if (!exInput.name.trim()) return;
    setForm({ ...form, exercises: [...form.exercises, { ...exInput, id: uid() }] });
    setExInput({ name:"", sets:"", reps:"", rest:"" });
  };
  const save = () => { setWorkoutPlan({ ...workoutPlan, [editDay]: form }); setEditDay(null); };

  return (
    <div className="p-8 max-w-5xl">
      <SectionHeader title="Workout Planner" subtitle="Enter your own plan — nothing is pre-filled with exercises." />
      <div className="grid grid-cols-4 gap-3">
        {DAYS.slice(1).concat(DAYS[0]).map((day) => {
          const w = workoutPlan[day];
          return (
            <button key={day} onClick={() => openEdit(day)} className="text-left bg-white rounded-xl border border-slate-200 p-4 hover:border-orange-300">
              <div className="text-xs text-slate-400 mb-1">{day}</div>
              <div className="font-medium text-sm mb-2">{w?.name || "Rest / Not set"}</div>
              <div className="text-xs text-slate-400">{w?.exercises?.length || 0} exercises</div>
            </button>
          );
        })}
      </div>

      {editDay && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20" onClick={()=>setEditDay(null)}>
          <div className="bg-white rounded-xl border border-slate-200 p-5 w-[420px]" onClick={(e)=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-sm">{editDay} Workout</h3>
              <button onClick={()=>setEditDay(null)}><X size={16}/></button>
            </div>
            <input value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} placeholder="Workout name (e.g. Upper Body)" className="w-full text-sm px-2 py-1.5 rounded border border-slate-200 mb-3" />
            <div className="space-y-1.5 mb-3 max-h-40 overflow-y-auto">
              {form.exercises.map((ex) => (
                <div key={ex.id} className="flex items-center justify-between text-xs bg-slate-50 px-2 py-1.5 rounded">
                  <span>{ex.name} — {ex.sets}×{ex.reps} {ex.rest && `(rest ${ex.rest})`}</span>
                  <button onClick={()=>setForm({...form, exercises: form.exercises.filter(x=>x.id!==ex.id)})}><X size={12}/></button>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-1.5 mb-2">
              <input value={exInput.name} onChange={(e)=>setExInput({...exInput,name:e.target.value})} placeholder="Exercise" className="col-span-2 text-xs px-2 py-1.5 rounded border border-slate-200" />
              <input value={exInput.sets} onChange={(e)=>setExInput({...exInput,sets:e.target.value})} placeholder="Sets" className="text-xs px-2 py-1.5 rounded border border-slate-200" />
              <input value={exInput.reps} onChange={(e)=>setExInput({...exInput,reps:e.target.value})} placeholder="Reps" className="text-xs px-2 py-1.5 rounded border border-slate-200" />
            </div>
            <button onClick={addExercise} className="text-xs text-orange-600 font-medium mb-3">+ Add exercise</button>
            <div className="flex justify-end gap-2">
              <button onClick={()=>setEditDay(null)} className="text-xs px-3 py-1.5 text-slate-500">Cancel</button>
              <button onClick={save} className="text-xs px-3 py-1.5 rounded bg-orange-600 text-white font-medium">Save Day</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  WEEKLY REVIEW                                                       */
/* ------------------------------------------------------------------ */

function WeeklyReview({ weekStats }) {
  const cats = ["Coding","Academic","Skill","Workout"];
  const strongest = cats.reduce((best,c) => {
    const rate = weekStats.stats[c].planned ? weekStats.stats[c].completed/weekStats.stats[c].planned : 0;
    return rate > best.rate ? { cat: c, rate } : best;
  }, { cat: null, rate: -1 });
  const weakest = cats.reduce((worst,c) => {
    if (!weekStats.stats[c].planned) return worst;
    const rate = weekStats.stats[c].completed/weekStats.stats[c].planned;
    return rate < worst.rate ? { cat: c, rate } : worst;
  }, { cat: null, rate: 2 });

  return (
    <div className="p-8 max-w-4xl">
      <SectionHeader title="Weekly Review" subtitle="How this week is going, category by category." />
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-slate-400 text-xs uppercase">
              <th className="p-3 font-medium">Category</th>
              <th className="p-3 font-medium text-right">Planned</th>
              <th className="p-3 font-medium text-right">Completed</th>
              <th className="p-3 font-medium text-right">Rate</th>
            </tr>
          </thead>
          <tbody>
            {cats.map((c) => {
              const s = weekStats.stats[c];
              const rate = s.planned ? Math.round((s.completed/s.planned)*100) : 0;
              return (
                <tr key={c} className="border-b border-slate-50 last:border-0">
                  <td className="p-3"><Badge cat={c} /></td>
                  <td className="p-3 text-right font-mono">{s.planned}</td>
                  <td className="p-3 text-right font-mono">{s.completed}</td>
                  <td className="p-3 text-right font-mono">{rate}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Weekly Completion" value={`${weekStats.pct}%`} sub={`${weekStats.totalDone}/${weekStats.totalPlanned} tasks`} accent="#7C5CFF" />
        <StatCard label="Strongest Area" value={strongest.cat || "—"} sub={strongest.cat ? `${Math.round(strongest.rate*100)}% completion` : ""} accent="#16A34A" />
        <StatCard label="Needs Attention" value={weakest.cat || "—"} sub={weakest.cat ? `${Math.round(weakest.rate*100)}% completion` : ""} accent="#DC2626" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SETTINGS                                                            */
/* ------------------------------------------------------------------ */

function SettingsView({ settings, setSettings }) {
  return (
    <div className="p-8 max-w-3xl">
      <SectionHeader title="Settings" subtitle="Everything that shapes your schedule lives here — nothing needs source changes." />

      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
        <h3 className="font-display font-semibold text-sm mb-3">Skillrack Weekly Test</h3>
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-500">Time</label>
          <input value={settings.skillrackTestTime} onChange={(e)=>setSettings({...settings, skillrackTestTime:e.target.value})}
            className="text-sm px-2 py-1.5 rounded border border-slate-200 w-40" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-1.5"><AlertTriangle size={14} className="text-amber-500"/> Daily Workload Limits (minutes)</h3>
        <div className="grid grid-cols-2 gap-3">
          {Object.keys(settings.limits).map((c) => (
            <div key={c} className="flex items-center justify-between">
              <span className="text-sm text-slate-600 flex items-center gap-1.5"><Badge cat={c} /></span>
              <input type="number" value={settings.limits[c]} onChange={(e)=>setSettings({...settings, limits: {...settings.limits, [c]: Number(e.target.value)}})}
                className="w-24 text-sm px-2 py-1.5 rounded border border-slate-200 text-right" />
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-3">The study-plan generator checks Academic load against this limit before adding a new session to a day.</p>
      </div>
    </div>
  );
}
