# UI Response Handling Migration Guide

## Overview
The backend now returns consistent `Response<T>` objects, and the `httpService` automatically extracts the `data` property. UI components need to be updated to handle this new structure.

## Backend Response Format
```json
{
  "status": 200,
  "message": "Operation completed successfully",
  "data": { /* actual data */ },
  "isSuccess": true,
  "errors": [],
  "traceId": null,
  "exception": null,
  "stackTrace": null
}
```

## How httpService Works Now
- `httpService.get(url)` → Returns `data` property directly
- `httpService.post(url, data)` → Returns `data` property directly
- `httpService.put(url, data)` → Returns `data` property directly
- `httpService.remove(url)` → Returns `data` property directly

## Migration Patterns

### ❌ OLD Pattern (Don't Use)
```javascript
const response = await someService.getData();
if (response.isSuccess) {
  setData(response.data);
}
```

### ✅ NEW Pattern (Use This)
```javascript
const response = await someService.getData();
if (response) {
  setData(response);
}
```

### ❌ OLD Pattern (Don't Use)
```javascript
const response = await someService.getList();
setItems(response.data.result || []);
```

### ✅ NEW Pattern (Use This)
```javascript
const response = await someService.getList();
setItems(response || []);
```

## Files That Need Updates

Based on the search results, these files still have old response patterns:

1. `src/shared/components/user/AddUpdateUserSchedule.jsx` - 2 matches
2. `src/shared/components/user/ProfileDetail.jsx` - 2 matches
3. `src/core/hooks/usePaginatedServiceProviders.js` - 4 matches
4. `src/shared/components/user/Creadentials.jsx` - 4 matches
5. `src/core/components/layouts/OrganizationLayout.jsx` - 1 match
6. `src/features/organization/pages/OrganizationsDetail.jsx` - 1 match
7. `src/core/context/PermissionContext.jsx` - 2 matches
8. `src/features/loginHistory/pages/LoginHistory.jsx` - 2 matches
9. `src/shared/components/modal/TaskLogModal.jsx` - 2 matches
10. `src/shared/components/user/RoleManagement.jsx` - 1 match
11. `src/shared/components/user/CardInfo.jsx` - 2 matches
12. `src/shared/components/user/Document.jsx` - 3 matches
13. `src/features/organization/components/Lookup.jsx` - 1 match
14. `src/features/organization/pages/Organizations.jsx` - 1 match

## Search and Replace Patterns

### Pattern 1: Remove .isSuccess checks
```bash
# Find
if (response.isSuccess) {
  setData(response.data);
}

# Replace with
if (response) {
  setData(response);
}
```

### Pattern 2: Remove .data access
```bash
# Find
response.data.property
# Replace with
response.property
```

### Pattern 3: Remove .data.result access
```bash
# Find
response.data.result
# Replace with
response
```

### Pattern 4: Remove .data.response access
```bash
# Find
response.data.response
# Replace with
response
```

## Testing Checklist

After updating each component:

1. ✅ Check if the component loads without errors
2. ✅ Verify data is displayed correctly
3. ✅ Test error handling (try with invalid data)
4. ✅ Check console for any remaining errors
5. ✅ Verify notifications work properly

## Common Issues and Solutions

### Issue: "Cannot read property 'property' of undefined"
**Solution**: Add null checks before accessing properties
```javascript
if (response && response.property) {
  // Use response.property
}
```

### Issue: "Cannot read property 'map' of undefined"
**Solution**: Ensure the response is an array before mapping
```javascript
if (response && Array.isArray(response)) {
  setItems(response.map(item => ({ ... })));
}
```

### Issue: Notifications not showing
**Solution**: Use the notification handlers from `core/services`
```javascript
import { showSuccessNotification, showErrorNotification } from 'core/services';

// Instead of
notifications.show({ title: 'Success', message: 'Data saved' });

// Use
showSuccessNotification('Data saved');
```

## Verification Commands

To find remaining old patterns:
```bash
# Find .isSuccess usage
grep -r "response\.isSuccess" src/

# Find .data. usage
grep -r "response\.data\." src/

# Find .result usage
grep -r "response\.result" src/
```

## Summary

The key changes are:
1. Remove `response.isSuccess` checks
2. Remove `response.data.` access patterns
3. Remove `response.data.result` and `response.data.response` patterns
4. Use the data directly from the response
5. Add proper null/undefined checks
6. Use the notification handlers from `core/services`

This ensures all UI components work correctly with the new consistent backend response format.
