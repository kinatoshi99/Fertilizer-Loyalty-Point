import React, { useMemo, useState, useEffect } from 'react';
import type { Customer } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { MapPinIcon } from './icons/MapPinIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { PencilIcon } from './icons/PencilIcon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import { CustomerMap } from './CustomerMap';
import { CloseIcon } from './icons/CloseIcon';
import { PlusIcon } from './icons/PlusIcon'; // Re-using for a checkmark style

interface CustomerDetailPanelProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateAddress: (customerId: string, newAddress: string) => Promise<{success: boolean, message: string}>;
}

export const CustomerDetailPanel: React.FC<CustomerDetailPanelProps> = ({ customer, isOpen, onClose, onUpdateAddress }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editedAddress, setEditedAddress] = useState(customer?.address || '');

  useEffect(() => {
    if (customer) {
        setEditedAddress(customer.address);
        setIsEditingAddress(false); // Reset edit mode when customer changes
    }
  }, [customer]);

  const chartData = useMemo(() => {
    if (!customer) return [];
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      name: new Date(0, i).toLocaleString('default', { month: 'short' }),
      totalBags: 0,
    }));

    const currentYear = new Date().getFullYear();
    customer.purchaseHistory.forEach(p => {
      const purchaseDate = new Date(p.date);
      if (purchaseDate.getFullYear() === currentYear) {
        const monthIndex = purchaseDate.getMonth();
        monthlyData[monthIndex].totalBags += p.bagCount;
      }
    });
    return monthlyData;
  }, [customer]);
  
  const handleSaveAddress = async () => {
    if (customer && editedAddress !== customer.address) {
        await onUpdateAddress(customer.id, editedAddress);
    }
    setIsEditingAddress(false);
  };

  const handleCancelEdit = () => {
    if (customer) {
        setEditedAddress(customer.address);
    }
    setIsEditingAddress(false);
  };

  if (!customer) return null;

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-30 dark:bg-opacity-50 z-40 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-4xl bg-off-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div className="h-full flex flex-col">
          <header className="flex-shrink-0 p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={onClose}
              className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 hover:text-charcoal dark:hover:text-white transition group"
            >
              <ArrowLeftIcon className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" />
              <span className="font-inter font-medium">Back to Customers</span>
            </button>
            <h2 className="font-poppins text-2xl font-bold text-charcoal dark:text-white">{customer.name}</h2>
          </header>
          
          <main className="flex-grow overflow-y-auto p-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-4">
                  <h3 className="font-poppins text-lg font-semibold text-charcoal dark:text-white">Customer Details</h3>
                  <div className="text-sm font-inter space-y-2 text-slate-700 dark:text-slate-300">
                      <div className="flex items-start">
                        <MapPinIcon className="w-5 h-5 mr-2 mt-0.5 text-slate-400 flex-shrink-0"/> 
                        <div className="flex-grow">
                          {isEditingAddress ? (
                            <div className="flex flex-col space-y-2">
                                <input 
                                    type="text"
                                    value={editedAddress}
                                    onChange={(e) => setEditedAddress(e.target.value)}
                                    className="w-full px-2 py-1 font-inter border border-slate-300 rounded-md bg-white dark:bg-slate-800 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-pastel-mint/50"
                                />
                                <div className="flex items-center space-x-2">
                                    <button onClick={handleSaveAddress} className="p-1.5 bg-pastel-mint text-white rounded-md hover:opacity-90">
                                        <PlusIcon className="w-4 h-4 transform rotate-45"/>
                                    </button>
                                     <button onClick={handleCancelEdit} className="p-1.5 bg-slate-200 text-charcoal rounded-md hover:bg-slate-300 dark:bg-slate-600 dark:text-white">
                                        <CloseIcon className="w-4 h-4"/>
                                    </button>
                                </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between group">
                                <span>{customer.address}</span>
                                <button onClick={() => setIsEditingAddress(true)} className="opacity-0 group-hover:opacity-100 transition text-slate-400 hover:text-pastel-mint">
                                    <PencilIcon className="w-4 h-4"/>
                                </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <p><span className="font-semibold">Phone:</span> {customer.phone}</p>
                      <p><span className="font-semibold">Total Points:</span> <span className="text-pastel-mint font-bold">{customer.points}</span></p>
                  </div>
              </div>
              <div className="lg:col-span-2 rounded-xl overflow-hidden h-64 border border-slate-200 dark:border-slate-700">
                <CustomerMap lat={customer.lat} lng={customer.lng} address={customer.address} />
              </div>
            </div>

            <div>
              <h3 className="font-poppins text-lg font-semibold text-charcoal dark:text-white mb-4">Monthly Purchases (Current Year)</h3>
              <div className="h-64 w-full bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334152' : '#e2e8f0'}/>
                    <XAxis dataKey="name" tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} />
                    <YAxis tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }}/>
                    <Tooltip
                        cursor={{ fill: isDarkMode ? 'rgba(168, 230, 207, 0.1)' : 'rgba(168, 230, 207, 0.2)' }}
                        contentStyle={{
                          backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                          borderColor: isDarkMode ? '#334152' : '#e2e8f0',
                          borderRadius: '0.75rem'
                        }}
                    />
                    <Bar dataKey="totalBags" name="Bags Purchased" barSize={20}>
                        {chartData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.totalBags > 0 ? '#A8E6CF' : (isDarkMode ? '#334152' : '#e2e8f0')} />
                        ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
                <h3 className="font-poppins text-lg font-semibold text-charcoal dark:text-white mb-4">Purchase History</h3>
                <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <table className="w-full text-left font-inter text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="p-4 font-medium text-slate-600 dark:text-slate-300">Product</th>
                                <th className="p-4 font-medium text-slate-600 dark:text-slate-300">Brand</th>
                                <th className="p-4 font-medium text-slate-600 dark:text-slate-300">NPK</th>
                                <th className="p-4 font-medium text-slate-600 dark:text-slate-300 text-center">Bags</th>
                                <th className="p-4 font-medium text-slate-600 dark:text-slate-300 text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customer.purchaseHistory.slice().reverse().map(p => (
                                <tr key={p.id} className="border-t border-slate-200 dark:border-slate-700">
                                    <td className="p-4 text-slate-800 dark:text-slate-200">{p.productName}</td>
                                    <td className="p-4 text-slate-500 dark:text-slate-400">{p.brand}</td>
                                    <td className="p-4 text-slate-500 dark:text-slate-400">{p.formulaNPK}</td>
                                    <td className="p-4 text-slate-800 dark:text-slate-200 text-center font-medium">{p.bagCount}</td>
                                    <td className="p-4 text-slate-500 dark:text-slate-400 text-right">{new Date(p.date).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {customer.purchaseHistory.length === 0 && (
                        <div className="text-center py-8 text-slate-500 dark:text-slate-400">No purchase history found.</div>
                     )}
                </div>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
};