import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';

const Map = ({ position, propertyName, address }) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const customIcon = new Icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        shadowSize: [41, 41]
    });

    if (!isClient) {
        return (
            <div className="h-[400px] bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3"></div>
                    <p className="text-gray-600">Loading map...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative max-w-4xl mx-auto">
            <div className="bg-white p-4 rounded-lg shadow-lg mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Property Location</h3>
                <p className="text-gray-600">{address}</p>
            </div>
            
            <div className="rounded-lg overflow-hidden shadow-lg">
                <MapContainer 
                    center={position} 
                    zoom={15} 
                    style={{ height: '500px' }}
                    zoomControl={false}
                    className="z-10"
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <ZoomControl position="bottomright" />
                    <Marker position={position} icon={customIcon}>
                        <Popup className="custom-popup">
                            <div className="p-3">
                                <h3 className="font-semibold text-blue-700 mb-2">{propertyName}</h3>
                                <p className="text-gray-600 text-sm">{address}</p>
                            </div>
                        </Popup>
                    </Marker>
                </MapContainer>
            </div>
        </div>
    );
};

export default Map; 