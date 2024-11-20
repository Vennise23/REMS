import React from 'react';

const FilterSection = ({ filters, setFilters }) => {
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const newFilters = {
            ...filters,
            [name]: value
        };
        setFilters(newFilters);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Property Type</label>
                <select
                    name="propertyType"
                    value={filters.propertyType}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                    <option value="All Property">All Property</option>
                    <option value="Conventional Condominium">Conventional Condominium</option>
                    <option value="Bare Land Condominium">Bare Land Condominium</option>
                    <option value="Commercial">Commercial</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Price Range (RM)</label>
                <div className="grid grid-cols-2 gap-2">
                    <input
                        type="number"
                        name="priceMin"
                        value={filters.priceMin}
                        onChange={handleInputChange}
                        placeholder="Min"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <input
                        type="number"
                        name="priceMax"
                        value={filters.priceMax}
                        onChange={handleInputChange}
                        placeholder="Max"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Size (sq ft)</label>
                <div className="grid grid-cols-2 gap-2">
                    <input
                        type="number"
                        name="sizeMin"
                        value={filters.sizeMin}
                        onChange={handleInputChange}
                        placeholder="Min"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <input
                        type="number"
                        name="sizeMax"
                        value={filters.sizeMax}
                        onChange={handleInputChange}
                        placeholder="Max"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
            </div>
        </div>
    );
};

export default FilterSection; 