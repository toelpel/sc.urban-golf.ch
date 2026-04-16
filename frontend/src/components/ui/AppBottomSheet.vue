<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="modelValue" class="sheet" role="dialog" aria-modal="true" :aria-label="label">
        <div class="sheet__backdrop" @click="close"></div>
        <div
          ref="panelRef"
          class="sheet__panel"
          :class="{ 'sheet__panel--dragging': isDragging }"
          :style="panelStyle"
          role="document"
          @click.stop
        >
          <div
            class="sheet__grip"
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
            @pointercancel="onPointerUp"
          >
            <div class="sheet__handle" aria-hidden="true"></div>
            <header v-if="$slots.header || title" class="sheet__header">
              <slot name="header">
                <h2 class="t-subtitle">{{ title }}</h2>
              </slot>
            </header>
          </div>
          <div class="sheet__body">
            <slot></slot>
          </div>
          <footer v-if="$slots.footer" class="sheet__footer">
            <slot name="footer"></slot>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  title?: string
  label: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const panelRef = ref<HTMLElement | null>(null)
const dragY = ref(0)
const isDragging = ref(false)

// Aktiver Pointer — essenziell auf Touch-Devices wo mehrere Finger aktiv sein können
let activePointer = -1
let startY = 0
let startTime = 0

// Focus-Management: Element das vor dem Öffnen Focus hatte — wird beim Schliessen restauriert.
let returnFocusTo: HTMLElement | null = null

function close() {
  emit('update:modelValue', false)
}

function focusableElements(): HTMLElement[] {
  const root = panelRef.value
  if (!root) return []
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => !el.hasAttribute('aria-hidden') && el.offsetParent !== null)
}

function onPointerDown(e: PointerEvent) {
  if (!e.isPrimary) return
  startY = e.clientY
  startTime = Date.now()
  isDragging.value = true
  dragY.value = 0
  activePointer = e.pointerId
  ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging.value || e.pointerId !== activePointer) return
  const delta = e.clientY - startY
  // Nur Drag nach unten — oberhalb 0 klammern (kein Zerren nach oben)
  dragY.value = Math.max(0, delta)
}

function onPointerUp(e: PointerEvent) {
  if (!isDragging.value || e.pointerId !== activePointer) return

  const elapsed = Math.max(1, Date.now() - startTime)
  const velocity = dragY.value / elapsed          // px/ms
  const panelHeight = panelRef.value?.offsetHeight ?? 400

  // Dismiss-Schwellen:
  //   · mehr als 30% der Panel-Höhe (max 160 px) gezogen, ODER
  //   · schnell gewischt (>500 px/s)
  const passedDistance = dragY.value > Math.min(160, panelHeight * 0.3)
  const passedVelocity = velocity > 0.5

  ;(e.currentTarget as Element).releasePointerCapture(activePointer)
  activePointer = -1
  isDragging.value = false

  if (passedDistance || passedVelocity) {
    // Raus-Animation: weiter-sliden bis unter den Viewport, dann close()
    dragY.value = panelHeight + 60
    window.setTimeout(() => {
      close()
    }, 220)
  } else {
    // Snap-back in die Ruheposition
    dragY.value = 0
  }
}

const panelStyle = computed(() => {
  if (dragY.value === 0 && !isDragging.value) return {}
  return {
    transform: `translateY(${dragY.value}px)`,
    transition: isDragging.value
      ? 'none'
      : 'transform 220ms var(--ease-emphasize)',
  }
})

// Body-Scroll sperren, Focus-Management (trap + initial + restore), State-Reset
watch(
  () => props.modelValue,
  async (open) => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = open ? 'hidden' : ''
    }
    if (open) {
      // Aktuellen Focus merken — beim Schliessen restaurieren wir dorthin zurück
      returnFocusTo = (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement)
        ? document.activeElement
        : null
      await nextTick()
      // Initialer Focus auf erstes fokussierbares Element im Sheet
      const focusables = focusableElements()
      if (focusables.length) focusables[0].focus()
    } else {
      dragY.value = 0
      isDragging.value = false
      // Focus zurückgeben — Screen-Reader-User kehren kontextuell zurück
      if (returnFocusTo && typeof returnFocusTo.focus === 'function') {
        returnFocusTo.focus()
      }
      returnFocusTo = null
    }
  }
)

// Escape schliesst das Sheet. Tab wird innerhalb des Sheets gecirclet (Focus-Trap).
function onKeydown(e: KeyboardEvent) {
  if (!props.modelValue) return
  if (e.key === 'Escape') {
    e.preventDefault()
    close()
    return
  }
  if (e.key !== 'Tab') return
  const focusables = focusableElements()
  if (focusables.length === 0) return
  const first = focusables[0]
  const last = focusables[focusables.length - 1]
  const active = document.activeElement as HTMLElement | null
  if (e.shiftKey && active === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && active === last) {
    e.preventDefault()
    first.focus()
  }
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  if (typeof document !== 'undefined') document.body.style.overflow = ''
})
</script>

<style scoped>
.sheet {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.sheet__backdrop {
  position: absolute;
  inset: 0;
  background: color-mix(in oklab, var(--color-surface-950) 50%, transparent);
  backdrop-filter: blur(4px);
}

/* iOS-Performance: auf kleinen Devices Blur deaktivieren zugunsten opaker Fläche */
@media (max-width: 480px) {
  .sheet__backdrop {
    backdrop-filter: none;
    background: color-mix(in oklab, var(--color-surface-950) 65%, transparent);
  }
}

.sheet__panel {
  position: relative;
  background: var(--card-bg);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  border-top: 1px solid var(--card-border);
  box-shadow: var(--shadow-elev-3);
  padding: 0 1.25rem calc(1.5rem + var(--spacing-safe-bottom));
  max-height: 90dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  will-change: transform;
}

@media (min-width: 768px) {
  .sheet { justify-content: center; align-items: center; }
  .sheet__panel {
    border-radius: var(--radius-xl);
    border: 1px solid var(--card-border);
    max-width: 28rem;
    width: 100%;
    margin: 1rem;
  }
}

/* Drag-Zone: Handle + Header. touch-action none verhindert dass der Browser
   dazwischenfunkt (z.B. Pull-to-Refresh). cursor: grab signalisiert dass man
   hier anfassen kann. */
.sheet__grip {
  padding-top: 0.75rem;
  cursor: grab;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}

.sheet__panel--dragging .sheet__grip { cursor: grabbing; }

.sheet__handle {
  width: 2.75rem;
  height: 0.28rem;
  border-radius: 999px;
  background: color-mix(in oklab, var(--text-default) 22%, transparent);
  margin: 0 auto 0.9rem;
  transition: background 150ms, transform 150ms;
}

.sheet__panel--dragging .sheet__handle {
  background: color-mix(in oklab, var(--text-default) 40%, transparent);
  transform: scaleX(1.15);
}

.sheet__header { margin-bottom: 0.75rem; }
.sheet__body { overflow-y: auto; flex: 1 1 auto; }
.sheet__footer { padding-top: 0.9rem; margin-top: 0.5rem; border-top: 1px solid var(--divider); }

.sheet-enter-active,
.sheet-leave-active { transition: opacity 240ms var(--ease-standard); }
.sheet-enter-active .sheet__panel,
.sheet-leave-active .sheet__panel { transition: transform 280ms var(--ease-emphasize); }
.sheet-enter-from,
.sheet-leave-to { opacity: 0; }
.sheet-enter-from .sheet__panel,
.sheet-leave-to .sheet__panel { transform: translateY(20%); }
</style>
