# Enhanced Service Provider Selection - Feature Guide

## Overview
This guide describes the enhanced service provider selection functionality for scheduling appointments. The new system provides advanced search, filtering, and conflict detection capabilities.

## Features

### 1. **Advanced Service Provider Selection Modal**
Instead of a simple dropdown, clicking on the service provider field now opens a comprehensive modal with:

- **Search functionality**: Search by name, email, or user number
- **Availability filtering**: Filter providers by their status (Available, Busy, On Leave)
- **Visual status indicators**: Color-coded badges showing provider availability
- **Detailed information**: View provider details including scheduled tasks and leave dates
- **Multi-select support**: Select multiple providers at once
- **Pagination**: Browse through large lists of providers efficiently

### 2. **Real-time Availability Checking**
The system automatically checks provider availability based on:

- **Selected date/time range**: Only shows providers relevant to the appointment time
- **Existing tasks**: Identifies providers already scheduled during the time slot
- **Leave schedules**: Detects providers on approved leave
- **Availability schedules**: Verifies providers are available during requested hours

### 3. **Conflict Detection & Warnings**

#### In the Selection Modal:
- **Status badges** show each provider's availability:
  - 🟢 **Available**: Provider is free during the selected time
  - 🟠 **Busy**: Provider has existing tasks scheduled
  - 🔴 **On Leave**: Provider is on approved leave
  - ⚫ **Not Available**: Provider's schedule doesn't cover this time
  - ⚪ **No Schedule**: Provider hasn't set availability hours

- **Warning alerts** at the top of the modal highlight any selected providers with conflicts
- **Tooltips** provide additional details when hovering over status badges

#### Before Submission:
- **Pre-submission validation** checks all selected providers
- **Confirmation dialog** appears if any conflicts are detected, showing:
  - List of conflicting providers
  - Reason for each conflict (busy, on leave, etc.)
  - Number of scheduled tasks for busy providers
  - Leave date ranges for providers on leave
  - Option to proceed anyway or go back and change selection

## How to Use

### Selecting Service Providers:

1. **Fill in appointment details first**:
   - Service Type
   - Services
   - Start Date & Time
   - End Date & Time

2. **Click the "Select Service Providers" button**:
   - The button becomes enabled once date/time is set
   - Opens the Service Provider Selection modal

3. **Search and filter providers**:
   - Use the search box to find specific providers
   - Click filter buttons to show only available/busy/on leave providers
   - Browse through the paginated list

4. **Select providers**:
   - Click checkboxes or rows to select providers
   - Selected providers are highlighted in blue
   - Use "Select All" to choose all available providers on current page
   - Selected count shows at the bottom

5. **Review selections**:
   - Warning alerts show if any selected providers have conflicts
   - Review status badges and details
   - Clear selection if needed

6. **Confirm selection**:
   - Click "Confirm Selection" to apply choices
   - Selected providers appear as badges below the selection button
   - Color-coded badges indicate availability status

### Submitting the Appointment:

1. **Complete all required fields**

2. **Click Save**:
   - If all providers are available: Appointment is created immediately
   - If conflicts exist: Confirmation dialog appears

3. **Handle conflicts** (if any):
   - Review the list of conflicting providers
   - Decide whether to:
     - **Proceed Anyway**: Create appointment despite conflicts
     - **Go Back**: Return to form and change provider selection

## Technical Details

### Components Created:

1. **ServiceProviderSelector.jsx**
   - Location: `src/shared/components/user/ServiceProviderSelector.jsx`
   - Modal component for advanced provider selection
   - Features: Search, filtering, pagination, availability display

2. **Updated AddUpdateUserSchedule.jsx**
   - Integrated the new ServiceProviderSelector
   - Added conflict detection and confirmation logic
   - Enhanced UI with status badges

### API Endpoints Used:

- **`POST /api/ServiceProvider/WithAvailability`**
  - Returns service providers with availability status
  - Checks: Availability schedules, existing tasks, leave status
  - Request parameters:
    - `FranchiseId`: Current franchise
    - `StartDate`, `EndDate`: Date range
    - `StartTime`, `EndTime`: Time range
    - `SearchText`: Optional search filter

### Database Integration:

- **Stored Procedure**: `uspGetServiceProvidersWithAvailability`
  - Checks provider availability schedules
  - Identifies conflicting tasks in `tblServicesTask`
  - Checks leave records in `tblUserLeave`
  - Returns comprehensive availability status

## Benefits

1. **Better Scheduling**: See provider availability before assigning tasks
2. **Conflict Prevention**: Early warning system for scheduling conflicts
3. **Improved User Experience**: Visual, intuitive interface for selection
4. **Flexibility**: Option to override conflicts when necessary
5. **Efficiency**: Quick search and filter capabilities
6. **Transparency**: Clear visibility of why providers aren't available

## Future Enhancements (Potential)

- Filter by provider skills/certifications
- View provider calendar/schedule directly
- Suggest alternative time slots when conflicts exist
- Auto-assign to available providers based on workload
- Provider preference matching
- Bulk assignment operations

## Support

For issues or questions about this feature:
1. Check that date/time is set before opening provider selector
2. Ensure franchise context is properly loaded
3. Verify API endpoint is accessible
4. Check browser console for error messages

