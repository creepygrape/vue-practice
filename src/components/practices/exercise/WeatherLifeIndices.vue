<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentWeather: { type: Object, default: null },
  forecasts: { type: Array, default: () => [] },
  airPollution: { type: Object, default: null },
  timezoneOffset: { type: Number, default: 0 },
})

const clamp = (value) => Math.min(Math.max(Math.round(value), 0), 100)
const forecastIsWet = (item) =>
  (item.pop ?? 0) >= 0.5 || Boolean(item.rain || item.snow) || ['Rain', 'Drizzle', 'Thunderstorm', 'Snow'].includes(item.weather?.[0]?.main)

const localDate = (timestamp) => new Date((timestamp + props.timezoneOffset) * 1000)
const formatForecastTime = (timestamp) => {
  const date = localDate(timestamp)
  const weekday = new Intl.DateTimeFormat('ko-KR', { weekday: 'short', timeZone: 'UTC' }).format(date)
  const hour = date.getUTCHours()
  const period = hour < 12 ? '오전' : '오후'
  const displayHour = hour % 12 || 12
  return `${weekday}요일 ${period} ${displayHour}시`
}

const nextRainForecast = computed(() => props.forecasts.find(forecastIsWet) ?? null)
const maxPop = (count) => Math.max(0, ...props.forecasts.slice(0, count).map((item) => (item.pop ?? 0) * 100))

const laundryIndex = computed(() => {
  if (!props.currentWeather) return null

  const { temp, humidity, wind, isPrecipitating } = props.currentWeather
  const pop12 = maxPop(4)
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

  const now = Date.now()
  const dryAt = now + dryingHours * 60 * 60 * 1000
  const rainAt = nextRainForecast.value?.dt ? nextRainForecast.value.dt * 1000 : null
  const collectionAt = rainAt && rainAt < dryAt ? rainAt - 30 * 60 * 1000 : dryAt
  const roundedScore = clamp(score)

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
      : `${formatForecastTime(Math.floor(collectionAt / 1000))} 이전에 걷어주세요.`,
  }
})

const outingIndex = computed(() => {
  if (!props.currentWeather) return null

  const { feelsLike, humidity, wind, isPrecipitating } = props.currentWeather
  const reasons = []
  const heatDiscomfort = feelsLike > 28 ? Math.min((feelsLike - 28) * 5, 35) : feelsLike < 5 ? Math.min((5 - feelsLike) * 4, 35) : 0
  const humidityDiscomfort = humidity > 65 ? Math.min((humidity - 65) * 0.8, 25) : 0
  const rainDiscomfort = isPrecipitating ? 30 : maxPop(2) * 0.2
  const windDiscomfort = wind > 7 ? Math.min((wind - 7) * 4, 20) : 0
  const airDiscomfort = props.airPollution ? (props.airPollution.aqi - 1) * 7.5 : 0

  if (heatDiscomfort >= 10) reasons.push({ label: feelsLike > 28 ? '높은 체감온도' : '낮은 체감온도', value: heatDiscomfort })
  if (humidityDiscomfort >= 8) reasons.push({ label: '높은 습도', value: humidityDiscomfort })
  if (rainDiscomfort >= 10) reasons.push({ label: isPrecipitating ? '현재 강수' : '높은 강수 가능성', value: rainDiscomfort })
  if (windDiscomfort >= 8) reasons.push({ label: '강한 바람', value: windDiscomfort })
  if (airDiscomfort >= 8) reasons.push({ label: '나쁜 대기질', value: airDiscomfort })

  const score = clamp(heatDiscomfort + humidityDiscomfort + rainDiscomfort + windDiscomfort + airDiscomfort)
  const mainReasons = reasons.sort((a, b) => b.value - a.value).slice(0, 2).map((reason) => reason.label)

  return {
    score,
    grade: score < 25 ? '낮음' : score < 50 ? '보통' : score < 75 ? '높음' : '매우 높음',
    tagType: score < 25 ? 'success' : score < 50 ? 'info' : score < 75 ? 'warning' : 'danger',
    recommendation:
      score < 25 ? '외출하기 좋은 날이에요.' : score < 50 ? '대체로 무난한 외출 날씨예요.' : score < 75 ? '외출 전 준비가 필요해요.' : '오늘 외출은 다시 생각해 보세요.',
    reasonText: mainReasons.length ? `${mainReasons.join('과 ')}이(가) 주요 원인이에요.` : '큰 불편 요인이 없어요.',
  }
})

const findCarWashTime = () => {
  for (let index = 0; index < props.forecasts.length; index += 1) {
    const candidate = props.forecasts[index]
    const following48Hours = props.forecasts.slice(index, index + 17)
    if (following48Hours.length < 17) break

    const isDryWindow = following48Hours.every((item) => !forecastIsWet(item) && (item.pop ?? 0) < 0.3)
    const isSafeTemperature = candidate.main.temp > 2
    const isNotWindy = candidate.wind.speed < 8
    if (isDryWindow && isSafeTemperature && isNotWindy) return candidate
  }
  return null
}

