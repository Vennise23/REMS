import React, { useEffect } from 'react';

const ShowConfirmationModal = ({ isOpen, message, onClose, onConfirm }) => {
    useEffect(() => {
        console.log("ShowConfirmationModal isOpen:", isOpen);
    }, [isOpen]);

    if (!isOpen) return null;

    const handleClose = () => {
        onClose();
    };

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-60">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
                <h3 className="text-lg font-semibold mb-4">Are you sure?</h3>
                <p className="text-gray-700">{message || "Do you want to submit the form?"}</p>
                <div className="mt-4 flex justify-center gap-4">
                    <button
                        onClick={handleClose}
                        className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
                    >
                        Back
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShowConfirmationModal;
