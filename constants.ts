import { Article, CoralImage, UserRole } from './types';

export const MOCK_ARTICLES: Article[] = [
  {
    id: '1',
    title: 'The Impact of Sunscreen on Coral Reefs',
    excerpt: 'Chemicals found in many common sunscreens are bleaching our reefs. Here is what you need to know.',
    content: 'Oxybenzone and octinoxate are two chemicals commonly found in sunscreens that have been shown to cause coral bleaching...',
    author: 'Dr. Keanu Reeves',
    date: '2023-10-15',
    imageUrl: 'https://picsum.photos/800/400?random=1',
    tags: ['Conservation', 'Science']
  },
  {
    id: '2',
    title: 'Responsible Tourism: How to Visit Hawaii Respectfully',
    excerpt: 'A guide to enjoying the islands while preserving their natural beauty for future generations.',
    content: 'When visiting Hawaii, it is crucial to stay on marked trails, respect wildlife distances, and use reef-safe products...',
    author: 'Leilani Kai',
    date: '2023-11-02',
    imageUrl: 'https://picsum.photos/800/400?random=2',
    tags: ['Tourism', 'Culture']
  }
];

export const MOCK_GALLERY: CoralImage[] = [
  {
    id: '101',
    url: 'https://picsum.photos/600/600?random=10',
    uploaderName: 'Dr. Alana Smith',
    date: '2023-11-10',
    location: 'Hanauma Bay, Oahu',
    description: 'Healthy lobe coral colony observed at 15ft depth.',
    scientificName: 'Porites lobata'
  },
  {
    id: '102',
    url: 'https://picsum.photos/600/600?random=11',
    uploaderName: 'Kai O.',
    date: '2023-11-12',
    location: 'Kealakekua Bay, Big Island',
    description: 'Evidence of early bleaching on this branching coral.',
    scientificName: 'Pocillopora meandrina'
  }
];

export const USER_ROLES_OPTIONS = [
  { value: UserRole.DONOR, label: 'Donor' },
  { value: UserRole.SCIENTIST, label: 'Scientist' },
  { value: UserRole.ADMIN, label: 'Admin' },
];