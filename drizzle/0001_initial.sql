CREATE TABLE IF NOT EXISTS "user" (
  "id" text PRIMARY KEY,
  "name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "emailVerified" boolean NOT NULL DEFAULT false,
  "image" text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "session" (
  "id" text PRIMARY KEY,
  "expiresAt" timestamptz NOT NULL,
  "token" text NOT NULL UNIQUE,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  "ipAddress" text,
  "userAgent" text,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "session_user_id_idx" ON "session"("userId");

CREATE TABLE IF NOT EXISTS "account" (
  "id" text PRIMARY KEY,
  "accountId" text NOT NULL,
  "providerId" text NOT NULL,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamptz,
  "refreshTokenExpiresAt" timestamptz,
  "scope" text,
  "password" text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "account_provider_account_uidx" UNIQUE ("providerId", "accountId")
);
CREATE INDEX IF NOT EXISTS "account_user_id_idx" ON "account"("userId");

CREATE TABLE IF NOT EXISTS "verification" (
  "id" text PRIMARY KEY,
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expiresAt" timestamptz NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification"("identifier");

CREATE TABLE IF NOT EXISTS "workspaces" (
  "id" text PRIMARY KEY,
  "name" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "workspace_members" (
  "workspace_id" text NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "role" text NOT NULL DEFAULT 'editor' CHECK ("role" IN ('owner', 'editor', 'viewer')),
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("workspace_id", "user_id")
);
CREATE INDEX IF NOT EXISTS "workspace_members_user_idx" ON "workspace_members"("user_id");

CREATE TABLE IF NOT EXISTS "projects" (
  "id" text PRIMARY KEY,
  "workspace_id" text NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "client" text NOT NULL,
  "url" text NOT NULL,
  "data" jsonb NOT NULL,
  "revision" integer NOT NULL DEFAULT 1 CHECK ("revision" > 0),
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "projects_workspace_idx" ON "projects"("workspace_id");

CREATE TABLE IF NOT EXISTS "invitations" (
  "id" text PRIMARY KEY,
  "workspace_id" text NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "token_hash" text NOT NULL UNIQUE,
  "role" text NOT NULL DEFAULT 'editor' CHECK ("role" = 'editor'),
  "created_by" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "expires_at" timestamptz NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "review_assets" (
  "id" text PRIMARY KEY,
  "workspace_id" text NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "project_id" text NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "page_id" text NOT NULL,
  "file_name" text NOT NULL,
  "file_path" text NOT NULL,
  "content_type" text NOT NULL CHECK ("content_type" IN ('image/png', 'image/jpeg', 'image/webp')),
  "size" integer NOT NULL CHECK ("size" > 0 AND "size" <= 12582912),
  "created_by" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "review_assets_project_idx" ON "review_assets"("project_id");
