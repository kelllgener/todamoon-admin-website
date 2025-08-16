// components/ExportToPDFButton.tsx
import React, { useState } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { collection, getDocs, query, orderBy } from "firebase/firestore";  // Import orderBy
import { db } from "@/app/firebase/config";
import { Timestamp } from "firebase/firestore";  // Import Timestamp from Firestore

interface ExportToPDFButtonProps {
  collectionName: string;
  fileName?: string; // Optional, to allow custom file names
}

const ExportToPDFButtonForWebsiteUser: React.FC<ExportToPDFButtonProps> = ({ collectionName, fileName = "exported-data" }) => {
  const [loading, setLoading] = useState(false);

  const handleExportToPDF = async () => {
    setLoading(true);

    try {
      // Construct the query to order by 'timestamp' field
      const collectionRef = collection(db, collectionName);
      const collectionQuery = query(collectionRef, orderBy("createdAt", "desc")); // Use 'desc' for descending order

      // Fetch data from the Firestore collection with ordering
      const querySnapshot = await getDocs(collectionQuery);
      const data = querySnapshot.docs.map((doc) => doc.data());

      // Define the column headers
      const tableColumn = [
        "uid",
        "email",
        "role",
        "createdAt",
      ];

      // Map data to rows, ensuring consistent column order and filling missing values with empty strings
      const tableRows = data.map((item) => {
        const itemData = item as Record<string, any>;

        return [
          itemData.uid || "",
          itemData.email || "",
          itemData.role || "",
          itemData.createdAt || "", // Raw timestamp (no formatting applied)
        ];
      });

      const currentDate = new Date().toISOString().split("T")[0];
      const pdf = new jsPDF("landscape");
      pdf.text(`Website Users as of ${currentDate}`, 14, 16);

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
    <button onClick={handleExportToPDF} disabled={loading} className="export-btn btn btn-error btn-sm mr-1">
      {loading ? "Exporting..." : "PDF"}
    </button>
  );
};

export default ExportToPDFButtonForWebsiteUser;
