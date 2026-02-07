import { useState, useEffect } from 'react';

/**
 * Weather Hook - Fetches real weather based on user location
 * Uses Open-Meteo API (free, no key required)
 */

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const WEATHER_CODES = {
  0: 'clear',
  1: 'clear', 2: 'partly_cloudy', 3: 'cloudy',
  45: 'fog', 48: 'fog',
  51: 'drizzle', 53: 'drizzle', 55: 'drizzle',
  61: 'rain', 63: 'rain', 65: 'heavy_rain',
  71: 'snow', 73: 'snow', 75: 'heavy_snow',
  77: 'snow',
  80: 'rain', 81: 'rain', 82: 'heavy_rain',
  85: 'snow', 86: 'heavy_snow',
  95: 'thunderstorm', 96: 'thunderstorm', 99: 'thunderstorm',
};

export function useWeather() {
  const [weather, setWeather] = useState({
    condition: 'clear',
    isDay: true,
    temperature: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    const fetchWeather = async (lat, lon) => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (!mounted) return;
        
        const code = data.current?.weather_code ?? 0;
        setWeather({
          condition: WEATHER_CODES[code] || 'clear',
          isDay: data.current?.is_day === 1,
          temperature: data.current?.temperature_2m,
          loading: false,
          error: null,
        });
        
        // Cache the result
        localStorage.setItem('weather-cache', JSON.stringify({
          data: { condition: WEATHER_CODES[code] || 'clear', isDay: data.current?.is_day === 1, temperature: data.current?.temperature_2m },
          timestamp: Date.now(),
          lat, lon
        }));
      } catch (err) {
        if (mounted) {
          setWeather(w => ({ ...w, loading: false, error: err.message }));
        }
      }
    };

    const getLocation = () => {
      // Check cache first
      const cached = localStorage.getItem('weather-cache');
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setWeather({ ...data, loading: false, error: null });
          return;
        }
      }

      // Determine day/night from local time as fallback
      const hour = new Date().getHours();
      const isDay = hour >= 6 && hour < 20;

      if (!navigator.geolocation) {
        setWeather({ condition: 'clear', isDay, temperature: null, loading: false, error: 'No geolocation' });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => setWeather({ condition: 'clear', isDay, temperature: null, loading: false, error: 'Location denied' }),
        { timeout: 10000 }
      );
    };

    getLocation();
    const interval = setInterval(getLocation, CACHE_DURATION);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return weather;
}
