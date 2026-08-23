const PRECIPITATION_TYPES = ['Rain', 'Drizzle', 'Thunderstorm', 'Snow']

export const convertTemperature = (temperature, unit, roundCelsius = false) =>
  unit === 'fahrenheit' ? Math.round((temperature * 9) / 5 + 32) : roundCelsius ? Math.round(temperature) : temperature

export const getLocationDate = (timestamp, timezoneOffset = 0) => new Date((timestamp + timezoneOffset) * 1000)

export const formatForecastHour = (timestamp, timezoneOffset = 0) =>
  `${String(getLocationDate(timestamp, timezoneOffset).getUTCHours()).padStart(2, '0')}시`

export const formatForecastDate = (timestamp, timezoneOffset = 0) => {
  const date = getLocationDate(timestamp, timezoneOffset)
  return `${date.getUTCMonth() + 1}/${date.getUTCDate()}`
}

export const formatForecastTime = (timestamp, timezoneOffset = 0) => {
  const date = getLocationDate(timestamp, timezoneOffset)
  const weekday = new Intl.DateTimeFormat('ko-KR', {
    weekday: 'short',
    timeZone: 'UTC',
  }).format(date)
  const hour = date.getUTCHours()
  const period = hour < 12 ? '오전' : '오후'
  const displayHour = hour % 12 || 12

  return `${weekday}요일 ${period} ${displayHour}시`
}

export const hasCurrentPrecipitation = (weatherData) =>
  Boolean(weatherData.rain || weatherData.snow) || PRECIPITATION_TYPES.includes(weatherData.weather?.[0]?.main)

export const forecastIsWet = (forecast, probabilityThreshold = 0.5) =>
  (forecast.pop ?? 0) >= probabilityThreshold || Boolean(forecast.rain || forecast.snow) || PRECIPITATION_TYPES.includes(forecast.weather?.[0]?.main)
