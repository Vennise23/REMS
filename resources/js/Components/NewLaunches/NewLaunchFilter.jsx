import React from 'react';

export default function NewLaunchFilter({ filters, onFilterChange }) {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 backdrop-blur-sm bg-white/90 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-full mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Filter Properties</h2>
                    <p className="text-sm text-gray-500">Sort and filter the latest property launches</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sold type
                    </label>
                    <select
                        value={filters.purchase}
                        onChange={(e) => onFilterChange({ purchase: e.target.value })}
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-blue-400"
                    >
                        <option value="all">All Properties</option>
                        <option value="For Sale">For Sale</option>
                        <option value="For Rent">For Rent</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date Added
                    </label>
                    <select
                        value={filters.sortDirection}
                        onChange={(e) => onFilterChange({ sortDirection: e.target.value })}
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="desc">Newest First</option>
                        <option value="asc">Oldest First</option>
                    </select>
                </div>
            </div>
        </div>
    );
} 