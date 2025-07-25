<template>
  <DefaultTemplate>
    <div class="text-center">
      <h1 class="maintitle">{{ $t('Home.Title') }}</h1>
      <p class="mb-6 text-gray-700 dark:text-gray-300">
        {{ $t('Home.Text') }}
      </p>
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
        <router-link to="/aboutus" class="button-primary w-full text-center">
          {{ $t('AboutUs.Title') }}
        </router-link>
      </div>
      <div
        class="mt-8 max-w-md mx-auto p-1 bg-yellow-100 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 rounded shadow">
        {{ $t('Home.Beta.Title') }}<br />
        {{ $t('Home.Beta.Text') }} <router-link to="/feedback"
          class="underline hover:text-yellow-700 dark:hover:text-yellow-200">{{ $t('General.Feedback') }}</router-link>!
      </div>
    </div>
  </DefaultTemplate>
</template>

<script setup>
import DefaultTemplate from '@/layouts/DefaultTemplate.vue'
</script>