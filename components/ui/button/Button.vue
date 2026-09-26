<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '@/lib/utils';
import { buttonVariants, type ButtonVariants } from './index';

interface Props {
  variant?: ButtonVariants['variant'];
  size?: ButtonVariants['size'];
  /** Fallback tag when `to` isn't provided. Defaults to `<button>`. */
  as?: string;
  class?: string;
  /** Route or external URL. When set, the button renders as `<NuxtLink>`
   *  so internal navigation stays client-side (and locale-aware). */
  to?: string;
  external?: boolean;
  target?: string;
  rel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
});

const component = computed(() => (props.to ? resolveComponent('NuxtLink') : props.as));

const classes = computed(() =>
  cn(buttonVariants({ variant: props.variant, size: props.size }), props.class)
);
</script>

<template>
  <component
    :is="component"
    :class="classes"
    :to="to"
    :external="external"
    :target="target"
    :rel="rel"
  >
    <slot />
  </component>
</template>
