import React, { useEffect } from 'react';


import PrimaryButton from "@/Components/PrimaryButton";
import DangerButton from "@/Components/DangerButton";
import SecondaryButton from "../SecondaryButton";

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
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-60">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
                <h3 className="text-lg font-semibold mb-4">Are you sure?</h3>
                <p className="text-gray-700">{message || "Do you want to submit the form?"}</p>
                <div className="mt-4 flex justify-center gap-4">
                    <DangerButton
                        onClick={handleClose}
                        className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
                    >
                        Back
                    </DangerButton>
                    <SecondaryButton
                        onClick={handleConfirm}
                    >
                        Confirm
                    </SecondaryButton>
                </div>
            </div>
        </div>
    );
};

export default ShowConfirmationModal;
