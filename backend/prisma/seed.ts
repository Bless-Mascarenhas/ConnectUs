import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import {
  alumni,
  conversations,
  events,
  me,
  messages,
  posts,
  students,
} from "../src/data/seed";

const prisma = new PrismaClient();

async function main() {
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();

  await prisma.post.deleteMany();
  await prisma.event.deleteMany();
  await prisma.student.deleteMany();
  await prisma.alumnus.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: {
      id: me.id,
      name: me.name,
      avatar: me.avatar,
      role: me.role,
      major: me.major,
      gradYear: me.gradYear,
      university: me.university,
      bio: me.bio,
      stats: me.stats,
    },
  });

  await prisma.alumnus.createMany({
    data: alumni.map((a) => ({
      id: a.id,
      name: a.name,
      avatar: a.avatar,
      coverColor: a.coverColor,
      role: a.role,
      company: a.company,
      industry: a.industry,
      location: a.location,
      gradYear: a.gradYear,
      major: a.major,
      university: a.university,
      bio: a.bio,
      expertise: a.expertise,
      workHistory: a.workHistory,
      education: a.education,
      available: a.available,
      online: a.online,
    })),
  });

  await prisma.student.createMany({
    data: students.map((s) => ({
      id: s.id,
      name: s.name,
      avatar: s.avatar,
      major: s.major,
      gradYear: s.gradYear,
      university: s.university,
      interests: s.interests,
    })),
  });

  await prisma.conversation.createMany({
    data: conversations.map((c) => ({
      id: c.id,
      participantId: c.participantId,
      lastMessageAt: new Date(c.lastMessageAt),
      unread: c.unread,
    })),
  });

  await prisma.message.createMany({
    data: messages.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      senderId: m.senderId,
      body: m.body,
      createdAt: new Date(m.createdAt),
      read: m.read,
    })),
  });


  await prisma.event.createMany({
    data: events.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      date: new Date(e.date),
      endDate: new Date(e.endDate),
      location: e.location,
      virtual: e.virtual,
      hostId: e.hostId,
      cover: e.cover,
      attendees: e.attendees,
      going: e.going,
    })),
  });

  await prisma.post.createMany({
    data: posts.map((p) => ({
      id: p.id,
      authorId: p.authorId,
      content: p.content,
      image: p.image ?? null,
      createdAt: new Date(p.createdAt),
      reactions: p.reactions,
      comments: p.comments,
    })),
  });

  console.log("Seed complete:", {
    alumni: alumni.length,
    students: students.length,
    conversations: conversations.length,
    messages: messages.length,

    events: events.length,
    posts: posts.length,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
