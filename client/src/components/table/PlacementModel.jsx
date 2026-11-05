import { useState } from 'react';

const departments = [
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Mechanical',
  'Civil',
  'Electrical',
];

const inputClassName = 'w-full rounded border border-slate-700 bg-slate-900 p-2 text-sm text-white';
const labelClassName = 'block text-xs font-semibold text-slate-300';

const PlacementModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    studentName: '',
    rollNumber: '',
    department: 'Computer Science',
    studentCgpa: '7.5',
    backlogsCount: '0',
    companyName: '',
    roleTitle: '',
    minCgpaRequired: '6.5',
    maxBacklogsAllowed: '0',
    ctcLpa: '',
  });

  if (!isOpen) return null;

  const updateField = (event) => {
    const { name, value } = event.target;
    setFormData((currentData) => ({ ...currentData, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (Number(formData.studentCgpa) < Number(formData.minCgpaRequired)) {
      alert(`Student CGPA (${formData.studentCgpa}) is below company minimum (${formData.minCgpaRequired}). Cannot process application.`);
      return;
    }

    if (Number(formData.backlogsCount) > Number(formData.maxBacklogsAllowed)) {
      alert('Student backlogs exceed the company maximum allowed.');
      return;
    }

    onSave({
      ...formData,
      studentCgpa: Number(formData.studentCgpa),
      backlogsCount: Number(formData.backlogsCount),
      minCgpaRequired: Number(formData.minCgpaRequired),
      maxBacklogsAllowed: Number(formData.maxBacklogsAllowed),
      ctcLpa: Number(formData.ctcLpa),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-700 bg-slate-800 p-6 text-white">
        <h2 className="mb-4 text-xl font-bold text-indigo-400">Add Student Application</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className={labelClassName}>
              Student name
              <input
                name="studentName"
                required
                autoComplete="name"
                value={formData.studentName}
                onChange={updateField}
                className={`${inputClassName} mt-1`}
              />
            </label>
            <label className={labelClassName}>
              Roll number
              <input
                name="rollNumber"
                required
                value={formData.rollNumber}
                onChange={updateField}
                className={`${inputClassName} mt-1`}
              />
            </label>
            <label className={labelClassName}>
              Department
              <select
                name="department"
                required
                value={formData.department}
                onChange={updateField}
                className={`${inputClassName} mt-1`}
              >
                {departments.map((department) => <option key={department}>{department}</option>)}
              </select>
            </label>
            <label className={labelClassName}>
              Student CGPA
              <input
                name="studentCgpa"
                type="number"
                min="0"
                max="10"
                step="0.1"
                required
                value={formData.studentCgpa}
                onChange={updateField}
                className={`${inputClassName} mt-1`}
              />
            </label>
            <label className={labelClassName}>
              Backlogs
              <input
                name="backlogsCount"
                type="number"
                min="0"
                step="1"
                required
                value={formData.backlogsCount}
                onChange={updateField}
                className={`${inputClassName} mt-1`}
              />
            </label>
            <label className={labelClassName}>
              Company
              <input
                name="companyName"
                required
                value={formData.companyName}
                onChange={updateField}
                className={`${inputClassName} mt-1`}
              />
            </label>
            <label className={labelClassName}>
              Role title
              <input
                name="roleTitle"
                required
                value={formData.roleTitle}
                onChange={updateField}
                className={`${inputClassName} mt-1`}
              />
            </label>
            <label className={labelClassName}>
              Package (LPA)
              <input
                name="ctcLpa"
                type="number"
                min="0.1"
                step="0.1"
                required
                value={formData.ctcLpa}
                onChange={updateField}
                className={`${inputClassName} mt-1`}
              />
            </label>
            <label className={labelClassName}>
              Minimum required CGPA
              <input
                name="minCgpaRequired"
                type="number"
                min="0"
                max="10"
                step="0.1"
                required
                value={formData.minCgpaRequired}
                onChange={updateField}
                className={`${inputClassName} mt-1`}
              />
            </label>
            <label className={labelClassName}>
              Maximum allowed backlogs
              <input
                name="maxBacklogsAllowed"
                type="number"
                min="0"
                step="1"
                required
                value={formData.maxBacklogsAllowed}
                onChange={updateField}
                className={`${inputClassName} mt-1`}
              />
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="rounded bg-slate-700 px-4 py-2 text-sm">Cancel</button>
            <button type="submit" className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium">Verify & Apply</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlacementModal;
