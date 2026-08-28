'use client';

import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import type { Analytics } from 'firebase/analytics';
import type { Firestore } from 'firebase/firestore';

type AnalyticsClient = {
  analytics: Analytics;
  logEvent: (analytics: Analytics, eventName: string, eventParams?: Record<string, string | number>) => void;
};

type FirestoreClient = {
  firestore: Firestore;
  addDoc: typeof import('firebase/firestore').addDoc;
  collection: typeof import('firebase/firestore').collection;
  serverTimestamp: typeof import('firebase/firestore').serverTimestamp;
};

export type FirebaseEventName =
  | 'site_section_view'
  | 'works_search'
  | 'phenomenon_open'
  | 'research_case_open'
  | 'report_export';

const firebaseConfig = {
  apiKey: 'AIzaSyDb1H6Z9hTuUGfeJgC8B4LMCCILqQXsp8U',
  authDomain: 'science-fair-60-65.firebaseapp.com',
  projectId: 'science-fair-60-65',
  storageBucket: 'science-fair-60-65.firebasestorage.app',
  messagingSenderId: '769805260316',
  appId: '1:769805260316:web:1488473a74a4768ec9f1d9',
  measurementId: 'G-5689212ZN9',
};

let analyticsClient: Promise<AnalyticsClient | null> | undefined;
let firestoreClient: Promise<FirestoreClient | null> | undefined;

function getFirebaseApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

async function getAnalyticsClient(): Promise<AnalyticsClient | null> {
  if (typeof window === 'undefined') return null;
  if (!analyticsClient) {
    analyticsClient = (async () => {
      const analyticsSdk = await import('firebase/analytics');
      if (!(await analyticsSdk.isSupported())) return null;
      return {
        analytics: analyticsSdk.getAnalytics(getFirebaseApp()),
        logEvent: analyticsSdk.logEvent,
      };
    })().catch(() => null);
  }
  return analyticsClient;
}

async function getFirestoreClient(): Promise<FirestoreClient | null> {
  if (typeof window === 'undefined') return null;
  if (!firestoreClient) {
    firestoreClient = import('firebase/firestore').then(firestoreSdk => ({
      firestore: firestoreSdk.getFirestore(getFirebaseApp()),
      addDoc: firestoreSdk.addDoc,
      collection: firestoreSdk.collection,
      serverTimestamp: firestoreSdk.serverTimestamp,
    })).catch(() => null);
  }
  return firestoreClient;
}

function stringValue(value: string | number | undefined, maxLength: number, fallback: string): string {
  return typeof value === 'string' ? value.slice(0, maxLength) : fallback;
}

async function archiveUsageEvent(eventName: FirebaseEventName, parameters: Record<string, string | number>): Promise<void> {
  const client = await getFirestoreClient();
  if (!client) return;
  const edition = typeof parameters.edition === 'number' && Number.isInteger(parameters.edition) ? parameters.edition : 0;
  await client.addDoc(client.collection(client.firestore, 'usage_events'), {
    eventType: eventName,
    page: stringValue(parameters.section ?? parameters.source, 32, 'site'),
    subject: stringValue(parameters.subject, 20, 'all'),
    edition,
    resultBucket: stringValue(parameters.result_bucket, 16, 'none'),
    queryMode: stringValue(parameters.query_mode, 16, 'none'),
    knownKeyword: stringValue(parameters.known_keyword, 40, 'none'),
    createdAt: client.serverTimestamp(),
    schemaVersion: 1,
  });
}

export function trackFirebaseEvent(eventName: FirebaseEventName, parameters: Record<string, string | number> = {}): void {
  const safeParameters = Object.fromEntries(
    Object.entries(parameters)
      .filter(([, value]) => typeof value === 'string' || typeof value === 'number')
      .map(([key, value]) => [key.slice(0, 40), typeof value === 'string' ? value.slice(0, 100) : value]),
  ) as Record<string, string | number>;
  void getAnalyticsClient().then(client => client?.logEvent(client.analytics, eventName, safeParameters));
  void archiveUsageEvent(eventName, safeParameters).catch(() => undefined);
}
