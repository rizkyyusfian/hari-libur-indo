# Environment Setup Guide

This guide configures Hari Libur Indo for:

- local development;
- Neon Postgres;
- password-only admin sessions;
- Cloudflare R2 PDF storage;
- record-only migration from the previous Postgres database;
- Vercel production deployment; and
- optional integration and browser tests.

The application does not use Supabase Auth, Supabase Storage, or Neon Auth.

## 1. Security rules

- Never commit `.env.local` or paste its values into an issue, chat, screenshot,
  or deployment log.
- Do not add `SOURCE_DATABASE_URL` to Vercel. It is only needed for the one-time
  local migration.
- Use separate Neon branches or databases for production and testing.
- Scope the R2 token to one bucket with Object Read & Write permission.
- Rotate `PASSWORD`, `ADMIN_SESSION_SECRET`, and R2 credentials if they are
  exposed.
- Changing `PASSWORD` or `ADMIN_SESSION_SECRET` immediately invalidates existing
  admin sessions.

## 2. Create the local environment file

From the repository root:

```bash
cp .env.example .env.local
```

Use `.env.local`, not `.env`, for local secrets. Start with this structure:

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000

DATABASE_URL=
DATABASE_URL_UNPOOLED=

PASSWORD=
ADMIN_SESSION_SECRET=

R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_BASE_URL=

SOURCE_DATABASE_URL=
TEST_DATABASE_URL=
E2E_BASE_URL=http://localhost:3000
```

Do not add quotes unless the value itself requires them. Do not place spaces
around `=`.

## 3. Configure Neon

### 3.1 Create the project

1. Sign in to the Neon dashboard.
2. Create a project and select the production branch.
3. Open the project's **Connect** dialog.
4. Select the database and role that this application will use.

The application needs two connection strings for the same Neon branch:

| Variable | Neon connection | Used by |
| --- | --- | --- |
| `DATABASE_URL` | Pooled | Next.js runtime on Vercel and locally |
| `DATABASE_URL_UNPOOLED` | Direct | Drizzle migrations and record importer |

The pooled hostname normally contains `-pooler`; the direct hostname does not.
Both URLs should use TLS, normally through `sslmode=require`.

Example shapes only:

```dotenv
DATABASE_URL=postgresql://ROLE:PASSWORD@ep-example-pooler.REGION.aws.neon.tech/DATABASE?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://ROLE:PASSWORD@ep-example.REGION.aws.neon.tech/DATABASE?sslmode=require
```

Do not copy these example values. Copy both connection strings from your own
Neon dashboard.

### 3.2 Apply the schema

Confirm that `DATABASE_URL_UNPOOLED` points to the intended Neon branch, then
run:

```bash
npm run db:migrate
```

This creates the application tables, constraints, indexes, and enums. Do not run
the record importer before this command succeeds.

### 3.3 Optional test database

Create a separate Neon branch or database for integration tests and set its
direct connection string:

```dotenv
TEST_DATABASE_URL=postgresql://...
```

Never point `TEST_DATABASE_URL` at production.

## 4. Configure admin authentication

There is no username. The login form compares the submitted password with the
server-only `PASSWORD` value.

Requirements:

- `PASSWORD`: at least 8 characters; use a long, unique value of 16 characters
  or more.
- `ADMIN_SESSION_SECRET`: at least 32 characters and different from
  `PASSWORD`.

Generate a session secret locally:

```bash
openssl rand -base64 48
```

Then set:

```dotenv
PASSWORD=your-long-unique-admin-password
ADMIN_SESSION_SECRET=the-generated-random-value
```

The application creates a signed, `HttpOnly`, `SameSite=Lax` session cookie
with an absolute lifetime of 12 hours. Production cookies are also marked
`Secure`.

## 5. Configure the application URL

For local development:

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

For production, use the exact public application origin:

```dotenv
NEXT_PUBLIC_SITE_URL=https://libur.example.com
```

Use only the origin: scheme plus hostname and optional port. Do not add a path.
This value is used for same-origin checks on login and admin mutations.

For Vercel Preview deployments, use a stable branch/custom domain and set a
branch-specific `NEXT_PUBLIC_SITE_URL`. Random preview URLs will not pass admin
same-origin checks when this variable points somewhere else.

## 6. Configure Cloudflare R2

### 6.1 Create a bucket

1. In the Cloudflare dashboard, open **R2 Object Storage**.
2. Create a bucket, for example `hari-libur-documents`.
3. Record the exact bucket name and the Cloudflare account ID.

```dotenv
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_BUCKET_NAME=hari-libur-documents
```

### 6.2 Create bucket-scoped S3 credentials

1. From the R2 overview, find **API Tokens** and select **Manage**.
2. Create an Account or User API token.
3. Choose **Object Read & Write**.
4. Restrict the token to the Hari Libur Indo bucket.
5. Copy the Access Key ID and Secret Access Key immediately. Cloudflare only
   shows the secret once.

```dotenv
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
```

Do not use a general Cloudflare API token here. These values are the
S3-compatible R2 credentials.

### 6.3 Connect the public custom domain

PDFs are publicly readable after publication, so connect a dedicated hostname
such as `documents.example.com`:

1. Open the R2 bucket.
2. Select **Settings**.
3. Under **Custom Domains**, select **Add** or **Connect Domain**.
4. Enter the hostname and confirm the DNS record.
5. Wait until its status is **Active**.
6. Keep the `r2.dev` Public Development URL disabled in production.

Set the origin without a trailing path:

```dotenv
R2_PUBLIC_BASE_URL=https://documents.example.com
```

The application appends a generated object key such as
`documents/2026/<document-id>/<upload-id>.pdf` to this URL.

The custom domain is for public `GET` requests. Presigned uploads use
Cloudflare's S3 API endpoint automatically; presigned URLs do not use the custom
domain.

### 6.4 Add the bucket CORS policy

The admin browser uploads PDFs directly to a five-minute presigned R2 `PUT`
URL. The bucket therefore needs a CORS rule for every admin application origin.

In the bucket's CORS settings, use:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://libur.example.com"
    ],
    "AllowedMethods": [
      "PUT"
    ],
    "AllowedHeaders": [
      "Content-Type"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

Replace `https://libur.example.com` with the same production origin used by
`NEXT_PUBLIC_SITE_URL`. Add a stable Preview origin only if admin uploads need
to work in Preview.

