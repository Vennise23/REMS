import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import PropertyCard from '@/Components/PropertyCard';
import FilterSection from '@/Components/FilterSection';
import Header from '@/Components/HeaderMenu';

const Buy = ({ auth, properties }) => {
    const [filters, setFilters] = useState({
        propertyType: 'All Property',
        priceMin: 0,
        priceMax: 1000000,
        sizeMin: 0,
        sizeMax: 100000,
        bedrooms: 0,
    });

    // 分页组件
    const Pagination = ({ links }) => {
        return (
            <div className="flex items-center justify-center space-x-2 my-8">
                {links.map((link, index) => {
                    if (!link.url) {
                        return (
                            <span
                                key={index}
                                className="px-4 py-2 text-gray-500 bg-gray-100 rounded-md"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        );
                    }

                    return (
                        <Link
                            key={index}
                            href={link.url}
                            className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                                link.active
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                            } shadow-sm`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                })}
            </div>
        );
    };

    return (
        <>
            <Head>
                <title>Buy Properties - StarProperty Clone</title>
                <meta name="description" content="Find your dream property" />
            </Head>

            <Header auth={auth} />

            <div className="pt-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
                        <FilterSection filters={filters} setFilters={setFilters} />
                    </div>

                    {/* 属性列表 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.data && properties.data.length > 0 ? (
                            properties.data.map((property) => (
                                <PropertyCard key={property.id} property={property} />
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-10">
                                <p className="text-gray-500">No properties found</p>
                            </div>
                        )}
                    </div>

                    {/* 分页 */}
                    {properties.links && (
                        <Pagination links={properties.links} />
                    )}
                </div>
            </div>
        </>
    );
};

export default Buy;