import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserActivityDocument = UserActivity & Document;

export enum EventType {
  PAGE_VIEW = 'page_view',
  PRODUCT_VIEW = 'product_view',
  ADD_TO_CART = 'add_to_cart',
  SEARCH = 'search',
  PURCHASE = 'purchase',
  CLICK = 'click',
}

export enum DeviceType {
  MOBILE = 'mobile',
  TABLET = 'tablet',
  DESKTOP = 'desktop',
}

@Schema({ _id: false })
export class Event {
  @Prop({ required: true, enum: EventType })
  type: EventType;

  @Prop({ type: Object, default: {} })
  data: Record<string, any>;

  @Prop({ required: true, default: Date.now })
  timestamp: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);

@Schema({ _id: false })
export class Device {
  @Prop({ required: true, enum: DeviceType })
  type: DeviceType;

  @Prop()
  os: string;

  @Prop()
  browser: string;

  @Prop()
  userAgent: string;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);

@Schema({ _id: false })
export class Location {
  @Prop()
  city: string;

  @Prop()
  country: string;

  @Prop()
  ip: string;
}

export const LocationSchema = SchemaFactory.createForClass(Location);

@Schema({ timestamps: true, collection: 'useractivities' })
export class UserActivity {
  @Prop({ type: Types.ObjectId, ref: 'Account', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  sessionId: string;

  @Prop({ type: [EventSchema], default: [] })
  events: Event[];

  @Prop({ type: DeviceSchema })
  device: Device;

  @Prop({ type: LocationSchema })
  location: Location;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const UserActivitySchema = SchemaFactory.createForClass(UserActivity);

// Indexes
UserActivitySchema.index({ userId: 1, createdAt: -1 });
UserActivitySchema.index({ sessionId: 1 });
UserActivitySchema.index({ 'events.type': 1, 'events.timestamp': -1 });
