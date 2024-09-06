import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { DepartmentService } from './department.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from 'src/common/decorators/response.decorator';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { StaffAuthGuard } from 'src/auth/guard/auth.guard';
import { AdminAuthGuard } from 'src/auth/guard/admin-auth.guard';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';

@ApiBearerAuth()
@ApiTags('Departments')
@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a department.' })
  @ResponseMessage({ message: 'Department created successfully.' })
  async createDepartment(@Body() department: CreateDepartmentDto) {
    return this.departmentService.createDepartment(department);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Fetch all departments.' })
  @ResponseMessage({ message: 'Fetched all departments successfully.' })
  async fetchDepartments() {
    return this.departmentService.fetchAllDepartments();
  }

  @Get('/:id')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Fetch a department.' })
  @ResponseMessage({ message: 'Fetched department successfully.' })
  async fetchDepartment(@Param('id') id: string) {
    return this.departmentService.fetchDepartment(id);
  }

  @Patch('/:id')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Update a department' })
  @ResponseMessage({ message: 'Department updated successfully. ' })
  async updateDepartment(@Param('id') @Body() department: UpdateDepartmentDto) {
    return this.departmentService.updateDepartment(department);
  }
}
