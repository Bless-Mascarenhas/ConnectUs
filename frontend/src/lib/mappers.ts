import type { Alumnus, Me, Post } from "../types";
import type { Alumnus as DbAlumnus, Post as DbPost, User } from "@prisma/client";

export function mapAlumnus(row: DbAlumnus): Alumnus {
  return {
    id: row.id,
    name: row.name,
    avatar: row.avatar,
    coverColor: row.coverColor,
    role: row.role,
    company: row.company,
    industry: row.industry,
    location: row.location,
    gradYear: row.gradYear,
    major: row.major,
    university: row.university,
    bio: row.bio,
    expertise: row.expertise as string[],
    workHistory: row.workHistory as Alumnus["workHistory"],
    education: row.education as Alumnus["education"],
    available: row.available,
    online: row.online,
  };
}

export function mapMe(row: User): Me {
  return {
    id: row.id,
    name: row.name,
    avatar: row.avatar,
    role: row.role as Me["role"],
    major: row.major,
    gradYear: row.gradYear,
    university: row.university,
    coverUrl: row.coverUrl || undefined,
    bio: row.bio,
    stats: row.stats as Me["stats"],
    experience: row.experience as Me["experience"],
    interests: row.interests as Me["interests"],
    preferences: row.preferences as Me["preferences"],
    username: row.username || undefined,
    onboardingComplete: row.onboardingComplete,
  };
}

export function mapPost(row: DbPost): Post {
  return {
    id: row.id,
    authorId: row.authorId,
    content: row.content,
    image: row.image ?? undefined,
    createdAt: row.createdAt.toISOString(),
    reactions: row.reactions as Post["reactions"],
    comments: row.comments as Post["comments"],
  };
}
