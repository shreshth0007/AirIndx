import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Leaf,
  RefreshCw,
  Send,
  CheckCircle2,
  HeartHandshake,
  MessageSquare,
  ListFilter,
  User,
  Bot,
  Trash2,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { AIInsightData, AirQualityMetrics } from '../types/airQuality';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

interface AIInsightsPanelProps {
  insights: AIInsightData;
  metrics: AirQualityMetrics;
  onRefresh: () => void;
  onAskAI: (question: string) => Promise<string>;
  isLoading: boolean;
}

const QUICK_PROMPTS = [
  { icon: '🏃', label: 'Safe to exercise outside?', text: 'Is it safe to go for a run or exercise outdoors right now?' },
  { icon: '😷', label: 'Should I wear a mask?', text: 'Do I need to wear a mask today? Which type is effective?' },
  { icon: '👶', label: 'Safe for kids & seniors?', text: 'Is the air quality safe for young children and elderly citizens today?' },
  { icon: '🪟', label: 'Can I open windows?', text: 'Should I keep windows open for fresh air or sealed shut?' },
  { icon: '📈', label: 'When will air improve?', text: 'When will air quality improve, and what are the cleanest hours today?' },
  { icon: '🫁', label: 'Asthma precautions?', text: 'What precautions should people with asthma or breathing allergies take today?' },
];

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  insights,
  metrics,
  onRefresh,
  onAskAI,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'overview'>('chat');
  const [inputQuestion, setInputQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'init-1',
      sender: 'ai',
      text: `👋 **Welcome! I'm AirIndx AI**, your local air health guide for **${metrics.locationName}**.
Current Air: **${metrics.category}** (AQI **${metrics.aqi}**, PM2.5 **${metrics.pm25} µg/m³**).

Ask me any question in simple everyday words, or tap one of the suggested buttons below!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, isAsking, activeTab]);

  const handleSendMessage = async (textToSend: string) => {
    const q = textToSend.trim();
    if (!q || isAsking) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsAsking(true);

    try {
      const answer = await onAskAI(q);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: answer,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `AQI in ${metrics.locationName} is currently ${metrics.aqi} (${metrics.category}). Sensitive individuals should limit outdoor exposure and wear a mask.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputQuestion);
  };

  const clearChatHistory = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'ai',
        text: `Conversation cleared. Air quality in **${metrics.locationName}** is currently **${metrics.category} (AQI ${metrics.aqi})**. How can I help you?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex flex-col h-full select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
            <Sparkles className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-black text-slate-900 text-sm tracking-tight">AirIndx AI Assistant</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Instant layman answers for {metrics.locationName}</p>
          </div>
        </div>

        {/* View Switcher Tabs & Refresh */}
        <div className="flex items-center space-x-1.5">
          <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 text-[11px] ${
                activeTab === 'chat'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              <span>Q&amp;A Chat</span>
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 text-[11px] ${
                activeTab === 'overview'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ListFilter className="w-3 h-3" />
              <span>Overview</span>
            </button>
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all disabled:opacity-50"
            title="Refresh AI Analysis"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* TAB 1: INTERACTIVE CONVERSATIONAL CHAT */}
      {activeTab === 'chat' && (
        <div className="flex-1 flex flex-col justify-between min-h-0">
          {/* Quick Clickable Question Chips */}
          <div className="mb-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Quick Questions</span>
              {messages.length > 2 && (
                <button
                  onClick={clearChatHistory}
                  className="text-[10px] text-slate-400 hover:text-red-600 flex items-center gap-0.5 transition-colors"
                >
                  <Trash2 className="w-2.5 h-2.5" /> Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
              {QUICK_PROMPTS.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(qp.text)}
                  disabled={isAsking}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200/80 hover:border-blue-300 rounded-full text-[11px] font-medium transition-all flex items-center gap-1 shrink-0 disabled:opacity-50 shadow-2xs"
                >
                  <span>{qp.icon}</span>
                  <span>{qp.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages Container */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[220px] max-h-[340px] border border-slate-100 bg-slate-50/50 rounded-2xl p-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-start space-x-2 ${
                  m.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {m.sender === 'ai' && (
                  <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none font-medium'
                      : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none font-normal leading-relaxed'
                  }`}
                >
                  <div className="whitespace-pre-line leading-relaxed font-sans">{m.text}</div>
                  <div
                    className={`text-[9px] mt-1 text-right ${
                      m.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                    }`}
                  >
                    {m.time}
                  </div>
                </div>

                {m.sender === 'user' && (
                  <div className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing / Generating Indicator */}
            {isAsking && (
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-3.5 py-2.5 text-xs text-slate-500 shadow-xs flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] font-medium text-slate-400 pl-1">Analyzing atmosphere...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form Input Bar */}
          <form onSubmit={handleFormSubmit} className="mt-3 pt-2.5 border-t border-slate-100 flex items-center space-x-2">
            <input
              type="text"
              placeholder="Ask anything (e.g. Can I take my child to the park today?)"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              disabled={isAsking}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
            />
            <button
              type="submit"
              disabled={isAsking || !inputQuestion.trim()}
              className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl shadow-md transition-all shrink-0 font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              {isAsking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: STRUCTURED LAYMAN OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="flex-1 flex flex-col justify-between space-y-3 overflow-y-auto pr-1">
          {/* Main Takeaway Banner */}
          <div className="bg-gradient-to-br from-emerald-50/80 via-blue-50/50 to-slate-50 border border-emerald-100/90 rounded-2xl p-3.5">
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 shadow-xs">
                <Leaf className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Simple Takeaway</div>
                <div className="text-sm font-black text-slate-900 mt-0.5 leading-snug">
                  {insights.summaryText}
                </div>
              </div>
            </div>
          </div>

          {/* Observations List */}
          <div>
            <h4 className="font-extrabold text-slate-900 text-xs mb-2 flex items-center justify-between">
              <span>Key Observations</span>
              <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-md">Everyday Language</span>
            </h4>
            <div className="space-y-2">
              {insights.observations.map((obs, idx) => (
                <div
                  key={idx}
                  className="flex items-start space-x-2.5 p-2 bg-slate-50/80 hover:bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 leading-relaxed font-medium transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <span>{obs}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations & Health Guidance */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs text-amber-950">
            <div className="font-extrabold text-amber-900 text-[11px] mb-1 flex items-center space-x-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>Recommended Daily Actions</span>
            </div>
            <ul className="space-y-1 list-disc list-inside text-[11px] text-amber-900/90 font-medium">
              {insights.recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>

          <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Powered by {insights.modelUsed || 'AirIndx Layman Intelligence'}</span>
            <button
              onClick={() => setActiveTab('chat')}
              className="text-blue-600 font-bold hover:underline flex items-center gap-0.5"
            >
              Ask AI Question <ArrowRight className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

