'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  UploadCloud,
  Loader2,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  FileText,
  Brain,
  Compass,
  MessageSquare,
  Activity,
  Terminal,
  Cpu,
  Target,
  Award
} from 'lucide-react';

type OnboardingStep = 'welcome' | 'profile' | 'resume' | 'analyzing' | 'celebrate';

export default function StudentOnboardingPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState<OnboardingStep>('welcome');
  
  const [formData, setFormData] = useState({
    fullName: 'Jane Smith',
    email: 'jane@example.com',
    mobile: '+91 98765-43210',
    college: 'IIT Bangalore',
    degree: 'B.Tech',
    branch: 'Computer Science & Engineering',
    gradYear: '2026',
    cgpa: '9.2',
    skills: 'React, Next.js, Go, Python, PyTorch, Kubernetes, Docker',
    projects: 'Project Alpha (LLM optimization caching), Local Scanner CLI Tool',
    linkedin: 'linkedin.com/in/janesmith',
    github: 'github.com/janesmith',
    preferredRoles: 'Staff LLMOps Engineer, AI Platform Builder',
    preferredLocations: 'Bangalore, SF (Hybrid), Remote'
  });

  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsingProgress, setParsingProgress] = useState(0);
  const [simulatedAtsScore, setSimulatedAtsScore] = useState(0);
  const [currentLog, setCurrentLog] = useState('');
  const [aiMessage, setAiMessage] = useState("Hi there! I am your AI Placement assistant. Let's build your career profile.");

  // Rotate AI Assistant messages based on current step
  useEffect(() => {
    switch (activeStep) {
      case 'welcome':
        setAiMessage("Welcome to Career Officer. I will guide you through extracting details, auditing CV syntax, and configuring target salaries.");
        break;
      case 'profile':
        setAiMessage("First, let's verify your academic credentials. This helps customize recommendations for matching local placements.");
        break;
      case 'resume':
        setAiMessage("Excellent. Now, sync your resume. I will run a deep NLP keyword alignment match to identify skill deficiencies.");
        break;
      case 'analyzing':
        setAiMessage("Analyzing resume tokens... Auditing parsing layouts, compiling experience metrics, and calculating matching indexes.");
        break;
      case 'celebrate':
        setAiMessage("Fantastic! Your profile synchronization is complete. Your ATS score looks great. Let's enter the workspace!");
        break;
    }
  }, [activeStep]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const triggerUpload = () => {
    document.getElementById('file-upload-input')?.click();
  };

  const startAnalysis = () => {
    if (!uploadedFile) return;
    setActiveStep('analyzing');

    const logs = [
      'Extracting structural resume tokens...',
      'De-serializing sections (Education, Experience)...',
      'Running ATS keyword parsing alignment...',
      'Simulating ATS parsing engine metrics...',
      'Detecting technical skill gaps...',
      'Saving configurations to yml layer...',
      'Onboarding completed!'
    ];

    let currentLogIndex = 0;
    const progressInterval = setInterval(() => {
      setParsingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          // Start simulating ATS score count-up
          startAtsSimulation();
          return 100;
        }
        if (prev > 0 && prev % 15 === 0 && currentLogIndex < logs.length - 1) {
          currentLogIndex++;
        }
        setCurrentLog(logs[currentLogIndex]);
        return prev + 5;
      });
    }, 150);
  };

  const startAtsSimulation = () => {
    const scoreInterval = setInterval(() => {
      setSimulatedAtsScore(prev => {
        if (prev >= 92) {
          clearInterval(scoreInterval);
          setTimeout(() => {
            setActiveStep('celebrate');
          }, 800);
          return 92;
        }
        return prev + 2;
      });
    }, 25);
  };

  const handleComplete = async () => {
    try {
      const profilePayload = {
        candidate: {
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.mobile,
          location: formData.preferredLocations.split(',')[0].trim(),
          linkedin: formData.linkedin,
          github: formData.github
        },
        target_roles: {
          primary: formData.preferredRoles.split(',').map(r => r.trim())
        },
        narrative: {
          headline: `${formData.branch} builder`,
          exit_story: `Graduating in ${formData.gradYear} from ${formData.college}. Experience with ${formData.projects}.`,
          superpowers: formData.skills.split(',').map(s => s.trim()).slice(0, 3)
        },
        compensation: {
          target_range: '₹12L-25L',
          currency: 'INR',
          minimum: '₹10L'
        },
        location: {
          city: 'Bangalore',
          country: 'India',
          timezone: 'IST',
          visa_status: 'No visa sponsorship needed'
        }
      };

      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profilePayload)
      });
    } catch {}

    localStorage.setItem('career_officer_onboarded', 'true');
    localStorage.setItem('career_officer_logged_in', 'true');
    localStorage.setItem('career_officer_token', 'sess_token_student_active');
    router.push('/dashboard');
  };

  return (
    <div className="flex-1 w-full min-h-[90vh] flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden bg-[#050507]">
      {/* Background Glowing Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{
            scale: [1, 1.15, 0.9, 1],
            x: [10, -20, 20, 10],
            opacity: [0.12, 0.22, 0.15, 0.12]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/10 via-teal-500/5 to-transparent rounded-full blur-[140px] top-10 left-10"
        />
        <motion.div
          animate={{
            scale: [0.95, 1.1, 0.9, 0.95],
            x: [-20, 20, -10, -20],
            opacity: [0.1, 0.2, 0.12, 0.1]
          }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute w-[500px] h-[350px] bg-gradient-to-bl from-blue-500/10 via-indigo-500/5 to-transparent rounded-full blur-[140px] bottom-10 right-10"
        />
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* Left Column: Floating AI Assistant Panel */}
        <div className="lg:col-span-1 flex flex-col justify-start">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-zinc-950/50 border border-zinc-900 shadow-2xl backdrop-blur-xl space-y-4 sticky top-28"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Brain className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <span className="font-extrabold text-xs text-zinc-200 block">Placement Assistant AI</span>
                <span className="text-[8px] text-zinc-550 block font-mono">Sync Protocol Active</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-900 shadow-inner">
              <p className="text-[11px] text-zinc-350 leading-relaxed font-sans italic">
                "{aiMessage}"
              </p>
            </div>

            <div className="border-t border-zinc-900/60 pt-3 flex items-center justify-between text-[8px] font-mono text-zinc-550 uppercase">
              <span>Assistant Status</span>
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <Activity className="w-2.5 h-2.5 text-emerald-400" />
                Listening
              </span>
            </div>
          </motion.div>
        </div>

        {/* Right Column (2/3): Wizard Step Container */}
        <div className="lg:col-span-2 flex flex-col justify-center">
          <motion.div
            layout
            className="w-full bg-zinc-950/45 border border-zinc-900 rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-[0_0_50px_0_rgba(0,0,0,0.8)] backdrop-blur-xl"
          >
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
            
            <AnimatePresence mode="wait">
              {/* Step 1: Welcome Intro */}
              {activeStep === 'welcome' && (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-6 py-6"
                >
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">Phase 1: Induction</span>
                    <h3 className="text-xl sm:text-3xl font-extrabold text-zinc-150 tracking-tight leading-tight">
                      Elevate Your Placement Trajectory
                    </h3>
                    <p className="text-xs text-zinc-450 leading-relaxed max-w-lg">
                      Welcome to the Career Officer platform. This setup portal will parse your resume, synchronize student credentials, and index technical skills to match you with targeted local opportunities.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-900/60 flex items-start gap-3">
                      <Cpu className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-zinc-200">ATS Syntax Checks</h4>
                        <p className="text-[10px] text-zinc-500 mt-0.5 leading-snug">Identifies missing technical keywords, frameworks, and syntax bugs.</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-900/60 flex items-start gap-3">
                      <Target className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-zinc-200">Job Pipeline Sync</h4>
                        <p className="text-[10px] text-zinc-500 mt-0.5 leading-snug">Monitors active platform applications and organizes stages.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-zinc-900/60">
                    <button
                      onClick={() => setActiveStep('profile')}
                      className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs cursor-pointer flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20"
                    >
                      Start AI Setup
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Student Profile Fields */}
              {activeStep === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">Phase 2: Academic Profile</span>
                    <h3 className="font-extrabold text-sm text-zinc-255 uppercase tracking-wider font-mono">Academic Credentials</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-500 block uppercase">Full Name</label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-200 focus:border-emerald-500/40 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 text-xs transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-500 block uppercase">Work Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-200 focus:border-emerald-500/40 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 text-xs transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-500 block uppercase">Mobile Number</label>
                      <input
                        type="text"
                        value={formData.mobile}
                        onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-200 focus:border-emerald-500/40 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 text-xs transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-500 block uppercase">College / University</label>
                      <input
                        type="text"
                        value={formData.college}
                        onChange={e => setFormData({ ...formData, college: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-200 focus:border-emerald-500/40 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 text-xs transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-500 block uppercase">Degree Program</label>
                      <input
                        type="text"
                        value={formData.degree}
                        onChange={e => setFormData({ ...formData, degree: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-200 focus:border-emerald-500/40 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 text-xs transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-500 block uppercase">Branch</label>
                      <input
                        type="text"
                        value={formData.branch}
                        onChange={e => setFormData({ ...formData, branch: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-200 focus:border-emerald-500/40 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 text-xs transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-500 block uppercase">Graduation Year</label>
                      <input
                        type="text"
                        value={formData.gradYear}
                        onChange={e => setFormData({ ...formData, gradYear: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-200 focus:border-emerald-500/40 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 text-xs transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-500 block uppercase">CGPA Scale</label>
                      <input
                        type="text"
                        value={formData.cgpa}
                        onChange={e => setFormData({ ...formData, cgpa: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-200 focus:border-emerald-500/40 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 text-xs transition-all"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[9px] font-mono text-zinc-500 block uppercase">Core Technical Skills (comma separated)</label>
                      <input
                        type="text"
                        value={formData.skills}
                        onChange={e => setFormData({ ...formData, skills: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-200 focus:border-emerald-500/40 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 text-xs transition-all"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[9px] font-mono text-zinc-500 block uppercase">Target Roles Preference</label>
                      <input
                        type="text"
                        value={formData.preferredRoles}
                        onChange={e => setFormData({ ...formData, preferredRoles: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-200 focus:border-emerald-500/40 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 text-xs transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-5 border-t border-zinc-900/60">
                    <button
                      onClick={() => setActiveStep('welcome')}
                      className="px-4 py-2.5 border border-zinc-900 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Back
                    </button>
                    <button
                      onClick={() => setActiveStep('resume')}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs cursor-pointer flex items-center gap-1 transition-all shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20"
                    >
                      Proceed to Resume
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Resume Sync */}
              {activeStep === 'resume' && (
                <motion.div
                  key="resume"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">Phase 3: Resume Sync</span>
                    <h3 className="font-extrabold text-sm text-zinc-250 uppercase tracking-wider font-mono">Sync Resume Credentials</h3>
                  </div>

                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={triggerUpload}
                    className={`p-12 border border-dashed rounded-2xl flex flex-col items-center justify-center text-center gap-4 cursor-pointer transition-all ${
                      dragActive
                        ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_20px_0_rgba(16,185,129,0.05)]'
                        : 'border-zinc-900 bg-zinc-950/20 hover:border-zinc-800'
                    }`}
                  >
                    <input
                      type="file"
                      id="file-upload-input"
                      onChange={handleFileChange}
                      accept=".pdf,.docx"
                      className="hidden"
                    />

                    <div className="p-3.5 bg-zinc-900 border border-zinc-850 text-zinc-400 rounded-xl">
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-zinc-350 block font-sans">
                        {uploadedFile ? uploadedFile.name : 'Drag & Drop your resume here'}
                      </span>
                      <span className="text-[10px] text-zinc-500 block mt-1.5 font-mono">
                        Supports PDF, DOCX formats (max 10MB)
                      </span>
                    </div>
                  </div>

                  {uploadedFile && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5 text-emerald-400 font-mono text-[10px]">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <span>{uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(0)}KB)</span>
                      </div>
                      <button
                        onClick={() => setUploadedFile(null)}
                        className="text-zinc-500 hover:text-zinc-300 font-bold"
                      >
                        Clear File
                      </button>
                    </motion.div>
                  )}

                  <div className="flex justify-between pt-5 border-t border-zinc-900/60">
                    <button
                      onClick={() => setActiveStep('profile')}
                      className="px-4 py-2.5 border border-zinc-900 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Back
                    </button>
                    <button
                      onClick={startAnalysis}
                      disabled={!uploadedFile}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs cursor-pointer flex items-center gap-1 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/10"
                    >
                      Start AI Extraction
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: AI Analyzing console */}
              {activeStep === 'analyzing' && (
                <motion.div
                  key="analyzing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-10 space-y-6 flex flex-col items-center justify-center text-center"
                >
                  <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                  <div className="space-y-1.5">
                    <h3 className="font-extrabold text-sm text-zinc-300 uppercase font-mono tracking-widest">AI Extraction Active</h3>
                    <p className="text-[10px] text-zinc-500 font-mono">{parsingProgress}% analyzed</p>
                  </div>

                  <div className="w-full max-w-xs bg-zinc-900 h-1 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${parsingProgress}%` }} />
                  </div>

                  {/* Terminal sync logs */}
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 font-mono text-[9px] text-emerald-400/90 text-left w-full max-w-md h-32 overflow-y-auto space-y-1 border-dashed">
                    <span className="text-zinc-650 block">// Real-time parser compilation</span>
                    <span>$ connect --engine=CareerOfficerAI</span>
                    <span>✓ Connected parsing buffers...</span>
                    {parsingProgress > 20 && <span>✓ OCR image buffers analyzed...</span>}
                    {parsingProgress > 40 && <span>✓ Extracted skills: React, PyTorch, Go...</span>}
                    {parsingProgress > 60 && <span>✓ ATS threshold matches 92%...</span>}
                    {parsingProgress > 80 && <span>✓ Indexed candidate: Jane Smith</span>}
                    {parsingProgress === 100 && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-emerald-400 font-bold"
                      >
                        ⚡ Simulated ATS score generated: {simulatedAtsScore}%
                      </motion.div>
                    )}
                    <div className="text-zinc-400 mt-2 block animate-pulse">⚡ LOG: {currentLog}</div>
                  </div>
                </motion.div>
              )}

              {/* Step 5: Onboarding Success celebration */}
              {activeStep === 'celebrate' && (
                <motion.div
                  key="celebrate"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 py-4"
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/5">
                      <Award className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">Workspace Ready</span>
                      <h3 className="text-2xl font-black text-zinc-150 tracking-tight">Onboarding Completed!</h3>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-4 font-mono text-[10px]">
                    <div className="grid grid-cols-2 gap-4 border-b border-zinc-900/60 pb-4">
                      <div>
                        <span className="text-zinc-550 uppercase text-[9px] block">Extracted Candidate</span>
                        <span className="text-zinc-300 font-bold font-sans mt-0.5 block">{formData.fullName}</span>
                      </div>
                      <div>
                        <span className="text-zinc-550 uppercase text-[9px] block">Degree specialization</span>
                        <span className="text-zinc-300 mt-0.5 block">{formData.degree} ({formData.branch})</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="text-zinc-550 uppercase text-[9px] block">ATS Parsed Keywords</span>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {formData.skills.split(',').map((s, k) => (
                            <span key={k} className="px-2.5 py-0.5 rounded-lg bg-zinc-900 border border-zinc-850 text-zinc-300">
                              {s.trim()}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-zinc-550 uppercase text-[9px] block">Simulated ATS Score</span>
                        <span className="text-emerald-400 font-extrabold text-sm mt-1 block">92% Match Score</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleComplete}
                      className="px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-black text-xs cursor-pointer shadow-lg shadow-emerald-500/15 hover:shadow-emerald-500/25 transition-all flex items-center gap-1.5"
                    >
                      Enter Student Workspace
                      <ChevronRight className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
