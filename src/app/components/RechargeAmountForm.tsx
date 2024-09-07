import React, { useState } from "react";
import { db } from '@/app/firebase/config'; // Adjust the path to your config
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";

const RechargeAmountForm = () => {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !amount) {
      setError("Please fill in all fields.");
      return;
    }

    const rechargeAmount = parseFloat(amount);
    if (rechargeAmount <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }

    try {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("email", "==", email),
        where("role", "==", "Driver")
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("Driver not found.");
        return;
      }

      querySnapshot.forEach(async (userDoc) => {
        const userData = userDoc.data();
        const newBalance = (userData.balance || 0) + rechargeAmount;

        await updateDoc(doc(db, "users", userDoc.id), { balance: newBalance });
        setSuccess(`Balance updated successfully. New balance: ${newBalance}`);
      });

      setEmail("");
      setAmount("");
    } catch (err) {
      console.error("Error updating balance:", err);
      setError("An error occurred while updating the balance.");
    }
  };

  return (
    <form className="max-w-4xl mx-auto bg-base-100 shadow-lg rounded-lg p-8" onSubmit={handleFormSubmit}>
      <h2 className="text-3xl font-bold mb-6 text-center sm:text-2xl xs:text-xl">TODAMOON Recharge</h2>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="label" htmlFor="email">
            <span className="label-text">Email</span>
          </label>
          <input
            className="input input-sm input-bordered w-full"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@gmail.com"
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="amount">
            <span className="label-text">Amount</span>
          </label>
          <input
            className="input input-sm input-bordered w-full"
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100"
            required
          />
        </div>
      </div>

      <div className="flex items-center justify-center">
        <button className="btn btn-sm btn-neutral w-full max-w-xs" type="submit">
          Recharge
        </button>
      </div>
    </form>
  );
};

export default RechargeAmountForm;
