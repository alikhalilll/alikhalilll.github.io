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
        'A true team player — described me as dependable, hardworking, and a strong frontend contributor who lifts the whole office.',
      name: 'Shorouk Alkalla',
      title: 'Backend Developer',
      relationship: 'Same team',
      date: '2022-12-04',
    },
    {
      quote:
        'Praised my productivity, breadth of knowledge, and self-motivation on recent front-end projects we shipped together.',
      name: 'Yomna Dessouki',
      title: 'Growth Manager, Halan',
      relationship: 'Same team',
      date: '2022-12-04',
    },
    {
      quote:
        'Called out my work on maintainable, reliable web apps and the way I bridged the frontend and backend for smooth delivery.',
      name: 'Ahmed Elsayed',
      title: 'Software Engineer',
      relationship: 'Same team',
      date: '2023-11-20',
    },
    {
      quote:
        'Highlighted a clean, feature-based architecture I built for our CPaaS project — one they still reuse as a template.',
      name: 'Ahmed Hamed',
      title: 'Full-Stack Web Developer',
      relationship: 'Same team',
      date: '2023-11-30',
    },
    {
      quote:
        'Recommended me for any front-end role, noting my technical depth, creativity, and commitment to shipping quality.',
      name: 'Mahmoud Attar',
      title: 'Product Manager',
      relationship: 'Same team',
      date: '2023-11-20',
    },
  ];

  return { items };
};
