import type {
  Alumnus,
  Conversation,
  EventItem,
  Me,
  Message,
  Post,
  Student,
} from "../types";

const FIRST = [
  "Amelia", "Noah", "Priya", "Marcus", "Sofia", "Daniel", "Yara", "Kenji",
  "Isabella", "Tomás", "Aisha", "Lukas", "Mei", "Ezra", "Chiamaka", "Olivia",
  "Rahul", "Jana", "Liam", "Hana", "Jordan", "Naomi", "Cyrus", "Elena",
  "Mateo", "Sana", "Felix", "Talia", "Hugo", "Ruby", "Caleb", "Anaya",
  "Jonas", "Iris", "Andre", "Layla", "Wren", "Ines", "Owen", "Maya",
  "Theo", "Sasha", "Reza", "Lena", "Arjun", "Maeve", "Ivo", "Selin", "Ben", "Aria",
];

const LAST = [
  "Okafor", "Mendes", "Sharma", "Cole", "Petrov", "Nakamura", "Hassan", "Kim",
  "Romano", "Silva", "Patel", "Weiss", "Liu", "Brennan", "Adeyemi", "Holm",
  "Iyer", "Vogel", "Murphy", "Tanaka", "Reyes", "Goldberg", "Farahani", "Park",
  "Aguilar", "Khan", "Becker", "Levin", "Andersen", "Singh", "Ahmed", "Lopez",
  "Werner", "Lindqvist", "Diallo", "Haddad", "Carter", "Costa", "Walsh", "Mori",
];

const COMPANIES = [
  "Stripe", "Figma", "Anthropic", "Linear", "Notion", "Vercel", "OpenAI", "Apple",
  "Google", "McKinsey", "Goldman Sachs", "BlackRock", "Airbnb", "Spotify", "Atlassian",
  "Shopify", "Discord", "Cloudflare", "Databricks", "Ramp", "Mercury", "Brex",
  "Bain & Company", "BCG", "Pfizer", "Genentech", "SpaceX", "Rivian", "Patagonia",
];

const INDUSTRIES = [
  "Technology", "Finance", "Consulting", "Design", "Healthcare",
  "Media", "Education", "Venture Capital", "Biotech", "Climate",
];

const UNIVERSITIES = [
  "Stanford University", "MIT", "UC Berkeley", "Harvard", "Yale",
  "Princeton", "Carnegie Mellon", "Columbia", "UPenn", "Cornell",
];

const MAJORS = [
  "Computer Science", "Economics", "Mechanical Engineering", "Design",
  "Biology", "Mathematics", "Political Science", "Business", "Physics", "Psychology",
];

const ROLES = [
  "Software Engineer", "Product Manager", "Product Designer", "Data Scientist",
  "Engineering Manager", "Investment Associate", "Consultant", "UX Researcher",
  "Founder", "VP of Engineering", "Marketing Lead", "Operations Manager",
  "Research Scientist", "Solutions Architect", "Brand Designer",
];

const EXPERTISE = [
  "Career switching", "Resume review", "Mock interviews", "System design",
  "Product strategy", "Design portfolio", "Negotiation", "Founding a company",
  "VC fundraising", "Data engineering", "ML research", "Sales", "Marketing",
  "Public speaking", "PhD applications", "Open source", "Remote work",
];

const LOCATIONS = [
  "San Francisco, CA", "New York, NY", "London, UK", "Berlin, DE", "Tokyo, JP",
  "Toronto, CA", "Seattle, WA", "Austin, TX", "Lisbon, PT", "Singapore",
  "Boston, MA", "Amsterdam, NL", "Remote",
];

const GRADIENTS = [
  "#E07856,#F5C6A5", "#5B7C5A,#A8C09A", "#3A506B,#6E8FB5", "#7C5E4A,#C7A88E",
  "#8A6E9C,#C7B0D6", "#2F4858,#8DA7B5", "#B05F44,#E2A88F", "#4A6A55,#A4C0A0",
];

