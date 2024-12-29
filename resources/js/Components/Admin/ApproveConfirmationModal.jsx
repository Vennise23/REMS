import React from "react";

export default function ApproveConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-96 text-center">
                <h2 className="text-lg font-semibold mb-4">
                    Confirm Approval
                </h2>
                <p className="mb-4">
                    Are you sure you want to approve this property?
                </p>
                <div className="flex justify-center gap-4">
                    <button
                        className="px-4 py-2 bg-gray-300 rounded"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-green-600 text-white rounded"
                        onClick={onConfirm}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}
