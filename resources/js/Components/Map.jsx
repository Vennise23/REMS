import React, { useState, useEffect } from 'react';

const Map = ({ address, initialSearchQuery }) => {
    const [searchQuery, setSearchQuery] = useState(address || '');

    useEffect(() => {
        if (address) {
            setSearchQuery(address);
            
            const iframe = document.getElementById('gmap_canvas');
            if (iframe) {
                iframe.src = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
            }
        }
    }, [address]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            const encodedAddress = encodeURIComponent(searchQuery);
            const iframe = document.getElementById('gmap_canvas');
            if (iframe) {
                iframe.src = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
            }
        }
    };

    return (
        <div className="relative max-w-4xl mx-auto">
            <div className="mb-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Search address..."
                    />
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                        Search
                    </button>
                </form>
            </div>

            <div className="rounded-lg overflow-hidden shadow-lg">
                <div className="map-svg-container" style={{ height: '500px' }}>
                    <div className="map-svg h-full">
                        <div className="gmap_canvas h-full">
                            <iframe 
                                width="100%" 
                                height="100%" 
                                id="gmap_canvas" 
                                src={`https://maps.google.com/maps?q=${encodeURIComponent(searchQuery)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                                frameBorder="0" 
                                scrolling="no" 
                                marginHeight="0" 
                                marginWidth="0"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Map;