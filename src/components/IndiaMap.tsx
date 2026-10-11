import React from 'react';
import { RegionData, MapStationData } from '../types/airQuality';
import { GoogleMapReal } from './GoogleMapReal';

interface IndiaMapProps {
  selectedRegion: RegionData;
  onSelectRegion: (region: RegionData) => void;
  onSelectStation?: (station: MapStationData) => void;
  onSearchQuery?: (query: string) => void;
}

export const IndiaMap: React.FC<IndiaMapProps> = ({
  selectedRegion,
  onSelectRegion,
  onSelectStation,
  onSearchQuery,
}) => {
  return (
    <div className="h-full min-h-[460px] w-full">
      <GoogleMapReal
        selectedRegion={selectedRegion}
        onSelectRegion={onSelectRegion}
        onSelectStation={onSelectStation}
        onSearchQuery={onSearchQuery}
      />
    </div>
  );
};
