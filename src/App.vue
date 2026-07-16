<script setup lang="ts">
import { RouterView } from 'vue-router'
import ToastContainer from '@/shared/ui/notification/ToastContainer.vue'
</script>

<template>
  <RouterView v-slot="{ Component, route }">
    <Transition name="page" mode="out-in">
      <Component :is="Component" :key="route.fullPath" />
    </Transition>
  </RouterView>
  <ToastContainer />
</template>