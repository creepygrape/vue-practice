<script setup>
const props = defineProps({
  searchCity: {
    type: String,
    default: '',
  },
  candidates: { type: Array, default: () => [] },
  isSearching: { type: Boolean, default: false },
  searchMessage: { type: String, default: '' },
  duplicateMessage: { type: String, default: '' },
})

const emits = defineEmits(['change-search-keyword', 'select-candidate'])

const changeSearchKeyword = (keyword) => {
  emits('change-search-keyword', keyword)
}

const selectCandidate = (candidate) => emits('select-candidate', candidate)
</script>

<template>
  <div class="search-inner">
    <h3>도시 검색</h3>
    <label class="search-input-wrapper"
      ><input
        type="text"
        :value="props.searchCity"
        @input="changeSearchKeyword($event.target.value)"
        placeholder="도시 이름을 2글자 이상 입력하세요😉"
      />
      <button
        v-if="props.searchCity"
        type="button"
        class="clear-search-button"
        aria-label="검색어 지우기"
        @click="changeSearchKeyword('')"
      >
        ×
      </button></label
    >
    <!-- <label><input type="text" :value="props.searchCity" placeholder="검색할 도시 이름을 입력한 후 엔터를 누르세요😉" /></label> -->
    <p>검색 중인 도시: {{ props.searchCity }}</p>
    <p v-if="props.isSearching" class="candidate-message">지역 후보를 찾는 중입니다...</p>
    <p v-else-if="props.searchMessage" class="candidate-message">{{ props.searchMessage }}</p>
    <ul v-if="props.candidates.length" class="candidate-list">
      <li v-for="candidate in props.candidates" :key="candidate.key">
        <button type="button" @click="selectCandidate(candidate)">
          <strong>{{ candidate.displayName }}</strong>
          <small>{{ candidate.addressName }}</small>
        </button>
      </li>
    </ul>
    <p v-if="props.duplicateMessage" class="duplicate-message">{{ props.duplicateMessage }}</p>
  </div>
</template>

<style scoped>
.candidate-message { margin: 8px 0; color: #606266; font-size: 13px; }
.duplicate-message { margin: 8px 0 0; color: #f56c6c; font-size: 13px; font-weight: 600; }
.search-input-wrapper { position: relative; display: block; width: 90%; }
.search-input-wrapper input { box-sizing: border-box; width: 100%; padding-right: 34px; }
.clear-search-button { position: absolute; top: 50%; right: 8px; padding: 0; border: 0; background: transparent; color: #909399; font-size: 22px; line-height: 1; cursor: pointer; transform: translateY(-50%); }
.clear-search-button:hover { color: #303133; }
.candidate-list { max-height: 220px; margin: 8px 0 0; padding: 0; overflow-y: auto; border: 1px solid #dcdfe6; border-radius: 6px; list-style: none; }
.candidate-list li + li { border-top: 1px solid #ebeef5; }
.candidate-list button { width: 100%; padding: 10px 12px; border: 0; background: #fff; text-align: left; cursor: pointer; }
.candidate-list button:hover { background: #f5f7fa; }
.candidate-list strong, .candidate-list small { display: block; }
.candidate-list small { margin-top: 3px; color: #909399; }
</style>
