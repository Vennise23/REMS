import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import NewLaunchFilter from '@/Components/NewLaunches/NewLaunchFilter';
import NewLaunchGrid from '@/Components/NewLaunches/NewLaunchGrid';
import axios from 'axios';
import SidebarFilter from '@/Components/NewLaunches/SidebarFilter';

export default function Index({ auth }) {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        purchase: 'All Properties',
        sortDirection: 'desc',
        propertyType: 'All Property',
        saleType: 'All Types',
        priceMin: '',
        priceMax: '',
        sizeMin: '',
        sizeMax: '',
        citySearch: '',
        amenities: [],
        status: 'all'
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        total: 0
    });

    const fetchProperties = async (page = 1) => {
        try {
            setLoading(true);
            const response = await axios.get('/api/new-launches', {
                params: {
                    page,
                    purchase: filters.purchase === 'All Properties' ? null : filters.purchase,
                    propertyType: filters.propertyType,
                    saleType: filters.saleType,
                    priceMin: filters.priceMin || '',
                    priceMax: filters.priceMax || '',
                    sizeMin: filters.sizeMin || '',
                    sizeMax: filters.sizeMax || '',
                    citySearch: filters.citySearch,
                    amenities: JSON.stringify(filters.amenities),
                    sortDirection: filters.sortDirection,
                    status: filters.status
                }
            });
            
            setProperties(response.data.data);
            setPagination({
                currentPage: response.data.current_page,
                lastPage: response.data.last_page,
                total: response.data.total
            });
        } catch (error) {
            console.error('Error fetching properties:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    useEffect(() => {
        if (filters) {
            fetchProperties();
        }
    }, [filters]);

    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    const handlePageChange = (page) => {
        fetchProperties(page);
    };

    return (
        <MainLayout auth={auth}>
            <Head title="New Launches" />
            
            <div className="min-h-screen bg-gray-50 pt-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            New Property Launches
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Discover the latest properties added in the last 30 days
                        </p>
                    </div>

                    <div className="flex gap-8">
                        {/* Sidebar */}
                        <div className="w-80 flex-shrink-0">
                            <SidebarFilter
                                filters={filters}
                                setFilters={setFilters}
                            />
                        </div>

                        {/* Main Content */}
                        <div className="flex-1">
                            <NewLaunchGrid 
                                properties={properties}
                                loading={loading}
                                pagination={pagination}
                                onPageChange={handlePageChange}
                                filters={filters}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
} 