import React, { useState } from 'react';

interface AddCustomerFormProps {
  onAddCustomer: (name: string, address: string, phone: string) => void;
  onClose: () => void;
}

export const AddCustomerForm: React.FC<AddCustomerFormProps> = ({ onAddCustomer, onClose }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && address && phone) {
      onAddCustomer(name, address, phone);
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-inter">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Full Name</label>
        <input
          type="text"
          id="name"
          data-testid="name-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-pastel-mint/50 focus:border-pastel-mint"
          required
        />
      </div>
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Address</label>
        <input
          type="text"
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-pastel-mint/50 focus:border-pastel-mint"
          required
        />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Phone Number</label>
        <input
          type="tel"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-pastel-mint/50 focus:border-pastel-mint"
          required
        />
      </div>
      <div className="flex justify-end space-x-3 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-charcoal rounded-xl hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition font-medium">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-pastel-mint text-white rounded-xl hover:opacity-90 transition font-medium">Add Customer</button>
      </div>
    </form>
  );
};