import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async createCategory({ name, ...rest }: CreateCategoryDto) {
    const categoryExist = await this.prisma.category.findFirst({
      where: { name },
    });

    if (categoryExist) {
      throw new ForbiddenException('Category already exists');
    }

    return this.prisma.category.create({
      data: { name, ...rest },
    });
  }

  async fetchCategories() {
    return await this.prisma.category.findMany();
  }

  async fetchCategory(id: string) {
    const category = await this.prisma.category.findFirst({ where: { id } });

    if (!category) {
      throw new ForbiddenException('Category not found.');
    }

    return category;
  }
}
