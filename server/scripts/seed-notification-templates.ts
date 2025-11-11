import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { NotificationTemplate } from '../src/database/schemas/notification-template.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const notificationTemplateModel = app.get<Model<NotificationTemplate>>(
    getModelToken(NotificationTemplate.name),
  );

  console.log('🌱 Seeding notification templates...\n');

  const templates = [
    // ============================================
    // VERIFICATION TEMPLATES
    // ============================================
    {
      code: 'VERIFICATION_SUBMITTED',
      name: 'Verification Request Submitted',
      description: 'Sent when a user submits a verification request',
      type: 'verification',
      targetRoles: ['store_owner', 'courier'],
      inApp: {
        titleAr: 'تم استلام طلب التحقق',
        titleEn: 'Verification Request Received',
        messageAr: 'تم استلام طلب التحقق الخاص بك. سيتم مراجعته خلال 24-48 ساعة.',
        messageEn: 'Your verification request has been received. It will be reviewed within 24-48 hours.',
        variables: [],
      },
      email: {
        subjectAr: 'تم استلام طلب التحقق - {{platformName}}',
        subjectEn: 'Verification Request Received - {{platformName}}',
        bodyAr: '<p>مرحباً {{fullName}},</p><p>تم استلام طلب التحقق الخاص بك بنجاح. سيقوم فريقنا بمراجعته خلال 24-48 ساعة.</p>',
        bodyEn: '<p>Hello {{fullName}},</p><p>Your verification request has been received successfully. Our team will review it within 24-48 hours.</p>',
        variables: ['fullName', 'platformName'],
      },
      defaultChannels: ['in_app', 'email'],
      priority: 'info',
      isActive: true,
    },
    {
      code: 'VERIFICATION_APPROVED',
      name: 'Verification Request Approved',
      description: 'Sent when a verification request is approved',
      type: 'verification',
      targetRoles: ['store_owner', 'courier'],
      inApp: {
        titleAr: 'تمت الموافقة على طلب التحقق',
        titleEn: 'Verification Request Approved',
        messageAr: 'مبروك! تمت الموافقة على طلب التحقق الخاص بك. يمكنك الآن البدء في استخدام المنصة.',
        messageEn: 'Congratulations! Your verification request has been approved. You can now start using the platform.',
        variables: [],
      },
      email: {
        subjectAr: 'تمت الموافقة على حسابك - {{platformName}}',
        subjectEn: 'Your Account Has Been Approved - {{platformName}}',
        bodyAr: '<p>مرحباً {{fullName}},</p><p>مبروك! تمت الموافقة على طلب التحقق الخاص بك.</p><p>يمكنك الآن البدء في استخدام جميع ميزات المنصة.</p>',
        bodyEn: '<p>Hello {{fullName}},</p><p>Congratulations! Your verification request has been approved.</p><p>You can now start using all platform features.</p>',
        variables: ['fullName', 'platformName'],
      },
      push: {
        titleAr: 'تمت الموافقة على حسابك',
        titleEn: 'Account Approved',
        bodyAr: 'مبروك! يمكنك الآن البدء في استخدام المنصة',
        bodyEn: 'Congratulations! You can now start using the platform',
        variables: [],
      },
      defaultChannels: ['in_app', 'email', 'push'],
      priority: 'success',
      isActive: true,
    },
    {
      code: 'VERIFICATION_REJECTED',
      name: 'Verification Request Rejected',
      description: 'Sent when a verification request is rejected',
      type: 'verification',
      targetRoles: ['store_owner', 'courier'],
      inApp: {
        titleAr: 'تم رفض طلب التحقق',
        titleEn: 'Verification Request Rejected',
        messageAr: 'عذراً، تم رفض طلب التحقق الخاص بك. السبب: {{rejectionReason}}',
        messageEn: 'Sorry, your verification request has been rejected. Reason: {{rejectionReason}}',
        variables: ['rejectionReason'],
      },
      email: {
        subjectAr: 'تم رفض طلب التحقق - {{platformName}}',
        subjectEn: 'Verification Request Rejected - {{platformName}}',
        bodyAr: '<p>مرحباً {{fullName}},</p><p>عذراً، تم رفض طلب التحقق الخاص بك.</p><p><strong>السبب:</strong> {{rejectionReason}}</p><p>يمكنك تقديم طلب جديد بعد تصحيح المعلومات.</p>',
        bodyEn: '<p>Hello {{fullName}},</p><p>Sorry, your verification request has been rejected.</p><p><strong>Reason:</strong> {{rejectionReason}}</p><p>You can submit a new request after correcting the information.</p>',
        variables: ['fullName', 'platformName', 'rejectionReason'],
      },
      defaultChannels: ['in_app', 'email'],
      priority: 'warning',
      isActive: true,
    },
    {
      code: 'VERIFICATION_INFO_REQUIRED',
      name: 'Additional Information Required',
      description: 'Sent when admin requests additional information',
      type: 'verification',
      targetRoles: ['store_owner', 'courier'],
      inApp: {
        titleAr: 'معلومات إضافية مطلوبة',
        titleEn: 'Additional Information Required',
        messageAr: 'يرجى تقديم معلومات إضافية لإكمال عملية التحقق: {{infoRequired}}',
        messageEn: 'Please provide additional information to complete verification: {{infoRequired}}',
        variables: ['infoRequired'],
      },
      email: {
        subjectAr: 'معلومات إضافية مطلوبة - {{platformName}}',
        subjectEn: 'Additional Information Required - {{platformName}}',
        bodyAr: '<p>مرحباً {{fullName}},</p><p>نحتاج إلى معلومات إضافية لإكمال عملية التحقق:</p><p>{{infoRequired}}</p>',
        bodyEn: '<p>Hello {{fullName}},</p><p>We need additional information to complete your verification:</p><p>{{infoRequired}}</p>',
        variables: ['fullName', 'platformName', 'infoRequired'],
      },
      defaultChannels: ['in_app', 'email'],
      priority: 'warning',
      isActive: true,
    },

    // ============================================
    // ACCOUNT TEMPLATES
    // ============================================
    {
      code: 'ACCOUNT_SUSPENDED',
      name: 'Account Suspended',
      description: 'Sent when an account is suspended',
      type: 'account',
      targetRoles: ['customer', 'store_owner', 'courier'],
      inApp: {
        titleAr: 'تم تعليق حسابك',
        titleEn: 'Account Suspended',
        messageAr: 'تم تعليق حسابك حتى {{suspensionExpiresAt}}. السبب: {{suspensionReason}}',
        messageEn: 'Your account has been suspended until {{suspensionExpiresAt}}. Reason: {{suspensionReason}}',
        variables: ['suspensionExpiresAt', 'suspensionReason'],
      },
      email: {
        subjectAr: 'تم تعليق حسابك - {{platformName}}',
        subjectEn: 'Account Suspended - {{platformName}}',
        bodyAr: '<p>مرحباً {{fullName}},</p><p>تم تعليق حسابك حتى {{suspensionExpiresAt}}.</p><p><strong>السبب:</strong> {{suspensionReason}}</p>',
        bodyEn: '<p>Hello {{fullName}},</p><p>Your account has been suspended until {{suspensionExpiresAt}}.</p><p><strong>Reason:</strong> {{suspensionReason}}</p>',
        variables: ['fullName', 'platformName', 'suspensionExpiresAt', 'suspensionReason'],
      },
      defaultChannels: ['in_app', 'email'],
      priority: 'error',
      isActive: true,
    },
    {
      code: 'ACCOUNT_UNSUSPENDED',
      name: 'Account Unsuspended',
      description: 'Sent when an account suspension is lifted',
      type: 'account',
      targetRoles: ['customer', 'store_owner', 'courier'],
      inApp: {
        titleAr: 'تم إلغاء تعليق حسابك',
        titleEn: 'Account Unsuspended',
        messageAr: 'تم إلغاء تعليق حسابك. يمكنك الآن استخدام المنصة بشكل طبيعي.',
        messageEn: 'Your account suspension has been lifted. You can now use the platform normally.',
        variables: [],
      },
      email: {
        subjectAr: 'تم إلغاء تعليق حسابك - {{platformName}}',
        subjectEn: 'Account Unsuspended - {{platformName}}',
        bodyAr: '<p>مرحباً {{fullName}},</p><p>تم إلغاء تعليق حسابك. يمكنك الآن استخدام المنصة بشكل طبيعي.</p>',
        bodyEn: '<p>Hello {{fullName}},</p><p>Your account suspension has been lifted. You can now use the platform normally.</p>',
        variables: ['fullName', 'platformName'],
      },
      defaultChannels: ['in_app', 'email'],
      priority: 'success',
      isActive: true,
    },
    {
      code: 'ACCOUNT_BANNED',
      name: 'Account Permanently Banned',
      description: 'Sent when an account is permanently banned',
      type: 'account',
      targetRoles: ['customer', 'store_owner', 'courier'],
      inApp: {
        titleAr: 'تم حظر حسابك نهائياً',
        titleEn: 'Account Permanently Banned',
        messageAr: 'تم حظر حسابك نهائياً. السبب: {{suspensionReason}}',
        messageEn: 'Your account has been permanently banned. Reason: {{suspensionReason}}',
        variables: ['suspensionReason'],
      },
      email: {
        subjectAr: 'تم حظر حسابك - {{platformName}}',
        subjectEn: 'Account Banned - {{platformName}}',
        bodyAr: '<p>مرحباً {{fullName}},</p><p>تم حظر حسابك نهائياً من استخدام المنصة.</p><p><strong>السبب:</strong> {{suspensionReason}}</p>',
        bodyEn: '<p>Hello {{fullName}},</p><p>Your account has been permanently banned from using the platform.</p><p><strong>Reason:</strong> {{suspensionReason}}</p>',
        variables: ['fullName', 'platformName', 'suspensionReason'],
      },
      defaultChannels: ['in_app', 'email'],
      priority: 'error',
      isActive: true,
    },

    // ============================================
    // SUBSCRIPTION TEMPLATES
    // ============================================
    {
      code: 'SUBSCRIPTION_EXPIRY_WARNING',
      name: 'Subscription Expiry Warning',
      description: 'Sent 3 days before subscription expires',
      type: 'account',
      targetRoles: ['store_owner'],
      inApp: {
        titleAr: 'تنبيه: اشتراكك على وشك الانتهاء',
        titleEn: 'Warning: Your Subscription is About to Expire',
        messageAr: 'سينتهي اشتراكك في {{planName}} خلال {{daysLeft}} أيام. يرجى التجديد لتجنب انقطاع الخدمة.',
        messageEn: 'Your {{planName}} subscription will expire in {{daysLeft}} days. Please renew to avoid service interruption.',
        variables: ['planName', 'daysLeft', 'expiryDate'],
      },
      email: {
        subjectAr: 'تنبيه: اشتراكك على وشك الانتهاء - {{platformName}}',
        subjectEn: 'Warning: Your Subscription is About to Expire - {{platformName}}',
        bodyAr: '<p>مرحباً {{storeName}},</p><p>سينتهي اشتراكك في خطة {{planName}} خلال {{daysLeft}} أيام ({{expiryDate}}).</p><p>يرجى التجديد لتجنب انقطاع الخدمة.</p>',
        bodyEn: '<p>Hello {{storeName}},</p><p>Your {{planName}} subscription will expire in {{daysLeft}} days ({{expiryDate}}).</p><p>Please renew to avoid service interruption.</p>',
        variables: ['storeName', 'planName', 'daysLeft', 'expiryDate', 'platformName'],
      },
      sms: {
        messageAr: 'تنبيه: سينتهي اشتراكك في {{planName}} خلال {{daysLeft}} أيام. يرجى التجديد.',
        messageEn: 'Warning: Your {{planName}} subscription will expire in {{daysLeft}} days. Please renew.',
        variables: ['planName', 'daysLeft'],
      },
      defaultChannels: ['in_app', 'email', 'sms'],
      priority: 'warning',
      isActive: true,
    },
    {
      code: 'SUBSCRIPTION_EXPIRED',
      name: 'Subscription Expired',
      description: 'Sent when subscription expires',
      type: 'account',
      targetRoles: ['store_owner'],
      inApp: {
        titleAr: 'انتهى اشتراكك',
        titleEn: 'Your Subscription Has Expired',
        messageAr: 'انتهى اشتراكك في {{planName}}. لن تتمكن من نشر منتجات جديدة حتى تجدد اشتراكك.',
        messageEn: 'Your {{planName}} subscription has expired. You cannot publish new products until you renew.',
        variables: ['planName'],
      },
      email: {
        subjectAr: 'انتهى اشتراكك - {{platformName}}',
        subjectEn: 'Your Subscription Has Expired - {{platformName}}',
        bodyAr: '<p>مرحباً {{storeName}},</p><p>انتهى اشتراكك في خطة {{planName}}.</p><p>لن تتمكن من نشر منتجات جديدة حتى تجدد اشتراكك.</p>',
        bodyEn: '<p>Hello {{storeName}},</p><p>Your {{planName}} subscription has expired.</p><p>You cannot publish new products until you renew.</p>',
        variables: ['storeName', 'planName', 'platformName'],
      },
      sms: {
        messageAr: 'انتهى اشتراكك في {{planName}}. يرجى التجديد لمواصلة نشر المنتجات.',
        messageEn: 'Your {{planName}} subscription has expired. Please renew to continue publishing products.',
        variables: ['planName'],
      },
      defaultChannels: ['in_app', 'email', 'sms'],
      priority: 'error',
      isActive: true,
    },
    {
      code: 'DAILY_LIMIT_REACHED',
      name: 'Daily Product Limit Reached',
      description: 'Sent when store reaches daily product publishing limit',
      type: 'account',
      targetRoles: ['store_owner'],
      inApp: {
        titleAr: 'وصلت إلى الحد اليومي',
        titleEn: 'Daily Limit Reached',
        messageAr: 'لقد وصلت إلى الحد اليومي لنشر المنتجات ({{dailyLimit}} منتجات). يمكنك نشر المزيد غداً أو ترقية خطتك.',
        messageEn: 'You have reached your daily product publishing limit ({{dailyLimit}} products). You can publish more tomorrow or upgrade your plan.',
        variables: ['dailyLimit', 'planName'],
      },
      defaultChannels: ['in_app'],
      priority: 'warning',
      isActive: true,
    },
    {
      code: 'SUBSCRIPTION_ACTIVATED',
      name: 'Subscription Activated',
      description: 'Sent when subscription is activated',
      type: 'account',
      targetRoles: ['store_owner'],
      inApp: {
        titleAr: 'تم تفعيل اشتراكك',
        titleEn: 'Your Subscription Has Been Activated',
        messageAr: 'تم تفعيل اشتراكك في {{planName}} بنجاح. يمكنك الآن نشر {{dailyLimit}} منتجات يومياً.',
        messageEn: 'Your {{planName}} subscription has been activated successfully. You can now publish {{dailyLimit}} products daily.',
        variables: ['planName', 'dailyLimit', 'expiryDate'],
      },
      email: {
        subjectAr: 'تم تفعيل اشتراكك - {{platformName}}',
        subjectEn: 'Your Subscription Has Been Activated - {{platformName}}',
        bodyAr: '<p>مرحباً {{storeName}},</p><p>تم تفعيل اشتراكك في خطة {{planName}} بنجاح.</p><p>يمكنك الآن نشر {{dailyLimit}} منتجات يومياً حتى {{expiryDate}}.</p>',
        bodyEn: '<p>Hello {{storeName}},</p><p>Your {{planName}} subscription has been activated successfully.</p><p>You can now publish {{dailyLimit}} products daily until {{expiryDate}}.</p>',
        variables: ['storeName', 'planName', 'dailyLimit', 'expiryDate', 'platformName'],
      },
      defaultChannels: ['in_app', 'email'],
      priority: 'success',
      isActive: true,
    },
    {
      code: 'SUBSCRIPTION_PAYMENT_SUCCESS',
      name: 'Subscription Payment Success',
      description: 'Sent when subscription payment is successful',
      type: 'payment',
      targetRoles: ['store_owner'],
      inApp: {
        titleAr: 'تم استلام الدفع',
        titleEn: 'Payment Received',
        messageAr: 'تم استلام دفعتك بنجاح. سيتم تفعيل اشتراكك قريباً.',
        messageEn: 'Your payment has been received successfully. Your subscription will be activated soon.',
        variables: ['amount', 'planName'],
      },
      email: {
        subjectAr: 'تم استلام الدفع - {{platformName}}',
        subjectEn: 'Payment Received - {{platformName}}',
        bodyAr: '<p>مرحباً {{storeName}},</p><p>تم استلام دفعتك بمبلغ {{amount}} بنجاح.</p><p>سيتم تفعيل اشتراكك في {{planName}} قريباً.</p>',
        bodyEn: '<p>Hello {{storeName}},</p><p>Your payment of {{amount}} has been received successfully.</p><p>Your {{planName}} subscription will be activated soon.</p>',
        variables: ['storeName', 'amount', 'planName', 'platformName'],
      },
      defaultChannels: ['in_app', 'email'],
      priority: 'success',
      isActive: true,
    },
    {
      code: 'SUBSCRIPTION_PAYMENT_FAILED',
      name: 'Subscription Payment Failed',
      description: 'Sent when subscription payment fails',
      type: 'payment',
      targetRoles: ['store_owner'],
      inApp: {
        titleAr: 'فشل الدفع',
        titleEn: 'Payment Failed',
        messageAr: 'فشلت عملية الدفع. يرجى المحاولة مرة أخرى أو التواصل مع الدعم.',
        messageEn: 'Payment failed. Please try again or contact support.',
        variables: ['reason'],
      },
      email: {
        subjectAr: 'فشل الدفع - {{platformName}}',
        subjectEn: 'Payment Failed - {{platformName}}',
        bodyAr: '<p>مرحباً {{storeName}},</p><p>فشلت عملية الدفع.</p><p>السبب: {{reason}}</p><p>يرجى المحاولة مرة أخرى أو التواصل مع الدعم.</p>',
        bodyEn: '<p>Hello {{storeName}},</p><p>Payment failed.</p><p>Reason: {{reason}}</p><p>Please try again or contact support.</p>',
        variables: ['storeName', 'reason', 'platformName'],
      },
      defaultChannels: ['in_app', 'email'],
      priority: 'error',
      isActive: true,
    },

    // ============================================
    // SYSTEM TEMPLATES
    // ============================================
    {
      code: 'WELCOME_MESSAGE',
      name: 'Welcome Message',
      description: 'Sent when a new user completes registration',
      type: 'system',
      targetRoles: ['customer', 'store_owner', 'courier'],
      inApp: {
        titleAr: 'مرحباً بك في {{platformName}}',
        titleEn: 'Welcome to {{platformName}}',
        messageAr: 'نحن سعداء بانضمامك إلينا! ابدأ الآن في استكشاف المنصة.',
        messageEn: 'We are happy to have you! Start exploring the platform now.',
        variables: ['platformName'],
      },
      email: {
        subjectAr: 'مرحباً بك في {{platformName}}',
        subjectEn: 'Welcome to {{platformName}}',
        bodyAr: '<p>مرحباً {{fullName}},</p><p>نحن سعداء بانضمامك إلى {{platformName}}!</p><p>ابدأ الآن في استكشاف جميع الميزات المتاحة.</p>',
        bodyEn: '<p>Hello {{fullName}},</p><p>We are happy to have you join {{platformName}}!</p><p>Start exploring all available features now.</p>',
        variables: ['fullName', 'platformName'],
      },
      defaultChannels: ['in_app', 'email'],
      priority: 'info',
      isActive: true,
    },
    {
      code: 'SYSTEM_ANNOUNCEMENT',
      name: 'System Announcement',
      description: 'General system announcements',
      type: 'system',
      targetRoles: ['customer', 'store_owner', 'courier', 'admin'],
      inApp: {
        titleAr: '{{announcementTitle}}',
        titleEn: '{{announcementTitle}}',
        messageAr: '{{announcementMessage}}',
        messageEn: '{{announcementMessage}}',
        variables: ['announcementTitle', 'announcementMessage'],
      },
      defaultChannels: ['in_app'],
      priority: 'info',
      isActive: true,
    },
  ];

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const template of templates) {
    try {
      const existing = await notificationTemplateModel.findOne({ code: template.code });
      
      if (existing) {
        // Update existing template
        await notificationTemplateModel.updateOne(
          { code: template.code },
          { $set: template },
        );
        console.log(`✅ Updated: ${template.code}`);
        updated++;
      } else {
        // Create new template
        await notificationTemplateModel.create(template);
        console.log(`✨ Created: ${template.code}`);
        created++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${template.code}:`, error.message);
      skipped++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   ✨ Created: ${created}`);
  console.log(`   ✅ Updated: ${updated}`);
  console.log(`   ❌ Skipped: ${skipped}`);
  console.log(`   📝 Total: ${templates.length}`);

  await app.close();
  console.log('\n✅ Done!');
}

bootstrap().catch((error) => {
  console.error('Error seeding templates:', error);
  process.exit(1);
});

