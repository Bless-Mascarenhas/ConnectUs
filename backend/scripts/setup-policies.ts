import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Setting up Supabase Storage RLS policies...");
  try {
    // Ensure RLS is enabled
    await prisma.$executeRawUnsafe(`ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;`);

    // 1. Public Read Access
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Public Read Access" 
      ON storage.objects FOR SELECT 
      USING (bucket_id IN ('avatars', 'event-covers', 'post-images'));
    `).catch(e => console.log('Select policy:', e.message));

    // 2. Authenticated Insert Access
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Authenticated Insert Access" 
      ON storage.objects FOR INSERT 
      TO authenticated 
      WITH CHECK (bucket_id IN ('avatars', 'event-covers', 'post-images'));
    `).catch(e => console.log('Insert policy:', e.message));

    // 3. Authenticated Update Access
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Authenticated Update Access" 
      ON storage.objects FOR UPDATE 
      TO authenticated 
      USING (bucket_id IN ('avatars', 'event-covers', 'post-images'));
    `).catch(e => console.log('Update policy:', e.message));

    // 4. Authenticated Delete Access
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Authenticated Delete Access" 
      ON storage.objects FOR DELETE 
      TO authenticated 
      USING (bucket_id IN ('avatars', 'event-covers', 'post-images'));
    `).catch(e => console.log('Delete policy:', e.message));

    console.log("✅ Successfully created storage RLS policies.");
  } catch (err) {
    console.error("❌ Error setting up policies:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
