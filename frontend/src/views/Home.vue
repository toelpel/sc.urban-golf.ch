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
    <div class="mt-8 max-w-md mx-auto p-4 bg-yellow-100 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 rounded shadow">
      <i18n-t keypath="BetaBox-Text">
        <strong class="font-semibold" />
        <feedbackLink>
          <router-link to="/feedback" class="underline hover:text-yellow-700 dark:hover:text-yellow-200" />
        </feedbackLink>
      </i18n-t>
    </div>
  </div>
</template>

<script setup>
</script>