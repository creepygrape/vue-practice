<script setup>
defineProps({
  isRefreshing: { type: Boolean, default: false },
})

const status = defineModel('status', { type: String, required: true })
const sort = defineModel('sort', { type: String, required: true })
const favoritesOnly = defineModel('favoritesOnly', { type: Boolean, required: true })
</script>

<template>
  <select v-model="status" aria-label="날씨 상태 필터">
    <option value="전체">전체</option>
    <option value="맑음">맑음</option>
    <option value="흐림">흐림</option>
    <option value="구름">구름</option>
    <option value="비">비</option>
    <option value="바람">바람</option>
  </select>
  <select v-model="sort" aria-label="카드 정렬 기준">
    <option value="default">기본순</option>
    <option value="name">이름순</option>
    <option value="temp-desc">기온 높은 순</option>
    <option value="temp-asc">기온 낮은 순</option>
    <option value="latest">최신 추가순</option>
  </select>
  <button type="button" @click="favoritesOnly = !favoritesOnly">
    {{ favoritesOnly ? '★ 즐겨찾기만 보는 중' : '☆ 즐겨찾기만 보기' }}
  </button>
  <span v-if="isRefreshing" class="refreshing-message">날씨 갱신 중...</span>
</template>

<style scoped>
.refreshing-message {
  margin-left: 8px;
  color: #909399;
  font-size: 13px;
}
</style>
