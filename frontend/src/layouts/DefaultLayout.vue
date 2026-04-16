<template>
  <div class="app-shell">
    <a href="#main-content" class="skip-link">Skip to main content</a>

    <TopBar />

    <main id="main-content" class="app-main">
      <slot></slot>
    </main>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import TopBar from '@/components/layout/TopBar.vue'
import BottomNav from '@/components/layout/BottomNav.vue'
</script>

<style scoped>
.skip-link {
  position: absolute;
  left: -999px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
  z-index: 100;
}
.skip-link:focus {
  left: 0.75rem;
  top: calc(0.5rem + var(--spacing-safe-top));
  width: auto;
  height: auto;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  background: var(--primary);
  color: var(--primary-ink);
}
</style>
