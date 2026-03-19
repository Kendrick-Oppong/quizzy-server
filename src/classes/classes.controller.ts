import { Controller, Get } from '@nestjs/common';

@Controller('classes')
export class ClassesController {
  @Get()
  getPlaceholder(): { message: string } {
    return { message: 'Classes API placeholder' };
  }
}
