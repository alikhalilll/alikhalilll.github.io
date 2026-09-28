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
      location: 'Remote, Saudi Arabia',
      highlights: [
        'Lead the frontend team building Ataa SaaS, a multi-tenant platform that powers CRM, dashboards, and real-time communication for charitable organizations across Saudi Arabia.',
        'Architected a modular Nuxt 3, Vue 3, and TypeScript frontend, and delivered a unified Tailwind, ShadCN, and UnoCSS design system with full RTL and LTR support and WCAG 2.1 accessibility.',
        'Built real-time modules on Pusher, including typing indicators, read receipts, and synchronized multi-tab presence.',
        'Integrated Apple Pay, Google Pay, and Moyasar. Implemented GitLab and Docker based CI/CD.',
        'Improved Lighthouse metrics, raising LCP by roughly 40% and reducing CLS by roughly 60% through optimization and lazy hydration.',
        'Mentor developers, run code reviews, and enforce performance and accessibility standards.',
      ],
    },
    {
      company: 'PAIR AI',
      title: 'Frontend Team Lead / Senior Frontend Developer (Part-time)',
      start: '2025-07-01',
      end: '2025-11-01',
      location: 'Remote, Egypt',
      link: 'https://production.trypair.ai',
      highlights: [
        'Led the development of a high-performance real-time chat application built on Nuxt 4, Vue 3, and TypeScript.',
        'Designed a modular registry-based WebSocket layer on Pusher for scalable event management.',
        'Implemented message synchronization and deduplication, plus virtualized rendering and lazy hydration to improve responsiveness.',
        'Secured local data with AES-GCM and PBKDF2 in IndexedDB.',
        'Used Pinia for reactive state and Tailwind with UnoCSS for maintainable, responsive design.',
      ],
    },
    {
      company: 'Velents.ai',
      title: 'Senior Frontend Developer',
      start: '2023-11-01',
      end: '2025-08-01',
      location: 'Remote, Saudi Arabia',
      link: 'https://crm.velents.com',
      highlights: [
        'Built and optimized AI-driven recruitment platforms in Vue.js and TypeScript. Integrated video and audio recording.',
        'Designed interactive drag-and-drop CRUD interfaces.',
        'Refactored legacy Vue codebases for performance, accessibility, and maintainability.',
        'Implemented end-to-end testing pipelines and reduced load times across multiple modules.',
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
        'Enhanced performance through lazy loading, code splitting, and component reuse.',
        'Employee of the Month, September 2023.',
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
        'Mentored junior developers on Vue and Nuxt best practices.',
        'Employee of the Month, May 2022.',
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
        'Translated business requirements into intuitive, scalable frontend solutions.',
      ],
    },
  ];

  return { roles };
};
