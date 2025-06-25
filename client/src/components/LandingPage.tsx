import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import userData from '../data/users.json';
import SignupModal from './SignupModal';

const LandingPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    const user = userData.users.find(
      (u) => u.username === username && u.password === password
    );
    if (user) {
      navigate('/home');
    } else {
      setError('Invalid credentials');
    }
  };

  const handleSignup = async (newUserData: {
    name: string;
    email: string;
    username: string;
    password: string;
    dateOfBirth: {
      month: string;
      day: string;
      year: string;
    };
  }) => {
    try {
      // Check if username already exists
      const existingUser = userData.users.find(
        (u) => u.username === newUserData.username
      );
      
      if (existingUser) {
        alert('Username already exists. Please choose a different username.');
        return;
      }

      // Add new user to the users array
      const updatedUsers = {
        users: [...userData.users, {
          username: newUserData.username,
          password: newUserData.password,
          name: newUserData.name,
          email: newUserData.email,
          dateOfBirth: newUserData.dateOfBirth
        }]
      };

      // Save to file using the Vite dev server
      const response = await fetch('/api/saveUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUsers),
      });

      if (!response.ok) {
        throw new Error('Failed to save user data');
      }

      setIsSignupModalOpen(false);
      alert('Account created successfully! Please sign in.');
      
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Failed to create account. Please try again.');
    }
  };

  return (
    <>
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="flex justify-center">
            <svg
              viewBox="0 0 24 24"
              className="h-12 w-12 text-white"
              fill="currentColor"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </div>

          <h1 className="text-5xl font-bold text-center mb-2">Happening now</h1>
          <h2 className="text-2xl text-center mb-8">Join today.</h2>

          <div className="space-y-4">
            <button className="w-full flex items-center justify-center gap-2 bg-white text-black rounded-full py-2 px-4 font-medium hover:bg-gray-200 transition-colors">
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              Sign up with Google
            </button>
            
            <button className="w-full flex items-center justify-center gap-2 bg-white text-black rounded-full py-2 px-4 font-medium hover:bg-gray-200 transition-colors">
              <img src="https://www.apple.com/favicon.ico" alt="Apple" className="w-5 h-5" />
              Sign up with Apple
            </button>

            <div className="flex items-center">
              <div className="flex-1 border-t border-gray-600"></div>
              <span className="px-4">or</span>
              <div className="flex-1 border-t border-gray-600"></div>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:border-blue-500"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:border-blue-500"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                onClick={handleLogin}
                className="w-full bg-blue-500 text-white rounded-full py-2 px-4 font-medium hover:bg-blue-600 transition-colors"
              >
                Sign in
              </button>
            </div>

            <button
              onClick={() => setIsSignupModalOpen(true)}
              className="w-full bg-transparent border border-gray-600 text-blue-500 rounded-full py-2 px-4 font-medium hover:bg-blue-500/10 transition-colors"
            >
              Create account
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            By signing up, you agree to the Terms of Service and Privacy Policy, including Cookie Use.
          </p>

          <div className="mt-8">
            <p className="text-gray-500">Already have an account?</p>
            <button className="text-blue-500 hover:underline mt-2">Sign in</button>
          </div>
        </div>
      </div>

      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onSignup={handleSignup}
      />
    </>
  );
};

export default LandingPage;
