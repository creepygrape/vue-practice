<script setup>
const props = defineProps({
  searchCity: {
    type: String,
    default: '',
  },
})

const emits = defineEmits(['change-search-keyword'])

const changeSearchKeyword = (keyword) => {
  emits('change-search-keyword', keyword)
}
</script>

<template>
  <div class="search-inner">
    <h3>도시 검색</h3>
    <label
      ><input
        type="text"
        :value="props.searchCity"
        @input="changeSearchKeyword($event.target.value)"
        placeholder="검색할 도시 이름을 입력한 후 엔터를 누르세요😉"
    /></label>
    <!-- <label><input type="text" :value="props.searchCity" placeholder="검색할 도시 이름을 입력한 후 엔터를 누르세요😉" /></label> -->
    <p>검색 중인 도시: {{ props.searchCity }}</p>
  </div>
</template>
