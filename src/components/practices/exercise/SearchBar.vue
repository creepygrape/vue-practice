<script setup>
import { computed, onActivated, onBeforeUnmount, onDeactivated, onMounted, ref } from 'vue'

const props = defineProps({
  searchCity: {
    type: String,
    default: '',
  },
  candidates: { type: Array, default: () => [] },
  isSearching: { type: Boolean, default: false },
  searchMessage: { type: String, default: '' },
  duplicateMessage: { type: String, default: '' },
  searchHistory: { type: Array, default: () => [] },
  addedLocationKeys: { type: Array, default: () => [] },
})

const emits = defineEmits(['change-search-keyword', 'select-candidate', 'select-history', 'remove-history', 'clear-history'])
const isDropdownOpen = ref(false)
const searchControlRef = ref(null)
const hasKeyword = computed(() => props.searchCity.trim().length > 0)
const showCandidateDropdown = computed(
  () => isDropdownOpen.value && hasKeyword.value && (props.isSearching || props.searchMessage || props.candidates.length || props.duplicateMessage),
)
const showHistoryDropdown = computed(() => isDropdownOpen.value && !hasKeyword.value && props.searchHistory.length)

const changeSearchKeyword = (keyword) => {
  isDropdownOpen.value = true
  emits('change-search-keyword', keyword)
}

const selectCandidate = (candidate) => emits('select-candidate', candidate)
const clearSearchKeyword = () => {
  isDropdownOpen.value = false
  emits('change-search-keyword', '')
}

const handleFocusOut = (event) => {
  if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) {
    isDropdownOpen.value = false
  }
}

const handleDocumentPointerDown = (event) => {
  isDropdownOpen.value = Boolean(searchControlRef.value?.contains(event.target))
}

const addOutsideClickListener = () => {
  document.addEventListener('pointerdown', handleDocumentPointerDown)
}

const removeOutsideClickListener = () => {
  document.removeEventListener('pointerdown', handleDocumentPointerDown)
}

onMounted(addOutsideClickListener)
onActivated(addOutsideClickListener)
onDeactivated(removeOutsideClickListener)
onBeforeUnmount(removeOutsideClickListener)
</script>

