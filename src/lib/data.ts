export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  features: string[];
}

export interface Consultant {
  id: string;
  name: string;
  title: string;
  avatarGradient: string;
  initials: string;
  specialties: string[];
  available: boolean;
  rating: number;
}

export interface TimeSlot {
  time: string;
  label: string;
  period: 'Morning' | 'Afternoon' | 'Evening';
  status: 'available' | 'booked' | 'recommended';
}

export const services: Service[] = [
  {
    id: 'strategy-audit',
    name: 'Executive Strategy Audit',
    description: 'Deep-dive analysis of your business strategy, market positioning, and growth roadmap with a senior partner.',
    duration: 45,
    price: 250,
    category: 'Strategy',
    features: ['Market analysis', 'Growth roadmap', 'Competitor intelligence', '90-day action plan'],
  },
  {
    id: 'ai-automation',
    name: 'AI Automation Consultation',
    description: 'Identify automation opportunities in your workflows and design an AI implementation blueprint.',
    duration: 60,
    price: 350,
    category: 'AI & Automation',
    features: ['Workflow audit', 'AI opportunity map', 'Tool stack recommendations', 'Implementation timeline'],
  },
  {
    id: 'architecture-review',
    name: 'Full-Stack Architecture Review',
    description: 'Comprehensive technical architecture assessment covering scalability, security, and performance.',
    duration: 90,
    price: 500,
    category: 'Engineering',
    features: ['System audit', 'Scalability assessment', 'Security review', 'Architecture blueprint'],
  },
  {
    id: 'brand-positioning',
    name: 'Premium Brand Positioning',
    description: 'Craft a luxury brand narrative and positioning strategy that commands premium pricing.',
    duration: 45,
    price: 300,
    category: 'Branding',
    features: ['Brand audit', 'Positioning framework', 'Voice & tone guide', 'Premium pricing strategy'],
  },
  {
    id: 'growth-acceleration',
    name: 'Growth Acceleration Session',
    description: 'Unlock exponential growth channels with a data-driven customer acquisition strategy.',
    duration: 60,
    price: 400,
    category: 'Growth',
    features: ['Channel analysis', 'CAC optimization', 'Funnel design', 'Growth experiments'],
  },
  {
    id: 'executive-coaching',
    name: 'Executive Coaching Session',
    description: 'One-on-one leadership coaching for C-suite executives navigating scaling challenges.',
    duration: 50,
    price: 280,
    category: 'Leadership',
    features: ['Leadership assessment', 'Scaling strategy', 'Team dynamics', 'Personal roadmap'],
  },
];

export const consultants: Consultant[] = [
  {
    id: 'c1',
    name: 'Marcus Chen',
    title: 'Senior Strategy Partner',
    avatarGradient: 'from-emerald-400 to-teal-600',
    initials: 'MC',
    specialties: ['Strategy', 'Growth'],
    available: true,
    rating: 4.9,
  },
  {
    id: 'c2',
    name: 'Sofia Almeida',
    title: 'AI & Automation Lead',
    avatarGradient: 'from-cyan-400 to-blue-600',
    initials: 'SA',
    specialties: ['AI & Automation', 'Engineering'],
    available: true,
    rating: 5.0,
  },
  {
    id: 'c3',
    name: 'James Whitfield',
    title: 'Principal Architect',
    avatarGradient: 'from-teal-400 to-emerald-700',
    initials: 'JW',
    specialties: ['Engineering'],
    available: false,
    rating: 4.8,
  },
  {
    id: 'c4',
    name: 'Amara Okonkwo',
    title: 'Brand Director',
    avatarGradient: 'from-green-400 to-cyan-600',
    initials: 'AO',
    specialties: ['Branding'],
    available: true,
    rating: 4.9,
  },
  {
    id: 'c5',
    name: 'David Reyes',
    title: 'Growth Partner',
    avatarGradient: 'from-emerald-500 to-green-700',
    initials: 'DR',
    specialties: ['Growth', 'Strategy'],
    available: true,
    rating: 4.7,
  },
  {
    id: 'c6',
    name: 'Elena Vossberg',
    title: 'Executive Coach',
    avatarGradient: 'from-cyan-500 to-teal-700',
    initials: 'EV',
    specialties: ['Leadership'],
    available: true,
    rating: 5.0,
  },
];

const baseSlots = [
  { time: '08:00', label: '8:00 AM', period: 'Morning' as const },
  { time: '09:00', label: '9:00 AM', period: 'Morning' as const },
  { time: '10:00', label: '10:00 AM', period: 'Morning' as const },
  { time: '11:00', label: '11:00 AM', period: 'Morning' as const },
  { time: '12:00', label: '12:00 PM', period: 'Afternoon' as const },
  { time: '13:00', label: '1:00 PM', period: 'Afternoon' as const },
  { time: '14:00', label: '2:00 PM', period: 'Afternoon' as const },
  { time: '15:00', label: '3:00 PM', period: 'Afternoon' as const },
  { time: '16:00', label: '4:00 PM', period: 'Afternoon' as const },
  { time: '17:00', label: '5:00 PM', period: 'Evening' as const },
  { time: '18:00', label: '6:00 PM', period: 'Evening' as const },
  { time: '19:00', label: '7:00 PM', period: 'Evening' as const },
];

export function generateTimeSlots(seed: number): TimeSlot[] {
  return baseSlots.map((slot, idx) => {
    const hash = (seed + idx * 7) % 10;
    let status: TimeSlot['status'] = 'available';
    if (hash < 2) status = 'booked';
    else if (hash >= 8) status = 'recommended';
    return { ...slot, status };
  });
}

export function generateReferenceId(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `APX-${num}`;
}

export const currencies = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'AED', symbol: 'د.إ' },
];

export const languages = [
  { code: 'EN', label: 'English' },
  { code: 'ES', label: 'Español' },
  { code: 'FR', label: 'Français' },
  { code: 'AR', label: 'العربية' },
];
