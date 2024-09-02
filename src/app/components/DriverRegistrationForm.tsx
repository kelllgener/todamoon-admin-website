import React, { useState } from "react";
import QRCode from "qrcode";
import CryptoJS from "crypto-js";
import { auth, db, storage } from "@/app/firebase/config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FirebaseError } from "firebase/app";

// Helper function to hash passwords
const hashPassword = (password: string) => {
  return CryptoJS.SHA256(password).toString(CryptoJS.enc.Base64);
};

// Helper function to encrypt data
const encryptData = (data: string, key: string) => {
  return CryptoJS.AES.encrypt(data, key).toString();
};

const uploadFile = async (file: File, path: string) => {
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  const downloadUrl = await getDownloadURL(fileRef);
  return downloadUrl;
};

const DriverRegistrationForm: React.FC = () => {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [barangay, setBarangay] = useState("");
  const [tricycleNumber, setTricycleNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [plateImage, setPlateImage] = useState<File | null>(null);
  const [plateImageUrl, setPlateImageUrl] = useState<string>("");
  const [uid, setUid] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const generateQRCode = async (uid: string) => {
    const qrData = `Name: ${firstName} ${middleName} ${lastName}\nTricycle Number: ${tricycleNumber}\nIn Queue: false`;
    const qrCodeUrl = await QRCode.toDataURL(qrData);

    // Upload QR code to Firebase Storage
    const qrCodeRef = ref(storage, `qrcodes/${uid}.png`);
    const response = await fetch(qrCodeUrl);
    const blob = await response.blob();
    await uploadBytes(qrCodeRef, blob);

    const downloadUrl = await getDownloadURL(qrCodeRef);
    return downloadUrl;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const plateImageUrl = await uploadFile(file, `plate_images/${uid}.png`);
      setPlateImageUrl(plateImageUrl);
    }
  };

  const handleSubmit = async () => {
    // Validate if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      // Hash the password
      const hashedPassword = hashPassword(password);

      // Register user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        hashedPassword
      );
      const user = userCredential.user;

      // Ensure user was created successfully
      if (!user) {
        throw new Error("User creation failed.");
      }

      // Generate QR code
      const qrCodeUrl = await generateQRCode(user.uid);

      // Handle profile image upload
      const profileImageRef = ref(storage, `profile_images/${user.uid}.png`);
      const profileResponse = await fetch("/profile_user.png");
      const profileBlob = await profileResponse.blob();
      await uploadBytes(profileImageRef, profileBlob);
      const profileImageUrl = await getDownloadURL(profileImageRef);

      // Encrypt sensitive data
      const encryptedTricycleNumber = encryptData(tricycleNumber, hashedPassword);

      // Save user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: `${firstName} ${middleName} ${lastName}`,
        barangay,
        tricycleNumber: encryptedTricycleNumber, // Store encrypted tricycle number
        email,
        phoneNumber,
        plateNumber: plateImageUrl, // Ensure plateImageUrl is set correctly
        profileImage: profileImageUrl,
        initialBalance: 580,
        role: "Driver",
        inQueue: true,
        qrCodeUrl, // Save QR code URL
      });

      setSuccess("Registration successful.");
    } catch (error) {
      // Type guard for Firebase Authentication error
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/email-already-in-use":
            setError("Email is already in use.");
            break;
          case "auth/weak-password":
            setError("Password is too weak.");
            break;
          case "auth/invalid-email":
            setError("Invalid email address.");
            break;
          default:
            console.error("Error registering user: ", error);
            setError("Registration failed.");
            break;
        }
      } else {
        // Handle other types of errors
        console.error("Unexpected error: ", error);
        setError("An unexpected error occurred.");
      }
    }
  };
  return (
    <form
      className="max-w-4xl mx-auto bg-base-100 shadow-lg rounded-lg p-8 sm:p-6 xs:p-4"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <h2 className="text-3xl font-bold mb-6 text-center sm:text-2xl xs:text-xl">
        Driver Registration
      </h2>

      {error && (
        <div className="mb-4 p-3 text-red-700 bg-red-100 rounded">
          <span>{error}</span>
        </div>
      )}

      {!error && success && (
        <div className="mb-4 p-3 text-green-700 bg-green-100 rounded">
          <span>{success}</span>
        </div>
      )}

      {/* Personal Information */}
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

      {/* Tricycle Information */}
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
          <label className="label" htmlFor="plateNumber">
            <span className="label-text">Plate Number (Image Only)</span>
          </label>
          <input
            className="file-input file-input-sm file-input-bordered w-full"
            id="plateNumber"
            type="file"
            accept="image/*"
            required
            onChange={handleFileChange}
          />
        </div>
        <div>
          <label className="label" htmlFor="tricycleNumber">
            <span className="label-text">Tricycle Number (3 digits only)</span>
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
      </div>

      {/* Account Details */}
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
            required
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
          className="btn btn-sm btn-primary w-full max-w-xs"
          type="button"
          onClick={handleSubmit}
        >
          Signup
        </button>
      </div>
    </form>
  );
};

export default DriverRegistrationForm;
