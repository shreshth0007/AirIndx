import React, { useState } from 'react';
import { X, ThumbsUp, AlertTriangle, Plus, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { CommunityReport } from '../types/airQuality';
import { INITIAL_COMMUNITY_REPORTS } from '../data/initialData';

interface CommunityReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommunityReportsModal: React.FC<CommunityReportsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [reports, setReports] = useState<CommunityReport[]>(INITIAL_COMMUNITY_REPORTS);
  const [showAddForm, setShowAddForm] = useState(false);

  // New report form state
  const [location, setLocation] = useState('');
  const [author, setAuthor] = useState('');
  const [type, setType] = useState<CommunityReport['type']>('Stubble Burning');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleUpvote = (id: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r))
    );
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim() || !description.trim()) return;

    const newRep: CommunityReport = {
      id: `rep-${Date.now()}`,
      location,
      author: author.trim() || 'Anonymous Environmental Scout',
      type,
      description,
      timestamp: 'Just now',
      upvotes: 1,
      severity: type === 'Stubble Burning' || type === 'Industrial Emissions' ? 'High' : 'Medium',
      status: 'Verified',
    };

    setReports([newRep, ...reports]);
    setLocation('');
    setDescription('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Community Pollution Reports</h3>
              <p className="text-xs text-slate-300">Crowdsourced real-time air quality observations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Action Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {reports.length} Verified Incidents Reported
            </span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Cancel Form' : 'Submit New Report'}</span>
            </button>
          </div>

          {/* New Report Form */}
          {showAddForm && (
            <form onSubmit={handleAddSubmit} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 animate-fade-in">
              <h4 className="font-bold text-slate-800 text-sm">Submit Air Incident Report</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Location (e.g. Anand Vihar, Delhi NCR)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Your Name (Optional)"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium text-slate-700"
                >
                  <option value="Stubble Burning">Stubble Burning (Crop Fires)</option>
                  <option value="Industrial Emissions">Industrial Emissions & Chimney Smoke</option>
                  <option value="Vehicle Traffic">Heavy Vehicle Exhaust & Traffic</option>
                  <option value="Dust & Construction">Construction Dust & Demolition</option>
                  <option value="Clean Air Spot">Clean Air Spot / Park Recommendation</option>
                </select>
              </div>

              <textarea
                placeholder="Describe what you observed (smell, visibility, time of day)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                required
              />

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publish Report</span>
              </button>
            </form>
          )}

          {/* Reports Feed */}
          <div className="space-y-3">
            {reports.map((rep) => (
              <div key={rep.id} className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-sm hover:border-blue-200 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                    <div>
                      <h5 className="font-bold text-slate-800 text-sm">{rep.location}</h5>
                      <span className="text-[11px] text-slate-400">By {rep.author} • {rep.timestamp}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      rep.severity === 'Critical' || rep.severity === 'High'
                        ? 'bg-red-50 text-red-600 border-red-200'
                        : rep.type === 'Clean Air Spot'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        : 'bg-amber-50 text-amber-600 border-amber-200'
                    }`}
                  >
                    {rep.type}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">{rep.description}</p>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Status: {rep.status}
                  </span>

                  <button
                    onClick={() => handleUpvote(rep.id)}
                    className="flex items-center space-x-1.5 px-3 py-1 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 rounded-xl transition-all font-semibold"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{rep.upvotes} Helpful</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
