CREATE TABLE IF NOT EXISTS "Category" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Category_slug_key" ON "Category"("slug");

CREATE TABLE IF NOT EXISTS "GearGroup" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GearGroup_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Gear" (
  "id" TEXT NOT NULL,
  "brand" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "note" TEXT,
  "boughtAt" TIMESTAMP(3),
  "soldAt" TIMESTAMP(3),
  "inDrawer" BOOLEAN NOT NULL DEFAULT false,
  "purchaseUrl" TEXT,
  "eshopUrl" TEXT,
  "coverImageUrl" TEXT,
  "coverImagePublicId" TEXT,
  "containerId" TEXT,
  "sameModelGroupId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Gear_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Gear_categoryId_idx" ON "Gear"("categoryId");
CREATE INDEX IF NOT EXISTS "Gear_containerId_idx" ON "Gear"("containerId");
CREATE INDEX IF NOT EXISTS "Gear_sameModelGroupId_idx" ON "Gear"("sameModelGroupId");

CREATE TABLE IF NOT EXISTS "GearPrivateInfo" (
  "gearId" TEXT NOT NULL,
  "serial" TEXT,
  "purchasePrice" DECIMAL(12,2),
  "sellPrice" DECIMAL(12,2),
  "sellerName" TEXT,
  "sellerPhone" TEXT,
  "sellerEmail" TEXT,
  "sellerCity" TEXT,
  "sellerFb" TEXT,
  "buyerName" TEXT,
  "buyerPhone" TEXT,
  "buyerEmail" TEXT,
  "buyerAddress" TEXT,
  "buyerFb" TEXT,
  CONSTRAINT "GearPrivateInfo_pkey" PRIMARY KEY ("gearId")
);

CREATE TABLE IF NOT EXISTS "ArticleGear" (
  "articleId" TEXT NOT NULL,
  "gearId" TEXT NOT NULL,
  CONSTRAINT "ArticleGear_pkey" PRIMARY KEY ("articleId", "gearId")
);

CREATE INDEX IF NOT EXISTS "ArticleGear_gearId_idx" ON "ArticleGear"("gearId");

CREATE TABLE IF NOT EXISTS "Band" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  CONSTRAINT "Band_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Band_name_key" ON "Band"("name");

CREATE TABLE IF NOT EXISTS "Gig" (
  "id" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "city" TEXT NOT NULL,
  "place" TEXT,
  "name" TEXT,
  "bandId" TEXT NOT NULL,
  "note" TEXT,
  "photosUrl" TEXT,
  "recordingUrl" TEXT,
  "youtubeUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Gig_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Gig_date_idx" ON "Gig"("date");
CREATE INDEX IF NOT EXISTS "Gig_bandId_idx" ON "Gig"("bandId");

CREATE TABLE IF NOT EXISTS "GearOnGig" (
  "gearId" TEXT NOT NULL,
  "gigId" TEXT NOT NULL,
  CONSTRAINT "GearOnGig_pkey" PRIMARY KEY ("gearId", "gigId")
);

CREATE INDEX IF NOT EXISTS "GearOnGig_gigId_idx" ON "GearOnGig"("gigId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Gear_categoryId_fkey') THEN
    ALTER TABLE "Gear" ADD CONSTRAINT "Gear_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Gear_containerId_fkey') THEN
    ALTER TABLE "Gear" ADD CONSTRAINT "Gear_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "Gear"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Gear_sameModelGroupId_fkey') THEN
    ALTER TABLE "Gear" ADD CONSTRAINT "Gear_sameModelGroupId_fkey" FOREIGN KEY ("sameModelGroupId") REFERENCES "GearGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'GearPrivateInfo_gearId_fkey') THEN
    ALTER TABLE "GearPrivateInfo" ADD CONSTRAINT "GearPrivateInfo_gearId_fkey" FOREIGN KEY ("gearId") REFERENCES "Gear"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ArticleGear_articleId_fkey') THEN
    ALTER TABLE "ArticleGear" ADD CONSTRAINT "ArticleGear_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ArticleGear_gearId_fkey') THEN
    ALTER TABLE "ArticleGear" ADD CONSTRAINT "ArticleGear_gearId_fkey" FOREIGN KEY ("gearId") REFERENCES "Gear"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Gig_bandId_fkey') THEN
    ALTER TABLE "Gig" ADD CONSTRAINT "Gig_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "Band"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'GearOnGig_gearId_fkey') THEN
    ALTER TABLE "GearOnGig" ADD CONSTRAINT "GearOnGig_gearId_fkey" FOREIGN KEY ("gearId") REFERENCES "Gear"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'GearOnGig_gigId_fkey') THEN
    ALTER TABLE "GearOnGig" ADD CONSTRAINT "GearOnGig_gigId_fkey" FOREIGN KEY ("gigId") REFERENCES "Gig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

INSERT INTO "Category" ("id", "name", "slug", "position") VALUES
  ('cat-akustika', 'Akustika', 'akustika', 10),
  ('cat-aparat', 'Aparát', 'aparat', 20),
  ('cat-baskytara', 'Baskytara', 'baskytara', 30),
  ('cat-bezdrat', 'Bezdrát', 'bezdrat', 40),
  ('cat-box', 'Box', 'box', 50),
  ('cat-buffer', 'Buffer', 'buffer', 60),
  ('cat-delay', 'Delay', 'delay', 70),
  ('cat-digital', 'Digital', 'digital', 80),
  ('cat-ekvalizer', 'Ekvalizer', 'ekvalizer', 90),
  ('cat-kytara', 'Kytara', 'kytara', 100),
  ('cat-loadbox', 'Loadbox', 'loadbox', 110),
  ('cat-multiswitch', 'Multiswitch', 'multiswitch', 120),
  ('cat-multizdroj', 'Multizdroj', 'multizdroj', 130),
  ('cat-overdrive', 'Overdrive', 'overdrive', 140),
  ('cat-patchbay', 'Patchbay', 'patchbay', 150),
  ('cat-pedalboard', 'Pedalboard', 'pedalboard', 160),
  ('cat-power-amp', 'Power Amp', 'power-amp', 170),
  ('cat-snimace', 'Snímače', 'snimace', 180),
  ('cat-tuner', 'Tuner', 'tuner', 190)
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "position" = EXCLUDED."position";
