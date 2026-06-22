CREATE TABLE IF NOT EXISTS "PasswordChangeCode" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "codeHash" TEXT NOT NULL,
  "pendingPasswordHash" TEXT NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PasswordChangeCode_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PasswordChangeCode_userId_idx" ON "PasswordChangeCode"("userId");
CREATE INDEX IF NOT EXISTS "PasswordChangeCode_expiresAt_idx" ON "PasswordChangeCode"("expiresAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'PasswordChangeCode_userId_fkey'
  ) THEN
    ALTER TABLE "PasswordChangeCode"
    ADD CONSTRAINT "PasswordChangeCode_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
