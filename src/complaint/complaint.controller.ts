import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ComplaintService } from './complaint.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { ResponseMessage } from 'src/common/decorators/response.decorator';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from '@prisma/client';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { AssignComplaintDto } from './dto/assign-complaint.dto';
import { AdminAuthGuard } from 'src/auth/guard/admin-auth.guard';
import { StaffAuthGuard } from 'src/auth/guard/auth.guard';
import { FetchComplaintsDto } from './dto/fetch-complaint.dto';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { AddFeedbackDto } from './dto/add-feeback.dto';

@ApiBearerAuth()
@ApiTags('Complaints')
@Controller('complaints')
export class ComplaintController {
  constructor(private readonly complaintService: ComplaintService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Fetch all complaints.' })
  @ResponseMessage({ message: 'Fetched all complaints successfully.' })
  async fetchComplaints(
    @Query() dto: FetchComplaintsDto,
    @GetUser() user: User,
  ) {
    return this.complaintService.fetchAllComplaints(dto, user);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a complaint.' })
  @UseInterceptors(FileInterceptor('image'))
  // @UseInterceptors(
  //   FilesInterceptor('images', 4, {
  //     limits: { files: 4 },
  //     fileFilter: (req, file, cb) => {
  //       cb(null, true);
  //     },
  //   }),
  // )
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateComplaintDto })
  @ResponseMessage({ message: 'Complaint created successfully.' })
  async createComplaint(
    @UploadedFiles() image: Express.Multer.File,
    @GetUser() user: User,
    @Body() complaint: CreateComplaintDto,
  ) {
    return this.complaintService.createComplaint(
      complaint,
      user,
      image,
      // complaint.images,
    );
  }

  @Get('/summary')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get Complaints summary.' })
  @ResponseMessage({ message: 'Fetched summary successfully.' })
  async fetchComplaintSummary(@GetUser() user: User) {
    return this.complaintService.fetchComplaintSummary(user);
  }

  @Get('/frequent-complaints-stats')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get frequent Complaints Stats.' })
  @ResponseMessage({
    message: 'Fetched frequent Complaints stats successfully.',
  })
  async fetchFrequentComplaintStats() {
    return this.complaintService.frequentComplaintStats();
  }

  @Get('/urgency-level-stats')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get Urgency Level Complaints Stats.' })
  @ResponseMessage({
    message: 'Fetched Urgency Level Complaints stats successfully.',
  })
  async fetchUrgencyLevelComplaintStats() {
    return this.complaintService.urgencyLevelStats();
  }

  @Get('/open-complaints')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get top open days Complaints Stats.' })
  @ResponseMessage({
    message: 'Fetched Open Complaints stats successfully.',
  })
  async fetchOpenDaysComplaintStats() {
    return this.complaintService.openComplaintStats();
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage({ message: 'Fetched Complaint successfully.' })
  async fetchComplaint(@Param('id') id: string) {
    return this.complaintService.fetchComplaint(id);
  }

  @Post('/:id/assign')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Assign a complaint.' })
  @ResponseMessage({ message: 'Complaint assigned successfully.' })
  async assignComplaint(
    @Param('id') id: string,
    @Body() dto: AssignComplaintDto,
  ) {
    return this.complaintService.assignComplaint(id, dto);
  }

  @Patch('/:id')
  @UseGuards(StaffAuthGuard)
  @ApiOperation({ summary: 'Update a complaint.' })
  @ResponseMessage({ message: 'Complaint updated successfully.' })
  async updateComplaint(
    @Param('id') id: string,
    @GetUser() user: User,
    @Body() dto: UpdateComplaintDto,
  ) {
    return this.complaintService.updateComplaint(id, user, dto);
  }

  @Post('/:id/feedbacks')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '' })
  @ResponseMessage({ message: '' })
  async addFeedback(
    @Param('id') id: string,
    @GetUser() user: User,
    @Body() dto: AddFeedbackDto,
  ) {
    return this.complaintService.addFeedback(id, user, dto);
  }
}
