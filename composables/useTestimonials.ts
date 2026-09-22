export interface Testimonial {
  quote: string;
  name: string;
  title: string;
  relationship: string;
  date: string;
}

export const useTestimonials = () => {
  const items: Testimonial[] = [
    {
      quote:
        'Ali raises the bar for what a great Senior Front-End Developer looks like. He built a clean, scalable architecture that kept our codebase consistent, and brings a calm, positive presence to the team.',
      name: 'Aalaa Waleed',
      title: 'Front-End Developer | Vue.js & Angular',
      relationship: 'Same team',
      date: '2025-11-10',
    },
    {
      quote:
        'On our CPaaS project Ali built a clean, feature-based, scalable architecture and simplified our GitFlow. He is proactive in refactoring, aligning shared code, and always willing to share knowledge across the team.',
      name: 'Ahmed Hamed',
      title: 'Full-Stack Web Developer | MERN',
      relationship: 'Same team',
      date: '2025-11-10',
    },
    {
      quote:
        'One of the best Senior Frontend Developers I have worked with. Ali has a talent for clean, intuitive UIs that are visually appealing and highly functional — and effortlessly bridges the gap between frontend and backend.',
      name: 'Ahmed Elsayed',
      title: 'Software Engineer @ Robusta Studio',
      relationship: 'Same team',
      date: '2025-01-26',
    },
    {
      quote:
        'Ali consistently demonstrated exceptional technical expertise and creativity with Vue.js, Nuxt, and modern front-end tooling. On Velents ATS he played a pivotal role in improving performance and redesigning the UI.',
      name: 'Mahmoud Attar',
      title: 'Senior Frontend / Full-Stack Engineer',
      relationship: 'Same team',
      date: '2025-01-15',
    },
    {
      quote:
        'Ali is honest, dependable, and incredibly hardworking. His front-end expertise was a huge advantage to our entire office — a true team player who brings out the best in everyone around him.',
      name: 'Shorouk Alkalla',
      title: 'Backend Developer | PHP Laravel Developer',
      relationship: 'Same team',
      date: '2022-12-04',
    },
    {
      quote:
        'Ali did an exceptional job on our recent projects. He is a productive, multi-skilled developer with vast knowledge — careful, proactive, self-motivated, and a real pleasure to work with.',
      name: 'Yomna Dessouki',
      title: 'Growth Manager at Halan',
      relationship: 'Same team',
      date: '2022-12-04',
    },
  ];

  return { items };
};
