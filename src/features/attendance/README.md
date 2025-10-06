# Service Provider Attendance Portal

## Overview
The Service Provider Attendance Portal is a responsive web application designed for service providers to manage their daily tasks and attendance. It provides an intuitive interface for checking in and out of tasks, viewing task details, and tracking work progress.

## Features

### 🎯 Core Functionality
- **Daily Task Display**: Shows all tasks scheduled for the current day
- **Check-in/Check-out System**: Allows service providers to mark their attendance for tasks
- **Task Status Management**: Automatically updates task status based on attendance actions
- **Responsive Design**: Optimized for mobile and desktop devices

### 📱 User Interface
- **Card-based Layout**: Tasks are displayed in an easy-to-scan card format
- **Status Indicators**: Color-coded badges show task status (Scheduled, In-Progress, Completed, etc.)
- **Interactive Elements**: Click-to-action buttons for check-in/check-out operations
- **Real-time Updates**: Automatic refresh of task data after actions

### 🔧 Technical Features
- **Authentication Integration**: Uses existing authentication system
- **API Integration**: Connects with existing planboard services
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Loading States**: Visual feedback during API operations

## Usage

### For Service Providers
1. **Login**: Access the portal through the franchise navigation menu
2. **View Tasks**: See all tasks scheduled for today
3. **Check In**: Click on a scheduled task to check in
4. **Check Out**: Click on an in-progress task to check out
5. **View Details**: Access task information including client details and timing

### Task States
- **Scheduled**: Task is ready for check-in
- **In-Progress**: Service provider has checked in
- **Completed**: Service provider has checked out
- **Cancelled**: Task has been cancelled

## Technical Implementation

### Components
- `ServiceProviderAttendance.jsx`: Main attendance portal component
- Responsive grid layout for task cards
- Modal dialogs for check-in/check-out actions
- Real-time data fetching and updates

### API Integration
- Uses existing `planboardService` for task management
- Integrates with `UpdateTaskAttendance` and `AddTaskAttendance` endpoints
- Fetches tasks filtered by service provider and current date

### Routing
- Accessible via `/franchises/{franchiseName}/attendance`
- Integrated into franchise navigation menu
- Only visible to service providers (userType === 2)

## Responsive Design

### Mobile Optimization
- Touch-friendly interface
- Optimized card layouts for small screens
- Swipe-friendly navigation
- Readable typography and spacing

### Desktop Features
- Multi-column grid layout
- Hover effects and interactions
- Keyboard navigation support
- Large screen optimizations

## Security & Access Control
- Role-based access (Service Providers only)
- Authentication required
- Franchise-specific data isolation
- Secure API communication

## Future Enhancements
- Push notifications for task reminders
- Offline capability
- Advanced reporting features
- Integration with calendar systems
- Photo capture for task completion
