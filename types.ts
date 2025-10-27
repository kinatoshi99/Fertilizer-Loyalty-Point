
export interface Customer {
  id: string;
  name: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  points: number;
  lastPurchaseDate: Date;
  purchaseHistory: Purchase[];
}

export interface Purchase {
  id: string;
  customerId: string;
  productName: string;
  brand: string;
  formulaNPK: string;
  bagCount: number;
  pointsEarned: number;
  date: Date;
}

export interface Reward {
  id:string;
  name: string;
  description: string;
  pointsCost: number;
  inventory: number;
}