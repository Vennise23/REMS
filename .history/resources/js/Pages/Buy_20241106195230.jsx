import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import PropertyCard from '@/Components/PropertyCard';
import FilterSection from '@/Components/FilterSection';
import Header from '@/Components/HeaderMenu';

const Buy = ({ auth }) => {
    const [properties, setProperties] = useState([]);
    const [filters, setFilters] = useState({
        propertyType: 'All Property',
        priceMin: 0,
        priceMax: 1000000,
        sizeMin: 0,
        sizeMax: 100000,
        bedrooms: 0,
    });

    useEffect(() => {
        fetch('/api/properties')
            .then(response => response.json())
            .then(data => setProperties(data));
    }, []);

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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map((property) => (
                            <PropertyCard key={property.id} property={property} />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Buy;