import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import HeaderMenu from '@/Layouts/HeaderMenu';
import Footer from '@/Layouts/Footer';
import axios from 'axios';

export default function SellerList({ auth, initialFilters = {} }) {
    const [region, setRegion] = useState(initialFilters.region || '');
    const [propertyType, setPropertyType] = useState(initialFilters.propertyType || '');
    const [searchTerm, setSearchTerm] = useState(initialFilters.searchTerm || '');
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(false);

    const regions = [
        'Kuala Lumpur',
        'Selangor',
        'Penang',
        'Johor',
        'Kedah',
        'Kelantan',
        'Labuan',
        'Melaka',
        'Negeri Sembilan',
        'Pahang',
        'Perak',
        'Perlis',
        'Putrajaya',
        'Sabah',
        'Sarawak',
        'Terengganu'
    ];

    useEffect(() => {
        // Perform initial search if there are filters or if search flag is true
        if (Object.keys(initialFilters).length > 0 || initialFilters.search) {
            handleSearch();
        }
    }, []);

    const handleSearch = async () => {
        setLoading(true);
        try {
            console.log('Searching with params:', { region, propertyType, searchTerm }); // Debug log
            const response = await axios.get('/api/search-sellers', {
                params: {
                    region,
                    propertyType,
                    searchTerm
                }
            });
            console.log('Search response:', response.data); // Debug log
            setSellers(response.data);
        } catch (error) {
            console.error('Search failed:', error);
        }
        setLoading(false);
    };

    const ResultsHeader = () => {
        if (loading) return <h2 className="text-2xl font-bold mb-6">Searching...</h2>;
        
        return (
            <h2 className="text-2xl font-bold mb-6">
                {sellers.length} Sellers Found
                {region && ` in ${region}`}
            </h2>
        );
    };

    return (
        <>
            <Head title={`Sellers in ${region || 'All Regions'}`} />
            <HeaderMenu auth={auth} />

            <main className="min-h-screen pt-24 pb-16">
                {/* Search Filters */}
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
                                {regions.map((region) => (
                                    <option key={region} value={region}>
                                        {region}
                                    </option>
                                ))}
                            </select>
                            
                            <select 
                                className="p-2 border rounded-md w-40"
                                value={propertyType}
                                onChange={(e) => setPropertyType(e.target.value)}
                            >
                                <option value="">Property Type</option>
                                <option value="all">All</option>
                                <option value="Conventional Condominium">Conventional Condominium</option>
                                <option value="Bare Land Condominium">Bare Land Condominium</option>
                                <option value="Commercial">Commercial</option>
                            </select>
                            
                            <input 
                                type="text"
                                placeholder="Search by Seller or Region"
                                className="p-2 border rounded-md flex-grow"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            
                            <button 
                                className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600"
                                onClick={handleSearch}
                                disabled={loading}
                            >
                                {loading ? 'Searching...' : 'Search'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                <div className="container mx-auto px-4 py-8">
                    <ResultsHeader />
                    
                    {loading ? (
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {sellers.map((seller) => (
                                <a 
                                    key={seller.id}
                                    href={`/seller/${seller.id}/properties`}
                                    className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                                >
                                    <div className="flex-shrink-0">
                                        <img 
                                            src={seller.profile_picture}
                                            alt={`${seller.firstname} ${seller.lastname}`}
                                            className="w-16 h-16 rounded-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = '/storage/profile_pictures/default-avatar.png';
                                            }}
                                        />
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {seller.firstname} {seller.lastname}
                                        </h3>
                                        <p className="text-sm text-gray-600">{seller.agency_name}</p>
                                        <p className="text-sm text-red-500">
                                            {seller.property_count} Active Listings
                                        </p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}

                    {!loading && sellers.length === 0 && (
                        <p className="text-center text-gray-500">
                            No sellers found {region ? `in ${region}` : ''}
                        </p>
                    )}
                </div>
            </main>

            <Footer />
        </>
    );
} 