"use client";

import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import { Loader2 } from 'lucide-react'; // Keep loader for initial render

interface MapDisplayProps {
    data: any[];
    locationKey: string;
    valueKey: string;
}

export function MapDisplay({ data, locationKey, valueKey }: MapDisplayProps) {
    if (!data) {
        // This can happen while data is loading
        return <div className="h-full w-full flex items-center justify-center"><Loader2 className="animate-spin text-muted-foreground"/></div>;
    }

    if (!locationKey || !valueKey) {
        return <div className="text-center p-4 text-muted-foreground">Please select a location and value column.</div>;
    }
    
    // The data now comes with latitude and longitude from the backend
    const mapData = data.filter(item => 
        item.latitude !== null && item.longitude !== null && !isNaN(item.latitude) && !isNaN(item.longitude)
    );

    if (mapData.length === 0) {
        return (
            <div className="text-center p-4 text-muted-foreground">
                <p>No valid geographical data found.</p>
                <p className="text-xs mt-2">Ensure your data has location names that match the cities database.</p>
            </div>
        );
    }

    const maxValue = Math.max(...mapData.map(item => item[valueKey]), 0);

    return (
        <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%', borderRadius: 'var(--radius)' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {mapData.map((item, index) => (
                <CircleMarker
                    key={index}
                    center={[item.latitude, item.longitude] as LatLngExpression}
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