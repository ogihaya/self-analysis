// エピソードの型定義
export interface Episode {
  id: string;
  title: string;
  content: string;
  strengths: Strength[];
  createdAt: Date;
  updatedAt: Date;
}

// 強み（武器）の型定義
export interface Strength {
  id: string;
  name: string;
  description: string;
}

// エピソードと強みの関連付けの型定義
export interface EpisodeStrength {
  episodeId: string;
  strengthId: string;
  score: number; // 1-5のスコアで、その強みがどれだけ表れているかを評価
} 