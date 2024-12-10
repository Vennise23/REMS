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
            case 'available': return 'bg-emerald-500';
            case 'sold': return 'bg-rose-500';
            case 'rented': return 'bg-sky-500';
            case 'cancelled': return 'bg-slate-500';
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
                    className: 'bg-rose-500 hover:bg-rose-600 transition-colors duration-200'
                });
            } else {
                actions.push({
                    label: 'Mark as Rented',
                    status: 'rented',
                    className: 'bg-sky-500 hover:bg-sky-600 transition-colors duration-200'
                });
            }
            actions.push({
                label: 'Cancel Listing',
                status: 'cancelled',
                className: 'bg-slate-500 hover:bg-slate-600 transition-colors duration-200'
            });
        } else if (property.status === 'cancelled') {
            actions.push({
                label: 'Reactivate Listing',
                status: 'available',
                className: 'bg-emerald-500 hover:bg-emerald-600 transition-colors duration-200'
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
            window.location.reload();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete property');
        } finally {
            setLoading(false);
        }
    };

    const BuyerSelectionModal = () => (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    setShowBuyerModal(false);
                }
            }}
        >
            <div className="bg-white p-8 rounded-xl max-w-md w-full relative shadow-xl">
                <button
                    onClick={() => setShowBuyerModal(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h3 className="text-xl font-semibold mb-6">Select Buyer</h3>
                {potentialBuyers.length > 0 ? (
                    <>
                        <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                            {potentialBuyers.map(buyer => (
                                <div
                                    key={buyer.id}
                                    className={`p-4 border-b last:border-b-0 cursor-pointer transition-colors duration-200
                                        ${selectedBuyerId === buyer.id ? 'bg-blue-50 border-blue-100' : 'hover:bg-gray-50'}`}
                                    onClick={() => setSelectedBuyerId(buyer.id)}
                                >
                                    <div className="font-medium text-gray-900">{buyer.firstname} {buyer.lastname}</div>
                                    <div className="text-sm text-gray-500 mt-1">{buyer.email}</div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => setShowBuyerModal(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleStatusChange(property.purchase === 'For Sale' ? 'sold' : 'rented')}
                                disabled={!selectedBuyerId}
                                className={`px-6 py-2 bg-blue-500 text-white rounded-lg shadow-sm hover:bg-blue-600 
                                    transition-all duration-200 ${!selectedBuyerId ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
                            >
                                Confirm
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-600">No potential buyers found.</p>
                        <p className="text-sm text-gray-400 mt-2">
                            Only users who have contacted you about this property will appear here.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="mt-6">
            <div className="flex items-center mb-4">
                <span className="mr-2 text-gray-600">Status:</span>
                <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getStatusColor(property.status)}`}>
                    {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                </span>
            </div>

            <div className="flex flex-wrap gap-3">
                {getAvailableActions().map((action) => (
                    <button
                        key={action.status}
                        onClick={() => handleStatusChange(action.status)}
                        disabled={loading}
                        className={`px-4 py-2 rounded-lg shadow-sm text-white text-sm font-medium 
                            ${action.className} ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
                    >
                        {action.label}
                    </button>
                ))}

                <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-4 py-2 rounded-lg shadow-sm text-white text-sm font-medium 
                        bg-red-600 hover:bg-red-700 transition-colors duration-200 hover:shadow-md"
                >
                    Delete Property
                </button>
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                </div>
            )}

            {showBuyerModal && <BuyerSelectionModal />}
        </div>
    );
};

export default PropertyStatusManager; 