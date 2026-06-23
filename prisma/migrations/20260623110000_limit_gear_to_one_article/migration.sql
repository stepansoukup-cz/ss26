DELETE FROM "ArticleGear" a
USING "ArticleGear" b
WHERE a."gearId" = b."gearId"
  AND a.ctid > b.ctid;

DROP INDEX IF EXISTS "ArticleGear_gearId_idx";
CREATE UNIQUE INDEX IF NOT EXISTS "ArticleGear_gearId_key" ON "ArticleGear"("gearId");
