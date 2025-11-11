import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { EventType } from '../../../../database/schemas/user-activity.schema';

export class TrackEventDto {
  @IsEnum(EventType)
  type: EventType;

  @IsObject()
  @IsOptional()
  data?: Record<string, any>;

  @IsString()
  @IsOptional()
  sessionId?: string;
}