function pick<T>(arr: T[], i: number): T { return arr[i % arr.length]; }
function shuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = (seed * (i + 7)) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function makeAvatar(name: string): string {
  const initials = name.split(" ").map((n) => n[0]).join("");
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}&backgroundColor=transparent&radius=50`;
}

export const alumni: Alumnus[] = Array.from({ length: 30 }, (_, i) => {
  const name = `${pick(FIRST, i * 3)} ${pick(LAST, i * 5 + 1)}`;
  const gradYear = 1995 + ((i * 7) % 30);
  const company = pick(COMPANIES, i * 2 + 1);
  const role = pick(ROLES, i + 3);
  const industry = pick(INDUSTRIES, i + 2);
  const major = pick(MAJORS, i + 1);
  const university = pick(UNIVERSITIES, i);
  const exp = shuffle(EXPERTISE, i + 11).slice(0, 3 + (i % 3));
  return {
    id: `a${i + 1}`,
    name,
    avatar: makeAvatar(name),
    coverColor: pick(GRADIENTS, i),
    role,
    company,
    industry,
    location: pick(LOCATIONS, i + 4),
    gradYear,
    major,
    university,
    bio: `${role} at ${company}. ${major} grad from ${university} ('${String(gradYear).slice(2)}). Happy to chat about ${exp.slice(0, 2).join(" and ").toLowerCase()}.`,
    expertise: exp,
    workHistory: [
      { company, role, from: `${2024 - (i % 6)}`, to: "Present" },
      { company: pick(COMPANIES, i + 5), role: pick(ROLES, i + 1), from: `${gradYear + 2}`, to: `${2024 - (i % 6)}` },
      { company: pick(COMPANIES, i + 9), role: "Associate", from: `${gradYear}`, to: `${gradYear + 2}` },
    ],
    education: [{ school: university, degree: `B.S. ${major}`, year: gradYear }],
    available: i % 4 !== 0,
    online: i % 3 === 0,
  };
});

export const students: Student[] = Array.from({ length: 20 }, (_, i) => {
  const name = `${pick(FIRST, i * 5 + 2)} ${pick(LAST, i * 3 + 4)}`;
  return {
    id: `s${i + 1}`,
    name,
    avatar: makeAvatar(name),
    major: pick(MAJORS, i),
    gradYear: 2025 + (i % 4),
    university: pick(UNIVERSITIES, i + 2),
    interests: shuffle(EXPERTISE, i + 3).slice(0, 3),
  };
});

export const me: Me = {
  id: "me",
  name: "Avery Chen",
  avatar: makeAvatar("Avery Chen"),
  role: "student",
  major: "Computer Science",
  gradYear: 2026,
  university: "Stanford University",
  bio: "Junior studying CS. Interested in product engineering and design systems.",
  stats: { connections: 47, pending: 3, events: 4, unread: 6 },
};

const now = Date.now();
const ago = (mins: number) => new Date(now - mins * 60_000).toISOString();
const ahead = (days: number) => new Date(now + days * 86_400_000).toISOString();

export const conversations: Conversation[] = alumni.slice(0, 8).map((a, i) => ({
  id: `c${i + 1}`,
  participantId: a.id,
  lastMessageAt: ago(i * 47 + 5),
  unread: i < 3 ? (i + 1) : 0,
}));

export const messages: Message[] = conversations.flatMap((c, ci) => {
  const base = ci * 7;
  return [
    { id: `m${base + 1}`, conversationId: c.id, senderId: c.participantId, body: "Hey! Saw your profile — happy to chat about product internships.", createdAt: ago(180 + ci * 47), read: true },
    { id: `m${base + 2}`, conversationId: c.id, senderId: "me", body: "Thanks so much for reaching out!", createdAt: ago(170 + ci * 47), read: true },
    { id: `m${base + 3}`, conversationId: c.id, senderId: "me", body: "Would love to hear how you broke into product after CS.", createdAt: ago(168 + ci * 47), read: true },
    { id: `m${base + 4}`, conversationId: c.id, senderId: c.participantId, body: "Sure — easiest path is to ship things. Have you tried building a side project end-to-end?", createdAt: ago(160 + ci * 47), read: true },
    { id: `m${base + 5}`, conversationId: c.id, senderId: "me", body: "Working on one right now actually.", createdAt: ago(60 + ci * 47), read: true },
    { id: `m${base + 6}`, conversationId: c.id, senderId: c.participantId, body: "Love that. Send it when it's ready.", createdAt: ago(10 + ci * 47), read: ci >= 3 },
  ];
});




