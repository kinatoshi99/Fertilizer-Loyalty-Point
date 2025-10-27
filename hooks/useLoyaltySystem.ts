import { useState, useMemo, useCallback } from 'react';
import type { Customer, Purchase, Reward } from '../types';
import { BUSINESS_RULES, INITIAL_REWARDS } from '../constants';

const generateInitialCustomers = (): Customer[] => {
    const today = new Date();
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(today.getFullYear() - 3);

    const thisYearPurchases: Purchase[] = [
        { id: 'p1', customerId: 'cust-1', productName: 'All-Purpose Fertilizer', brand: 'GrowFast', formulaNPK: '10-10-10', bagCount: 5, pointsEarned: 50, date: new Date(today.getFullYear(), 0, 15) },
        { id: 'p2', customerId: 'cust-1', productName: 'Bloom Booster', brand: 'SuperBloom', formulaNPK: '5-20-10', bagCount: 3, pointsEarned: 30, date: new Date(today.getFullYear(), 2, 20) },
        { id: 'p5', customerId: 'cust-1', productName: 'All-Purpose Fertilizer', brand: 'GrowFast', formulaNPK: '10-10-10', bagCount: 4, pointsEarned: 40, date: new Date(today.getFullYear(), 3, 5) },
        { id: 'p6', customerId: 'cust-1', productName: 'Lawn Starter', brand: 'GreenThumb', formulaNPK: '24-25-4', bagCount: 8, pointsEarned: 80, date: new Date() },
    ];

    return [
        { 
            id: 'cust-1', name: 'John Farmer', address: '1600 Amphitheatre Parkway, Mountain View, CA', phone: '555-0101', 
            lat: 37.422, lng: -122.084,
            points: 200, lastPurchaseDate: new Date(), purchaseHistory: thisYearPurchases
        },
        { 
            id: 'cust-2', name: 'Jane Appleseed', address: '1 Apple Park Way, Cupertino, CA', phone: '555-0102', 
            lat: 37.334, lng: -122.009,
            points: 45, lastPurchaseDate: new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000), purchaseHistory: [
                { id: 'p3', customerId: 'cust-2', productName: 'Fruit Tree Special', brand: 'OrchardKing', formulaNPK: '12-5-7', bagCount: 4, pointsEarned: 40, date: new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000) }
            ]
        },
        { 
            id: 'cust-3', name: 'Old MacDonald', address: 'Eiffel Tower, Champ de Mars, Paris, France', phone: '555-0103', 
            lat: 48.858, lng: 2.294,
            points: 200, lastPurchaseDate: threeYearsAgo, purchaseHistory: [
                { id: 'p4', customerId: 'cust-3', productName: 'Pasture Blend', brand: 'GreenThumb', formulaNPK: '16-8-8', bagCount: 20, pointsEarned: 200, date: threeYearsAgo }
            ]
        },
    ];
};

const GEOCODING_API_KEY: string = 'AIzaSyDEPSsry9S9zLAUWY6auIPaQcexZt48Zro';

