<template>
  <DefaultLayout>
    <div class="text-center">
      <h1 class="maintitle">{{ $t('Home.Title') }}</h1>
      <p class="mb-6 text-gray-700 dark:text-gray-300">
        {{ $t('Home.Text') }}
      </p>

      <!-- Primary Actions -->
      <div class="flex flex-col items-stretch gap-3 mt-6">
        <router-link to="/games/new" class="button-primary w-full text-center">
          {{ $t('General.NewGame') }}
        </router-link>
        <router-link to="/games" class="button-primary w-full text-center">
          {{ $t('General.Games') }}
        </router-link>
        <router-link to="/feedback" class="button-primary w-full text-center">
          {{ $t('General.Feedback') }}
        </router-link>
        <router-link to="/about" class="button-primary w-full text-center">
          {{ $t('About.Title') }}
        </router-link>
      </div>
      <!-- Open Source Infobox -->
      <div class="mt-6 text-left">
        <a href="https://github.com/toelpel/sc.urban-golf.ch" target="_blank" rel="noopener noreferrer" class="block rounded-xl p-4 md:p-4 backdrop-blur
           bg-white/40 dark:bg-gray-800/50 ring-1 ring-white/30 dark:ring-white/10
           shadow-md hover:shadow-lg transition" aria-label="Open Source Contribution auf GitHub">
          <div class="flex items-start gap-3 md:gap-4">
            <div class="h-9 w-9 rounded-lg flex items-center justify-center
                  bg-gray-900 text-white dark:bg-white dark:text-gray-900 shrink-0">
              <CodeBracketSquareIcon class="h-5 w-5" aria-hidden="true" />
            </div>

            <div class="min-w-0 flex-1">
              <h2 class="text-base font-semibold text-gray-900 dark:text-white">
                {{ $t('Home.OpenSource.Title') }}
              </h2>
              <p class="text-sm text-gray-600 dark:text-gray-300">
                {{ $t('Home.OpenSource.Text') }}
              </p>

              <span class="mt-2 inline-flex items-center gap-1 text-blue-700 dark:text-blue-300
                 font-medium underline-offset-4 hover:underline">
                Contribute
                <ArrowTopRightOnSquareIcon class="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
          </div>
        </a>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { CodeBracketSquareIcon, ArrowTopRightOnSquareIcon } from '@heroicons/vue/24/outline'
</script>
