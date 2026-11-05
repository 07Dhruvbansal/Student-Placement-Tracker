import { useState } from 'react';
import { loginUser, registerUser } from '../services/placementService';

const departments = [
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Mechanical',
  'Civil',
  'Electrical',
];

function AuthForm({ onAuthenticated }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState(departments[0]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const request = isRegistering
        ? registerUser({
          name,
          email,
          password,
          role,
          ...(role === 'student' ? { department } : { companyName }),
        })
        : loginUser({ email, password });
      const response = await request;
      const user = response.data.data;

      if (!user?.token) {
        throw new Error('Authentication succeeded but no access token was returned.');
      }

      onAuthenticated(user);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6">
      <section className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-800 p-8 shadow-xl">
        <h1 className="text-2xl font-extrabold text-indigo-400">Student Placement Tracker</h1>
        <p className="mt-2 text-sm text-slate-400">
          {isRegistering ? 'Create a student or company account to continue.' : 'Sign in to access your placement portal.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {isRegistering && (
            <>
              <label className="block text-sm text-slate-300">
                Account type
                <select
                  required
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  className="mt-1 w-full rounded border border-slate-600 bg-slate-900 p-2 text-white"
                >
                  <option value="student">Student</option>
                  <option value="company">Company</option>
                </select>
              </label>
              <label className="block text-sm text-slate-300">
                Name
                <input
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-1 w-full rounded border border-slate-600 bg-slate-900 p-2 text-white"
                />
              </label>
              {role === 'student' ? (
                <label className="block text-sm text-slate-300">
                  Department
                  <select
                    required
                    value={department}
                    onChange={(event) => setDepartment(event.target.value)}
                    className="mt-1 w-full rounded border border-slate-600 bg-slate-900 p-2 text-white"
                  >
                    {departments.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
              ) : (
                <label className="block text-sm text-slate-300">
                  Company name
                  <input
                    required
                    value={companyName}
                    onChange={(event) => setCompanyName(event.target.value)}
                    className="mt-1 w-full rounded border border-slate-600 bg-slate-900 p-2 text-white"
                  />
                </label>
              )}
            </>
          )}

          <label className="block text-sm text-slate-300">
            Email
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded border border-slate-600 bg-slate-900 p-2 text-white"
            />
          </label>
          <label className="block text-sm text-slate-300">
            Password
            <input
              type="password"
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
              minLength={isRegistering ? 6 : undefined}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded border border-slate-600 bg-slate-900 p-2 text-white"
            />
          </label>

          {error && <p role="alert" className="text-sm text-rose-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded bg-indigo-600 px-4 py-2 font-semibold transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Please wait...' : isRegistering ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setIsRegistering(!isRegistering);
            setError('');
          }}
          className="mt-4 text-sm text-indigo-300 hover:text-indigo-200"
        >
          {isRegistering ? 'Already have an account? Sign in' : 'New here? Create a student account'}
        </button>
      </section>
    </main>
  );
}

export default AuthForm;
