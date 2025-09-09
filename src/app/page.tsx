'use client';

import { useState, useEffect } from 'react';
import { Episode, Strength, EpisodeStrength } from '../types/self-analysis';
import EpisodeForm from '../components/EpisodeForm';
import StrengthForm from '../components/StrengthForm';
import { saveToStorage, loadFromStorage } from '../utils/storage';
import { fetchStrengths, fetchEpisodes, fetchEpisodeStrengths, saveStrength, saveEpisode, saveEpisodeStrength, deleteStrength, deleteEpisode, deleteEpisodeStrength } from '../utils/firestore';

// サンプルデータ（初期データとして使用）
const initialStrengths: Strength[] = [
  { id: '1', name: 'リーダーシップ', description: 'チームを率いる力' },
  { id: '2', name: '向上心', description: '常に成長を目指す姿勢' },
  { id: '3', name: '気配り', description: '周囲への配慮' },
];

const sampleEpisodes: Episode[] = [
  {
    id: '1',
    title: 'サークル活動でのリーダー経験',
    content: '大学のサークルで部長を務め、新入生の獲得に成功しました。',
    strengths: [initialStrengths[0], initialStrengths[1]],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'アルバイトでの接客経験',
    content: '飲食店での接客を通じて、お客様のニーズを先回りして察知する力を養いました。',
    strengths: [initialStrengths[0], initialStrengths[2]],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: '資格取得への挑戦',
    content: '独学でITパスポート試験に合格し、さらに上級資格を目指しています。',
    strengths: [initialStrengths[1], initialStrengths[2]],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const sampleEpisodeStrengths: EpisodeStrength[] = [
  { episodeId: '1', strengthId: '1', score: 5 },
  { episodeId: '1', strengthId: '2', score: 4 },
  { episodeId: '2', strengthId: '1', score: 4 },
  { episodeId: '2', strengthId: '3', score: 5 },
  { episodeId: '3', strengthId: '2', score: 5 },
  { episodeId: '3', strengthId: '3', score: 4 },
];

export default function Home() {
  const [selectedStrength, setSelectedStrength] = useState<string>('');
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [episodeStrengths, setEpisodeStrengths] = useState<EpisodeStrength[]>([]);
  const [strengths, setStrengths] = useState<Strength[]>([]);
  const [isAddingEpisode, setIsAddingEpisode] = useState(false);
  const [isAddingStrength, setIsAddingStrength] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [editingStrength, setEditingStrength] = useState<Strength | null>(null);

  // 初期データの読み込み
  useEffect(() => {
    const fetchData = async () => {
      const [strengthsData, episodesData, episodeStrengthsData] = await Promise.all([
        fetchStrengths(),
        fetchEpisodes(),
        fetchEpisodeStrengths(),
      ]);
      setStrengths(strengthsData);
      setEpisodes(episodesData);
      setEpisodeStrengths(episodeStrengthsData);
    };
    fetchData();
  }, []);

  // フィルタリングされたエピソードを取得
  const filteredEpisodes = selectedStrength
    ? episodes
        .filter((episode) =>
          episode.strengths.some((strength) => strength.id === selectedStrength)
        )
        .sort((a, b) => {
          const scoreA = episodeStrengths.find(
            (es) => es.episodeId === a.id && es.strengthId === selectedStrength
          )?.score || 0;
          const scoreB = episodeStrengths.find(
            (es) => es.episodeId === b.id && es.strengthId === selectedStrength
          )?.score || 0;
          return scoreB - scoreA;
        })
    : episodes;

  const handleAddStrength = async (newStrength: Omit<Strength, 'id'>) => {
    try {
      const id = Date.now().toString();
      const strength: Strength = { ...newStrength, id };
      await saveStrength(strength);
      // 保存後にFirestoreから再取得
      const strengthsData = await fetchStrengths();
      setStrengths(strengthsData);
      setIsAddingStrength(false);
    } catch (error) {
      alert('強みの追加に失敗しました。ネットワークやFirestoreのルールを確認してください。');
      console.error(error);
    }
  };

  const handleUpdateStrength = async (updatedStrength: Omit<Strength, 'id'>) => {
    if (!editingStrength) return;
    const strength: Strength = { ...updatedStrength, id: editingStrength.id };
    await saveStrength(strength);
    setStrengths(prev => prev.map(s => s.id === editingStrength.id ? strength : s));
    setEditingStrength(null);
  };

  const handleDeleteStrength = async (strengthId: string) => {
    await deleteStrength(strengthId);
    setStrengths(prev => prev.filter(s => s.id !== strengthId));
    setEpisodes(prev => prev.map(episode => ({
      ...episode,
      strengths: episode.strengths.filter(s => s.id !== strengthId),
    })));
    setEpisodeStrengths(prev => prev.filter(es => es.strengthId !== strengthId));
    if (selectedStrength === strengthId) {
      setSelectedStrength('');
    }
    setEditingStrength(null);
  };

  const handleAddEpisode = async (newEpisode: Omit<Episode, 'id' | 'createdAt' | 'updatedAt'>, newScores: EpisodeStrength[]) => {
    const id = Date.now().toString();
    const now = new Date();
    const episode: Episode = {
      ...newEpisode,
      id,
      createdAt: now,
      updatedAt: now,
    };
    await saveEpisode(episode);
    setEpisodes(prev => [...prev, episode]);
    for (const score of newScores) {
      const es: EpisodeStrength = { ...score, episodeId: id };
      await saveEpisodeStrength(es);
      setEpisodeStrengths(prev => [...prev, es]);
    }
    setIsAddingEpisode(false);
  };

  const handleUpdateEpisode = async (updatedEpisode: Omit<Episode, 'id' | 'createdAt' | 'updatedAt'>, updatedScores: EpisodeStrength[]) => {
    if (!editingEpisode) return;
    const now = new Date();
    const episode: Episode = {
      ...updatedEpisode,
      id: editingEpisode.id,
      createdAt: editingEpisode.createdAt,
      updatedAt: now,
    };
    await saveEpisode(episode);
    setEpisodes(prev => prev.map(ep => ep.id === editingEpisode.id ? episode : ep));
    // 既存のスコアを削除
    const oldScores = episodeStrengths.filter(es => es.episodeId === editingEpisode.id);
    for (const old of oldScores) {
      await deleteEpisodeStrength(old.episodeId, old.strengthId);
    }
    setEpisodeStrengths(prev => prev.filter(es => es.episodeId !== editingEpisode.id));
    // 新しいスコアを追加
    for (const score of updatedScores) {
      const es: EpisodeStrength = { ...score, episodeId: editingEpisode.id };
      await saveEpisodeStrength(es);
      setEpisodeStrengths(prev => [...prev, es]);
    }
    setEditingEpisode(null);
  };

  const handleDeleteEpisode = async (episodeId: string) => {
    await deleteEpisode(episodeId);
    setEpisodes(prev => prev.filter(ep => ep.id !== episodeId));
    // スコアも削除
    const oldScores = episodeStrengths.filter(es => es.episodeId === episodeId);
    for (const old of oldScores) {
      await deleteEpisodeStrength(old.episodeId, old.strengthId);
    }
    setEpisodeStrengths(prev => prev.filter(es => es.episodeId !== episodeId));
    setEditingEpisode(null);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">自己分析ツール</h1>
      
      {/* 強みの管理 */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">強みの管理</h2>
          <button
            onClick={() => setIsAddingStrength(true)}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            新しい強みを追加
          </button>
        </div>

        {/* 強み追加フォーム */}
        {isAddingStrength && (
          <div className="mb-4 p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">新しい強み</h3>
            <StrengthForm
              onSubmit={handleAddStrength}
              onCancel={() => setIsAddingStrength(false)}
            />
          </div>
        )}

        {/* 強み編集フォーム */}
        {editingStrength && (
          <div className="mb-4 p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">強みを編集</h3>
            <StrengthForm
              initialData={editingStrength}
              onSubmit={handleUpdateStrength}
              onCancel={() => setEditingStrength(null)}
              onDelete={() => handleDeleteStrength(editingStrength.id)}
            />
          </div>
        )}

        {/* 強み一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
          {strengths.map((strength) => (
            <div key={strength.id} className="border p-2 rounded-lg">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">{strength.name}</h3>
                <button
                  onClick={() => setEditingStrength(strength)}
                  className="text-blue-500 hover:text-blue-700 text-xs"
                >
                  編集
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 強みでフィルタリング */}
      <div className="mb-8">
        <label className="block text-lg font-medium mb-2">強みでフィルタリング</label>
        <select
          value={selectedStrength}
          onChange={(e) => setSelectedStrength(e.target.value)}
          className="w-full p-2 border rounded bg-white text-black"
        >
          <option value="">すべてのエピソード</option>
          {strengths.map((strength) => (
            <option key={strength.id} value={strength.id}>
              {strength.name}
            </option>
          ))}
        </select>
      </div>

      {/* エピソード追加ボタン */}
      <div className="mb-8">
        <button
          onClick={() => setIsAddingEpisode(true)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          新しいエピソードを追加
        </button>
      </div>

      {/* エピソード追加フォーム */}
      {isAddingEpisode && (
        <div className="mb-8 p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">新しいエピソード</h2>
          <EpisodeForm
            strengths={strengths}
            onSubmit={handleAddEpisode}
            onCancel={() => setIsAddingEpisode(false)}
            episodeStrengths={episodeStrengths}
            onAddStrength={handleAddStrength}
          />
        </div>
      )}

      {/* エピソード一覧 */}
      <div className="space-y-6">
        {filteredEpisodes.map((episode) => (
          <div key={episode.id} className="border p-4 rounded-lg">
            {editingEpisode?.id === episode.id ? (
              // 編集フォーム
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-4">エピソードを編集</h2>
                <EpisodeForm
                  strengths={strengths}
                  initialData={editingEpisode}
                  onSubmit={handleUpdateEpisode}
                  onCancel={() => setEditingEpisode(null)}
                  onDelete={() => handleDeleteEpisode(editingEpisode.id)}
                  episodeStrengths={episodeStrengths}
                  onAddStrength={handleAddStrength}
                />
              </div>
            ) : (
              // 通常のエピソード表示
              <>
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold">{episode.title}</h2>
                  <button
                    onClick={() => setEditingEpisode(episode)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    編集
                  </button>
                </div>
                <p className="mb-4">{episode.content}</p>
                <div className="flex flex-wrap gap-2">
                  {episode.strengths.map((strength) => (
                    <span
                      key={strength.id}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {strength.name}
                      {selectedStrength === strength.id && (
                        <span className="ml-1">
                          (スコア: {episodeStrengths.find(
                            (es) => es.episodeId === episode.id && es.strengthId === strength.id
                          )?.score})
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
