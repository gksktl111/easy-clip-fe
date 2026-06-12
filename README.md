# easy-clip-fe

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

This project switches API targets by environment file.

- `.env.local`: local frontend -> local backend
- `.env.production`: deployed frontend -> deployed backend

Required variables:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

Production example:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.easy-clip.app
```

The frontend uses `NEXT_PUBLIC_API_BASE_URL` to build OAuth start URLs and authenticated API requests.

## Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## API Reference

- Swagger: `https://api.easy-clip.app/docs`
