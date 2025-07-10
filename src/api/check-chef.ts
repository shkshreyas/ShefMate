import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Request, Response } from 'express';

export default async function handler(req: Request, res: Response) {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ 
      error: 'Missing userId parameter'
    });
  }

  try {
    const q = query(
      collection(db, "chefs"), 
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(q);
    const exists = !querySnapshot.empty;
    
    return res.status(200).json({ exists });
  } catch (error) {
    console.error('Error checking chef existence:', error);
    return res.status(500).json({ 
      error: 'Failed to check chef existence', 
      details: error instanceof Error ? error.message : String(error)
    });
  }
} 