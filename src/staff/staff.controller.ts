import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from 'src/common/decorators/response.decorator';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { AdminAuthGuard } from 'src/auth/guard/admin-auth.guard';

@ApiBearerAuth()
@UseGuards(AdminAuthGuard)
@ApiTags('Staff')
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  @ApiOperation({ summary: 'Fetch all staff.' })
  @ResponseMessage({ message: 'Fetched all staff successfully.' })
  async fetchAllStaff() {
    return this.staffService.fetchAllStaff();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Fetch a staff.' })
  @ResponseMessage({ message: 'Fetched staff successfully.' })
  async fetchStaff(@Param('id') id: string) {
    return this.staffService.fetchStaff(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a staff.' })
  @ResponseMessage({ message: 'Staff created successfully.' })
  async createStaff(@Body() staff: CreateStaffDto) {
    return this.staffService.createStaff(staff);
  }

  @Patch('/:id/disable')
  @ApiOperation({ summary: 'Disable a staff.' })
  @ResponseMessage({ message: 'Staff disabled successfully.' })
  async disableStaff(@Param('id') id: string) {
    return this.staffService.disableStaff(id);
  }

  @Patch('/:id/enable')
  @ApiOperation({ summary: 'Enable a staff.' })
  @ResponseMessage({ message: 'Staff enabled successfully.' })
  async enableStaff(@Param('id') id: string) {
    return this.staffService.enableStaff(id);
  }

  @Post('/:id/resend-welcome-email')
  @ApiOperation({ summary: 'Resend welcome email.' })
  @ResponseMessage({ message: 'Welcome email resent successfully.' })
  async resendWelcomeEmail(@Param('id') id: string) {
    return this.staffService.resendWelcomeEmail(id);
  }

  @Patch('/:id')
  @ApiOperation({ summary: 'Update a staff.' })
  @ResponseMessage({ message: 'Staff updated successfully.' })
  async updateStaff(@Param('id') id: string, @Body() staff: UpdateStaffDto) {
    return this.staffService.updateStaff(id, staff);
  }
}
