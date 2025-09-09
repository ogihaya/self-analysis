'use client';

import { useState, useEffect } from 'react';
import { Strength } from '../types/self-analysis';

interface StrengthFormProps {
  onSubmit: (strength: Omit<Strength, 'id'>) => void;
  initialData?: Strength;
  onCancel?: () => void;
  onDelete?: () => void;
}

export default function StrengthForm({ onSubmit, initialData, onCancel, onDelete }: StrengthFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');

  // 初期データが変更されたときにフォームを更新
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description);
    }
  }, [initialData]);

  const handleSubmit = () => {
    const newStrength: Omit<Strength, 'id'> = {
      name,
      description,
    };
    onSubmit(newStrength);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-lg font-medium mb-2">強みの名前</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block text-lg font-medium mb-2">説明</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded h-24"
          required
        />
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={handleSubmit}
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
    </div>
  );
} 