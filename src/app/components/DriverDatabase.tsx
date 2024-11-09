import { useState, useEffect } from "react";
import Image from "next/image";
import Swal from "sweetalert2";
import Loading from "./Loading";
import ActionButtons from "./ActionButtons";
import { useRouter } from "next/navigation";
import { TrashIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import Modal from "./Modal";

interface User {
  uid: string;
  name: string;
  email: string;
  phoneNumber: string;
  barangay: string;
  balance: number;
  role: string;
  tricycleNumber: string;
  plateNumberText: string;
  profileImage?: string;
  plateNumber?: string;
  qrCodeUrl?: string;
}

const ITEMS_PER_PAGE = 10;
const MAX_PAGE_BUTTONS = 4; // Maximum page buttons to display

const DriverDatabase = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState(""); // Add filter state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/Driver/getDriver");
        const data = await response.json();

        if (data.error) {
          setError(data.error);
        } else {
          const usersWithQRCode = await Promise.all(
            data.data.map(async (user: User) => {
              const qrResponse = await fetch(
                `/api/Driver/getQrData?uid=${user.uid}`
              );
              const qrData = await qrResponse.json();
              return {
                ...user,
                qrCodeUrl: qrData.data.qrCodeUrl,
              };
            })
          );
          setUsers(usersWithQRCode);
        }
      } catch (error) {
        setError("Failed to fetch users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleUpdate = (uid: string) => {
    router.push(`/update-driver?uid=${uid}`);
  };

  const handleDelete = async (uid: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/Driver/deleteDriver", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid }),
      });

      const data = await response.json();

      if (response.ok) {
        setUsers(users.filter((user) => user.uid !== uid));
        Swal.fire("Deleted!", "The user has been deleted.", "success");
      } else {
        Swal.fire("Error!", "Failed to delete the user.", "error");
      }
    } catch (error) {
      Swal.fire(
        "Error!",
        "An error occurred while deleting the user.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (uid: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        handleDelete(uid);
      }
    });
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <p>{error}</p>;
  }

  // Filter users based on name, email, or barangay
  const filteredUsers = users.filter((user) => {
    return (
      user.name.toLowerCase().includes(filter.toLowerCase()) ||
      user.email.toLowerCase().includes(filter.toLowerCase()) ||
      user.barangay.toLowerCase().includes(filter.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Calculate page button range
  const startPage = Math.max(1, currentPage - Math.floor(MAX_PAGE_BUTTONS / 2));
  const endPage = Math.min(totalPages, startPage + MAX_PAGE_BUTTONS - 1);
  const pageButtons = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  return (
    <>
      <div className="flex mb-6 mt-1">
        <label className="input input-sm input-bordered flex items-center gap-2">
          <input
            type="text"
            className="grow"
            placeholder="Search by name, email, or barangay"
            value={filter}
            onChange={(e) => setFilter(e.target.value)} // Update filter state
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="h-4 w-4 opacity-70"
          >
            <path
              fillRule="evenodd"
              d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
              clipRule="evenodd"
            />
          </svg>
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="table table-xs table-zebra w-full min-w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>UID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Barangay</th>
              <th>Balance</th>
              <th>Tricycle Number</th>
              <th>Plate Number (Text)</th>
              <th>QR Code</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user, index) => (
              <tr key={user.uid}>
                <td>{startIndex + index + 1}</td>
                <td>{user.uid}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phoneNumber}</td>
                <td>{user.barangay}</td>
                <td>{user.balance}</td>
                <td>{user.tricycleNumber}</td>
                <td>{user.plateNumberText}</td>
                <td>
                  {user.qrCodeUrl && (
                    <Image
                      src={user.qrCodeUrl || ""}
                      alt="QR Code"
                      width={32}
                      height={32}
                      onClick={() => handleImageClick(user.qrCodeUrl || "")}
                    />
                  )}
                </td>
                <td className="whitespace-nowrap">
                  <ActionButtons
                    uid={user.uid}
                    className="btn-secondary"
                    Icon={PencilSquareIcon}
                    color="text-gray-700"
                    title="update"
                    onClick={() => handleUpdate(user.uid)}
                  />
                  <ActionButtons
                    uid={user.uid}
                    className="btn-error"
                    color="text-red-700"
                    Icon={TrashIcon}
                    title="delete"
                    onClick={() => handleDeleteClick(user.uid)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-start mt-4 sm:mt-6">
          <div className="btn-group">
            <button
              className="btn btn-square btn-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              «
            </button>
            {pageButtons.map((page) => (
              <button
                key={page}
                className={`btn btn-square btn-sm ${
                  currentPage === page ? "btn-active" : ""
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="btn btn-square btn-sm"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
            >
              »
            </button>
          </div>
        </div>
      </div>
      {selectedImage && <Modal imageUrl={selectedImage} onClose={closeModal} />}
    </>
  );
};

export default DriverDatabase;
