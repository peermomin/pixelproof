-- Screenshot bytes now live with their metadata in PostgreSQL. Existing rows
-- get NULL content and need their screenshot uploaded again; local disk files
-- are not available to a database migration process.
ALTER TABLE "review_assets" ADD COLUMN IF NOT EXISTS "content" bytea;
ALTER TABLE "review_assets" DROP COLUMN IF EXISTS "file_path";
ALTER TABLE "review_assets" ADD CONSTRAINT "review_assets_content_size_check"
  CHECK ("content" IS NULL OR octet_length("content") = "size") NOT VALID;
ALTER TABLE "review_assets" ADD CONSTRAINT "review_assets_content_required_check"
  CHECK ("content" IS NOT NULL) NOT VALID;
