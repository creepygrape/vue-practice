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
    <h4>📍 지정 지역: {{ props.cityItem.name }}</h4>
    <button class="btn-favorite" type="button" @click.stop="configStore.toggleFavorite(props.cityItem.id)">
      {{ configStore.isFavorite(props.cityItem.id) ? '★' : '☆' }}
    </button>
    <p>
      실시간 기온: <strong>{{ displayTemp }}{{ configStore.unitSymbol }}</strong>
    </p>
    <p>기상 현황: {{ props.cityItem.status }}</p>
    <p>대기 습도: {{ props.cityItem.humidity }}%</p>
    <p>현재 풍속: {{ props.cityItem.wind }}m/s</p>
  </div>
  <div v-else class="weather-card">
    <p>해당 지역의 상세 정보가 존재하지 않습니다.</p>
  </div>
</template>

<style scoped>
.info-card {
  position: relative;
  margin: 15px 0;
  padding: 15px;
  border-radius: 6px;
  background: #f1f2f6;
}
</style>
