<template>
  <div class="container-app changelog">
    <h1 class="t-headline">{{ $t('About.ChangeLog.Title') }}</h1>
    <article class="card card--padded changelog__article">
      <div class="changelog__body" v-html="rendered"></div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { marked } from 'marked'

const rendered = ref('')

marked.setOptions({ gfm: true, breaks: false })

onMounted(async () => {
  try {
    const response = await fetch('/CHANGELOG.md')
    if (!response.ok) throw new Error('Datei konnte nicht geladen werden')
    const text = await response.text()
    rendered.value = await marked.parse(text)
  } catch {
    rendered.value = '<p>CHANGELOG konnte nicht geladen werden.</p>'
  }
})
</script>

<style scoped>
.changelog {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-block: 1.25rem 2rem;
}

.changelog__article { padding: 1.75rem; }

.changelog__body {
  color: var(--text-default);
  font-size: var(--text-sm);
  line-height: 1.6;
}

.changelog__body :deep(h1) {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 800;
  color: var(--text-strong);
  margin-top: 2rem;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}

.changelog__body :deep(h1:first-child) { margin-top: 0; }

.changelog__body :deep(h2) {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--primary);
  margin-top: 1.5rem;
  margin-bottom: 0.35rem;
  letter-spacing: -0.01em;
}

.changelog__body :deep(h3) {
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--text-strong);
  margin-top: 1rem;
  margin-bottom: 0.25rem;
}

.changelog__body :deep(ul) {
  list-style: disc;
  padding-left: 1.25rem;
  margin-block: 0.25rem 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.changelog__body :deep(a) {
  color: var(--primary);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.changelog__body :deep(strong) {
  color: var(--text-strong);
  font-weight: 700;
}

.changelog__body :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.85em;
  padding: 0.1rem 0.35rem;
  background: color-mix(in oklab, var(--text-default) 10%, transparent);
  border-radius: var(--radius-xs);
}
</style>
