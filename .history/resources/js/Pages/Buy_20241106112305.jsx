import React, { useState } from "react";
import { Link, Head } from "@inertiajs/react";
import Header from "@/Components/HeaderMenu";
import PropertyCard from "@/Components/PropertyCard";

export default function Buy({ auth }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [properties, setProperties] = useState([]); // 这里应该从后端获取数据    const propertiesPerPage = 6;

    // 计算总页数
    const totalPages = Math.ceil(properties.length / propertiesPerPage);

    // 获取当前页的属性
    const getCurrentProperties = () => {
        const startIndex = (currentPage - 1) * propertiesPerPage;
        return properties.slice(startIndex, startIndex + propertiesPerPage);
    };

    return (
        <>
            <Head title="Buy" />
            <Header auth={auth} />

            <main className="pt-32 px-4 min-h-screen bg-gray-100">
                {/* 筛选器区域 */}
                <div className="max-w-7xl mx-auto mb-8">
                    <div className="bg-white p-4 rounded-lg shadow">
                        {/* 这里可以添加筛选器组件 */}
                    </div>
                </div>

                {/* 属性列表 */}
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {getCurrentProperties().map((property, index) => (
                            <PropertyCard key={index} property={property} />
                        ))}
                    </div>

                    {/* 分页 */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-8 gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 bg-white rounded-md shadow disabled:opacity-50"
                            >
                                Previous
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`px-4 py-2 rounded-md shadow ${
                                        currentPage === i + 1 
                                            ? 'bg-red-500 text-white' 
                                            : 'bg-white'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 bg-white rounded-md shadow disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}