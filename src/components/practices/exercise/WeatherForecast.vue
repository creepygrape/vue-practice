<script setup>
import { computed } from 'vue'
import { useConfigStore } from '@/stores/configStore'
import {
  buildDailyForecasts,
  buildFiveDayPrecipitation,
  buildTemperatureChart,
  FORECAST_CHART,
  getDailyTemperatureScale,
  getTemperatureRangeStyle,
} from '@/utils/weatherForecast'

const props = defineProps({
  forecasts: { type: Array, default: () => [] },
  timezoneOffset: { type: Number, default: 0 },
  isLoading: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
})

const configStore = useConfigStore()
const chartWidth = FORECAST_CHART.width
const chartHeight = FORECAST_CHART.height
const padding = FORECAST_CHART.padding

const temperatureChart = computed(() => buildTemperatureChart(props.forecasts, props.timezoneOffset, configStore.unit))
const dailyForecasts = computed(() => buildDailyForecasts(props.forecasts, props.timezoneOffset, configStore.unit))
const fiveDayPrecipitation = computed(() => buildFiveDayPrecipitation(props.forecasts, props.timezoneOffset))
const dailyScale = computed(() => getDailyTemperatureScale(dailyForecasts.value))
const rangeStyle = (day) => getTemperatureRangeStyle(day, dailyScale.value)
</script>

<template>
  <section class="forecast-section" aria-labelledby="forecast-title">
    <h3 id="forecast-title">시간별·5일 예보</h3>
    <div v-if="props.isLoading" v-loading="true" class="forecast-loading">예보를 불러오는 중입니다.</div>
    <el-alert v-else-if="props.errorMessage" :title="props.errorMessage" type="error" :closable="false" show-icon />

    <template v-else-if="props.forecasts.length">
      <div class="forecast-block">
        <h4>향후 24시간 기온</h4>
        <div class="chart-scroll">
          <svg
            class="temperature-chart"
            :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
            role="img"
            aria-label="향후 24시간 3시간 간격 기온 꺾은선 그래프"
          >
            <g v-for="guide in temperatureChart.guides" :key="guide.y">
              <line :x1="padding.left" :x2="chartWidth - padding.right" :y1="guide.y" :y2="guide.y" class="chart-grid" />
              <text :x="padding.left - 8" :y="guide.y + 4" text-anchor="end">{{ guide.value }}°</text>
            </g>
            <polyline :points="temperatureChart.points" class="temperature-line" />
            <g v-for="item in temperatureChart.items" :key="item.x">
              <el-tooltip :content="`${item.time} · ${item.temp}${configStore.unitSymbol} · ${item.description}`">
                <circle :cx="item.x" :cy="item.y" r="6" class="temperature-point" tabindex="0" />
              </el-tooltip>
              <text :x="item.x" :y="item.y - 12" text-anchor="middle">{{ item.temp }}°</text>
              <text :x="item.x" :y="chartHeight - 15" text-anchor="middle">{{ item.time }}</text>
            </g>
          </svg>
        </div>
      </div>

      <div class="forecast-block five-day-precipitation">
        <h4>5일 강수 예보</h4>
        <el-carousel :autoplay="false" arrow="always" indicator-position="outside" height="250px">
          <el-carousel-item v-for="day in fiveDayPrecipitation" :key="day.label">
            <h5>{{ day.label }}</h5>
            <div class="daily-precipitation-scroll">
              <div class="daily-precipitation-chart">
                <el-tooltip
                  v-for="item in day.items"
                  :key="item.dt"
                  :content="`${item.time} · 강수 확률 ${item.probability}% · 예상 ${item.precipitationType || '강수'}량 ${item.amount}mm`"
                >
                  <div class="daily-precipitation-column">
                    <img :src="`https://openweathermap.org/img/wn/${item.icon}.png`" :alt="item.description" />
                    <span>{{ item.probability }}%</span>
                    <div class="daily-precipitation-track">
                      <div class="daily-precipitation-bar" :style="{ height: `${item.probability}%` }"></div>
                    </div>
                    <strong>{{ item.amount }}mm</strong>
                    <small>{{ item.time }}</small>
                  </div>
                </el-tooltip>
              </div>
            </div>
            <p v-if="!day.hasPrecipitation" class="no-precipitation">이날은 예상 강수량과 강수 확률이 없습니다.</p>
          </el-carousel-item>
        </el-carousel>
      </div>

      <div class="forecast-block">
        <h4>5일 최저·최고 기온</h4>
        <div class="daily-list">
          <div v-for="day in dailyForecasts" :key="day.date" class="daily-row">
            <strong>{{ day.date }}</strong>
            <img :src="`https://openweathermap.org/img/wn/${day.icon}@2x.png`" :alt="day.description" />
            <span class="daily-description">{{ day.description }}</span>
            <span class="temp-min">{{ day.min }}°</span>
            <el-tooltip :content="`최저 ${day.min}${configStore.unitSymbol}, 최고 ${day.max}${configStore.unitSymbol}`">
              <div class="temperature-range-track">
                <div class="temperature-range" :style="rangeStyle(day)"></div>
              </div>
            </el-tooltip>
            <span class="temp-max">{{ day.max }}°</span>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
