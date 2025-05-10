import { Controller, Post, Body } from '@nestjs/common';
import { HintsService } from './hints.service';
import { GenerateHintsForUserDto } from './dto/generate-hints-for-user';

@Controller('hints')
export class HintsController {
  constructor(private readonly hintsService: HintsService) {}

  @Post()
  generateHints(@Body() generateHintsForUserDto: GenerateHintsForUserDto) {
    return this.hintsService.generateHints(generateHintsForUserDto);
  }
}
