
# CA Final Tracker

A comprehensive progress tracker for CA Final students, featuring offline support (PWA), cross-device synchronization, and a premium dark-mode UI.

## Features
- **Syllabus Tracking**: Detailed chapter-wise tracking for all 6 papers (New Scheme 2024-2026).
- **Offline First**: Works without internet. Progress is saved locally and synced when online.
- **Cross-Device Sync**: Log in to sync your progress across mobile, tablet, and desktop.
- **PWA**: Installable as a native-like app on iOS and Android.
- **Premium UI**: Clean, distraction-free design with dark mode.

## Environment Variables

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/tracker?retryWrites=true&w=majority
JWT_SECRET=your-secure-random-secret
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Deployment (Vercel)

The easiest way to deploy is to use the [Vercel Platform](https://vercel.com/new).

1. Push your code to a GitHub repository.
2. Import the project into Vercel.
3. Add the `MONGODB_URI` and `JWT_SECRET` environment variables.
4. Click Deploy.
