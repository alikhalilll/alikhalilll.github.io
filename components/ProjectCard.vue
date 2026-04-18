<script setup lang="ts">
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

defineProps<{
  title: string;
  description: string;
  tags?: string[];
  href?: string;
  repo?: string;
  year?: string;
  icon?: string;
}>();
</script>

<template>
  <Card class="group flex h-full flex-col">
    <CardHeader>
      <div class="mb-2 flex items-center justify-between">
        <span
          v-if="icon"
          class="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary"
        >
          <Icon :name="icon" class="size-5" />
        </span>
        <span
          v-if="year"
          class="text-xs font-medium uppercase tracking-widest text-muted-foreground"
        >
          {{ year }}
        </span>
      </div>
      <CardTitle class="text-2xl">{{ title }}</CardTitle>
      <CardDescription class="text-base leading-relaxed">
        {{ description }}
      </CardDescription>
    </CardHeader>

    <CardContent v-if="tags && tags.length" class="mt-auto pt-0">
      <div class="flex flex-wrap gap-2">
        <Badge v-for="t in tags" :key="t">{{ t }}</Badge>
      </div>
    </CardContent>

    <CardFooter class="pt-4">
      <a
        v-if="href"
        :href="href"
        target="_blank"
        rel="noopener"
        class="inline-flex items-center gap-1 text-sm font-medium text-primary no-underline hover:underline"
      >
        Visit <Icon name="lucide:arrow-up-right" class="size-3.5" />
      </a>
      <a
        v-if="repo"
        :href="repo"
        target="_blank"
        rel="noopener"
        class="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground no-underline hover:text-foreground"
      >
        Source <Icon name="lucide:github" class="size-3.5" />
      </a>
    </CardFooter>
  </Card>
</template>
