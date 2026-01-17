# AccessEd Website

Static website for AccessEd.app

## Pages

- `/` - Landing page (placeholder until app launches)
- `/verify` - Email verification page (handles redirects from backend)
- `/terms` - Terms of Service
- `/privacy` - Privacy Policy

## Deployment

### Vercel (Recommended)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click "New Project" and import this repository
4. Deploy (no configuration needed, uses `vercel.json`)
5. Add custom domain: Settings > Domains > Add `accessed.app`

### Netlify

1. Push this repo to GitHub
2. Go to [netlify.com](https://app.netlify.com) and sign in with GitHub
3. Click "Add new site" > "Import an existing project"
4. Select this repository and deploy
5. Add custom domain: Domain settings > Add custom domain > `accessed.app`

### Render (Static Site)

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) and create a new Static Site
3. Connect to this repository
4. Set publish directory to `.`
5. Add custom domain in Settings

## DNS Configuration (Porkbun)

After deploying, add these DNS records in Porkbun:

**For Vercel:**
- Type: `A` | Name: `@` | Value: `76.76.21.21`
- Type: `CNAME` | Name: `www` | Value: `cname.vercel-dns.com`

**For Netlify:**
- Check Netlify dashboard for specific values after adding domain

**For Render:**
- Check Render dashboard for specific values after adding domain

## Email Verification Flow

The backend at `api.accessed.app` handles verification and redirects to:
- Success: `https://accessed.app/verify?success=true`
- Error: `https://accessed.app/verify?error={error_message}`

Possible errors:
- `Invalid verification link`
- `This link has already been used`
- `This link has expired`
- `Email already verified`
- `server`
