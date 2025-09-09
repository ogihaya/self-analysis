import { db } from './firebase';
import { collection, getDocs, setDoc, doc, deleteDoc, query, where } from 'firebase/firestore';
import { Strength, Episode, EpisodeStrength } from '../types/self-analysis';

const STRENGTHS_COLLECTION = 'strengths';
const EPISODES_COLLECTION = 'episodes';
const EPISODE_STRENGTHS_COLLECTION = 'episodeStrengths';

// --- 強み ---
export async function fetchStrengths(): Promise<Strength[]> {
  const snapshot = await getDocs(collection(db, STRENGTHS_COLLECTION));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Strength));
}

export async function saveStrength(strength: Strength): Promise<void> {
  await setDoc(doc(db, STRENGTHS_COLLECTION, strength.id), strength);
}

export async function deleteStrength(strengthId: string): Promise<void> {
  await deleteDoc(doc(db, STRENGTHS_COLLECTION, strengthId));
}

// --- エピソード ---
export async function fetchEpisodes(): Promise<Episode[]> {
  const snapshot = await getDocs(collection(db, EPISODES_COLLECTION));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Episode));
}

export async function saveEpisode(episode: Episode): Promise<void> {
  await setDoc(doc(db, EPISODES_COLLECTION, episode.id), episode);
}

export async function deleteEpisode(episodeId: string): Promise<void> {
  await deleteDoc(doc(db, EPISODES_COLLECTION, episodeId));
}

// --- スコア ---
export async function fetchEpisodeStrengths(): Promise<EpisodeStrength[]> {
  const snapshot = await getDocs(collection(db, EPISODE_STRENGTHS_COLLECTION));
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      episodeId: data.episodeId,
      strengthId: data.strengthId,
      score: data.score,
    } as EpisodeStrength;
  });
}

export async function saveEpisodeStrength(episodeStrength: EpisodeStrength): Promise<void> {
  // idは「episodeId_strengthId」などの複合キーを推奨
  const id = `${episodeStrength.episodeId}_${episodeStrength.strengthId}`;
  await setDoc(doc(db, EPISODE_STRENGTHS_COLLECTION, id), { ...episodeStrength, id });
}

export async function deleteEpisodeStrength(episodeId: string, strengthId: string): Promise<void> {
  const id = `${episodeId}_${strengthId}`;
  await deleteDoc(doc(db, EPISODE_STRENGTHS_COLLECTION, id));
}
// 特定エピソードや強みに紐づくスコアの一括削除も必要に応じて追加可能です。 