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
    console.log('Starting image upload process with file:', file.name, 'Size:', Math.round(file.size / 1024), 'KB');
    
    // Try multiple image hosting services with fallbacks
    try {
      // First attempt: ImgBB
      console.log('Attempting upload to ImgBB...');
      const imageUrl = await uploadToImgBB(file);
      console.log('ImgBB upload succeeded');
      return imageUrl;
    } catch (error) {
      console.error('ImgBB upload failed with error:', error);
      console.log('Trying Cloudinary fallback...');
      
      // Second attempt: Free Cloudinary
      try {
        const cloudinaryUrl = await uploadToCloudinary(file);
        console.log('Cloudinary upload succeeded');
        return cloudinaryUrl;
      } catch (cloudinaryError) {
        console.error('Cloudinary upload failed with error:', cloudinaryError);
        console.log('Trying Imgur fallback...');
        
        // Third attempt: Imgur
        try {
          const imgurUrl = await uploadToImgur(file);
          console.log('Imgur upload succeeded');
          return imgurUrl;
        } catch (imgurError) {
          console.error('Imgur upload failed with error:', imgurError);
          throw new Error('All image upload services failed');
        }
      }
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("All image upload services failed. Please try again later.");
  }
}

// ImgBB upload (free)
async function uploadToImgBB(imageFile: File): Promise<string> {
  console.log('Starting ImgBB upload, file size:', Math.round(imageFile.size / 1024), 'KB');
  
  // Create a FormData object to send the file
  const formData = new FormData();
  formData.append('image', imageFile);
  
  // Use ImgBB free API with the provided API key
  const apiKey = 'b9409d197d650cf07172a9814f0b19b9';
  const apiUrl = `https://api.imgbb.com/1/upload?key=${apiKey}`;
  
  console.log('Sending request to ImgBB at:', apiUrl);
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    });
    
    console.log('ImgBB response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('ImgBB error response:', errorText);
      throw new Error(`ImgBB upload failed with status: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('ImgBB response data received');
    
    if (data.success) {
      // ImgBB provides different URL options, using display_url for better quality
      console.log('ImgBB upload successful');
      console.log('Image URL:', data.data.display_url);
      console.log('Thumbnail URL:', data.data.thumb.url);
      console.log('Delete URL:', data.data.delete_url);
      
      // Return the display URL which is typically best quality
      return data.data.display_url;
    } else {
      console.error('ImgBB reported failure:', data);
      throw new Error('ImgBB upload failed: ' + (data.error?.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error in ImgBB upload function:', error);
    throw error;
  }
}

// Cloudinary upload (free tier)
async function uploadToCloudinary(imageFile: File): Promise<string> {
  console.log('Starting Cloudinary upload, file size:', Math.round(imageFile.size / 1024), 'KB');
  
  // Create a FormData object to send the file
  const formData = new FormData();
  formData.append('file', imageFile);
  
  // Using a public upload preset that doesn't require authentication
  formData.append('upload_preset', 'docs_upload_example_us_preset');
  
  // Public demo cloud name for testing purposes
  const cloudName = 'demo';
  const apiUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  
  console.log('Sending request to Cloudinary');
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    });
    
    console.log('Cloudinary response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary error response:', errorText);
      throw new Error(`Cloudinary upload failed with status: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Cloudinary response data received:', data);
    
    if (data.secure_url) {
      console.log('Cloudinary upload successful, URL:', data.secure_url);
      return data.secure_url;
    } else {
      console.error('Cloudinary failed to return a secure URL:', data);
      throw new Error('Cloudinary upload failed: No secure URL in response');
    }
  } catch (error) {
    console.error('Error in Cloudinary upload function:', error);
    throw error;
  }
}

// Imgur upload (free)
async function uploadToImgur(imageFile: File): Promise<string> {
  console.log('Starting Imgur upload, file size:', Math.round(imageFile.size / 1024), 'KB');
  
  // Create a FormData object to send the file
  const formData = new FormData();
  formData.append('image', imageFile);
  
  // Replace with your Imgur client ID - Get one at https://api.imgur.com/oauth2/addclient
  const clientId = '546c25a59c58ad7';
  
  const response = await fetch('https://api.imgur.com/3/image', {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Client-ID ${clientId}`
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Imgur upload failed with status: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  
  if (data.success) {
    console.log('Imgur upload successful, URL:', data.data.link);
    return data.data.link;
  } else {
    throw new Error('Imgur upload failed: ' + (data.data?.error || 'Unknown error'));
  }
}

export async function deleteImage(path: string) {
  // Images on free hosting services typically can't be deleted via API
  return { success: true };
} 