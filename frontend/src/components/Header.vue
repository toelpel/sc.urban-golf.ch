<template>
    <nav class="sticky top-0 z-50 bg-white/70 backdrop-blur dark:bg-gray-800/70 border-b dark:border-gray-700">
        <div class="flex justify-between items-center px-4 py-2">
            <!-- Logo + Link -->
            <div class="flex items-center space-x-4">
                <img src="/icons/web-app-manifest-192x192.png" alt="ScoreCard" class="w-8 h-8" />
                <router-link to="/" class="font-bold text-xl text-green-700 dark:text-green-300">
                    ScoreCard
                </router-link>
            </div>
            <NavControls />
        </div>
        <!-- Zeile 2: Zurück + Breadcrumb -->
        <div v-if="showBack" class="flex items-center px-4 pb-2 space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <!-- Zurück-Button -->
            <button @click="goBack" class="flex items-center hover:text-gray-900 dark:hover:text-white">
                <ArrowLeftIcon class="w-4 h-4 mr-1" />
            </button>

            <!-- Breadcrumb -->
            <span v-if="breadcrumb.length" class="mx-1">/</span>
            <template v-for="(item, index) in breadcrumb" :key="item.path">
                <router-link :to="item.path" class="hover:underline" v-if="index !== breadcrumb.length - 1">{{
                    item.label }}</router-link>
                <span v-else class="font-semibold">{{ item.label }}</span>
                <span v-if="index < breadcrumb.length - 1" class="mx-1">/</span>
            </template>
        </div>
    </nav>
</template>

<script setup>
import { computed, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import NavControls from './NavControls.vue'
import { ArrowLeftIcon } from '@heroicons/vue/24/solid'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const gameName = ref('')

function goBack() {
    router.back()
}

function buildDynamicPath(routeRecord) {
    let path = routeRecord.path
    const params = route.params
    for (const key in params) {
        path = path.replace(`:${key}`, params[key])
    }
    return path
}

const breadcrumb = computed(() => {
    const chain = []
    const routeByName = Object.fromEntries(router.getRoutes().map(r => [r.name, r]))
    let current = routeByName[route.name]

    while (current) {
        if (current.meta?.title) {
            const path = current.path.includes(':') ? buildDynamicPath(current) : current.path

            const label = (() => {
                if (current.name === 'GamesHole') {
                    return route.params.holeId
                }
                if (current.name === 'GamesDetail') {
                    return gameName.value
                }
                return t(current.meta.title)
            })()

            chain.unshift({ path, label })
        }

        current = routeByName[current.meta?.parent]
    }

    return chain
})

const showBack = computed(() =>
    ['/games', '/feedback', '/games/new'].some(prefix =>
        route.path === prefix || route.path.startsWith(prefix + '/')
    )
)

watchEffect(async () => {
    const relevant =
        route.name === 'GamesDetail' ||
        route.name === 'GamesHole'

    if (relevant && route.params.gameId) {
        try {
            const gameId = parseInt(route.params.gameId)
            const { data } = await axios.get('/games')
            const game = data.find(g => g.id === gameId)
            gameName.value = game ? game.name : `${t('Navigation.Game')} ${gameId}`
        } catch {
            gameName.value = `${t('Navigation.Game')} ${route.params.gameId}`
        }
    }
})
</script>