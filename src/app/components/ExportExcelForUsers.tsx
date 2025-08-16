// components/ExportToExcelButton.tsx
import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { collection, getDocs, query, where, Firestore, QueryConstraint } from "firebase/firestore";
import { db } from "@/app/firebase/config";

interface ExportToExcelButtonProps {
  collectionName: string;
  fileName?: string;
  queryCondition?: { fieldPath: string; opStr: FirebaseFirestore.WhereFilterOp; value: any }; // Optional condition
}

const ExportToExcelButtonForUsers: React.FC<ExportToExcelButtonProps> = ({
  collectionName,
  fileName = "exported-data",
  queryCondition,
}) => {
  const [loading, setLoading] = useState(false);

  const handleExportToExcel = async () => {
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

      // Convert data to a worksheet
      const ws = XLSX.utils.json_to_sheet(data);

      // Create a new workbook and append the worksheet
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, collectionName);

      // Get current date in YYYY-MM-DD format
      const currentDate = new Date().toISOString().split("T")[0];

      // Write the workbook to binary and save it as an Excel file with the date
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
      saveAs(blob, `${fileName}_${currentDate}.xlsx`);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleExportToExcel} disabled={loading} className="export-btn btn btn-success btn-sm">
      {loading ? "Exporting..." : "Excel"}
    </button>
  );
};

export default ExportToExcelButtonForUsers;
