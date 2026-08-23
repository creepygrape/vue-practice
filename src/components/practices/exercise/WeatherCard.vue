<script setup>
import { computed } from 'vue'
import { useConfigStore } from '@/stores/configStore'
import AirPollutionInfo from '@/components/practices/exercise/AirPollutionInfo.vue'
import { convertTemperature } from '@/utils/weather'

const configStore = useConfigStore()
const props = defineProps({
  cityItem: {
    type: Object,
    required: true,
  },
})

const emits = defineEmits(['select-card', 'click-detail', 'delete-card'])

const selectCard = (item) => {
  emits('select-card', item)
}

const clickDetail = (item) => {
  emits('click-detail', item)
}

const displayTemp = computed(() => convertTemperature(props.cityItem.temp, configStore.unit))
const temperatureBadge = computed(() => {
  if (props.cityItem.temp >= 30) return { label: '더움', className: 'hot', icon: '🔥' }
  if (props.cityItem.temp < 20) return { label: '추움', className: 'cool', icon: '❄️' }
  return { label: '선선함', className: 'mild', icon: '😊' }
})
const weatherIcon = computed(() => {
  const status = props.cityItem.status
  if (status.includes('비')) return '🌧️'
  if (status.includes('눈')) return '🌨️'
  if (status.includes('구름') || status.includes('흐림')) return '☁️'
  return '☀️'
})

const humidityInfo = computed(() => {
  const humidity = props.cityItem.humidity

  if (humidity <= 30) {
    return { label: '건조함', color: '#e6a23c' }
  }

  if (humidity <= 60) {
    return { label: '쾌적함', color: '#67c23a' }
  }

  if (humidity <= 80) {
    return { label: '습함', color: '#409eff' }
  }

  return { label: '매우 습함', color: '#f56c6c' }
})
</script>

<template>
  <div class="weather-card" @click="selectCard(cityItem)">
    <div class="weather-title-row">
      <div>
        <h4>{{ cityItem.name }}</h4>
        <p>{{ cityItem.status }}</p>
      </div>
      <div class="card-actions">
        <button class="btn-favorite" type="button" :aria-label="`${cityItem.name} 즐겨찾기`" @click.stop="configStore.toggleFavorite(cityItem.id)">
          {{ configStore.isFavorite(cityItem.id) ? '★' : '☆' }}
        </button>
        <button
          v-if="cityItem.isCustom"
          class="btn-delete"
          type="button"
          :aria-label="`${cityItem.name} 삭제`"
          @click.stop="emits('delete-card', cityItem)"
        >
          ×
        </button>
      </div>
    </div>

    <div class="weather-main-row">
      <span class="weather-symbol" aria-hidden="true">{{ weatherIcon }}</span>
      <strong class="current-temperature"
        >{{ displayTemp }}<small>{{ configStore.unitSymbol }}</small></strong
      >
      <span class="temperature-badge" :class="temperatureBadge.className">{{ temperatureBadge.icon }} {{ temperatureBadge.label }}</span>
    </div>

    <div class="weather-metrics">
      <div class="metric humidity-metric">
        <span>💧 습도</span>
        <strong>{{ cityItem.humidity }}%</strong>
        <el-progress :percentage="cityItem.humidity" :color="humidityInfo.color" :show-text="false" />
        <small>{{ humidityInfo.label }}</small>
      </div>
      <div class="metric">
        <span>〰️ 바람</span>
        <strong>{{ cityItem.wind }}m/s</strong>
        <small>현재 풍속</small>
      </div>
    </div>

    <AirPollutionInfo :air-pollution="cityItem.airPollution" compact />
    <button class="btn-detail" type="button" @click.stop="clickDetail(cityItem)">상세보기</button>
  </div>
</template>

<style scoped>
.weather-card {
  display: flex;
  position: relative;
  min-width: 0;
  padding: 20px;
  flex-direction: column;
  border: 1px solid var(--color-border);
  border-radius: 15px;
  background: var(--color-surface);
  box-shadow: 0 7px 22px rgb(47 79 111 / 8%);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.weather-card:hover {
  box-shadow: 0 14px 28px rgb(47 79 111 / 14%);
  transform: translateY(-2px);
}
.weather-title-row,
.card-actions,
.weather-main-row {
  display: flex;
  align-items: center;
}
.weather-title-row {
  justify-content: space-between;
  gap: 12px;
}
.weather-title-row h4 {
  margin: 0;
  color: var(--color-text);
  font-size: 21px;
  font-weight: 800;
}
.weather-title-row p {
  margin: 3px 0 0;
  color: var(--color-text-muted);
  font-size: 16px;
}
.card-actions {
  gap: 4px;
}
.btn-favorite,
.btn-delete {
  width: 34px;
  height: 34px;
  padding: 0;
  border: 0;
  background: transparent;
}
.btn-favorite {
  color: #f2b91d;
  font-size: 24px;
}
.btn-delete {
  color: var(--color-danger);
  font-size: 24px;
}
.weather-main-row {
  gap: 12px;
  margin: 22px 0;
}
.weather-symbol {
  font-size: 42px;
  line-height: 1;
}
.current-temperature {
  color: #0c1828;
  font-size: clamp(36px, 5vw, 50px);
  font-weight: 800;
  letter-spacing: -2px;
  line-height: 1;
}
.current-temperature small {
  margin-left: 3px;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0;
}
.temperature-badge {
  margin-left: auto;
  padding: 7px 11px;
  border-radius: 999px;
  color: #fff;
  font-size: 14px;
  font-weight: 800;
}
.temperature-badge.hot {
  background: var(--color-danger);
}
.temperature-badge.cool {
  background: var(--color-primary);
}
.temperature-badge.mild {
  background: var(--color-success);
}
.weather-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  padding: 13px 0;
  border-top: 1px solid #edf2f7;
  border-bottom: 1px solid #edf2f7;
}
.metric {
  display: grid;
  gap: 4px;
  padding: 0 14px;
}
.metric + .metric {
  border-left: 1px solid #e8eef5;
}
.metric > span,
.metric small {
  color: var(--color-text-muted);
  font-size: 15px;
}
.metric strong {
  font-size: 19px;
  font-weight: 750;
}
.humidity-metric :deep(.el-progress) {
  max-width: 110px;
}
.btn-detail {
  width: 100%;
  margin-top: 14px;
  padding: 9px 12px;
  border-color: #acd2fb;
  background: #f7fbff;
  color: var(--color-primary);
  font-weight: 750;
}
.btn-detail:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
}
@media (max-width: 480px) {
  .weather-card {
    padding: 16px;
  }
  .weather-main-row {
    gap: 8px;
  }
  .weather-symbol {
    font-size: 34px;
  }
  .temperature-badge {
    padding: 6px 8px;
  }
}
</style>