export const events: EventItem[] = Array.from({ length: 9 }, (_, i) => {
  const future = i < 6;
  const date = future ? ahead(2 + i * 3) : new Date(now - 86_400_000 * (i * 4)).toISOString();
  const titles = [
    "Alumni × Students: Product Engineering Night",
    "Breaking Into VC — Panel & Q&A",
    "Design Systems Workshop",
    "Founders' Roundtable",
    "Climate Tech Career Fair",
    "ML Research Open House",
    "Resume Review Marathon",
    "Negotiation Workshop",
    "Year-End Mixer",
  ];
  return {
    id: `e${i + 1}`,
    title: titles[i],
    description: "A curated gathering of alumni and students for honest conversation, structured introductions, and a bit of fun. Light refreshments provided.",
    date,
    endDate: new Date(new Date(date).getTime() + 2 * 60 * 60 * 1000).toISOString(),
    location: i % 2 === 0 ? "Online via Zoom" : pick(LOCATIONS, i + 1),
    virtual: i % 2 === 0,
    hostId: alumni[i % alumni.length].id,
    cover: pick(GRADIENTS, i + 2),
    attendees: alumni.slice(0, 8 + i).map((a) => a.id),
    going: i === 0 || i === 3,
  };
});

export const posts: Post[] = Array.from({ length: 14 }, (_, i) => {
  const author = i % 3 === 0 ? "me" : alumni[(i * 5) % alumni.length].id;
  const bodies = [
    "Just shipped our new design system at work — wild how much velocity it unlocked. Happy to share lessons learned.",
    "Reminder: the 'right' next job is the one that lets you become someone new. Optimize for growth, not titles.",
    "Hot take: most coding interviews don't measure what they think they do. Build things in public instead.",
    "Hosting office hours this Friday at 4pm PT — bring resumes, side projects, or just questions about industry.",
    "Three years in product and the lesson keeps repeating: clarity beats cleverness, every single time.",
    "Looking to hire a new grad SWE who loves design. DM if you know anyone.",
    "Sometimes the bravest thing is to stay. Sometimes it's to leave. The hard part is knowing which.",
    "Underrated career skill: writing a clear one-pager.",
    "Don't underestimate the compounding power of small, weekly check-ins with mentors.",
    "If you're a sophomore reading this — you have more time than you think. Build slowly, build deliberately.",
    "Anyone else find that the best advice they got was the advice they didn't take seriously the first time?",
    "Just hit 3 years at the same company. Surprised, in a good way.",
    "Hiring season tip: behavioral interviews are won in the prep, not the room.",
    "A reminder that side projects don't need to become startups to be worth doing.",
  ];
  return {
    id: `p${i + 1}`,
    authorId: author,
    content: bodies[i],
    createdAt: ago(i * 53 + 10),
    reactions: [
      { emoji: "👏", count: 3 + (i * 4) % 18 },
      { emoji: "💡", count: 1 + (i * 3) % 12 },
      { emoji: "🎉", count: i % 5 },
      { emoji: "❤️", count: 2 + (i * 7) % 24 },
    ],
    comments: i % 3 === 0 ? [
      { id: `cm${i}a`, authorId: alumni[(i + 1) % alumni.length].id, body: "Love this — would echo all of it.", createdAt: ago(i * 53 + 5) },
    ] : [],
  };
});
