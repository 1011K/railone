/**
 * Open-Meteo Weather Integration
 * Free public API (https://api.open-meteo.com/v1/forecast)
 * Non-negotiable safety invariant: Weather observations are strictly informational.
 * Weather must NEVER be treated as confirmation that a train is delayed or cancelled.
 */

export interface WeatherReport {
  stationCode?: string;
  latitude: number;
  longitude: number;
  temperatureCelsius: number;
  precipitationMm: number;
  weatherDescription: string;
  isMonsoonAlert: boolean;
  provenance: 'OPEN_METEO_LIVE' | 'DEMO_FALLBACK';
  safetyNotice: string;
  timestamp: string;
}

export class OpenMeteoService {
  private baseUrl = 'https://api.open-meteo.com/v1/forecast';

  /**
   * Get weather for station or geographic coordinates
   */
  async getWeatherForCoordinates(lat: number, lon: number, stationCode?: string): Promise<WeatherReport> {
    const safetyNotice = '[WEATHER_ADVISORY] Weather data is purely informational. Weather conditions must NEVER be treated as confirmation that a train is delayed or cancelled. Actual operations depend exclusively on Indian Railways section dispatch telemetry.';
    const now = new Date().toISOString();

    try {
      const url = `${this.baseUrl}?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,weather_code,wind_speed_10m&timezone=Asia%2FKolkata`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (response.ok) {
        const data: any = await response.json();
        const current = data?.current;
        const temp = current?.temperature_2m ?? 30;
        const precip = current?.precipitation ?? 0;
        const code = current?.weather_code ?? 0;

        const description = this.mapWeatherCode(code);
        const isMonsoonAlert = precip > 15 || code >= 80;

        return {
          stationCode,
          latitude: lat,
          longitude: lon,
          temperatureCelsius: temp,
          precipitationMm: precip,
          weatherDescription: description,
          isMonsoonAlert,
          provenance: 'OPEN_METEO_LIVE',
          safetyNotice,
          timestamp: now
        };
      }
    } catch {
      // Offline fallback
    }

    // Deterministic fallback for offline / test environments
    return {
      stationCode,
      latitude: lat,
      longitude: lon,
      temperatureCelsius: 29.5,
      precipitationMm: 0.0,
      weatherDescription: 'Fair / Partly Cloudy [TIMETABLE MODEL]',
      isMonsoonAlert: false,
      provenance: 'DEMO_FALLBACK',
      safetyNotice,
      timestamp: now
    };
  }

  private mapWeatherCode(code: number): string {
    if (code === 0) return 'Clear sky';
    if (code <= 3) return 'Partly cloudy';
    if (code <= 48) return 'Foggy / Haze';
    if (code <= 55) return 'Light Drizzle';
    if (code <= 65) return 'Rain showers';
    if (code <= 82) return 'Heavy monsoon rain showers';
    if (code >= 95) return 'Thunderstorm';
    return 'Overcast';
  }
}
