<template>
    <h1 class="maintitle">{{ $t('About.Title') }}</h1>
    <div class="mb-4">
        <div class="glass-card flex gap-2 items-start mb-3">
            <UserGroupIcon class="card-icon mt-1" />
            <p class="card-desc">
                {{ $t('About.Paragraph1') }}
            </p>
        </div>

        <div class="glass-card flex gap-2 items-start mb-3">
            <SparklesIcon class="card-icon mt-1" />
            <p class="card-desc">
                {{ $t('About.Paragraph2') }}
            </p>
        </div>

        <div class="glass-card flex gap-2 items-start mb-3">
            <DevicePhoneMobileIcon class="card-icon mt-1" />
            <p class="card-desc">
                {{ $t('About.Paragraph3') }}
            </p>
        </div>

        <div class="glass-card flex gap-2 items-start mb-3">
            <GlobeAltIcon class="card-icon mt-1" />
            <p class="card-desc">
                {{ $t('About.Paragraph4') }}
            </p>
        </div>
    </div>

    <div class="grid gap-2 md:grid-cols-3">
        <RouterLink to="/feedback" class="button-primary w-full text-center">
            {{ $t('General.Feedback') }}
        </RouterLink>
        <RouterLink to="/about/changelog" class="button-primary w-full text-center">
            {{ $t('About.ChangeLog.Title') }}
        </RouterLink>
        <RouterLink to="/about/roadmap" class="button-primary w-full text-center">
            {{ $t('About.Roadmap.Title') }}
        </RouterLink>
    </div>
</template>

<script setup lang="ts">
import {
    SparklesIcon,
    UserGroupIcon,
    DevicePhoneMobileIcon,
    GlobeAltIcon
} from '@heroicons/vue/24/solid'
</script>