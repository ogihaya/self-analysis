import { Episode, Strength, EpisodeStrength } from '../types/self-analysis';

const STORAGE_KEYS = {
  STRENGTHS: 'self-analysis-strengths',
  EPISODES: 'self-analysis-episodes',
  EPISODE_STRENGTHS: 'self-analysis-episode-strengths',
} as const;

// データの保存
export const saveToStorage = {
  strengths: (strengths: Strength[]) => {
    localStorage.setItem(STORAGE_KEYS.STRENGTHS, JSON.stringify(strengths));
  },
  episodes: (episodes: Episode[]) => {
    localStorage.setItem(STORAGE_KEYS.EPISODES, JSON.stringify(episodes));
  },
  episodeStrengths: (episodeStrengths: EpisodeStrength[]) => {
    localStorage.setItem(STORAGE_KEYS.EPISODE_STRENGTHS, JSON.stringify(episodeStrengths));
  },
};

// データの読み込み
export const loadFromStorage = {
  strengths: (): Strength[] => {
    const data = localStorage.getItem(STORAGE_KEYS.STRENGTHS);
    if (!data) return [];
    return JSON.parse(data).map((strength: any) => ({
      ...strength,
      createdAt: new Date(strength.createdAt),
      updatedAt: new Date(strength.updatedAt),
    }));
  },
  episodes: (): Episode[] => {
    const data = localStorage.getItem(STORAGE_KEYS.EPISODES);
    if (!data) return [];
    return JSON.parse(data).map((episode: any) => ({
      ...episode,
      createdAt: new Date(episode.createdAt),
      updatedAt: new Date(episode.updatedAt),
    }));
  },
  episodeStrengths: (): EpisodeStrength[] => {
    const data = localStorage.getItem(STORAGE_KEYS.EPISODE_STRENGTHS);
    if (!data) return [];
    return JSON.parse(data);
  },
}; 