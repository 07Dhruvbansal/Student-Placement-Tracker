import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Users, TrendingUp, Award, Building, DollarSign } from 'lucide-react';

const COLORS = ['#6366F1', '#3B82F6', '#F59E0B', '#10B981', '#EC4899', '#EF4444'];

const AnalyticsDashboard = ({ placements }) => {
  // 1. Calculate KPI Metrics
  const totalStudents = placements.length;
  const placedCount = placements.filter(p => ['Offered', 'Joined'].includes(p.stage)).length;
  const placementRate = totalStudents > 0 ? ((placedCount / totalStudents) * 100).toFixed(1) : 0;
  
  const activeDrives = placements.filter(p => ['Shortlisted', 'Interviewing'].includes(p.stage)).length;

  const validPackages = placements.map(p => Number(p.ctcLpa) || 0).filter(val => val > 0);
  const avgPackage = validPackages.length > 0 
    ? (validPackages.reduce((a, b) => a + b, 0) / validPackages.length).toFixed(1) 
    : 0;
  const maxPackage = validPackages.length > 0 ? Math.max(...validPackages) : 0;

  // 2. Department Breakdown Data for Bar Chart
  const deptMap = {};
  placements.forEach(p => {
    deptMap[p.department] = (deptMap[p.department] || 0) + 1;
  });
  const deptData = Object.keys(deptMap).map(dept => ({
    name: dept,
    count: deptMap[dept]
  }));

  // 3. Stage Distribution Data for Pie/Donut Chart
  const stageMap = {};
  placements.forEach(p => {
    stageMap[p.stage] = (stageMap[p.stage] || 0) + 1;
  });
  const stageData = Object.keys(stageMap).map(stage => ({
    name: stage,
    value: stageMap[stage]
  }));

  return (
    <div className="space-y-6">
      {/* 5 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase">Total Candidates</p>
            <h3 className="text-2xl font-bold text-white mt-1">{totalStudents}</h3>
          </div>
          <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase">Placement Rate</p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1">{placementRate}%</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase">Active Drives</p>
            <h3 className="text-2xl font-bold text-amber-400 mt-1">{activeDrives}</h3>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400">
            <Building className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase">Avg Package</p>
            <h3 className="text-2xl font-bold text-blue-400 mt-1">{avgPackage} LPA</h3>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase">Highest Package</p>
            <h3 className="text-2xl font-bold text-pink-400 mt-1">{maxPackage} LPA</h3>
          </div>
          <div className="p-3 bg-pink-500/10 rounded-lg text-pink-400">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recharts Data Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution Bar Chart */}
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
          <h3 className="text-base font-semibold text-slate-200 mb-4">Department Applications Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px', color: '#F8FAFC' }} />
                <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stage Ratios Donut Chart */}
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
          <h3 className="text-base font-semibold text-slate-200 mb-4">Application Stage Ratios</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px', color: '#F8FAFC' }} />
                <Legend wrapperStyle={{ color: '#94A3B8', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;