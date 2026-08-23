<script setup>
import { computed } from 'vue'

const props = defineProps({
  airPollution: { type: Object, default: null },
  compact: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
})

const AQI_LEVELS = {
  1: { label: '좋음', type: 'success' },
  2: { label: '양호', type: 'info' },
  3: { label: '보통', type: 'warning' },
  4: { label: '나쁨', type: 'danger' },
  5: { label: '매우 나쁨', type: 'danger' },
}

const aqiInfo = computed(() => AQI_LEVELS[props.airPollution?.aqi] ?? { label: '알 수 없음', type: 'info' })
const pm25Percentage = computed(() => Math.min(Math.round(((props.airPollution?.pm25 ?? 0) / 75) * 100), 100))
const pm10Percentage = computed(() => Math.min(Math.round(((props.airPollution?.pm10 ?? 0) / 200) * 100), 100))

const progressColor = (percentage) => {
  if (percentage < 34) return '#67c23a'
  if (percentage < 67) return '#e6a23c'
  return '#f56c6c'
}
</script>

<template>
  <div v-if="props.compact" class="air-compact">
    <template v-if="props.airPollution">
      <div class="air-title">
        <span>대기질</span>
        <el-tag :type="aqiInfo.type" size="small">{{ aqiInfo.label }}</el-tag>
      </div>
      <p>
        미세먼지 PM10: <strong>{{ props.airPollution.pm10 }}</strong>㎍/㎥
        &nbsp;|&nbsp; 초미세먼지 PM2.5: <strong>{{ props.airPollution.pm25 }}</strong>㎍/㎥
      </p>
    </template>
    <p v-else class="air-unavailable">미세먼지 정보 없음</p>
  </div>

  <section v-else class="air-detail" aria-labelledby="air-pollution-title">
    <h3 id="air-pollution-title">대기질·미세먼지</h3>
    <div v-if="props.isLoading" v-loading="true" class="air-loading">대기질 정보를 불러오는 중입니다.</div>
    <el-alert v-else-if="props.errorMessage" :title="props.errorMessage" type="error" :closable="false" show-icon />
    <template v-else-if="props.airPollution">
      <div class="air-summary">
        <span>OpenWeather 대기질 지수</span>
        <el-tooltip content="OpenWeather AQI 기준이며 국내 환경부 기준과 구간이 다를 수 있습니다.">
          <el-tag :type="aqiInfo.type">{{ props.airPollution.aqi }}단계 · {{ aqiInfo.label }}</el-tag>
        </el-tooltip>
      </div>
      <div class="pollutant-list">
        <div class="pollutant-item">
          <div class="pollutant-heading">
            <el-tooltip content="PM2.5: 지름 2.5㎛ 이하의 초미세먼지 농도">
              <strong>초미세먼지 PM2.5</strong>
            </el-tooltip>
            <span>{{ props.airPollution.pm25 }}㎍/㎥</span>
          </div>
          <el-progress
            :percentage="pm25Percentage"
            :color="progressColor(pm25Percentage)"
            :show-text="false"
          />
        </div>
        <div class="pollutant-item">
          <div class="pollutant-heading">
            <el-tooltip content="PM10: 지름 10㎛ 이하의 미세먼지 농도">
              <strong>미세먼지 PM10</strong>
            </el-tooltip>
            <span>{{ props.airPollution.pm10 }}㎍/㎥</span>
          </div>
          <el-progress
            :percentage="pm10Percentage"
            :color="progressColor(pm10Percentage)"
            :show-text="false"
          />
        </div>
      </div>
      <p class="air-reference">농도 및 등급은 OpenWeather 기준입니다.</p>
    </template>
  </section>
</template>

<style scoped>
.air-compact { margin-top: 10px; padding-top: 8px; border-top: 1px solid #ebeef5; font-size: 13px; }
.air-compact p { margin: 6px 0 0; }
.air-title, .air-summary, .pollutant-heading { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.air-unavailable, .air-reference { color: #909399; }
.air-detail { margin: 18px 0; padding: 15px; background: #f1f2f6; border-radius: 6px; }
.air-detail h3 { margin-top: 0; }
.air-loading { min-height: 100px; }
.pollutant-list { display: grid; gap: 18px; margin-top: 18px; }
.pollutant-heading { margin-bottom: 7px; }
.air-reference { margin: 12px 0 0; font-size: 12px; }
</style>
