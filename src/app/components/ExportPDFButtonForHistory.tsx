// components/ExportToPDFButtonForQueueing.tsx
import React, { useState } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { Timestamp } from "firebase/firestore";
import ActionButtons from "./ActionButtons";
import { ArchiveBoxIcon } from "@heroicons/react/24/outline";

interface ExportToPDFButtonProps {
  userID: string; // The specific user document ID
  userName: string;
  fileName?: string; // Optional file name for the PDF
}

const ExportToPDFButtonForQueueing: React.FC<ExportToPDFButtonProps> = ({
  userID,
  userName,
  fileName = `${userName}_Queueing_transactions`,
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
      // Fetch queueing-transactions
      const queueingTransactionsRef = collection(
        db,
        `users/${userID}/queueing-transactions`
      );
      const queueingTransactionsQuery = query(
        queueingTransactionsRef,
        orderBy("timestamp", "desc") // Order by timestamp
      );
      const queueingSnapshot = await getDocs(queueingTransactionsQuery);
  
      // Fetch billing-transactions
      const billingTransactionsRef = collection(
        db,
        `users/${userID}/billing-transactions`
      );
      const billingTransactionsQuery = query(
        billingTransactionsRef,
        orderBy("timestamp", "desc") // Order by timestamp
      );
      const billingSnapshot = await getDocs(billingTransactionsQuery);
  
      // Initialize counters and sum for queueing-transactions
      let leftQueueCount = 0;
      let entryQueueCount = 0;
      let totalQueueingFee = 0;
  
      const queueingData = queueingSnapshot.docs.map((doc) => {
        const item = doc.data();
        const description = item.description || "";
        const amount = item.amount || 0;
  
        // Increment counters based on the description
        if (description === "Left Queue") {
          leftQueueCount++;
        } else if (description === "Queue Entry") {
          entryQueueCount++;
        }
  
        // Sum up the total queueing fee
        totalQueueingFee += amount;
  
        return {
          id: doc.id,
          amount,
          description,
          timestamp: item.timestamp,
        };
      });
  
      // Sum up the total billing amounts
      let totalBillingAmount = 0;
      const billingData = billingSnapshot.docs.map((doc) => {
        const item = doc.data();
        totalBillingAmount += item.amount || 0; // Sum amounts
        return {
          id: doc.id,
          amount: item.amount || 0,
          description: item.description || "",
          timestamp: item.timestamp,
        };
      });
  
      // Combine queueing and billing data for the table
      const allData = [...queueingData, ...billingData];
  
      // Define the table headers
      const tableColumn = ["id", "amount", "description", "timestamp"];
  
      // Define the table rows by extracting relevant fields
      const tableRows = allData.map((item) => {
        const formattedTimestamp = item.timestamp
          ? formatTimestamp(item.timestamp)
          : "N/A";
  
        return [
          item.id || "",
          item.amount || 0,
          item.description || "",
          formattedTimestamp,
        ];
      });
  
      // Initialize jsPDF
      const currentDate = new Date().toISOString().split("T")[0]; // Current date in YYYY-MM-DD
      const pdf = new jsPDF("portrait");
      pdf.setFontSize(10);
      pdf.text(`Queueing Transactions for User: ${userName}`, 14, 16);
  
      // Add summary information (e.g., total entry, exit, total fee, and total billing amount)
      pdf.setFontSize(10);
      pdf.text(
        `Summary:        Entries: ${entryQueueCount},      Exits: ${leftQueueCount},       Total Fee: ${totalQueueingFee.toFixed(
          2
        )}pesos,        Total Billing: ${totalBillingAmount.toFixed(2)}pesos`,
        14,
        24
      );
  
      // Add table with data
      pdf.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 30, // Start below the summary text
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
    <ActionButtons
    uid={userID}
    className="btn-secondary"
    Icon={ArchiveBoxIcon}
    color="text-gray-700"
    title="export the transaction history to PDF"
    onClick={handleExportToPDF}
    />
    
  );
};

export default ExportToPDFButtonForQueueing;
