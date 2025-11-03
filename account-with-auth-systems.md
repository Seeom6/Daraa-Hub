✅ التسجيل يتم بالاسم الكامل + رقم الهاتف
✅ التحقق يتم عبر OTP
✅ بعد التحقق ينتقل المستخدم إلى صفحة إنشاء كلمة مرور + (اختياري) البريد الإلكتروني
✅ يُنشأ الحساب كـ مستخدم عادي (Customer) مبدئيًا
✅ اختيار الدور (تاجر أو عامل توصيل) يتم لاحقًا من صفحة البروفايل

🧩 المرحلة 1 — تسجيل الدخول وإنشاء الحساب (Auth & Account Creation Flow)
1️⃣ التسجيل المبدئي (Register)
🔹 Endpoint

POST /auth/register

🔹 البيانات المطلوبة
{
  "fullName": "محمد السلامات",
  "phone": "+96550000000"
}

🔹 الخطوات المنطقية

يتحقق النظام من رقم الهاتف:

إذا موجود مسبقًا → يرجع خطأ: "الحساب موجود مسبقًا."

إذا جديد:

ينشئ سجل جديد في Account بدون كلمة مرور بعد.

ينشئ SecurityProfile للحماية.

يرسل OTP مكون من 6 أرقام إلى رقم الهاتف.

يخزن الكود في Redis لمدة 5 دقائق.

يرجع استجابة:

{ "message": "تم إرسال رمز التحقق إلى رقم هاتفك." }

🔹 سكيما التسجيل (Account)
@Schema({ timestamps: true })
export class Account {
  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true, unique: true, index: true })
  phone: string;

  @Prop()
  email?: string; // اختياري بعد التحقق

  @Prop()
  passwordHash?: string; // بعد مرحلة تعيين كلمة المرور

  @Prop({ default: "customer" })
  role: "customer" | "store_owner" | "courier" | "admin";

  @Prop({ default: false })
  isVerified: boolean; // بعد تأكيد OTP

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "SecurityProfile" })
  securityProfileId?: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, refPath: "roleProfileRef" })
  roleProfileId?: Types.ObjectId;

  @Prop()
  roleProfileRef?: "CustomerProfile" | "StoreOwnerProfile" | "CourierProfile" | "AdminProfile";
}

2️⃣ التحقق من OTP (Verify OTP)
🔹 Endpoint

POST /auth/verify-otp

🔹 البيانات المطلوبة
{
  "phone": "+96550000000",
  "otp": "123456"
}

🔹 الخطوات

يتحقق من Redis إذا الكود صحيح.

إذا صحيح:

يحدّث SecurityProfile.phoneVerified = true.

يحدّث Account.isVerified = true.

ينشئ CustomerProfile افتراضيًا.

يصدر رمز وصول مؤقت (Temporary Token) يسمح له بالدخول إلى صفحة تعيين كلمة المرور.

يعيد استجابة:

{ "message": "تم التحقق من رقم الهاتف بنجاح.", "next": "/auth/set-password" }

🔹 سكيما الأمان (SecurityProfile)
@Schema({ timestamps: true })
export class SecurityProfile {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Account", unique: true })
  accountId: Types.ObjectId;

  @Prop({ default: false }) phoneVerified: boolean;
  @Prop({ default: false }) idVerified: boolean;
  @Prop({ default: false }) twoFactorEnabled: boolean;

  @Prop()
  lastOtpCode?: string;

  @Prop({ type: Number, default: 0 }) failedAttempts: number;

  @Prop({ type: [{ ip: String, device: String, timestamp: Date, success: Boolean }], default: [] })
  loginHistory: { ip: string; device: string; timestamp: Date; success: boolean }[];
}

3️⃣ إنشاء كلمة المرور والبريد الإلكتروني (Set Password)
🔹 Endpoint

POST /auth/set-password

