<template>
  <component
    :is="tag"
    :class="[
      'card',
      { 'card--padded': padded, 'card--interactive': interactive, 'card--feature': feature },
    ]"
    v-bind="$attrs"
  >
    <slot></slot>
  </component>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

withDefaults(defineProps<{
  tag?: 'div' | 'section' | 'article' | 'button' | 'a'
  padded?: boolean
  interactive?: boolean
  feature?: boolean
}>(), {
  tag: 'div',
  padded: true,
  interactive: false,
  feature: false,
})
</script>
