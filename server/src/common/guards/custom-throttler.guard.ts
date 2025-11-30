import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';

/**
 * Custom Throttler Guard with enhanced rate limiting
 * يوفر حماية متقدمة ضد الهجمات بمعدلات مختلفة للـ endpoints الحساسة
 */
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Track by IP address and user ID (if authenticated)
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const userId = req.user?.userId || 'anonymous';
    return `${ip}-${userId}`;
  }

  protected async throwThrottlingException(
    context: ExecutionContext,
  ): Promise<void> {
    const request = context.switchToHttp().getRequest();
    const tracker = await this.getTracker(request);

    throw new ThrottlerException(
      `Too many requests from ${tracker}. Please try again later.`,
    );
  }
}