The client sends `Content-Type: application/pdf`; it must remain allowed and
must match the header signed into the upload URL. The application accepts PDFs
up to 10 MiB and verifies their R2 metadata and `%PDF-` signature before they
can be published.

## 7. Variable reference

| Variable | Required where | Secret | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Local, Preview, Production | No | Exact application origin for same-origin protection |
| `DATABASE_URL` | Local, Preview, Production | Yes | Pooled Neon runtime connection |
| `DATABASE_URL_UNPOOLED` | Local migration environment | Yes | Direct Neon migration/import connection |
| `PASSWORD` | Local, Preview, Production | Yes | Shared admin login password |
| `ADMIN_SESSION_SECRET` | Local, Preview, Production | Yes | Signs and verifies 12-hour sessions |
| `R2_ACCOUNT_ID` | Local, Preview, Production | Treat as private | Builds the R2 S3 endpoint |
| `R2_ACCESS_KEY_ID` | Local, Preview, Production | Yes | R2 S3 credential |
| `R2_SECRET_ACCESS_KEY` | Local, Preview, Production | Yes | R2 S3 credential |
| `R2_BUCKET_NAME` | Local, Preview, Production | Treat as private | Target PDF bucket |
| `R2_PUBLIC_BASE_URL` | Local, Preview, Production | No | Public custom-domain origin for PDF links |
| `SOURCE_DATABASE_URL` | One-time local migration only | Yes | Previous Postgres database |
| `TEST_DATABASE_URL` | Local/CI integration tests only | Yes | Isolated test database |
| `E2E_BASE_URL` | Local/CI browser tests only | No | Running app tested by Playwright |

`SOURCE_DATABASE_URL`, `TEST_DATABASE_URL`, and `E2E_BASE_URL` are not required
by the deployed production runtime.

## 8. Record-only migration

Only perform this after the Drizzle schema exists and the new application
tables are empty.

Set the previous database's direct Postgres URL locally:

```dotenv
SOURCE_DATABASE_URL=postgresql://...
```

First run the non-writing validation:

```bash
npm run migrate:records
```

Review the generated `migration-report-*.json`. It contains counts and IDs, but
not connection strings or passwords.

If the report is correct, apply the import:

```bash
npm run migrate:records -- --apply
```

The importer:

