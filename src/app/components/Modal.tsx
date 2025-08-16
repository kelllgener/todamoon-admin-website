import React, { useRef } from "react";
import Image from "next/image";
import { PrinterIcon } from "@heroicons/react/24/outline";

interface ModalProps {
  imageUrl: string;
  name: string;
  barangay: string;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ imageUrl, name, barangay, onClose }) => {
  // Ref to target the modal content for printing
  const printRef = useRef<HTMLDivElement>(null);

  // Print handler
  const handlePrint = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML;
      const originalContents = document.body.innerHTML;

      // Replace body content with modal content and print
      document.body.innerHTML = printContents;
      window.print();

      // Restore the original content after printing
      document.body.innerHTML = originalContents;
      window.location.reload(); // Reload to ensure the page restores properly
    }
  };

  // Handler to close the modal when clicking the overlay
  const handleOverlayClick = (event: React.MouseEvent) => {
    if ((event.target as HTMLElement).classList.contains("overlay")) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overlay"
      onClick={handleOverlayClick}
    >
      <div
        ref={printRef}
        className="bg-white p-4 rounded shadow-lg relative"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-end items-center mt-4">
          <PrinterIcon
            onClick={handlePrint}
            className="btn btn-sm btn-outline mr-2 text-black rounded hover:btn-primary"
            title="Print QR Code"
          />
          <button
            onClick={onClose}
            className="btn btn-sm btn-outline text-gray-600 rounded hover:bg-gray-300"
            title="Close"
          >
            &times;
          </button>
        </div>

        <h2 className="text-xl font-semibold mb-4 mt-4 text-center">{name}</h2>
        <h2 className="text-xl font-semibold mb-4 mt-4 text-center">{barangay}</h2>
        <Image
          src={imageUrl}
          alt="QR Code"
          layout="responsive"
          objectFit="contain"
          width={800} // Adjust the width as needed
          height={600} // Adjust the height as needed
        />
      </div>
    </div>
  );
};

export default Modal;
