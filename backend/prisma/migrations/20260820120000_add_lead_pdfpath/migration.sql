-- Lead : chemin du PDF pour le téléchargement depuis le dashboard
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "pdfPath" TEXT;
