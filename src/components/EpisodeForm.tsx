'use client';

import { useState, useEffect } from 'react';
import { Episode, Strength, EpisodeStrength } from '../types/self-analysis';
import StrengthForm from './StrengthForm';

interface EpisodeFormProps {
  strengths: Strength[];
  onSubmit: (episode: Omit<Episode, 'id' | 'createdAt' | 'updatedAt'>, scores: EpisodeStrength[]) => void;
  initialData?: Episode;
  onCancel?: () => void;
  onDelete?: () => void;
  episodeStrengths: EpisodeStrength[];
  onAddStrength?: (strength: Omit<Strength, 'id'>) => void;
}

export default function EpisodeForm({ strengths, onSubmit, initialData, onCancel, onDelete, episodeStrengths, onAddStrength }: EpisodeFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [selectedStrengths, setSelectedStrengths] = useState<string[]>(
    initialData?.strengths.map(s => s.id) || []
  );
  const [scores, setScores] = useState<Record<string, number>>(
    initialData?.strengths.reduce((acc, strength) => {
      // 前回保存したスコアがあればそれを使用し、なければ3をデフォルト値として使用
      const savedScore = episodeStrengths.find(
        es => es.episodeId === initialData.id && es.strengthId === strength.id
      )?.score;
      acc[strength.id] = savedScore || 3;
      return acc;
    }, {} as Record<string, number>) || {}
  );
  const [isAddingStrength, setIsAddingStrength] = useState(false);

  // 初期データが変更されたときにフォームを更新
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setContent(initialData.content);
      setSelectedStrengths(initialData.strengths.map(s => s.id));
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newEpisode: Omit<Episode, 'id' | 'createdAt' | 'updatedAt'> = {
      title,
      content,
      strengths: strengths.filter(s => selectedStrengths.includes(s.id)),
    };

    const newScores: EpisodeStrength[] = selectedStrengths.map(strengthId => ({
      episodeId: initialData?.id || '', // 新規作成時は空文字
      strengthId,
      score: scores[strengthId] || 3,
    }));

    onSubmit(newEpisode, newScores);
  };

  const handleStrengthChange = (strengthId: string) => {
    setSelectedStrengths(prev => {
      if (prev.includes(strengthId)) {
        return prev.filter(id => id !== strengthId);
      } else {
        return [...prev, strengthId];
      }
    });
  };

  const handleAddStrength = (newStrength: Omit<Strength, 'id'>) => {
    if (onAddStrength) {
      onAddStrength(newStrength);
      setIsAddingStrength(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-lg font-medium mb-2">タイトル</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block text-lg font-medium mb-2">内容</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 border rounded h-32"
          required
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-lg font-medium">関連する強み</label>
          {onAddStrength && (
            <button
              type="button"
              onClick={() => setIsAddingStrength(true)}
              className="text-sm bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
            >
              新しい強みを追加
            </button>
          )}
        </div>

        {/* 強み追加フォーム */}
        {isAddingStrength && onAddStrength && (
          <div className="mb-4 p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">新しい強み</h3>
            <StrengthForm
              onSubmit={handleAddStrength}
              onCancel={() => setIsAddingStrength(false)}
            />
          </div>
        )}

        <div className="space-y-4">
          {strengths.map((strength) => (
            <div key={strength.id} className="flex items-center gap-4">
              <input
                type="checkbox"
                id={`strength-${strength.id}`}
                checked={selectedStrengths.includes(strength.id)}
                onChange={() => handleStrengthChange(strength.id)}
                className="h-4 w-4"
              />
              <label htmlFor={`strength-${strength.id}`} className="flex-1">
                {strength.name}
              </label>
              {selectedStrengths.includes(strength.id) && (
                <select
                  value={scores[strength.id] || 3}
                  onChange={(e) => setScores(prev => ({
                    ...prev,
                    [strength.id]: parseInt(e.target.value)
                  }))}
                  className="p-1 border rounded bg-white text-black"
                >
                  {[1, 2, 3, 4, 5].map(score => (
                    <option key={score} value={score}>
                      {score}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {initialData ? '更新' : '作成'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            キャンセル
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            削除
          </button>
        )}
      </div>
    </form>
  );
} 