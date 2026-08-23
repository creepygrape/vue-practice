<script setup lang="ts">
import Ref from '@/components/practices/basic/Ref.vue'
import Reactive from '@/components/practices/basic/Reactive.vue'
import LifeCycleParent from '@/components/practices/component/LifeCycleParent.vue'
import PropsEmitsParent from '@/components/practices/component/PropsEmitsParent.vue'
import SlotDefaultParent from '@/components/practices/component/SlotDefaultParent.vue'
import SlotNamedParent from '@/components/practices/component/SlotNamedParent.vue'
import SlotScopedParent from '@/components/practices/component/SlotScopedParent.vue'
</script>

<template>
  <div class="about">
    <div style="padding: 20px">
      <h1>Component</h1>
      <hr />
      <SlotScopedParent />
      <SlotNamedParent />
      <SlotDefaultParent />
      <PropsEmitsParent />
      <LifeCycleParent />
      <!-- <LifeCycleChild /> -->
      <h1>Compositioin API</h1>
      <hr />
      <Ref />
      <Reactive />
      <br />
    </div>
  </div>
</template>

<style>
@import '@/assets/practice.css';
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
