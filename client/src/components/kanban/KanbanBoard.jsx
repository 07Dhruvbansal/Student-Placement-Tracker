import { User, Building2, Calendar } from 'lucide-react';

const STAGES = ['Applied', 'Shortlisted', 'Interviewing', 'Offered', 'Joined', 'Rejected'];

const stageColors = {
  Applied: 'border-slate-600 bg-slate-900/50 text-slate-400',
  Shortlisted: 'border-amber-500/50 bg-amber-500/5 text-amber-400',
  Interviewing: 'border-blue-500/50 bg-blue-500/5 text-blue-400',
  Offered: 'border-emerald-500/50 bg-emerald-500/5 text-emerald-400',
  Joined: 'border-indigo-500/50 bg-indigo-500/5 text-indigo-400',
  Rejected: 'border-rose-500/50 bg-rose-500/5 text-rose-400',
};

const KanbanBoard = ({ placements, onStageChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
      {STAGES.map((stage) => {
        const stageItems = placements.filter((p) => p.stage === stage);

        return (
          <div key={stage} className="bg-slate-800/60 rounded-xl border border-slate-700/80 p-3 flex flex-col min-w-[260px]">
            {/* Column Header */}
            <div className={`px-3 py-2 rounded-lg border flex items-center justify-between mb-3 ${stageColors[stage]}`}>
              <span className="font-semibold text-xs tracking-wider uppercase">{stage}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 font-bold">{stageItems.length}</span>
            </div>

            {/* Candidate Cards */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[650px] pr-1">
              {stageItems.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500 border border-dashed border-slate-700 rounded-lg">
                  No records
                </div>
              ) : (
                stageItems.map((item) => (
                  <div
                    key={item._id}
                    className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-indigo-500/50 transition shadow-sm space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-white">{item.studentName}</h4>
                        <p className="text-xs text-slate-400">{item.rollNumber}</p>
                      </div>
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        {item.ctcLpa} LPA
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 flex items-center space-x-1.5 pt-1">
                      <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{item.companyName} ({item.roleTitle})</span>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center space-x-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>{item.department}</span>
                    </div>

                    {item.interviewDate && (
                      <div className="text-[11px] text-amber-300 flex items-center space-x-1 pt-1">
                        <Calendar className="w-3 h-3 text-amber-400" />
                        <span>Date: {new Date(item.interviewDate).toLocaleDateString()}</span>
                      </div>
                    )}

                    {/* Quick Stage Selection Dropdown */}
                    <div className="pt-2 border-t border-slate-700/60 mt-2">
                      <select
                        value={item.stage}
                        onChange={(e) => onStageChange(item._id, e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                      >
                        {STAGES.map((s) => (
                          <option key={s} value={s}>Move to {s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;