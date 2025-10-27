
import type { Reward } from './types';

export const BUSINESS_RULES = {
  POINTS_PER_BAG: 10,
  INACTIVITY_YEARS: 2,
  YEARLY_RESET_DATE: '01-01', // January 1
};

export const INITIAL_REWARDS: Reward[] = [
  {
    id: 'shirt',
    name: 'Company T-Shirt',
    description: 'High-quality cotton t-shirt with company logo.',
    pointsCost: 50,
    inventory: 100
  },
  {
    id: 'bottle',
    name: 'Insulated Water Bottle',
    description: 'Keeps your drinks cold for 24 hours.',
    pointsCost: 30,
    inventory: 250
  },
  {
    id: 'appliance',
    name: 'Small Kitchen Appliance',
    description: 'A brand new microwave oven.',
    pointsCost: 150,
    inventory: 20
  },
  {
    id: 'blanket',
    name: 'Cozy Fleece Blanket',
    description: 'Perfect for cool evenings on the farm.',
    pointsCost: 80,
    inventory: 75
  },
];
