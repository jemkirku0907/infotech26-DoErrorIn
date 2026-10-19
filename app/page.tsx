'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Send, 
  BookOpen, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  GraduationCap, 
  MapPin, 
  Building2, 
  Loader2, 
  CheckCircle2, 
  AlertOctagon, 
  Plus, 
  Search, 
  MessageSquare, 
  Settings, 
  Copy, 
  HelpCircle,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  LogOut,
  Trash2,
  Paperclip,
  Compass,
  Sparkles
} from 'lucide-react';
import { ChatResponse, Citation, MapLocation, FileAttachment } from '@/lib/types';
import { QuoteModal } from '@/components/QuoteModal';
import { LoginModal } from '@/components/LoginModal';
import { PdfViewerModal } from '@/components/PdfViewerModal';
import { InteractiveCampusMapModal } from '@/components/InteractiveCampusMapModal';
import { CinematicLandingPage } from '@/components/CinematicLandingPage';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  data?: ChatResponse;
  attachment?: FileAttachment;
  timestamp: string;
}

interface ChatSession {
  id: string;
  title: string;
  date: string;
  messages: Message[];
}

const DEFAULT_WELCOME: Message = {
  id: 'welcome',
  sender: 'assistant',
  text: "Mabuhay Herons! Welcome to TAGA-asK AI, your verified AI knowledge assistant grounded strictly in University of Makati's official documents:\n\n• Source01: Scholarships & Token Fee Exemption (14 pages)\n• Source02: College Requirements (CCIS & Colleges, 2 pages)\n• Source03: Campus Map & Building Directory (6 pages)\n• Source04: Administrative & Academic Offices (14 pages)\n\nAsk any question regarding admissions, scholarships, campus locations, or university offices.",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

const INITIAL_SESSIONS: ChatSession[] = [
  {
    id: '1',
    title: 'Scholarships & Exemption Guidelines',
    date: 'Today',
    messages: [
      DEFAULT_WELCOME,
      {
        id: 'init-1',
        sender: 'assistant',
        text: "### Scholarships & Token Fee Exemption Guidelines\n\nUnder University of Makati guidelines, students who meet specific academic merits are granted token fee exemption.\n\n- **Dean's Listers:** Full token fee exemption for GWA of 1.00 to 1.75.\n- **Athletes & Cultural Performers:** Granted verified scholarship privileges upon endorsement.\n\nRefer to Source01.pdf for detailed application instructions.",
        timestamp: '10:00 AM'
      }
    ]
  },
  {
    id: '2',
    title: 'CCIS Computer Science GWA Rules',
    date: 'Today',
    messages: [
      DEFAULT_WELCOME,
      {
        id: 'init-2',
        sender: 'assistant',
        text: "### CCIS Retention & Admission Requirements\n\nFor BS Computer Science students, the retention policy requires maintaining a GWA of at least 85% with no failing grade in major computing subjects (Source02.pdf, Page 1).",
        timestamp: '11:15 AM'
      }
    ]
  },
  {
    id: '3',
    title: 'Admin Building & Campus Directory',
    date: 'Yesterday',
    messages: [
      DEFAULT_WELCOME,
      {
        id: 'init-3',
        sender: 'assistant',
        text: "### Admin Building Campus Directory\n\nThe Center for Information Technology (CIT) is located in the Admin Building, Level 1.\n\nSee Source03.pdf, Page 1 for the complete building directory.",
        timestamp: 'Yesterday'
      }
    ]
  },
  {
    id: '4',
    title: 'University President & Registrar Details',
    date: 'Past week',
    messages: [
      DEFAULT_WELCOME,
      {
        id: 'init-4',
        sender: 'assistant',
        text: "### University President Information\n\nThe University President is **Prof. Elyxzur C. Ramos**, affectionately known as **Prof. X** (Source04.pdf, Page 1).",
        timestamp: 'Past week'
      }
    ]
  },
];

const SUGGESTED_PROMPTS = [
  {
    icon: GraduationCap,
    label: "Automatic Scholar",
    query: "Who is automatically a scholar at UMak?"
  },
  {
    icon: FileText,
    label: "BS Computer Science",
    query: "What are the GWA and Math grade requirements for BS Computer Science?"
  },
  {
    icon: MapPin,
    label: "CIT Location",
    query: "Where is the Center for Information Technology located in the Admin building?"
  },
  {
    icon: Building2,
    label: "University President",
    query: "Who is the University President and what is his alias?"
  },
  {
    icon: HelpCircle,
    label: "Missing Info Check",
    query: "What is the tuition fee for the College of Medicine in 2030?"
  }
];

export default function Home() {
  const [sessions, setSessions] = useState<ChatSession[]>(INITIAL_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState<string>('1');
  const [sessionToDelete, setSessionToDelete] = useState<ChatSession | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [messages, setMessages] = useState<Message[]>(INITIAL_SESSIONS[0].messages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<{ email: string; studentId: string; fullName: string } | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Interactive PDF Viewer State
  const [activePdfViewer, setActivePdfViewer] = useState<{
    source: string;
    page: number;
    quote?: string;
  } | null>(null);

  // Cinematic Landing Page State
  const [showLandingPage, setShowLandingPage] = useState<boolean>(true);

  // Campus Map State
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [targetMapLocation, setTargetMapLocation] = useState<MapLocation | null>(null);

  // Multimodal File Attachment State
  const [attachment, setAttachment] = useState<FileAttachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check landing page skip preference on mount
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('chat') === '1') {
        setShowLandingPage(false);
        return;
      }
      if (urlParams.get('intro') === '1' || urlParams.get('landing') === '1') {
        setShowLandingPage(true);
        return;
      }
      const skipPref = localStorage.getItem('taga_ask_skip_intro');
      if (skipPref === 'true') {
        setShowLandingPage(false);
      }
    } catch {
      // fallback
    }
  }, []);

  // Accordion Expand/Collapse States for Sessions and PDFs
  const [isSessionsExpanded, setIsSessionsExpanded] = useState(true);
  const [isPdfsExpanded, setIsPdfsExpanded] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorBanner("Selected file exceeds the 10MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        data: reader.result as string
      });
      setErrorBanner(null);
    };
    reader.onerror = () => {
      setErrorBanner("Failed to read file.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Load saved sessions from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('taga_ask_sessions');
      if (stored) {
        const parsed: ChatSession[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(parsed[0].id);
          setMessages(parsed[0].messages || [DEFAULT_WELCOME]);
        }
      }
    } catch {
      // fallback to INITIAL_SESSIONS
    }
  }, []);

  const persistSessions = (newSessions: ChatSession[]) => {
    setSessions(newSessions);
    try {
      localStorage.setItem('taga_ask_sessions', JSON.stringify(newSessions));
    } catch {
      // ignore
    }
  };

  // Check auth session on load
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setCurrentUser(data.user);
            return;
          }
        }
        setIsLoginOpen(true);
      } catch {
        setIsLoginOpen(true);
      }
    }
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setCurrentUser(null);
      setIsLoginOpen(true);
    }
  };

  // Auto-close mobile menu on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('umak_theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initial = prefersDark ? 'dark' : 'light';
      setTheme(initial);
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('umak_theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    const target = sessions.find(s => s.id === sessionId);
    if (target && target.messages) {
      setMessages(target.messages);
    } else {
      setMessages([DEFAULT_WELCOME]);
    }
  };

  const handleNewChat = () => {
    const newId = String(Date.now());
    const newWelcome: Message = {
      id: 'welcome-' + newId,
      sender: 'assistant',
      text: "Mabuhay Herons! New conversation initiated with TAGA-asK AI. Ask anything regarding UMak scholarships, admission requirements, campus locations, or offices!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const newSession: ChatSession = {
      id: newId,
      title: 'New Conversation',
      date: 'Today',
      messages: [newWelcome]
    };
    const updated = [newSession, ...sessions];
    persistSessions(updated);
    setActiveSessionId(newId);
    setMessages([newWelcome]);
  };

  const handleConfirmDeleteSession = () => {
    if (!sessionToDelete) return;
    const remaining = sessions.filter(s => s.id !== sessionToDelete.id);
    const safeRemaining = remaining.length > 0 ? remaining : [
      {
        id: String(Date.now()),
        title: 'New Conversation',
        date: 'Today',
        messages: [DEFAULT_WELCOME]
      }
    ];
    persistSessions(safeRemaining);
    if (activeSessionId === sessionToDelete.id) {
      setActiveSessionId(safeRemaining[0].id);
      setMessages(safeRemaining[0].messages);
    }
    setSessionToDelete(null);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if ((!query && !attachment) || isLoading) return;

    if (query.length > 500) {
      setErrorBanner("Message exceeds the 500 characters limit.");
      return;
    }

    setErrorBanner(null);
    setInput('');
    const currentAttachment = attachment;
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    const userMessage: Message = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: query || (currentAttachment ? `Attached file: ${currentAttachment.name}` : ''),
      attachment: currentAttachment || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: query || (currentAttachment ? `Analyze this attached file (${currentAttachment.name}) in the context of UMak.` : ''),
          attachment: currentAttachment || undefined
        }),
      });

      const data: ChatResponse = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setErrorBanner("Session expired or unauthorized. Please sign in with your UMak student account.");
          setIsLoginOpen(true);
        } else if (response.status === 429) {
          setErrorBanner(data.answer || "Rate limit reached. Please wait a moment before sending another message.");
        } else {
          setErrorBanner(data.answer || "An error occurred while contacting the server.");
        }
      }

      const assistantMessage: Message = {
        id: 'asst-' + Date.now(),
        sender: 'assistant',
        text: data.answer,
        data: data,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Persist to session history and update title if first message
      setSessions(prevSessions => {
        const updated = prevSessions.map(s => {
          if (s.id === activeSessionId) {
            const newMsgs = [...(s.messages || []), userMessage, assistantMessage];
            const newTitle = s.title === 'New Conversation'
              ? (query.length > 35 ? query.slice(0, 32) + '...' : query)
              : s.title;
            return { ...s, title: newTitle, messages: newMsgs };
          }
          return s;
        });
        try {
          localStorage.setItem('taga_ask_sessions', JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
    } catch (err: any) {
      setErrorBanner("Network error. Please verify your connection.");
      setMessages(prev => [
        ...prev,
        {
          id: 'asst-err-' + Date.now(),
          sender: 'assistant',
          text: "Unable to process request due to a network connection failure.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] dark:bg-[#090E1A] text-slate-900 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-200">
      
      {/* 
        1. MOBILE SLIDE-OVER DRAWER WITH BACKDROP (Visible only on mobile screens < md)
      */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-[#0B132B] text-slate-800 dark:text-white border-r border-slate-200 dark:border-[#1C2541] flex flex-col md:hidden transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] shadow-2xl ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Drawer Brand Header & Close Button */}
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between min-h-[64px]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#1C2541] flex items-center justify-center p-1 shadow-xs border border-slate-200 dark:border-[#1C2541] shrink-0 overflow-hidden">
              <Image 
                src={theme === 'dark' ? '/taga-ask-logo-dark.jpg' : '/taga-ask-logo-light.png'} 
                alt="TAGA-asK AI Heron" 
                width={36} 
                height={36} 
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-[16px] tracking-tight leading-tight">TAGA-asK AI</h2>
              <span className="text-[10px] text-[#3F56CA] dark:text-[#D1CA25] font-bold tracking-wider uppercase">UMak Knowledge Hub</span>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile New Chat & Search */}
        <div className="p-3 space-y-2">
          <button
            onClick={() => {
              handleNewChat();
              setIsMobileMenuOpen(false);
            }}
            title="New Conversation"
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition shadow-xs group font-semibold text-xs bg-[#3F56CA] hover:bg-[#2B3C8E] text-white"
          >
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-white dark:text-[#D1CA25] group-hover:rotate-90 transition-transform shrink-0" />
              <span>New Conversation</span>
            </span>
          </button>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40" />
            <input 
              type="text" 
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search conversations..." 
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg transition bg-slate-100 dark:bg-[#1C2541]/70 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:outline-hidden focus:border-[#3F56CA] dark:focus:border-[#D1CA25]"
            />
          </div>
        </div>

        {/* Mobile Sessions */}
        <div className="flex-1 overflow-y-auto px-2 space-y-4">
          <div>
            <button
              type="button"
              onClick={() => setIsSessionsExpanded(prev => !prev)}
              className="w-full px-2 py-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition mb-1"
            >
              <span>Verified Sessions</span>
              {isSessionsExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
            {isSessionsExpanded && (
              <div className="space-y-1">
                {filteredSessions.map((s) => {
                  const isActive = activeSessionId === s.id;
                  return (
                    <div
                      key={s.id}
                      className={`group w-full flex items-center justify-between rounded-lg transition ${
                        isActive
                          ? 'bg-[#EEF2FC] dark:bg-[#1C2541] text-[#3F56CA] dark:text-[#D1CA25] font-semibold border-l-4 border-[#3F56CA] dark:border-[#D1CA25] shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1C2541]/50 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <button
                        onClick={() => {
                          handleSelectSession(s.id);
                          setIsMobileMenuOpen(false);
                        }}
                        title={s.title}
                        className="flex-1 min-w-0 flex items-center gap-2.5 px-3 py-2 text-xs text-left truncate cursor-pointer"
                      >
                        <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#3F56CA] dark:text-[#D1CA25]' : 'text-slate-400 dark:text-slate-400'}`} />
                        <span className="truncate">{s.title}</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSessionToDelete(s);
                        }}
                        title="Delete conversation"
                        aria-label={`Delete conversation ${s.title}`}
                        className="p-1.5 mr-1 rounded-md text-slate-400 hover:text-[#EC202B] hover:bg-slate-200/60 dark:hover:bg-slate-800 transition shrink-0 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <button
              type="button"
              onClick={() => setIsPdfsExpanded(prev => !prev)}
              className="w-full px-2 py-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition mb-1"
            >
              <span>Official PDF Sources (Click to View)</span>
              {isPdfsExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
            {isPdfsExpanded && (
              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                <button
                  type="button"
                  onClick={() => {
                    setTargetMapLocation(null);
                    setIsMapOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-[#EEF2FC] dark:bg-[#1C2541] border border-[#3F56CA]/40 hover:border-[#3F56CA] text-[#3F56CA] dark:text-[#21ADE3] font-semibold transition cursor-pointer text-left"
                >
                  <Compass className="w-4 h-4 text-[#3F56CA] dark:text-[#21ADE3] shrink-0 animate-spin-slow" />
                  <span className="truncate">Interactive Map Visualizer</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActivePdfViewer({ source: 'Source01.pdf', page: 1 });
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#1C2541]/40 border border-slate-200/80 dark:border-white/5 hover:border-[#3F56CA] dark:hover:border-[#D1CA25] transition cursor-pointer text-left"
                >
                  <FileText className="w-4 h-4 text-[#3F56CA] dark:text-[#D1CA25] shrink-0" />
                  <span className="truncate">Source01: Scholarships (14p)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActivePdfViewer({ source: 'Source02.pdf', page: 1 });
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#1C2541]/40 border border-slate-200/80 dark:border-white/5 hover:border-[#21ADE3] transition cursor-pointer text-left"
                >
                  <FileText className="w-4 h-4 text-[#21ADE3] shrink-0" />
                  <span className="truncate">Source02: CCIS & Courses (2p)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActivePdfViewer({ source: 'Source03.pdf', page: 1 });
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#1C2541]/40 border border-slate-200/80 dark:border-white/5 hover:border-[#3F56CA] dark:hover:border-[#D1CA25] transition cursor-pointer text-left"
                >
                  <MapPin className="w-4 h-4 text-[#3F56CA] dark:text-[#D1CA25] shrink-0" />
                  <span className="truncate">Source03: Campus Map (6p)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActivePdfViewer({ source: 'Source04.pdf', page: 1 });
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#1C2541]/40 border border-slate-200/80 dark:border-white/5 hover:border-[#21ADE3] transition cursor-pointer text-left"
                >
                  <Building2 className="w-4 h-4 text-[#21ADE3] shrink-0" />
                  <span className="truncate">Source04: Offices (14p)</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#070D1E] space-y-2">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-xs px-2 py-1">
            <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-white/10 bg-slate-900">
              <Image
                src="/doerrorin-logo.png"
                alt="DoError!n Logo"
                width={20}
                height={20}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-[11px] font-medium tracking-tight">
              Developed by <span className="font-semibold text-slate-800 dark:text-white">DoError!n</span>
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/10 px-1">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-[#EEF2FC] dark:bg-gradient-to-br dark:from-[#3F56CA] dark:to-[#1C2541] text-[#3F56CA] dark:text-[#D1CA25] font-bold flex items-center justify-center text-xs border border-[#3F56CA]/30 dark:border-[#D1CA25]/60 shrink-0">
                {currentUser?.fullName?.charAt(0) || 'UM'}
              </div>
              <div className="text-left truncate">
                <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">
                  {currentUser ? currentUser.fullName : 'UMak Student'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {currentUser ? currentUser.studentId : 'Verified Student'}
                </p>
              </div>
            </div>
            {currentUser ? (
              <button
                onClick={handleLogout}
                title="Log out"
                className="p-1 rounded-lg text-slate-400 hover:text-[#EC202B] hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                title="Log in"
                className="text-xs text-[#3F56CA] dark:text-[#D1CA25] font-semibold hover:underline"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* 
        2. DESKTOP COLLAPSIBLE ICON-STRIP / FULL SIDEBAR (Hidden on mobile < md, visible on md+)
      */}
      <div className="hidden md:block relative group shrink-0 h-screen z-20">
        <aside 
          className={`h-screen flex flex-col transition-[width] duration-350 ease-[cubic-bezier(0.4,0,0.2,1)]
            bg-white dark:bg-[#0B132B] text-slate-800 dark:text-white border-r border-slate-200 dark:border-[#1C2541] overflow-hidden
            ${isSidebarOpen ? 'w-72' : 'w-[72px]'}`}
        >
          {/* Brand Header */}
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between min-h-[64px]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#1C2541] flex items-center justify-center p-1 shadow-xs border border-slate-200 dark:border-[#1C2541] shrink-0 overflow-hidden">
              <Image 
                src={theme === 'dark' ? '/taga-ask-logo-dark.jpg' : '/taga-ask-logo-light.png'} 
                alt="TAGA-asK AI Heron" 
                width={36} 
                height={36} 
                className="w-full h-full object-contain"
                priority
              />
            </div>
            {isSidebarOpen && (
              <div className="overflow-hidden whitespace-nowrap animate-in fade-in duration-200">
                <h2 className="font-bold text-slate-900 dark:text-white text-[16px] tracking-tight leading-tight">TAGA-asK AI</h2>
                <span className="text-[10px] text-[#3F56CA] dark:text-[#D1CA25] font-bold tracking-wider uppercase">UMak Knowledge Hub</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions: New Chat & Search */}
        <div className="p-3 space-y-2">
          <button
            onClick={handleNewChat}
            title="New Conversation"
            className={`w-full flex items-center rounded-xl transition shadow-xs group font-semibold text-xs
              bg-[#3F56CA] hover:bg-[#2B3C8E] text-white focus-visible:outline-[#3F56CA]
              ${isSidebarOpen ? 'justify-between px-3.5 py-2.5' : 'justify-center p-2.5'}`}
          >
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-white dark:text-[#D1CA25] group-hover:rotate-90 transition-transform shrink-0" />
              {isSidebarOpen && <span>New Conversation</span>}
            </span>
            {isSidebarOpen && (
              <kbd className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded text-white/90 border border-white/20 font-mono">⌘K</kbd>
            )}
          </button>

          {isSidebarOpen ? (
            <div className="relative animate-in fade-in duration-150">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40" />
              <input 
                type="text" 
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search conversations..." 
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg transition
                  bg-slate-100 dark:bg-[#1C2541]/70 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:outline-hidden focus:border-[#3F56CA] dark:focus:border-[#D1CA25]"
              />
            </div>
          ) : (
            <button 
              onClick={() => setIsSidebarOpen(true)}
              title="Search conversations"
              className="w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
            >
              <Search className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation / History list */}
        <div className="flex-1 overflow-y-auto px-2 space-y-4">
          <div>
            {isSidebarOpen ? (
              <button
                type="button"
                onClick={() => setIsSessionsExpanded(prev => !prev)}
                className="w-full px-2 py-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition mb-1.5 animate-in fade-in"
              >
                <span>Verified Sessions</span>
                {isSessionsExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            ) : null}
            {(!isSidebarOpen || isSessionsExpanded) && (
              <div className="space-y-1">
                {filteredSessions.map((s) => {
                  const isActive = activeSessionId === s.id;
                  return (
                    <div
                      key={s.id}
                      className={`group w-full flex items-center justify-between rounded-lg transition ${
                        isSidebarOpen ? 'px-2 py-1' : 'justify-center p-2'
                      } ${
                        isActive
                          ? 'bg-[#EEF2FC] dark:bg-[#1C2541] text-[#3F56CA] dark:text-[#D1CA25] font-semibold border-l-4 border-[#3F56CA] dark:border-[#D1CA25] shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1C2541]/50 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <button
                        onClick={() => handleSelectSession(s.id)}
                        title={s.title}
                        className={`flex-1 min-w-0 flex items-center gap-2.5 text-xs text-left truncate cursor-pointer ${
                          isSidebarOpen ? 'py-1' : 'justify-center'
                        }`}
                      >
                        <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#3F56CA] dark:text-[#D1CA25]' : 'text-slate-400 dark:text-slate-400'}`} />
                        {isSidebarOpen && <span className="truncate">{s.title}</span>}
                      </button>
                      {isSidebarOpen && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSessionToDelete(s);
                          }}
                          title="Delete conversation"
                          aria-label={`Delete conversation ${s.title}`}
                          className="opacity-0 group-hover:opacity-100 hover:bg-slate-200/60 dark:hover:bg-white/10 p-1 rounded-md text-slate-400 hover:text-[#EC202B] transition shrink-0 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            {isSidebarOpen ? (
              <button
                type="button"
                onClick={() => setIsPdfsExpanded(prev => !prev)}
                className="w-full px-2 py-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition mb-1.5 animate-in fade-in"
              >
                <span>Official PDF Sources (Click to View)</span>
                {isPdfsExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            ) : null}
            {(!isSidebarOpen || isPdfsExpanded) && (
              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                <button 
                  type="button"
                  onClick={() => {
                    setTargetMapLocation(null);
                    setIsMapOpen(true);
                  }}
                  title="Interactive Campus Map Visualizer"
                  className={`w-full flex items-center gap-2 rounded-lg bg-[#EEF2FC] dark:bg-[#1C2541] border border-[#3F56CA]/40 hover:border-[#3F56CA] text-[#3F56CA] dark:text-[#21ADE3] font-semibold transition cursor-pointer text-left ${
                    isSidebarOpen ? 'px-3 py-2' : 'justify-center p-2.5'
                  }`}
                >
                  <Compass className="w-4 h-4 text-[#3F56CA] dark:text-[#21ADE3] shrink-0 animate-spin-slow" />
                  {isSidebarOpen && <span className="truncate">Interactive Map Visualizer</span>}
                </button>
                <button 
                  type="button"
                  onClick={() => setActivePdfViewer({ source: 'Source01.pdf', page: 1 })}
                  title="Source01: Scholarships (14p)"
                  className={`w-full flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-[#1C2541]/40 border border-slate-200/80 dark:border-white/5 hover:border-[#3F56CA] dark:hover:border-[#D1CA25] transition cursor-pointer text-left ${
                    isSidebarOpen ? 'px-3 py-2' : 'justify-center p-2.5'
                  }`}
                >
                  <FileText className="w-4 h-4 text-[#3F56CA] dark:text-[#D1CA25] shrink-0" />
                  {isSidebarOpen && <span className="truncate">Source01: Scholarships (14p)</span>}
                </button>
                <button 
                  type="button"
                  onClick={() => setActivePdfViewer({ source: 'Source02.pdf', page: 1 })}
                  title="Source02: CCIS & Courses (2p)"
                  className={`w-full flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-[#1C2541]/40 border border-slate-200/80 dark:border-white/5 hover:border-[#21ADE3] transition cursor-pointer text-left ${
                    isSidebarOpen ? 'px-3 py-2' : 'justify-center p-2.5'
                  }`}
                >
                  <FileText className="w-4 h-4 text-[#21ADE3] shrink-0" />
                  {isSidebarOpen && <span className="truncate">Source02: CCIS & Courses (2p)</span>}
                </button>
                <button 
                  type="button"
                  onClick={() => setActivePdfViewer({ source: 'Source03.pdf', page: 1 })}
                  title="Source03: Campus Map (6p)"
                  className={`w-full flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-[#1C2541]/40 border border-slate-200/80 dark:border-white/5 hover:border-[#3F56CA] dark:hover:border-[#D1CA25] transition cursor-pointer text-left ${
                    isSidebarOpen ? 'px-3 py-2' : 'justify-center p-2.5'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-[#3F56CA] dark:text-[#D1CA25] shrink-0" />
                  {isSidebarOpen && <span className="truncate">Source03: Campus Map (6p)</span>}
                </button>
                <button 
                  type="button"
                  onClick={() => setActivePdfViewer({ source: 'Source04.pdf', page: 1 })}
                  title="Source04: Offices (14p)"
                  className={`w-full flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-[#1C2541]/40 border border-slate-200/80 dark:border-white/5 hover:border-[#21ADE3] transition cursor-pointer text-left ${
                    isSidebarOpen ? 'px-3 py-2' : 'justify-center p-2.5'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-[#21ADE3] shrink-0" />
                  {isSidebarOpen && <span className="truncate">Source04: Offices (14p)</span>}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#070D1E] space-y-2">
          <div 
            title="Developed by DoError!n"
            className={`flex items-center gap-2 text-slate-600 dark:text-slate-300 text-xs ${
              isSidebarOpen ? 'px-2 py-1' : 'justify-center py-1'
            }`}
          >
            <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-white/10 bg-slate-900">
              <Image
                src="/doerrorin-logo.png"
                alt="DoError!n Logo"
                width={20}
                height={20}
                className="w-full h-full object-contain"
              />
            </div>
            {isSidebarOpen && (
              <span className="text-[11px] font-medium tracking-tight truncate">
                Developed by <span className="font-semibold text-slate-800 dark:text-white">DoError!n</span>
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/10 px-1">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-[#EEF2FC] dark:bg-gradient-to-br dark:from-[#3F56CA] dark:to-[#1C2541] text-[#3F56CA] dark:text-[#D1CA25] font-bold flex items-center justify-center text-xs border border-[#3F56CA]/30 dark:border-[#D1CA25]/60 shrink-0">
                {currentUser?.fullName?.charAt(0) || 'UM'}
              </div>
              {isSidebarOpen && (
                <div className="text-left truncate">
                  <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">
                    {currentUser ? currentUser.fullName : 'UMak Student'}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {currentUser ? currentUser.studentId : 'Verified Student'}
                  </p>
                </div>
              )}
            </div>
            {isSidebarOpen && (
              currentUser ? (
                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-1 rounded-lg text-slate-400 hover:text-[#EC202B] hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  title="Log in"
                  className="text-xs text-[#3F56CA] dark:text-[#D1CA25] font-semibold hover:underline"
                >
                  Login
                </button>
              )
            )}
          </div>
        </div>
        </aside>

        {/* Hover Toggle Button on Sidebar Border - Centered vertically in the middle (top-1/2 -translate-y-1/2) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsSidebarOpen((prev) => !prev);
          }}
          aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-50 w-7 h-7 rounded-full bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center text-slate-600 dark:text-slate-200 hover:text-[#3F56CA] dark:hover:text-[#D1CA25] transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 focus-visible:opacity-100 focus-visible:outline-[#3F56CA] cursor-pointer pointer-events-auto select-none"
        >
          {isSidebarOpen ? (
            <ChevronLeft className="w-4 h-4 transition-transform duration-200 pointer-events-none" />
          ) : (
            <ChevronRight className="w-4 h-4 transition-transform duration-200 pointer-events-none" />
          )}
        </button>
      </div>

      {/* 2. MAIN WORKSPACE */}
      <section className="flex-1 flex flex-col h-screen min-w-0 bg-[#F8FAFC] dark:bg-[#090E1A] transition-colors duration-200">
        {/* Top Header: Mobile menu button, UMak Seal, Clean title, and single Theme Toggle */}
        <header className="h-16 px-3 md:px-8 bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-2xs transition-colors duration-200">
          <div className="flex items-center gap-2.5 md:gap-3 min-w-0">
            {/* Mobile Menu Button (< md) */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              title="Open menu"
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition shrink-0"
            >
              <Menu className="w-5 h-5 text-[#3F56CA] dark:text-[#D1CA25]" />
            </button>

            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden bg-white shadow-xs border border-slate-200 dark:border-slate-700 shrink-0">
              <Image
                src="/umak-seal.png"
                alt="University of Makati Seal"
                width={40}
                height={40}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 md:gap-2">
                <h1 className="font-bold text-slate-900 dark:text-white text-sm md:text-lg truncate">UMak Knowledge Base</h1>
              </div>
              <p className="text-[10px] md:text-[11px] text-slate-500 dark:text-slate-400 truncate">Exclusively referencing Source01 to Source04</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              type="button"
              onClick={() => setShowLandingPage(true)}
              title="View Cinematic Intro & Overview"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D1CA25]" />
              <span className="hidden sm:inline">Intro &amp; Overview</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTargetMapLocation(null);
                setIsMapOpen(true);
              }}
              title="Open Interactive Campus Map Visualizer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EEF2FC] dark:bg-[#1C2541] hover:bg-[#d8e0f8] dark:hover:bg-[#253358] border border-[#3F56CA]/30 text-[#3F56CA] dark:text-[#21ADE3] text-xs font-semibold transition shadow-2xs cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#3F56CA] dark:text-[#21ADE3]" />
              <span className="hidden sm:inline">Campus Map</span>
            </button>

            {/* THE ONLY THEME TOGGLE IN THE ENTIRE UI */}
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition focus-visible:outline-[#3F56CA]"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#D1CA25]" />
              ) : (
                <Moon className="w-4 h-4 text-[#3F56CA]" />
              )}
            </button>
          </div>
        </header>

        {/* Message View Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 max-w-4xl w-full mx-auto">
          {/* Error Banner with Alert Red (#EC202B) */}
          {errorBanner && (
            <div 
              role="alert"
              className="bg-[#FDE8E9] dark:bg-red-950/40 border border-[#EC202B]/40 text-[#EC202B] px-4 py-3 rounded-xl flex items-center gap-3 text-xs shadow-2xs animate-in fade-in"
            >
              <AlertOctagon className="w-4 h-4 text-[#EC202B] shrink-0" />
              <p className="flex-1 font-semibold">{errorBanner}</p>
              <button 
                onClick={() => setErrorBanner(null)}
                aria-label="Dismiss alert"
                className="text-[#EC202B] hover:opacity-80 font-bold p-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* Bot Avatar */}
              {msg.sender === 'assistant' && (
                <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#1C2541] flex items-center justify-center p-1 shadow-xs shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <Image
                    src={theme === 'dark' ? '/taga-bird-dark.png' : '/taga-bird-light.png'}
                    alt="TAGA-asK AI"
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* Message Content */}
              <div className="max-w-[85%] md:max-w-[75%] space-y-1.5">
                {/* Meta info */}
                <div className={`flex items-center gap-2 text-[11px] ${msg.sender === 'user' ? 'justify-end text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {msg.sender === 'user' ? 'You' : 'TAGA-asK AI'}
                  </span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Message Bubble */}
                <div
                  className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-[#3F56CA] text-white rounded-tr-none'
                      : 'bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 border border-slate-200/90 dark:border-slate-800 rounded-tl-none shadow-xs'
                  }`}
                >
                  {/* Assistant Status Badges */}
                  {msg.sender === 'assistant' && msg.data && (
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      {msg.data.conflict && (
                        <span className="inline-flex items-center gap-1.5 bg-[#FFFDE0] dark:bg-yellow-950/40 text-[#7A7400] dark:text-[#D1CA25] border border-[#D1CA25] px-2.5 py-1 rounded-lg text-xs font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5 text-[#D1CA25]" />
                          Source Conflict Flagged
                        </span>
                      )}

                      {!msg.data.in_sources ? (
                        <span className="inline-flex items-center gap-1.5 bg-[#FDE8E9] dark:bg-red-950/40 text-[#EC202B] border border-[#EC202B]/40 px-2.5 py-1 rounded-lg text-xs font-semibold">
                          <AlertOctagon className="w-3.5 h-3.5 text-[#EC202B]" />
                          Information Not Found in Sources
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-2.5 py-1 rounded-lg text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          Strictly Grounded & Verified
                        </span>
                      )}
                    </div>
                  )}

                  {/* Message Text with Structured Markdown Formatting */}
                  {msg.sender === 'user' ? (
                    <div className="space-y-2">
                      {msg.attachment && (
                        <div className="p-2 rounded-xl bg-black/20 dark:bg-black/40 border border-white/20 inline-flex flex-col gap-1.5 max-w-xs">
                          {msg.attachment.type.startsWith('image/') ? (
                            <img
                              src={msg.attachment.data}
                              alt={msg.attachment.name}
                              className="max-h-48 rounded-lg object-contain bg-black/20"
                            />
                          ) : (
                            <div className="flex items-center gap-2 p-1 text-white">
                              <FileText className="w-4 h-4 text-[#D1CA25]" />
                              <span className="text-xs truncate font-medium">{msg.attachment.name}</span>
                            </div>
                          )}
                          <span className="text-[10px] text-white/80 px-1 font-mono">
                            {(msg.attachment.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      )}
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    </div>
                  ) : (
                    <div className="text-[14.5px] leading-relaxed select-text space-y-2">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ ...props }) => <h1 className="text-lg font-bold text-slate-900 dark:text-white mt-3 mb-2" {...props} />,
                          h2: ({ ...props }) => <h2 className="text-base font-bold text-slate-900 dark:text-white mt-3 mb-1.5 pb-1 border-b border-slate-200 dark:border-slate-800" {...props} />,
                          h3: ({ ...props }) => <h3 className="text-sm font-bold text-[#3F56CA] dark:text-[#21ADE3] mt-2.5 mb-1" {...props} />,
                          p: ({ ...props }) => <p className="mb-2 last:mb-0 leading-relaxed text-slate-800 dark:text-slate-200" {...props} />,
                          ul: ({ ...props }) => <ul className="list-disc list-outside ml-4 space-y-1 my-2 text-slate-800 dark:text-slate-200" {...props} />,
                          ol: ({ ...props }) => <ol className="list-decimal list-outside ml-4 space-y-1 my-2 text-slate-800 dark:text-slate-200" {...props} />,
                          li: ({ ...props }) => <li className="leading-relaxed pl-1" {...props} />,
                          strong: ({ ...props }) => <strong className="font-semibold text-slate-900 dark:text-white" {...props} />,
                          code: ({ ...props }) => <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#3F56CA] dark:text-[#21ADE3] font-mono text-xs" {...props} />,
                          blockquote: ({ ...props }) => <blockquote className="border-l-3 border-[#3F56CA] dark:border-[#21ADE3] pl-3 py-1 my-2 italic text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 rounded-r" {...props} />,
                          table: ({ ...props }) => <div className="overflow-x-auto my-3"><table className="min-w-full text-xs border border-slate-200 dark:border-slate-800 rounded-lg" {...props} /></div>,
                          th: ({ ...props }) => <th className="px-3 py-2 bg-slate-100 dark:bg-slate-800 font-bold text-left text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700" {...props} />,
                          td: ({ ...props }) => <td className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 text-slate-700 dark:text-slate-300" {...props} />
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  )}

                  {/* Interactive Campus Map Pin Button if Location Found */}
                  {msg.sender === 'assistant' && msg.data?.location && (
                    <div className="mt-3 p-2.5 rounded-xl bg-blue-50/80 dark:bg-[#1C2541]/70 border border-[#3F56CA]/30 flex flex-wrap items-center justify-between gap-2.5 animate-in fade-in">
                      <div className="flex items-center gap-2 text-xs min-w-0">
                        <MapPin className="w-4 h-4 text-[#3F56CA] dark:text-[#21ADE3] shrink-0 animate-bounce" />
                        <div className="truncate">
                          <span className="font-semibold text-slate-800 dark:text-slate-100 block truncate">
                            {msg.data.location.officeName}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400 text-[11px] block truncate">
                            {msg.data.location.building} · {msg.data.location.floor} {msg.data.location.wing ? `(${msg.data.location.wing})` : ''}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setTargetMapLocation(msg.data?.location || null);
                          setIsMapOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3F56CA] hover:bg-[#2B3C8E] text-white text-xs font-semibold shadow-xs transition hover:scale-102 active:scale-98 shrink-0 cursor-pointer"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>📍 View on Campus Map</span>
                      </button>
                    </div>
                  )}

                  {/* Citations Box with Accent Cyan (#21ADE3) */}
                  {msg.data?.citations && msg.data.citations.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                        Official Citations (Click to inspect exact quote):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {msg.data.citations.map((c, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveCitation(c)}
                            className="inline-flex items-center gap-1.5 bg-[#EEF2FC] dark:bg-[#1C2541] hover:bg-[#d8e0f8] dark:hover:bg-[#253358] border border-[#3F56CA]/30 text-[#3F56CA] dark:text-[#21ADE3] text-xs px-3 py-1.5 rounded-lg font-semibold transition group shadow-2xs focus-visible:outline-[#21ADE3]"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-[#21ADE3] group-hover:scale-110 transition" />
                            <span>{c.source} · Page {c.page}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Assistant Message Actions */}
                {msg.sender === 'assistant' && (
                  <div className="flex items-center gap-2 pt-0.5 text-slate-400">
                    <button 
                      onClick={() => handleCopy(msg.text, msg.id)}
                      className="p-1.5 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-md transition flex items-center gap-1 text-[11px]"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiedId === msg.id ? <span className="text-emerald-600 font-semibold">Copied!</span> : <span>Copy</span>}
                    </button>
                  </div>
                )}
              </div>

              {/* User Avatar */}
              {msg.sender === 'user' && (
                <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">
                  You
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3.5 items-start">
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#1C2541] flex items-center justify-center p-1 shadow-xs shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden">
                <Image
                  src={theme === 'dark' ? '/taga-bird-dark.png' : '/taga-bird-light.png'}
                  alt="TAGA-asK AI"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-none p-4 shadow-2xs flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-[#3F56CA] animate-spin" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Retrieving official PDF passages and verifying citations...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompt Chips */}
        {messages.length <= 2 && (
          <div className="max-w-4xl w-full mx-auto px-4 md:px-8 mb-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
              Suggested Questions (Grounded in PDFs):
            </span>
            <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1.5 md:flex-wrap">
              {SUGGESTED_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p.query)}
                  className="shrink-0 whitespace-nowrap inline-flex items-center gap-2 bg-white dark:bg-[#111827] hover:bg-[#EEF2FC] dark:hover:bg-[#1C2541] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-[#3F56CA] dark:hover:text-[#21ADE3] text-xs px-3 py-2 rounded-xl transition shadow-2xs font-medium focus-visible:outline-[#21ADE3]"
                >
                  <p.icon className="w-3.5 h-3.5 text-[#3F56CA] dark:text-[#21ADE3]" />
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Composer Section */}
        <footer className="p-4 md:p-6 bg-white dark:bg-[#111827] border-t border-slate-200 dark:border-slate-800 transition-colors duration-200">
          <div className="max-w-4xl mx-auto space-y-2">
            <div className="border border-slate-300 dark:border-slate-700 rounded-2xl bg-white dark:bg-[#090E1A] shadow-2xs focus-within:border-[#3F56CA] focus-within:ring-2 focus-within:ring-[#3F56CA]/20 transition p-3">
              {/* Attachment Preview Chip */}
              {attachment && (
                <div className="mb-2 p-2 rounded-xl bg-[#EEF2FC] dark:bg-[#1C2541] border border-[#3F56CA]/30 flex items-center justify-between gap-2 text-xs animate-in fade-in">
                  <div className="flex items-center gap-2 min-w-0">
                    {attachment.type.startsWith('image/') ? (
                      <img
                        src={attachment.data}
                        alt="preview"
                        className="w-9 h-9 rounded-lg object-cover border border-[#3F56CA]/40 shrink-0 bg-white"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-[#3F56CA]/10 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-[#3F56CA] dark:text-[#21ADE3]" />
                      </div>
                    )}
                    <div className="truncate min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{attachment.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{(attachment.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveAttachment}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#EC202B] hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
                    title="Remove attachment"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={attachment ? "Ask a question about this attached file..." : "Ask about UMak scholarships, admission requirements, campus locations, or offices..."}
                maxLength={500}
                rows={2}
                disabled={isLoading}
                className="w-full bg-transparent resize-none border-none outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400"
              />

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-400">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach image or document (PNG, JPG, PDF)"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-[#3F56CA] dark:text-slate-400 dark:hover:text-[#D1CA25] hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer flex items-center gap-1 text-xs"
                  >
                    <Paperclip className="w-4 h-4" />
                    <span className="hidden sm:inline text-[11px] font-medium">Attach</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetMapLocation(null);
                      setIsMapOpen(true);
                    }}
                    title="Open Interactive Campus Map"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-[#3F56CA] dark:text-slate-400 dark:hover:text-[#21ADE3] hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer flex items-center gap-1 text-xs"
                  >
                    <Compass className="w-4 h-4" />
                    <span className="hidden sm:inline text-[11px] font-medium">Campus Map</span>
                  </button>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 ml-1">
                    {input.length}/500 chars
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={(!input.trim() && !attachment) || isLoading}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3F56CA] hover:bg-[#2B3C8E] text-white rounded-xl font-semibold text-xs shadow-xs disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed transition focus-visible:outline-[#D1CA25] cursor-pointer"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <p className="text-center text-[11px] text-slate-500 dark:text-slate-400">
              Answers are grounded strictly in official UMak documents (Source01–Source04) and cite their sources.
            </p>

            <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="w-4 h-4 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-white/10 bg-slate-900">
                <Image
                  src="/doerrorin-logo.png"
                  alt="DoError!n"
                  width={16}
                  height={16}
                  className="w-full h-full object-contain"
                />
              </div>
              <span>Developed by <strong className="font-semibold text-slate-700 dark:text-slate-300">DoError!n</strong></span>
            </div>
          </div>
        </footer>
      </section>

      {/* Delete Conversation Confirmation Modal */}
      {sessionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center shrink-0 text-[#EC202B]">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Delete Conversation?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  &ldquo;{sessionToDelete.title}&rdquo;
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to delete this conversation? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSessionToDelete(null)}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteSession}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#EC202B] hover:bg-[#cf1b24] text-white transition shadow-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Citation Quote Modal with Deep-Link to PDF Viewer */}
      <QuoteModal 
        citation={activeCitation} 
        onClose={() => setActiveCitation(null)} 
        onOpenPdf={(source, page, quote) => {
          setActiveCitation(null);
          setActivePdfViewer({ source, page, quote });
        }}
      />

      {/* Official Interactive PDF Document Explorer */}
      {activePdfViewer && (
        <PdfViewerModal
          source={activePdfViewer.source}
          initialPage={activePdfViewer.page}
          highlightQuote={activePdfViewer.quote}
          onClose={() => setActivePdfViewer(null)}
        />
      )}

      {/* Interactive Campus Map Visualizer Modal */}
      <InteractiveCampusMapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        targetLocation={targetMapLocation}
        theme={theme}
      />

      {/* UMak Student Institutional Login Gate */}
      <LoginModal
        isOpen={isLoginOpen && !currentUser}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsLoginOpen(false);
        }}
      />

      {/* Cinematic Landing Page Overlay with Animated Logo Reveal */}
      {showLandingPage && (
        <CinematicLandingPage 
          currentUser={currentUser}
          onEnterChat={() => setShowLandingPage(false)}
          onOpenLogin={() => setIsLoginOpen(true)}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setShowLandingPage(false);
          }}
        />
      )}
    </div>
  );
}
