import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import Loading from "./Loading";

interface User {
  uid: string;
  name: string;
  email: string;
  phoneNumber: string;
  barangay: string;
  tricycleNumber: string;
  inQueue: boolean;
}

const UpdateDriverForm = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editUser, setEditUser] = useState<User | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const uid = searchParams.get("uid");
    if (uid) {
      const fetchUser = async () => {
        try {
          const response = await fetch(`/api/Driver/getDriver?uid=${uid}`);
          const data = await response.json();

          if (data.error) {
            setError(data.error);
          } else {
            setUser(data.data);
            setEditUser(data.data);
          }
        } catch (error) {
          setError("Failed to fetch user.");
        } finally {
          setLoading(false);
        }
      };

      fetchUser();
    }
  }, [searchParams]);

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (editUser) {
      setEditUser({ ...editUser, [name]: value });
    }
  };

  const handleUpdateUser = async () => {
    if (editUser) {
      setLoading(true);
      try {
        const response = await fetch("/api/Driver/updateDriver", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uid: editUser.uid,
            name: editUser.name,
            tricycleNumber: editUser.tricycleNumber,
            phoneNumber: editUser.phoneNumber,
            currentBarangay: user?.barangay, // Existing barangay
            newBarangay: editUser.barangay, // New barangay from select input
            barangay: editUser.barangay,
            inQueue: user?.inQueue
          }),
        });

        if (response.ok) {
          Swal.fire(
            "Updated!",
            "The user information has been updated.",
            "success"
          );
          router.push("/databases");
        } else {
          Swal.fire("Error!", "Failed to update the user.", "error");
        }
      } catch (error) {
        Swal.fire(
          "Error!",
          "An error occurred while updating the user.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-base-100 shadow-lg rounded-lg p-8 sm:p-6 xs:p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleUpdateUser();
        }}
      >
        <h2 className="text-3xl font-bold mb-6 text-center sm:text-2xl xs:text-xl">
          Update Driver Information
        </h2>

        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
          <div>
            <label className="label" htmlFor="name">
              <span className="label-text">Name</span>
            </label>
            <input
              className="input input-sm input-bordered w-full"
              id="name"
              name="name"
              type="text"
              placeholder="Name"
              value={editUser?.name || ""}
              onChange={handleEditChange}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="phoneNumber">
              <span className="label-text">Phone Number</span>
            </label>
            <input
              className="input input-sm input-bordered w-full"
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              placeholder="Phone Number"
              value={editUser?.phoneNumber || ""}
              onChange={handleEditChange}
              maxLength={11}
            />
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-4">Tricycle Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
          <div>
            <label className="label" htmlFor="barangay">
              <span className="label-text">Select Barangay</span>
            </label>
            <select
              className="select select-sm select-bordered w-full"
              id="barangay"
              name="barangay"
              value={editUser?.barangay || ""}
              onChange={handleEditChange}
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
            <label className="label" htmlFor="tricycleNumber">
              <span className="label-text">
                Tricycle Number (3 digits only)
              </span>
            </label>
            <input
              className="input input-sm input-bordered w-full"
              id="tricycleNumber"
              name="tricycleNumber"
              type="text"
              placeholder="000"
              value={editUser?.tricycleNumber || ""}
              onChange={handleEditChange}
              maxLength={3}
              required
            />
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-4">Account Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="label" htmlFor="email">
              <span className="label-text">Email</span>
            </label>
            <input
              className="input input-sm input-bordered w-full outline-double"
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              value={editUser?.email || ""}
              onChange={handleEditChange}
              disabled
            />
          </div>
        </div>

        <div className="flex items-center justify-center">
          <button
            className="btn btn-sm btn-neutral w-full max-w-xs"
            type="submit"
          >
            Update Driver
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateDriverForm;
