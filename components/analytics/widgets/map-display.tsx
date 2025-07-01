"use client";

import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';

// This is a placeholder for a real geocoding service.
// In a real-world application, you would use an API to get coordinates for locations.
const geocodeCity = (cityName: string): [number, number] | null => {
    const cityCoordinates: { [key: string]: [number, number] } = {
        "New York": [40.7128, -74.0060],
        "London": [51.5074, -0.1278],
        "Tokyo": [35.6895, 139.6917],
        "Sydney": [-33.8688, 151.2093],
        "Paris": [48.8566, 2.3522],
        "Los Angeles": [34.0522, -118.2437],
        "Singapore": [1.3521, 103.8198],
    };
    const normalizedCityName = Object.keys(cityCoordinates).find(key => key.toLowerCase() === cityName.toLowerCase());
    return normalizedCityName ? cityCoordinates[normalizedCityName] : null;
};

interface MapDisplayProps {
    data: any[];
    locationKey: string;
    valueKey: string;
}

export function MapDisplay({ data, locationKey, valueKey }: MapDisplayProps) {
    if (!locationKey || !valueKey) {
        return <div className="text-center p-4 text-muted-foreground">Please select a location and value column for the map.</div>;
    }
    
    const mapData = data.map(item => ({
        ...item,
        coords: geocodeCity(item[locationKey])
    })).filter(item => item.coords !== null);

    if (mapData.length === 0) {
        return <div className="text-center p-4 text-muted-foreground">No valid geographical data found to display on the map.</div>;
    }

    const maxValue = Math.max(...mapData.map(item => item[valueKey]), 0);

    return (
        <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%', borderRadius: 'var(--radius)' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {mapData.map((item, index) => (
                <CircleMarker
                    key={index}
                    center={item.coords as LatLngExpression}
                    radius={5 + (item[valueKey] / maxValue) * 20}
                    fillOpacity={0.7}
                    stroke={false}
                    color="hsl(var(--primary))"
                    fillColor="hsl(var(--primary))"
                >
                    <Tooltip>
                        {item[locationKey]}: {item[valueKey].toLocaleString()}
                    </Tooltip>
                </CircleMarker>
            ))}
        </MapContainer>
    );
}