const geocodeAddress = async (address: string): Promise<{lat: number, lng: number}> => {
    let lat = 40.7128;
    let lng = -74.0060;

    if (!GEOCODING_API_KEY || GEOCODING_API_KEY === 'YOUR_API_KEY_HERE') {
        console.warn('Geocoding API key is missing. Returning default coordinates.');
        return { lat, lng };
    }

    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GEOCODING_API_KEY}`);
      const data = await response.json();
      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        lat = location.lat;
        lng = location.lng;
      } else {
        console.warn('Geocoding failed for address:', address, 'Status:', data.status);
      }
    } catch (error) {
      console.error('Error during geocoding API call:', error);
    }
    return { lat, lng };
};


export const useLoyaltySystem = () => {
  const [customers, setCustomers] = useState<Customer[]>(generateInitialCustomers());
  const [rewards, setRewards] = useState<Reward[]>(INITIAL_REWARDS);

  const addCustomer = useCallback(async (name: string, address: string, phone: string) => {
    const { lat, lng } = await geocodeAddress(address);

    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      name,
      address,
      phone,
      lat,
      lng,
      points: 0,
      lastPurchaseDate: new Date(),
      purchaseHistory: [],
    };
    setCustomers(prev => [...prev, newCustomer]);
  }, []);

  const updateCustomerAddress = useCallback(async (customerId: string, newAddress: string) => {
    const { lat, lng } = await geocodeAddress(newAddress);

    setCustomers(prevCustomers => prevCustomers.map(customer => {
        if (customer.id === customerId) {
            return {
                ...customer,
                address: newAddress,
                lat,
                lng
            };
        }
        return customer;
    }));
    return { success: true, message: 'Customer address updated successfully.' };
  }, []);

  const recordPurchase = useCallback((customerId: string, bagCount: number) => {
    const pointsEarned = bagCount * BUSINESS_RULES.POINTS_PER_BAG;
    
    setCustomers(prevCustomers => prevCustomers.map(customer => {
      if (customer.id === customerId) {
        const newPurchase: Purchase = {
          id: `pur-${Date.now()}`,
          customerId,
          bagCount,
          pointsEarned,
          date: new Date(),
          productName: 'Generic Fertilizer',
          brand: 'AgriCorp',
          formulaNPK: '10-10-10'
        };
        return {
          ...customer,
          points: customer.points + pointsEarned,
          lastPurchaseDate: new Date(),
          purchaseHistory: [...customer.purchaseHistory, newPurchase],
        };
      }
      return customer;
    }));
    return { success: true, message: `${pointsEarned} points added to customer.` };
  }, []);
  
  const redeemReward = useCallback((customerId: string, rewardId: string) => {
    const customer = customers.find(c => c.id === customerId);
    const reward = rewards.find(r => r.id === rewardId);

    if (!customer || !reward) {
        return { success: false, message: 'Customer or reward not found.' };
    }
    if (customer.points < reward.pointsCost) {
        return { success: false, message: 'Not enough points.' };
    }
    if (reward.inventory <= 0) {
        return { success: false, message: 'Reward out of stock.' };
    }

    setCustomers(prevCustomers => prevCustomers.map(c => 
        c.id === customerId ? { ...c, points: c.points - reward.pointsCost } : c
    ));

    setRewards(prevRewards => prevRewards.map(r => 
        r.id === rewardId ? { ...r, inventory: r.inventory - 1 } : r
    ));

    return { success: true, message: `${reward.name} redeemed successfully!` };
  }, [customers, rewards]);

  const addReward = useCallback((rewardData: Omit<Reward, 'id'>) => {
    const newReward: Reward = {
        ...rewardData,
        id: `reward-${Date.now()}`,
    };
    setRewards(prev => [newReward, ...prev]);
    return { success: true, message: 'Reward added successfully!' };
  }, []);

  const updateReward = useCallback((rewardId: string, updatedData: Omit<Reward, 'id'>) => {
    setRewards(prev => prev.map(r => r.id === rewardId ? { ...updatedData, id: rewardId } : r));
    return { success: true, message: 'Reward updated successfully!' };
  }, []);

  const deleteReward = useCallback((rewardId: string) => {
    setRewards(prev => prev.filter(r => r.id !== rewardId));
    return { success: true, message: 'Reward deleted.' };
  }, []);


  const inactiveCustomers = useMemo(() => {
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - BUSINESS_RULES.INACTIVITY_YEARS);
    return customers.filter(customer => customer.lastPurchaseDate < cutoffDate);
  }, [customers]);

  return {
    customers,
    rewards,
    inactiveCustomers,
    addCustomer,
    updateCustomerAddress,
    recordPurchase,
    redeemReward,
    addReward,
    updateReward,
    deleteReward,
  };
};