/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  const component: DefineComponent<{}, {}, any> // eslint-disable-line @typescript-eslint/no-explicit-any
  export default component
}

declare module 'vue3-markdown-it' {
  import type { DefineComponent } from 'vue'
  const VueMarkdown: DefineComponent<{ source: string }>
  export default VueMarkdown
}
