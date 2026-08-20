<script setup>
import { ref } from 'vue'

const isLogged = ref(false)
const score = ref(85)
</script>

<template>
  <div class="practice-section">
    <h2>v-if, v-else, v-else-if 디렉티브 학습</h2>
    <h3>1) 기본 로그인 상태 스위치</h3>
    <p v-if="isLogged">로그인 상태~ 회원 전용 화면임~</p>
    <p v-else>로그인이 필요합니다. 로그인 먼저 ㄱㄱ</p>
    <button @click="isLogged = !isLogged">
      {{ isLogged ? '로그아웃' : '로그인' }}
    </button>
    <br />
    <h3>2) 성적별 학점 등급 측 (다중 조건문))</h3>
    <label>현재 점수 입력: </label>
    <input type="number" v-model="score" min="0" max="100" step="5" />
    <br />
    <div v-if="score >= 90" style="color: green; font-weight: bold">합격 등급: A 학점 (ㅊㅋㅊㅋ)</div>
    <div v-else-if="score >= 80" style="color: blue">합격 등급: B 학점 (굿굿)</div>
    <div v-else-if="score >= 70" style="color: orange">합격 등급: C 학점 (무난)</div>
    <div v-else style="color: red; font-weight: bold">불합격 등급: F 학점 (ㅠㅠ)</div>
  </div>
</template>
