import React, { useState, useEffect } from 'react';
import type { Reward } from '../types';

interface RewardFormProps {
  onSubmit: (rewardData: Omit<Reward, 'id'>) => void;
  onClose: () => void;
  initialData?: Reward | null;
}

export const RewardForm: React.FC<RewardFormProps> = ({ onSubmit, onClose, initialData }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pointsCost, setPointsCost] = useState('');
  const [inventory, setInventory] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description);
      setPointsCost(String(initialData.pointsCost));
      setInventory(String(initialData.inventory));
    } else {
      setName('');
      setDescription('');
      setPointsCost('');
      setInventory('');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pointsCostNum = parseInt(pointsCost, 10);
    const inventoryNum = parseInt(inventory, 10);

    if (name && description && !isNaN(pointsCostNum) && !isNaN(inventoryNum)) {
      onSubmit({
        name,
        description,
        pointsCost: pointsCostNum,
        inventory: inventoryNum,
      });
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-inter">
      <div>
        <label htmlFor="reward-name" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Reward Name</label>
        <input
          type="text"
          id="reward-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-pale-lavender/50"
          required
        />
      </div>
      <div>
        <label htmlFor="reward-desc" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Description</label>
        <textarea
          id="reward-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-pale-lavender/50"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="reward-points" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Points Cost</label>
          <input
            type="number"
            id="reward-points"
            value={pointsCost}
            onChange={(e) => setPointsCost(e.target.value)}
            min="0"
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-pale-lavender/50"
            required
          />
        </div>
        <div>
          <label htmlFor="reward-inventory" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Inventory</label>
          <input
            type="number"
            id="reward-inventory"
            value={inventory}
            onChange={(e) => setInventory(e.target.value)}
            min="0"
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-pale-lavender/50"
            required
          />
        </div>
      </div>
      <div className="flex justify-end space-x-3 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-charcoal rounded-xl hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition font-medium">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-pale-lavender text-white rounded-xl hover:opacity-90 transition font-medium">Save Reward</button>
      </div>
    </form>
  );
};
