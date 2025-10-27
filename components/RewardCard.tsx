import React from 'react';
import type { Reward } from '../types';
import { Card } from './Card';
import { GiftIcon } from './icons/GiftIcon';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';

interface RewardCardProps {
  reward: Reward;
  onRedeem: (reward: Reward) => void;
  onEdit: (reward: Reward) => void;
  onDelete: (rewardId: string) => void;
}

export const RewardCard: React.FC<RewardCardProps> = ({ reward, onRedeem, onEdit, onDelete }) => {
  return (
    <Card className="flex flex-col h-full">
      <div className="flex-grow">
        <div className="flex justify-between items-start">
            <h3 className="font-poppins text-lg font-bold text-charcoal dark:text-white pr-2">{reward.name}</h3>
            <div className="flex items-center space-x-2">
                <button onClick={() => onEdit(reward)} className="text-slate-400 hover:text-purple-500 transition" aria-label={`Edit ${reward.name}`}>
                    <PencilIcon className="w-4 h-4"/>
                </button>
                <button onClick={() => onDelete(reward.id)} className="text-slate-400 hover:text-soft-blush transition" aria-label={`Delete ${reward.name}`}>
                    <TrashIcon className="w-4 h-4"/>
                </button>
            </div>
        </div>
        <p className="text-sm font-inter text-slate-600 dark:text-slate-400 mt-1">{reward.description}</p>
        <div className="mt-4 flex items-baseline justify-between bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl">
          <span className="font-inter font-medium text-slate-700 dark:text-slate-300">Cost:</span>
          <span className="font-poppins font-bold text-2xl text-purple-500">{reward.pointsCost} pts</span>
        </div>
        <p className="text-xs font-inter text-slate-500 dark:text-slate-400 mt-2">In stock: {reward.inventory}</p>
      </div>
      <button
        onClick={() => onRedeem(reward)}
        disabled={reward.inventory <= 0}
        className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-purple-500 text-white rounded-xl hover:opacity-90 transition font-medium disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
      >
        <GiftIcon className="w-5 h-5" />
        <span>Redeem</span>
      </button>
    </Card>
  );
};