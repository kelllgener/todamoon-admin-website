import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Loading from "./Loading";
import ExportToExcelButton from "./ExportExcelButton";
import ExportToPDFButtonForQueueing from "./ExportPDFButtonForQueueing";

interface Transaction {
  transactionId: string; // Added transactionId
  action: string;
  name: string;
  barangay: string;
  driverId: string;
  amount: number;
  timestamp: {
    _seconds: number;
    _nanoseconds: number;
  };
}

const ITEMS_PER_PAGE = 10;
const MAX_PAGE_BUTTONS = 4;

const TransactionDatabase = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch("/api/Transaction/getTransaction");
        const data = await response.json();

        if (data.error) {
          setError(data.error);
        } else {
          setTransactions(data.data);
          setFilteredRecords(data.data); // Initialize filtered records
        }
      } catch (error) {
        setError("Failed to fetch transactions.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleDelete = async (transactionId: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/Transaction/deleteTransaction", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transactionId }),
      });

      if (response.ok) {
        setTransactions(transactions.filter((t) => t.transactionId !== transactionId));
        setFilteredRecords(filteredRecords.filter((t) => t.transactionId !== transactionId));
        Swal.fire("Deleted!", "The transaction has been deleted.", "success");
      } else {
        Swal.fire("Error!", "Failed to delete the transaction.", "error");
      }
    } catch (error) {
      Swal.fire("Error!", "An error occurred while deleting the transaction.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (transactionId: string) => {
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
        handleDelete(transactionId);
      }
    });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = transactions.filter(
      (transaction) =>
        transaction.action.toLowerCase().includes(query) ||
        transaction.barangay.toLowerCase().includes(query) ||
        transaction.name.toLowerCase().includes(query)
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

  const formatTimestamp = (timestamp: { _seconds: number; _nanoseconds: number }) => {
    const date = new Date(timestamp._seconds * 1000);
    return date.toLocaleString();
  };

  const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTransactions = filteredRecords.slice(startIndex, endIndex);

  const startPage = Math.max(1, currentPage - Math.floor(MAX_PAGE_BUTTONS / 2));
  const endPage = Math.min(totalPages, startPage + MAX_PAGE_BUTTONS - 1);
  const pageButtons = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  return (
    <div>
      <div className="flex mb-6 mt-1">
        <label className="input input-sm input-bordered flex items-center gap-2">
          <input
            type="text"
            className="grow"
            placeholder="Search"
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
        <div className="flex flex-row flex-grow justify-end">
          <ExportToPDFButtonForQueueing collectionName="queueing_history" fileName="QueueingRecords" />
          <ExportToExcelButton collectionName="queueing_history" fileName="QueueingRecords" />
        </div>
      </div>
      <table className="table table-xs table-zebra w-full">
        <thead>
          <tr>
            <th>#</th>
            <th>Transaction ID</th>
            <th>Driver ID</th>
            <th>Name</th>
            <th>Amount</th>
            <th>Action</th>
            <th>Barangay</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {currentTransactions.map((transaction, index) => (
            <tr key={transaction.transactionId}>
              <td>{startIndex + index + 1}</td>
              <td>{transaction.transactionId}</td>
              <td>{transaction.driverId}</td>
              <td>{transaction.name}</td>
              <td>{transaction.amount}</td>
              <td>{transaction.action}</td>
              <td>{transaction.barangay}</td>
              <td>{formatTimestamp(transaction.timestamp)}</td>
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
              className={`btn btn-square btn-sm ${currentPage === page ? "btn-active" : ""}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button
            className="btn btn-square btn-sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDatabase;
