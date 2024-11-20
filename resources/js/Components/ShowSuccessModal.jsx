import React, { useEffect } from 'react';

const ShowSuccessModal = ({ isOpen, message, onClose }) => {
    useEffect(() => {
        console.log("ShowSuccessModal isOpen:", isOpen);
    }, [isOpen]);

if (!isOpen) return null;

    const handleModalClose = () => {
        onClose();
        window.location.reload();
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-60">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
                <h3 className="text-lg font-semibold mb-4">Success!</h3>
                <p className="text-gray-700">{message || "Your action was successful."}</p>
                <button
                    onClick={handleModalClose}
                    className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
                >
                    OK
                </button>
            </div>
        </div>
    );
};

export default ShowSuccessModal;