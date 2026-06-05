export interface Alumnus {
  id: string;
  name: string;
  avatar: string;
  coverColor: string;
  role: string;
  company: string;
  industry: string;
  location: string;
  gradYear: number;
  major: string;
  university: string;
  bio: string;
  expertise: string[];
  workHistory: { company: string; role: string; from: string; to: string }[];
  education: { school: string; degree: string; year: number }[];
  available: boolean;
  online: boolean;
}

export interface Me {
  id: string;
  name: string;
  avatar: string;
  role: "student" | "alumnus";
  major: string;
  gradYear: number;
  university: string;
  coverUrl?: string;
  bio: string;
  stats: { connections: number; pending: number; events: number; unread: number };
  experience: { role: string; org: string; from: string; to: string }[];
  interests: string[];
  preferences: { msgs: boolean; mentions: boolean; events: boolean; weekly: boolean; marketing: boolean };
}

export interface ConversationFull {
  id: string;
  participantId: string;
  participant: Alumnus;
  lastMessageAt: string;
  unread: number;
  last?: { body: string; senderId: string; createdAt: string };
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate: string;
  location: string;
  virtual: boolean;
  hostId: string;
  host?: Alumnus;
  cover: string;
  attendees: string[];
  attendeeProfiles?: Alumnus[];
  going: boolean;
}

export interface PostFull {
  id: string;
  authorId: string;
  author: Alumnus | Me;
  content: string;
  image?: string;
  createdAt: string;
  reactions: { emoji: string; count: number }[];
  comments: { id: string; authorId: string; body: string; createdAt: string }[];
}
