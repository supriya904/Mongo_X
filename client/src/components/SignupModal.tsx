import { useState } from 'react';
import { X } from 'lucide-react';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignup: (userData: {
    name: string;
    email: string;
    username: string;
    password: string;
    dateOfBirth: {
      month: string;
      day: string;
      year: string;
    };
  }) => void;
}

const SignupModal = ({ isOpen, onClose, onSignup }: SignupModalProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [month, setMonth] = useState('December');
  const [day, setDay] = useState('1');
  const [year, setYear] = useState('2002');
  const [error, setError] = useState('');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => (currentYear - i).toString());

  const handleSubmit = () => {
    if (!name || !email || !username || !password) {
      setError('All fields are required');
      return;
    }
    
    onSignup({
      name,
      email,
      username,
      password,
      dateOfBirth: {
        month,
        day,
        year
      }
    });
    
    // Reset form
    setName('');
    setEmail('');
    setUsername('');
    setPassword('');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-black rounded-2xl p-8 max-w-lg w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-white hover:bg-gray-800 rounded-full p-1"
        >
          <X size={20} />
        </button>

        <div className="flex justify-center mb-6">
          <svg
            viewBox="0 0 24 24"
            className="h-8 w-8 text-white"
            fill="currentColor"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-white mb-8">Create your account</h2>

        <div className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black border border-gray-600 rounded text-white px-4 py-3 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-gray-600 rounded text-white px-4 py-3 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black border border-gray-600 rounded text-white px-4 py-3 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-gray-600 rounded text-white px-4 py-3 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-white mb-2">Date of birth</label>
            <p className="text-gray-500 text-sm mb-4">
              This will not be shown publicly. Confirm your own age, even if this account is for a business, a pet, or something else.
            </p>
            <div className="grid grid-cols-3 gap-4">
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="bg-black border border-gray-600 rounded text-white px-4 py-3 focus:outline-none focus:border-blue-500"
              >
                {months.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="bg-black border border-gray-600 rounded text-white px-4 py-3 focus:outline-none focus:border-blue-500"
              >
                {days.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="bg-black border border-gray-600 rounded text-white px-4 py-3 focus:outline-none focus:border-blue-500"
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm mt-4">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          className="w-full bg-white text-black rounded-full py-3 px-4 font-bold mt-8 hover:bg-gray-200 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SignupModal;
