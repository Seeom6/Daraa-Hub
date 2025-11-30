import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Inventory,
  InventorySchema,
} from '../../../database/schemas/inventory.schema';
import {
  Product,
  ProductSchema,
} from '../../../database/schemas/product.schema';
import { InventoryService } from './services/inventory.service';
import { InventoryMovementService } from './services/inventory-movement.service';
import { InventoryReservationService } from './services/inventory-reservation.service';
import { InventoryQueryService } from './services/inventory-query.service';
import { InventoryController } from './controllers/inventory.controller';
import { InventoryRepository } from './repositories/inventory.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Inventory.name, schema: InventorySchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [InventoryController],
  providers: [
    InventoryRepository,
    InventoryMovementService,
    InventoryReservationService,
    InventoryQueryService,
    InventoryService,
  ],
  exports: [
    InventoryService,
    InventoryMovementService,
    InventoryReservationService,
    InventoryQueryService,
    InventoryRepository,
  ],
})
export class InventoryModule {}
