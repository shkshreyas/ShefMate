# ShefMate - Chef Booking Platform

ShefMate is a platform that connects customers with professional chefs for personalized cooking experiences.

## Enhanced Image Upload System

This application uses a robust multi-service image upload system with parallel uploads and automatic fallbacks for maximum reliability.

### How It Works

The system attempts to upload images to **5 different free image hosting services simultaneously**:

1. **ImgBB** (Primary)
2. **Cloudinary** (Fallback 1)
3. **Imgur** (Fallback 2)
4. **FreeImage.host** (Fallback 3)
5. **PostImages.cc** (Fallback 4)

**Benefits:**

- **Parallel uploads**: All services are tried simultaneously for faster results
- **Automatic fallback**: If one service fails, others continue
- **High reliability**: Multiple services ensure uploads rarely fail
- **No single point of failure**: If one service is down, others still work

### Service Configuration

#### ImgBB (Primary)

- **API Key**: `b9409d197d650cf07172a9814f0b19b9`
- **Status**: Active and configured
- **Features**: High quality images, thumbnails, delete URLs

#### Cloudinary (Fallback 1)

- **Cloud Name**: `dcb3ssrse`
- **API Key**: `456884833162782`
- **Upload Preset**: `ml_default`
- **Status**: Active and configured
- **Features**: Image transformations, CDN delivery

#### Imgur (Fallback 2)

- **Client ID**: `546c25a59c58ad7`
- **Status**: Active and configured
- **Features**: Community features, direct links

#### FreeImage.host (Fallback 3)

- **API Key**: `6d207e02198a847aa98d0a2a901485a5`
- **Status**: Active and configured
- **Features**: Simple API, reliable hosting

#### PostImages.cc (Fallback 4)

- **Status**: Active and configured
- **Features**: No API key required, simple upload

### Technical Implementation

The upload system is implemented in two files:

- `src/lib/firebase-utils.ts` - Main upload function with Firebase integration
- `src/lib/uploadImage.ts` - Standalone upload function

**Key Features:**

- Parallel upload attempts using `Promise.allSettled()`
- Comprehensive error logging for debugging
- Automatic service selection (first successful upload wins)
- Detailed console logging for monitoring

### Usage

```javascript
import { uploadImage } from "@/lib/firebase-utils";

// Upload an image file
const imageUrl = await uploadImage(file, "path/optional");
console.log("Uploaded image URL:", imageUrl);
```

### Error Handling

If all services fail, the system:

1. Logs detailed error information for each service
2. Throws a user-friendly error message
3. Provides debugging information in the console

### Monitoring

The system provides extensive logging:

- File size and type information
- Upload progress for each service
- Success/failure status for each service
- Final selected image URL

### Getting Your Own API Keys (Optional)

For production use, you may want to get your own API keys:

#### ImgBB

1. Go to [ImgBB](https://api.imgbb.com/)
2. Sign up for a free account
3. Generate an API key
4. Replace the `apiKey` value in the upload functions

#### Cloudinary

1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for a free account
3. From your dashboard, note your "Cloud name"
4. Create an unsigned upload preset:
   - Go to Settings > Upload
   - Scroll down to "Upload presets"
   - Click "Add upload preset"
   - Set "Signing mode" to "Unsigned"
   - Name it (e.g., "ml_default")
5. Replace the values in the upload functions

#### Imgur

1. Go to [Imgur API](https://api.imgur.com/oauth2/addclient)
2. Sign up for a free account
3. Register a new application
   - Set "OAuth 2 authorization with callback URL" as the authorization type
   - Enter any URL for callback (e.g., https://example.com/callback)
4. Get your Client ID
5. Replace the client ID in the upload functions

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
