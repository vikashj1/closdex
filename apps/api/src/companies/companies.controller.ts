import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/jwt.strategy';
import { CompaniesService } from './companies.service';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companies: CompaniesService) {}

  @Get(':id')
  get(@Param('id') id: string) {
    return this.companies.get(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/stats')
  getStats(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.companies.getStats(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.companies.update(id, user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/reapply')
  reapply(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.companies.reapply(id, user.id);
  }
}