const carWashIndex = computed(() => {
  if (!props.currentWeather) return null

  const { temp, wind, isPrecipitating } = props.currentWeather
  const pop24 = maxPop(9)
  const pop48 = maxPop(17)
  const dustPenalty = props.airPollution ? Math.min((props.airPollution.pm10 / 200) * 25, 25) : 0
  let score = 100 - pop24 * 0.65 - pop48 * 0.2 - dustPenalty
  if (isPrecipitating) score -= 60
  if (temp <= 2) score -= 25
  if (wind > 8) score -= Math.min((wind - 8) * 4, 20)

  const roundedScore = clamp(score)
  const recommendedTime = findCarWashTime()
  const rainRisk = nextRainForecast.value
    ? `${formatForecastTime(nextRainForecast.value.dt)} 비가 예상돼요.`
    : '현재 5일 예보에는 뚜렷한 비 소식이 없어요.'

  return {
    score: roundedScore,
    grade: roundedScore >= 75 ? '좋음' : roundedScore >= 50 ? '주의' : '비추천',
    tagType: roundedScore >= 75 ? 'success' : roundedScore >= 50 ? 'warning' : 'danger',
    recommendation: isPrecipitating ? '현재 비가 와서 세차를 추천하지 않아요.' : roundedScore >= 75 ? '지금 세차하기 좋아요!' : roundedScore >= 50 ? '강수 예보를 확인한 뒤 세차하세요.' : '오늘 세차는 추천하지 않아요.',
    rainRisk,
    timing: recommendedTime ? `${formatForecastTime(recommendedTime.dt)} 세차를 추천해요.` : '5일 이내 뚜렷한 추천 시점이 없습니다.',
  }
})

const progressColor = (score, inverse = false) => {
  const value = inverse ? 100 - score : score
  if (value >= 75) return '#67c23a'
  if (value >= 50) return '#e6a23c'
  return '#f56c6c'
}
</script>

<template>
  <section class="life-indices" aria-labelledby="life-indices-title">
    <h3 id="life-indices-title">생활 날씨 지수</h3>
    <el-alert v-if="!props.currentWeather" title="생활 날씨 지수를 계산할 수 없습니다." type="warning" :closable="false" />
    <div v-else class="index-grid">
      <article class="index-item">
        <div class="index-heading">
          <h4>빨래 지수</h4>
          <el-tag :type="laundryIndex.tagType">{{ laundryIndex.grade }}</el-tag>
        </div>
        <strong class="index-score">{{ laundryIndex.score }}점</strong>
        <el-progress :percentage="laundryIndex.score" :color="progressColor(laundryIndex.score)" />
        <p>{{ laundryIndex.dryingText }}</p>
        <p>{{ laundryIndex.recommendation }}</p>
        <p class="index-timing">{{ laundryIndex.timing }}</p>
      </article>

      <article class="index-item">
        <div class="index-heading">
          <h4>외출 후회 지수</h4>
          <el-tag :type="outingIndex.tagType">{{ outingIndex.grade }}</el-tag>
        </div>
        <strong class="index-score">{{ outingIndex.score }}점</strong>
        <el-progress :percentage="outingIndex.score" :color="progressColor(outingIndex.score, true)" />
        <p>{{ outingIndex.recommendation }}</p>
        <p class="index-timing">{{ outingIndex.reasonText }}</p>
      </article>

      <article class="index-item">
        <div class="index-heading">
          <h4>세차 지수</h4>
          <el-tag :type="carWashIndex.tagType">{{ carWashIndex.grade }}</el-tag>
        </div>
        <strong class="index-score">{{ carWashIndex.score }}점</strong>
        <el-progress :percentage="carWashIndex.score" :color="progressColor(carWashIndex.score)" />
        <p>{{ carWashIndex.recommendation }}</p>
        <p>{{ carWashIndex.rainRisk }}</p>
        <p class="index-timing">{{ carWashIndex.timing }}</p>
      </article>
    </div>
    <p class="index-reference">이 지수는 OpenWeather 데이터를 이용해 앱에서 계산한 참고용 정보이며 공식 생활기상지수가 아닙니다.</p>
  </section>
</template>

<style scoped>
.life-indices { margin: 18px 0; }
.index-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.index-item { padding: 15px; background: #f1f2f6; border-radius: 6px; }
.index-heading { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.index-heading h4 { margin: 0; }
.index-score { display: block; margin: 14px 0 8px; font-size: 24px; }
.index-item p { margin: 8px 0; font-size: 13px; }
.index-timing { color: #606266; }
.index-reference { color: #909399; font-size: 12px; }

@media (max-width: 760px) {
  .index-grid { grid-template-columns: 1fr; }
}
</style>
