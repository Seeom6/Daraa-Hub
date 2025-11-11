import { IsString, IsEnum, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PermissionSet {
  view?: boolean;
  create?: boolean;
  edit?: boolean;
  delete?: boolean;
  suspend?: boolean;
  approve?: boolean;
  reject?: boolean;
  feature?: boolean;
  cancel?: boolean;
  refund?: boolean;
  export?: boolean;
  send_bulk?: boolean;
}

class AdminPermissionsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => PermissionSet)
  users?: PermissionSet;

  @IsOptional()
  @ValidateNested()
  @Type(() => PermissionSet)
  stores?: PermissionSet;

  @IsOptional()
  @ValidateNested()
  @Type(() => PermissionSet)
  couriers?: PermissionSet;

  @IsOptional()
  @ValidateNested()
  @Type(() => PermissionSet)
  products?: PermissionSet;

  @IsOptional()
  @ValidateNested()
  @Type(() => PermissionSet)
  orders?: PermissionSet;

  @IsOptional()
  @ValidateNested()
  @Type(() => PermissionSet)
  payments?: PermissionSet;

  @IsOptional()
  @ValidateNested()
  @Type(() => PermissionSet)
  reports?: PermissionSet;

  @IsOptional()
  @ValidateNested()
  @Type(() => PermissionSet)
  settings?: PermissionSet;

  @IsOptional()
  @ValidateNested()
  @Type(() => PermissionSet)
  coupons?: PermissionSet;

  @IsOptional()
  @ValidateNested()
  @Type(() => PermissionSet)
  categories?: PermissionSet;

  @IsOptional()
  @ValidateNested()
  @Type(() => PermissionSet)
  notifications?: PermissionSet;
}

export class CreateAdminDto {
  @IsString()
  accountId: string;

  @IsObject()
  @ValidateNested()
  @Type(() => AdminPermissionsDto)
  permissions: AdminPermissionsDto;

  @IsEnum(['super_admin', 'admin', 'moderator', 'support'])
  role: 'super_admin' | 'admin' | 'moderator' | 'support';

  @IsOptional()
  @IsEnum(['operations', 'customer_service', 'finance', 'marketing', 'technical'])
  department?: string;
}

