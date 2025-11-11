#!/bin/bash

echo "==================================="
echo "��� Phase 2: Order Management System Testing"
echo "==================================="
echo ""

# 1. Login as Customer
echo "1️⃣ تسجيل دخول Customer..."
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+963991234571","password":"Admin@123456"}' \
  -c customer_cookies.txt -s > /dev/null

echo "✅ تم تسجيل الدخول"
echo ""

# 2. Login as Store Owner
echo "2️⃣ تسجيل دخول Store Owner..."
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+963991234569","password":"StoreOwner@123"}' \
  -c store_cookies.txt -s > /dev/null

echo "✅ تم تسجيل الدخول"
echo ""

# 3. Get Store ID
echo "3️⃣ الحصول على Store ID..."
STORE_ID=$(curl -X GET http://localhost:3001/api/auth/me -b store_cookies.txt -s | grep -o '"storeId":"[^"]*"' | cut -d'"' -f4)
echo "Store ID: $STORE_ID"
echo ""

# 4. Get Products
echo "4️⃣ الحصول على المنتجات..."
PRODUCT_ID=$(curl -X GET "http://localhost:3001/api/products?storeId=$STORE_ID&limit=1" -s | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Product ID: $PRODUCT_ID"
echo ""

# 5. Add to Cart
echo "5️⃣ إضافة منتج للسلة..."
curl -X POST http://localhost:3001/api/cart/items \
  -H "Content-Type: application/json" \
  -b customer_cookies.txt \
  -d "{\"productId\":\"$PRODUCT_ID\",\"quantity\":2}" \
  -s | head -20

echo ""
echo ""

# 6. View Cart
echo "6️⃣ عرض السلة..."
curl -X GET http://localhost:3001/api/cart \
  -b customer_cookies.txt \
  -s | head -30

echo ""
echo ""

# 7. Create Order
echo "7️⃣ إنشاء طلب..."
ORDER_RESPONSE=$(curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -b customer_cookies.txt \
  -d "{\"storeId\":\"$STORE_ID\",\"deliveryAddress\":{\"street\":\"شارع الثورة\",\"city\":\"درعا\",\"state\":\"درعا\",\"zipCode\":\"12345\",\"country\":\"سوريا\",\"coordinates\":{\"type\":\"Point\",\"coordinates\":[36.1048,32.6189]}},\"paymentMethod\":\"cash\",\"notes\":\"توصيل سريع\"}" \
  -s)

echo "$ORDER_RESPONSE" | head -40
ORDER_ID=$(echo "$ORDER_RESPONSE" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo ""
echo "Order ID: $ORDER_ID"
echo ""

# 8. View Order Details
echo "8️⃣ عرض تفاصيل الطلب..."
curl -X GET "http://localhost:3001/api/orders/$ORDER_ID" \
  -b customer_cookies.txt \
  -s | head -40

echo ""
echo ""

# 9. Store Owner Views Orders
echo "9️⃣ Store Owner يعرض طلباته..."
curl -X GET "http://localhost:3001/api/orders/store-orders" \
  -b store_cookies.txt \
  -s | head -40

echo ""
echo ""

# 10. Update Order Status
echo "��� تحديث حالة الطلب إلى confirmed..."
curl -X PUT "http://localhost:3001/api/orders/$ORDER_ID/status" \
  -H "Content-Type: application/json" \
  -b store_cookies.txt \
  -d '{"newStatus":"confirmed"}' \
  -s | head -30

echo ""
echo ""

# 11. Process Payment
echo "1️⃣1️⃣ معالجة الدفع..."
curl -X POST http://localhost:3001/api/payments/process \
  -H "Content-Type: application/json" \
  -b customer_cookies.txt \
  -d "{\"orderId\":\"$ORDER_ID\",\"paymentMethod\":\"cash\"}" \
  -s | head -30

echo ""
echo ""

# 12. Check Notifications
echo "1️⃣2️⃣ التحقق من الإشعارات (Customer)..."
curl -X GET http://localhost:3001/api/notifications/my \
  -b customer_cookies.txt \
  -s | head -40

echo ""
echo ""

echo "==================================="
echo "✅ اكتمل الاختبار!"
echo "==================================="
