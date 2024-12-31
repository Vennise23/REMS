import React from "react";

const ShowDeleteConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    message = "Are you sure you want to delete this item?",
}) => {
    if (!isOpen) return null;

    const handleClose = () => {
        onClose();
    };

    const handleConfirm = () => {
        onConfirm();
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-96 p-6">
                <h2 className="text-lg font-semibold text-gray-800 text-center mb-4">
                    Confirmation
                </h2>
                <p className="text-gray-600 text-center">{message}</p>
                <div className="flex justify-center mt-6">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg mr-4 hover:bg-gray-400 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShowDeleteConfirmationModal;
