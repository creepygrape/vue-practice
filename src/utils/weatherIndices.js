import { forecastIsWet, formatForecastTime } from '@/utils/weather'

const clampScore = (value) => Math.min(Math.max(Math.round(value), 0), 100)

const maxPrecipitationProbability = (forecasts, count) => Math.max(0, ...forecasts.slice(0, count).map((forecast) => (forecast.pop ?? 0) * 100))

const findNextRainForecast = (forecasts) => forecasts.find((forecast) => forecastIsWet(forecast)) ?? null

export const calculateLaundryIndex = ({ currentWeather, forecasts, timezoneOffset, now = Date.now() }) => {
  if (!currentWeather) return null

  const { temp, humidity, wind, isPrecipitating } = currentWeather
  const pop12 = maxPrecipitationProbability(forecasts, 4)
  const nextRainForecast = findNextRainForecast(forecasts)
  let score = 100
  score -= pop12 * 0.55
  score -= Math.max(humidity - 45, 0) * 0.65
  score -= temp < 10 ? (10 - temp) * 2 : 0
  score -= wind < 1 ? 10 : 0
  score -= wind > 8 ? Math.min((wind - 8) * 4, 20) : 0
  if (isPrecipitating) score -= 70

  let dryingHours = 4
  dryingHours += Math.max(humidity - 50, 0) / 18
  dryingHours += temp < 15 ? (15 - temp) / 8 : 0
  dryingHours -= temp > 25 ? Math.min((temp - 25) / 10, 1) : 0
  dryingHours -= wind >= 2 && wind <= 7 ? 0.8 : 0
  dryingHours = Math.min(Math.max(dryingHours, 2), 8)

  const dryAt = now + dryingHours * 60 * 60 * 1000
  const rainAt = nextRainForecast?.dt ? nextRainForecast.dt * 1000 : null
  const collectionAt = rainAt && rainAt < dryAt ? rainAt - 30 * 60 * 1000 : dryAt
  const roundedScore = clampScore(score)

  return {
    score: roundedScore,
    grade: roundedScore >= 75 ? '좋음' : roundedScore >= 50 ? '주의' : '비추천',
    tagType: roundedScore >= 75 ? 'success' : roundedScore >= 50 ? 'warning' : 'danger',
    dryingText: isPrecipitating ? '현재 강수로 건조시간 계산이 어렵습니다.' : `약 ${Math.ceil(dryingHours)}시간 후 건조 예상`,
    recommendation: isPrecipitating
      ? '지금은 실내 건조를 추천해요.'
      : rainAt && rainAt < dryAt
        ? '건조 전에 비가 올 수 있어 실내 건조를 추천해요.'
        : roundedScore >= 75
          ? '지금 빨래하기 좋아요!'
          : '날씨 변화를 확인하고 빨래하세요.',
    timing: isPrecipitating
      ? '비가 그친 뒤 다시 확인해 주세요.'
      : `${formatForecastTime(Math.floor(collectionAt / 1000), timezoneOffset)} 이전에 걷어주세요.`,
  }
}

