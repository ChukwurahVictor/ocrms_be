import { Body, Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from 'src/common/decorators/response.decorator';
import { SuperAdminAuthGuard } from 'src/auth/guard/super-admin-auth.guard';

@ApiBearerAuth()
@Controller('admin')
@UseGuards(SuperAdminAuthGuard)
@ApiTags('Admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @ApiOperation({ summary: 'Create an Admin.' })
  @ResponseMessage({ message: 'Admin created successfully.' })
  async createAdmin(@Body() admin: CreateAdminDto) {
    return this.adminService.createAdmin(admin);
  }

  @Get()
  @ApiOperation({ summary: 'Fetch all Admins.' })
  @ResponseMessage({ message: 'Admins fetched successfully.' })
  async fetchAllAdmins() {
    return this.adminService.fetchAllAdmins();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Fetch an Admin.' })
  @ResponseMessage({ message: 'Admin fetched successfully.' })
  async fetchAdmin(@Param('id') id: string) {
    return this.adminService.fetchAdmin(id);
  }
}
