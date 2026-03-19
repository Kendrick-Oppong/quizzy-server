import { Controller, Get } from '@nestjs/common';

@Controller('students')
export class StudentsController {
  @Get()
  getPlaceholder(): { message: string } {
    return { message: 'Students API placeholder' };
  }
}
