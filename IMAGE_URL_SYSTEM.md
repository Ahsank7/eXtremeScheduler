# Generic Image URL System

This system provides a flexible and future-proof way to handle image URLs across different storage providers (local, AWS S3, Azure Blob Storage, Google Cloud Storage, etc.).

## Features

- **Multi-storage support**: Local, AWS S3, Azure Blob Storage, Google Cloud Storage
- **Automatic URL detection**: Handles both relative paths and complete URLs
- **CDN support**: Optional CDN integration with optimization parameters
- **Thumbnail generation**: Easy thumbnail URL generation
- **React hooks**: Convenient React hooks for easy integration

## Usage

### 1. Direct Service Usage

```jsx
import imageUrlService from 'core/services/imageUrlService';

// Basic usage
const imageUrl = imageUrlService.buildImageUrl('/uploads/logo.png');

// With specific storage type
const s3Url = imageUrlService.buildImageUrl('images/logo.png', 's3');

// Thumbnail generation
const thumbnailUrl = imageUrlService.getThumbnailUrl('/uploads/logo.png', 150);

// Optimized image with parameters
const optimizedUrl = imageUrlService.getOptimizedImageUrl('/uploads/logo.png', {
  width: 300,
  height: 200,
  quality: 85,
  format: 'webp'
});
```

### 2. React Hooks Usage

```jsx
import { useImageUrl, useThumbnailUrl, useOptimizedImageUrl } from 'core/hooks/useImageUrl';

function MyComponent() {
  // Basic image URL
  const imageUrl = useImageUrl('/uploads/logo.png');
  
  // Thumbnail
  const thumbnailUrl = useThumbnailUrl('/uploads/logo.png', 100);
  
  // Optimized image
  const optimizedUrl = useOptimizedImageUrl('/uploads/logo.png', {
    width: 300,
    height: 200,
    quality: 85
  });

  return (
    <img src={imageUrl} alt="Logo" />
  );
}
```

### 3. Avatar Component Usage

```jsx
import imageUrlService from 'core/services/imageUrlService';

<Avatar
  src={imageUrlService.buildImageUrl(user.profileImagePath)}
  radius="xl"
/>
```

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Storage type: 'local', 's3', 'azure', 'gcp'
REACT_APP_STORAGE_TYPE=local

# Base URL for local storage
REACT_APP_STORAGE_BASE_URL=http://localhost:5000

# CDN URL (optional)
REACT_APP_CDN_URL=https://cdn.yourdomain.com

# AWS S3 Configuration
REACT_APP_S3_BUCKET_NAME=your-bucket-name
REACT_APP_S3_REGION=us-east-1

# Azure Blob Storage Configuration
REACT_APP_AZURE_ACCOUNT_NAME=your-account-name
REACT_APP_AZURE_CONTAINER_NAME=your-container-name

# Google Cloud Storage Configuration
REACT_APP_GCP_BUCKET_NAME=your-bucket-name
```

### Storage Types

#### Local Storage (Default)
- Uses your backend server as the base URL
- Images stored in local file system
- URL format: `{baseUrl}/{imagePath}`

#### AWS S3
- Images stored in S3 bucket
- URL format: `https://{bucket}.s3.{region}.amazonaws.com/{key}`
- Requires: `REACT_APP_S3_BUCKET_NAME`, `REACT_APP_S3_REGION`

#### Azure Blob Storage
- Images stored in Azure Blob container
- URL format: `https://{account}.blob.core.windows.net/{container}/{path}`
- Requires: `REACT_APP_AZURE_ACCOUNT_NAME`, `REACT_APP_AZURE_CONTAINER_NAME`

#### Google Cloud Storage
- Images stored in GCS bucket
- URL format: `https://storage.googleapis.com/{bucket}/{path}`
- Requires: `REACT_APP_GCP_BUCKET_NAME`

## Migration Guide

### From Hardcoded URLs

**Before:**
```jsx
const backendBaseUrl = enviroment.baseURL.replace(/\/api\/?$/, "");
<Avatar src={backendBaseUrl + user.profileImagePath} />
```

**After:**
```jsx
import imageUrlService from 'core/services/imageUrlService';
<Avatar src={imageUrlService.buildImageUrl(user.profileImagePath)} />
```

### From React Hooks

**Before:**
```jsx
const imageUrl = user.profileImagePath ? backendBaseUrl + user.profileImagePath : undefined;
```

**After:**
```jsx
const imageUrl = useImageUrl(user.profileImagePath);
```

## Benefits

1. **Future-proof**: Easy to switch between storage providers
2. **Consistent**: Same API regardless of storage type
3. **Optimized**: Built-in support for thumbnails and optimization
4. **Flexible**: Supports both relative paths and complete URLs
5. **Maintainable**: Centralized image URL logic

## Examples

### Organization Logo
```jsx
// BasicSetting.jsx
<Avatar
  src={imageUrlService.buildImageUrl(logoUrl)}
  size={120}
  radius={120}
  alt="Organization Logo"
/>
```

### User Profile Picture
```jsx
// AppHeader.jsx
<Avatar
  src={imageUrlService.buildImageUrl(userInfo?.ProfileImagePath)}
  radius="xl"
/>
```

### Thumbnail in List
```jsx
// UserList.jsx
const thumbnailUrl = useThumbnailUrl(user.profileImage, 50);
<img src={thumbnailUrl} alt="User thumbnail" />
```

### Optimized Image for Gallery
```jsx
// Gallery.jsx
const optimizedUrl = useOptimizedImageUrl(image.path, {
  width: 800,
  height: 600,
  quality: 90,
  format: 'webp'
});
<img src={optimizedUrl} alt="Gallery image" />
``` 