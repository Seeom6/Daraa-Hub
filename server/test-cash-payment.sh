#!/bin/bash

echo "=== 🧪 اختبار نظام الدفع النقدي المحسّن ==="
echo ""

# 1. Login as customer
echo "1️⃣ تسجيل دخول العميل..."
CUSTOMER_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+963991234571","password":"Admin@123456"}')

CUSTOMER_TOKEN=$(echo "$CUSTOMER_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
echo "✅ تم تسجيل الدخول"
echo ""

# 2. Login as store owner
echo "2️⃣ تسجيل دخول صاحب المتجر..."
STORE_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+963991234569","password":"Admin@123456"}')

STORE_TOKEN=$(echo "$STORE_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
echo "✅ تم تسجيل الدخول"
echo ""

# 3. Add product to cart
echo "3️⃣ إضافة منتج للسلة..."
curl -s -X POST http://localhost:3001/api/cart/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -d '{"productId":"6910b5f700b1f60f67a06a0b","quantity":1}' > /dev/null
echo "✅ تمت إضافة المنتج"
echo ""

# 4. Create order
echo "4️⃣ إنشاء طلب جديد..."
ORDER_RESPONSE=$(curl -s -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -d '{
    "storeId":"6910b586b20da9155889b03f",
    "deliveryAddress":{
      "fullName":"Test User",
      "phoneNumber":"+963991234571",
      "fullAddress":"Test Address",
      "city":"Daraa",
      "district":"Daraa",
      "location":{"type":"Point","coordinates":[36.1048,32.6189]}
    },
    "paymentMethod":"cash",
    "customerNotes":"Test Cash Payment Flow"
  }')

ORDER_ID=$(echo "$ORDER_RESPONSE" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
ORDER_NUMBER=$(echo "$ORDER_RESPONSE" | grep -o '"orderNumber":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "✅ تم إنشاء الطلب: $ORDER_NUMBER"
echo "   Order ID: $ORDER_ID"
echo ""

# 5. Wait for order notifications
echo "5️⃣ الانتظار لمعالجة إشعارات الطلب..."
sleep 3
echo ""

# 6. Process payment
echo "6️⃣ معالجة الدفع (cash - يبقى PROCESSING)..."
PAYMENT_RESPONSE=$(curl -s -X POST http://localhost:3001/api/payments/process \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -d "{\"orderId\":\"$ORDER_ID\",\"paymentMethod\":\"cash\"}")

PAYMENT_ID=$(echo "$PAYMENT_RESPONSE" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
PAYMENT_STATUS=$(echo "$PAYMENT_RESPONSE" | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "✅ تمت معالجة الدفع"
echo "   Payment ID: $PAYMENT_ID"
echo "   Status: $PAYMENT_STATUS"
echo ""

# 7. Wait for payment processing notifications
echo "7️⃣ الانتظار لمعالجة إشعارات الدفع..."
sleep 3
echo ""

# 8. Update order status to DELIVERED
echo "8️⃣ تحديث حالة الطلب إلى DELIVERED..."
curl -s -X PUT http://localhost:3001/api/orders/$ORDER_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STORE_TOKEN" \
  -d '{"status":"delivered","notes":"تم التوصيل واستلام الدفع النقدي"}' > /dev/null
echo "✅ تم تحديث حالة الطلب"
echo ""

# 9. Wait for payment completion notifications
echo "9️⃣ الانتظار لمعالجة إشعارات تأكيد الدفع..."
sleep 3
echo ""

# 10. Check results
echo "🔍 التحقق من النتائج..."
echo ""
echo "=== الإشعارات للطلب $ORDER_NUMBER ==="
docker exec daraa-mongodb mongosh daraa-auth --quiet --eval "
var notifications = db.notifications.find({'data.orderId': '$ORDER_ID'}).sort({createdAt: 1});
var count = 0;
notifications.forEach(function(n) {
  count++;
  print(count + '. ' + n.type + ' - ' + n.recipientRole + ' - ' + n.title);
});
print('');
print('📊 إجمالي الإشعارات: ' + count + ' (المتوقع: 6)');
"

echo ""
echo "=== حالة الدفع النهائية ==="
docker exec daraa-mongodb mongosh daraa-auth --quiet --eval "
var payment = db.payments.findOne({_id: ObjectId('$PAYMENT_ID')});
if (payment) {
  print('Payment ID: ' + payment._id);
  print('Status: ' + payment.status);
  print('Paid At: ' + payment.paidAt);
  print('Notes: ' + (payment.notes || 'N/A'));
} else {
  print('❌ لم يتم العثور على الدفع');
}
"

echo ""
echo "✅ اكتمل الاختبار!"

