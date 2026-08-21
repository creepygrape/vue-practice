<script setup>
const props = defineProps({
  filteredWeatherList: {
    type: Array,
    required: true,
  },
  isCelsius: {
    type: Boolean,
    required: true,
  },
  displayTemperature: {
    type: Function,
    required: true,
  },
})

const emits = defineEmits(['select-card', 'click-detail'])

const selectCard = (item) => {
  emits('select-card', item)
}

const clickDetail = (item) => {
  emits('click-detail', item)
}
</script>

<template>
  <div class="weather-card" v-for="item in props.filteredWeatherList" :key="item.id" @click="selectCard(item)">
    <div class="weather-title-row">
      <p>{{ item.name }} ({{ item.status }})</p>
    </div>
    <p>현재 기온: {{ displayTemperature(item.temp) }} °{{ isCelsius ? 'C' : 'F' }}</p>
    <p>습도: {{ item.humidity }}% &nbsp;| &nbsp;바람: {{ item.wind }}</p>
    <label class="badge hot" v-if="item.temp >= 30">🔥 더움 (30도 이상)</label>
    <label class="badge cool" v-else-if="item.temp < 20">❄️ 추움 (20도 미만)</label>
    <label class="badge good" v-else>😊 선선함 (20도 이상, 30도 미만)</label>
    <button class="btn-detail" @click.stop="clickDetail(item)">상세보기</button>

    <label v-if="item.status === '비'" class="rain-check rain-check-bottom" @click.stop>
      <input class="rain-check-input" type="checkbox" />
      우산 챙기기
    </label>
  </div>
</template>

<style scoped>
.rain-check-bottom {
  position: absolute;
  right: 12px;
  bottom: 12px;

  display: flex;
  align-items: center;
  gap: 5px;

  font-size: 13px;
  white-space: nowrap;
  cursor: pointer;
}
</style>
