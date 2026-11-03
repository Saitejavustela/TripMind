'use client';

import { useState, useEffect } from 'react';

export interface WeatherData {
  temperature: number;
  condition: 'clear' | 'cloudy' | 'rain' | 'snow' | 'storm' | 'fog' | 'drizzle';
  humidity: number;
  windSpeed: number;
  'precipitation chance': number;
  forecast: WeatherForecast[];
}

export interface WeatherForecast {
  time: string; // ISO date string
  temperature: number;
  condition: WeatherData['condition'];
  precipitation: number;
}

export interface WeatherAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedArea: 'activities' | 'route' | 'accommodation' | 'all';
  startTime: string;
  endTime: string;
  action: string; // recommended action
}

export interface TripWeatherPlan {
  tripId: string;
  destination: string;
  dates: { start: string; end: string };
  dailyForecasts: DailyWeatherPlan[];
  alerts: WeatherAlert[];
  recommendations: WeatherRecommendation[];
}

export interface DailyWeatherPlan {
  day: number;
  date: string;
  forecast: WeatherForecast;
  adjustedActivities: string[];
  suggestions: string[];
}

export interface WeatherRecommendation {
  type: 'attraction' | 'activity' | 'clothing' | 'transportation';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

/**
 * Weather Service - Provides weather data and planning recommendations
 * for trip planning with weather awareness
 * Supports both mock mode (default) and real API mode
 */
export class WeatherService {
  private static readonly OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || 'demo-key';
  private static readonly USE_REAL_API = process.env.NEXT_PUBLIC_USE_WEATHER_API === "true";
  private static readonly CACHE_DURATION = 1000 * 60 * 60 * 2; // 2 hours

  /**
   * Get weather forecast for a location and date range
   */
  static async getForecast(
    latitude: number,
    longitude: number,
    startDate: Date,
    endDate: Date
  ): Promise<WeatherData> {
    if (this.USE_REAL_API && this.OPENWEATHER_API_KEY) {
      return this.getRealWeather(latitude, longitude, startDate, endDate);
    }
    return this.getMockWeather(latitude, longitude, startDate, endDate);
  }

  /**
   * Get weather alerts for a location and date range
   */
  static async getAlerts(
    latitude: number,
    longitude: number,
    startDate: Date,
    endDate: Date
  ): Promise<WeatherAlert[]> {
    if (this.USE_REAL_API) {
      return this.getRealAlerts(latitude, longitude, startDate, endDate);
    }
    return this.getMockAlerts(latitude, longitude, startDate, endDate);
  }

  /**
   * Generate weather-aware itinerary plan
   */
  static async generateWeatherPlan(
    tripId: string,
    destination: string,
    dates: { start: string; end: string }
  ): Promise<TripWeatherPlan> {
    // Parse dates
    const startDate = new Date(dates.start);
    const endDate = new Date(dates.end);

    // Get weather forecast
    const destLatLong = this.getDestinationCoords(destination);
    const weatherData = await this.getForecast(
      destLatLong.lat,
      destLatLong.lng,
      startDate,
      endDate
    );

    // Get alerts
    const alerts = await this.getAlerts(
      destLatLong.lat,
      destLatLong.lng,
      startDate,
      endDate
    );

    // Generate daily plans
    const dailyForecasts = this.generateDailyPlans(weatherData.forecast, startDate, endDate);

    // Generate recommendations
    const recommendations = this.generateRecommendations(weatherData, alerts, dailyForecasts);

    return {
      tripId,
      destination,
      dates: { start: dates.start, end: dates.end },
      dailyForecasts,
      alerts,
      recommendations,
    };
  }

  private static getDestinationCoords(destination: string): { lat: number; lng: number } {
    const coords: Record<string, { lat: number; lng: number }> = {
      'Paris, France': { lat: 48.8566, lng: 2.3522 },
      'Tokyo, Japan': { lat: 35.6762, lng: 139.6503 },
      'New York, USA': { lat: 40.7128, lng: -74.006 },
      'Rome, Italy': { lat: 41.9028, lng: 12.4964 },
      'Barcelona, Spain': { lat: 41.3851, lng: 2.1734 },
      'default': { lat: 48.8566, lng: 2.3522 }, // Paris default
    };

    return coords[destination] || coords.default;
  }

  /**
   * Get real weather from OpenWeatherMap API
   */
  private static async getRealWeather(
    latitude: number,
    longitude: number,
    startDate: Date,
    endDate: Date
  ): Promise<WeatherData> {
    try {
      // Get current weather + forecast
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${this.OPENWEATHER_API_KEY}&units=metric`
      );

      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${this.OPENWEATHER_API_KEY}&units=metric`
      );

      if (!currentResponse.ok || !forecastResponse.ok) {
        throw new Error('Weather API error');
      }

      const currentData = await currentResponse.json();
      const forecastData = await forecastResponse.json();

      // Transform OpenWeatherMap data to our format
      return this.transformOpenWeatherData(currentData, forecastData);
    } catch (error) {
      console.error('Error fetching real weather:', error);
      // Fall back to mock data on error
      return this.getMockWeather(0, 0, startDate, endDate);
    }
  }

