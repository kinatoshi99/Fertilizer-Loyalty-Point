import React from 'react';
import type { Customer } from '../types';
import { Card } from './Card';
import { BagIcon } from './icons/BagIcon';
import { AlertIcon } from './icons/AlertIcon';

interface CustomerCardProps {
    customer: Customer;
    isInactive: boolean;
    onRecordPurchase: (customer: Customer) => void;
    onViewDetails: (customer: Customer) => void;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({ customer, isInactive, onRecordPurchase, onViewDetails }) => {
  return (
    <Card className={`flex flex-col h-full ${isInactive ? 'border-soft-blush/80 dark:border-red-500/30' : ''}`}>
      <div 
        className="flex-grow cursor-pointer group"
        onClick={() => onViewDetails(customer)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onViewDetails(customer)}
        tabIndex={0}
        aria-label={`View details for ${customer.name}`}
      >
        <div className="flex items-start justify-between mb-2">
            <h3 className="font-poppins text-lg font-bold text-charcoal dark:text-white group-hover:text-pastel-mint transition">{customer.name}</h3>
            {isInactive && <AlertIcon className="w-5 h-5 text-red-500 flex-shrink-0" title="Inactive customer" />}
        </div>
        <p className="text-sm font-inter text-slate-600 dark:text-slate-400 truncate" title={customer.address}>{customer.address}</p>
        <div className="mt-4 flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl">
            <span className="font-inter font-medium text-slate-700 dark:text-slate-300">Points:</span>
            <span className="font-poppins font-bold text-2xl text-pastel-mint">{customer.points}</span>
        </div>
        <p className="text-xs font-inter text-slate-500 dark:text-slate-400 mt-2">
            Last purchase: {new Date(customer.lastPurchaseDate).toLocaleDateString()}
        </p>
      </div>
      <button
        onClick={() => onRecordPurchase(customer)}
        className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-pastel-mint text-white rounded-xl hover:opacity-90 transition font-medium"
      >
        <BagIcon className="w-5 h-5" />
        <span>Record Purchase</span>
      </button>
    </Card>
  );
};
