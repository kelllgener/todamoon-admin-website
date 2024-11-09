import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Loading from "./Loading";
import ActionButtons from "./ActionButtons";
import { TrashIcon } from "@heroicons/react/24/outline";

interface BillingRecords {
  recordId: string;
  description: string;
  name: string;
  email: string;
  uid: string;
  amount: number;
  timestamp: {
    _seconds: number;
    _nanoseconds: number;
  };
}

const ITEMS_PER_PAGE = 10;
const MAX_PAGE_BUTTONS = 4;

const BillingRecordsDatabase = () => {
  const [records, setRecords] = useState<BillingRecords[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<BillingRecords[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await fetch("/api/BillingRecord/getRecord");
        const data = await response.json();

        if (data.error) {
          setError(data.error);
        } else {
          setRecords(data.data);
          setFilteredRecords(data.data); // Initialize filtered records
        }
      } catch (error) {
        setError("Failed to fetch records.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  const handleDelete = async (recordId: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/BillingRecord/deleteRecord", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recordId }),
      });

      const data = await response.json();

      if (response.ok) {
        setRecords(records.filter((record) => record.recordId !== recordId));
        setFilteredRecords(
          filteredRecords.filter((record) => record.recordId !== recordId)
        );
        Swal.fire("Deleted!", "The record has been deleted.", "success");
      } else {
        Swal.fire("Error!", "Failed to delete the record.", "error");
      }
    } catch (error) {
      Swal.fire(
        "Error!",
        "An error occurred while deleting the record.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (recordId: string) => {
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
        handleDelete(recordId);
      }
    });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = records.filter((record) =>
      record.name.toLowerCase().includes(query)
    );
    setFilteredRecords(filtered);
    setCurrentPage(1); // Reset to first page after filtering
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const formatTimestamp = (timestamp: {
    _seconds: number;
    _nanoseconds: number;
  }) => {
    const date = new Date(timestamp._seconds * 1000);
    return date.toLocaleString();
  };

  const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  const startPage = Math.max(1, currentPage - Math.floor(MAX_PAGE_BUTTONS / 2));
  const endPage = Math.min(totalPages, startPage + MAX_PAGE_BUTTONS - 1);
  const pageButtons = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  return (
    <div>
      <div className="flex mb-6 mt-1">
        <label className="input input-sm input-bordered flex items-center gap-2">
          <input
            type="text"
            className="grow"
            placeholder="Search by name"
            value={searchQuery}
            onChange={handleSearchChange}
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
      <div className="w-full md:w-auto">
        <table className="table table-xs table-zebra overflow-x-auto">
          <thead>
            <tr>
              <th>#</th>
              <th>Record ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((record, index) => (
              <tr key={record.recordId}>
                <td>{startIndex + index + 1}</td>
                <td>{record.recordId}</td>
                <td>{record.name}</td>
                <td>{record.description}</td>
                <td>{record.amount}</td>
                <td>{formatTimestamp(record.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-start mt-4 md:mt-12">
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
  );
};

export default BillingRecordsDatabase;
