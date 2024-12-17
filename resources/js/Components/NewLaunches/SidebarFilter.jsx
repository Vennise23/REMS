import React from 'react';

const SidebarFilter = ({ filters, setFilters }) => {
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        console.log('Input changed:', { name, value });
        
        if (name === 'propertyType' || name === 'saleType' || name === 'purchase') {
            setFilters(prev => ({
                ...prev,
                [name]: value
            }));
        } else {
            setFilters(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleAmenityChange = (amenity) => {
        console.log('Amenity changed:', amenity);
        setFilters(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-6">Filter Properties</h2>
            
            {/* Purchase Type */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purchase Type
                </label>
                <select
                    name="purchase"
                    value={filters.purchase}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                    <option value="All Properties">All Properties</option>
                    <option value="For Sale">For Sale</option>
                    <option value="For Rent">For Rent</option>
                </select>
            </div>

            {/* Sort By Date */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By Date
                </label>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => handleInputChange({ target: { name: 'sortDirection', value: 'desc' }})}
                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors
                            ${filters.sortDirection !== 'asc' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        Newest First
                    </button>
                    <button
                        type="button"
                        onClick={() => handleInputChange({ target: { name: 'sortDirection', value: 'asc' }})}
                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors
                            ${filters.sortDirection === 'asc' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        Oldest First
                    </button>
                </div>
            </div>

            {/* Property Type */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type
                </label>
                <select
                    name="propertyType"
                    value={filters.propertyType || 'All Property'}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                    <option value="All Property">All Property</option>
                    <option value="Conventional Condominium">Conventional Condominium</option>
                    <option value="Bare Land Condominium">Bare Land Condominium</option>
                    <option value="Commercial">Commercial</option>
                </select>
            </div>

            {/* Sale Type */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sale Type
                </label>
                <select
                    name="saleType"
                    value={filters.saleType || 'All Types'}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                    <option value="All Types">All Types</option>
                    <option value="Subsale">Subsale</option>
                    <option value="New Launch">New Launch</option>
                </select>
            </div>

            {/* Price Range */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range (RM)
                </label>
                <div className="grid grid-cols-2 gap-2">
                    <input
                        type="number"
                        name="priceMin"
                        value={filters.priceMin}
                        onChange={handleInputChange}
                        placeholder="Min"
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <input
                        type="number"
                        name="priceMax"
                        value={filters.priceMax}
                        onChange={handleInputChange}
                        placeholder="Max"
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Size */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size (sq ft)
                </label>
                <div className="grid grid-cols-2 gap-2">
                    <input
                        type="number"
                        name="sizeMin"
                        value={filters.sizeMin}
                        onChange={handleInputChange}
                        placeholder="Min"
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <input
                        type="number"
                        name="sizeMax"
                        value={filters.sizeMax}
                        onChange={handleInputChange}
                        placeholder="Max"
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* City Search */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    City Search
                </label>
                <input
                    type="text"
                    name="citySearch"
                    value={filters.citySearch}
                    onChange={handleInputChange}
                    placeholder="Enter a city name..."
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
            </div>

            {/* Amenities */}
            <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Amenities</h3>
                <div className="space-y-2">
                    {[
                        'Pool',
                        'Gym',
                        'Sauna / Spa',
                        'Meeting Room',
                        'Games Room',
                        'Tennis Court(s)',
                        'Guest Suite',
                        'Car Wash',
                        'Common Building / Garage'
                    ].map((amenity) => (
                        <label key={amenity} className="flex items-center">
                            <input
                                type="checkbox"
                                checked={filters.amenities.includes(amenity)}
                                onChange={() => handleAmenityChange(amenity)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-600">{amenity}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Status Filter */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                </label>
                <select
                    name="status"
                    value={filters.status || 'all'}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                    <option value="all">All Status</option>
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                    <option value="rented">Rented</option>
                </select>
            </div>
        </div>
    );
};

export default SidebarFilter; 