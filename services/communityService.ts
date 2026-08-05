import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { getDb, isFirebaseConfigured } from './firebaseClient';
import { CommunityPost, CommunityReply, CropType } from '../types';

export { isFirebaseConfigured };

const POSTS_COLLECTION = 'community_posts';
const REPLIES_COLLECTION = 'community_replies';

export async function fetchDistrictPosts(district: string): Promise<CommunityPost[]> {
  const db = getDb();
  if (!db) return [];

  const q = query(
    collection(db, POSTS_COLLECTION),
    where('district', '==', district),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      district: data.district,
      cropType: data.cropType,
      question: data.question,
      authorLabel: data.authorLabel,
      createdAt: (data.createdAt as Timestamp)?.toMillis?.() ?? Date.now(),
      replyCount: data.replyCount ?? 0,
    };
  });
}

export async function postQuestion(
  district: string,
  cropType: CropType,
  question: string,
  authorLabel: string
): Promise<void> {
  const db = getDb();
  if (!db) throw new Error('FIREBASE_NOT_CONFIGURED');

  await addDoc(collection(db, POSTS_COLLECTION), {
    district,
    cropType,
    question,
    authorLabel,
    replyCount: 0,
    createdAt: serverTimestamp(),
  });
}

export async function fetchReplies(postId: string): Promise<CommunityReply[]> {
  const db = getDb();
  if (!db) return [];

  const q = query(collection(db, REPLIES_COLLECTION), where('postId', '==', postId), orderBy('createdAt', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      postId: data.postId,
      text: data.text,
      authorLabel: data.authorLabel,
      createdAt: (data.createdAt as Timestamp)?.toMillis?.() ?? Date.now(),
    };
  });
}

export async function postReply(postId: string, text: string, authorLabel: string): Promise<void> {
  const db = getDb();
  if (!db) throw new Error('FIREBASE_NOT_CONFIGURED');

  await addDoc(collection(db, REPLIES_COLLECTION), {
    postId,
    text,
    authorLabel,
    createdAt: serverTimestamp(),
  });
  // Note: replyCount on the parent post is best-effort/display-only here; a Cloud Function
  // would keep it perfectly in sync, but that requires a paid Firebase plan to deploy.
}
