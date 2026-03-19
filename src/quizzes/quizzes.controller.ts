import { Controller, Get } from '@nestjs/common';

@Controller('quizzes')
export class QuizzesController {
  @Get()
  getPlaceholder(): { message: string } {
    return { message: 'Quizzes API placeholder' };
  }
}
