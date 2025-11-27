import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpgradeRoleDto {
  @IsNotEmpty({ message: 'Role is required' })
  @IsEnum(['store_owner', 'courier'], { message: 'Role must be either store_owner or courier' })
  role: 'store_owner' | 'courier';
}

