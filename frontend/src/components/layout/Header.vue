<template>
    <nav class="sticky top-0 z-50 bg-white/70 backdrop-blur dark:bg-gray-800/70 border-b dark:border-gray-700">
        <div class="flex justify-between items-center px-4 py-2">
            <div class="flex items-center space-x-4">
                <img src="/img/web-app-manifest-192x192.png" alt="ScoreCard" class="w-8 h-8" />
                <router-link to="/" class="font-bold text-xl text-green-700 dark:text-green-300">
                    ScoreCard
                </router-link>
                <span
                    v-if="!isOnline"
                    class="w-2 h-2 rounded-full bg-red-500 shrink-0 animate-pulse"
                    :title="$t('Network.Offline')"
                    aria-label="Offline"
                ></span>
            </div>
            <NavControls />
        </div>
        <div v-if="showBack" class="flex items-center px-4 pb-2 space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <button @click="goBack" class="flex items-center hover:text-gray-900 dark:hover:text-white" aria-label="Go back">
                <ArrowLeftIcon class="w-4 h-4 mr-1" />
            </button>

            <span v-if="breadcrumb.length" class="mx-1">/</span>
            <template v-for="(item, index) in breadcrumb" :key="item.path">
                <router-link :to="item.path" class="hover:underline flex items-center space-x-1"
                    v-if="index !== breadcrumb.length - 1">
                    <HomeIcon v-if="index === 0" class="w-4 h-4" />
                    <span v-else>{{ item.label }}</span>
                </router-link>
                <span v-else class="font-semibold flex items-center space-x-1">
                    <HomeIcon v-if="index === 0" class="w-4 h-4" />
                    <span v-else>{{ item.label }}</span>
                </span>
                <span v-if="index < breadcrumb.length - 1" class="mx-1">/</span>
            </template>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { RouteRecordNormalized } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useOnline } from '@vueuse/core'
import NavControls from '@/components/layout/NavControls.vue'
import { ArrowLeftIcon, HomeIcon } from '@heroicons/vue/24/solid'

const isOnline = useOnline()

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

function goBack() {
    router.back()
}

function buildDynamicPath(routeRecord: RouteRecordNormalized) {
    let path = routeRecord.path
    const params = route.params
    for (const key in params) {
        const val = params[key]
        if (typeof val === 'string') {
            path = path.replace(`:${key}`, val)
        }
    }
    return path
}

const breadcrumb = computed(() => {
    const chain: { path: string; label: string }[] = []
    const routeByName = Object.fromEntries(router.getRoutes().map(r => [r.name, r]))
    let current = routeByName[route.name as string]
    const visited = new Set<string>()

    while (current) {
        if (visited.has(current.name as string)) break
        visited.add(current.name as string)

        if (current.meta?.title && !current.meta?.hideFromBreadcrumb) {
            const path = current.path.includes(':') ? buildDynamicPath(current) : current.path

            const label = (() => {
                if (current.name === 'GamesDetail') return t('General.Scorecard')
                if (current.name === 'GamesHole') return route.params.holeId as string
                return t(current.meta.title as string)
            })()

            chain.unshift({ path, label })
        }

        current = routeByName[current.meta?.parent as string]
    }

    return chain
})

const showBack = computed(() =>
    ['/games', '/feedback', '/games/new', '/about'].some(prefix =>
        route.path === prefix || route.path.startsWith(prefix + '/')
    )
)
</script>
