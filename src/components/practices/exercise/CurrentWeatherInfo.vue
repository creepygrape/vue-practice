<script setup>
import { computed } from 'vue'
import { useConfigStore } from '@/stores/configStore'
import { convertTemperature } from '@/utils/weather'

const props = defineProps({
  cityItem: { type: Object, default: null },
  isLoading: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
})

const configStore = useConfigStore()
const displayTemp = computed(() => (props.cityItem ? convertTemperature(props.cityItem.temp, configStore.unit) : null))
const displayFeelsLike = computed(() => (props.cityItem ? convertTemperature(props.cityItem.feelsLike, configStore.unit) : null))
const temperatureBadge = computed(() => {
  if (!props.cityItem) return null
  if (props.cityItem.temp >= 30) return { label: '더움', className: 'hot' }
  if (props.cityItem.temp < 20) return { label: '추움', className: 'cool' }
  return { label: '선선함', className: 'mild' }
})
</script>

<template>
  <div
    v-if="props.isLoading"
    v-loading="props.isLoading"
    element-loading-text="상세 정보를 불러오는 중입니다... ☁️"
    class="info-card loading-area"
  ></div>
  <el-alert v-else-if="props.errorMessage" :title="props.errorMessage" type="error" :closable="false" show-icon />
  <div v-else-if="props.cityItem" class="info-card">
    <div class="current-heading">
      <div>
        <span class="card-eyebrow">CURRENT WEATHER</span>
        <h3>{{ props.cityItem.name }}</h3>
      </div>
      <button class="btn-favorite" type="button" @click.stop="configStore.toggleFavorite(props.cityItem.id)">
        {{ configStore.isFavorite(props.cityItem.id) ? '★' : '☆' }}
      </button>
    </div>
    <div class="temperature-row">
      <strong
        >{{ displayTemp }}<small>&nbsp;{{ configStore.unitSymbol }}</small></strong
      >
      <span class="temperature-badge" :class="temperatureBadge.className">{{ temperatureBadge.label }}</span>
    </div>
    <p class="weather-description">{{ props.cityItem.status }} · 체감 {{ displayFeelsLike }}{{ configStore.unitSymbol }}</p>
    <div class="current-metrics">
      <div>
        <span>💧 습도</span><strong>{{ props.cityItem.humidity }}%</strong>
      </div>
      <div>
        <span>〰️ 풍속</span><strong>{{ props.cityItem.wind }}m/s</strong>
      </div>
    </div>
  </div>
  <div v-else class="weather-card">
    <p>해당 지역의 상세 정보가 존재하지 않습니다.</p>
  </div>
</template>

<style scoped>
.info-card {
  position: relative;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-large);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
}
.current-heading,
.temperature-row,
.current-metrics,
.current-metrics div {
  display: flex;
  align-items: center;
}
.current-heading {
  justify-content: space-between;
  gap: 12px;
}
.card-eyebrow {
  color: var(--color-primary);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.1px;
}
.current-heading h3 {
  margin: 3px 0 0;
  font-size: 18px;
  font-weight: 800;
}
.btn-favorite {
  width: 36px;
  height: 36px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #f2b91d;
  font-size: 24px;
}
.temperature-row {
  gap: 12px;
  margin: 22px 0 8px;
}
.temperature-row > strong {
  font-size: 48px;
  font-weight: 750;
  letter-spacing: -2px;
  line-height: 1;
}
.temperature-row small {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0;
}
.temperature-badge {
  padding: 6px 10px;
  border-radius: 999px;
  color: white;
  font-size: 12px;
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
.weather-description {
  margin: 0 0 18px;
  color: var(--color-text-muted);
}
.current-metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  border-top: 1px solid #edf2f7;
}
.current-metrics div {
  justify-content: space-between;
  padding: 13px 9px 0;
}
.current-metrics div + div {
  border-left: 1px solid #edf2f7;
}
.current-metrics span {
  color: var(--color-text-muted);
  font-size: 11px;
}
.current-metrics strong {
  font-size: 13px;
  font-weight: 750;
}
</style>
