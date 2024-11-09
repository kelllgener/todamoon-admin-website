import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Loading from "./Loading";
import ActionButtons from "./ActionButtons";
import { TrashIcon } from "@heroicons/react/24/outline";

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
  const [loading, setLoading] = useState(true);
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
        body: JSON.stringify({ transactionId }), // Use transactionId in the body
      });

      const data = await response.json();

      if (response.ok) {
        // Filter out the deleted transaction
        setTransactions(
          transactions.filter(
            (transaction) => transaction.transactionId !== transactionId
          )
        );
        Swal.fire("Deleted!", "The transaction has been deleted.", "success");
      } else {
        Swal.fire("Error!", "Failed to delete the transaction.", "error");
      }
    } catch (error) {
      Swal.fire(
        "Error!",
        "An error occurred while deleting the transaction.",
        "error"
      );
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
        handleDelete(transactionId); // Use transactionId instead of driverId
      }
    });
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <p>{error}</p>;
  }

  // Format timestamp as a readable date
  const formatTimestamp = (timestamp: {
    _seconds: number;
    _nanoseconds: number;
  }) => {
    const date = new Date(timestamp._seconds * 1000);
    return date.toLocaleString();
  };

  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTransactions = transactions.slice(startIndex, endIndex);

  // Calculate page button range
  const startPage = Math.max(1, currentPage - Math.floor(MAX_PAGE_BUTTONS / 2));
  const endPage = Math.min(totalPages, startPage + MAX_PAGE_BUTTONS - 1);
  const pageButtons = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  return (
    <div className="overflow-x-auto">
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
          {/* {currentTransactions.map((transaction, index) => (
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
          ))} */}
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
  );
};

export default TransactionDatabase;