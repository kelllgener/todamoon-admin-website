import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Loading from "./Loading";
import ActionButtons from "./ActionButtons";
import {
  TrashIcon,
  PencilSquareIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

interface User {
  uid: string;
  name: string;
  email: string;
  createdAt: string;
  lastSignInTime: string;
  role: string;
}

const ITEMS_PER_PAGE = 10;
const MAX_PAGE_BUTTONS = 4;

const WebsiteUserDatabase = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/WebsiteUser/getWebsiteUser");
        const data = await response.json();

        if (data.error) {
          setError(data.error);
        } else {
          setUsers(data.data);
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
    // Add update logic here
    console.log(`Updating user with UID: ${uid}`);
  };

  const handleDelete = async (uid: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/WebsiteUser/deleteWebsiteUser", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid }),
      });

      const data = await response.json();

      if (response.ok) {
        // Handle successful deletion
        console.log("User deleted:", data.success);
        setUsers(users.filter((user) => user.uid !== uid));
        Swal.fire("Deleted!", "The user has been deleted.", "success");
      } else {
        // Handle error response
        console.error("Delete failed:", data.error);
        Swal.fire("Error!", "Failed to delete the user.", "error");
      }
    } catch (error) {
      // Handle fetch error
      console.error("An error occurred:", error);
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

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentUsers = users.slice(startIndex, endIndex);

  // Calculate page button range
  const startPage = Math.max(1, currentPage - Math.floor(MAX_PAGE_BUTTONS / 2));
  const endPage = Math.min(totalPages, startPage + MAX_PAGE_BUTTONS - 1);
  const pageButtons = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  return (
    <div>
      {loading ? (
        <Loading /> // Show Loading component while processing
      ) : (
        <div className="overflow-x-auto ">
          <div className="flex flex-row flex-grow justify-end">
            <Link className="flex flex-row btn btn-neutral btn-sm mb-4" 
            href={"/signup"}>
              <UserPlusIcon height={"20px"} /> Add User
            </Link>
          </div>

          <table className="table table-xs table-zebra w-full">
            <thead>
              <tr>
                <th>#</th>
                <th>UID</th>
                <th>Email</th>
                <th>Created At</th>
                <th>Last Sign In Time</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user, index) => (
                <tr key={user.uid}>
                  <td>{startIndex + index + 1}</td>
                  <td>{user.uid}</td>
                  <td>{user.email}</td>
                  <td>{user.createdAt}</td>
                  <td>{user.lastSignInTime}</td>
                  <td>{user.role}</td>
                  <td className="whitespace-nowrap">
                    <ActionButtons
                      uid={user.uid}
                      className="btn-error"
                      Icon={TrashIcon}
                      color="text-red-700"
                      title="delete"
                      onClick={() => handleDeleteClick(user.uid)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-start mt-12">
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
      )}
    </div>
  );
};

export default WebsiteUserDatabase;
