import {
  IsString,
  IsEnum,
  IsOptional,
  ValidateNested,
  IsArray,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';

class PersonalInfoDto {
  @IsString()
  fullName: string;

  @IsString()
  nationalId: string;

  @IsString()
  dateOfBirth: string;

  @IsString()
  address: string;

  @IsString()
  city: string;
}

class BusinessInfoDto {
  @IsString()
  businessName: string;

  @IsString()
  businessType: string;

  @IsString()
  businessAddress: string;

  @IsString()
  businessPhone: string;

  @IsOptional()
  @IsString()
  taxId?: string;

  @IsOptional()
  @IsString()
  commercialRegister?: string;

  @IsOptional()
  @IsMongoId()
  primaryCategory?: string; // التصنيف الرئيسي للمتجر

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  storeCategories?: string[]; // تصنيفات المتجر
}

class VehicleInfoDto {
  @IsString()
  vehicleType: string;

  @IsString()
  vehicleMake: string;

  @IsString()
  vehicleModel: string;

  @IsString()
  vehicleYear: string;

  @IsString()
  vehiclePlateNumber: string;

  @IsString()
  vehicleColor: string;
}

export class SubmitVerificationDto {
  @IsEnum(['store_owner', 'courier'])
  applicantType: 'store_owner' | 'courier';

  @ValidateNested()
  @Type(() => PersonalInfoDto)
  personalInfo: PersonalInfoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BusinessInfoDto)
  businessInfo?: BusinessInfoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => VehicleInfoDto)
  vehicleInfo?: VehicleInfoDto;

  @IsOptional()
  @IsString()
  additionalNotes?: string;
}

export class UploadDocumentDto {
  @IsString()
  verificationRequestId: string;

  @IsEnum([
    'national_id',
    'commercial_register',
    'tax_certificate',
    'vehicle_license',
    'driver_license',
    'other',
  ])
  documentType:
    | 'national_id'
    | 'commercial_register'
    | 'tax_certificate'
    | 'vehicle_license'
    | 'driver_license'
    | 'other';

  @IsOptional()
  @IsString()
  description?: string;
}
