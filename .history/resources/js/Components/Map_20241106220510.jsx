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
        <div className="relative">
            <MapContainer 
                center={position} 
                zoom={15} 
                style={{ height: '400px', width: '100%', borderRadius: '0.5rem' }}
                zoomControl={false}
                className="z-10"
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                <ZoomControl position="bottomright" />
                <Marker position={position} icon={customIcon}>
                    <Popup className="custom-popup">
                        <div className="p-2">
                            <h3 className="font-semibold text-blue-600 mb-1">{propertyName}</h3>
                            <p className="text-gray-600 text-sm">{address}</p>
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>
            <div className="absolute top-4 left-4 z-20 bg-white px-4 py-2 rounded-lg shadow-md">
                <h3 className="text-sm font-semibold text-gray-700">Property Location</h3>
                <p className="text-xs text-gray-500 mt-1">{address}</p>
            </div>
        </div>
    );
};

export default Map; 