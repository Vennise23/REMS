import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PropertyStatusManager = ({ property, onStatusUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showBuyerModal, setShowBuyerModal] = useState(false);
    const [potentialBuyers, setPotentialBuyers] = useState([]);
    const [selectedBuyerId, setSelectedBuyerId] = useState(null);

    useEffect(() => {
        if (showBuyerModal) {
            const fetchPotentialBuyers = async () => {
                try {
                    const response = await axios.get(`/api/properties/${property.id}/potential-buyers`);
                    setPotentialBuyers(response.data);
                } catch (err) {
                    console.error('Error fetching potential buyers:', err);
                }
            };
            fetchPotentialBuyers();
        }
    }, [showBuyerModal]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'available': return 'bg-green-500';
            case 'sold': return 'bg-red-500';
            case 'rented': return 'bg-blue-500';
            case 'cancelled': return 'bg-gray-500';
            default: return 'bg-gray-300';
        }
    };

    const handleStatusChange = async (newStatus) => {
        if ((newStatus === 'sold' || newStatus === 'rented') && !selectedBuyerId) {
            setShowBuyerModal(true);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const requestData = {
                status: newStatus,
                ...(newStatus === 'sold' || newStatus === 'rented' ? { buyer_id: selectedBuyerId } : {})
            };

            const response = await axios.put(`/api/properties/${property.id}/status`, requestData);

            if (onStatusUpdate) {
                onStatusUpdate(response.data.property);
            }
            setShowBuyerModal(false);
            setSelectedBuyerId(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update status');
        } finally {
            setLoading(false);
        }
    };

    const getAvailableActions = () => {
        const actions = [];
        
        if (property.status === 'available') {
            if (property.purchase === 'For Sale') {
                actions.push({
                    label: 'Mark as Sold',
                    status: 'sold',
                    className: 'bg-red-500 hover:bg-red-600'
                });
            } else {
                actions.push({
                    label: 'Mark as Rented',
                    status: 'rented',
                    className: 'bg-blue-500 hover:bg-blue-600'
                });
            }
            actions.push({
                label: 'Cancel Listing',
                status: 'cancelled',
                className: 'bg-gray-500 hover:bg-gray-600'
            });
        } else if (property.status === 'cancelled') {
            actions.push({
                label: 'Reactivate Listing',
                status: 'available',
                className: 'bg-green-500 hover:bg-green-600'
            });
        }

        return actions;
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
            return;
        }

        try {
            setLoading(true);
            await axios.delete(`/api/properties/${property.id}`);
            // 刷新页面或更新列表
            window.location.reload();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete property');
        } finally {
            setLoading(false);
        }
    };

    const BuyerSelectionModal = () => (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    setShowBuyerModal(false);
                }
            }}
        >
            <div className="bg-white p-6 rounded-lg max-w-md w-full relative">
                <button
                    onClick={() => setShowBuyerModal(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>

                <h3 className="text-lg font-semibold mb-4">Select Buyer</h3>
                {potentialBuyers.length > 0 ? (
                    <>
                        <div className="max-h-60 overflow-y-auto">
                            {potentialBuyers.map(buyer => (
                                <div
                                    key={buyer.id}
                                    className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                                        selectedBuyerId === buyer.id ? 'bg-blue-50' : ''
                                    }`}
                                    onClick={() => setSelectedBuyerId(buyer.id)}
                                >
                                    <div className="font-medium">{buyer.firstname} {buyer.lastname}</div>
                                    <div className="text-sm text-gray-500">{buyer.email}</div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex justify-end space-x-3">
                            <button
                                onClick={() => setShowBuyerModal(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleStatusChange(property.purchase === 'For Sale' ? 'sold' : 'rented')}
                                disabled={!selectedBuyerId}
                                className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${
                                    !selectedBuyerId ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                Confirm
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-4">
                        <p className="text-gray-500">No potential buyers found.</p>
                        <p className="text-sm text-gray-400 mt-2">
                            Only users who have contacted you about this property will appear here.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="mt-4">
            <div className="flex items-center mb-2">
                <span className="mr-2">Status:</span>
                <span className={`px-2 py-1 rounded text-white text-sm ${getStatusColor(property.status)}`}>
                    {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                </span>
            </div>

            <div className="flex flex-wrap gap-2">
                {getAvailableActions().map((action) => (
                    <button
                        key={action.status}
                        onClick={() => handleStatusChange(action.status)}
                        disabled={loading}
                        className={`px-4 py-2 rounded text-white text-sm ${action.className} ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {action.label}
                    </button>
                ))}

                <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-4 py-2 rounded text-white text-sm bg-red-600 hover:bg-red-700"
                >
                    Delete Property
                </button>
            </div>

            {error && (
                <div className="text-red-500 text-sm mb-2">
                    {error}
                </div>
            )}

            {showBuyerModal && <BuyerSelectionModal />}
        </div>
    );
};

export default PropertyStatusManager; 