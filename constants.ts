import { Article, CoralImage, UserRole } from './types';

// Official Stylized Yumin Edu Circular Logo
export const YUMIN_LOGO_URL = 'https://jet-web-public.s3.us-west-2.amazonaws.com/user-uploads/1740645089333-logo.png';

// Official Website URLs
export const YUMIN_EDU_URL = 'https://yuminedu.net';
export const REEFTEACH_URL = 'https://kohalacenter.org/reefteach';
export const REEF_SAFE_DONATION_URL = 'https://www.paypal.com/donate/?hosted_button_id=E4YYY7YXDCKUY';

export const MOCK_ARTICLES: Article[] = [
  {
    id: '1',
    title: 'The Impact of Sunscreen on Coral Reefs',
    excerpt: 'Chemicals found in many common sunscreens are bleaching our reefs. Here is what you need to know to stay reef-safe.',
    content: 'Oxybenzone and octinoxate are two chemicals commonly found in sunscreens that have been shown to cause coral bleaching. Studies indicate that even small concentrations can disrupt coral reproduction and growth, making reefs more vulnerable to climate change.',
    author: 'Dr. Keanu Reeves',
    date: '2023-10-15',
    imageUrl: 'https://images.unsplash.com/photo-1583212292354-0837cc330f47?auto=format&fit=crop&q=80&w=1200',
    tags: ['Conservation', 'Science']
  },
  {
    id: '2',
    title: 'Responsible Tourism: How to Visit Hawaii Respectfully',
    excerpt: 'A guide to enjoying the islands while preserving their natural beauty for future generations through Pono behavior.',
    content: 'When visiting Hawaii, it is crucial to stay on marked trails, respect wildlife distances, and use reef-safe products. Tourism can have a significant footprint, but by choosing eco-friendly operators and practicing "Pono" (righteous) behavior, we can ensure the reefs thrive for years to come.',
    author: 'Leilani Kai',
    date: '2023-11-02',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-47a0159f963f?auto=format&fit=crop&q=80&w=1200',
    tags: ['Tourism', 'Culture']
  }
];

export const MOCK_GALLERY: CoralImage[] = [
  {
    id: '101',
    url: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&q=80&w=1000',
    uploaderName: 'Dr. Alana Smith',
    date: '2023-11-10',
    location: 'Hanauma Bay, Oahu',
    description: 'Healthy lobe coral colony observed at 15ft depth. High biodiversity in the surrounding area.',
    scientificName: 'Porites lobata',
    milestones: [
      { id: 'm1', date: '2023-11-10', title: 'Initial Baseline Observation', description: 'Colony identified as healthy with 95% live cover.', status: 'healthy', imageUrl: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&q=80&w=800' },
      { id: 'm2', date: '2023-12-05', title: 'Spawning Prep', description: 'Pre-spawning indicators observed on the colony surface.', status: 'healthy', imageUrl: 'https://images.unsplash.com/photo-1583212292354-0837cc330f47?auto=format&fit=crop&q=80&w=800' },
      { id: 'm3', date: '2024-01-20', title: 'Post-Storm Vitality', description: 'Resilience verified after significant winter swell.', status: 'healthy', imageUrl: 'https://images.unsplash.com/photo-1544551763-47a0159f963f?auto=format&fit=crop&q=80&w=800' }
    ]
  },
  {
    id: '102',
    url: 'https://images.unsplash.com/photo-1682687220199-d0124f48f95b?auto=format&fit=crop&q=80&w=1000',
    uploaderName: 'Kai O.',
    date: '2023-11-12',
    location: 'Kealakekua Bay, Big Island',
    description: 'Evidence of early bleaching on this branching coral. Monitoring required for temperature spikes.',
    scientificName: 'Pocillopora meandrina',
    milestones: [
      { id: 'm4', date: '2023-11-12', title: 'Bleaching Detection', description: 'Pale polyps observed; likely due to El Niño warming.', status: 'warning', imageUrl: 'https://images.unsplash.com/photo-1682687220199-d0124f48f95b?auto=format&fit=crop&q=80&w=800' },
      { id: 'm5', date: '2023-12-28', title: 'Peak Stress Period', description: 'Color loss increased to 40% of colony surface.', status: 'warning', imageUrl: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&q=80&w=800' },
      { id: 'm6', date: '2024-02-15', title: 'Color Recovery', description: 'Zooxanthellae levels returning as temperatures stabilize.', status: 'recovery', imageUrl: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&q=80&w=800' }
    ]
  },
  {
    id: '103',
    url: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&q=80&w=1000',
    uploaderName: 'Marine Expert',
    date: '2023-12-01',
    location: 'Molokini Crater, Maui',
    description: 'Vibrant ecosystem showcasing healthy coral cover and diverse fish populations.',
    scientificName: 'Pocillopora',
    milestones: [
      { id: 'm7', date: '2023-12-01', title: 'Ecosystem Vitality Check', description: 'Flourishing biodiversity with zero visible stressors.', status: 'healthy', imageUrl: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&q=80&w=800' }
    ]
  }
];

export const USER_ROLES_OPTIONS = [
  { value: UserRole.DONOR, label: 'Donor' },
  { value: UserRole.SCIENTIST, label: 'Scientist' },
  { value: UserRole.ADMIN, label: 'Admin' },
];