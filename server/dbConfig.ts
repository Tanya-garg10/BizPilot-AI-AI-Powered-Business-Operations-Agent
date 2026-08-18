import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

let firebaseConfig: Record<string, string> = {
  projectId: process.env.GOOGLE_CLOUD_PROJECT || "gen-lang-client-0256879183",
  apiKey: process.env.FIREBASE_API_KEY || "",
  authDomain: `${process.env.GOOGLE_CLOUD_PROJECT || "gen-lang-client-0256879183"}.firebaseapp.com`,
};

try {
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const fileContent = fs.readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(fileContent);
    firebaseConfig = { ...firebaseConfig, ...parsed };
  }
} catch (err) {
  console.warn("Could not load firebase-applet-config.json, using fallback config:", err);
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(
  app,
  firebaseConfig.firestoreDatabaseId || "(default)"
);

export { firebaseConfig };
