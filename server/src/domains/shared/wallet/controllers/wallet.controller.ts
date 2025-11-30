import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Ip,
} from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from '../../../../common/guards';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { WalletService } from '../services/wallet.service';
import { WalletTransactionService } from '../services/wallet-transaction.service';
import {
  DepositDto,
  WithdrawRequestDto,
  TransferDto,
  TransactionFilterDto,
  FreezeWalletDto,
  AdjustBalanceDto,
} from '../dto/wallet.dto';

@Controller('wallet')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly transactionService: WalletTransactionService,
  ) {}

  // ==================== User Endpoints ====================

  @Get('balance')
  async getBalance(@Request() req: any) {
    return this.walletService.getBalance(req.user.accountId);
  }

  @Get('transactions')
  async getTransactions(
    @Request() req: any,
    @Query() filterDto: TransactionFilterDto,
  ) {
    return this.transactionService.getTransactions(
      req.user.accountId,
      filterDto,
    );
  }

  @Get('transactions/summary')
  async getTransactionSummary(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.transactionService.getTransactionSummary(
      req.user.accountId,
      startDate,
      endDate,
    );
  }

  @Get('transactions/:id')
  async getTransactionById(@Param('id') id: string) {
    return this.transactionService.getTransactionById(id);
  }

  @Post('withdraw')
  @Roles('store_owner', 'courier')
  async requestWithdrawal(
    @Request() req: any,
    @Body() dto: WithdrawRequestDto,
    @Ip() ip: string,
  ) {
    return this.walletService.requestWithdrawal(req.user.accountId, dto, ip);
  }

  @Post('transfer')
  async transfer(
    @Request() req: any,
    @Body() dto: TransferDto,
    @Ip() ip: string,
  ) {
    return this.walletService.transfer(req.user.accountId, dto, ip);
  }

  // ==================== Admin Endpoints ====================

  @Post('admin/deposit')
  @Roles('super_admin', 'admin')
  async deposit(
    @Request() req: any,
    @Body() dto: DepositDto,
    @Ip() ip: string,
  ) {
    return this.walletService.deposit(dto, req.user.accountId, ip);
  }

  @Post('admin/freeze')
  @Roles('super_admin', 'admin')
  async freezeWallet(@Request() req: any, @Body() dto: FreezeWalletDto) {
    return this.walletService.freezeWallet(
      dto.accountId,
      dto.reason,
      req.user.accountId,
    );
  }

  @Post('admin/unfreeze/:accountId')
  @Roles('super_admin', 'admin')
  async unfreezeWallet(@Param('accountId') accountId: string) {
    return this.walletService.unfreezeWallet(accountId);
  }

  @Post('admin/adjust')
  @Roles('super_admin')
  async adjustBalance(
    @Request() req: any,
    @Body() dto: AdjustBalanceDto,
    @Ip() ip: string,
  ) {
    return this.walletService.adjustBalance(dto, req.user.accountId, ip);
  }

  @Get('admin/stats')
  @Roles('super_admin', 'admin')
  async getWalletStats() {
    return this.transactionService.getWalletStats();
  }

  @Get('admin/:accountId')
  @Roles('super_admin', 'admin')
  async getWalletByAccount(@Param('accountId') accountId: string) {
    return this.walletService.getWallet(accountId);
  }
}
