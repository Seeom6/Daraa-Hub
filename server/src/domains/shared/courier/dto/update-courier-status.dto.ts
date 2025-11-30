import { IsEnum } from 'class-validator';

export class UpdateCourierStatusDto {
  @IsEnum(['offline', 'available', 'busy', 'on_break'])
  status: 'offline' | 'available' | 'busy' | 'on_break';
}
