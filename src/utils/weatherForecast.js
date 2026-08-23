import { convertTemperature, formatForecastDate, formatForecastHour } from '@/utils/weather'

export const FORECAST_CHART = {
  width: 720,
  height: 220,
  padding: { top: 24, right: 32, bottom: 44, left: 44 },
}

export const buildTemperatureChart = (forecasts, timezoneOffset, temperatureUnit) => {
  const hourlyForecasts = forecasts.slice(0, 8)
  const values = hourlyForecasts.map((item) => convertTemperature(item.main.temp, temperatureUnit, true))
  if (!values.length) return { points: '', items: [], guides: [] }

  const min = Math.min(...values)
  const max = Math.max(...values)
  const chartMin = min - 1
  const chartMax = max + 1
  const { width, height, padding } = FORECAST_CHART
  const innerWidth = width - padding.left - padding.right
  const innerHeight = height - padding.top - padding.bottom
  const getX = (index) => padding.left + (innerWidth * index) / Math.max(values.length - 1, 1)
  const getY = (value) => padding.top + ((chartMax - value) / (chartMax - chartMin)) * innerHeight
  const items = hourlyForecasts.map((item, index) => ({
    x: getX(index),
    y: getY(values[index]),
    temp: values[index],
    time: formatForecastHour(item.dt, timezoneOffset),
    description: item.weather[0].description,
  }))
  const guides = [chartMin, (chartMin + chartMax) / 2, chartMax].map((value) => ({
    value: Math.round(value),
    y: getY(value),
  }))

  return {
    points: items.map((item) => `${item.x},${item.y}`).join(' '),
    items,
    guides,
  }
}

export const buildDailyForecasts = (forecasts, timezoneOffset, temperatureUnit) => {
  const grouped = new Map()

  forecasts.forEach((item) => {
    const date = formatForecastDate(item.dt, timezoneOffset)
    const current = grouped.get(date) ?? {
      date,
      temps: [],
      icons: [],
      descriptions: [],
    }
    current.temps.push(item.main.temp)
    current.icons.push(item.weather[0].icon)
    current.descriptions.push(item.weather[0].description)
    grouped.set(date, current)
  })

  return [...grouped.values()].slice(0, 5).map((day) => {
    const iconIndex = Math.floor(day.icons.length / 2)
    return {
      date: day.date,
      min: convertTemperature(Math.min(...day.temps), temperatureUnit, true),
      max: convertTemperature(Math.max(...day.temps), temperatureUnit, true),
      icon: day.icons[iconIndex],
      description: day.descriptions[iconIndex],
    }
  })
}

export const buildFiveDayPrecipitation = (forecasts, timezoneOffset) => {
  const groups = []

  for (let index = 0; index < forecasts.length; index += 8) {
    const forecastGroup = forecasts.slice(index, index + 8)
    if (!forecastGroup.length) continue

    const items = forecastGroup.map((item) => ({
      dt: item.dt,
      time: formatForecastHour(item.dt, timezoneOffset),
      probability: Math.round((item.pop ?? 0) * 100),
      amount: Math.round(((item.rain?.['3h'] ?? item.snow?.['3h'] ?? 0) + Number.EPSILON) * 10) / 10,
      precipitationType: item.snow?.['3h'] ? '눈' : item.rain?.['3h'] ? '비' : '',
      icon: item.weather[0].icon,
      description: item.weather[0].description,
    }))

    groups.push({
      label: `${formatForecastDate(items[0].dt, timezoneOffset)} ${items[0].time}부터 ${items.length * 3}시간`,
      items,
      hasPrecipitation: items.some((item) => item.amount > 0 || item.probability > 0),
    })
  }

  return groups.slice(0, 5)
}

export const getDailyTemperatureScale = (dailyForecasts) => {
  if (!dailyForecasts.length) return { min: 0, range: 1 }

  const min = Math.min(...dailyForecasts.map((day) => day.min))
  const max = Math.max(...dailyForecasts.map((day) => day.max))
  return { min, range: Math.max(max - min, 1) }
}

export const getTemperatureRangeStyle = (day, scale) => ({
  left: `${((day.min - scale.min) / scale.range) * 100}%`,
  width: `${Math.max(((day.max - day.min) / scale.range) * 100, 2)}%`,
})