🔹 البيانات المطلوبة
{
  "password": "StrongPass123!",
  "confirmPassword": "StrongPass123!",
  "email": "user@example.com" // اختياري
}

🔹 الخطوات

يتحقق من التوكن المؤقت المرسل بعد التحقق من OTP.

يتأكد من تطابق كلمة المرور والتأكيد.

يشفر كلمة المرور باستخدام bcrypt أو argon2.

يحفظ passwordHash في Account.

يحفظ البريد الإلكتروني (اختياري).

يصدر JWT حقيقية (Access + Refresh Tokens).

يعيد الاستجابة النهائية:

{ "message": "تم إنشاء الحساب بنجاح.", "role": "customer", "dashboard": "/account/dashboard" }

🔹 نموذج الـ Password Hash
import * as bcrypt from "bcrypt";

const salt = await bcrypt.genSalt(12);
const hash = await bcrypt.hash(password, salt);
await this.accountModel.updateOne({ phone }, { passwordHash: hash, email });

4️⃣ إنشاء الملف الشخصي الافتراضي (CustomerProfile)

يتم إنشاؤه تلقائيًا بعد التحقق من OTP.

@Schema({ timestamps: true })
export class CustomerProfile {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Account", unique: true })
  accountId: Types.ObjectId;

  @Prop({ default: 0 })
  loyaltyPoints: number;

  @Prop({ default: "bronze" })
  tier: "bronze" | "silver" | "gold" | "platinum";

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: "Address", default: [] })
  addresses: Types.ObjectId[];
}

5️⃣ تسجيل الدخول لاحقًا (Login)
🔹 Endpoint

POST /auth/login

🔹 البيانات المطلوبة
{
  "phone": "+96550000000",
  "password": "StrongPass123!"
}

🔹 الخطوات

يبحث عن Account حسب رقم الهاتف.

يتحقق من كلمة المرور باستخدام bcrypt.compare().

إذا صحيحة:

يصدر JWT جديد (Access + Refresh).

يحدّث سجل الدخول في SecurityProfile.loginHistory.

يعيد:

{
  "accessToken": "...",
  "refreshToken": "...",
  "role": "customer"
}

6️⃣ اختيار الدور لاحقًا (من صفحة البروفايل)

المستخدم يدخل إلى /account/profile ويجد خيار:

“هل تريد تحويل حسابك إلى تاجر أو مندوب توصيل؟”

عند الاختيار، النظام ينفذ:
POST /account/upgrade-role
وينشئ بروفايل جديد حسب الدور (StoreOwnerProfile أو CourierProfile) ويربطه بالحساب.

🔗 العلاقات بين الجداول
Account (1) ─── (1) SecurityProfile
Account (1) ─── (1) CustomerProfile (افتراضي)
Account (1) ─── (many) Addresses
Account (1) ─── (many) Orders

⚙️ تدفق العمل الكامل (Workflow Summary)
المرحلة	الإجراء	النتائج
1️⃣	المستخدم يدخل الاسم الكامل + الهاتف	إنشاء Account + SecurityProfile + إرسال OTP
2️⃣	إدخال OTP	تحديث phoneVerified + إنشاء CustomerProfile
3️⃣	تعيين كلمة المرور (والبريد)	تحديث Account.passwordHash + email
4️⃣	تسجيل دخول	JWT Tokens + دخول إلى /account/dashboard
5️⃣	تعديل الدور من البروفايل	إنشاء StoreOwnerProfile أو CourierProfile
🧠 ملاحظات أمان مهمة

تشفير جميع كلمات المرور بـ bcrypt (rounds ≥ 12).

عدم إرسال OTP في الاستجابة أبدًا.

منع تكرار OTP لأكثر من 3 محاولات (Rate Limit في Redis).

بعد 5 محاولات فاشلة → قفل مؤقت 10 دقائق.

يمكن لاحقًا إضافة 2FA عبر البريد أو تطبيق.