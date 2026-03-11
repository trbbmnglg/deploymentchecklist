import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Moon, Sun, Calendar as CalendarIcon, Clock, HardDrive, Network,
  Server, Shield, Play, Settings, Terminal, Download, FileSpreadsheet,
  CheckCircle2, Circle, ChevronDown, ChevronRight, ChevronsUpDown,
  ListTodo, GanttChart, FoldVertical, UnfoldVertical, AlertCircle, Users, Activity
} from 'lucide-react';

// --- UTILITIES ---
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatDate = (dateObj) => {
  if (!dateObj) return '';
  const d = new Date(dateObj);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const displayDate = (dateString) => {
  if (!dateString) return 'Select Date';
  const d = new Date(dateString + 'T12:00:00'); // Prevent timezone shift
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

const isWorkingDay = (date, exclusions = []) => {
  const d = new Date(date);
  const day = d.getDay();
  if (day === 0 || day === 6) return false;
  return !exclusions.includes(formatDate(d));
};

const addWorkingDays = (startDateStr, daysToAdd, exclusions = []) => {
  if (!startDateStr) return null;
  let current = new Date(startDateStr + 'T12:00:00');
  let added = 0;
  
  while (!isWorkingDay(current, exclusions)) {
    current.setDate(current.getDate() + 1);
  }

  if (daysToAdd <= 1) return formatDate(current);

  while (added < daysToAdd - 1) {
    current.setDate(current.getDate() + 1);
    if (isWorkingDay(current, exclusions)) {
      added++;
    }
  }
  return formatDate(current);
};

const getNextWorkingDay = (dateStr, exclusions = []) => {
  if (!dateStr) return null;
  let current = new Date(dateStr + 'T12:00:00');
  do {
    current.setDate(current.getDate() + 1);
  } while (!isWorkingDay(current, exclusions));
  return formatDate(current);
};

const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
};

// --- CUSTOM COMPONENTS ---

const CustomSelect = ({ label, value, options, onChange, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setIsOpen(false));

  return (
    <div className="relative" ref={ref}>
      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:border-[#8F00FF] dark:hover:border-[#8F00FF] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8F00FF]/50"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-[#8F00FF]" />}
          <span>{options.find(o => o.value === value)?.label || 'Select...'}</span>
        </div>
        <ChevronsUpDown className="w-4 h-4 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => { onChange(option.value); setIsOpen(false); }}
              className={`px-3 py-2 text-sm cursor-pointer flex items-center gap-2 transition-colors ${
                value === option.value 
                  ? 'bg-[#8F00FF]/10 text-[#8F00FF] font-semibold' 
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${value === option.value ? 'bg-[#8F00FF]' : 'bg-transparent'}`} />
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CustomDatePicker = ({ label, value, onChange, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value + 'T12:00:00') : new Date());
  const ref = useRef(null);
  useClickOutside(ref, () => setIsOpen(false));

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  return (
    <div className="relative" ref={ref}>
      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:border-[#8F00FF] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8F00FF]/50"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-[#8F00FF]" />}
          <span>{displayDate(value)}</span>
        </div>
        <CalendarIcon className="w-4 h-4 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-72 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"><ChevronDown className="w-4 h-4 rotate-90" /></button>
            <span className="font-semibold text-sm dark:text-white">{MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
            <button onClick={handleNextMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"><ChevronDown className="w-4 h-4 -rotate-90" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map(d => <div key={d} className="text-center text-xs font-medium text-slate-400">{d.charAt(0)}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1);
              const dateStr = formatDate(dateObj);
              const isSelected = value === dateStr;
              const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
              return (
                <button
                  key={i}
                  onClick={() => { onChange(dateStr); setIsOpen(false); }}
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-sm transition-all
                    ${isSelected ? 'bg-[#8F00FF] text-white shadow-md shadow-[#8F00FF]/30' : 
                      isWeekend ? 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800' :
                      'text-slate-700 dark:text-slate-200 hover:bg-[#8F00FF]/10 hover:text-[#8F00FF]'}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const CustomExclusionPicker = ({ exclusions, setExclusions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const ref = useRef(null);
  useClickOutside(ref, () => setIsOpen(false));

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const toggleDate = (dateStr) => {
    if (exclusions.includes(dateStr)) {
      setExclusions(exclusions.filter(d => d !== dateStr));
    } else {
      setExclusions([...exclusions, dateStr].sort());
    }
  };

  return (
    <div className="relative" ref={ref}>
      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Holidays / Exclusions</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:border-amber-500 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/50"
      >
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <span>{exclusions.length} Date(s) Excluded</span>
        </div>
        <CalendarIcon className="w-4 h-4 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-72 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-4 right-0">
           <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"><ChevronDown className="w-4 h-4 rotate-90" /></button>
            <span className="font-semibold text-sm dark:text-white">{MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"><ChevronDown className="w-4 h-4 -rotate-90" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map(d => <div key={d} className="text-center text-xs font-medium text-slate-400">{d.charAt(0)}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1);
              const dateStr = formatDate(dateObj);
              const isExcluded = exclusions.includes(dateStr);
              const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
              return (
                <button
                  key={i}
                  disabled={isWeekend}
                  onClick={() => toggleDate(dateStr)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-sm transition-all
                    ${isWeekend ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed bg-slate-50 dark:bg-slate-800/50' :
                      isExcluded ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30' : 
                      'text-slate-700 dark:text-slate-200 hover:bg-amber-100 hover:text-amber-600 dark:hover:bg-amber-500/20'}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {exclusions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {exclusions.map(date => (
            <span key={date} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
              {displayDate(date)}
              <button onClick={() => toggleDate(date)} className="hover:text-amber-950 dark:hover:text-amber-200"><Circle className="w-3 h-3 fill-current" /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const CommandFormatter = ({ text }) => {
  if (!text) return null;
  const regex = /^(.*?):\s*>\s*(.*?)(?:\s*\((.*?)\))?$/;
  const match = text.match(regex);

  if (match) {
    const [, prefix, command, suffix] = match;
    return (
      <div className="flex flex-col gap-2 my-3 font-jakarta">
        <span className="text-sm text-slate-700 dark:text-slate-300">
          Run below command for <strong className="text-[#8F00FF] dark:text-[#A855F7] font-semibold">{prefix}</strong>:
        </span>
        <div className="bg-[#0B1120] border border-slate-700/50 text-[#4ade80] p-3 rounded-lg font-fira text-sm overflow-x-auto shadow-inner flex items-center gap-3">
          <Terminal className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <code className="whitespace-pre">{command}</code>
        </div>
        {suffix && (
          <div className="text-sm text-slate-600 dark:text-slate-400 border-l-[3px] border-emerald-500 pl-3 py-1 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-r-md italic">
            {suffix}
          </div>
        )}
      </div>
    );
  }
  return <span className="text-sm text-slate-700 dark:text-slate-300 font-jakarta">{text}</span>;
};


// --- PHASE ENGINE & LOGIC ---

const PHASE_DURATIONS = {
  Standalone:  { 'Pre-reqs': 5, 'Install': 3, 'Non-Prod': 5, 'Testing': 4, 'Prod': 3, 'Post-Prod': 2, 'Hypercare': 10 },
  Distributed: { 'Pre-reqs': 5, 'Install': 3, 'Non-Prod': 10, 'Testing': 5, 'Prod': 3, 'Post-Prod': 2, 'Hypercare': 10 },
  Clustered:   { 'Pre-reqs': 10, 'Install': 3, 'Non-Prod': 10, 'Testing': 5, 'Prod': 3, 'Post-Prod': 2, 'Hypercare': 10 },
};

const generateSteps = (phaseName, architecture, totalHours) => {
  const isClustered = architecture === 'Clustered';
  
  const templates = {
    'Pre-reqs': [
      {
        title: "Infrastructure & Compute", weight: 3,
        subSteps: [
          "Submit ITSM ticket for VM provisioning",
          "Validate CPU/RAM allocations per reference architecture",
          "Configure OS limits: > ulimit -n 65535 (Verify open files)",
          "Disable THP: > echo never > /sys/kernel/mm/transparent_hugepage/enabled (Requires root)"
        ]
      },
      {
        title: "Storage & IOPS Validation", weight: 2,
        subSteps: [
          "Provision high-performance SAN/SSD",
          "Run fio tests: > fio --randrepeat=1 --ioengine=libaio --direct=1 --gtod_reduce=1 --name=test --filename=test --bs=4k --iodepth=64 --size=4G --readwrite=randrw --rwmixread=75 (Target 800+ IOPS)"
        ]
      },
      {
        title: "Security & Network", weight: 2,
        subSteps: [
          "Request PAM/Jumpbox Access",
          "Open firewall ports (8000, 8089, 9997, 8191, 9887)"
        ]
      }
    ],
    'Install': [
      {
        title: "Binaries & Core Config", weight: 1,
        subSteps: [
          "Download Splunk Enterprise TGZ",
          "Extract to /opt/splunk",
          "Configure user-seed.conf: > ./splunk start --accept-license (Set initial admin credentials)"
        ]
      }
    ],
    'Dev Phase': [
      {
        title: "Custom App Development", weight: 3,
        subSteps: [
          "Develop custom SPL and Macros",
          "Build Data Models and accelerate",
          "Design Advanced XML/SimpleXML Dashboards",
          "Package as Splunk App (.spl)"
        ]
      }
    ],
    'Non-Prod': [
      {
        title: "Deployment Server Setup", weight: 2,
        subSteps: [
          "Configure DS",
          "Create serverclass.conf for Universal Forwarders"
        ]
      },
      ...(isClustered ? [{
        title: "Indexer Cluster Setup (Non-Prod)", weight: 4,
        subSteps: [
          "Configure Master Node",
          "Enable Peer Nodes: > splunk edit cluster-config -mode slave -master_uri https://<master>:8089 -replication_port 9887 -secret <key> (Run on each peer)"
        ]
      },
      {
        title: "Search Head Cluster Setup (Non-Prod)", weight: 4,
        subSteps: [
          "Initialize Deployer",
          "Init SHC Members: > splunk init shcluster-config -auth admin:pass -mgmt_uri https://<sh>:8089 -replication_port 8181 -replication_factor 3 -conf_deploy_fetch_url https://<deployer>:8089 -secret <key> (Run on each SH)",
          "Push Bundle: > splunk apply shcluster-bundle -action edit (Run on Deployer)"
        ]
      }] : [{
        title: "Standalone/Distributed Routing", weight: 2,
        subSteps: [
          "Configure outputs.conf on Forwarders",
          "Configure inputs.conf on Indexers"
        ]
      }]),
      {
        title: "Data Validation & Modelling", weight: 2,
        subSteps: [
          "Onboard test data sources",
          "Validate parsing, line breaking, and timestamp extraction",
          "Map to Common Information Model (CIM)"
        ]
      }
    ],
    'Testing': [
      {
        title: "UAT & Load Testing", weight: 1,
        subSteps: [
          "Execute User Acceptance Testing scripts",
          "Simulate concurrent user load on Search Heads",
          "Validate Indexer replication performance"
        ]
      }
    ],
    'Prod': [
       ...(isClustered ? [{
        title: "Production Cluster Deployment", weight: 5,
        subSteps: [
          "Deploy Master and Deployer",
          "Join Prod Indexers to Cluster",
          "Bootstrap SHC Captain: > splunk bootstrap shcluster-captain -servers_list https://<sh1>:8089,https://<sh2>:8089 (Run on any SH member)"
        ]
      }] : [{
        title: "Production Core Setup", weight: 3,
        subSteps: [
          "Install Prod Indexers/Search Heads",
          "Apply hardened configurations (SSL, outputs.conf)"
        ]
      }]),
      {
        title: "Data Validation & Modelling", weight: 2,
        subSteps: [
          "Switch UF traffic to Production VIP/Indexers",
          "Validate Prod data integrity",
          "Build Prod Data Models"
        ]
      }
    ],
    'Post-Prod': [
      {
        title: "Cutover Activities", weight: 1,
        subSteps: [
          "DNS Alias Switch",
          "Decommission Legacy Systems (if applicable)",
          "Finalize Architecture Documentation"
        ]
      },
      {
        title: "Knowledge Transfer & Handover", weight: 2,
        subSteps: [
          "Create Platform User Guides & Admin Runbooks",
          "Conduct KT sessions with internal Support/Ops teams",
          "Review Handover documentation and escalation matrices",
          "Obtain formal project sign-off for transition to BAU"
        ]
      }
    ],
    'Hypercare': [
      {
        title: "Monitoring & Tuning", weight: 1,
        subSteps: [
          "Monitor _internal index for warnings/errors",
          "Tune concurrent search limits",
          "Hand-off to Operations Team"
        ]
      }
    ]
  };

  const template = templates[phaseName] || [{ title: "General Setup", weight: 1, subSteps: ["Execute Tasks"] }];
  
  const totalWeight = template.reduce((sum, step) => sum + step.weight, 0);

  return template.map((step, sIdx) => {
    const stepHours = (step.weight / totalWeight) * totalHours;
    const subStepHours = Math.round((stepHours / step.subSteps.length) * 10) / 10;

    return {
      id: `${phaseName.replace(/\s/g, '')}-s${sIdx}`,
      title: step.title,
      status: 'pending',
      resource: '',
      notes: '',
      subSteps: step.subSteps.map((subText, ssIdx) => ({
        id: `${phaseName.replace(/\s/g, '')}-s${sIdx}-ss${ssIdx}`,
        text: subText,
        hours: subStepHours,
        done: false
      }))
    };
  });
};

const generateExecutionPlan = (config) => {
  const { scope, architecture, appType, startDate, exclusions } = config;
  if (!startDate) return [];

  const phasesToInclude = [];
  
  if (scope === 'Dev Only' || scope === 'Both Dev & Prod') {
    phasesToInclude.push('Pre-reqs', 'Install', 'Non-Prod', 'Testing');
    if (appType === 'Custom Built') phasesToInclude.splice(2, 0, 'Dev Phase');
  }
  
  if (scope === 'Prod Only' || scope === 'Both Dev & Prod') {
    if (scope === 'Prod Only') phasesToInclude.push('Pre-reqs', 'Install');
    phasesToInclude.push('Prod', 'Post-Prod', 'Hypercare');
  }

  const uniquePhases = [...new Set(phasesToInclude)];

  let currentStartDate = startDate;
  const executionPlan = [];

  uniquePhases.forEach((phaseName) => {
    let days = PHASE_DURATIONS[architecture]?.[phaseName] || 5;
    
    if (phaseName === 'Dev Phase') {
      days = architecture === 'Clustered' ? 15 : 10;
    }

    const endDate = addWorkingDays(currentStartDate, days, exclusions);
    const totalHours = days * 7; 

    executionPlan.push({
      id: phaseName.replace(/\s/g, ''),
      name: phaseName,
      days: days,
      startDate: currentStartDate,
      endDate: endDate,
      totalHours,
      steps: generateSteps(phaseName, architecture, totalHours)
    });

    currentStartDate = getNextWorkingDay(endDate, exclusions);
  });

  return executionPlan;
};


// --- MAIN APP COMPONENT ---

export default function App() {
  const defaultConfig = {
    projectName: 'Project Alpha',
    scope: 'Both Dev & Prod',
    architecture: 'Distributed',
    appType: 'Vanilla',
    startDate: formatDate(new Date()),
    exclusions: []
  };

  const [isReady, setIsReady] = useState(false);
  const [config, setConfig] = useState(defaultConfig);
  const [phases, setPhases] = useState([]);
  const [activeTab, setActiveTab] = useState('checklist');
  const [isDark, setIsDark] = useState(true);
  const [expandedPhases, setExpandedPhases] = useState({});

  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('splunkGenConfig');
      const savedPhases = localStorage.getItem('splunkGenPhases');
      const savedDark = localStorage.getItem('splunkGenDark');

      if (savedDark !== null) setIsDark(JSON.parse(savedDark));
      if (savedConfig) setConfig(JSON.parse(savedConfig));
      if (savedPhases) {
        const parsedPhases = JSON.parse(savedPhases);
        setPhases(parsedPhases);
        const expanded = {};
        parsedPhases.forEach(p => expanded[p.id] = true);
        setExpandedPhases(expanded);
      }
    } catch (e) {
      console.error("Failed to load state", e);
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    localStorage.setItem('splunkGenConfig', JSON.stringify(config));
    localStorage.setItem('splunkGenPhases', JSON.stringify(phases));
    localStorage.setItem('splunkGenDark', JSON.stringify(isDark));
    
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [config, phases, isDark, isReady]);

  const handleRegenerate = () => {
    const newPhases = generateExecutionPlan(config);
    setPhases(newPhases);
    
    const expanded = {};
    newPhases.forEach(p => expanded[p.id] = true);
    setExpandedPhases(expanded);
  };

  const updateStepStatus = (phaseId, stepId, status) => {
    setPhases(prev => prev.map(p => {
      if (p.id !== phaseId) return p;
      return {
        ...p,
        steps: p.steps.map(s => {
          if (s.id !== stepId) return s;
          const isDone = status === 'done';
          return {
            ...s,
            status,
            subSteps: s.subSteps.map(ss => ({ ...ss, done: isDone }))
          };
        })
      };
    }));
  };

  const updateSubStep = (phaseId, stepId, subStepId, done) => {
    setPhases(prev => prev.map(p => {
      if (p.id !== phaseId) return p;
      return {
        ...p,
        steps: p.steps.map(s => {
          if (s.id !== stepId) return s;
          const newSubSteps = s.subSteps.map(ss => ss.id === subStepId ? { ...ss, done } : ss);
          
          const allDone = newSubSteps.every(ss => ss.done);
          const someDone = newSubSteps.some(ss => ss.done);
          let newStatus = s.status;
          if (allDone) newStatus = 'done';
          else if (someDone) newStatus = 'in-progress';
          else newStatus = 'pending';

          return { ...s, subSteps: newSubSteps, status: newStatus };
        })
      };
    }));
  };

  const updateStepField = (phaseId, stepId, field, value) => {
    setPhases(prev => prev.map(p => {
      if (p.id !== phaseId) return p;
      return {
        ...p,
        steps: p.steps.map(s => s.id === stepId ? { ...s, [field]: value } : s)
      };
    }));
  };

  const togglePhase = (phaseId) => {
    setExpandedPhases(prev => ({ ...prev, [phaseId]: !prev[phaseId] }));
  };

  const expandAll = () => {
    const expanded = {};
    phases.forEach(p => expanded[p.id] = true);
    setExpandedPhases(expanded);
  };

  const collapseAll = () => setExpandedPhases({});

  const exportCSV = () => {
    let csv = 'Phase,Step,Sub-Step,Status,Resource,Allocated Hours,Notes\n';
    phases.forEach(p => {
      p.steps.forEach(s => {
        s.subSteps.forEach((ss, idx) => {
          const stepTitle = idx === 0 ? `"${s.title}"` : '';
          const resource = idx === 0 ? `"${s.resource || ''}"` : '';
          const status = idx === 0 ? s.status : '';
          const notes = idx === 0 ? `"${(s.notes || '').replace(/"/g, '""')}"` : '';
          csv += `"${p.name}",${stepTitle},"${ss.text.replace(/"/g, '""')}",${status},${resource},${ss.hours},${notes}\n`;
        });
      });
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Splunk_Plan_${config.projectName.replace(/\s+/g, '_')}.csv`;
    link.click();
  };

  const metrics = useMemo(() => {
    let totalDays = 0;
    let totalHours = 0;
    let completedHours = 0;
    const resources = {};

    phases.forEach(p => {
      totalDays += p.days;
      p.steps.forEach(s => {
        s.subSteps.forEach(ss => {
          totalHours += ss.hours;
          if (ss.done) completedHours += ss.hours;
          
          if (s.resource) {
            resources[s.resource] = (resources[s.resource] || 0) + ss.hours;
          }
        });
      });
    });

    const complexityMap = { 'Standalone': 'Low', 'Distributed': 'Medium', 'Clustered': 'High' };
    const risk = config.appType === 'Custom Built' ? 'Elevated' : 'Standard';

    return {
      totalDays,
      totalHours: Math.round(totalHours),
      completedHours: Math.round(completedHours),
      progress: totalHours === 0 ? 0 : Math.round((completedHours / totalHours) * 100),
      complexity: complexityMap[config.architecture],
      risk,
      resources
    };
  }, [phases, config.architecture, config.appType]);

  if (!isReady) return null;

  return (
    <div className={`min-h-screen font-jakarta transition-colors duration-300 ${isDark ? 'dark bg-[#0B1120] text-slate-200' : 'bg-[#F8F9FC] text-slate-800'}`}>
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#8F00FF] p-2 rounded-lg shadow-lg shadow-[#8F00FF]/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight">Enterprise Splunk Lifecycle</h1>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Architect Deployment Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={exportCSV} className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#8F00FF] dark:hover:text-[#8F00FF] transition-colors">
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
            <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-5">
            <div className="flex items-center gap-2 mb-1">
              <Settings className="w-5 h-5 text-[#8F00FF]" />
              <h2 className="font-bold text-base">Project Specs</h2>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Initiative Name</label>
              <input 
                type="text" 
                value={config.projectName}
                onChange={e => setConfig({...config, projectName: e.target.value})}
                className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-[#8F00FF]/50 focus:border-[#8F00FF] outline-none transition-all dark:text-white"
                placeholder="e.g. Q3 SecOps Splunk Rollout"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <CustomSelect 
                label="Scope" value={config.scope} onChange={v => setConfig({...config, scope: v})}
                options={[{label:'Dev Only', value:'Dev Only'}, {label:'Prod Only', value:'Prod Only'}, {label:'Both Dev & Prod', value:'Both Dev & Prod'}]}
              />
               <CustomSelect 
                label="Architecture" value={config.architecture} onChange={v => setConfig({...config, architecture: v})} icon={Server}
                options={[{label:'Standalone', value:'Standalone'}, {label:'Distributed', value:'Distributed'}, {label:'Clustered', value:'Clustered'}]}
              />
            </div>
            <CustomSelect 
              label="App Type" value={config.appType} onChange={v => setConfig({...config, appType: v})} icon={Terminal}
              options={[{label:'Vanilla (OOTB)', value:'Vanilla'}, {label:'Custom Built', value:'Custom Built'}]}
            />
          </div>

          <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-5">
             <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#8F00FF]" />
                <h2 className="font-bold text-base">Timeline Origin</h2>
              </div>
            </div>
            <CustomDatePicker 
              label="Target Start Date" value={config.startDate} onChange={v => setConfig({...config, startDate: v})} icon={Play}
            />
            <CustomExclusionPicker 
              exclusions={config.exclusions} setExclusions={v => setConfig({...config, exclusions: v})}
            />
            <button 
              onClick={handleRegenerate}
              className="mt-auto w-full bg-[#8F00FF] hover:bg-[#7A00DB] text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-[#8F00FF]/25 transition-all flex items-center justify-center gap-2 group"
            >
              <Activity className="w-5 h-5 group-hover:animate-pulse" />
              Generate Execution Plan
            </button>
          </div>

          <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-[#8F00FF]" />
              <h2 className="font-bold text-base">Workload Projection</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
               <div className="bg-slate-50 dark:bg-[#1E293B] p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Est. Duration</span>
                  <span className="text-2xl font-bold text-slate-800 dark:text-white">{metrics.totalDays} <span className="text-sm font-medium text-slate-500">days</span></span>
               </div>
               <div className="bg-slate-50 dark:bg-[#1E293B] p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Total Effort</span>
                  <span className="text-2xl font-bold text-slate-800 dark:text-white">{metrics.totalHours} <span className="text-sm font-medium text-slate-500">hrs</span></span>
               </div>
               <div className="bg-slate-50 dark:bg-[#1E293B] p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Complexity</span>
                  <span className={`text-lg font-bold ${metrics.complexity === 'High' ? 'text-rose-500' : metrics.complexity === 'Medium' ? 'text-amber-500' : 'text-emerald-500'}`}>{metrics.complexity}</span>
               </div>
               <div className="bg-slate-50 dark:bg-[#1E293B] p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Risk Profile</span>
                  <span className={`text-lg font-bold ${metrics.risk === 'Elevated' ? 'text-amber-500' : 'text-emerald-500'}`}>{metrics.risk}</span>
               </div>
            </div>

            <div className="mt-auto">
               <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">
                 <Users className="w-3.5 h-3.5" /> Allocated Resources
               </span>
               <div className="max-h-24 overflow-y-auto space-y-2 pr-2">
                 {Object.keys(metrics.resources).length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No resources assigned yet.</p>
                 ) : (
                   Object.entries(metrics.resources).map(([res, hrs]) => (
                     <div key={res} className="flex items-center justify-between text-sm">
                       <span className="font-medium text-slate-700 dark:text-slate-300">{res}</span>
                       <span className="font-fira text-xs bg-[#8F00FF]/10 text-[#8F00FF] px-2 py-0.5 rounded-full">{hrs.toFixed(1)}h</span>
                     </div>
                   ))
                 )}
               </div>
            </div>
          </div>
        </section>

        {phases.length > 0 && (
          <section className="bg-white dark:bg-[#0F172A] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50/50 dark:bg-slate-800/20">
              <div className="flex gap-6">
                <button 
                  onClick={() => setActiveTab('checklist')}
                  className={`py-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'checklist' ? 'border-[#8F00FF] text-[#8F00FF]' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  <ListTodo className="w-4 h-4" /> Master Execution Plan
                </button>
                <button 
                  onClick={() => setActiveTab('timeline')}
                  className={`py-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'timeline' ? 'border-[#8F00FF] text-[#8F00FF]' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  <GanttChart className="w-4 h-4" /> Timeline View
                </button>
              </div>

              <div className="hidden md:flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Overall Progress</span>
                  <span className="text-sm font-bold text-[#8F00FF]">{metrics.progress}%</span>
                </div>
                <div className="w-32 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#8F00FF] to-[#b35cff] transition-all duration-500" style={{ width: `${metrics.progress}%` }}></div>
                </div>
              </div>
            </div>

            {activeTab === 'checklist' && (
              <div className="p-6">
                <div className="flex justify-end gap-3 mb-4">
                  <button onClick={expandAll} className="text-xs font-semibold text-slate-500 hover:text-[#8F00FF] flex items-center gap-1"><UnfoldVertical className="w-3.5 h-3.5" /> Expand All</button>
                  <button onClick={collapseAll} className="text-xs font-semibold text-slate-500 hover:text-[#8F00FF] flex items-center gap-1"><FoldVertical className="w-3.5 h-3.5" /> Collapse All</button>
                </div>

                <div className="space-y-4">
                  {phases.map((phase, pIdx) => {
                    const isExpanded = expandedPhases[phase.id];
                    let phaseTotal = 0, phaseDone = 0;
                    phase.steps.forEach(s => s.subSteps.forEach(ss => { phaseTotal += ss.hours; if(ss.done) phaseDone += ss.hours; }));
                    const phaseProgress = phaseTotal === 0 ? 0 : Math.round((phaseDone/phaseTotal)*100);

                    return (
                      <div key={phase.id} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-[#0B1120]">
                        <div 
                          onClick={() => togglePhase(phase.id)}
                          className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors select-none"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-1.5 rounded-md transition-transform duration-300 ${isExpanded ? 'bg-[#8F00FF]/10 text-[#8F00FF] rotate-90' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                              <ChevronRight className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                                <span className="text-[#8F00FF] font-fira text-sm opacity-70">{String(pIdx + 1).padStart(2,'0')}</span>
                                {phase.name}
                              </h3>
                              <p className="text-xs font-medium text-slate-500 mt-0.5">
                                {displayDate(phase.startDate)} — {displayDate(phase.endDate)} <span className="mx-2">•</span> {phase.days} Days ({phase.totalHours} hrs)
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-400">{phaseProgress}%</span>
                            <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div className="h-full bg-[#8F00FF] transition-all" style={{ width: `${phaseProgress}%` }}></div>
                            </div>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="border-t border-slate-200 dark:border-slate-800 p-5 bg-slate-50/30 dark:bg-[#0F172A]/30">
                            <div className="space-y-6">
                              {phase.steps.map((step) => {
                                const stepProgress = step.subSteps.filter(ss=>ss.done).length / step.subSteps.length;
                                
                                return (
                                  <div key={step.id} className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-wrap lg:flex-nowrap gap-4 items-center justify-between bg-slate-50/50 dark:bg-slate-800/20 rounded-t-lg">
                                      <div className="flex-1 min-w-[250px]">
                                        <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                          {stepProgress === 1 ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600" />}
                                          {step.title}
                                        </h4>
                                      </div>
                                      
                                      <div className="flex items-center gap-3 w-full lg:w-auto">
                                        <select 
                                          value={step.status}
                                          onChange={e => updateStepStatus(phase.id, step.id, e.target.value)}
                                          className={`text-xs font-semibold rounded-md px-2 py-1.5 border outline-none cursor-pointer
                                            ${step.status === 'done' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' :
                                              step.status === 'in-progress' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800' :
                                              'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'}`}
                                        >
                                          <option value="pending">Pending</option>
                                          <option value="in-progress">In Progress</option>
                                          <option value="done">Completed</option>
                                        </select>
                                        
                                        <div className="relative flex-1 lg:w-40">
                                          <Users className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                          <input 
                                            type="text" 
                                            placeholder="Assignee..." 
                                            value={step.resource}
                                            onChange={e => updateStepField(phase.id, step.id, 'resource', e.target.value)}
                                            className="w-full pl-8 pr-3 py-1.5 text-xs font-medium bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-md focus:border-[#8F00FF] focus:ring-1 focus:ring-[#8F00FF] outline-none dark:text-white"
                                          />
                                        </div>
                                      </div>
                                    </div>

                                    <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
                                      <div className="lg:col-span-2 space-y-3">
                                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Execution Steps</h5>
                                        {step.subSteps.map(sub => (
                                          <label key={sub.id} className="flex items-start gap-3 group cursor-pointer">
                                            <div className="pt-0.5">
                                              <input 
                                                type="checkbox" 
                                                checked={sub.done}
                                                onChange={e => updateSubStep(phase.id, step.id, sub.id, e.target.checked)}
                                                className="w-4 h-4 rounded text-[#8F00FF] bg-slate-100 border-slate-300 focus:ring-[#8F00FF] dark:bg-slate-800 dark:border-slate-600 cursor-pointer accent-[#8F00FF]"
                                              />
                                            </div>
                                            <div className={`flex-1 transition-opacity ${sub.done ? 'opacity-50' : 'opacity-100'}`}>
                                              <CommandFormatter text={sub.text} />
                                              <span className="inline-block mt-1 font-fira text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                                                {sub.hours}h allocated
                                              </span>
                                            </div>
                                          </label>
                                        ))}
                                      </div>

                                      <div className="flex flex-col">
                                         <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Notes & Evidence</h5>
                                         <textarea 
                                          value={step.notes}
                                          onChange={e => updateStepField(phase.id, step.id, 'notes', e.target.value)}
                                          placeholder="Add ITSM ticket links, logs, or evidence here..."
                                          className="flex-1 w-full bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-md p-3 text-sm resize-none focus:border-[#8F00FF] focus:ring-1 focus:ring-[#8F00FF] outline-none dark:text-slate-300 placeholder-slate-400 min-h-[100px]"
                                         />
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="p-6 overflow-x-auto">
                 <div className="min-w-[800px]">
                    <div className="flex mb-4">
                      <div className="w-48 flex-shrink-0 font-bold text-xs uppercase tracking-wider text-slate-500">Phase</div>
                      <div className="flex-1 relative h-6">
                        {[0, 25, 50, 75, 100].map(pct => (
                          <div key={pct} className="absolute top-0 bottom-0 border-l border-slate-200 dark:border-slate-700" style={{ left: `${pct}%` }}>
                             <span className="absolute -left-3 -top-5 text-[10px] text-slate-400">{pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {(() => {
                        const minDate = new Date(phases[0].startDate).getTime();
                        const maxDate = new Date(phases[phases.length-1].endDate).getTime();
                        const totalDuration = maxDate - minDate;

                        return phases.map((phase) => {
                          const pStart = new Date(phase.startDate).getTime();
                          const pEnd = new Date(phase.endDate).getTime();
                          
                          const leftPct = totalDuration === 0 ? 0 : ((pStart - minDate) / totalDuration) * 100;
                          const widthPct = totalDuration === 0 ? 100 : ((pEnd - pStart) / totalDuration) * 100;
                          
                          let pTotal = 0, pDone = 0;
                          phase.steps.forEach(s => s.subSteps.forEach(ss => { pTotal += ss.hours; if(ss.done) pDone += ss.hours; }));
                          const progressPct = pTotal === 0 ? 0 : (pDone / pTotal) * 100;

                          return (
                            <div key={`gantt-${phase.id}`} className="flex items-center group">
                              <div className="w-48 flex-shrink-0 pr-4">
                                <span className="block text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{phase.name}</span>
                                <span className="block text-[10px] font-fira text-slate-400">{displayDate(phase.startDate)}</span>
                              </div>
                              <div className="flex-1 relative h-8 bg-slate-50 dark:bg-slate-800/30 rounded border border-slate-100 dark:border-slate-800">
                                <div 
                                  className="absolute top-1.5 bottom-1.5 bg-[#8F00FF]/20 border border-[#8F00FF]/50 rounded-md overflow-hidden"
                                  style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 1)}%` }}
                                >
                                  <div 
                                    className="h-full bg-[#8F00FF] transition-all"
                                    style={{ width: `${progressPct}%` }}
                                  />
                                </div>
                                <div className="hidden group-hover:block absolute top-10 z-10 bg-slate-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap shadow-lg" style={{ left: `calc(${leftPct}% + 10px)` }}>
                                  {phase.days} Days | {Math.round(progressPct)}% Complete
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>

                    <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                       <span>Total End-to-End Duration: <strong>{metrics.totalDays} Working Days</strong></span>
                       <span className="flex items-center gap-2"><div className="w-3 h-3 bg-[#8F00FF] rounded-sm"></div> Completed Effort</span>
                    </div>
                 </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
