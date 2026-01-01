# Vendor Feature

## Overview
This feature allows customers to apply to become store owners (vendors) on the Daraa platform.

## Structure

```
vendor/
├── hooks/
│   ├── useBecomeVendor.ts      # Form state and submission logic
│   ├── useStoreCategories.ts   # Fetch store categories
│   └── index.ts
├── presentation/
│   └── pages/
│       ├── BecomeVendorPage.tsx # Main vendor application page
│       └── index.ts
├── services/
│   ├── vendor.service.ts       # API calls
│   └── index.ts
├── types/
│   ├── vendor.types.ts         # TypeScript types
│   └── index.ts
└── README.md
```

## Features

### Multi-Step Form
1. **Step 1: Store Information**
   - Store name
   - Store description
   - Primary category
   - Additional categories (optional)

2. **Step 2: Business Information**
   - Business license number
   - Tax ID
   - National ID
   - Business address
   - Business phone

3. **Step 3: Review & Submit**
   - Review all information
   - Commission notice (10%)
   - Terms and conditions agreement

### Validation
- Client-side validation for all fields
- Step-by-step validation
- Error messages in Arabic

### API Integration
- Fetches store categories from `/store-categories`
- Submits application to `/verification/submit`
- Uses JWT authentication (HTTP-only cookies)

## Usage

### Accessing the Page
1. User must be logged in as a customer
2. Navigate to profile page
3. Click "إضافة متجري" button
4. Redirected to `/become-vendor`

### After Submission
- User receives success message
- Redirected to profile page with verification tab
- Application status: `pending`
- Admin reviews and approves/rejects

## API Endpoints

### Get Store Categories
```
GET /store-categories
Response: { success: true, data: StoreCategory[], count: number }
```

### Submit Vendor Application
```
POST /verification/submit
Body: BecomeVendorRequest
Response: { success: true, message: string, data: { verificationRequestId, status } }
```

## Types

### BecomeVendorFormData
```typescript
{
  storeName: string;
  storeDescription: string;
  primaryCategory: string;
  storeCategories: string[];
  businessLicense: string;
  taxId: string;
  nationalId: string;
  businessAddress: string;
  businessPhone: string;
  agreeToTerms: boolean;
}
```

### BecomeVendorRequest
```typescript
{
  applicantType: 'store_owner';
  personalInfo: {
    fullName: string;
    nationalId: string;
    address: string;
    city: string;
  };
  businessInfo: {
    businessName: string;
    businessType: string;
    businessAddress: string;
    businessPhone: string;
    taxId: string;
    commercialRegister: string;
  };
  storeInfo: {
    storeName: string;
    storeDescription: string;
    primaryCategory: string;
    storeCategories: string[];
  };
}
```

## Design
- RTL support
- Dark mode support
- Glassmorphism effects
- Animated transitions
- Responsive design
- Progress indicator

## Dependencies
- React Query (data fetching)
- React Hook Form (form management)
- Framer Motion (animations)
- Lucide React (icons)
- React Hot Toast (notifications)

