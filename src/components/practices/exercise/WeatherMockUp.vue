<script setup>
import { ref } from 'vue'

const searchCity = ref('')
const selectedCard = ref('카드를 클릭하거나 검색해 보세요.')
const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 30.0, status: '흐림', humidity: 45, wind: 2.3 },
  { id: 'city_02', name: '인천', temp: 29.1, status: '맑음', humidity: 20, wind: 2.1 },
  { id: 'city_03', name: '강릉', temp: 21.0, status: '구름', humidity: 35, wind: 1.5 },
  { id: 'city_04', name: '포항', temp: 22.7, status: '비', humidity: 40, wind: 2.2 },
  { id: 'city_05', name: '대전', temp: 30.9, status: '바람', humidity: 70, wind: 1.3 },
  { id: 'city_06', name: '광주', temp: 27.0, status: '흐림', humidity: 35, wind: 0.8 },
  { id: 'city_07', name: '제주', temp: 24.0, status: '맑음', humidity: 25, wind: 1.7 },
  { id: 'city_08', name: '부산', temp: 30.8, status: '구름', humidity: 55, wind: 1.2 },
  { id: 'city_09', name: '울산', temp: 29.9, status: '비', humidity: 60, wind: 0.6 },
])

const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}
</script>

<template>
  <div class="dashboard-wrapper">
    <section class="search-box">
      <h3>도시 검색</h3>
      <label
        ><input
          type="text"
          :value="searchCity"
          @input="(e) => (searchCity = e.target.value)"
          placeholder="검색할 도시 이름을 입력한 후 엔터를 누르세요😉"
      /></label>
      <p>검색 중인 도시: {{ searchCity }}</p>
    </section>
    <section class="list-box">
      <h3>🏙️ 지역별 날씨 현황</h3>
      <div
        class="weather-card"
        v-for="item in weatherList"
        :key="item.id"
        @click="selectedCard = `${item.name}이(가) 선택됐습니다.`"
      >
        <p>{{ item.name }} ({{ item.status }})</p>
        <p>현재 기온: {{ item.temp }} °C</p>
        <label class="badge hot" v-if="item.temp >= 25">🔥 더움 (25도 이상)</label>
        <label class="badge cool" v-else>❄️ 선선함 (25도 미만)</label>
        <button class="btn-detail" @click.stop="showDetail(item.name, item.status)">
          상세보기
        </button>
      </div>
    </section>

    <div class="status-bar">
      {{ selectedCard }}
    </div>
  </div>
</template>
