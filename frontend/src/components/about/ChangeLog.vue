<template>
    <h1 class="maintitle">{{ $t('About.ChangeLog.Title') }}</h1>
    <div
        class="prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert max-w-none bg-white dark:bg-gray-900 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
        v-html="rendered"></div>
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
        rendered.value = '<p>⚠️ CHANGELOG konnte nicht geladen werden.</p>'
    }
})
</script>

<style scoped>
@reference "tailwindcss";

.prose h1 {
    @apply text-xl mt-6 mb-2 text-blue-600 dark:text-blue-300;
}

.prose h2 {
    @apply text-xl mt-4 mb-1 text-blue-600 dark:text-blue-300;
}

.prose h3 {
    @apply text-lg mt-2 mb-0.5 text-blue-500 dark:text-blue-200;
}

.prose ul {
    @apply list-disc list-inside;
}

.prose li {
    @apply mb-0.5;
}

.prose strong {
    @apply text-blue-700 dark:text-blue-300;
}
</style>
