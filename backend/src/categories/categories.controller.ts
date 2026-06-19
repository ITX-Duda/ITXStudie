import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  createCategory(@Body() body: { userId: string; name: string }) {
    return this.categoriesService.createCategory(body.userId, body.name);
  }

  @Get('user/:userId')
  getCategories(@Param('userId') userId: string) {
    return this.categoriesService.getCategories(userId);
  }
}
