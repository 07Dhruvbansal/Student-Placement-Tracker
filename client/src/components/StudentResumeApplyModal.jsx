import { useState } from 'react';
import { submitApplication } from '../services/placementService';

function StudentResumeApplyModal({ drive, user, onClose, onSubmitted }) {
  const [rollNumber, setRollNumber] = useState('');
  const [studentCgpa, setStudentCgpa] = useState('');
  const [backlogsCount, setBacklogsCount] = useState('0');
  const [resume, setResume] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!drive) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!resume) {
      setError('Select a PDF or DOCX resume to apply.');
      return;
    }

    const formData = new FormData();
    formData.append('rollNumber', rollNumber);
    formData.append('studentCgpa', studentCgpa);
    formData.append('backlogsCount', backlogsCount);
    formData.append('resume', resume);

    setSubmitting(true);
    try {
      await submitApplication(drive._id, formData);
      onSubmitted();
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Could not submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <section className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-700 bg-slate-800 p-6 text-white">
        <h2 className="text-xl font-bold text-indigo-300">Apply to {drive.companyName}</h2>
        <p className="mt-1 text-sm text-slate-400">{drive.roleTitle}</p>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block text-sm text-slate-300">
            Student
            <input disabled value={user.name} className="mt-1 w-full rounded border border-slate-700 bg-slate-900 p-2 text-slate-400" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-slate-300">
              Roll number
              <input required value={rollNumber} onChange={(event) => setRollNumber(event.target.value)} className="mt-1 w-full rounded border border-slate-600 bg-slate-900 p-2" />
            </label>
            <label className="block text-sm text-slate-300">
              Department
              <input disabled value={user.department} className="mt-1 w-full rounded border border-slate-700 bg-slate-900 p-2 text-slate-400" />
            </label>
            <label className="block text-sm text-slate-300">
              CGPA (out of 10)
              <input required type="number" min="0" max="10" step="0.01" value={studentCgpa} onChange={(event) => setStudentCgpa(event.target.value)} className="mt-1 w-full rounded border border-slate-600 bg-slate-900 p-2" />
            </label>
            <label className="block text-sm text-slate-300">
              Backlogs
              <input required type="number" min="0" step="1" value={backlogsCount} onChange={(event) => setBacklogsCount(event.target.value)} className="mt-1 w-full rounded border border-slate-600 bg-slate-900 p-2" />
            </label>
          </div>
          <label className="block text-sm text-slate-300">
            Resume (PDF or DOCX, max 5 MB)
            <input required type="file" accept=".pdf,.docx" onChange={(event) => setResume(event.target.files?.[0] || null)} className="mt-1 block w-full text-sm text-slate-300" />
          </label>
          {error && <p role="alert" className="text-sm text-rose-400">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded bg-slate-700 px-4 py-2 text-sm">Cancel</button>
            <button disabled={submitting} type="submit" className="rounded bg-indigo-600 px-4 py-2 text-sm font-semibold disabled:opacity-60">
              {submitting ? 'Submitting...' : 'Submit application'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default StudentResumeApplyModal;
