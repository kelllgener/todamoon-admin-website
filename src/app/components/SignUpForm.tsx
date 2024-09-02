'use client';
import { useState } from 'react';
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth, db } from '@/app/firebase/config';
import { doc, setDoc } from 'firebase/firestore';

const SignUpForm = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [createUserWithEmailAndPassword] = useCreateUserWithEmailAndPassword(auth);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(email, password);

      if (!userCredential) {
        throw new Error('Failed to create user');
      }

      const user = userCredential.user;

      // Add user data to Firestore
      await setDoc(doc(db, 'website-users', user.uid), {
        email: user.email,
        uid: user.uid,
        createdAt: new Date().toISOString(),
      });

      console.log('User created and added to Firestore successfully:', userCredential);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setError(null); // Clear error message on successful signup
    } catch (e: any) {
      console.error('Error during sign-up:', e.message);
      setError(e.message); // Set error message
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-sm p-8 bg-white rounded-lg shadow-md">
        {error && (
          <div className="alert alert-error mb-4">
            <div>
              <span>{error}</span>
            </div>
          </div>
        )}
        <h2 className="text-2xl font-semibold text-center mb-6">TODAMOON Signup</h2>
        <form onSubmit={handleSignup}>
          <div className="mb-4">
            <label className="block mb-2 text-sm text-gray-700" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="input input-bordered w-full input-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm text-gray-700" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="input input-bordered w-full input-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 text-sm text-gray-700" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="input input-bordered w-full input-sm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-full btn-sm">
            Signup
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUpForm;
