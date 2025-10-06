# Standalone Service Provider Attendance Portal

## Direct Access URL

The standalone attendance portal can be accessed directly at:

```
https://your-domain.com/attendance
```

## Authentication

### For Service Providers
1. **Direct URL Access**: Navigate to `/attendance`
2. **Login**: Enter your service provider credentials
3. **Access Control**: Only users with UserType = 2 (Service Providers) can access
4. **Session Management**: Login persists until logout or session expires

### Authentication Flow
- **Login Form**: Username and password required
- **Token Storage**: JWT token stored in localStorage
- **Role Validation**: Automatically checks if user is a Service Provider
- **Session Persistence**: Remembers login across browser sessions

## Features

### 🔐 **Security Features**
- **Role-based Access**: Only Service Providers can access
- **Token Authentication**: Secure JWT-based authentication
- **Session Management**: Automatic logout on token expiry
- **Access Validation**: Real-time user type verification

### 📱 **User Experience**
- **Standalone Interface**: No need to navigate through main application
- **Mobile Optimized**: Responsive design for all devices
- **Quick Access**: Direct URL bookmarking supported
- **Logout Option**: Easy logout functionality

### 🎯 **Core Functionality**
- **Daily Task Display**: Shows today's scheduled tasks
- **Check-in/Check-out**: Full attendance management
- **Real-time Updates**: Automatic task status updates
- **Error Handling**: Comprehensive error management

## Usage Scenarios

### 1. **Direct Bookmark Access**
```
https://your-domain.com/attendance
```
- Service providers can bookmark this URL
- Direct access without navigating through main app
- Perfect for mobile devices and quick access

### 2. **QR Code Integration**
- Generate QR codes pointing to `/attendance`
- Service providers can scan and access directly
- Useful for field workers and mobile access

### 3. **Mobile App Alternative**
- Lightweight web interface
- No app installation required
- Works on any device with a browser

## Technical Implementation

### **Authentication Process**
1. User visits `/attendance`
2. Login form displayed if not authenticated
3. Credentials validated against existing auth system
4. JWT token stored and user type verified
5. Access granted only for Service Providers (UserType = 2)

### **Session Management**
- **Token Storage**: localStorage for persistence
- **Auto-logout**: On token expiry or invalid session
- **Session Validation**: Real-time authentication checks
- **Secure Logout**: Complete session cleanup

### **API Integration**
- Uses existing authentication service
- Connects to same backend APIs
- Maintains data consistency with main application
- Same security and validation rules

## Deployment Considerations

### **URL Configuration**
- Ensure `/attendance` route is properly configured
- Consider SSL/HTTPS for production
- Set up proper CORS if needed

### **Security Measures**
- Validate user type on every request
- Implement rate limiting for login attempts
- Monitor access logs for security
- Regular token validation

### **Performance**
- Optimized for mobile devices
- Minimal resource requirements
- Fast loading and responsive design
- Efficient API calls and caching

## Access Methods

### **Method 1: Direct URL**
```
https://your-domain.com/attendance
```

### **Method 2: QR Code**
Generate QR code with attendance URL for easy mobile access

### **Method 3: Bookmark**
Service providers can bookmark the URL for quick access

### **Method 4: Email Link**
Send attendance portal link via email to service providers

## Benefits

### **For Service Providers**
- ✅ Quick and easy access
- ✅ No complex navigation
- ✅ Mobile-friendly interface
- ✅ Direct task management

### **For Administrators**
- ✅ Reduced support requests
- ✅ Better attendance tracking
- ✅ Improved user experience
- ✅ Centralized access control

### **For System**
- ✅ Reduced server load
- ✅ Better security
- ✅ Improved scalability
- ✅ Enhanced user satisfaction

## Troubleshooting

### **Common Issues**
1. **Access Denied**: Ensure user is Service Provider (UserType = 2)
2. **Login Failed**: Check credentials and user status
3. **No Tasks**: Verify franchise assignment and task scheduling
4. **Session Expired**: Re-login required

### **Support**
- Check user type in admin panel
- Verify franchise assignment
- Confirm task scheduling
- Review authentication logs
