import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from 'src/common/decorators/response.decorator';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { StaffAuthGuard } from 'src/auth/guard/auth.guard';
import { AdminAuthGuard } from 'src/auth/guard/admin-auth.guard';

@ApiBearerAuth()
@ApiTags('Category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Create a category.' })
  @ResponseMessage({ message: 'Category created successfully.' })
  async category(@Body() category: CreateCategoryDto) {
    return this.categoryService.createCategory(category);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Fetch all categories.' })
  @ResponseMessage({ message: 'Categories fetched successfully.' })
  async fetchCategories() {
    return this.categoryService.fetchCategories();
  }

  @Get('/:id')
  @UseGuards(StaffAuthGuard)
  @ApiOperation({ summary: 'Fetch a category.' })
  @ResponseMessage({ message: 'Category fetched successfully.' })
  async fetchCategory(@Param('id') id: string) {
    return this.categoryService.fetchCategory(id);
  }
}