  /**
   * Transform OpenWeatherMap response to our WeatherData format
   */
  private static transformOpenWeatherData(
    current: any,
    forecast: any
  ): WeatherData {
    // Extract current condition
    const currentCondition = this.getConditionFromWeatherId(current.weather[0].id);
    const currentTemp = Math.round(current.main.temp);
    const currentHumidity = current.main.humidity;
    const currentWindSpeed = Math.round(current.wind.speed * 3.6); // m/s to km/h
    const currentPrecipChance = this.getPrecipitationChance(current);

    // Build forecast array (next 7 days from forecast list)
    const forecasts: WeatherForecast[] = [];
    const seenDates = new Set<string>();

    // OpenWeatherMap forecast lists data every 3 hours for 5 days
    forecast.list?.forEach((item: any) => {
      const date = item.dt_txt.split(' ')[0];
      if (!seenDates.has(date)) {
        seenDates.add(date);
        forecasts.push({
          time: date,
          temperature: Math.round(item.main.temp),
          condition: this.getConditionFromWeatherId(item.weather[0].id),
          precipitation: item.pop * 100, // Probability of precipitation
        });
        if (forecasts.length >= 7) return; // Stop at 7 days
      }
    });

    return {
      temperature: currentTemp,
      condition: currentCondition,
      humidity: currentHumidity,
      windSpeed: currentWindSpeed,
      'precipitation chance': Math.min(...forecasts.map(f => f.precipitation)) || 20,
      forecast: forecasts,
    };
  }

  private static getConditionFromWeatherId(weatherId: number): WeatherData['condition'] {
    if (weatherId >= 200 && weatherId <= 232) return 'storm';
    if (weatherId >= 300 && weatherId <= 321) return 'drizzle';
    if (weatherId >= 500 && weatherId <= 531) return 'rain';
    if (weatherId >= 600 && weatherId <= 622) return 'snow';
    if (weatherId >= 701 && weatherId <= 781) return 'fog';
    if (weatherId >= 800) return 'clear';
    if (weatherId >= 801 && weatherId <= 804) return 'cloudy';
    return 'cloudy';
  }

  private static getPrecipitationChance(current: any): number {
    // Simple approximation based on current weather
    return current.weather[0].main === 'Rain' ? 80 : 20;
  }

