import axios from 'axios'
import { hasCurrentPrecipitation } from '@/utils/weather'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const CURRENT_WEATHER_URL = import.meta.env.VITE_OPENWEATHER_BASE_URL
const FORECAST_URL = import.meta.env.VITE_OPENWEATHER_FORECAST_URL || 'https://api.openweathermap.org/data/2.5/forecast'
const AIR_POLLUTION_URL = import.meta.env.VITE_OPENWEATHER_AIR_POLLUTION_URL || 'https://api.openweathermap.org/data/2.5/air_pollution'

export const WEATHER_API_MESSAGES = {
  current: '현재 날씨 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
  partial: '일부 지역의 날씨를 갱신하지 못했습니다.',
  forecast: '시간별·5일 예보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
  airPollution: '대기질·미세먼지 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
}

const coordinateParams = ({ lat, lon, id }) => (lat !== undefined && lon !== undefined ? { lat, lon } : { id })

export const fetchCurrentWeather = async (location) => {
  const { data } = await axios.get(CURRENT_WEATHER_URL, {
    params: {
      ...coordinateParams(location),
      appid: API_KEY,
      units: 'metric',
      lang: 'kr',
    },
  })

  return {
    weatherId: String(data.id),
    apiName: data.name,
    temp: data.main.temp,
    status: data.weather[0].description,
    humidity: data.main.humidity,
    wind: data.wind.speed,
    feelsLike: data.main.feels_like,
    weatherMain: data.weather[0].main,
    isPrecipitating: hasCurrentPrecipitation(data),
  }
}

export const fetchWeatherForecast = async ({ lat, lon }) => {
  const { data } = await axios.get(FORECAST_URL, {
    params: { lat, lon, appid: API_KEY, units: 'metric', lang: 'kr' },
  })

  return {
    forecasts: data.list,
    timezoneOffset: data.city.timezone,
  }
}

export const fetchAirPollution = async ({ lat, lon }) => {
  const { data } = await axios.get(AIR_POLLUTION_URL, {
    params: { lat, lon, appid: API_KEY },
  })
  const result = data.list[0]

  return {
    aqi: result.main.aqi,
    pm25: Math.round(result.components.pm2_5 * 10) / 10,
    pm10: Math.round(result.components.pm10 * 10) / 10,
  }
}
