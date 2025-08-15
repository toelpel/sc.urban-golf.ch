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
        <router-link to="/about" class="button-primary w-full text-center">
          {{ $t('About.Title') }}
        </router-link>
      </div>
    </div>
  </DefaultTemplate>
</template>

<script setup>
import DefaultTemplate from '@/layouts/DefaultTemplate.vue'
</script>