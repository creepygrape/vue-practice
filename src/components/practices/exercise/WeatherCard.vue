<script setup>
import { computed } from 'vue'
import { useConfigStroe } from '@/stores/configStore'

const configStore = useConfigStroe()
const props = defineProps({
  cityItem: {
    type: Object,
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

const displayTemp = computed(() => {
  const rawTemp = props.cityItem.temp // 기본 원본 데이터는 섭씨 숫자
  if (configStore.unit === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32) // 화씨 변환 연산
  }
  return rawTemp // 'celsius'일 때는 원본 그대로 반환
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
    <p>습도: {{ cityItem.humidity }}% &nbsp;| &nbsp;바람: {{ cityItem.wind }}</p>
    <label class="badge hot" v-if="cityItem.temp >= 30">🔥 더움 (30도 이상)</label>
    <label class="badge cool" v-else-if="cityItem.temp < 20">❄️ 추움 (20도 미만)</label>
    <label class="badge good" v-else>😊 선선함 (20도 이상, 30도 미만)</label>
    <button class="btn-detail" @click.stop="clickDetail(cityItem)">상세보기</button>

    <label v-if="cityItem.status.includes('비')" class="rain-check rain-check-bottom" @click.stop>
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
