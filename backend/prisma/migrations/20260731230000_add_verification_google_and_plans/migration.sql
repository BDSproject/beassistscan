-- Lead : champs de plan payant
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "paidReport" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "proSubscription" BOOLEAN NOT NULL DEFAULT false;

-- User : vérification email + Google OAuth
ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "verifyToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "googleId" TEXT;

-- Index uniques
CREATE UNIQUE INDEX IF NOT EXISTS "User_verifyToken_key" ON "User"("verifyToken");
CREATE UNIQUE INDEX IF NOT EXISTS "User_googleId_key" ON "User"("googleId");

-- Les comptes existants restent accessibles (déjà utilisés = considérés vérifiés)
UPDATE "User" SET "emailVerified" = true;
