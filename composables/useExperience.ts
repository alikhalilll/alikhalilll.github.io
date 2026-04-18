export interface Role {
  company: string;
  title: string;
  start: string;
  end: string | null;
  location: string;
  highlights: string[];
  link?: string;
}

export const useExperience = () => {
  const roles: Role[] = [
    {
      company: 'eDialogue Corner Society',
      title: 'Frontend Team Lead / Senior Frontend Developer',
      start: '2025-06-01',
      end: null,
      location: 'Remote · Saudi Arabia',
      highlights: [
        'Lead the frontend team building Ataa SaaS, a multi-tenant platform powering CRM, dashboards, and real-time communication for charitable organizations across Saudi Arabia.',
        'Architected a modular Nuxt 3 + Vue 3 + TypeScript frontend; shipped a unified Tailwind + ShadCN + UnoCSS design system with full RTL/LTR support and WCAG 2.1 accessibility.',
        'Built real-time modules on Pusher: typing indicators, read receipts, synchronized multi-tab presence.',
        'Integrated Apple Pay, Google Pay, and Moyasar; implemented GitLab + Docker CI/CD.',
        'Improved Lighthouse metrics — LCP +40%, CLS −60% — through optimization and lazy hydration.',
        'Mentor developers, run code reviews, enforce performance and accessibility standards.',
      ],
    },
    {
      company: 'PAIR AI',
      title: 'Frontend Team Lead / Senior Frontend Developer (Part-time)',
      start: '2025-07-01',
      end: '2025-11-01',
      location: 'Remote · Egypt',
      link: 'https://production.trypair.ai',
      highlights: [
        'Led development of a high-performance real-time chat application on Nuxt 4, Vue 3, and TypeScript.',
        'Designed a modular registry-based WebSocket layer (Pusher) for scalable event management.',
        'Implemented message synchronization and deduplication; virtualized rendering and lazy hydration for speed.',
        'Secured local data with AES-GCM + PBKDF2 in IndexedDB.',
        'Pinia for reactive state, Tailwind + UnoCSS for maintainable responsive design.',
      ],
    },
    {
      company: 'Velents.ai',
      title: 'Senior Frontend Developer',
      start: '2023-11-01',
      end: '2025-08-01',
      location: 'Remote · Saudi Arabia',
      link: 'https://crm.velents.com',
      highlights: [
        'Built and optimized AI-driven recruitment platforms in Vue.js + TypeScript; integrated video/audio recording.',
        'Designed interactive drag-and-drop CRUD interfaces.',
        'Refactored legacy Vue codebases for performance, accessibility, and maintainability.',
        'Implemented E2E testing pipelines; reduced load times across modules.',
      ],
    },
    {
      company: 'Codebase',
      title: 'Frontend Developer',
      start: '2023-01-01',
      end: '2023-12-01',
      location: 'Egypt',
      highlights: [
        'Delivered responsive interfaces using Vue 2, Vue 3, and TypeScript.',
        'Enhanced performance via lazy loading, code splitting, and component reuse.',
        'Employee of the Month — September 2023.',
      ],
    },
    {
      company: 'Grand Community',
      title: 'Frontend Developer',
      start: '2022-04-01',
      end: '2023-01-01',
      location: 'Egypt',
      highlights: [
        'Improved a large-scale influencer marketing platform built with Vue 2, Nuxt 2, and Vuetify.',
        'Standardized code structure and created reusable component patterns.',
        'Mentored junior developers on Vue/Nuxt best practices.',
        'Employee of the Month — May 2022.',
      ],
    },
    {
      company: 'IX Solutions',
      title: 'Frontend Developer',
      start: '2022-11-01',
      end: '2023-02-01',
      location: 'Egypt',
      highlights: [
        'Developed enterprise web applications using Angular and Material UI.',
        'Translated business needs into intuitive, scalable frontend solutions.',
      ],
    },
  ];

  return { roles };
};
