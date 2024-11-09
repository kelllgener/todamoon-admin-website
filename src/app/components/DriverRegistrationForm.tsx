import React, { useState } from "react";
import Loading from "./Loading";

const DriverRegistrationForm: React.FC = () => {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [barangay, setBarangay] = useState("");
  const [tricycleNumber, setTricycleNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [plateNumberText, setPlateNumberText] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [plateImage, setPlateImage] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false); // Added loading state

  // Function to handle closing of alerts
  const closeAlert = (type: "error" | "success") => {
    if (type === "error") {
      setError("");
    } else if (type === "success") {
      setSuccess("");
    }
  };

  // Function to reset all form fields
  const resetForm = () => {
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setBarangay("");
    setTricycleNumber("");
    setPhoneNumber("");
    setPlateNumberText("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    // Force file input to reset
    setFileInputKey((prevKey) => prevKey + 1);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPlateImage(file);
    }
  };

  const handleTricycleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    if (/^\d{0,3}$/.test(value)) {
      setTricycleNumber(value);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 11) {
      setPhoneNumber(value);
    }
  };

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true); // Set loading to true before starting the submission

    try {
      const plateImageBase64 = plateImage
        ? await convertFileToBase64(plateImage)
        : null;

      const response = await fetch("/api/Driver/registerDriver", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          firstName,
          middleName,
          lastName,
          barangay,
          tricycleNumber,
          plateNumberText,
          phoneNumber,
          plateImage: plateImageBase64,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess(data.success);
        setError("");
        resetForm(); // Clear the form fields after successful registration
      } else {
        setError(data.error || "An error occurred.");
        setSuccess("");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setError("An unexpected error occurred.");
      setSuccess("");
    } finally {
      setLoading(false); // Set loading to false after the submission
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-base-100 shadow-lg rounded-lg p-8 sm:p-6 xs:p-4">
      {error && (
        <div className="relative alert alert-error mb-4">
          <button
            className="absolute top-0 right-0 mt-2 mr-2 text-red-500 font-bold"
            onClick={() => closeAlert("error")}
          >
            &times;
          </button>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="relative alert alert-success mb-4">
          <button
            className="absolute top-0 right-0 mt-2 mr-2 text-green-500 font-bold"
            onClick={() => closeAlert("success")}
          >
            &times;
          </button>
          <span>{success}</span>
        </div>
      )}
      {loading ? (
        <Loading /> // Show Loading component while processing
      ) : (
        <form
          className=""
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <h2 className="text-3xl font-bold mb-6 text-center sm:text-2xl xs:text-xl">
            Driver Registration
          </h2>

          <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="label" htmlFor="firstname">
                <span className="label-text">Firstname</span>
              </label>
              <input
                className="input input-sm input-bordered w-full"
                id="firstname"
                type="text"
                placeholder="Firstname"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="middlename">
                <span className="label-text">Middlename</span>
              </label>
              <input
                className="input input-sm input-bordered w-full"
                id="middlename"
                type="text"
                placeholder="Middlename"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="label" htmlFor="lastname">
                <span className="label-text">Lastname</span>
              </label>
              <input
                className="input input-sm input-bordered w-full"
                id="lastname"
                type="text"
                placeholder="Lastname"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-4">Tricycle Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="label" htmlFor="barangay">
                <span className="label-text">Select Barangay</span>
              </label>
              <select
                className="select select-sm select-bordered w-full"
                id="barangay"
                value={barangay}
                onChange={(e) => setBarangay(e.target.value)}
                required
              >
                <option value="">Select Barangay</option>
                <option value="Barandal">Barandal</option>
                <option value="Bubuyan">Bubuyan</option>
                <option value="Bunggo">Bunggo</option>
                <option value="Burol">Burol</option>
                <option value="Kay-anlog">Kay-anlog</option>
                <option value="Prinza">Prinza</option>
                <option value="Punta">Punta</option>
              </select>
            </div>

            <div>
              <label className="label" htmlFor="plateNumberText">
                <span className="label-text">Plate Number (Text Only)</span>
              </label>
              <input
                className="input input-sm input-bordered w-full"
                id="plateNumberText"
                type="text"
                placeholder="Plate Number"
                value={plateNumberText}
                onChange={(e) => setPlateNumberText(e.target.value)}
                required
                maxLength={15} 
              />
            </div>

            <div>
              <label className="label" htmlFor="tricycleNumber">
                <span className="label-text">
                  Tricycle Number (3 digits only)
                </span>
              </label>
              <input
                className="input input-sm input-bordered w-full"
                id="tricycleNumber"
                type="text"
                placeholder="000"
                value={tricycleNumber}
                onChange={handleTricycleNumberChange}
                maxLength={3}
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="plateNumber">
                <span className="label-text">Plate Number (Image Only)</span>
              </label>
              <input
                className="file-input file-input-sm file-input-bordered w-full"
                id="plateNumber"
                type="file"
                accept="image/*"
                key={fileInputKey}
                onChange={handleFileChange}
              />
            </div>
            
          </div>

          <h3 className="text-lg font-semibold mb-4">Account Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="label" htmlFor="email">
                <span className="label-text">Email</span>
              </label>
              <input
                className="input input-sm input-bordered w-full"
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="phone">
                <span className="label-text">Phone Number</span>
              </label>
              <input
                className="input input-sm input-bordered w-full"
                id="phone"
                type="tel"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={handlePhoneChange}
                maxLength={11}
              />
            </div>

            <div>
              <label className="label" htmlFor="password">
                <span className="label-text">Password</span>
              </label>
              <input
                className="input input-sm input-bordered w-full"
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="confirmPassword">
                <span className="label-text">Confirm Password</span>
              </label>
              <input
                className="input input-sm input-bordered w-full"
                id="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-center">
            <button
              className="btn btn-sm btn-neutral w-full max-w-xs"
              type="submit"
            >
              Register Driver
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default DriverRegistrationForm;
