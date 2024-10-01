"use client";
import { useState } from "react";
import Loading from "../components/Loading"; // Import the Loading component

const SignUpForm = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null); // Add success state
  const [loading, setLoading] = useState<boolean>(false); // Add loading state
  const [role, setRole] = useState<string>("ADMINISTRATOR"); // Add role state

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true); // Set loading to true when registration starts
    setError(null); // Clear previous errors
    setSuccess(null); // Clear previous success messages

    try {
      // Make a POST request to the signup API
      const response = await fetch('/api/WebsiteUser/addWebsiteUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to sign up');
      }

      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setSuccess("Signup successful! Welcome to TODAMOON."); // Set success message
    } catch (e: any) {
      console.error("Error during sign-up:", e.message);
      setError(e.message || "An error occurred during sign-up. Please try again.");
    } finally {
      setLoading(false); // Set loading to false when registration completes
    }
  };

  return (
    <div className="flex justify-center items-center bg-gray-100">
      <div className="w-full max-w-sm p-8 bg-white rounded-lg shadow-md">
        <>
          {error && (
            <div className="alert alert-error mb-4">
              <div>
                <span>{error}</span>
              </div>
            </div>
          )}
          {success && (
            <div className="alert alert-success mb-4">
              <div>
                <span>{success}</span>
              </div>
            </div>
          )}
          <h2 className="text-2xl font-semibold text-center mb-6">
            TODAMOON Signup
          </h2>
          {loading ? (
            <Loading /> // Show Loading component while processing
          ) : (
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
                <label className="block mb-2 text-sm text-gray-700" htmlFor="role">
                  Role
                </label>
                <select
                  id="role"
                  className="select select-bordered w-full select-sm"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="ADMINISTRATOR">ADMINISTRATOR</option>
                  <option value="COLLECTOR">COLLECTOR</option>
                </select>
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
              <button type="submit" className="btn btn-neutral w-full btn-sm">
                Signup
              </button>
            </form>
          )}
        </>
      </div>
    </div>
  );
};

export default SignUpForm;
