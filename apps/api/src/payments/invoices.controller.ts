import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/jwt.strategy';
import { InvoicesService } from './invoices.service';
import { ListInvoicesDto } from './dto/list-invoices.dto';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(private readonly invoices: InvoicesService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: ListInvoicesDto) {
    return this.invoices.list(user, query);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.invoices.get(user, id);
  }

  @Post(':id/issue')
  issue(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.invoices.issue(user, id);
  }

  @Post(':id/mark-paid')
  markPaid(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.invoices.markPaid(user, id);
  }

  @Post(':id/void')
  void(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.invoices.void(user, id);
  }
}
