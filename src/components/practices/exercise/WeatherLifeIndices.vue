<script setup>
import { computed } from 'vue'
import { calculateCarWashIndex, calculateLaundryIndex, calculateOutingIndex } from '@/utils/weatherIndices'

const props = defineProps({
  currentWeather: { type: Object, default: null },
  forecasts: { type: Array, default: () => [] },
  airPollution: { type: Object, default: null },
  timezoneOffset: { type: Number, default: 0 },
})

const indexInput = () => ({
  currentWeather: props.currentWeather,
  forecasts: props.forecasts,
  airPollution: props.airPollution,
  timezoneOffset: props.timezoneOffset,
})

const laundryIndex = computed(() => calculateLaundryIndex(indexInput()))
const outingIndex = computed(() => calculateOutingIndex(indexInput()))
const carWashIndex = computed(() => calculateCarWashIndex(indexInput()))

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
.life-indices {
  padding: 18px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-large);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
}
.life-indices > h3 {
  margin: 0 0 14px;
  font-size: 16px;
  font-weight: 800;
}
.index-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}
.index-item {
  padding: 13px 14px;
  border: 1px solid #e5edf6;
  border-radius: 11px;
  background: var(--color-surface-soft);
}
.index-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.index-heading h4 {
  margin: 0;
}
.index-score {
  display: block;
  margin: 8px 0 5px;
  color: var(--color-primary);
  font-size: 21px;
  font-weight: 850;
}
.index-item p {
  margin: 5px 0;
  font-size: 11px;
  line-height: 1.45;
}
.index-timing {
  color: #606266;
}
.index-reference {
  margin: 12px 0 0;
  color: #909399;
  font-size: 10px;
}
</style>
