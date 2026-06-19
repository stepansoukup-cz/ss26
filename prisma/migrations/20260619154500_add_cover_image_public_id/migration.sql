-- Sloupce jsou nullable, protože starší články je nemusí mít.
-- IF NOT EXISTS drží migraci bezpečnou i pro databázi, kde byly sloupce dříve
-- doplněné přes prisma db push.
ALTER TABLE "Article"
ADD COLUMN IF NOT EXISTS "coverImagePublicId" TEXT,
ADD COLUMN IF NOT EXISTS "coverVideoPublicId" TEXT;
