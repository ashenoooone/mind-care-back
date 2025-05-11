import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { OwnerService } from './owner.service';
import { LoginDto } from './dto/login.dto';

@Controller('owner')
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  @Get('checkToken')
  checkToken(@Headers('Authorization') authHeader: string) {
    const token = authHeader.split(' ')[1];
    return this.ownerService.checkToken(token);
  }

  @Post('login')
  login(@Body() params: LoginDto) {
    return this.ownerService.login(params);
  }
}
