import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/jwt.strategy';
import { AttemptsService } from './attempts.service';
import { SendMessageDto } from './dto/send-message.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class AttemptsController {
  constructor(private readonly attempts: AttemptsService) {}

  @Post('challenges/:id/attempts')
  start(@CurrentUser() user: AuthUser, @Param('id') challengeId: string) {
    return this.attempts.start(user, challengeId);
  }

  @Get('attempts/me')
  listMine(@CurrentUser() user: AuthUser) {
    return this.attempts.listMine(user);
  }

  @Get('attempts/:id')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.attempts.get(user, id);
  }

  @Post('attempts/:id/messages')
  send(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.attempts.sendMessage(user, id, dto.content, dto.clientMeta);
  }

  @Post('attempts/:id/end')
  end(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.attempts.end(user, id);
  }
}
