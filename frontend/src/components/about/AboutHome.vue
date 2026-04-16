<template>
  <div class="container-app about-home">
    <header class="about-home__header">
      <h1 class="t-headline">{{ $t('About.Title') }}</h1>
    </header>

    <!-- Quick-Links ganz oben — die wichtigsten Ziele sind sofort erreichbar
         und signalisieren dass es nicht nur die Paragraphen gibt. -->
    <section class="about-home__links">
      <RouterLink to="/feedback" class="card card--padded card--interactive about-link">
        <ChatBubbleBottomCenterTextIcon class="w-5 h-5" />
        <span>{{ $t('General.Feedback') }}</span>
      </RouterLink>
      <RouterLink to="/about/changelog" class="card card--padded card--interactive about-link">
        <DocumentTextIcon class="w-5 h-5" />
        <span>{{ $t('About.ChangeLog.Title') }}</span>
      </RouterLink>
      <RouterLink to="/about/roadmap" class="card card--padded card--interactive about-link">
        <MapIcon class="w-5 h-5" />
        <span>{{ $t('About.Roadmap.Title') }}</span>
      </RouterLink>
    </section>

    <section class="about-home__paragraphs">
      <article
        v-for="para in paragraphs"
        :key="para.key"
        class="card card--padded about-para"
      >
        <span class="about-para__icon">
          <component :is="para.icon" class="w-5 h-5" aria-hidden="true" />
        </span>
        <p class="t-body">{{ $t(para.key) }}</p>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  UserGroupIcon,
  SparklesIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  ChatBubbleBottomCenterTextIcon,
  DocumentTextIcon,
  MapIcon,
} from '@heroicons/vue/24/outline'

const paragraphs = [
  { key: 'About.Paragraph1', icon: UserGroupIcon },
  { key: 'About.Paragraph2', icon: SparklesIcon },
  { key: 'About.Paragraph3', icon: DevicePhoneMobileIcon },
  { key: 'About.Paragraph4', icon: GlobeAltIcon },
] as const
</script>

<style scoped>
.about-home {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding-block: 1.25rem 2rem;
}

.about-home__paragraphs {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.about-para {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
}

.about-para__icon {
  width: 2.25rem;
  height: 2.25rem;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in oklab, var(--primary) 14%, transparent);
  color: var(--primary);
}

.about-home__links {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.6rem;
}

@media (min-width: 560px) {
  .about-home__links { grid-template-columns: repeat(3, 1fr); }
}

.about-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  font-weight: 600;
  color: var(--text-strong);
  text-decoration: none;
  padding: 1rem 1.25rem;
}
</style>