.forecast-section {
  margin-top: 24px;
}
.forecast-loading {
  min-height: 120px;
}
.forecast-block {
  margin: 18px 0 28px;
}
.forecast-block h4 {
  margin-bottom: 8px;
}
.chart-scroll {
  overflow-x: auto;
}
.temperature-chart {
  display: block;
  min-width: 720px;
  width: 100%;
  height: auto;
}
.temperature-chart text {
  fill: #606266;
  font-size: 12px;
}
.chart-grid {
  stroke: #dcdfe6;
  stroke-width: 1;
}
.temperature-line {
  fill: none;
  stroke: #409eff;
  stroke-width: 3;
  stroke-linejoin: round;
  stroke-linecap: round;
}
.temperature-point {
  fill: #fff;
  stroke: #409eff;
  stroke-width: 3;
  cursor: pointer;
}
.five-day-precipitation h5 {
  margin: 0 48px 8px;
  text-align: center;
  font-size: 15px;
}
.daily-precipitation-scroll {
  margin: 0 44px;
  overflow-x: auto;
}
.daily-precipitation-chart {
  display: grid;
  grid-template-columns: repeat(8, minmax(64px, 1fr));
  gap: 8px;
  min-width: 560px;
}
.daily-precipitation-column {
  display: grid;
  grid-template-rows: 34px 20px 78px 22px 20px;
  text-align: center;
  color: #606266;
}
.daily-precipitation-column img {
  width: 34px;
  height: 34px;
  margin: 0 auto;
}
.daily-precipitation-track {
  position: relative;
  height: 78px;
  overflow: hidden;
  background: #ecf5ff;
  border-radius: 4px 4px 0 0;
}
.daily-precipitation-bar {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  min-height: 2px;
  background: #409eff;
}
.daily-precipitation-column strong {
  color: #409eff;
  font-size: 12px;
}
.no-precipitation {
  margin: 4px 48px 0;
  color: #909399;
  text-align: center;
  font-size: 12px;
}
.daily-list {
  display: grid;
  gap: 10px;
}
.daily-row {
  display: grid;
  grid-template-columns: 48px 44px minmax(80px, 1fr) 38px minmax(120px, 2fr) 38px;
  gap: 8px;
  align-items: center;
}
.daily-row img {
  width: 44px;
  height: 44px;
}
.daily-description {
  color: #606266;
}
.temp-min {
  color: #409eff;
  text-align: right;
}
.temp-max {
  color: #f56c6c;
}
.temperature-range-track {
  position: relative;
  height: 8px;
  background: #ebeef5;
  border-radius: 4px;
}
.temperature-range {
  position: absolute;
  top: 0;
  bottom: 0;
  min-width: 4px;
  background: linear-gradient(90deg, #409eff, #f56c6c);
  border-radius: 4px;
}

@media (max-width: 600px) {
  .daily-row {
    grid-template-columns: 42px 40px 1fr 34px minmax(80px, 1.5fr) 34px;
    gap: 5px;
    font-size: 13px;
  }
}
</style>
