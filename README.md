# engineering-cards-creation

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_f8qcwPjtijmDyd1sPX5dDTqTX9C1)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Supabase Auth URLs

Set `NEXT_PUBLIC_SITE_URL=https://ojt-companion.vercel.app` in Vercel.

In Supabase Dashboard under **Auth > URL Configuration**, use:

- Site URL: `https://ojt-companion.vercel.app`
- Additional Redirect URL: `https://ojt-companion.vercel.app/auth/callback`

For local development, `http://localhost:3000/auth/callback` may also be added as
an additional redirect URL. Production password-reset and email-verification
emails always use `NEXT_PUBLIC_SITE_URL` and never derive their redirect from
the browser origin.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.