export const calculateOutingIndex = ({ currentWeather, forecasts, airPollution }) => {
  if (!currentWeather) return null

  const { feelsLike, humidity, wind, isPrecipitating } = currentWeather
  const reasons = []
  const heatDiscomfort = feelsLike > 28 ? Math.min((feelsLike - 28) * 5, 35) : feelsLike < 5 ? Math.min((5 - feelsLike) * 4, 35) : 0
  const humidityDiscomfort = humidity > 65 ? Math.min((humidity - 65) * 0.8, 25) : 0
  const rainDiscomfort = isPrecipitating ? 30 : maxPrecipitationProbability(forecasts, 2) * 0.2
  const windDiscomfort = wind > 7 ? Math.min((wind - 7) * 4, 20) : 0
  const airDiscomfort = airPollution ? (airPollution.aqi - 1) * 7.5 : 0

  if (heatDiscomfort >= 10) {
    reasons.push({
      label: feelsLike > 28 ? '높은 체감온도' : '낮은 체감온도',
      value: heatDiscomfort,
    })
  }
  if (humidityDiscomfort >= 8) {
    reasons.push({ label: '높은 습도', value: humidityDiscomfort })
  }
  if (rainDiscomfort >= 10) {
    reasons.push({
      label: isPrecipitating ? '현재 강수' : '높은 강수 가능성',
      value: rainDiscomfort,
    })
  }
  if (windDiscomfort >= 8) reasons.push({ label: '강한 바람', value: windDiscomfort })
  if (airDiscomfort >= 8) reasons.push({ label: '나쁜 대기질', value: airDiscomfort })

  const score = clampScore(heatDiscomfort + humidityDiscomfort + rainDiscomfort + windDiscomfort + airDiscomfort)
  const mainReasons = reasons
    .sort((a, b) => b.value - a.value)
    .slice(0, 2)
    .map((reason) => reason.label)

  return {
    score,
    grade: score < 25 ? '낮음' : score < 50 ? '보통' : score < 75 ? '높음' : '매우 높음',
    tagType: score < 25 ? 'success' : score < 50 ? 'info' : score < 75 ? 'warning' : 'danger',
    recommendation:
      score < 25
        ? '외출하기 좋은 날이에요.'
        : score < 50
          ? '대체로 무난한 외출 날씨예요.'
          : score < 75
            ? '외출 전 준비가 필요해요.'
            : '오늘 외출은 다시 생각해 보세요.',
    reasonText: mainReasons.length ? `${mainReasons.join('과 ')}이(가) 주요 원인이에요.` : '큰 불편 요인이 없어요.',
  }
}

const findCarWashTime = (forecasts) => {
  for (let index = 0; index < forecasts.length; index += 1) {
    const candidate = forecasts[index]
    const following48Hours = forecasts.slice(index, index + 17)
    if (following48Hours.length < 17) break

    const isDryWindow = following48Hours.every((item) => !forecastIsWet(item) && (item.pop ?? 0) < 0.3)
    const isSafeTemperature = candidate.main.temp > 2
    const isNotWindy = candidate.wind.speed < 8
    if (isDryWindow && isSafeTemperature && isNotWindy) return candidate
  }

  return null
}

export const calculateCarWashIndex = ({ currentWeather, forecasts, airPollution, timezoneOffset }) => {
  if (!currentWeather) return null

  const { temp, wind, isPrecipitating } = currentWeather
  const pop24 = maxPrecipitationProbability(forecasts, 9)
  const pop48 = maxPrecipitationProbability(forecasts, 17)
  const dustPenalty = airPollution ? Math.min((airPollution.pm10 / 200) * 25, 25) : 0
  const nextRainForecast = findNextRainForecast(forecasts)
  let score = 100 - pop24 * 0.65 - pop48 * 0.2 - dustPenalty
  if (isPrecipitating) score -= 60
  if (temp <= 2) score -= 25
  if (wind > 8) score -= Math.min((wind - 8) * 4, 20)

  const roundedScore = clampScore(score)
  const recommendedTime = findCarWashTime(forecasts)
  const rainRisk = nextRainForecast
    ? `${formatForecastTime(nextRainForecast.dt, timezoneOffset)} 비가 예상돼요.`
    : '현재 5일 예보에는 뚜렷한 비 소식이 없어요.'

  return {
    score: roundedScore,
    grade: roundedScore >= 75 ? '좋음' : roundedScore >= 50 ? '주의' : '비추천',
    tagType: roundedScore >= 75 ? 'success' : roundedScore >= 50 ? 'warning' : 'danger',
    recommendation: isPrecipitating
      ? '현재 비가 와서 세차를 추천하지 않아요.'
      : roundedScore >= 75
        ? '지금 세차하기 좋아요!'
        : roundedScore >= 50
          ? '강수 예보를 확인한 뒤 세차하세요.'
          : '오늘 세차는 추천하지 않아요.',
    rainRisk,
    timing: recommendedTime ? `${formatForecastTime(recommendedTime.dt, timezoneOffset)} 세차를 추천해요.` : '5일 이내 뚜렷한 추천 시점이 없습니다.',
  }
}
