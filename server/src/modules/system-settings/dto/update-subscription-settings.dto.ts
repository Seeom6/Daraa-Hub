import { IsBoolean, IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateSubscriptionSettingsDto {
  @IsOptional()
  @IsBoolean()
  subscriptionSystemEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  allowManualPayment?: boolean;

  @IsOptional()
  @IsBoolean()
  allowOnlinePayment?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  trialPeriodDays?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  subscriptionExpiryWarningDays?: number;

  @IsOptional()
  @IsBoolean()
  notifyOnSubscriptionExpiry?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyOnDailyLimitReached?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyOnPaymentSuccess?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyOnPaymentFailure?: boolean;
}

