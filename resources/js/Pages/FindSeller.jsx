import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import HeaderMenu from '@/Layouts/HeaderMenu';
import Footer from '@/Layouts/Footer';

export default function FindSeller({ auth }) {
    const [region, setRegion] = useState('');
    const [propertyType, setPropertyType] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showAllRegions, setShowAllRegions] = useState(false);

    const regions = [
        { name: 'Kuala Lumpur', image: '/images/regions/kl.jpg' },
        { name: 'Selangor', image: '/images/regions/selangor.jpg' },
        { name: 'Penang', image: '/images/regions/penang.jpg' },
        { name: 'Johor', image: '/images/regions/johor.jpg' },
        { name: 'Kedah', image: '/images/regions/kedah.jpg' },
        { name: 'Kelantan', image: '/images/regions/kelantan.jpg' },
        { name: 'Labuan', image: '/images/regions/labuan.jpg' },
        { name: 'Melaka', image: '/images/regions/melaka.jpg' },
        { name: 'Negeri Sembilan', image: '/images/regions/negerisembilan.jpg' },
        { name: 'Pahang', image: '/images/regions/pahang.jpg' },
        { name: 'Perak', image: '/images/regions/perak.jpg' },
        { name: 'Perlis', image: '/images/regions/perlis.jpg' },
        { name: 'Putrajaya', image: '/images/regions/putrajaya.jpg' },
        { name: 'Sabah', image: '/images/regions/sabah.jpg' },
        { name: 'Sarawak', image: '/images/regions/sarawak.jpg' },
        { name: 'Terengganu', image: '/images/regions/terengganu.jpg' },
    ];

    const displayedRegions = showAllRegions ? regions : regions.slice(0, 8);

    // Handle search when pressing Enter in the search input
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // Handle search button click
    const handleSearch = () => {
        // Redirect to SellerList page with search parameters and trigger immediate search
        router.get('/seller-list', {
            region,
            propertyType,
            searchTerm,
            search: true  // Add this flag to indicate we want to search immediately
        });
    };

    return (
        <>
            <Head title="Find Seller" />

            <HeaderMenu auth={auth} />

            {/* Main content area with padding for fixed header */}
            <main className="min-h-screen pt-24 pb-16">
                {/* Search Section */}
                <div className="bg-gray-100 py-8">
                    <div className="container mx-auto px-4">
                        <h1 className="text-3xl font-bold mb-6 text-center">Find A Seller</h1>
                        <div className="flex justify-center gap-2">
                            <select
                                className="p-2 border rounded-md w-40"
                                value={region}
                                onChange={(e) => setRegion(e.target.value)}
                            >
                                <option value="">Region</option>
                                {regions.map((r) => (
                                    <option key={r.name} value={r.name}>{r.name}</option>
                                ))}
                            </select>

                            <select
                                className="p-2 border rounded-md w-40"
                                value={propertyType}
                                onChange={(e) => setPropertyType(e.target.value)}
                            >
                                <option value="">Property Type</option>
                                <option value="all">All</option>
                                <option value="conventional">Conventional Condominium</option>
                                <option value="bare-land">Bare Land Condominium</option>
                                <option value="commercial">Commercial</option>
                            </select>

                            <input
                                type="text"
                                placeholder="Search by Seller or Region"
                                className="p-2 border rounded-md flex-grow"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={handleKeyPress}
                            />

                            <button
                                className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600"
                                onClick={handleSearch}
                            >
                                Search
                            </button>
                        </div>
                    </div>
                </div>

                {/* Browse By Region Section */}
                <div className="container mx-auto px-4 py-12">
                    <h2 className="text-2xl font-bold mb-8">Browse By Region</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {displayedRegions.map((region) => (
                            <div
                                key={region.name}
                                className="relative h-64 rounded-lg overflow-hidden cursor-pointer group"
                                onClick={() => {
                                    // Redirect to SellerList with the selected region
                                    router.get('/seller-list', {
                                        region: region.name,
                                        propertyType: '', // default empty
                                        searchTerm: ''    // default empty
                                    });
                                }}
                            >
                                <img
                                    src={region.image}
                                    alt={region.name}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center hover:bg-opacity-50 transition-all">
                                    <h3 className="text-white text-2xl font-semibold">{region.name}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-8">
                        <button
                            onClick={() => setShowAllRegions(!showAllRegions)}
                            className="text-red-500 hover:text-red-600 flex items-center mx-auto"
                        >
                            <span>{showAllRegions ? 'Show Less' : 'Show More (8)'}</span>
                            <svg
                                className={`w-4 h-4 ml-1 transform ${showAllRegions ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}