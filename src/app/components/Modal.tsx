import React from "react";

interface ModalProps {
  imageUrl: string;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ imageUrl, onClose }) => {
  // Handler to close the modal
  const handleOverlayClick = (event: React.MouseEvent) => {
    // Check if the click event is on the overlay
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
        className="bg-white p-4 rounded shadow-lg relative"
        // Prevent clicks inside the modal content from closing the modal
        onClick={(event) => event.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
        >
          &times;
        </button>
        <img
          src={imageUrl}
          alt="Large view"
          className="max-w-full max-h-screen object-contain"
        />
      </div>
    </div>
  );
};

export default Modal;
