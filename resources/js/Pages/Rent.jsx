import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import PropertyCard from '@/Components/PropertyCard';
import FilterSection from '@/Components/FilterSection';
import Header from '@/Components/HeaderMenu';

const Rent = ({ auth }) => {
    const [properties, setProperties] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const propertiesPerPage = 6;
    const [filters, setFilters] = useState(() => {
        const savedFilters = localStorage.getItem('propertyRentFilters');
        return savedFilters ? JSON.parse(savedFilters) : {
            propertyType: 'All Property',
            priceMin: '0',
            priceMax: '1000000000',
            sizeMin: '0',
            sizeMax: '100000',
            amenities: [],
        };
    });
    const [propertyPhotos, setPropertyPhotos] = useState({});
    const [citySearchQuery, setCitySearchQuery] = useState('');

    useEffect(() => {
        fetchProperties();
    }, [filters, citySearchQuery, currentPage]);

    // 获取属性照片
    const fetchPropertyPhotos = async (propertyId) => {
        try {
            const response = await fetch(`/api/property/${propertyId}/photos`);
            const photos = await response.json();
            setPropertyPhotos(prev => ({
                ...prev,
                [propertyId]: photos
            }));
        } catch (error) {
            console.error('Error fetching property photos:', error);
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        localStorage.setItem('propertyRentFilters', JSON.stringify(newFilters));
    };

    const fetchProperties = async () => {
        try {
            // 创建基础查询参数
            const baseParams = {
                page: currentPage,
                per_page: propertiesPerPage,
                priceMin: filters.priceMin,
                priceMax: filters.priceMax,
                sizeMin: filters.sizeMin,
                sizeMax: filters.sizeMax,
                amenities: filters.amenities.join(','),
                citySearch: citySearchQuery,
                purchase: 'For Rent'
            };

            // 只有当不是 'All Property' 时才添加 propertyType 参数
            if (filters.propertyType !== 'All Property') {
                baseParams.propertyType = filters.propertyType;
            }

            const queryParams = new URLSearchParams(baseParams);

            console.log('Fetching with params:', Object.fromEntries(queryParams)); // 调试用

            const response = await fetch(`/api/properties?${queryParams}`);
            const data = await response.json();

            if (data.data) {
                setProperties(data.data);
                setTotalPages(Math.ceil(data.total / propertiesPerPage));
                
                data.data.forEach(property => {
                    fetchPropertyPhotos(property.id);
                });
            }
        } catch (error) {
            console.error('Error fetching properties:', error);
        }
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const renderPaginationButtons = () => {
        const buttons = [];
        for (let i = 1; i <= totalPages; i++) {
            buttons.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-4 py-2 mx-1 rounded ${
                        currentPage === i
                            ? 'bg-green-600 text-white' // 改为绿色主题
                            : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                >
                    {i}
                </button>
            );
        }
        return buttons;
    };

    const handleCitySearch = (value) => {
        setCitySearchQuery(value);
        setCurrentPage(1);
    };

    const defaultAuth = {
        user: null,
        ...auth
    };

    return (
        <>
            <Head>
                <title>Rent Properties - StarProperty Clone</title>
                <meta name="description" content="Find your perfect rental property" />
            </Head>

            <Header auth={defaultAuth} />

            <div className="min-h-screen bg-gray-50 pt-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* 搜索和筛选区域 */}
                    <div className="bg-white shadow-lg rounded-xl p-6 mb-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Find Your Perfect Rental</h2>
                        <FilterSection 
                            filters={filters} 
                            setFilters={handleFilterChange}
                            onCitySearch={handleCitySearch}
                            theme="green" // 添加主题属性
                        />
                    </div>

                    {/* 属性列表 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {properties.map((property) => (
                            <PropertyCard 
                                key={property.id} 
                                property={property} 
                                photos={propertyPhotos[property.id] || []}
                                theme="green" // 添加主题属性
                            />
                        ))}
                    </div>

                    {/* 分页控件 */}
                    <div className="flex justify-center mt-12 mb-8 space-x-2">
                        {currentPage > 1 && (
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                className="px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 shadow-sm transition duration-150 ease-in-out"
                            >
                                Previous
                            </button>
                        )}
                        <div className="flex space-x-2">
                            {renderPaginationButtons()}
                        </div>
                        {currentPage < totalPages && (
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                className="px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 shadow-sm transition duration-150 ease-in-out"
                            >
                                Next
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Rent;