<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleGoHome = () => {
  router.push({
    name: 'Home',
  })
}
</script>

<template>
  <main class="about-view">
    <section class="intro-section">
      <span class="intro-label">WEATHER DASHBOARD</span>
      <h2>우리 동네 날씨를 한눈에 확인하세요</h2>
      <p>
        카카오 지역 검색과 OpenWeather 날씨 데이터를 결합한 국내 지역 날씨 대시보드입니다. 원하는 지역을 추가하고 현재 날씨부터 예보, 대기질, 생활
        지수까지 한 화면에서 확인할 수 있습니다.
      </p>
    </section>

    <section class="feature-grid" aria-label="주요 기능">
      <article class="feature-card">
        <span class="feature-icon">📍</span>
        <div>
          <h3>국내 지역 검색</h3>
          <p>국내 지역을 검색하고 카드를 추가합니다.</p>
        </div>
      </article>

      <article class="feature-card">
        <span class="feature-icon">🌤️</span>
        <div>
          <h3>날씨와 예보</h3>
          <p>현재 날씨와 시간별 기온, 5일 예보를 제공합니다.</p>
        </div>
      </article>

      <article class="feature-card">
        <span class="feature-icon">🌿</span>
        <div>
          <h3>대기질과 생활 지수</h3>
          <p>미세먼지와 생활 지수를 확인합니다.</p>
        </div>
      </article>

      <article class="feature-card">
        <span class="feature-icon">⭐</span>
        <div>
          <h3>나만의 날씨 목록</h3>
          <p>즐겨찾기, 정렬·삭제를 지원합니다.</p>
        </div>
      </article>
    </section>

    <section class="info-section">
      <div class="info-block">
        <h3>데이터 처리 방식</h3>
        <p>카카오 로컬 API에서 국내 지역의 위도와 경도를 찾고, 해당 좌표를 기준으로 OpenWeather의 현재 날씨·예보·대기 오염 데이터를 조회합니다.</p>
      </div>

      <div class="info-block">
        <h3>사용 기술</h3>
        <ul class="tech-list">
          <li>Vue 3</li>
          <li>Pinia</li>
          <li>Vue Router</li>
          <li>Axios</li>
          <li>Element Plus</li>
          <li>Vite</li>
        </ul>
      </div>
    </section>

    <p class="notice">생활 지수는 공식 기상 지수가 아니며, 제공된 날씨와 대기질 데이터를 조합해 계산한 참고 정보입니다.</p>

    <button class="home-btn" type="button" @click="handleGoHome">날씨 대시보드로 돌아가기</button>
  </main>
</template>

<style scoped>
.about-view {
  max-width: 960px;
  margin: 0 auto;
  padding: 20px 16px 40px;
  color: #27364b;
}

.intro-section {
  padding: 34px;
  border: 1px solid #dce9f5;
  border-radius: 18px;
  background: linear-gradient(135deg, #eef8ff 0%, #f8fbff 55%, #edf5ff 100%);
}

.intro-label {
  color: #3182ce;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1.2px;
}

.intro-section h2 {
  margin: 8px 0 12px;
  font-size: clamp(24px, 4vw, 34px);
}

.intro-section p,
.feature-card p,
.info-block p {
  margin: 0;
  color: #5b6b7e;
  line-height: 1.7;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.feature-card {
  display: flex;
  gap: 14px;
  padding: 22px;
  border: 1px solid #e4eaf1;
  border-radius: 14px;
  background-color: #fff;
  box-shadow: 0 5px 18px rgb(45 71 99 / 7%);
}

.feature-icon {
  flex-shrink: 0;
  font-size: 26px;
}

.feature-card h3,
.info-block h3 {
  margin: 0 0 8px;
  font-size: 17px;
}

.info-section {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 16px;
  margin-top: 20px;
}

.info-block {
  padding: 22px;
  border-radius: 14px;
  background-color: #f6f8fb;
}

.tech-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.tech-list li {
  padding: 6px 10px;
  border: 1px solid #d9e4ef;
  border-radius: 999px;
  background-color: #fff;
  color: #43617d;
  font-size: 13px;
  font-weight: 600;
}

.notice {
  margin: 18px 2px 0;
  color: #7a8795;
  font-size: 13px;
  line-height: 1.6;
}

.home-btn {
  width: 100%;
  margin-top: 20px;
  padding: 13px;
  border: none;
  border-radius: 10px;
  background-color: #3182ce;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.home-btn:hover {
  background-color: #246fad;
  transform: translateY(-1px);
}

@media (max-width: 680px) {
  .about-view {
    padding: 12px 10px 28px;
  }

  .intro-section {
    padding: 24px 20px;
  }

  .feature-grid,
  .info-section {
    grid-template-columns: 1fr;
  }

  .feature-card,
  .info-block {
    padding: 18px;
  }
}
</style>
