import React from 'react';
import { Link } from '@inertiajs/react';
import { FaMapMarkerAlt, FaExpandArrowsAlt, FaRegClock } from 'react-icons/fa';

export default function NewLaunchGrid({ properties, loading, pagination, onPageChange, filters }) {
    
    if (loading) {
        return <LoadingSkeleton />;
    }

    return (
        <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
                {/* Decorative Divider */}
                <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 -translate-x-1/2">
                    <div className="h-full w-[2px] bg-gradient-to-b from-transparent via-gray-200 to-transparent"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    </div>
                </div>

                {properties.map((property, index) => (
                    <Link
                        key={property.id}
                        href={`/property/${property.id}`}
                        className={`group ${index % 2 === 0 ? 'lg:pr-8' : 'lg:pl-8'}`}
                    >
                        <div className="bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300">
                            <div className="relative h-[220px] overflow-hidden">
                                <img
                                    src={property.property_photos[0] || '/img/placeholder.jpg'}
                                    alt={property.property_name}
                                    className={`
                                        w-full h-full object-cover transform 
                                        group-hover:scale-110 transition-all duration-700
                                        ${property.status !== 'available' ? 'filter brightness-75' : ''}
                                    `}
                                />
                                
                                {/* Status Overlay */}
                                {property.status !== 'available' && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        {/* 添加渐变背景 */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                        
                                        {/* 状态标签 */}
                                        <div className={`
                                            relative px-8 py-3 text-2xl font-bold text-white
                                            border-4 rounded-lg transform rotate-[-30deg]
                                            shadow-xl backdrop-blur-sm
                                            ${property.status === 'sold' ? 'border-red-500 bg-red-500/30' : ''}
                                            ${property.status === 'rented' ? 'border-green-500 bg-green-500/30' : ''}
                                            ${property.status === 'cancelled' ? 'border-gray-500 bg-gray-500/30' : ''}
                                        `}>
                                            <span className="drop-shadow-lg">
                                                {property.status === 'sold' && 'SOLD'}
                                                {property.status === 'rented' && 'RENTED'}
                                                {property.status === 'cancelled' && 'CANCELLED'}
                                            </span>
                                            
                                            {/* 添加小标签显示日期 */}
                                            {property.status_info?.transaction_date && (
                                                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm font-normal text-white/90">
                                                    {property.status_info.transaction_date}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="absolute top-4 right-4 z-10">
                                    <span className={`
                                        w-10 h-10 flex items-center justify-center
                                        rounded-lg text-sm font-bold text-white
                                        shadow-lg backdrop-blur-sm
                                        ${property.purchase === 'For Sale' 
                                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 border border-blue-400' 
                                            : 'bg-gradient-to-br from-green-500 to-green-600 border border-green-400'
                                        }
                                    `}>
                                        {index + 1 + (pagination.currentPage - 1) * 6}
                                    </span>
                                </div>
                                <div className="absolute top-4 left-4">
                                    <span className={`
                                        px-4 py-2 rounded-lg text-sm font-medium 
                                        shadow-lg backdrop-blur-sm
                                        ${property.purchase === 'For Sale' 
                                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border border-blue-400' 
                                            : 'bg-gradient-to-r from-green-500 to-green-600 text-white border border-green-400'
                                        }
                                    `}>
                                        {property.purchase}
                                    </span>
                                </div>
                                <div className="absolute bottom-4 left-4 right-4">
                                    <h3 className="text-xl font-semibold text-white mb-2">
                                        {property.property_name}
                                    </h3>
                                    <div className="flex items-center text-white/80">
                                        <FaMapMarkerAlt className="mr-2" />
                                        {property.city}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <FaRegClock className="mr-1.5" />
                                        {property.formatted_date}
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <FaExpandArrowsAlt className="mr-2" />
                                        {property.square_feet} sq ft
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <p className={`text-xl font-bold ${
                                        property.purchase === 'For Sale' 
                                            ? 'text-blue-600' 
                                            : 'text-green-600'
                                    }`}>
                                        RM {Number(property.price).toLocaleString()}
                                        {property.purchase === 'For Rent' && '/month'}
                                    </p>
                                    <button className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Pagination */}
            {pagination.lastPage > 1 && (
                <div className="mt-12 flex flex-col items-center space-y-6">
                    {/* Current Page Indicator */}
                    <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm">
                        <span className="text-gray-400 text-sm">Page</span>
                        <span className="mx-2 text-gray-900 font-medium">{pagination.currentPage}</span>
                        <span className="text-gray-400 text-sm">of</span>
                        <span className="ml-2 text-gray-900 font-medium">{pagination.lastPage}</span>
                    </div>
                    <div className="inline-flex items-center bg-white rounded-full shadow-lg p-2">
                        {/* Previous Page Button */}
                        <button
                            onClick={() => onPageChange(Math.max(1, pagination.currentPage - 1))}
                            disabled={pagination.currentPage === 1}
                            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        {/* Page Numbers */}
                        <div className="flex items-center px-2">
                            {Array.from({ length: pagination.lastPage }, (_, i) => i + 1).map((page) => {
                                // 当页数太多时，显示省略号
                                if (pagination.lastPage > 7) {
                                    if (
                                        page === 1 ||
                                        page === pagination.lastPage ||
                                        (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)
                                    ) {
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => onPageChange(page)}
                                                className={`
                                                    w-10 h-10 mx-1 rounded-full flex items-center justify-center
                                                    text-sm font-medium transition-all duration-200
                                                    ${page === pagination.currentPage
                                                        ? filters.purchase === 'For Sale'
                                                            ? 'bg-blue-500 text-white shadow-md scale-110'
                                                            : filters.purchase === 'For Rent'
                                                                ? 'bg-green-500 text-white shadow-md scale-110'
                                                                : 'bg-blue-500 text-white shadow-md scale-110'
                                                        : 'text-gray-600 hover:bg-gray-100'
                                                    }
                                                `}
                                            >
                                                {page}
                                            </button>
                                        );
                                    } else if (
                                        page === pagination.currentPage - 2 ||
                                        page === pagination.currentPage + 2
                                    ) {
                                        return (
                                            <span key={page} className="w-10 h-10 flex items-center justify-center text-gray-400">
                                                ...
                                            </span>
                                        );
                                    }
                                    return null;
                                }

                                // 当页数较少时，显示所有页码
                                return (
                                    <button
                                        key={page}
                                        onClick={() => onPageChange(page)}
                                        className={`
                                            w-10 h-10 mx-1 rounded-full flex items-center justify-center
                                            text-sm font-medium transition-all duration-200
                                            ${page === pagination.currentPage
                                                ? filters.purchase === 'For Sale'
                                                    ? 'bg-blue-500 text-white shadow-md scale-110'
                                                    : filters.purchase === 'For Rent'
                                                        ? 'bg-green-500 text-white shadow-md scale-110'
                                                        : 'bg-blue-500 text-white shadow-md scale-110'
                                                : 'text-gray-600 hover:bg-gray-100'
                                            }
                                        `}
                                    >
                                        {page}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Next Page Button */}
                        <button
                            onClick={() => onPageChange(Math.min(pagination.lastPage, pagination.currentPage + 1))}
                            disabled={pagination.currentPage === pagination.lastPage}
                            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-6">
            {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-lg overflow-hidden animate-pulse">
                    <div className="flex flex-col md:flex-row h-[280px]">
                        <div className="w-full md:w-[45%] bg-gray-200"></div>
                        <div className="flex-1 p-6">
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
} 