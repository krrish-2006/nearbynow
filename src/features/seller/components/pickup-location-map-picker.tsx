"use client";

import { useEffect, useRef } from "react";
import type * as Leaflet from "leaflet";

type PickupLocationMapPickerProps = {
  latitude: number | null;
  longitude: number | null;
  onSelect: (point: { latitude: number; longitude: number }) => void;
};

const DURGAPUR_CENTER = {
  latitude: 23.5204,
  longitude: 87.3119,
};

export function PickupLocationMapPicker({
  latitude,
  longitude,
  onSelect,
}: PickupLocationMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const markerRef = useRef<Leaflet.CircleMarker | null>(null);
  const leafletRef = useRef<typeof Leaflet | null>(null);
  const onSelectRef = useRef(onSelect);
  const initialLatitudeRef = useRef(latitude);
  const initialLongitudeRef = useRef(longitude);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    let isMounted = true;

    async function createMap() {
      if (!mapContainerRef.current || mapRef.current) {
        return;
      }

      const leaflet = await import("leaflet");

      if (!isMounted || !mapContainerRef.current) {
        return;
      }

      leafletRef.current = leaflet;

      const initialLatitude = initialLatitudeRef.current;
      const initialLongitude = initialLongitudeRef.current;
      const center: Leaflet.LatLngExpression = [
        initialLatitude ?? DURGAPUR_CENTER.latitude,
        initialLongitude ?? DURGAPUR_CENTER.longitude,
      ];

      const map = leaflet.map(mapContainerRef.current, {
        center,
        zoom: initialLatitude && initialLongitude ? 17 : 13,
        scrollWheelZoom: true,
      });

      leaflet
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        })
        .addTo(map);

      map.on("click", (event: Leaflet.LeafletMouseEvent) => {
        onSelectRef.current({
          latitude: event.latlng.lat,
          longitude: event.latlng.lng,
        });
      });

      mapRef.current = map;

      setTimeout(() => {
        map.invalidateSize();
      }, 0);
    }

    void createMap();

    return () => {
      isMounted = false;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const leaflet = leafletRef.current;

    if (!map || !leaflet || latitude === null || longitude === null) {
      return;
    }

    const point: Leaflet.LatLngExpression = [latitude, longitude];

    if (!markerRef.current) {
      markerRef.current = leaflet
        .circleMarker(point, {
          radius: 9,
          color: "#000000",
          fillColor: "#0f766e",
          fillOpacity: 1,
          weight: 3,
        })
        .addTo(map);
    } else {
      markerRef.current.setLatLng(point);
    }

    map.setView(point, Math.max(map.getZoom(), 17));
  }, [latitude, longitude]);

  return (
    <div className="overflow-hidden rounded-2xl border bg-white">
      <div ref={mapContainerRef} className="h-80 w-full" />
    </div>
  );
}
