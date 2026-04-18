<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '@/lib/utils';
import { buttonVariants, type ButtonVariants } from './index';

interface Props {
  variant?: ButtonVariants['variant'];
  size?: ButtonVariants['size'];
  as?: string;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
});

const classes = computed(() =>
  cn(buttonVariants({ variant: props.variant, size: props.size }), props.class)
);
</script>

<template>
  <component :is="as" :class="classes">
    <slot />
  </component>
</template>
