<template>
  <div class="text-center mt-10">
    <h1 class="text-3xl font-bold mb-4">{{ $t('Home-Title') }}</h1>
    <p class="mb-6 text-gray-700 dark:text-gray-300">
      {{ $t('Home-Text') }}
    </p>
    <div class="flex flex-col items-stretch gap-3 mt-6">
      <router-link
        to="/newgame"
        class="button-primary w-full text-center"
      >
        🆕 {{ $t('NewGame') }}
      </router-link>
      <router-link
        to="/listgames"
        class="button-primary w-full text-center"
      >
        📋 {{ $t('Games') }}
      </router-link>
      <router-link
        to="/feedback"
        class="button-primary w-full text-center"
      >
        💬 {{ $t('Feedback') }}
      </router-link>
    </div>
  </div>
</template>

<script setup>
</script>