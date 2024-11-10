import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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
        iconAnchor: [12, 41]
    });

    if (!isClient) {
        return (
            <div className="h-[400px] bg-gray-100 flex items-center justify-center">
                Loading map...
            </div>
        );
    }

    return (
        <MapContainer 
            center={position} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={position} icon={customIcon}>
                <Popup>
                    {propertyName}<br/>
                    {address}
                </Popup>
            </Marker>
        </MapContainer>
    );
};

export default Map; 