# Deployment Guide

## Prerequisites

- [Vercel](https://vercel.com/) account (free tier)
- [MongoDB Atlas](https://www.mongodb.com/atlas) account (free M0 cluster)
- [Cloudinary](https://cloudinary.com/) account (free tier, optional for uploads)
- Git repository connected to Vercel

---

## Step 1: MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a **free M0 cluster** (shared, AWS/GCP/Azure)
3. Once created, click **Connect** → **Drivers**
4. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/linknest?retryWrites=true&w=majority
   ```
5. Create a database user (username + password) under **Database Access** in Security
6. Under **Network Access**, add `0.0.0.0/0` (allow all) for development, or restrict to Vercel IPs for production

## Step 2: Cloudinary Setup (Optional)

1. Go to [Cloudinary](https://cloudinary.com/) and sign up for free
2. From the dashboard, copy your **Cloud Name** (e.g., `dh8abc9xy`)
3. Go to **Settings** → **Upload** → **Upload Presets**
4. Create a new unsigned upload preset named `linknest-uploads`
5. Set **Signing Mode** to `Unsigned`
6. Set **Folder** to `linknest`

Cloudinary is optional — media uploads will fail gracefully if not configured.

## Step 3: Generate Auth Secret

```bash
openssl rand -base64 32
```

## Step 4: Environment Variables

Copy the example file:

```bash
cp .env.example .env.local
```

Set these variables:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string from Atlas |
| `AUTH_SECRET` | Random secret (generate with `openssl rand -base64 32`) |
| `AUTH_URL` | `http://localhost:3000` for dev, your Vercel URL for prod |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | `linknest-uploads` (or your preset name) |
| `NEXT_PUBLIC_BASE_URL` | `http://localhost:3000` for dev, your Vercel URL for prod |

## Step 5: Deploy to Vercel

### Via Vercel Dashboard

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [Vercel](https://vercel.com) → **Add New** → **Project**
3. Import your repository
4. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./`
   - **Build Command**: `next build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
5. Add all environment variables from `.env.local` (MUST include all of them)
6. Click **Deploy**

### Via Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

Follow the prompts and set environment variables when asked.

## Step 6: Verify

1. Open your Vercel deployment URL
2. Sign up for a new account
3. Create blocks in the dashboard
4. Visit `[your-url]/[your-username]` to see the public page
5. Click a link and check analytics

## Local Development

```bash
# Install
npm install

# Set up env
cp .env.example .env.local

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```
