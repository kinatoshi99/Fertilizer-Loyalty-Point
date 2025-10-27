import React, { useState, useMemo } from 'react';
import type { Customer, Reward } from '../types';

interface RedeemRewardFormProps {
  customers: Customer[];
  reward: Reward;
  onRedeem: (customerId: string, rewardId: string) => { success: boolean; message: string };
  onClose: () => void;
}

export const RedeemRewardForm: React.FC<RedeemRewardFormProps> = ({ 
  customers, 
  reward, 
  onRedeem, 
  onClose 
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [error, setError] = useState<string>('');
  
  const sortedCustomers = useMemo(() => {
    return [...customers].sort((a, b) => b.points - a.points);
  }, [customers]);

  const selectedCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId);
  }, [customers, selectedCustomerId]);

  const hasEnoughPoints = selectedCustomer 
    ? selectedCustomer.points >= reward.pointsCost 
    : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!selectedCustomerId) {
      setError('Please select a customer');
      return;
    }
    
    if (!hasEnoughPoints) {
      setError('Selected customer does not have enough points');
      return;
    }
    
    const result = onRedeem(selectedCustomerId, reward.id);
    if (result.success) {
      onClose();
    } else {
      setError(result.message || 'Failed to redeem reward');
    }
  };

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCustomerId(e.target.value);
    setError('');
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-slate-700 dark:text-slate-300">
        Redeeming <span className="font-semibold text-purple-500">{reward.name}</span> for {reward.pointsCost} points.
      </p>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      <div>
        <label htmlFor="customer" className="block text-sm font-medium text-slate-600 dark:text-slate-300">
          Select Customer
        </label>
        <select
          id="customer"
          value={selectedCustomerId}
          onChange={handleCustomerChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          required
        >
          <option value="">-- Select a customer --</option>
          {sortedCustomers.map(c => (
            <option 
              key={c.id} 
              value={c.id} 
              disabled={c.points < reward.pointsCost}
            >
              {c.name} ({c.points} points)
              {c.points < reward.pointsCost && ' - Insufficient points'}
            </option>
          ))}
        </select>
        {selectedCustomerId && !hasEnoughPoints && (
          <p className="text-sm text-red-500 mt-1">
            This customer does not have enough points. Need {reward.pointsCost - (selectedCustomer?.points || 0)} more points.
          </p>
        )}
      </div>
      
      <div className="flex justify-end space-x-3 pt-2">
        <button 
          type="button" 
          onClick={onClose} 
          className="px-4 py-2 bg-slate-200 text-charcoal rounded-xl hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition font-medium"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={!selectedCustomerId || !hasEnoughPoints} 
          className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:opacity-90 transition font-medium disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
        >
          Redeem
        </button>
      </div>
    </form>
  );
};
