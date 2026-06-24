import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../store/store';

export default function HomeNewTests() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newNoteCourse, setNewNoteCourse] = useState('Speaking Exam');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [customNotes, setCustomNotes] = useState<Array<{ id: number; text: string; course: string; done: boolean }>>([
    { id: 1, text: 'TAKE IELTS SPEAKING PRACTICE - PART 1 & 2', course: 'AI Speaking', done: true },
    { id: 2, text: 'SUBMIT WRITING TASK 2 ESSAY: EDUCATION SYSTEM', course: 'AI Writing', done: true },
    { id: 3, text: 'COMPLETE CAMBRIDGE IELTS 17 READING PRACTICE TEST 2', course: 'Reading Test', done: false },
    { id: 4, text: 'REVISE ESSAY FEEDBACK FROM MENTOR OKAFOR', course: 'Mentor Session', done: false },
    { id: 5, text: 'BOOK 1-ON-1 ORAL TEST SIMULATION (DUE SATURDAY)', course: 'Mentor Session', done: false },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setFormSubmitted(true);
      setTimeout(() => {
        setFormSubmitted(false);
        setEmail('');
        setMessage('');
      }, 3000);
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.trim()) {
      setCustomNotes([
        ...customNotes,
        { id: Date.now(), text: newNote.toUpperCase(), course: newNoteCourse, done: false }
      ]);
      setNewNote('');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f3dc] bg-notebook-paper bg-notebook bg-repeat text-[#1b263b] font-sans antialiased selection:bg-[#ffd54f]/40 relative overflow-x-hidden custom-pencil-cursor">
      
      {/* Real Spiral Binder Graphic on the Left side */}
      <div className="absolute left-3 top-0 bottom-0 w-10 flex flex-col justify-around pointer-events-none z-20 opacity-90 select-none">
        {Array.from({ length: 28 }).map((_, i) => (
          <div key={i} className="flex items-center gap-1.5 h-6">
            {/* Dark ring binding loop hole */}
            <div className="w-4 h-4 rounded-full bg-gray-300 border border-gray-400/50 shadow-inner" />
            {/* Metal wire loop binding */}
            <div className="w-8 h-2 bg-gradient-to-r from-gray-400 via-gray-300 to-gray-500 rounded-full shadow-md border-t border-white/20 transform -translate-x-1" />
          </div>
        ))}
      </div>

      {/* Red vertical margin line of notebook paper */}
      <div className="absolute left-[79px] top-0 bottom-0 w-0.5 bg-[#e0565b]/50 pointer-events-none z-10" />

      {/* MAIN CONTAINER */}
      <div className="pl-[95px] pr-6 md:pr-12 max-w-7xl mx-auto pb-24">
        
        {/* HEADER */}
        <header className="border-b-2 border-[#1b263b] py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Red notebook badge logo */}
            <div className="w-10 h-10 bg-[#c92a2a] border-2 border-[#1b263b] rounded-xl flex items-center justify-center text-white font-serif font-bold text-xl shadow-[2px_2px_0px_0px_#1b263b]">
              A
            </div>
            <div>
              <span className="text-3xl font-handwriting font-bold tracking-tight text-[#1b263b]" style={{ fontFamily: "'Caveat', cursive" }}>
                Apex IELTS<span className="text-[#c92a2a]">.</span>
              </span>
              <p className="text-[9px] text-[#1b263b]/70 uppercase tracking-widest font-black">AI-Powered IELTS Simulator</p>
            </div>
          </div>

          <nav className="flex items-center gap-6 text-xs font-black text-[#1b263b] uppercase tracking-wider">
            <a href="#courses" className="hover:text-[#c92a2a] transition-colors">IELTS Modules</a>
            <a href="#planner" className="hover:text-[#c92a2a] transition-colors">Study Planner</a>
            <a href="#palette" className="hover:text-[#c92a2a] transition-colors">Stationery</a>
            
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-2 bg-[#a7f3d0] border-2 border-[#1b263b] px-3 py-1 rounded-xl shadow-[2px_2px_0px_0px_#1b263b]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span className="font-sans font-black text-[#005c42] normal-case text-[10px]">{user.fullName}</span>
                </div>
                {user.role === 'ADMIN' && (
                  <Link to="/admin" className="border-2 border-[#1b263b] px-4 py-1.5 rounded-xl hover:bg-[#1b263b] hover:text-[#f5f3dc] transition-all bg-[#ffd54f] shadow-[2px_2px_0px_0px_#1b263b]">
                    👑 Admin Panel
                  </Link>
                )}
                <Link to="/login" className="border-2 border-[#1b263b] px-4 py-1.5 rounded-xl hover:bg-[#1b263b] hover:text-[#f5f3dc] transition-all bg-[#fcfbf7] shadow-[2px_2px_0px_0px_#1b263b]">
                  Switch Account
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="border-2 border-[#1b263b] px-4 py-1.5 rounded-xl hover:bg-[#1b263b] hover:text-[#f5f3dc] transition-all bg-[#fcfbf7] shadow-[2px_2px_0px_0px_#1b263b]">
                  Sign In
                </Link>
                <Link to="/login" className="bg-[#c92a2a] text-white border-2 border-[#1b263b] px-4 py-1.5 rounded-xl hover:bg-[#b01e1e] transition-all shadow-[2px_2px_0px_0px_#1b263b]">
                  Exam Portal
                </Link>
              </>
            )}
          </nav>
        </header>

        {/* HERO SECTION */}
        <section className="py-16 md:py-24 grid lg:grid-cols-12 gap-12 items-center relative">
          
          {/* Left Column Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <p className="text-xs uppercase tracking-widest text-[#4682b4] font-black">✎ AI-Powered IELTS Exam Simulator</p>
            
            <h1 className="text-5xl md:text-7xl font-serif text-[#1b263b] tracking-tight leading-tight font-black">
              Study IELTS that <br />
              <span className="font-handwriting text-[#c92a2a] text-6xl md:text-8xl italic block sm:inline" style={{ fontFamily: "'Caveat', cursive" }}>sticks</span>, <br className="hidden sm:inline" />
              plan weeks that run.
            </h1>
            
            <p className="text-sm text-gray-700 max-w-lg leading-relaxed font-serif font-semibold">
              Apex IELTS turns your exam preparation into an interactive study dashboard. Record speaking audios for AI evaluation, submit essays for criteria-based grading, practice reading tests, and book expert mentor slots.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              {isAuthenticated && user && user.role === 'ADMIN' ? (
                <Link to="/admin" className="bg-[#c92a2a] text-white border-2 border-[#1b263b] px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#b01e1e] transition-all flex items-center gap-2 shadow-[3px_3px_0px_0px_#1b263b]">
                  <span>👑</span> Go to Admin Panel
                </Link>
              ) : (
                <Link to="/login" className="bg-[#c92a2a] text-white border-2 border-[#1b263b] px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#b01e1e] transition-all flex items-center gap-2 shadow-[3px_3px_0px_0px_#1b263b]">
                  <span>✎</span> Start Practice
                </Link>
              )}
              <a href="#planner" className="border-2 border-[#1b263b] text-[#1b263b] bg-white px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#1b263b]/10 transition-all flex items-center gap-2 shadow-[3px_3px_0px_0px_#1b263b]">
                <span>◎</span> Watch the planner
              </a>
            </div>

            {/* Badges and rating */}
            <div className="flex flex-wrap gap-3 pt-6 items-center text-xs font-bold">
              <span className="bg-[#a7f3d0] text-[#005c42] px-3 py-1 rounded-xl border-2 border-[#1b263b] shadow-[2px_2px_0px_0px_#1b263b]">Active IELTS Students: 240+</span>
              <span className="bg-[#ffd54f] text-[#1b263b] px-3 py-1 rounded-xl border-2 border-[#1b263b] shadow-[2px_2px_0px_0px_#1b263b]">⭐ 4.9 Average Band Score</span>
              <span className="text-[#1b263b]/60">30-day free trial</span>
            </div>
          </div>

          {/* Right Column: Realistic Sticky Note with Tape & Stamp */}
          <div className="lg:col-span-5 flex justify-center relative">
            
            {/* Solid circular red stamp badge "A+" */}
            <div className="absolute -top-6 -left-6 w-16 h-16 rounded-full border-2 border-[#c92a2a] flex items-center justify-center rotate-[-12deg] z-10 bg-transparent shadow-[0px_4px_10px_rgba(201,42,42,0.15)]">
              <span className="font-handwriting text-3xl font-bold text-[#c92a2a] tracking-tighter" style={{ fontFamily: "'Caveat', cursive" }}>A+</span>
            </div>

            {/* Golden Yellow Sticky Note with Dark Outline */}
            <div className="bg-[#ffd54f] border-2 border-[#1b263b] shadow-lg p-6 w-[290px] rotate-[3deg] relative rounded-md">
              {/* Sticky Tape strip on top */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-white/90 border border-gray-300 shadow-sm opacity-95 transform -rotate-[2deg]" />
              
              <div className="space-y-3 pt-2 text-left">
                <h4 className="font-handwriting text-3.5xl font-bold text-[#c92a2a] leading-none" style={{ fontFamily: "'Caveat', cursive" }}>Hey –</h4>
                <p className="font-handwriting text-xl text-[#1b263b] leading-tight" style={{ fontFamily: "'Caveat', cursive" }}>
                  type sits on the rule, ink lives in the margin, and the loud things wear red.
                </p>
                <div className="border-t border-[#1b263b]/20 pt-2 flex items-center justify-between text-[10px] text-[#1b263b]/60 font-bold uppercase tracking-wider">
                  <span>SPEAKING TASK</span>
                  <span>Apex IELTS</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: 6 IELTS MODULES */}
        <section id="courses" className="py-16 border-t-2 border-[#1b263b] space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 text-left">
              <span className="text-xs uppercase tracking-widest text-[#4682b4] font-black">✎ your shelf</span>
              <h2 className="text-4xl font-serif text-[#1b263b] font-black tracking-tight">Six IELTS modules, one warm page.</h2>
            </div>
            <p className="text-sm text-gray-700 max-w-sm leading-relaxed text-left font-serif font-semibold">
              Track mock test bands, log voice recordings, and review evaluation reports on a clean study canvas with red-ink accents.
            </p>
          </div>

          {/* 3x2 Lined Grid Cards with Dark outline & round corner */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'AI Speaking Evaluator', tutor: 'Whisper & Gemini API', place: 'Speaking Submissions', progress: 62, stats: '14 logs • Part 1 & 2' },
              { title: 'AI Writing Evaluator', tutor: 'Criteria Essay Grader', place: 'Writing Submissions', progress: 45, stats: '22 essays submitted' },
              { title: 'IELTS Reading Simulator', tutor: 'Cambridge Test Pool', place: 'Reading Exam Simulator', progress: 78, stats: '9 papers • 6 sections' },
              { title: 'IELTS Listening Simulator', tutor: 'Audio Stream Tests', place: 'Listening Exam Simulator', progress: 33, stats: '11 audios completed' },
              { title: '1-on-1 Mentor Booking', tutor: 'Certified IELTS Mentors', place: 'Availability Scheduler', progress: 51, stats: '5 sessions scheduled' },
              { title: 'Personal Score Tracker', tutor: 'Database Band reports', place: 'Test Results History', progress: 89, stats: '17 exams analyzed' },
            ].map((course, idx) => (
              <div key={idx} className="bg-[#fcfbf7] bg-notebook-card bg-notebook bg-repeat border-2 border-[#1b263b] rounded-2xl p-6 shadow-md hover:shadow-lg transition-all relative flex flex-col justify-between min-h-[190px] text-left">
                {/* Red divider margin line inside cards */}
                <div className="absolute left-3 top-0 bottom-0 w-px bg-[#e0565b]/40" />
                
                <div className="pl-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider">IELTS Core System</span>
                    <span className="text-[9px] bg-sky-100 text-[#4682b4] border border-[#1b263b] font-bold px-2 py-0.5 rounded uppercase">Active Mode</span>
                  </div>
                  <h3 className="text-xl font-serif text-[#1b263b] font-bold">{course.title}</h3>
                  <p className="text-xs text-gray-500 font-medium">{course.tutor} • {course.place}</p>
                </div>

                <div className="pl-3 pt-4 space-y-2">
                  {/* Progress bar with red filler and dark outline */}
                  <div className="w-full bg-[#f5f3dc] h-3 rounded-full overflow-hidden border-2 border-[#1b263b]">
                    <div className="bg-[#c92a2a] h-full" style={{ width: `${course.progress}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#1b263b]/70 font-black uppercase tracking-wider">
                    <span>{course.progress}% Completed</span>
                    <span>{course.stats}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: STUDY PLANNER & FORM LIST */}
        <section id="planner" className="py-16 border-t-2 border-[#1b263b] grid lg:grid-cols-12 gap-12 items-start">
          
          {/* Daily Schedule Planner (Left) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <span className="text-xs uppercase tracking-widest text-[#4682b4] font-black">✎ this week</span>
            <h2 className="text-4xl font-serif text-[#1b263b] font-black tracking-tight">A neat plan, in ruled ink.</h2>
            
            {/* Lined notebook planner with solid outline */}
            <div className="bg-[#fcfbf7] bg-notebook-card bg-notebook bg-repeat border-2 border-[#1b263b] rounded-2xl shadow-md overflow-hidden p-6 relative">
              {/* Inner red margin line */}
              <div className="absolute left-8 top-0 bottom-0 w-px bg-[#e0565b]/40" />

              <div className="pl-6 space-y-6">
                <div className="flex items-center justify-between border-b-2 border-[#1b263b] pb-3">
                  <h3 className="text-2xl font-serif italic text-[#1b263b] font-bold">Wednesday, 13 May</h3>
                  <span className="text-[10px] bg-red-100 text-[#c92a2a] border border-[#1b263b] font-black px-2 py-0.5 rounded uppercase tracking-wider">IELTS Week 09</span>
                </div>

                <div className="space-y-4">
                  {customNotes.map((note) => (
                    <div key={note.id} className="flex items-start gap-4">
                      {/* Checkbox sticker */}
                      <span className="text-xs mt-0.5">📂</span>
                      <div className="flex-1">
                        <p className={`text-sm tracking-wide ${note.done ? 'line-through text-gray-400 font-handwriting text-lg' : 'text-[#1b263b] font-mono'}`} style={note.done ? { fontFamily: "'Caveat', cursive" } : undefined}>
                          {note.text}
                        </p>
                      </div>
                      <span className="text-[9px] text-[#4682b4] font-black border border-[#1b263b] uppercase tracking-widest mt-1 bg-sky-50 px-2 py-0.5 rounded">
                        {note.course}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Badges footer */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-[#1b263b]/20 text-[10px] font-black uppercase">
                  <span className="bg-emerald-100 text-emerald-800 border border-[#1b263b] px-3 py-1 rounded">✓ 2 completed</span>
                  <span className="bg-amber-100 text-amber-800 border border-[#1b263b] px-3 py-1 rounded">⌛ 3 in flight</span>
                </div>
              </div>
            </div>
          </div>

          {/* Add a New Note Form (Right) */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <span className="text-xs uppercase tracking-widest text-[#c92a2a] font-black">✎ add a note</span>
            <div className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-2xl p-8 shadow-md space-y-6">
              <div>
                <h3 className="text-lg font-serif text-[#1b263b] font-bold">Add to IELTS Planner</h3>
                <p className="text-xs text-gray-500 font-medium">Log a new custom test task or speaking practice session.</p>
              </div>

              <form onSubmit={handleAddNote} className="space-y-6 text-xs">
                <div className="space-y-1">
                  <label className="font-black uppercase tracking-wider text-gray-600">Task Title</label>
                  <input
                    type="text"
                    required
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="e.g. Practiced cue card 15..."
                    className="w-full border-b-2 border-[#1b263b] focus:border-[#c92a2a] outline-none py-2 bg-transparent text-sm font-bold text-[#1b263b]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-black uppercase tracking-wider text-gray-600">IELTS Area</label>
                  <select
                    value={newNoteCourse}
                    onChange={(e) => setNewNoteCourse(e.target.value)}
                    className="w-full border-b-2 border-[#1b263b] focus:border-[#c92a2a] outline-none py-2 bg-transparent text-sm font-bold text-[#1b263b]"
                  >
                    <option value="AI Speaking">AI Speaking</option>
                    <option value="AI Writing">AI Writing</option>
                    <option value="Reading Test">Reading Test</option>
                    <option value="Listening Test">Listening Test</option>
                    <option value="Mentor Session">Mentor Session</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#c92a2a] text-white border-2 border-[#1b263b] font-black py-3 rounded-xl hover:bg-[#b01e1e] transition-all shadow-[2px_2px_0px_0px_#1b263b] uppercase tracking-wider text-center"
                >
                  Save Note
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* SECTION 4: PALETTE / STATIONERY PREVIEW */}
        <section id="palette" className="py-16 border-t-2 border-[#1b263b] space-y-12">
          <div className="space-y-2 text-left">
            <span className="text-xs uppercase tracking-widest text-[#4682b4] font-black">✎ stationery library</span>
            <h2 className="text-4xl font-serif text-[#1b263b] font-black tracking-tight">Pens, paper, and a clipped corner.</h2>
            <p className="text-xs text-gray-500 font-semibold">The bits and pieces that make Marginalia feel like itself — palette, type, and the controls you'll touch every day.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            
            {/* Palette Colors with solid outline & round corners matching user mockup */}
            <div className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-2xl p-8 space-y-6 text-left shadow-md">
              <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">Palette • Ink & Stationery</h4>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { name: 'PAPER', hex: 'bg-[#f5f3dc] border-2 border-[#1b263b]' },
                  { name: 'RED', hex: 'bg-[#c92a2a] text-white border-2 border-[#1b263b]' },
                  { name: 'BLUE', hex: 'bg-[#4682b4] text-white border-2 border-[#1b263b]' },
                  { name: 'INK', hex: 'bg-[#1b263b] text-white border-2 border-[#1b263b]' },
                  { name: 'MARKER', hex: 'bg-[#ffd54f] text-[#1b263b] border-2 border-[#1b263b]' },
                  { name: 'MINT', hex: 'bg-[#a7f3d0] text-[#005c42] border-2 border-[#1b263b]' },
                  { name: 'ERASER', hex: 'bg-[#fbcfe8] text-[#9d174d] border-2 border-[#1b263b]' },
                  { name: 'GRAPHITE', hex: 'bg-[#4b5563] text-white border-2 border-[#1b263b]' },
                ].map((color, idx) => (
                  <div key={idx} className={`${color.hex} h-16 rounded-xl flex flex-col justify-end p-1.5 shadow-sm relative overflow-hidden`}>
                    <span className="text-[9px] font-black tracking-tighter bg-[#f5f3dc]/90 border border-[#1b263b] text-[#1b263b] rounded py-0.5 text-center block w-full uppercase">
                      {color.name}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-gray-500 italic font-serif font-semibold">Three structural inks — paper, red, navy — held in balance by four stationery accents.</p>
            </div>

            {/* Type Specimen with solid outline & round corners */}
            <div className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-2xl p-8 space-y-6 text-left shadow-md">
              <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">Type Specimen</h4>
              <div className="space-y-4">
                <div>
                  <span className="text-4xl font-handwriting text-[#c92a2a]" style={{ fontFamily: "'Caveat', cursive" }}>Aa Caveat</span>
                  <p className="text-xs text-gray-400 font-semibold">Headlines, signatures, and notes</p>
                </div>
                <div className="border-t border-[#1b263b]/20 pt-4">
                  <span className="text-2xl font-serif text-[#1b263b] font-bold">Aa Fraunces</span>
                  <p className="text-xs text-gray-400 font-semibold">Body, titles, editorial copy</p>
                </div>
                <div className="border-t border-[#1b263b]/20 pt-4">
                  <span className="text-sm font-sans text-gray-500 font-black">Aa Inter</span>
                  <p className="text-xs text-gray-400 font-semibold">Labels, buttons, captions</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER & CONTACT FORM */}
        <footer className="mt-20 border-2 border-[#1b263b] bg-[#fcfbf7] rounded-3xl p-8 md:p-12 shadow-lg relative text-left">
          
          {/* Tear marks / Binder holes at the top of the footer paper sheet */}
          <div className="absolute -top-3.5 left-0 right-0 flex justify-around px-8 pointer-events-none select-none">
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className="w-5 h-5 rounded-full bg-[#f5f3dc] border-2 border-[#1b263b] shadow-inner" />
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start mt-4">
            
            {/* Contact Form styled as a realistic Letter Card */}
            <div className="bg-[#fefefe] border-2 border-[#1b263b] rounded-2xl p-8 shadow-[4px_4px_0px_0px_#1b263b] relative text-left">
              {/* Top binder clip visual */}
              <div className="absolute -top-3 left-6 w-16 h-6 bg-[#4b5563] border-2 border-[#1b263b] rounded-t-md shadow-sm" />
              
              <div className="space-y-2 pt-2">
                <h3 className="text-3xl font-serif text-[#1b263b] font-black">Let's get in touch</h3>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Leave a memo in our physical inbox below.</p>
              </div>
              
              {formSubmitted ? (
                <div className="mt-6 bg-emerald-100 border-2 border-[#1b263b] text-emerald-800 p-4 rounded-xl text-xs font-bold shadow-[2px_2px_0px_0px_#1b263b]">
                  ✓ Message sent successfully! We will reply soon.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-[#1b263b]/70 tracking-wider">Return Address (Email) *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. student@domain.com"
                      className="w-full bg-transparent border-b-2 border-[#1b263b] focus:border-[#c92a2a] outline-none py-2 text-xs font-bold text-[#1b263b] placeholder-gray-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-[#1b263b]/70 tracking-wider">Message Body *</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Write your question, comment, or suggestion here..."
                      rows={3}
                      className="w-full bg-transparent border-b-2 border-[#1b263b] focus:border-[#c92a2a] outline-none py-2 text-xs resize-none font-bold text-[#1b263b] placeholder-gray-400"
                    />
                  </div>
                  <button type="submit" className="w-full bg-[#c92a2a] text-white border-2 border-[#1b263b] py-3 rounded-xl font-black uppercase tracking-wider text-xs hover:bg-[#b01e1e] transition-all shadow-[3px_3px_0px_0px_#1b263b] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#1b263b]">
                    Send message ✉
                  </button>
                </form>
              )}
            </div>

            {/* Navigation links styled as index cards */}
            <div className="grid grid-cols-2 gap-6 text-left">
              
              {/* Modules Card */}
              <div className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-2xl p-6 shadow-md relative min-h-[190px]">
                <span className="text-[9px] bg-sky-100 text-[#4682b4] border border-[#1b263b] font-black px-2 py-0.5 rounded uppercase tracking-wider mb-4 inline-block">
                  IELTS Modules
                </span>
                <ul className="space-y-2 text-xs font-bold text-gray-700">
                  <li><Link to="/login" className="hover:text-[#c92a2a] transition-colors flex items-center gap-1"><span>✎</span> Speaking Coach</Link></li>
                  <li><Link to="/login" className="hover:text-[#c92a2a] transition-colors flex items-center gap-1"><span>✎</span> Writing Evaluator</Link></li>
                  <li><Link to="/login" className="hover:text-[#c92a2a] transition-colors flex items-center gap-1"><span>✎</span> Reading Simulator</Link></li>
                  <li><Link to="/login" className="hover:text-[#c92a2a] transition-colors flex items-center gap-1"><span>✎</span> Listening Simulator</Link></li>
                </ul>
              </div>

              {/* Account & Administration Card */}
              <div className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-2xl p-6 shadow-md relative min-h-[190px]">
                <span className="text-[9px] bg-amber-100 text-[#7f5f00] border border-[#1b263b] font-black px-2 py-0.5 rounded uppercase tracking-wider mb-4 inline-block">
                  Portal & System
                </span>
                <ul className="space-y-2 text-xs font-bold text-gray-700">
                  <li><Link to="/login" className="hover:text-[#c92a2a] transition-colors flex items-center gap-1"><span>◎</span> Student Portal</Link></li>
                  <li><Link to="/login" className="hover:text-[#c92a2a] transition-colors flex items-center gap-1"><span>◎</span> Mentor Scheduling</Link></li>
                  <li><Link to="/admin" className="hover:text-[#c92a2a] transition-colors flex items-center gap-1"><span>◎</span> Admin Dashboard 👑</Link></li>
                  <li><Link to="/login" className="hover:text-[#c92a2a] transition-colors flex items-center gap-1"><span>◎</span> Account Login</Link></li>
                </ul>
              </div>

            </div>
          </div>

          {/* Bottom Copyright & Handwritten Stamp */}
          <div className="border-t-2 border-[#1b263b] pt-8 mt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-6 font-semibold font-sans">
            <div className="space-y-1 text-center md:text-left">
              <p>© 2026 Apex IELTS. All rights reserved.</p>
              <p className="text-[10px] text-gray-400 font-sans">Designed with ink & clean layouts. Hand-drawn elements enabled.</p>
            </div>
            
            {/* Signature Stamp */}
            <div className="transform rotate-[-2deg] my-2">
              <span className="font-handwriting text-2xl text-[#c92a2a]" style={{ fontFamily: "'Caveat', cursive" }}>
                Handcrafted with ✏️ and ☕ for IELTS students
              </span>
            </div>
            
            {/* Social Links styled as cute badge tags */}
            <div className="flex gap-3">
              {[
                { name: 'Twitter', link: '#' },
                { name: 'Github', link: '#' },
                { name: 'Support', link: '#' }
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.link}
                  className="bg-[#ffd54f] border-2 border-[#1b263b] rounded-xl px-3 py-1 shadow-[2px_2px_0px_0px_#1b263b] text-[#1b263b] hover:bg-[#ffcc00] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#1b263b] transition-all font-black uppercase text-[10px]"
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
