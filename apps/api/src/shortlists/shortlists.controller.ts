import {
  Body, Controller, Delete, Get, HttpCode, Param, Post, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/jwt.strategy';
import { ShortlistsService } from './shortlists.service';
import { CreateShortlistDto } from './dto/create-shortlist.dto';
import { ListShortlistsDto } from './dto/list-shortlists.dto';
import { AddShortlistEntryDto } from './dto/add-entry.dto';

@Controller('shortlists')
@UseGuards(JwtAuthGuard)
export class ShortlistsController {
  constructor(private readonly shortlists: ShortlistsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: ListShortlistsDto) {
    return this.shortlists.listForCompany(user, query.companyId);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.shortlists.get(user, id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateShortlistDto) {
    return this.shortlists.create(user, dto.companyId, dto.name);
  }

  @Delete(':id')
  @HttpCode(204)
  delete(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.shortlists.delete(user, id);
  }

  @Post(':id/entries')
  addEntry(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: AddShortlistEntryDto,
  ) {
    return this.shortlists.addEntry(user, id, dto.salespersonId);
  }

  @Delete(':id/entries/:salespersonId')
  @HttpCode(204)
  removeEntry(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('salespersonId') salespersonId: string,
  ) {
    return this.shortlists.removeEntry(user, id, salespersonId);
  }
}