- preserves regions, holidays, document metadata, and document relationships;
- requires the target application tables to be empty;
- validates IDs and relationships before writing;
- writes everything inside a target transaction;
- rolls back if reconciliation fails;
- discards old storage URLs; and
- converts previously published documents to drafts with `missing` storage.

Upload the PDFs manually through `/admin/documents`, then publish each verified
document.

## 9. Configure Vercel

In **Vercel → Project → Settings → Environment Variables**, add these runtime
variables:

```text
NEXT_PUBLIC_SITE_URL
DATABASE_URL
PASSWORD
ADMIN_SESSION_SECRET
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME
R2_PUBLIC_BASE_URL
```

Add `DATABASE_URL_UNPOOLED` only if a trusted CI or deployment process will run
Drizzle migrations. Do not add `SOURCE_DATABASE_URL` to Vercel.

Assign values deliberately:

- **Production:** production Neon branch, production app domain, production R2
  bucket.
- **Preview:** separate Neon branch and, preferably, a separate R2 bucket.
- **Development:** local/development Neon branch and R2 bucket.

After changing any Vercel environment variable, redeploy. Existing deployments
do not receive new values retroactively.

## 10. Validate the setup

Run the static checks:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

With `TEST_DATABASE_URL` configured:

```bash
npm run test:integration
```

For local browser testing:

```bash
npm run dev
```

In another terminal:

```bash
E2E_BASE_URL=http://localhost:3000 npm run test:e2e
```

Manual smoke-test checklist:

1. Open `/` and confirm public holiday data loads.
2. Open `/admin` while logged out and confirm redirect to `/admin/login`.
3. Submit an incorrect password and confirm a generic error.
4. Log in with `PASSWORD`.
5. Create, edit, and delete a test holiday.
6. Create a draft document and upload a PDF smaller than 10 MiB.
7. Confirm the upload reaches `ready` state.
8. Publish it and open its public custom-domain URL.
9. Archive or delete the test document.
10. Log out and confirm protected admin pages redirect again.

## 11. Troubleshooting

### `Missing or invalid server environment variables`

Check the variable names exactly. `PASSWORD` must be at least 8 characters and
`ADMIN_SESSION_SECRET` at least 32 characters. Database URLs must start with
`postgresql://`.

### Neon connection fails

- Confirm `DATABASE_URL` uses the pooled hostname for runtime.
- Confirm `DATABASE_URL_UNPOOLED` uses the direct hostname for migrations.
- Confirm the role, password, database, and branch are correct.
- Confirm `sslmode=require` is present.
- If the password contains reserved URL characters, use the exact URL copied
  from Neon rather than constructing it manually.

### Admin login says the request is invalid

`NEXT_PUBLIC_SITE_URL` does not match the browser's exact origin. Check the
scheme, hostname, and port. Redeploy after changing it on Vercel.

### R2 upload returns a browser CORS error

- Add the browser's exact origin to `AllowedOrigins`.
- Allow `PUT`.
- Allow `Content-Type`.
- Confirm the uploaded request uses `application/pdf`.
- Confirm the CORS rule is attached to the same bucket as `R2_BUCKET_NAME`.

### R2 upload returns `403` or `SignatureDoesNotMatch`

- Confirm the account ID, access key, secret, and bucket name belong together.
- Confirm the token has bucket-scoped Object Read & Write permission.
- Start a new upload because presigned URLs expire after five minutes.
- Do not modify the presigned URL or its signed headers.

### PDF uploads but cannot be published

The server only marks a file ready when:

- its content type is `application/pdf`;
- its size is between 1 byte and 10 MiB; and
- its first five bytes are `%PDF-`.

Upload a valid PDF again.

### Public PDF returns `404`

- Confirm the document is published and its storage state is `ready`.
- Confirm the R2 custom domain is Active.
- Confirm `R2_PUBLIC_BASE_URL` is the custom-domain origin.
- Confirm public access is enabled through that custom domain.

## Official references

- [Neon connection pooling](https://neon.com/docs/connect/connection-pooling)
- [Cloudflare R2 API tokens](https://developers.cloudflare.com/r2/api/tokens/)
- [Cloudflare R2 presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/)
- [Cloudflare R2 CORS](https://developers.cloudflare.com/r2/buckets/cors/)
- [Cloudflare R2 public buckets and custom domains](https://developers.cloudflare.com/r2/buckets/public-buckets/)
- [Vercel environment variables](https://vercel.com/docs/environment-variables)
