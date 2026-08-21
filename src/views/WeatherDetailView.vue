<script setup>
import { useConfigStroe } from '@/stores/configStore'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const configStore = useConfigStroe()
const city = ref(null)

const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 30.0, status: '흐림', humidity: 45, wind: 2.3 },
  { id: 'city_02', name: '인천', temp: 28.1, status: '맑음', humidity: 20, wind: 2.1 },
  { id: 'city_03', name: '강릉', temp: 16.6, status: '구름', humidity: 35, wind: 1.5 },
  { id: 'city_04', name: '포항', temp: 22.7, status: '비', humidity: 40, wind: 2.2 },
  { id: 'city_05', name: '대전', temp: 30.9, status: '바람', humidity: 70, wind: 1.3 },
  { id: 'city_06', name: '광주', temp: 27.0, status: '흐림', humidity: 35, wind: 0.8 },
  { id: 'city_07', name: '제주', temp: 18.0, status: '맑음', humidity: 25, wind: 1.7 },
  { id: 'city_08', name: '부산', temp: 30.8, status: '구름', humidity: 55, wind: 1.2 },
  { id: 'city_09', name: '울산', temp: 29.9, status: '비', humidity: 60, wind: 0.6 },
  { id: 'city_10', name: '강원도', temp: 14.3, status: '맑음', humidity: 40, wind: 1.8 },
])

onMounted(() => {
  const cityId = route.params.cityId
  city.value = weatherList.value.find((item) => item.id === cityId)
})

const displayTemp = computed(() => {
  const rawTemp = city.value.temp // 기본 원본 데이터는 섭씨 숫자
  if (configStore.unit === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32) // 화씨 변환 연산
  }
  return rawTemp // 'celsius'일 때는 원본 그대로 반환
})
</script>

<template>
  <div class="detail-container">
    <h3>📊 지역별 상세 기상 관측 정보</h3>
    <hr />

    <div v-if="city" class="info-card">
      <h4>📍 지정 지역: {{ city.name }}</h4>
      <p>
        실시간 기온: <strong>{{ displayTemp }}{{ configStore.unitSymbol }}</strong>
      </p>
      <p>기상 현황: {{ city.status }}</p>
      <p>대기 습도: {{ city.humidity }}</p>
      <p>현재 풍속: {{ city.wind }}</p>
    </div>
    <div v-else>
      <p>해당 지역의 상세 데이터 장부가 존재하지 않습니다.</p>
    </div>

    <button @click="router.push('/')" class="back-btn">← 메인 대시보드로 돌아가기</button>
  </div>
</template>

<style scoped>
.detail-container {
  margin: 0 auto;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.info-card {
  background: #f1f2f6;
  padding: 15px;
  border-radius: 6px;
  margin: 15px 0;
}
.back-btn {
  padding: 8px 12px;
  background: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