<template>
  <div class="search-inner">
    <div class="search-heading">
      <div>
        <span class="section-eyebrow">LOCATION SEARCH</span>
        <h2>어디의 날씨가 궁금하세요?</h2>
      </div>
      <p v-if="props.searchCity">‘{{ props.searchCity }}’ 지역을 찾고 있어요.</p>
    </div>
    <div
      ref="searchControlRef"
      class="search-control"
      @focusin="isDropdownOpen = true"
      @focusout="handleFocusOut"
      @keydown.esc="isDropdownOpen = false"
    >
      <label class="search-input-wrapper">
        <span class="search-icon" aria-hidden="true">⌕</span>
        <input
          type="text"
          :value="props.searchCity"
          @input="changeSearchKeyword($event.target.value)"
          placeholder="도시 또는 지역 이름을 2글자 이상 입력하세요"
        />
        <button v-if="props.searchCity" type="button" class="clear-search-button" aria-label="검색어 지우기" @click="clearSearchKeyword">×</button>
      </label>

      <div v-if="showHistoryDropdown" class="search-dropdown">
        <div class="dropdown-heading">
          <strong>최근 검색 지역</strong>
          <button type="button" @click="emits('clear-history')">전체 삭제</button>
        </div>
        <p v-if="props.searchMessage" class="candidate-message">{{ props.searchMessage }}</p>
        <ul class="candidate-list history-list">
          <li v-for="item in props.searchHistory" :key="item.locationKey">
            <button type="button" class="candidate-button" @click="emits('select-history', item)">
              <span class="history-icon" aria-hidden="true">↻</span>
              <span>
                <strong>{{ item.name }}</strong>
                <small>{{ item.addressName }}</small>
              </span>
              <em v-if="props.addedLocationKeys.includes(item.locationKey)">이미 추가됨</em>
            </button>
            <button
              type="button"
              class="history-remove"
              :aria-label="`${item.name} 검색 기록 삭제`"
              @click.stop="emits('remove-history', item.locationKey)"
            >
              ×
            </button>
          </li>
        </ul>
        <p v-if="props.duplicateMessage" class="duplicate-message">{{ props.duplicateMessage }}</p>
      </div>

      <div v-if="showCandidateDropdown" class="search-dropdown">
        <p v-if="props.isSearching" class="candidate-message">지역 후보를 찾는 중입니다...</p>
        <p v-else-if="props.searchMessage" class="candidate-message">{{ props.searchMessage }}</p>
        <ul v-if="props.candidates.length" class="candidate-list">
          <li v-for="candidate in props.candidates" :key="candidate.key">
            <button type="button" class="candidate-button" @click="selectCandidate(candidate)">
              <span class="location-icon" aria-hidden="true">⌖</span>
              <span>
                <strong>{{ candidate.displayName }}</strong>
                <small>{{ candidate.addressName }}</small>
              </span>
              <em v-if="props.addedLocationKeys.includes(candidate.key)">이미 추가됨</em>
            </button>
          </li>
        </ul>
        <p v-if="props.duplicateMessage" class="duplicate-message">{{ props.duplicateMessage }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-inner {
  padding: 10px 8%;
}
.search-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 18px;
}
.section-eyebrow {
  color: var(--color-primary);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.4px;
}
.search-heading h2 {
  margin: 3px 0 0;
  color: var(--color-text);
  font-size: clamp(22px, 3vw, 30px);
  font-weight: 800;
}
.search-heading p {
  margin: 0 0 4px;
  color: var(--color-text-muted);
  font-size: 13px;
}
.search-control {
  position: relative;
}
.search-input-wrapper {
  display: block;
  position: relative;
  width: 100%;
}
.search-icon {
  position: absolute;
  z-index: 1;
  top: 50%;
  left: 17px;
  color: var(--color-primary);
  font-size: 22px;
  transform: translateY(-50%);
}
.search-input-wrapper input {
  width: 100%;
  height: 52px;
  padding: 0 48px;
  border: 2px solid #bad8f7;
  border-radius: 13px;
  outline: none;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 15px;
  box-shadow: 0 5px 16px rgb(31 100 171 / 7%);
  transition: 0.2s ease;
}
.search-input-wrapper input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgb(22 119 232 / 10%);
}
.clear-search-button {
  position: absolute;
  top: 50%;
  right: 14px;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #8090a3;
  font-size: 24px;
  line-height: 1;
  transform: translateY(-50%);
}
.search-dropdown {
  position: absolute;
  z-index: 50;
  top: calc(100% + 8px);
  right: 0;
  left: 0;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 13px;
  background: var(--color-surface);
  box-shadow: var(--shadow-float);
}
.dropdown-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 15px 8px;
}
.dropdown-heading strong {
  font-size: 13px;
}
.dropdown-heading button {
  padding: 4px 7px;
  border: 0;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 12px;
}
.candidate-list {
  max-height: 280px;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;
}
.candidate-list li {
  position: relative;
  border-top: 1px solid #edf2f7;
}
.candidate-button {
  display: grid;
  grid-template-columns: 25px minmax(0, 1fr) auto;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 11px 16px;
  border: 0;
  border-radius: 0;
  background: var(--color-surface);
  text-align: left;
}
.candidate-button:hover {
  background: var(--color-primary-soft);
}
.candidate-button strong,
.candidate-button small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.candidate-button strong {
  font-size: 14px;
  font-weight: 700;
}
.candidate-button small {
  margin-top: 2px;
  color: var(--color-text-muted);
}
.candidate-button em {
  color: var(--color-danger);
  font-size: 11px;
  font-style: normal;
  font-weight: 700;
}
.location-icon,
.history-icon {
  color: var(--color-primary);
  font-size: 18px;
  text-align: center;
}
.history-remove {
  position: absolute;
  z-index: 2;
  top: 50%;
  right: 8px;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-text-muted);
  transform: translateY(-50%);
}
.history-list .candidate-button {
  padding-right: 110px;
}
.history-list .candidate-button em {
  position: absolute;
  right: 42px;
}
.candidate-message,
.duplicate-message {
  margin: 0;
  padding: 11px 16px;
  font-size: 12px;
}
.candidate-message {
  color: var(--color-text-muted);
}
.duplicate-message {
  border-top: 1px solid #ffe0e0;
  background: #fff7f7;
  color: var(--color-danger);
  font-weight: 700;
}
@media (max-width: 680px) {
  .search-inner {
    padding: 4px 0;
  }
  .search-heading {
    align-items: start;
    flex-direction: column;
  }
  .search-heading p {
    display: none;
  }
}
</style>
