'use client';

import React, { useState, useEffect } from 'react';
import {
  CloudIcon,
  SunIcon,
  CloudSunIcon,
  CircleChevronRightIcon,
  CloudRainIcon,
} from 'lucide-react';
import _ from 'lodash';
import Image from 'next/image';

interface CurrentWeatherData {
  current: {
    temp: number;
    weather: [
      {
        main: string;
        description: string;
      }
    ];
    humidity: number;
    wind_speed: number;
  };
}

interface ForecastItem {
  dt: number;
  dt_txt: string;
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
  };
  weather: [
    {
      main: string;
      description: string;
      icon: string;
    }
  ];
  wind: {
    speed: number;
  };
}

interface ForecastData {
  list: ForecastItem[];
}

const WeatherDashboard = () => {
  const [city, setCity] = useState('');
  const [currentWeather, setCurrentWeather] = useState<any | null>(null);
  const [forecast, setForecast] = useState<any | null>(null);
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch weather data whenever `units` or `city` changes
  useEffect(() => {
    if (city) {
      fetchWeatherData();
    }
  }, [units]); // Add `units` and `city` as dependencies

  const fetchWeatherData = async () => {
    if (!city) return;
    setLoading(true);
    setError('');

    try {
      // Fetch current weather
      const currentResponse = await fetch(
        `/api/weather/current?city=${city}&units=${units}`
      );
      if (!currentResponse.ok) {
        setError('City not found');
        throw new Error('City not found');
      }
      const currentData = await currentResponse.json();
      setCurrentWeather(currentData);

      // Fetch forecast
      const forecastResponse = await fetch(
        `/api/weather/forecast?city=${city}&units=${units}`
      );
      if (!forecastResponse.ok) throw new Error('Failed to fetch forecast');
      const forecastData = await forecastResponse.json();
      setForecast(forecastData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch weather data'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle city input submission
  const handleCitySubmit = () => {
    if (city) {
      fetchWeatherData();
    }
  };

  // Update the unit buttons to only set the state
  const handleUnitChange = (newUnits: 'metric' | 'imperial') => {
    setUnits(newUnits);
    // No need to call fetchWeatherData here; useEffect will handle it
  };

  // Helper function to get unique dates from forecast data
  const getNextThreeDaysForecasts = (forecastList: ForecastItem[]) => {
    const groupedByDay = new Map<string, ForecastItem[]>();
    const today = new Date().toDateString();

    // Group forecasts by day
    forecastList &&
      forecastList.forEach((item) => {
        const date = new Date(item.dt * 1000).toDateString();
        if (date !== today) {
          if (!groupedByDay.has(date)) {
            groupedByDay.set(date, []);
          }
          groupedByDay.get(date)?.push(item);
        }
      });

    // Calculate min and max temperatures for each day
    const dailyForecasts = Array.from(groupedByDay.entries())
      .map(([date, forecasts]) => {
        const minTemp = Math.min(...forecasts.map((f) => f.main.temp_min));
        const maxTemp = Math.max(...forecasts.map((f) => f.main.temp_max));
        const firstForecast = forecasts[0]; // Use the first forecast for other details like weather description

        return {
          dt: firstForecast.dt,
          dt_txt: firstForecast.dt_txt,
          main: {
            temp_min: minTemp,
            temp_max: maxTemp,
            humidity: firstForecast.main.humidity,
          },
          weather: firstForecast.weather,
          wind: firstForecast.wind,
        };
      })
      .slice(0, 3); // Take the first 3 days

    return dailyForecasts;
  };

  const getWeatherIcon = (condition: string) => {
    return condition.toLowerCase().includes('clear') ? (
      <SunIcon className="w-16 h-16" />
    ) : condition.toLowerCase().includes('few') ? (
      <CloudSunIcon className="w-16 h-16" />
    ) : condition.toLowerCase().includes('rain') ? (
      <CloudRainIcon className="w-16 h-16" />
    ) : (
      <CloudIcon className="w-16 h-16" />
    );
  };

  // Format date to display day name
  const formatDay = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      weekday: 'short',
    });
  };

  // Util function for getting the general wind direction in deg
  const getWindDirection = (degrees: number): string => {
    if (degrees >= 337.5 || degrees < 22.5) return 'N';
    if (degrees >= 22.5 && degrees < 67.5) return 'NE';
    if (degrees >= 67.5 && degrees < 112.5) return 'E';
    if (degrees >= 112.5 && degrees < 157.5) return 'SE';
    if (degrees >= 157.5 && degrees < 202.5) return 'S';
    if (degrees >= 202.5 && degrees < 247.5) return 'SW';
    if (degrees >= 247.5 && degrees < 292.5) return 'W';
    if (degrees >= 292.5 && degrees < 337.5) return 'NW';
    return 'N/A'; // Fallback for invalid degrees
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto flex gap-6">
        {/* Left Column - Current Weather */}
        {loading ? (
          <div className="w-1/5 bg-white rounded-lg shadow-lg p-6 min-h-[90vh] skeleton" />
        ) : (
          <div className="w-1/5 bg-white rounded-lg shadow-lg p-6 min-h-[90vh]">
            {currentWeather && currentWeather.cod !== '404' ? (
              <div className="flex flex-col h-full justify-evenly items-center">
                <div className="text-center text-2xl font-medium">Today</div>
                {getWeatherIcon(
                  _.get(currentWeather, `weather.0.description`, 'no data')
                )}
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">
                    {Math.round(_.get(currentWeather, `main.temp`, 0))}°
                    {units === 'metric' ? 'C' : 'F'}
                  </div>
                  <div className="text-xl mb-4">
                    {_.get(currentWeather, `weather.0.description`, 'no data')}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>

                {_.get(currentWeather, `name`) && (
                  <div className="text-center">
                    <div className="text-2xl font-semibold mb-2">
                      {_.get(currentWeather, `name`, 'no data')},{' '}
                      {_.get(currentWeather, `sys.country`)}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col flex-1 items-center justify-center min-h-full">
                <Image
                  src="/no-data-sunny-cloud.png"
                  alt="No data"
                  width={400}
                  height={400}
                  className="mx-auto"
                />
              </div>
            )}
          </div>
        )}

        {/* Right Column - Search, Forecast, and Details */}
        <div className="w-4/5 space-y-8 flex flex-col">
          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow p-4 flex gap-4">
            <input
              type="text"
              placeholder="Search city..."
              className="flex-1 p-2 border rounded-lg"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCitySubmit()}
            />
            <button
              onClick={handleCitySubmit}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              GO
            </button>
            <div className="btn-group btn-group-scrollable">
              <button
                onClick={() => handleUnitChange('metric')}
                className={`px-3 py-1 rounded ${
                  units === 'metric'
                    ? 'btn btn-error btn-sm'
                    : 'bg-gray-200 btn-sm'
                }`}
              >
                °C
              </button>
              <button
                onClick={() => handleUnitChange('imperial')}
                className={`px-3 py-1 rounded ${
                  units === 'imperial'
                    ? 'btn btn-error btn-sm'
                    : 'bg-gray-200 btn-sm'
                }`}
              >
                °F
              </button>
            </div>
          </div>

          {loading && <div className="text-center">Loading...</div>}
          {error && <div className="text-red-500 text-center">{error}</div>}

          {forecast && !loading && forecast.cod !== '404' ? (
            <>
              {/* 3-Day Forecast */}
              <div className="grid grid-cols-3 gap-4 flex-1">
                {getNextThreeDaysForecasts(forecast.list).map((day) => (
                  <div
                    key={day.dt}
                    className="bg-white rounded-lg shadow p-4 text-center flex flex-col justify-between items-center"
                  >
                    <div className="text-gray-600 font-medium">
                      {formatDay(day.dt)}
                    </div>
                    {getWeatherIcon(
                      _.get(day, `weather.0.description`, 'no data')
                    )}
                    <div className="mt-2 font-bold">
                      {Math.round(day.main.temp_min)}°
                      {units === 'metric' ? 'C' : 'F'} -{' '}
                      {Math.round(day.main.temp_max)}°
                      {units === 'metric' ? 'C' : 'F'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {_.get(day, `weather.0.description`, 'no data')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Weather Details */}
              <div className="grid grid-cols-2 gap-4 flex-1 ">
                <div className="bg-white rounded-lg shadow p-4 flex flex-col justify-around items-center">
                  <h3 className="text-lg font-semibold mb-2">Wind Status</h3>
                  <div className="text-3xl font-bold">
                    {units === 'metric'
                      ? Math.round(_.get(currentWeather, `wind.speed`) ?? 0) *
                        3.6
                      : Math.round(
                          _.get(currentWeather, `wind.speed`) ?? 0
                        )}{' '}
                    {units === 'metric' ? 'km/h' : 'mph'}
                  </div>
                  <div className="text-xl font-medium mt-1 flex flex-row">
                    <CircleChevronRightIcon className="w-7 h-7 mr-2" />
                    {`${_.get(
                      currentWeather,
                      `wind.deg`,
                      0
                    )}° ${getWindDirection(
                      _.get(currentWeather, `wind.deg`, 0)
                    )}`}
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 flex flex-col justify-around items-center">
                  <h3 className="text-lg font-semibold mb-2">Humidity</h3>
                  <div className="text-3xl font-bold mb-2">
                    {_.get(currentWeather, `main.humidity`) ?? 0}%
                  </div>
                  <progress
                    className="progress w-full"
                    value={_.get(currentWeather, `main.humidity`) ?? 0}
                    max="100"
                  ></progress>
                </div>
              </div>
            </>
          ) : loading ? (
            <>
              <div className="grid grid-cols-3 gap-4 flex-1">
                <div className="bg-white rounded-lg shadow skeleton h-60"></div>
                <div className="bg-white rounded-lg shadow skeleton h-60"></div>
                <div className="bg-white rounded-lg shadow skeleton h-60"></div>
              </div>
              <div className="grid grid-cols-2 gap-4 flex-1 ">
                <div className="bg-white rounded-lg shadow skeleton h-60"></div>
                <div className="bg-white rounded-lg shadow skeleton h-60"></div>
              </div>
            </>
          ) : (
            <div className="flex flex-col flex-1 items-center space-y-5">
              <div className="text-center text-2xl font-medium">
                Search a place above to get the weather forecast 🔎
              </div>
              <Image
                src="/no-data-illustration.jpg"
                alt="No data"
                width={400}
                height={400}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherDashboard;
