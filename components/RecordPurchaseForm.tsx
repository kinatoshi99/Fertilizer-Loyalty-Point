import React, { useState } from 'react';
import type { Customer } from '../types';

interface RecordPurchaseFormProps {
  customer: Customer | null;
  onRecordPurchase: (customerId: string, bagCount: number) => { success: boolean, message: string };
  onClose: () => void;
}

export const RecordPurchaseForm: React.FC<RecordPurchaseFormProps> = ({ customer, onRecordPurchase, onClose }) => {
  const [bagCount, setBagCount] = useState(1);

  if (!customer) {
    return null; // Gracefully handle null customer prop
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bagCount > 0) {
      onRecordPurchase(customer.id, bagCount);
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-inter">
      <p className="text-slate-700 dark:text-slate-300">Recording purchase for <span className="font-semibold text-pastel-mint">{customer.name}</span>.</p>
      <div>
        <label htmlFor="bagCount" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Number of Bags</label>
        <input
          type="number"
          id="bagCount"
          value={bagCount}
          onChange={(e) => setBagCount(parseInt(e.target.value, 10) || 1)}
          min="1"
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-pastel-mint/50 focus:border-pastel-mint"
          required
        />
      </div>
      <div className="flex justify-end space-x-3 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-charcoal rounded-xl hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition font-medium">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-pastel-mint text-white rounded-xl hover:opacity-90 transition font-medium">Record Purchase</button>
      </div>
    </form>
  );
};