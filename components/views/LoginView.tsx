import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { USER_ROLES_OPTIONS } from '../../constants';
import { Button } from '../Button';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.DONOR);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      role
    };
    onLogin(newUser);
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
          <p className="text-slate-500">Sign in to Kilo a Ko'a</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input 
              type="text" 
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              placeholder="e.g. Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" 
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              placeholder="jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">I am a...</label>
            <select 
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              {USER_ROLES_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">Select 'Scientist' to upload photos or 'Admin' to write blogs.</p>
          </div>

          <Button type="submit" className="w-full h-12 text-lg mt-6">
            Sign In / Register
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          <p>By signing up, you agree to receive updates about our coral conservation efforts.</p>
        </div>
      </div>
    </div>
  );
};