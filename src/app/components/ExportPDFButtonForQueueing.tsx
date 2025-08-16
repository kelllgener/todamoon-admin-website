// components/ExportToPDFButton.tsx
import React, { useState } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { collection, getDocs, query, orderBy } from "firebase/firestore"; // Import orderBy
import { db } from "@/app/firebase/config";
import { Timestamp } from "firebase/firestore"; // Import Timestamp from Firestore

interface ExportToPDFButtonProps {
  collectionName: string;
  fileName?: string; // Optional, to allow custom file names
}

const ExportToPDFButtonForQueueing: React.FC<ExportToPDFButtonProps> = ({
  collectionName,
  fileName = "exported-data",
}) => {
  const [loading, setLoading] = useState(false);

  // Function to format the timestamp to human-readable format
  const formatTimestamp = (timestamp: any) => {
    // Check if the timestamp is a Firestore Timestamp object
    if (timestamp instanceof Timestamp) {
      timestamp = timestamp.toDate(); // Convert Firestore Timestamp to Date
    }
    // Convert to a human-readable format
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true, // Use 12-hour format with AM/PM
    });
  };

  const handleExportToPDF = async () => {
    setLoading(true);

    try {
      // Construct the query to order by 'timestamp' field
      const collectionRef = collection(db, collectionName);
      const collectionQuery = query(
        collectionRef,
        orderBy("timestamp", "desc")
      ); // Use 'desc' for descending order

      // Fetch data from the Firestore collection with ordering
      const querySnapshot = await getDocs(collectionQuery);
      const data = querySnapshot.docs.map((doc) => doc.data());

      // Define the column headers
      const tableColumn = [
        "driverId",
        "name",
        "barangay",
        "action",
        "timestamp",
      ];

      // Map data to rows, ensuring consistent column order and filling missing values with empty strings
      const tableRows = data.map((item) => {
        const itemData = item as Record<string, any>;

        // Format the timestamp field if it exists
        const formattedTimestamp = itemData.timestamp
          ? formatTimestamp(itemData.timestamp)
          : ""; // Handle case when timestamp is missing or invalid

        return [
          itemData.driverId || "",
          itemData.name || "",
          itemData.barangay || "",
          itemData.action || "",
          formattedTimestamp, // Use the formatted timestamp
        ];
      });

      // Initialize jsPDF with landscape orientation
      // Get current date in YYYY-MM-DD format
      const currentDate = new Date().toISOString().split("T")[0];
      const pdf = new jsPDF("landscape");
      pdf.text(`Queueing Records as of ${currentDate}`, 14, 16);

      // Add table to PDF with auto column widths
      pdf.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        margin: { horizontal: 10 },
        styles: {
          cellPadding: 0, // Adds padding to cells for better spacing
          fontSize: 10,
          halign: "center", // Centers the text horizontally
          valign: "middle", // Centers the text vertically
          overflow: "hidden", // Prevents text from wrapping by default
          lineColor: [0, 0, 0], // Adds black border to lines (optional)
        },
        tableWidth: "auto", // Automatically adjusts table width based on content
        theme: "grid", // Adds grid lines around the table
      });

      // Save the PDF file with the specified name and current date
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
      {loading ? "Exporting..." : "PDF"}
    </button>
  );
};

export default ExportToPDFButtonForQueueing;
