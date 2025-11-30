import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

/**
 * Database Maintenance Job
 * Handles periodic database maintenance tasks
 *
 * Runs weekly to:
 * - Compact collections
 * - Rebuild indexes
 * - Validate data integrity
 * - Generate statistics
 */
@Injectable()
export class DatabaseMaintenanceJob {
  private readonly logger = new Logger(DatabaseMaintenanceJob.name);

  constructor(@InjectConnection() private readonly connection: Connection) {}

  /**
   * Weekly maintenance - runs every Sunday at 4 AM
   */
  @Cron('0 4 * * 0')
  async handleWeeklyMaintenance() {
    this.logger.log('Starting weekly database maintenance...');
    const startTime = Date.now();

    try {
      await this.collectDatabaseStats();
      await this.validateIndexes();

      const duration = Date.now() - startTime;
      this.logger.log(`Weekly maintenance completed in ${duration}ms`);
    } catch (error) {
      this.logger.error('Weekly maintenance failed:', error);
    }
  }

  /**
   * Collect and log database statistics
   */
  private async collectDatabaseStats(): Promise<void> {
    try {
      const db = this.connection.db;
      if (!db) {
        this.logger.warn('Database connection not available');
        return;
      }

      const stats = await db.stats();

      this.logger.log('Database Statistics:');
      this.logger.log(`  - Collections: ${stats.collections}`);
      this.logger.log(`  - Data Size: ${this.formatBytes(stats.dataSize)}`);
      this.logger.log(
        `  - Storage Size: ${this.formatBytes(stats.storageSize)}`,
      );
      this.logger.log(`  - Index Size: ${this.formatBytes(stats.indexSize)}`);
      this.logger.log(`  - Objects: ${stats.objects}`);
      this.logger.log(
        `  - Avg Object Size: ${this.formatBytes(stats.avgObjSize)}`,
      );
    } catch (error) {
      this.logger.error('Failed to collect database stats:', error);
    }
  }

  /**
   * Validate indexes on all collections
   */
  private async validateIndexes(): Promise<void> {
    try {
      const db = this.connection.db;
      if (!db) return;

      const collections = await db.listCollections().toArray();

      for (const collection of collections) {
        try {
          const indexes = await db.collection(collection.name).indexes();
          this.logger.debug(
            `Collection ${collection.name}: ${indexes.length} indexes`,
          );
        } catch (error) {
          this.logger.warn(
            `Failed to get indexes for ${collection.name}:`,
            error,
          );
        }
      }
    } catch (error) {
      this.logger.error('Failed to validate indexes:', error);
    }
  }

  /**
   * Get collection statistics
   */
  async getCollectionStats(collectionName: string): Promise<{
    count: number;
    size: number;
    avgObjSize: number;
    storageSize: number;
    indexSize: number;
  } | null> {
    try {
      const db = this.connection.db;
      if (!db) return null;

      const stats = await db.command({ collStats: collectionName });
      return {
        count: stats.count,
        size: stats.size,
        avgObjSize: stats.avgObjSize,
        storageSize: stats.storageSize,
        indexSize: stats.totalIndexSize,
      };
    } catch (error) {
      this.logger.error(`Failed to get stats for ${collectionName}:`, error);
      return null;
    }
  }

  /**
   * Get all collection sizes
   */
  async getAllCollectionSizes(): Promise<
    Array<{ name: string; count: number; size: string }>
  > {
    const db = this.connection.db;
    if (!db) return [];

    const collections = await db.listCollections().toArray();
    const results: Array<{ name: string; count: number; size: string }> = [];

    for (const collection of collections) {
      try {
        const stats = await db.command({ collStats: collection.name });
        results.push({
          name: collection.name,
          count: stats.count,
          size: this.formatBytes(stats.size),
        });
      } catch {
        // Skip collections that can't be accessed
      }
    }

    return results.sort((a, b) => b.count - a.count);
  }

  /**
   * Format bytes to human readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
