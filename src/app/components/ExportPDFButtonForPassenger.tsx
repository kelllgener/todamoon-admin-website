// components/ExportToPDFButton.tsx
import React, { useState } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/app/firebase/config";

interface ExportToPDFButtonProps {
  collectionName: string;
  fileName?: string;
  queryCondition?: { fieldPath: string; opStr: FirebaseFirestore.WhereFilterOp; value: any }; // Optional condition
}

const ExportToPDFButtonForPassenger: React.FC<ExportToPDFButtonProps> = ({
  collectionName,
  fileName = "exported-data",
  queryCondition,
}) => {
  const [loading, setLoading] = useState(false);

  const handleExportToPDF = async () => {
    setLoading(true);

    try {
      // Construct the collection reference
      let collectionRef = collection(db, collectionName);

      // If a condition is provided, apply it to the query
      let collectionQuery;
      if (queryCondition) {
        const { fieldPath, opStr, value } = queryCondition;
        collectionQuery = query(collectionRef, where(fieldPath, opStr, value));
      } else {
        collectionQuery = collectionRef;
      }

      const querySnapshot = await getDocs(collectionQuery);
      const data = querySnapshot.docs.map((doc) => doc.data());

      // Check if data is empty
      if (data.length === 0) {
        console.warn("No data found for the query.");
        alert("No data available to export.");
        setLoading(false);
        return;
      }

      // Define the column headers in the desired order
      const tableColumn = ["uid", "name", "email", "role"];
      
      // Map data to rows, ensuring consistent column order and filling missing values with empty strings
      const tableRows = data.map((item) => {
        const itemData = item as Record<string, any>;
        return tableColumn.map((column) => itemData[column] || "");
      });

      const currentDate = new Date().toISOString().split("T")[0];
      const pdf = new jsPDF("landscape");
      pdf.text(`Passengers as of ${currentDate}`, 14, 16);

      // Add table to PDF with no-wrap and even column spacing
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
      alert("An error occurred while exporting to PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleExportToPDF} disabled={loading} className="export-btn btn btn-error btn-sm mx-1">
      {loading ? "Exporting..." : "PDF"}
    </button>
  );
};

export default ExportToPDFButtonForPassenger;
