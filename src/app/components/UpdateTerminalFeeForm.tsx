import React, { useState, useEffect } from "react";
import { db } from "@/app/firebase/config"; // Adjust the path to your config
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Loading from "../components/Loading"; // Import the Loading component

const UpdateTerminalFee = () => {
  const [currentFee, setCurrentFee] = useState(""); // Use this state if you need to display the current fee, but will not fetch it
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState<boolean>(false); // Add loading state

  useEffect(() => {
    let fetchCurrentFee = async () => {
      try {
        const docRef = doc(db, "terminal-fee", "current-terminal-fee");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCurrentFee(docSnap.data().fee || ""); // Adjust 'fee' to match your document field
        } else {
          setError("Current fee data not found.");
        }
        await fetchCurrentFee(); // Fetch the updated fee after updating
      } catch (err) {
        console.error("Error fetching current fee:", err);
        setError("An error occurred while fetching the current fee.");
      }
    };

    fetchCurrentFee();
  }, []);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true); // Set loading to true when registration starts

    if (!amount) {
      setError("Please fill in the new fee amount.");
      return;
    }

    const newFee = parseFloat(amount);
    if (newFee <= 0) {
      setError("Fee must be greater than zero.");
      return;
    }

    try {
      const docRef = doc(db, "terminal-fee", "current-terminal-fee");

      await updateDoc(docRef, { fee: newFee }); // Adjust 'fee' to match your document field
      setSuccess(`Fee updated successfully. New fee: ${newFee}`);
      setAmount("");
    } catch (err) {
      console.error("Error updating fee:", err);
      setError("An error occurred while updating the fee.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-base-100 shadow-lg rounded-lg p-8">
      {error && (
        <div className="mb-4 p-3 text-red-700 bg-red-100 rounded">
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 text-green-700 bg-green-100 rounded">
          <span>{success}</span>
        </div>
      )}
      {loading ? (
        <Loading /> // Show Loading component while processing
      ) : (
        <form className="" onSubmit={handleFormSubmit}>
          <h2 className="text-3xl font-bold mb-6 text-center sm:text-2xl xs:text-xl">
            TODAMOON Terminal Fee{" "}
            <span className="badge badge-success">in PESO</span>{" "}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="label" htmlFor="current-fee">
                <span className="label-text">Current Fee</span>
              </label>
              <input
                className="input input-sm input-bordered w-full outline-double"
                id="current-fee"
                type="number"
                value={currentFee}
                onChange={(e) => setCurrentFee(e.target.value)}
                disabled
              />
            </div>
            <div>
              <label className="label" htmlFor="amount">
                <span className="label-text">New Fee</span>
              </label>
              <input
                className="input input-sm input-bordered w-full"
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="000"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-center">
            <button
              className="btn btn-sm btn-neutral w-full max-w-xs"
              type="submit"
            >
              Update Terminal Fee
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UpdateTerminalFee;
