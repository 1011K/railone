import React, { useState } from 'react';
import { 
  TaskCategory, 
  TaskPriority, 
  CommuterTask, 
  TASK_CATEGORY_METADATA, 
  TASK_PRIORITY_METADATA 
} from '../types/tasks';
import { AiRailwayService } from '../services/aiService';
import { 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  Tag, 
  Send, 
  Filter, 
  FileText, 
  Trash2, 
  Bot, 
  Layers, 
  Flame, 
  CheckSquare, 
  Square,
  HelpCircle,
  TrainTrack,
  Radio,
  ShieldCheck,
  Zap,
  ArrowRight,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';

interface AiTasksViewProps {
  onSearchRouteShortcut?: (from: string, to: string) => void;
}

export const AiTasksView: React.FC<AiTasksViewProps> = ({ onSearchRouteShortcut }) => {
  // Initial realistic institutional railway tasks
  const [tasks, setTasks] = useState<CommuterTask[]>([
    {
      id: 'task-1',
      title: 'Divert to Slow Line at Kurla (PF 1)',
      description: 'Fast Local 95112 held by Vidyavihar signal lock (+22m delay). Alight at Kurla PF 6 and cross to PF 1 to catch Slow Local 97045 departing in 4m.',
      category: 'DISRUPTION_RECOVERY',
      priority: 'P0_CRITICAL',
      status: 'PENDING',
      dueTime: '11:05',
      associatedTrain: '95112',
      stationCode: 'CLA',
      createdTimestamp: '10:45',
      isAiGenerated: true
    },
    {
      id: 'task-2',
      title: 'Leave Home for Kalyan AC Fast Local (95114)',
      description: 'Train 95114 delayed at Kalyan electric shed (+18m). Recalculated leave-home time is 10:48 instead of 10:30.',
      category: 'JOURNEY_PLANNING',
      priority: 'P1_HIGH',
      status: 'PENDING',
      dueTime: '10:48',
      associatedTrain: '95114',
      stationCode: 'TNA',
      createdTimestamp: '10:30',
      isAiGenerated: true
    },
    {
      id: 'task-3',
      title: 'Verify Suburban MST Pass for Deccan Queen',
      description: 'Confirm season pass validity for Dadar-Kalyan short hop. Must travel in General Second Class coach (GS) only.',
      category: 'BOOKING_TICKETING',
      priority: 'P2_MEDIUM',
      status: 'COMPLETED',
      associatedTrain: '12123',
      stationCode: 'DR',
      createdTimestamp: '10:00',
      isAiGenerated: false
    },
    {
      id: 'task-4',
      title: 'File RailMadad AC Cooling Grievance in Coach C-4',
      description: 'Air conditioning thermostat failure in Virar-Churchgate AC Local coach 4. Draft official RailMadad complaint.',
      category: 'GRIEVANCE_RAILMADAD',
      priority: 'P3_LOW',
      status: 'PENDING',
      associatedTrain: '90240',
      stationCode: 'CCG',
      createdTimestamp: '09:50',
      isAiGenerated: true
    },
    {
      id: 'task-5',
      title: 'Align for Divyangjan Handicap Coach at Dadar PF 4',
      description: 'Train 95112 has handicap reserved coach 4th from engine. Wait near yellow tactile boarding indicator on platform floor.',
      category: 'COACH_POSITIONING',
      priority: 'P2_MEDIUM',
      status: 'PENDING',
      associatedTrain: '95112',
      stationCode: 'DR',
      createdTimestamp: '09:30',
      isAiGenerated: false
    }
  ]);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | TaskCategory>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | TaskPriority>('ALL');

  // AI Task Generator prompt
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiDataSource, setAiDataSource] = useState<string | null>(null);

  // New Manual Task Modal
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<TaskCategory>('JOURNEY_PLANNING');
  const [newPriority, setNewPriority] = useState<TaskPriority>('P1_HIGH');
  const [newDueTime, setNewDueTime] = useState('');
  const [newTrain, setNewTrain] = useState('');
  const [newStation, setNewStation] = useState('');

  // Tab View: tasks, copilot, railmadad
  const [activeTab, setActiveTab] = useState<'tasks' | 'railmadad' | 'copilot'>('tasks');

  // RailMadad Complaint Drafter state
  const [complaintType, setComplaintType] = useState('AC_TEMPERATURE');
  const [complaintTrain, setComplaintTrain] = useState('95114');
  const [complaintCoach, setComplaintCoach] = useState('AC-03');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [generatedComplaint, setGeneratedComplaint] = useState<string | null>(null);
  const [isComplaintGenerating, setIsComplaintGenerating] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);

  // Copilot Chat
  const [copilotQuery, setCopilotQuery] = useState('');
  const [isCopilotThinking, setIsCopilotThinking] = useState(false);
  const [copilotResponses, setCopilotResponses] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string }>>([
    {
      role: 'assistant',
      text: 'Namaste! I am your RailOne Next AI Travel Copilot powered by Gemini. You can describe your situation (e.g. "I am at Thane station heading to Churchgate, there is a delay at Vidyavihar, what is my best move?"), and I will decompose your trip into prioritized tasks or analyze delay inversions.',
      time: '11:00'
    }
  ]);

  // AI Task Decomposition handler
  const handleAiAutoDecompose = async (promptText?: string) => {
    const input = promptText || naturalLanguageInput;
    if (!input.trim()) return;
    setIsGenerating(true);

    try {
      const response = await AiRailwayService.decomposeTravelPlan(input);
      setAiDataSource(response.source === 'gemini' ? 'Gemini 3.8 Flash' : 'Deterministic Operations Model');

      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newItems: CommuterTask[] = response.tasks.map((t, idx) => ({
        id: `task-ai-${Date.now()}-${idx}`,
        title: t.title,
        description: t.description,
        category: t.category,
        priority: t.priority,
        status: 'PENDING',
        dueTime: t.dueTime || now,
        associatedTrain: t.associatedTrain,
        stationCode: t.stationCode,
        createdTimestamp: now,
        isAiGenerated: true
      }));

      setTasks(prev => [...newItems, ...prev]);
      setNaturalLanguageInput('');
    } catch (err) {
      console.error('Error decomposing tasks:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Add Manual Task
  const handleAddManualTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: CommuterTask = {
      id: `task-man-${Date.now()}`,
      title: newTitle.trim(),
      description: newDescription.trim() || 'Manual commuter reminder',
      category: newCategory,
      priority: newPriority,
      status: 'PENDING',
      dueTime: newDueTime || undefined,
      associatedTrain: newTrain.trim() || undefined,
      stationCode: newStation.trim().toUpperCase() || undefined,
      createdTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAiGenerated: false
    };

    setTasks(prev => [newTask, ...prev]);
    setNewTitle('');
    setNewDescription('');
    setNewDueTime('');
    setNewTrain('');
    setNewStation('');
    setIsNewTaskOpen(false);
  };

  // Toggle status
  const handleToggleStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'COMPLETED' ? 'PENDING' : t.status === 'PENDING' ? 'IN_PROGRESS' : 'COMPLETED';
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  // Delete task
  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Clear completed
  const handleClearCompleted = () => {
    setTasks(prev => prev.filter(t => t.status !== 'COMPLETED'));
  };

  // Handle Copilot send
  const handleSendCopilot = async () => {
    if (!copilotQuery.trim() || isCopilotThinking) return;
    const query = copilotQuery;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setCopilotResponses(prev => [...prev, { role: 'user', text: query, time }]);
    setCopilotQuery('');
    setIsCopilotThinking(true);

    try {
      const historyForApi = copilotResponses.map(r => ({ role: r.role, text: r.text }));
      const { reply, source } = await AiRailwayService.askCopilot(query, historyForApi);

      setCopilotResponses(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          text: reply, 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }
      ]);
    } catch (e) {
      setCopilotResponses(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          text: 'Unable to reach AI assistant at the moment. Please verify railway schedules in the Journey Decision tab.', 
          time 
        }
      ]);
    } finally {
      setIsCopilotThinking(false);
    }
  };

  // Handle RailMadad Draft Generation
  const handleGenerateComplaint = async () => {
    setIsComplaintGenerating(true);
    try {
      const { draft } = await AiRailwayService.draftGrievance(
        complaintType, 
        complaintTrain, 
        complaintCoach, 
        complaintDesc
      );
      setGeneratedComplaint(draft);
    } catch (err) {
      console.error('Complaint generation error:', err);
    } finally {
      setIsComplaintGenerating(false);
    }
  };

  // Filter & sort tasks
  const filteredTasks = tasks.filter(t => {
    if (categoryFilter !== 'ALL' && t.category !== categoryFilter) return false;
    if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
    return true;
  }).sort((a, b) => {
    const weightA = TASK_PRIORITY_METADATA[a.priority]?.sortWeight ?? 99;
    const weightB = TASK_PRIORITY_METADATA[b.priority]?.sortWeight ?? 99;
    return weightA - weightB;
  });

  const categories = Object.keys(TASK_CATEGORY_METADATA) as TaskCategory[];
  const priorities = Object.keys(TASK_PRIORITY_METADATA) as TaskPriority[];

  const pendingCount = tasks.filter(t => t.status !== 'COMPLETED').length;
  const criticalCount = tasks.filter(t => t.priority === 'P0_CRITICAL' && t.status !== 'COMPLETED').length;

  return (
    <div className="space-y-6">

      {/* Header Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-theme-light text-theme-primary border border-theme-primary/30">
              <Bot className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-theme-primary">
              Operations Control & Commuter Assistance Suite
            </span>
            {aiDataSource && (
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-300 font-mono">
                {aiDataSource === 'gemini' ? '[AI DISPATCH ASSIST]' : '[DETERMINISTIC FALLBACK]'}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Operational Commuter Tasks & Intelligence
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Prioritize delay recoveries, safe leave-home timings, legal MST pass verifications, and official RailMadad grievances.
          </p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/80 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'tasks' 
                ? 'bg-theme-primary text-white shadow-xs font-bold' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Task Manager ({pendingCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('copilot')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'copilot' 
                ? 'bg-theme-primary text-white shadow-xs font-bold' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Transit Copilot</span>
          </button>
          <button
            onClick={() => setActiveTab('railmadad')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'railmadad' 
                ? 'bg-amber-600 text-white shadow-xs font-bold' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>RailMadad Grievance</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. TASK MANAGER VIEW                                                      */}
      {/* ========================================================================= */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">

          {/* Commuter Task Decomposer Input Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-theme-primary" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Commuter Dilemma Decomposer & Action Planner
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Verified with Mumbai Suburban Rules & Schedule Model
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Describe your commute challenge (e.g., 'Delay at Vidyavihar, need AC to Churchgate from Thane by 12:00')..."
                value={naturalLanguageInput}
                onChange={(e) => setNaturalLanguageInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiAutoDecompose()}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-theme-primary"
              />
              <button
                onClick={() => handleAiAutoDecompose()}
                disabled={isGenerating || !naturalLanguageInput.trim()}
                className="px-5 py-2.5 bg-theme-primary hover-bg-theme-primary disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs shrink-0"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Generate Actions</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick 1-Click Prompt Chips */}
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px]">
              <span className="text-slate-400 font-medium">Quick Scenarios:</span>
              {[
                { label: 'Thane to Churchgate Morning Rush', prompt: 'Peak morning commute from Thane to Churchgate via Dadar, need AC local timing with walking buffer' },
                { label: 'Signal Failure at Vidyavihar (Fast Line)', prompt: 'Fast line signal failure at Vidyavihar, delay inversion alternatives to reach Dadar early' },
                { label: 'Deccan Queen MST Verification', prompt: 'Check monthly season pass eligibility for Dadar to Kalyan travel on Deccan Queen' },
                { label: 'AC Local Compressor Failure', prompt: 'Air conditioning failure in Coach AC-03 of Kalyan-CSMT AC Fast Local 95114' },
              ].map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => handleAiAutoDecompose(chip.prompt)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-theme-light text-slate-700 dark:text-slate-300 hover:text-theme-primary transition-colors border border-slate-200 dark:border-slate-700"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Controls Bar: Filters & New Task Button */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            {/* Filter by Category */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Category:
              </span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
              >
                <option value="ALL">All Categories (8)</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {TASK_CATEGORY_METADATA[c].label}
                  </option>
                ))}
              </select>

              {/* Filter by Priority */}
              <span className="text-xs text-slate-500 font-medium ml-2">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as any)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
              >
                <option value="ALL">All Priorities (4)</option>
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {TASK_PRIORITY_METADATA[p].label}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions: Add Manual Task & Clear Completed */}
            <div className="flex items-center gap-2">
              {tasks.some(t => t.status === 'COMPLETED') && (
                <button
                  onClick={handleClearCompleted}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-600 text-xs font-medium transition-colors"
                >
                  Clear Completed
                </button>
              )}

              <button
                onClick={() => setIsNewTaskOpen(true)}
                className="px-4 py-2 bg-theme-primary hover-bg-theme-primary text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>New Task</span>
              </button>
            </div>

          </div>

          {/* New Task Inline Modal Form */}
          {isNewTaskOpen && (
            <form onSubmit={handleAddManualTask} className="bg-white dark:bg-slate-900 border-2 border-theme-primary/40 rounded-3xl p-5 shadow-xl space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-theme-primary" />
                  <span>Create Institutional Commuter Task</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsNewTaskOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Switch to Slow Line at Dadar PF 2"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as TaskCategory)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{TASK_CATEGORY_METADATA[c].label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Priority Level *
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                  >
                    {priorities.map((p) => (
                      <option key={p} value={p}>{TASK_PRIORITY_METADATA[p].label} — {TASK_PRIORITY_METADATA[p].urgency}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Due Time</label>
                    <input
                      type="text"
                      placeholder="11:15"
                      value={newDueTime}
                      onChange={(e) => setNewDueTime(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Train #</label>
                    <input
                      type="text"
                      placeholder="95112"
                      value={newTrain}
                      onChange={(e) => setNewTrain(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Station</label>
                    <input
                      type="text"
                      placeholder="DR"
                      value={newStation}
                      onChange={(e) => setNewStation(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2 text-xs font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Description / Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="Operational details, platform number, or transfer guide..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewTaskOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Save Task
                </button>
              </div>
            </form>
          )}

          {/* Tasks Grid */}
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3 opacity-60" />
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  All filtered operational tasks cleared!
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Use the natural language box above to decompose a new commute plan.
                </p>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const catMeta = TASK_CATEGORY_METADATA[task.category];
                const prioMeta = TASK_PRIORITY_METADATA[task.priority];
                const isCompleted = task.status === 'COMPLETED';
                const isInProgress = task.status === 'IN_PROGRESS';

                return (
                  <div
                    key={task.id}
                    className={`rounded-2xl border p-4.5 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      isCompleted 
                        ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 opacity-65' 
                        : isInProgress
                        ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    
                    {/* Left: Checkbox & Content */}
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <button
                        onClick={() => handleToggleStatus(task.id)}
                        className="mt-0.5 text-slate-400 hover:text-blue-600 shrink-0 transition-colors"
                        title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        ) : isInProgress ? (
                          <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400" />
                        )}
                      </button>

                      <div className="space-y-1 min-w-0">
                        {/* Badges: Priority, Category, Train, AI Tag */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${prioMeta.badgeColor}`}>
                            {prioMeta.label}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {catMeta.label}
                          </span>
                          {task.associatedTrain && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                              Train #{task.associatedTrain}
                            </span>
                          )}
                          {task.stationCode && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                              @{task.stationCode}
                            </span>
                          )}
                          {task.isAiGenerated && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center gap-1">
                              <Zap className="w-2.5 h-2.5" />
                              ASSISTED
                            </span>
                          )}
                        </div>

                        {/* Title & Description */}
                        <h4 className={`text-sm font-bold leading-snug ${
                          isCompleted ? 'line-through text-slate-500 dark:text-slate-500' : 'text-slate-900 dark:text-white'
                        }`}>
                          {task.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {task.description}
                        </p>
                      </div>
                    </div>

                    {/* Right: Time, Status, Delete */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                      {task.dueTime && (
                        <div className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Due: {task.dueTime}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(task.id)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : isInProgress
                              ? 'bg-theme-light text-theme-primary'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {task.status.replace('_', ' ')}
                        </button>

                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TRANSIT COPILOT CHAT VIEW                                              */}
      {/* ========================================================================= */}
      {activeTab === 'copilot' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-theme-primary text-white font-bold">
                <Bot className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  RailSathi Transit Operations Desk
                </h3>
                <p className="text-[11px] text-slate-500">
                  Real-time Mumbai Suburban & Central Railway operational intelligence
                </p>
              </div>
            </div>

            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
              OCC Connected
            </span>
          </div>

          {/* Chat Messages Log */}
          <div className="h-80 overflow-y-auto space-y-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
            {copilotResponses.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-theme-primary text-white flex items-center justify-center shrink-0 text-xs font-bold font-mono">
                    OCC
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-theme-primary text-white font-medium' 
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-xs'
                }`}>
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <span className={`block text-[9px] mt-1.5 text-right font-mono ${
                    msg.role === 'user' ? 'text-white/80' : 'text-slate-400'
                  }`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}

            {isCopilotThinking && (
              <div className="flex gap-3 justify-start items-center text-xs text-slate-400">
                <div className="w-7 h-7 rounded-xl bg-theme-primary text-white flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl px-4 py-2 border border-slate-200 dark:border-slate-800 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-theme-primary" />
                  <span>Analyzing sectional delay telemetry and platform routes...</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ask anything about delays, AC locals, Dadar transfer walk times, or Section 138 rules..."
              value={copilotQuery}
              onChange={(e) => setCopilotQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendCopilot()}
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-theme-primary"
            />
            <button
              onClick={handleSendCopilot}
              disabled={isCopilotThinking || !copilotQuery.trim()}
              className="px-6 py-3 bg-theme-primary hover-bg-theme-primary disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. RAILMADAD COMPLAINT DRAFTER VIEW                                       */}
      {/* ========================================================================= */}
      {activeTab === 'railmadad' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-500 text-slate-950 font-bold">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Official RailMadad Grievance Generator
                </h3>
                <p className="text-[11px] text-slate-500">
                  Standardized passenger complaint drafting for Indian Railways grievance redressal portal
                </p>
              </div>
            </div>

            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
              Portal 139 Ready
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Grievance Category
              </label>
              <select
                value={complaintType}
                onChange={(e) => setComplaintType(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
              >
                <option value="AC_TEMPERATURE">Air Conditioning / Cooling Failure</option>
                <option value="COACH_CLEANLINESS">Coach Cleanliness & Sanitization</option>
                <option value="SECURITY_ASSISTANCE">Security & RPF Assistance Request</option>
                <option value="PUNCTUALITY_MAJOR_DELAY">Excessive Unannounced Delay & Signal Halt</option>
                <option value="TICKETING_MACHINE_FAILURE">UTS ATVM / Counter Failure</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Train Identification
              </label>
              <input
                type="text"
                placeholder="e.g. 95114 AC Local / 12123 Deccan Queen"
                value={complaintTrain}
                onChange={(e) => setComplaintTrain(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Coach / Berth / Location
              </label>
              <input
                type="text"
                placeholder="e.g. AC-03 / Coach 4 North end"
                value={complaintCoach}
                onChange={(e) => setComplaintCoach(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Specific Passenger Observations & Inconvenience
            </label>
            <textarea
              rows={3}
              placeholder="Provide exact symptoms (e.g. thermostat completely off since Thane, ambient temp 34°C, suffocating crowd load in morning peak)..."
              value={complaintDesc}
              onChange={(e) => setComplaintDesc(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleGenerateComplaint}
              disabled={isComplaintGenerating}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors shadow-xs"
            >
              {isComplaintGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Drafting Official Format...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Draft Official RailMadad Letter</span>
                </>
              )}
            </button>
          </div>

          {/* Generated Letter Output */}
          {generatedComplaint && (
            <div className="mt-4 p-5 bg-slate-950 text-slate-200 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-amber-400 font-bold">
                  Generated Redressal Letter Preview
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedComplaint);
                    setCopiedDraft(true);
                    setTimeout(() => setCopiedDraft(false), 2000);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] transition-colors"
                >
                  {copiedDraft ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDraft ? 'Copied!' : 'Copy to Clipboard'}</span>
                </button>
              </div>
              <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-slate-300">
                {generatedComplaint}
              </pre>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
