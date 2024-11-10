import React from 'react';

const FilterSection = ({ filters, setFilters }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 属性类型选择器 */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Type
                </label>
                <select
                    className="w-full border-gray-300 rounded-md shadow-sm"
                    value={filters.propertyType}
                    onChange={(e) => setFilters({...filters, propertyType: e.target.value})}
                >
                    <option value="All Property">All Property</option>
                    <option value="Conventional Condominium">Conventional Condominium</option>
                    <option value="Bare Land Condominium">Bare Land Condominium</option>
                    <option value="Commercial">Commercial</option>
                </select>
            </div>

            {/* 价格范围 */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price Range (RM)
                </label>
                <div className="flex space-x-2">
                    <input
                        type="number"
                        className="w-1/2 border-gray-300 rounded-md shadow-sm"
                        placeholder="Min"
                        value={filters.priceMin}
                        onChange={(e) => setFilters({...filters, priceMin: e.target.value})}
                    />
                    <input
                        type="number"
                        className="w-1/2 border-gray-300 rounded-md shadow-sm"
                        placeholder="Max"
                        value={filters.priceMax}
                        onChange={(e) => setFilters({...filters, priceMax: e.target.value})}
                    />
                </div>
            </div>

            {/* 面积范围 */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Size (sq ft)
                </label>
                <div className="flex space-x-2">
                    <input
                        type="number"
                        className="w-1/2 border-gray-300 rounded-md shadow-sm"
                        placeholder="Min"
                        value={filters.sizeMin}
                        onChange={(e) => setFilters({...filters, sizeMin: e.target.value})}
                    />
                    <input
                        type="number"
                        className="w-1/2 border-gray-300 rounded-md shadow-sm"
                        placeholder="Max"
                        value={filters.sizeMax}
                        onChange={(e) => setFilters({...filters, sizeMax: e.target.value})}
                    />
                </div>
            </div>
        </div>
    );
};

export default FilterSection; 