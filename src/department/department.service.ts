import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { AppUtilities } from 'src/common/utilities';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentService {
  constructor(private prisma: PrismaService) {}

  async createDepartment({ name, ...rest }: CreateDepartmentDto) {
    const departmentExist = await this.prisma.department.findFirst({
      where: { name },
    });

    if (departmentExist) {
      throw new ForbiddenException('Department already exists');
    }

    return this.prisma.department.create({
      data: { name, ...rest },
    });
  }

  async fetchAllDepartments() {
    return await this.prisma.department.findMany();
  }

  async fetchDepartment(id: string) {
    const department = await this.prisma.department.findFirst({
      where: { id },
      include: { staff: true },
    });

    if (!department) {
      throw new ForbiddenException('Department not found.');
    }

    return AppUtilities.removeSensitiveData(department, 'password');
  }

  async updateDepartment(dto: UpdateDepartmentDto) {
    return 'Update Department Endpoint';
  }
}
