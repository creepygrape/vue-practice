<script setup>
import SlotNamedChild from './SlotNamedChild.vue'
</script>

<template>
  <div class="practice-section">
    <h2>Named Slot 주입 실습</h2>
    <SlotNamedChild>
      <template v-slot:header>
        <h3>Child 제목 주입</h3>
      </template>
      <p>쓸데없는 내용....</p>
    </SlotNamedChild>
  </div>
</template>
