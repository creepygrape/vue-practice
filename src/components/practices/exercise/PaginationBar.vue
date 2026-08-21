<!-- src/components/common/AppPagination.vue -->
<script setup>
defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  pageSize: {
    type: Number,
    default: 10,
  },
  total: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['update:currentPage'])
</script>

<template>
  <div v-if="total > 0" class="pagination-area">
    <el-pagination
      :current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      layout="prev, pager, next"
      @update:current-page="emit('update:currentPage', $event)"
    />
  </div>
</template>

<style scoped>
.pagination-area {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
</style>
