import { Controller, Get } from '@nestjs/common';

@Controller('grading')
export class GradingController {
  @Get()
  getPlaceholder(): { message: string } {
    return { message: 'Grading API placeholder' };
  }
}
