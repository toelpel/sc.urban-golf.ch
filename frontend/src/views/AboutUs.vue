<template>
    <DefaultTemplate>
        <h1 class="maintitle mb-6">{{ $t('AboutUs.Title') }}</h1>

        <div class="max-w-3xl mx-auto px-4 space-y-6 text-lg text-gray-800 dark:text-gray-200">
            <p>{{ $t('AboutUs.Paragraph1') }}</p>
            <p>{{ $t('AboutUs.Paragraph2') }}</p>
            <p>{{ $t('AboutUs.Paragraph3') }}</p>
            <p>{{ $t('AboutUs.Paragraph4') }}</p>

            <RouterLink to="/aboutus/roadmap" class="button-primary w-full text-center">
                {{ $t('AboutUs.RoadmapLink') }}
            </RouterLink>
        </div>
    </DefaultTemplate>
</template>

<script setup>
import DefaultTemplate from '@/layouts/DefaultTemplate.vue'
</script>