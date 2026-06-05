/**
 * One-time script to create Supabase Storage buckets for ConnectUs.
 * Run with: npx tsx scripts/setup-storage.ts
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKETS = [
  { name: "avatars", public: true },
  { name: "event-covers", public: true },
  { name: "post-images", public: true },
];

async function main() {
  for (const bucket of BUCKETS) {
    const { data, error } = await supabase.storage.createBucket(bucket.name, {
      public: bucket.public,
      fileSizeLimit: 5 * 1024 * 1024, // 5 MB
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    });
    if (error) {
      if (error.message.includes("already exists")) {
        console.log(`✓ Bucket "${bucket.name}" already exists`);
      } else {
        console.error(`✗ Failed to create "${bucket.name}":`, error.message);
      }
    } else {
      console.log(`✓ Created bucket "${bucket.name}"`);
    }
  }
  console.log("\nDone! All buckets are ready.");
}

main();
