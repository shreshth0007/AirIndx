import React, { useState } from 'react';
import { School, ShieldAlert, CheckCircle2, AlertTriangle, Users, Bell, Search, MapPin } from 'lucide-react';
import { SchoolSafetyData } from '../types/airQuality';
import { INITIAL_SCHOOL_SAFETY_LIST } from '../data/initialData';

export const SchoolSafetyModule: React.FC = () => {
  const [schools, setSchools] = useState<SchoolSafetyData[]>(INITIAL_SCHOOL_SAFETY_LIST);
  const [selectedSchool, setSelectedSchool] = useState<SchoolSafetyData>(INITIAL_SCHOOL_SAFETY_LIST[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [alertSent, setAlertSent] = useState(false);

  const filtered = schools.filter(
    (s) =>
      s.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendParentAlert = () => {
    setAlertSent(true);
    setTimeout(() => setAlertSent(false), 4000);
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <School className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-slate-800 text-base sm:text-lg">School Air Safety Index &amp; Recess Advisory</h3>
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-extrabold uppercase">
                Track 01: Air Module
              </span>
            </div>
            <p className="text-xs text-slate-400">Outdoor physical activity safety guidelines for K-12 institutions</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search school or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
        {/* Left Column: Selected School Advisory Details (7 cols) */}
        <div className="lg:col-span-7 bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between">
          <div>
            {/* Top Badge & School Name */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{selectedSchool.city}</span>
                <h4 className="text-xl font-extrabold text-slate-900 mt-0.5">{selectedSchool.schoolName}</h4>
                <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                  <Users className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{selectedSchool.studentCount.toLocaleString()} Enrolled Students</span>
                </div>
              </div>

              {/* Safety Rating Badge */}
              <div className="text-right">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border inline-block ${
                    selectedSchool.safetyRating === 'High Risk' || selectedSchool.safetyRating === 'Hazardous'
                      ? 'bg-red-100 text-red-700 border-red-200'
                      : selectedSchool.safetyRating === 'Caution'
                      ? 'bg-amber-100 text-amber-700 border-amber-200'
                      : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {selectedSchool.safetyRating}
                </span>
                <div className="text-xs font-extrabold text-slate-800 mt-1">AQI {selectedSchool.currentAQI}</div>
              </div>
            </div>

            {/* Recess & PE Advisory Boxes */}
            <div className="mt-5 space-y-3">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs font-bold text-slate-800 mb-1 flex items-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4 text-orange-500" />
                  <span>Outdoor Recess &amp; Play Advisory</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{selectedSchool.recessGuideline}</p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs font-bold text-slate-800 mb-1 flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span>Physical Education (PE) &amp; Sports Drill</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{selectedSchool.outdoorPeGuideline}</p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs font-bold text-slate-800 mb-1 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Classroom Air &amp; Ventilation Protocol</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{selectedSchool.ventilationStatus}</p>
              </div>
            </div>
          </div>

          {/* Action Footer Button */}
          <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between">
            {alertSent ? (
              <div className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Parent Push Notification &amp; Emergency Email Broadcast Dispatched!
              </div>
            ) : (
              <button
                onClick={handleSendParentAlert}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center space-x-1.5"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Broadcast AQI Advisory to Parents</span>
              </button>
            )}
            <span className="text-[11px] text-slate-400 font-mono">CPCB Guidelines Compliant</span>
          </div>
        </div>

        {/* Right Column: School Selector List (5 cols) */}
        <div className="lg:col-span-5 space-y-2.5 overflow-y-auto max-h-[400px]">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Registered School Campuses ({filtered.length})
          </div>

          {filtered.map((sch) => {
            const isSelected = selectedSchool.schoolId === sch.schoolId;
            return (
              <div
                key={sch.schoolId}
                onClick={() => setSelectedSchool(sch)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-indigo-50/90 border-indigo-300 shadow-md ring-2 ring-indigo-400/20'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm leading-snug">{sch.schoolName}</h5>
                    <span className="text-[11px] text-slate-400">{sch.city}</span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      sch.safetyRating === 'High Risk'
                        ? 'bg-red-100 text-red-700 border-red-200'
                        : sch.safetyRating === 'Caution'
                        ? 'bg-amber-100 text-amber-700 border-amber-200'
                        : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {sch.safetyRating}
                  </span>
                </div>

                <div className="mt-2 text-xs font-semibold text-slate-600 flex items-center justify-between">
                  <span>AQI {sch.currentAQI} ({sch.category})</span>
                  <span className="text-[11px] text-indigo-600 hover:underline">View Guidelines &rarr;</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
