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
      <p>{{ cityItem.name }} ({{ cityItem.status }})</p>
    </div>
    <p>
      현재 기온: <strong>{{ displayTemp }}{{ configStore.unitSymbol }}</strong>
    </p>
    <p>습도: {{ cityItem.humidity }}% ({{ humidityInfo.label }}) &nbsp;| &nbsp;풍속: {{ cityItem.wind }}m/s</p>
    <label class="badge hot" v-if="cityItem.temp >= 30">🔥 더움 (30도 이상)</label>
    <label class="badge cool" v-else-if="cityItem.temp < 20">❄️ 추움 (20도 미만)</label>
    <label class="badge good" v-else>😊 선선함 (20도 이상, 30도 미만)</label>
    <button class="btn-detail" @click.stop="clickDetail(cityItem)">상세보기</button>
    <button class="btn-favorite" @click.stop="configStore.toggleFavorite(cityItem.id)">
      {{ configStore.isFavorite(cityItem.id) ? '★' : '☆' }}
    </button>
    <button v-if="cityItem.isCustom" class="btn-delete" @click.stop="emits('delete-card', cityItem)">삭제</button>

    <el-progress :percentage="cityItem.humidity" :color="humidityInfo.color" :format="(percentage) => `${percentage}%`" />
    <AirPollutionInfo :air-pollution="cityItem.airPollution" compact />
  </div>
</template>

<style scoped>
.btn-favorite {
  position: absolute;
  top: 15px;
  right: 90px;

  border: none;
  background: transparent;
  color: #f6c344;
  font-size: 22px;
  cursor: pointer;
}

.btn-delete {
  position: absolute;
  right: 125px;
  top: 17px;
  border: none;
  background: transparent;
  color: #f56c6c;
  cursor: pointer;
}
</style>
