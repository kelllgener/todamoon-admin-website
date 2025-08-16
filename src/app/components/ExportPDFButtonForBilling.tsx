// components/ExportToPDFButtonForQueueing.tsx
import React, { useState } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { collectionGroup, getDocs, query, orderBy } from "firebase/firestore"; // Use collectionGroup for subcollections
import { db } from "@/app/firebase/config";
import { Timestamp } from "firebase/firestore";

interface ExportToPDFButtonProps {
  fileName?: string; // Optional file name for the PDF
}

const ExportToPDFButtonForQueueing: React.FC<ExportToPDFButtonProps> = ({
  fileName = "queueing-transactions",
}) => {
  const [loading, setLoading] = useState(false);

  // Function to format Firestore timestamps into readable dates
  const formatTimestamp = (timestamp: any) => {
    if (timestamp instanceof Timestamp) {
      timestamp = timestamp.toDate();
    }
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const handleExportToPDF = async () => {
    setLoading(true);

    try {
      // Use collectionGroup to fetch all "queueing-transactions" subcollections
      const transactionsQuery = query(
        collectionGroup(db, "queueing-transactions"), // Searches all subcollections named "queueing-transactions"
        orderBy("timestamp", "desc") // Orders transactions by timestamp
      );
      const querySnapshot = await getDocs(transactionsQuery);

      // Map the data into a usable format
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id, // Include the Firestore document ID
        ...doc.data(),
      }));

      // Define the table headers
      const tableColumn = ["ID", "Amount", "Description", "Timestamp"];

      // Define the table rows by extracting relevant fields
      const tableRows = data.map((item) => {
        const itemData = item as Record<string, any>;

        // Format timestamp if available
        const formattedTimestamp = itemData.timestamp
          ? formatTimestamp(itemData.timestamp)
          : "N/A";

        return [
          itemData.id || "",
          itemData.amount || 0,
          itemData.description || "",
          formattedTimestamp,
        ];
      });

      // Initialize jsPDF
      const currentDate = new Date().toISOString().split("T")[0]; // Current date in YYYY-MM-DD
      const pdf = new jsPDF("landscape"); // Landscape orientation
      pdf.text(`Queueing Transactions as of ${currentDate}`, 14, 16);

      // Add table with data
      pdf.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        margin: { horizontal: 10 },
        styles: {
          cellPadding: 1,
          fontSize: 10,
          halign: "center",
          valign: "middle",
          overflow: "linebreak",
        },
        theme: "grid", // Add grid lines to the table
      });

      // Save the PDF with a dynamic filename
      pdf.save(`${fileName}_${currentDate}.pdf`);
    } catch (error) {
      console.error("Error exporting to PDF:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExportToPDF}
      disabled={loading}
      className="export-btn btn btn-error btn-sm mx-1"
    >
      {loading ? "Exporting..." : "Export to PDF"}
    </button>
  );
};

export default ExportToPDFButtonForQueueing;
