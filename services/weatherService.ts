import { WeatherSnapshot } from '../types';

// Open-Meteo is a free, no-API-key weather service — good fit for a low-cost farmer app.
const WEATHER_ENDPOINT = 'https://api.open-meteo.com/v1/forecast';

// Simplified WMO weather code -> human label.
function describeWeatherCode(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code <= 3) return 'Partly cloudy';
  if (code === 45 || code === 48) return 'Fog';
  if (code >= 51 && code <= 57) return 'Drizzle';
  if (code >= 61 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Variable';
}

export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 10 * 60 * 1000,
    });
  });
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherSnapshot> {
  const url = `${WEATHER_ENDPOINT}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&hourly=precipitation_probability&forecast_days=1&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Weather request failed (${res.status})`);
  }
  const data = await res.json();

  const current = data.current ?? {};
  const hourlyProb: number[] = data.hourly?.precipitation_probability ?? [];
  const rainChancePercent = hourlyProb.length ? Math.max(...hourlyProb.slice(0, 6)) : 0;
  const windKph = Math.round((current.wind_speed_10m ?? 0) * 1); // API already returns km/h by default

  // Simple, farmer-friendly rule of thumb: don't spray in high wind or likely rain.
  const sprayAdvisorySafe = rainChancePercent < 40 && windKph < 20;

  return {
    temperatureC: Math.round(current.temperature_2m ?? 0),
    humidity: Math.round(current.relative_humidity_2m ?? 0),
    windKph,
    rainChancePercent: Math.round(rainChancePercent),
    condition: describeWeatherCode(current.weather_code ?? -1),
    sprayAdvisorySafe,
    fetchedAt: Date.now(),
  };
}

export async function fetchWeatherForCurrentLocation(): Promise<WeatherSnapshot> {
  const position = await getCurrentPosition();
  return fetchWeather(position.coords.latitude, position.coords.longitude);
}
