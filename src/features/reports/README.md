# Reports Feature

A comprehensive reporting system for the eXtremeScheduler application with support for multiple report types, A4-sized layouts, and PDF download capabilities.

## Overview

The Reports feature provides a flexible foundation for generating and managing various types of reports within the application. It includes:

- **Report Selection Interface**: User-friendly card-based selection of different report types
- **A4-Sized Layout**: All reports are formatted for A4 paper size (210mm x 297mm)
- **PDF Download**: One-click download functionality with print dialog
- **Multiple Report Types**: Billing, Payroll, Task Summary, and more
- **Extensible Architecture**: Easy to add new report types

## Features

### Current Report Types

1. **Billing Invoice Report**
   - Comprehensive billing reports for clients
   - Detailed invoice breakdown
   - Paid/Unpaid status tracking
   - Financial summary with totals

2. **Payroll Report**
   - Detailed payroll reports for service providers
   - Wage breakdowns and payment status
   - Service provider statistics
   - Financial summary

3. **Task Summary Report**
   - Overview of tasks (completed, pending, cancelled)
   - Task status distribution
   - Total hours calculation
   - Detailed task listings

### Coming Soon
- Attendance Report
- Client Summary Report
- Monthly Summary Report

## Architecture

### File Structure

```
reports/
├── pages/
│   └── Reports.jsx          # Main reports page with report selection
├── components/
│   ├── ReportLayout.jsx     # A4 layout wrapper for all reports
│   ├── BillingReport.jsx    # Billing invoice report component
│   ├── PayrollReport.jsx    # Payroll report component
│   └── TaskSummaryReport.jsx # Task summary report component
├── index.js                  # Exports
└── README.md                 # This file
```

### Components

#### Reports (Main Page)
- `Location`: `pages/Reports.jsx`
- `Purpose`: Report selection interface
- `Features`:
  - Card-based report type selection
  - Visual categorization with badges
  - Coming soon indicators
  - Seamless navigation to report components

#### ReportLayout
- `Location`: `components/ReportLayout.jsx`
- `Purpose`: Standardized A4-sized layout wrapper
- `Features`:
  - A4 paper size (210mm x 297mm)
  - Professional styling with CSS
  - Download as PDF functionality
  - Print-optimized layout
  - Customizable header information
  - Print instructions

#### Individual Reports
Each report component includes:
- Filter interface (date range, user selection, etc.)
- Data fetching from APIs
- Summary statistics with visual cards
- Detailed data tables
- Financial summaries (where applicable)

## Usage

### Accessing Reports

1. Navigate to the Reports section from the sidebar menu
2. Select a report type from the available options
3. Configure filters (date range, specific users, etc.)
4. Click "Generate" to create the report
5. Click "Download as PDF" to save the report

### Adding a New Report Type

To add a new report type, follow these steps:

1. **Create the Report Component**

```jsx
// components/YourNewReport.jsx
import React, { useState } from 'react';
import ReportLayout from './ReportLayout';
// ... other imports

export default function YourNewReport({ config }) {
  // Your report logic here
  
  return (
    <ReportLayout
      title="Your Report Title"
      reportType="your-report-type"
      headerInfo={{
        'Report Period': 'Jan 2024',
        'Generated On': 'Today',
        // ... other header info
      }}
    >
      {/* Your report content */}
    </ReportLayout>
  );
}
```

2. **Add to Report Types**

Update `pages/Reports.jsx`:

```jsx
import YourNewReport from '../components/YourNewReport';

const reportTypes = [
  // ... existing reports
  {
    id: 'your-report',
    title: 'Your Report Title',
    description: 'Description of your report',
    icon: IconYourIcon,
    color: 'blue',
    badge: 'Category',
    component: YourNewReport
  }
];
```

3. **Export the Component**

Update `index.js`:

```jsx
export { default as YourNewReport } from './components/YourNewReport';
```

## Styling Guidelines

### A4 Layout Specifications

- **Width**: 210mm
- **Height**: 297mm (minimum)
- **Padding**: 20mm on all sides
- **Print Margins**: Default or Minimum for best results

### Color Schemes

Reports use gradient color schemes for visual appeal:
- Blue/Purple: General reports, invoices
- Green: Financial, payroll
- Orange/Yellow: Operations, tasks
- Pink/Red: Analytics, summaries

### Typography

- **Report Title**: 28px, bold
- **Section Titles**: 20px, semi-bold
- **Body Text**: 14px, regular
- **Table Headers**: 12px, uppercase, semi-bold

## API Integration

Reports fetch data from various services:

```jsx
import { 
  localStoreService, 
  profileService, 
  organizationService,
  scheduleService 
} from 'core/services';
```

### Common Patterns

1. **Fetching Currency Sign**:
```jsx
const sign = await organizationService.getCurrencySign(organizationId);
```

2. **Getting Franchise ID**:
```jsx
const franchise = localStoreService.getFranchiseID();
```

3. **Date Formatting**:
```jsx
Moment(date).format('MMM DD, YYYY')
```

## Best Practices

1. **Always use ReportLayout**: Ensures consistent A4 formatting
2. **Include Summary Statistics**: Visual cards at the top of reports
3. **Provide Filters**: Allow users to customize report data
4. **Handle Empty States**: Show meaningful messages when no data
5. **Loading States**: Use LoadingOverlay during data fetching
6. **Error Handling**: Gracefully handle API errors
7. **Responsive Tables**: Ensure tables fit within A4 width

## Dependencies

- **@mantine/core**: UI components
- **@mantine/dates**: Date picker components
- **@tabler/icons**: Icon library
- **moment**: Date formatting
- **react**: Framework

## Permissions

Reports are controlled by the permission system:
- Menu ID: `reports`
- Add menu permissions in the role management system

## Testing

When testing reports:
1. Test with various date ranges
2. Test with empty data sets
3. Test PDF download in different browsers
4. Verify A4 sizing in print preview
5. Test with different user types/permissions

## Support

For issues or questions:
- Check component logs in browser console
- Verify API responses
- Ensure proper permissions are set
- Review this documentation

## Future Enhancements

- Export to Excel functionality
- Email report functionality
- Scheduled report generation
- Report templates
- Custom report builder
- Chart visualizations
- Multi-page reports
- Report history

