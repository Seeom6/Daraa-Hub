import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from '../../database/schemas/category.schema';
import { CategoryService } from './services/category.service';
import { CategoryController } from './controllers/category.controller';
import { StorageModule } from '../../infrastructure/storage/storage.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }]),
    StorageModule,
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}

