import { cva, type VariantProps } from 'class-variance-authority';
export { default as Badge } from './Badge.vue';

export const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-accent text-accent-foreground',
        primary: 'bg-primary/10 text-primary',
        accent: 'bg-accent text-accent-foreground hover:bg-accent/70',
        outline: 'border border-border text-foreground hover:bg-accent/60',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;
