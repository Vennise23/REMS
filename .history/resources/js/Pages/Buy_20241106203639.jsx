import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import PropertyCard from '@/Components/PropertyCard';
import FilterSection from '@/Components/FilterSection';
import Header from '@/Components/HeaderMenu';

const Buy = ({ auth }) => {
    const [properties, setProperties] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const propertiesPerPage = 6;
    const [filters, setFilters] = useState({
        propertyType: 'All Property',
        priceMin: 0,
        priceMax: 1000000,
        sizeMin: 0,
        sizeMax: 100000,
        bedrooms: 0,
    });
    const [propertyPhotos, setPropertyPhotos] = useState({});

    // 在获取到属性列表后，获取每个属性的照片
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

    // 修改 fetch 方法以支持分页
    useEffect(() => {
        fetch(`/api/properties?page=${currentPage}&per_page=${propertiesPerPage}`)
            .then(response => response.json())
            .then(data => {
                setProperties(data.data);
                setTotalPages(Math.ceil(data.total / propertiesPerPage));
                // 获取每个属性的照片
                data.data.forEach(property => {
                    fetchPropertyPhotos(property.id);
                });
            });
    }, [currentPage]); // 当页码改变时重新获取数据

    // 分页按钮处理函数
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // 生成分页按钮
    const renderPaginationButtons = () => {
        const buttons = [];
        for (let i = 1; i <= totalPages; i++) {
            buttons.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-4 py-2 mx-1 rounded ${
                        currentPage === i
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                >
                    {i}
                </button>
            );
        }
        return buttons;
    };

    const defaultAuth = {
        user: null,
        ...auth
    };

    return (
        <>
            <Head>
                <title>Buy Properties - StarProperty Clone</title>
                <meta name="description" content="Find your dream property" />
            </Head>

            <Header auth={defaultAuth} />

            <div className="pt-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
                        <FilterSection filters={filters} setFilters={setFilters} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map((property) => (
                            <PropertyCard 
                                key={property.id} 
                                property={property} 
                                photos={propertyPhotos[property.id] || []}
                            />
                        ))}
                    </div>

                    {/* 分页控件 */}
                    <div className="flex justify-center mt-8 mb-8">
                        {currentPage > 1 && (
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                className="px-4 py-2 mx-1 rounded bg-gray-200 hover:bg-gray-300"
                            >
                                Previous
                            </button>
                        )}
                        {renderPaginationButtons()}
                        {currentPage < totalPages && (
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                className="px-4 py-2 mx-1 rounded bg-gray-200 hover:bg-gray-300"
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

export default Buy;