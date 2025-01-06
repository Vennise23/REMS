import React, { useState } from 'react';

const FilterSection = ({ filters, setFilters, onCitySearch, theme = 'blue', showSaleType = false, layout }) => {
    const [expandedSection, setExpandedSection] = useState(null);
    const [amenityFilters, setAmenityFilters] = useState({
        pool: false,
        gym: false,
        sauna: false,
        meetingRoom: false,
        gamesRoom: false,
        tennisCourt: false,
        guestSuite: false,
        carWash: false,
        commonBuilding: false
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [citySearchQuery, setCitySearchQuery] = useState('');

    const amenitiesList = [
        'Pool',
        'Gym',
        'Sauna / Spa',
        'Meeting Room',
        'Games Room',
        'Tennis Court(s)',
        'Guest Suite',
        'Car Wash',
        'Common Building / Garage'
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const newFilters = {
            ...filters,
            [name]: value
        };
        setFilters(newFilters);
    };

    const handleAmenityChange = (amenity) => {
        // 当复选框被点击时，更新选中的设施列表
        const newAmenities = filters.amenities.includes(amenity)
            ? filters.amenities.filter(a => a !== amenity)
            : [...filters.amenities, amenity];
        
        console.log('Selected amenities:', newAmenities);
        
        // 调用父组件的 setFilters 更新筛选条件
        setFilters({
            ...filters,
            amenities: newAmenities
        });
    };

    const handleCitySearch = (e) => {
        const { value } = e.target;
        setSearchQuery(value);
        // 这里可以添加城市搜索的处理逻辑
    };

    const handleCitySearchChange = (e) => {
        const value = e.target.value;
        console.log("filtersection: ", value)
        setCitySearchQuery(value);
        onCitySearch(value); // 确保这个函数被调用
    };

    // 定义主题样式
    const themeStyles = {
        blue: {
            focus: 'focus:border-blue-500 focus:ring-blue-500',
            checkbox: 'text-blue-600 focus:ring-blue-500',
            button: 'bg-blue-600 hover:bg-blue-700',
            hover: 'hover:border-blue-500',
        },
        green: {
            focus: 'focus:border-green-500 focus:ring-green-500',
            checkbox: 'text-green-600 focus:ring-green-500',
            button: 'bg-green-600 hover:bg-green-700',
            hover: 'hover:border-green-500',
        }
    };

    const currentTheme = themeStyles[theme] || themeStyles.blue;

    return (
        <div className="space-y-6">
            {/* 主要筛选区域 */}
            <div className={`grid grid-cols-1 ${layout === 'rent' ? 'md:grid-cols-4' : 'md:grid-cols-5'} gap-6`}>
                {/* 添加时间排序选择器 */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Sort By Date</label>
                    <select
                        name="sortDirection"
                        value={filters.sortDirection || 'desc'}
                        onChange={handleInputChange}
                        className={`w-full rounded-lg border-gray-300 shadow-sm ${currentTheme.focus}`}
                    >
                        <option value="desc">Newest First</option>
                        <option value="asc">Oldest First</option>
                    </select>
                </div>

                {/* Property Type */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Property Type</label>
                    <select
                        name="propertyType"
                        value={filters.propertyType}
                        onChange={handleInputChange}
                        className={`w-full rounded-lg border-gray-300 shadow-sm ${currentTheme.focus}`}
                    >
                        <option value="All Property">All Property</option>
                        <option value="Conventional Condominium">Conventional Condominium</option>
                        <option value="Bare Land Condominium">Bare Land Condominium</option>
                        <option value="Commercial">Commercial</option>
                    </select>
                </div>

                {/* Sale Type - 只在 Buy 页面显示 */}
                {showSaleType && (
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Sale Type</label>
                        <select
                            name="saleType"
                            value={filters.saleType}
                            onChange={handleInputChange}
                            className={`w-full rounded-lg border-gray-300 shadow-sm ${currentTheme.focus}`}
                        >
                            <option value="All">All Types</option>
                            <option value="Subsale">Subsale</option>
                            <option value="New Launch">New Launch</option>
                        </select>
                    </div>
                )}

                {/* Price Range */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Price Range (RM)</label>
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="number"
                            name="priceMin"
                            value={filters.priceMin}
                            onChange={handleInputChange}
                            placeholder="Min"
                            className={`w-full rounded-lg border-gray-300 shadow-sm ${currentTheme.focus}`}
                        />
                        <input
                            type="number"
                            name="priceMax"
                            value={filters.priceMax}
                            onChange={handleInputChange}
                            placeholder="Max"
                            className={`w-full rounded-lg border-gray-300 shadow-sm ${currentTheme.focus}`}
                        />
                    </div>
                </div>

                {/* Size */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Size (sq ft)</label>
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="number"
                            name="sizeMin"
                            value={filters.sizeMin}
                            onChange={handleInputChange}
                            placeholder="Min"
                            className={`w-full rounded-lg border-gray-300 shadow-sm ${currentTheme.focus}`}
                        />
                        <input
                            type="number"
                            name="sizeMax"
                            value={filters.sizeMax}
                            onChange={handleInputChange}
                            placeholder="Max"
                            className={`w-full rounded-lg border-gray-300 shadow-sm ${currentTheme.focus}`}
                        />
                    </div>
                </div>

                {/* City Search */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">City Search</label>
                    <input
                        type="text"
                        value={citySearchQuery}
                        onChange={handleCitySearchChange}
                        className={`w-full rounded-lg border-gray-300 shadow-sm ${currentTheme.focus}`}
                        placeholder="Enter a city name..."
                    />
                </div>
            </div>

            {/* Amenities */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {amenitiesList.map((amenity) => (
                        <div key={amenity} className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id={amenity}
                                checked={filters.amenities.includes(amenity)}
                                onChange={() => handleAmenityChange(amenity)}
                                className={`rounded border-gray-300 ${currentTheme.checkbox}`}
                            />
                            <label htmlFor={amenity} className="text-sm text-gray-600">{amenity}</label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FilterSection; 