<script setup lang="ts">
import SampleOne from '@/components/practices/basic/SampleOne.vue'
import SampleTwo from '@/components/practices/basic/SampleTwo.vue'
import VHtml from '@/components/practices/basic/VHtml.vue'
import VHtmlXSS from '@/components/practices/basic/VHtmlXSS.vue'
import VText from '@/components/practices/basic/VText.vue'
import VBindBasic from '@/components/practices/basic/VBindBasic.vue'
import ClassBinding from '@/components/practices/basic/ClassBinding.vue'
import StyleBinding from '@/components/practices/basic/StyleBinding.vue'
import VIfElse from '@/components/practices/basic/VIfElse.vue'
import VShow from '@/components/practices/basic/VShow.vue'
import VFor from '@/components/practices/basic/VFor.vue'
import VPre from '@/components/practices/basic/VPre.vue'
import VCloak from '@/components/practices/basic/VCloak.vue'
import VOnce from '@/components/practices/basic/VOnce.vue'
import VMemo from '@/components/practices/basic/VMemo.vue'
import EventHandler from '@/components/practices/basic/EventHandler.vue'
import EventObject from '@/components/practices/basic/EventObject.vue'
import TwoWayBinding from '@/components/practices/basic/TwoWayBinding.vue'
import FormBinding from '@/components/practices/basic/FormBinding.vue'
import FormBinding2 from '@/components/practices/basic/FormBinding2.vue'
import Ref from '@/components/practices/basic/Ref.vue'
import Reactive from '@/components/practices/basic/Reactive.vue'
</script>

<template>
  <div class="about">
    <h1>This is an about page</h1>
    <div style="padding: 20px">
      <h1>Vue Syntax</h1>
      <hr>
      <SampleOne />
      <SampleTwo />
      <VHtml />
      <VHtmlXSS />
      <VText />
      <VBindBasic />
      <ClassBinding />
      <StyleBinding />
      <VBindShort />
      <VIfElse />
      <VShow />
      <VFor />
      <VPre />
      <VCloak />
      <VOnce />
      <VMemo />
      <EventHandler />
      <EventObject />
      <EventModifier />
      <TwoWayBinding />
      <FormBinding />
      <FormBinding2 />
      
      <h1>Compositioin API</h1>
      <hr>
      <Ref />
      <Reactive />
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
