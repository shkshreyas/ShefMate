# ShefMate - Chef Booking Platform

ShefMate is a platform that connects customers with professional chefs for personalized cooking experiences.

## Image Upload Configuration

This application uses free image hosting services for storing profile images and other media.

### ImgBB (Primary)

This app is currently using a free ImgBB API key:

```
b9409d197d650cf07172a9814f0b19b9
```

If you need to get your own API key (recommended for production):

1. Go to [ImgBB](https://api.imgbb.com/)
2. Sign up for a free account
3. Generate an API key
4. Replace the `apiKey` value in `src/lib/firebase-utils.ts` in the `uploadToImgBB` function

### Cloudinary (Fallback 1)

1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for a free account
3. From your dashboard, note your "Cloud name"
4. Create an unsigned upload preset:
   - Go to Settings > Upload
   - Scroll down to "Upload presets"
   - Click "Add upload preset"
   - Set "Signing mode" to "Unsigned"
   - Name it (e.g., "ml_default")
5. Replace the values in `src/lib/firebase-utils.ts` in the `uploadToCloudinary` function:

```javascript
formData.append("upload_preset", "YOUR_UPLOAD_PRESET"); // Replace with your preset name
const cloudName = "YOUR_CLOUD_NAME"; // Replace with your cloud name
```

### Imgur (Fallback 2)

1. Go to [Imgur API](https://api.imgur.com/oauth2/addclient)
2. Sign up for a free account
3. Register a new application
   - Set "OAuth 2 authorization with callback URL" as the authorization type
   - Enter any URL for callback (e.g., https://example.com/callback)
4. Get your Client ID
5. Replace the client ID in `src/lib/firebase-utils.ts` in the `uploadToImgur` function:

```javascript
const clientId = "YOUR_IMGUR_CLIENT_ID"; // Replace with your client ID
```

## Service Configuration Notes

- The application will try these services in order: ImgBB → Cloudinary → Imgur
- If one service fails, it will automatically try the next one
- Free plans have daily/monthly upload limits, so using multiple services provides redundancy
- For production use, consider using Firebase Storage or a paid image hosting service

## Setting up Firebase

For user authentication and database, this application uses Firebase:

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database and Authentication
3. Create required indexes for queries (see `firestore.indexes.json`)
4. Update Firebase configuration in `src/lib/firebase.ts`

## Running the Application

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```
