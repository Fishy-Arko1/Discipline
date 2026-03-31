# Discipline AI Tracker

A mobile-friendly React + Tailwind application for tracking wake-up routines, study time, hydration, calories, and food scans with Firebase-ready persistence plus local fallbacks.

## Features

- Email OTP login through SMTP plus safe demo fallback
- First-time onboarding with generated daily targets
- Home dashboard with cards, streak counter, and weekly chart
- Wake-up logging, study timer, water tracker, calories burned input
- Food recognition flow with Groq vision support, Spoonacular fallback, and manual correction
- AI companion powered by Groq with a safe local fallback
- Progress page with weekly charts and streak history
- Profile editing, dark mode, notifications toggle, and reset option

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS
- Firebase-ready Auth + Firestore setup
- Recharts for graphs

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Copy environment values if you want Firebase, Groq AI, Spoonacular, or real email OTP enabled:

```bash
cp .env.example .env
```

3. Add your Gmail SMTP values to `.env`:

```env
SMTP_USER=apratimnandy99@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=apratimnandy99@gmail.com
```

4. Add your Groq key if you want AI companion and AI food scanning:

```env
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=openai/gpt-oss-20b
GROQ_VISION_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
```

5. Start the app:

```bash
npm run dev
```

6. Open the local Vite URL shown in the terminal.

## Notes

- `npm run dev` starts both the React client and the OTP email server.
- The app works without Firebase and without Spoonacular.
- If Groq is not configured or unavailable, AI companion falls back locally and food scan falls back to Spoonacular/mock/manual entry.
- If SMTP is missing or unavailable, the app falls back to demo OTP `123456`.
- Firebase config enables the Firestore sync layer.
- Browser notifications are simulated with the Notification API when permission is granted.
"# Discipline" 
