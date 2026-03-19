import { Controller, Get } from '@nestjs/common';

@Controller('subjects')
export class SubjectsController {
  @Get()
  getPlaceholder(): { message: string } {
    return { message: 'Subjects API placeholder' };
  }
}

