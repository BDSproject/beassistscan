-- Lead : devise du rapport (EUR, USD, GBP...) pour affichage correct des montants
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "currency" TEXT DEFAULT 'EUR';
