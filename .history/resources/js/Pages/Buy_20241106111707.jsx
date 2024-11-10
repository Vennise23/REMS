import React, { useState, useEffect } from "react";
import { Link, Head } from "@inertiajs/react";
import Header from "@/Components/HeaderMenu";
import PropertyCard from "@/Components/PropertyCard";
import axios from "axios";

export default function Buy({ auth }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [properties, setProperties] = useState([]);
    const [filters, setFilters] = useState({
        propertyType: "",
        priceMin: "",
        priceMax: "",
        sizeMin: "",
        sizeMax: "",
        bedrooms: "",
        purchase: "", // For Sale or For Rent
        saleType: "", // New Launch or Subsale
    });
    const propertiesPerPage = 6;

    // 获取属性数据
    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const response = await axios.get('/api/properties', { params: filters });
                setProperties(response.data);
            } catch (error) {
                console.error("Error fetching properties:", error);
            }
        };
        fetchProperties();
    }, [filters]);

    // 处理筛选器变化
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
        setCurrentPage(1); // 重置页码
    };

    // 获取当前页的属性
    const getCurrentProperties = () => {
        const startIndex = (currentPage - 1) * propertiesPerPage;
        return properties.slice(startIndex, startIndex + propertiesPerPage);
    };

    // 计算总页数
    const totalPages = Math.ceil(properties.length / propertiesPerPage);

    return (
        <>
            <Head title="Buy" />
            <Header auth={auth} />

            <main className="pt-32 px-4 min-h-screen bg-gray-100">
                {/* 筛选器区域 */}
                <div className="max-w-7xl mx-auto mb-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* 购买类型 */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Purchase Type</label>
                                <select
                                    name="purchase"
                                    onChange={handleFilterChange}
                                    className="w-full p-2 border rounded-md"
                                >
                                    <option value="">All</option>
                                    <option value="For Sale">For Sale</option>
                                    <option value="For Rent">For Rent</option>
                                </select>
                            </div>

                            {/* 销售类型 */}
                            {filters.purchase === "For Sale" && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Sale Type</label>
                                    <select
                                        name="saleType"
                                        onChange={handleFilterChange}
                                        className="w-full p-2 border rounded-md"
                                    >
                                        <option value="">All</option>
                                        <option value="New Launch">New Launch</option>
                                        <option value="Subsale">Subsale</option>
                                    </select>
                                </div>
                            )}

                            {/* 房产类型 */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Property Type</label>
                                <select
                                    name="propertyType"
                                    onChange={handleFilterChange}
                                    className="w-full p-2 border rounded-md"
                                >
                                    <option value="">All Property</option>
                                    <option value="Conventional Condominium">Conventional Condominium</option>
                                    <option value="Bare Land Condominium">Bare Land Condominium</option>
                                    <option value="Commercial">Commercial</option>
                                </select>
                            </div>

                            {/* 价格范围 */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Price Range (RM)</label>
                                <div className="flex space-x-2">
                                    <input
                                        type="number"
                                        name="priceMin"
                                        placeholder="Min"
                                        onChange={handleFilterChange}
                                        className="w-1/2 p-2 border rounded-md"
                                    />
                                    <input
                                        type="number"
                                        name="priceMax"
                                        placeholder="Max"
                                        onChange={handleFilterChange}
                                        className="w-1/2 p-2 border rounded-md"
                                    />
                                </div>
                            </div>

                            {/* 面积范围 */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Size (sq ft)</label>
                                <div className="flex space-x-2">
                                    <input
                                        type="number"
                                        name="sizeMin"
                                        placeholder="Min"
                                        onChange={handleFilterChange}
                                        className="w-1/2 p-2 border rounded-md"
                                    />
                                    <input
                                        type="number"
                                        name="sizeMax"
                                        placeholder="Max"
                                        onChange={handleFilterChange}
                                        className="w-1/2 p-2 border rounded-md"
                                    />
                                </div>
                            </div>
                        </div>
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