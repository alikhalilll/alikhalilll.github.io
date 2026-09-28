export interface Project {
  title: string;
  description: string;
  tags: string[];
  href?: string;
  repo?: string;
  year: string;
  icon?: string;
  group: 'work' | 'open-source';
  featured?: boolean;
}

export const useProjects = () => {
  const projects: Project[] = [
    {
      title: 'PAIR AI Chat Platform',
      description:
        'Enterprise real-time chat built with Nuxt 4, Vue 3, and TypeScript. Uses a registry-based WebSocket layer on Pusher with typing indicators, read receipts, and synchronized multi-tab presence. Local data is secured with AES-GCM and PBKDF2 in IndexedDB.',
      tags: ['Nuxt 4', 'Vue 3', 'TypeScript', 'Pusher', 'WebCrypto'],
      href: 'https://production.trypair.ai',
      year: '2025',
      icon: 'lucide:messages-square',
      group: 'work',
      featured: true,
    },
    {
      title: 'Ataa SaaS, eDialogue Store',
      description:
        'Multi-tenant SaaS that powers CRM, donations, and real-time communication for charitable organizations across Saudi Arabia. Built with Nuxt 3, Vue 3, and TypeScript, backed by a unified Tailwind, ShadCN, and UnoCSS design system with full RTL and LTR support, and integrated with Apple Pay, Google Pay, and Moyasar.',
      tags: ['Nuxt 3', 'TypeScript', 'ShadCN', 'Payments', 'RTL'],
      href: 'https://store.edialoguec.org.sa',
      year: '2025',
      icon: 'lucide:heart-handshake',
      group: 'work',
      featured: true,
    },
    {
      title: 'Velents ATS',
      description:
        'AI-driven recruitment platform with video and audio recording modules, drag-and-drop CRUD interfaces, and analytical dashboards. Refactored legacy Vue codebases for accessibility, performance, and maintainability.',
      tags: ['Vue', 'Nuxt', 'TypeScript', 'AI', 'E2E'],
      href: 'https://crm.velents.com',
      year: '2024',
      icon: 'lucide:briefcase-business',
      group: 'work',
      featured: true,
    },
    {
      title: 'FitXpert Team',
      description:
        'SaaS fitness and wellness platform with workout and nutrition tracking. Built with Vue 3, Nuxt 3, and TypeScript, using Pinia for state management and a responsive, scalable UI.',
      tags: ['Nuxt 3', 'Vue 3', 'Pinia', 'SaaS'],
      href: 'https://fitexpert.team',
      year: '2024',
      icon: 'lucide:dumbbell',
      group: 'work',
    },
    {
      title: 'Salah Seleem Team (SST)',
      description:
        'B2C online training website focused on usability and fast-loading pages. Built with plain HTML5, CSS3, and JavaScript, kept intentionally lean.',
      tags: ['HTML', 'CSS', 'JavaScript'],
      href: 'https://salahseleemteam.com',
      year: '2023',
      icon: 'lucide:graduation-cap',
      group: 'work',
    },
    {
      title: 'E-Commerce Application (full-stack learning project)',
      description:
        'Full-stack e-commerce backend with Node.js, Express.js, and MongoDB (Mongoose). Includes JWT authentication, role-based access control (RBAC), Stripe and PayPal payments, search, filtering, pagination, input validation, rate limiting, and bcrypt.js for secure password handling.',
      tags: ['Node.js', 'Express', 'MongoDB', 'JWT', 'Stripe'],
      year: '2023',
      icon: 'lucide:shopping-cart',
      group: 'work',
    },
    {
      title: '@alikhalilll/nuxt-api-provider',
      description:
        'Strongly typed fetch client for Nuxt 3 and 4 with interceptors, retry and backoff, upload progress, and a framework-agnostic core that also runs outside Nuxt.',
      tags: ['Nuxt', 'TypeScript', 'HTTP'],
      href: 'https://alikhalilll.github.io/ali-nuxt-toolkit/api-provider',
      repo: 'https://github.com/alikhalilll/ali-nuxt-toolkit/tree/master/packages/api-provider',
      year: '2026',
      icon: 'lucide:arrow-right-left',
      group: 'open-source',
      featured: true,
    },
    {
      title: '@alikhalilll/nuxt-crypto',
      description:
        'AES-256-GCM and PBKDF2 via the Web Crypto API for Nuxt. Includes key caching, pluggable algorithms, an optional server-only mode, and device-fingerprint binding.',
      tags: ['Nuxt', 'Security', 'Web Crypto'],
      href: 'https://alikhalilll.github.io/ali-nuxt-toolkit/crypto',
      repo: 'https://github.com/alikhalilll/ali-nuxt-toolkit/tree/master/packages/crypto',
      year: '2026',
      icon: 'lucide:lock',
      group: 'open-source',
      featured: true,
    },
    {
      title: '@alikhalilll/nuxt-auto-middleware',
      description:
        'Layout to middleware mapping for Nuxt, with glob patterns, named groups, per-page overrides, and a typed middleware-name registry.',
      tags: ['Nuxt', 'Routing', 'DX'],
      href: 'https://alikhalilll.github.io/ali-nuxt-toolkit/auto-middleware',
      repo: 'https://github.com/alikhalilll/ali-nuxt-toolkit/tree/master/packages/auto-middleware',
      year: '2026',
      icon: 'lucide:layers',
      group: 'open-source',
      featured: true,
    },
    {
      title: '@alikhalilll/ui',
      description:
        'Headless, shadcn-vue style Vue 3 component library. Every component is its own importable subpath (`/tell-input`, `/popover`, `/drawer`, and so on) so consumers only ship what they use. Built on reka-ui and vaul-vue, themed via prefixed CSS variables, fully typed.',
      tags: ['Vue 3', 'Nuxt', 'Headless UI', 'Tailwind'],
      href: 'https://alikhalilll.github.io/ali-nuxt-toolkit/ui',
      repo: 'https://github.com/alikhalilll/ali-nuxt-toolkit/tree/master/packages/ui',
      year: '2026',
      icon: 'lucide:component',
      group: 'open-source',
      featured: true,
    },
  ];

  return {
    projects,
    work: projects.filter((p) => p.group === 'work'),
    openSource: projects.filter((p) => p.group === 'open-source'),
    featured: projects.filter((p) => p.featured),
  };
};
