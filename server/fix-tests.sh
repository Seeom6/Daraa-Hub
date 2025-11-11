#!/bin/bash

# Fix all phase test files to use correct response format

cd test

# Fix customer profileId to userId (customers don't have profileId)
sed -i 's/customerMeResponse\.body\.data\.profileId/customerMeResponse.body.data.userId/g' phase*.e2e-spec.ts
sed -i 's/customerProfileRes\.body\.data\.profileId/customerProfileRes.body.data.userId/g' phase*.e2e-spec.ts

# Fix condition checks for customer
sed -i 's/customerMeResponse\.body\.user && customerMeResponse\.body\.data\.userId/customerMeResponse.body.data \&\& customerMeResponse.body.data.userId/g' phase*.e2e-spec.ts
sed -i 's/customerMeResponse\.body\.user && customerMeResponse\.body\.data\.profileId/customerMeResponse.body.data \&\& customerMeResponse.body.data.userId/g' phase*.e2e-spec.ts

# Fix condition checks for store owner
sed -i 's/storeOwnerMeResponse\.body\.user && storeOwnerMeResponse\.body\.data\.profileId/storeOwnerMeResponse.body.data \&\& storeOwnerMeResponse.body.data.profileId/g' phase*.e2e-spec.ts
sed -i 's/storeMeResponse\.body\.user && storeMeResponse\.body\.data\.profileId/storeMeResponse.body.data \&\& storeMeResponse.body.data.profileId/g' phase*.e2e-spec.ts
sed -i 's/storeOwnerProfileRes\.body\.user && storeOwnerProfileRes\.body\.data\.profileId/storeOwnerProfileRes.body.data \&\& storeOwnerProfileRes.body.data.profileId/g' phase*.e2e-spec.ts

# Fix condition checks for courier
sed -i 's/courierMeResponse\.body\.user && courierMeResponse\.body\.data\.profileId/courierMeResponse.body.data \&\& courierMeResponse.body.data.profileId/g' phase*.e2e-spec.ts

# Fix error messages
sed -i 's/Failed to get customer profileId/Failed to get customer userId/g' phase*.e2e-spec.ts

echo "Done fixing test files"

