import { logger } from '@utils/logger';

async function main(): Promise<void> {
  logger.info(
    'Database seeding is now managed through Supabase migrations and supabase/seed.sql. '
      + 'Run `supabase db reset --seed` to apply sample data.'
  );
}

main().catch((error) => {
  logger.error('Seed script failed', { error });
  process.exit(1);
});
