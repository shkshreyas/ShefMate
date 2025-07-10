/**
 * This file contains Firebase Cloud Functions setup code.
 * 
 * To deploy these functions, you'll need to:
 * 1. Install Firebase CLI: npm install -g firebase-tools
 * 2. Login to Firebase: firebase login
 * 3. Initialize Firebase in a separate directory: firebase init functions
 * 4. Copy this code to your functions/index.js file
 * 5. Deploy: firebase deploy --only functions
 */

/**
 * Cloud Function to delete expired orders
 * 
 * import * as functions from 'firebase-functions';
 * import * as admin from 'firebase-admin';
 * 
 * admin.initializeApp();
 * const db = admin.firestore();
 * 
 * // Run every day at midnight
 * export const cleanupExpiredOrders = functions.pubsub
 *   .schedule('0 0 * * *')
 *   .timeZone('UTC')
 *   .onRun(async () => {
 *     try {
 *       const now = admin.firestore.Timestamp.now();
 *       
 *       // Query for orders with dates in the past
 *       const snapshot = await db.collection('orders')
 *         .where('orderDate', '<', now)
 *         .get();
 *       
 *       if (snapshot.empty) {
 *         console.log('No expired orders found');
 *         return null;
 *       }
 *       
 *       // Delete each expired order
 *       const batch = db.batch();
 *       snapshot.docs.forEach(doc => {
 *         batch.delete(doc.ref);
 *       });
 *       
 *       await batch.commit();
 *       console.log(`Deleted ${snapshot.size} expired orders`);
 *       
 *       return null;
 *     } catch (error) {
 *       console.error('Error cleaning up expired orders:', error);
 *       return null;
 *     }
 *   });
 * 
 * // Also automatically mark orders as completed if they're past their date/time and still in 'accepted' status
 * export const autoCompleteOrders = functions.pubsub
 *   .schedule('0 * * * *') // Run every hour
 *   .timeZone('UTC')
 *   .onRun(async () => {
 *     try {
 *       const now = admin.firestore.Timestamp.now();
 *       
 *       // Query for accepted orders with dates in the past
 *       const snapshot = await db.collection('orders')
 *         .where('status', '==', 'accepted')
 *         .where('orderDate', '<', now)
 *         .get();
 *       
 *       if (snapshot.empty) {
 *         console.log('No orders to auto-complete');
 *         return null;
 *       }
 *       
 *       // Mark each order as completed
 *       const batch = db.batch();
 *       snapshot.docs.forEach(doc => {
 *         batch.update(doc.ref, { 
 *           status: 'completed',
 *           updatedAt: now
 *         });
 *       });
 *       
 *       await batch.commit();
 *       console.log(`Auto-completed ${snapshot.size} orders`);
 *       
 *       return null;
 *     } catch (error) {
 *       console.error('Error auto-completing orders:', error);
 *       return null;
 *     }
 *   });
 */ 