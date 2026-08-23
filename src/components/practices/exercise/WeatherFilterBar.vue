<script setup>
defineProps({
  isRefreshing: { type: Boolean, default: false },
  lastUpdatedText: { type: String, default: '업데이트 전' },
})

const emit = defineEmits(['refresh'])

const status = defineModel('status', { type: String, required: true })
const sort = defineModel('sort', { type: String, required: true })
const favoritesOnly = defineModel('favoritesOnly', { type: Boolean, required: true })
</script>

<template>
  <div class="filter-toolbar">
    <div class="filter-group">
      <label>
        <span>날씨</span>
        <select v-model="status" aria-label="날씨 상태 필터">
          <option value="전체">전체 날씨</option>
          <option value="맑음">맑음</option>
          <option value="흐림">흐림</option>
          <option value="구름">구름</option>
          <option value="비">비</option>
          <option value="바람">바람</option>
        </select>
      </label>
      <label>
        <span>정렬</span>
        <select v-model="sort" aria-label="카드 정렬 기준">
          <option value="default">기본순</option>
          <option value="name">이름순</option>
          <option value="temp-desc">기온 높은 순</option>
          <option value="temp-asc">기온 낮은 순</option>
          <option value="latest">최신 추가순</option>
        </select>
      </label>
      <button type="button" class="favorite-filter" :class="{ active: favoritesOnly }" @click="favoritesOnly = !favoritesOnly">
        {{ favoritesOnly ? '★ 즐겨찾기만 보는 중' : '☆ 즐겨찾기만 보기' }}
      </button>
    </div>
    <div class="refresh-group">
      <span>{{ isRefreshing ? '날씨 갱신 중...' : lastUpdatedText }}</span>
      <button
        type="button"
        class="refresh-button"
        :class="{ rotating: isRefreshing }"
        :disabled="isRefreshing"
        aria-label="날씨 수동 갱신"
        @click="emit('refresh')"
      >
        ↻
      </button>
    </div>
  </div>
</template>

<style scoped>
.filter-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin: 16px 0 20px;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-medium);
  background: var(--color-surface-soft);
}
.filter-group,
.refresh-group {
  display: flex;
  align-items: center;
  gap: 10px;
}
.filter-group label {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 700;
}
.filter-group select {
  min-width: 120px;
  padding: 9px 32px 9px 11px;
  border: 1px solid var(--color-border);
  border-radius: 9px;
  background: var(--color-surface);
  color: var(--color-text);
}
.favorite-filter {
  min-height: 38px;
  border-color: var(--color-border);
  background: var(--color-surface);
}
.favorite-filter.active {
  border-color: #f6c344;
  background: #fff9df;
  color: #a87300;
}
.refresh-group {
  color: var(--color-text-muted);
  font-size: 12px;
  white-space: nowrap;
}
.refresh-button {
  display: grid;
  width: 38px;
  height: 38px;
  padding: 0;
  place-items: center;
  border-radius: 50%;
  background: var(--color-surface);
  color: var(--color-primary);
  font-size: 20px;
}
.rotating {
  animation: rotate 0.8s linear infinite;
}
@keyframes rotate {
  to {
    transform: rotate(360deg);
  }
}
@media (max-width: 780px) {
  .filter-toolbar,
  .filter-group {
    align-items: stretch;
    flex-direction: column;
  }
  .refresh-group {
    justify-content: space-between;
  }
  .filter-group label {
    justify-content: space-between;
  }
  .filter-group select {
    flex: 1;
  }
}
</style>
