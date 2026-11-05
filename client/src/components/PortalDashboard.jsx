import { useCallback, useEffect, useMemo, useState } from 'react';
import StudentResumeApplyModal from './StudentResumeApplyModal';
import {
  createDrive,
  downloadApplicationResume,
  fetchApplications,
  fetchDrives,
  updateApplicationStatus,
} from '../services/placementService';

const departments = [
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Mechanical',
  'Civil',
  'Electrical',
];
const statuses = ['Applied', 'Under Review', 'Shortlisted', 'Interviewing', 'Offered', 'Joined', 'Rejected'];
const inputClass = 'mt-1 w-full rounded border border-slate-700 bg-slate-900 p-2 text-sm text-white';

const fetchPortalData = async () => {
  const [driveResponse, applicationResponse] = await Promise.all([
    fetchDrives(),
    fetchApplications(),
  ]);
  return {
    drives: driveResponse.data.data,
    applications: applicationResponse.data.data,
  };
};

function PortalDashboard({ user, onSignOut }) {
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [selectedCompanyDrive, setSelectedCompanyDrive] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingDrive, setSavingDrive] = useState(false);

  const loadPortal = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const portalData = await fetchPortalData();
      setDrives(portalData.drives);
      setApplications(portalData.applications);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Could not load the portal.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetchPortalData()
      .then((portalData) => {
        if (active) {
          setDrives(portalData.drives);
          setApplications(portalData.applications);
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.response?.data?.message || requestError.message || 'Could not load the portal.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const appliedDriveIds = useMemo(
    () => new Set(applications.map((application) => application.drive?._id || application.drive)),
    [applications]
  );
  const companyApplications = useMemo(
    () => applications.filter((application) => (
      !selectedCompanyDrive || (application.drive?._id || application.drive) === selectedCompanyDrive
    )),
    [applications, selectedCompanyDrive]
  );

  const handleCreateDrive = async (event) => {
    event.preventDefault();
    setSavingDrive(true);
    setError('');
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const allowedDepartments = form.get('allowedDepartments')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    const requiredSkills = form.get('requiredSkills')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      await createDrive({
        roleTitle: form.get('roleTitle'),
        description: form.get('description'),
        ctcLpa: Number(form.get('ctcLpa')),
        minCgpaRequired: Number(form.get('minCgpaRequired')),
        maxBacklogsAllowed: Number(form.get('maxBacklogsAllowed')),
        allowedDepartments,
        requiredSkills,
      });
      formElement.reset();
      await loadPortal();
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Could not publish job drive.');
    } finally {
      setSavingDrive(false);
    }
  };

  const handleStatusChange = async (applicationId, status) => {
    setError('');
    try {
      await updateApplicationStatus(applicationId, status);
      await loadPortal();
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Could not update application status.');
    }
  };

  const handleResumeDownload = async (application) => {
    try {
      const response = await downloadApplicationResume(application._id);
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${application.studentName}-${application.resumeName}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Could not download resume.');
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 px-4 py-8 text-slate-100 md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-3xl font-extrabold text-indigo-400">Student Placement Tracker</h1>
            <p className="mt-1 text-sm text-slate-400">
              {user.role === 'company' ? user.companyName : user.name} · {user.role === 'company' ? 'Company portal' : 'Student portal'}
            </p>
          </div>
          <button onClick={onSignOut} className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm hover:bg-slate-700">
            Sign out
          </button>
        </header>

        {error && <p role="alert" className="rounded border border-rose-900 bg-rose-950/40 p-3 text-sm text-rose-300">{error}</p>}
        {loading ? (
          <p className="py-12 text-center text-slate-400">Loading...</p>
        ) : user.role === 'company' ? (
          <>
            <section className="rounded-xl border border-slate-700 bg-slate-800 p-5">
              <h2 className="text-xl font-bold">Publish a job drive</h2>
              <form onSubmit={handleCreateDrive} className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="text-sm text-slate-300">Role title
                  <input name="roleTitle" required className={inputClass} />
                </label>
                <label className="text-sm text-slate-300">Package (LPA)
                  <input name="ctcLpa" required type="number" min="0" step="0.1" className={inputClass} />
                </label>
                <label className="text-sm text-slate-300">Minimum CGPA
                  <input name="minCgpaRequired" required type="number" min="0" max="10" step="0.1" className={inputClass} />
                </label>
                <label className="text-sm text-slate-300">Maximum backlogs allowed
                  <input name="maxBacklogsAllowed" required type="number" min="0" step="1" defaultValue="0" className={inputClass} />
                </label>
                <label className="text-sm text-slate-300">Eligible departments (comma-separated; blank means all)
                  <input name="allowedDepartments" placeholder={departments.slice(0, 2).join(', ')} className={inputClass} />
                </label>
                <label className="text-sm text-slate-300">Required skills (comma-separated)
                  <input name="requiredSkills" placeholder="React, Node.js, MongoDB" className={inputClass} />
                </label>
                <label className="text-sm text-slate-300 md:col-span-2">Description
                  <textarea name="description" rows="2" className={inputClass} />
                </label>
                <button disabled={savingDrive} className="rounded bg-indigo-600 px-4 py-2 text-sm font-semibold hover:bg-indigo-500 disabled:opacity-60 md:col-span-2">
                  {savingDrive ? 'Publishing...' : 'Publish drive'}
                </button>
              </form>
            </section>

            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold">Applicants</h2>
                <select value={selectedCompanyDrive} onChange={(event) => setSelectedCompanyDrive(event.target.value)} className="rounded border border-slate-700 bg-slate-800 p-2 text-sm">
                  <option value="">All job drives</option>
                  {drives.map((drive) => <option key={drive._id} value={drive._id}>{drive.roleTitle}</option>)}
                </select>
              </div>
              {companyApplications.length === 0 ? (
                <p className="rounded-xl border border-slate-700 bg-slate-800 p-6 text-slate-400">No applications received yet.</p>
              ) : companyApplications.map((application) => (
                <article key={application._id} className="rounded-xl border border-slate-700 bg-slate-800 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold">{application.studentName} <span className="font-normal text-slate-400">({application.rollNumber})</span></h3>
                      <p className="mt-1 text-sm text-slate-300">{application.drive?.roleTitle} · {application.department} · CGPA {application.studentCgpa} · {application.backlogsCount} backlogs</p>
                      <p className="mt-2 text-sm text-slate-400">{application.criteriaSummary}</p>
                      <p className="mt-1 text-sm text-slate-400">Resume skill match: {application.matchScore === null || application.matchScore === undefined ? 'Not scored' : `${application.matchScore}%`} {application.matchedSkills?.length ? `· ${application.matchedSkills.join(', ')}` : ''}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleResumeDownload(application)} className="rounded border border-slate-600 px-3 py-2 text-sm hover:bg-slate-700">Download resume</button>
                      <select aria-label={`Update status for ${application.studentName}`} value={application.status} onChange={(event) => handleStatusChange(application._id, event.target.value)} className="rounded border border-slate-600 bg-slate-900 p-2 text-sm">
                        {statuses.map((status) => <option key={status}>{status}</option>)}
                      </select>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          </>
        ) : (
          <>
            <section>
              <h2 className="mb-4 text-xl font-bold">Open job drives</h2>
              {drives.length === 0 ? (
                <p className="rounded-xl border border-slate-700 bg-slate-800 p-6 text-slate-400">No open job drives are available yet.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {drives.map((drive) => (
                    <article key={drive._id} className="rounded-xl border border-slate-700 bg-slate-800 p-5">
                      <h3 className="text-lg font-bold text-indigo-300">{drive.roleTitle}</h3>
                      <p className="text-sm text-slate-300">{drive.companyName} · {drive.ctcLpa} LPA</p>
                      {drive.description && <p className="mt-3 text-sm text-slate-400">{drive.description}</p>}
                      <ul className="mt-3 space-y-1 text-sm text-slate-400">
                        <li>CGPA: {drive.minCgpaRequired}+ · Backlogs: {drive.maxBacklogsAllowed} max</li>
                        <li>Departments: {drive.allowedDepartments.length ? drive.allowedDepartments.join(', ') : 'All departments'}</li>
                        <li>Skills: {drive.requiredSkills.length ? drive.requiredSkills.join(', ') : 'Not specified'}</li>
                      </ul>
                      <button
                        disabled={appliedDriveIds.has(drive._id)}
                        onClick={() => setSelectedDrive(drive)}
                        className="mt-4 rounded bg-indigo-600 px-4 py-2 text-sm font-semibold hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-600"
                      >
                        {appliedDriveIds.has(drive._id) ? 'Already applied' : 'Apply with resume'}
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="mb-4 text-xl font-bold">My applications</h2>
              {applications.length === 0 ? (
                <p className="rounded-xl border border-slate-700 bg-slate-800 p-6 text-slate-400">You haven’t applied to any drives yet.</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-800">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-900 text-slate-400">
                      <tr><th className="p-3">Company / role</th><th className="p-3">Resume match</th><th className="p-3">Criteria</th><th className="p-3">Stage</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {applications.map((application) => (
                        <tr key={application._id}>
                          <td className="p-3">{application.drive?.companyName}<div className="text-xs text-slate-400">{application.drive?.roleTitle}</div></td>
                          <td className="p-3">{application.matchScore === null || application.matchScore === undefined ? 'Not scored' : `${application.matchScore}%`}</td>
                          <td className="p-3">{application.criteriaSummary}</td>
                          <td className="p-3">{application.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {selectedDrive && (
        <StudentResumeApplyModal
          drive={selectedDrive}
          user={user}
          onClose={() => setSelectedDrive(null)}
          onSubmitted={() => {
            setSelectedDrive(null);
            loadPortal();
          }}
        />
      )}
    </main>
  );
}

export default PortalDashboard;