  /**
   * Get real alerts (OpenWeatherMap doesn't have a free alert API, so we'll generate based on conditions)
   */
  private static async getRealAlerts(
    latitude: number,
    longitude: number,
    startDate: Date,
    endDate: Date
  ): Promise<WeatherAlert[]> {
    // OpenWeatherMap doesn't provide free alerts API,
    // so we'll fetch current conditions and generate alerts
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${this.OPENWEATHER_API_KEY}&units=metric`
      );
      const data = await response.json();
      const alerts: WeatherAlert[] = [];

      // Generate alerts based on current conditions
      if (data.weather[0].main === 'Rain' || data.weather[0].main === 'Thunderstorm') {
        alerts.push({
          id: `weather_alert_${Date.now()}`,
          title: 'Rain Alert',
          description: 'Rain expected during your travel period',
          severity: 'medium',
          affectedArea: 'activities',
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
          action: 'Prepare indoor alternatives and adjust outdoor activity schedule',
        });
      }

      if (data.wind.speed > 15) {
        alerts.push({
          id: `wind_alert_${Date.now()}`,
          title: 'Wind Advisory',
          description: 'Strong winds expected, may affect outdoor activities',
          severity: 'low',
          affectedArea: 'route',
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
          action: 'Consider covered transportation options',
        });
      }

      if (data.main.temp > 35) {
        alerts.push({
          id: `heat_alert_${Date.now()}`,
          title: 'Heat Advisory',
          description: 'Extreme heat expected, stay hydrated',
          severity: 'high',
          affectedArea: 'activities',
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
          action: 'Plan indoor activities during peak heat hours, carry water',
        });
      }

      return alerts;
    } catch (error) {
      console.error('Error fetching real alerts:', error);
      return this.getMockAlerts(latitude, longitude, startDate, endDate);
    }
  }

  // Keep all the existing mock methods private since they're now fallback
  private static getMockWeather(
    lat: number,
    lng: number,
    startDate: Date,
    endDate: Date
  ): WeatherData {
    // Original mock implementation...
    const month = startDate.getMonth();
    let avgTemp: number;
    let primaryCondition: WeatherData['condition'];
    let humidity: number;
    let windSpeed: number;
    let precipChance: number;

    // Mock weather based on location and season (simplified)
    if (Math.random() > 0.5) {
      avgTemp = 25;
      primaryCondition = 'clear';
      humidity = 60;
      windSpeed = 10;
      precipChance = 30;
    } else {
      avgTemp = 15;
      primaryCondition = 'cloudy';
      humidity = 70;
      windSpeed = 8;
      precipChance = 40;
    }

    // Generate forecast array (7 days)
    const forecasts: WeatherForecast[] = [];
    for (let i = 0; i < 7; i++) {
      const forecastDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      forecasts.push({
        time: forecastDate.toISOString().split('T')[0],
        temperature: Math.round(avgTemp + (Math.random() - 0.5) * 8),
        condition: primaryCondition,
        precipitation: Math.round(precipChance / 7 * 10) / 10,
      });
    }

    return {
      temperature: avgTemp,
      condition: primaryCondition,
      humidity,
      windSpeed,
      'precipitation chance': precipChance,
      forecast: forecasts,
    };
  }

  private static getMockAlerts(
    lat: number,
    lng: number,
    startDate: Date,
    endDate: Date
  ): WeatherAlert[] {
    const alerts: WeatherAlert[] = [];
    if (Math.random() > 0.6) {
      const severity = 'medium';
      alerts.push({
        id: `weather_alert_${Date.now()}`,
        title: 'Weather Advisory',
        description: `Weather conditions expected during your trip`,
        severity,
        affectedArea: 'activities',
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        action: 'Prepare indoor alternatives and adjust outdoor activity schedule',
      });
    }
    return alerts;
  }

  private static generateDailyPlans(
    forecasts: WeatherForecast[],
    startDate: Date,
    endDate: Date
  ): DailyWeatherPlan[] {
    // Original mock implementation...
    const plans: DailyWeatherPlan[] = [];
    const numDays = forecasts.length;

    for (let i = 0; i < numDays; i++) {
      const forecast = forecasts[i];
      const dayDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dayNumber = i + 1;

      let adjustedActivities: string[] = [];
      let suggestions: string[] = [];

      switch (forecast.condition) {
        case 'rain':
          adjustedActivities = ['Outdoor walking tour', 'Beach visit'];
          suggestions = ['Visit indoor museums and galleries', 'Explore covered markets'];
          break;
        case 'snow':
          adjustedActivities = ['Outdoor sightseeing', 'Walking tours'];
          suggestions = ['Visit indoor attractions', 'Enjoy thermal baths'];
          break;
        case 'storm':
          adjustedActivities = ['All outdoor activities'];
          suggestions = ['Stay indoors during peak storm hours'];
          break;
        case 'fog':
          adjustedActivities = ['River cruise', 'Outdoor photography'];
          suggestions = ['Visit indoor viewpoints'];
          break;
        case 'clear':
        default:
          adjustedActivities = [];
          suggestions = ['Perfect for outdoor activities and sightseeing'];
          break;
      }

      plans.push({
        day: dayNumber,
        date: dayDate.toISOString().split('T')[0],
        forecast,
        adjustedActivities,
        suggestions,
      });
    }

    return plans;
  }

  private static generateRecommendations(
    weatherData: WeatherData,
    alerts: WeatherAlert[],
    dailyPlans: DailyWeatherPlan[]
  ): WeatherRecommendation[] {
    // Original mock implementation...
    const recommendations: WeatherRecommendation[] = [];

    if (weatherData.temperature > 30) {
      recommendations.push({
        type: 'clothing',
        title: 'Hot Weather Clothing',
        description: 'Pack light, breathable clothing and sun protection',
        priority: 'high',
      });
    } else if (weatherData.temperature < 10) {
      recommendations.push({
        type: 'clothing',
        title: 'Cold Weather Clothing',
        description: 'Pack warm layers, jacket, and appropriate footwear',
        priority: 'high',
      });
    }

    if (weatherData['precipitation chance'] > 50) {
      recommendations.push({
        type: 'activity',
        title: 'Rain-Ready Itinerary',
        description: 'Plan indoor alternatives for outdoor activities',
        priority: 'medium',
      });
    }

    if (weatherData.condition === 'rain') {
      recommendations.push({
        type: 'attraction',
        title: 'Rain-Proof Attractions',
        description: 'Focus on museums, galleries, and indoor cultural sites',
        priority: 'medium',
      });
    }

    alerts.forEach((alert) => {
      recommendations.push({
        type: 'activity',
        title: alert.title,
        description: alert.description,
        priority: alert.severity === 'critical' ? 'high' : alert.severity,
      });
    });

    if (weatherData.windSpeed > 15) {
      recommendations.push({
        type: 'transportation',
        title: 'Wind Conditions',
        description: 'Consider covered transportation options',
        priority: 'low',
      });
    }

    return recommendations;
  }
}

/**
 * Hook-style helper for use in React components
 */
export function useWeatherForTrip(
  tripId: string,
  destination: string,
  dates: { start: string; end: string }
) {
  const [weatherPlan, setWeatherPlan] = useState<TripWeatherPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWeatherPlan = async () => {
      try {
        const plan = await WeatherService.generateWeatherPlan(
          tripId,
          destination,
          dates
        );
        setWeatherPlan(plan);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load weather data');
        setIsLoading(false);
        console.error('Error loading weather plan:', err);
      }
    };

    loadWeatherPlan();
  }, [tripId, destination, dates]);

  return { weatherPlan, isLoading, error };
}

export default WeatherService;