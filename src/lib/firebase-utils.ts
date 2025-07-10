import { db } from './firebase';
import { collection, addDoc, getDoc, getDocs, query, where, doc, updateDoc, deleteDoc, Timestamp, onSnapshot, orderBy, limit } from 'firebase/firestore';

// Chef operations
export async function getChefByUserId(userId: string) {
  try {
    const chefsRef = collection(db, "chefs");
    const q = query(chefsRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    // Return the first matching chef document
    const chefDoc = querySnapshot.docs[0];
    return { id: chefDoc.id, ...chefDoc.data() };
  } catch (error) {
    console.error("Error getting chef by user ID:", error);
    throw error;
  }
}

export async function getChefById(chefId: string) {
  try {
    const chefRef = doc(db, "chefs", chefId);
    const chefSnap = await getDoc(chefRef);
    
    if (!chefSnap.exists()) {
      return null;
    }
    
    return { id: chefSnap.id, ...chefSnap.data() };
  } catch (error) {
    console.error("Error getting chef by ID:", error);
    throw error;
  }
}

export async function getAllChefs() {
  try {
    const chefsRef = collection(db, "chefs");
    const querySnapshot = await getDocs(chefsRef);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting all chefs:", error);
    throw error;
  }
}

export async function updateChef(chefId: string, data: any) {
  try {
    const chefRef = doc(db, "chefs", chefId);
    await updateDoc(chefRef, data);
    return { success: true };
  } catch (error) {
    console.error("Error updating chef:", error);
    throw error;
  }
}

export async function registerChef(chefData: any) {
  try {
    const docRef = await addDoc(collection(db, "chefs"), {
      ...chefData,
      createdAt: Timestamp.now(),
      rating: 0,
      totalOrders: 0,
      customersServed: 0
    });
    
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error registering chef:", error);
    throw error;
  }
}

// Service operations
export async function getServicesByChefId(chefId: string) {
  try {
    const servicesRef = collection(db, "services");
    const q = query(servicesRef, where("chefId", "==", chefId), where("isActive", "==", true));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting services by chef ID:", error);
    throw error;
  }
}

export async function addService(data: any) {
  try {
    const serviceData = {
      ...data,
      isActive: true,
      createdAt: Timestamp.now()
    };
    
    const docRef = await addDoc(collection(db, "services"), serviceData);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding service:", error);
    throw error;
  }
}

export async function updateService(serviceId: string, data: any) {
  try {
    const serviceRef = doc(db, "services", serviceId);
    await updateDoc(serviceRef, data);
    return { success: true };
  } catch (error) {
    console.error("Error updating service:", error);
    throw error;
  }
}

export async function deleteService(serviceId: string) {
  try {
    const serviceRef = doc(db, "services", serviceId);
    await updateDoc(serviceRef, { isActive: false });
    return { success: true };
  } catch (error) {
    console.error("Error deleting service:", error);
    throw error;
  }
}

// Order operations
export async function createOrder(data: any) {
  try {
    // Ensure createdAt is set
    if (!data.createdAt) {
      data.createdAt = Timestamp.now();
    }
    
    // Default status to pending if not specified
    if (!data.status) {
      data.status = 'pending';
    }
    
    // Add order to database
    const ordersRef = collection(db, "orders");
    const docRef = await addDoc(ordersRef, data);
    
    // Increment chef's order count
    try {
      if (data.chefId) {
        const chefRef = doc(db, "chefs", data.chefId);
        const chefDoc = await getDoc(chefRef);
        if (chefDoc.exists()) {
          const currentOrders = chefDoc.data().totalOrders || 0;
          await updateDoc(chefRef, {
            totalOrders: currentOrders + 1
          });
        }
      }
    } catch (error) {
      console.error("Error updating chef's order count:", error);
    }
    
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}

export async function getOrdersByChefId(chefId: string) {
  try {
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, where("chefId", "==", chefId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting orders by chef ID:", error);
    throw error;
  }
}

export async function getOrdersByUserId(userId: string) {
  try {
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, where("userId", "==", userId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting orders by user ID:", error);
    throw error;
  }
}

export async function updateOrder(orderId: string, data: any) {
  try {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating order:", error);
    throw error;
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const orderRef = doc(db, "orders", orderId);
    
    // If completing an order, update the chef's customers served count
    if (status === 'completed') {
      const orderDoc = await getDoc(orderRef);
      if (orderDoc.exists()) {
        const orderData = orderDoc.data();
        const chefId = orderData.chefId;
        
        if (chefId) {
          const chefRef = doc(db, "chefs", chefId);
          const chefDoc = await getDoc(chefRef);
          if (chefDoc.exists()) {
            const currentServed = chefDoc.data().customersServed || 0;
            await updateDoc(chefRef, {
              customersServed: currentServed + 1
            });
          }
        }
      }
    }
    
    await updateDoc(orderRef, {
      status,
      updatedAt: Timestamp.now()
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { success: false, error };
  }
}

// Realtime listeners
export const subscribeToChefOrders = (chefId: string, callback: (orders: any[]) => void) => {
  const q = query(
    collection(db, "orders"), 
    where("chefId", "==", chefId),
    orderBy("createdAt", "desc")
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const orders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(orders);
  });
};

export const subscribeToUserOrders = (userId: string, callback: (orders: any[]) => void) => {
  const q = query(
    collection(db, "orders"), 
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const orders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(orders);
  });
};

export const getAllOrders = async () => {
  try {
    const ordersSnapshot = await getDocs(
      query(collection(db, "orders"), orderBy("createdAt", "desc"))
    );
    const orders = ordersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return orders;
  } catch (error) {
    console.error("Error fetching all orders:", error);
    return [];
  }
};

// Image operations
export async function uploadImage(file: File, path: string): Promise<string> {
  try {
    // Use external image hosting service
    const imageUrl = await uploadImageToExternalService(file);
    return imageUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

// Upload to a free image hosting service
async function uploadImageToExternalService(imageFile: File): Promise<string> {
  try {
    console.log('Starting image upload, file size:', Math.round(imageFile.size / 1024), 'KB');
    
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append('image', imageFile);
    
    // Use ImgBB free API
    const apiUrl = 'https://api.imgbb.com/1/upload?key=f1c7fb499c2f3a6c5966b48318d97ff7';
    console.log('Uploading to:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload failed with status:', response.status, errorText);
      throw new Error(`Upload failed with status: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Upload response:', data);
    
    if (data.success) {
      console.log('Image uploaded successfully, URL:', data.data.url);
      return data.data.url;
    } else {
      console.error('Image upload failed with response:', data);
      throw new Error('Image upload failed: ' + (data.error?.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export async function deleteImage(path: string) {
  // No need to delete from Firebase Storage anymore
  return { success: true };
} 