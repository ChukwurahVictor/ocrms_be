import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PriorityLevel, Prisma, PrismaClient, User } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { AssignComplaintDto } from './dto/assign-complaint.dto';
import { FetchComplaintsDto } from './dto/fetch-complaint.dto';
import { ComplaintStatus, UserRole } from 'src/common/interfaces';
import { CrudService } from 'src/common/database/crud.service';
import { ComplaintMapType } from './complaint.maptype';
import { AppUtilities } from 'src/common/utilities';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { MailingService } from 'src/common/messaging/mailing/mailing.service';
import { MessagingQueueProducer } from 'src/common/messaging/queue/producer';
import { AddFeedbackDto } from './dto/add-feeback.dto';
// import { UploadQueueProducer } from 'src/common/cloudinary/queue/producer';

@Injectable()
export class ComplaintService extends CrudService<
  Prisma.ComplaintDelegate<any>,
  ComplaintMapType
> {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
    private mailingService: MailingService,
    private messagingQueue: MessagingQueueProducer,
  ) {
    super(prisma.complaint);
  }

  async createComplaint(
    { title, description, categoryId, image, ...rest }: CreateComplaintDto,
    user: User,
    file: Express.Multer.File,
  ) {
    console.log('image', file); //this returns image buffer
    console.log('image', image); // this returns undefined
    // console.log('title', title, rest);
    // console.log(
    //   '================================================================',
    // );
    // console.log('images', images);
    // console.log(
    //   '================================================================',
    // );
    // // console.log('image', image);
    // console.log(
    //   '================================================================',
    // );
    const referenceNo = await AppUtilities.generateReferenceNo();
    try {
      const complaint = await this.prisma.complaint.create({
        data: {
          title,
          description,
          categoryId,
          referenceNo,
          status: 'Pending',
          userId: user.id,
        },
      });
      // let imageResults = [];
      // if (images && images.length > 0) {
      //   const uploadPromises = images.map((image, index) => {
      //     console.log(`Uploading image ${index}:`, image);
      //     return this.cloudinaryService.uploadImage(
      //       image,
      //       'complaint',
      //       image.originalname,
      //     );
      //   });

      //   imageResults = await Promise.all(uploadPromises);
      // }
      const uploadImage = file
        ? await this.cloudinaryService.uploadImage(
            file,
            'complaint',
            file.originalname,
          )
        : null;

      const imageResult = uploadImage?.secure_url || '';

      console.log('imageResults: ', imageResult);
      // await this.prisma.$transaction(async (prisma: PrismaClient) => {
      //   const createImagesPromises = imageResults.map((uploadResult) =>
      //     prisma.complaintImages.create({
      //       data: {
      //         complaintId: complaint.id,
      //         image: uploadResult?.secure_url,
      //         createdBy: user.id,
      //       },
      //     }),
      //   );
      //   await Promise.all(createImagesPromises);
      // });

      // const uploadComplaintImage = await this.prisma.complaintImages.create({
      //   data: {
      //     complaintId: complaint.id,
      //     image: imageResult,
      //     createdBy: user.id,
      //   },
      // });

      const updatedComplaint = await this.prisma.complaint.update({
        where: { id: complaint.id },
        data: {
          images: {
            create: {
              image: imageResult,
              createdBy: user.id,
            },
          },
        },
        include: { images: true },
      });

      await this.messagingQueue.queueCreateComplaintEmail({
        referenceNo: complaint.referenceNo,
        firstName: user?.firstName,
        email: user?.email,
      });

      return updatedComplaint;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async fetchAllComplaints(
    { orderBy, direction, cursor, size, ...dto }: FetchComplaintsDto,
    user: User,
  ) {
    const parsedFilterQuery = await this.parseQueryFilter(dto, [
      'referenceNo|contains',
      'title',
      'description',
      {
        key: 'reference',
        where: (reference) => ({
          referenceNo: {
            contains: reference,
            mode: 'insensitive',
          },
        }),
      },
    ]);
    let filter = {};
    console.log(user);

    if (user.userRole === UserRole.USER) {
      filter = { userId: user.id };
    } else if (user.userRole === UserRole.STAFF) {
      filter = { departmentId: user.departmentId };
    } else {
      filter = {};
    }

    const args: Prisma.ComplaintFindManyArgs = {
      where: { ...parsedFilterQuery, ...filter },
      include: {
        department: true,
        user: true,
        category: true,
        feedback: {
          include: {
            user: true,
          },
        },
      },
    };

    return this.findManyPaginate(args, {
      cursor,
      direction,
      orderBy: orderBy,
      size,
    });
  }

  async fetchComplaint(id: string) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            department: { select: { id: true, name: true } },
            userRole: true,
          },
        },
        images: true,
        category: true,
        department: true,
        statusUpdateHistory: true,
        feedback: true,
      },
    });

    if (!complaint) throw new BadRequestException('Complaint not found');

    /*
      this is to enrich the statusUpdateHistory with user details since there is no relationship on the schema
    */
    const statusUpdateHistoryWithUserDetails = await Promise.all(
      complaint.statusUpdateHistory.map(async (history) => {
        const user = await this.prisma.user.findUnique({
          where: { id: history.updatedBy },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            department: { select: { id: true, name: true } },
            userRole: true,
          },
        });

        return {
          ...history,
          updatedByUser: user,
        };
      }),
    );

    // Return the complaint with the enriched statusUpdateHistory
    return {
      ...complaint,
      statusUpdateHistory: statusUpdateHistoryWithUserDetails,
    };
  }

  async updateComplaint(id: string, user: User, dto: UpdateComplaintDto) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id },
    });

    if (!complaint) {
      throw new NotFoundException('Complaint not found');
    }

    const categoryExist = await this.prisma.category.findFirstOrThrow({
      where: { id: dto.categoryId },
    });

    if (!categoryExist) {
      throw new BadRequestException('Invalid Category');
    }

    const updatedComplaint = await this.prisma.complaint.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.status === ComplaintStatus.RESOLVED && {
          resolutionTime: new Date().toISOString().replace(/\0/g, ''),
        }),
        ...(dto.status && {
          statusUpdateHistory: {
            connectOrCreate: {
              create: {
                updatedStatus: dto.status,
                updatedBy: user.id,
              },
              where: { id: complaint.id },
            },
          },
        }),
      },
    });

    console.log('updatedComplaint', updatedComplaint);
    // send mail

    return updatedComplaint;
  }

  async assignComplaint(id: string, { departmentId }: AssignComplaintDto) {
    const complaintExist = await this.prisma.complaint.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!complaintExist) {
      throw new BadRequestException('Complaint not found');
    }

    const departmentExist = await this.prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!departmentExist) {
      throw new BadRequestException('Department not found');
    }

    const updatedComplaint = await this.prisma.complaint.update({
      where: { id },
      data: {
        department: { connect: { id: departmentId } },
      },
    });

    // send mail
    await this.messagingQueue.queueAssignComplaintEmail({
      referenceNo: complaintExist.referenceNo,
      firstName: complaintExist.user?.firstName,
      email: complaintExist.user?.email,
      department: departmentExist.name,
    });
    return updatedComplaint;
  }

  async fetchComplaintSummary(user: User) {
    let whereClause: any = {};

    if (user.userRole === UserRole.USER) {
      whereClause = { userId: user.id };
    } else if (user.userRole === UserRole.STAFF) {
      whereClause = { departmentId: user.departmentId };
    }

    const complaintsSummary = await this.prisma.complaint.groupBy({
      by: ['status', 'departmentId'],
      _count: {
        _all: true,
      },
      where: whereClause,
    });

    const summary = {
      total: 0,
      pending: 0,
      assigned: 0,
      resolved: 0,
      inProgress: 0,
      draft: 0,
    };

    complaintsSummary.forEach((item) => {
      if (item.status === ComplaintStatus.PENDING) {
        summary.pending += item._count._all;
        summary.total += item._count._all;
      } else if (item.status === ComplaintStatus.RESOLVED) {
        summary.resolved += item._count._all;
        summary.total += item._count._all;
      } else if (item.status === ComplaintStatus.IN_PROGRESS) {
        summary.inProgress += item._count._all;
        summary.total += item._count._all;
      } else if (item.status === ComplaintStatus.DRAFT) {
        summary.draft += item._count._all;
        summary.total += item._count._all;
      }

      if (item.departmentId !== null) {
        summary.assigned += item._count._all;
      }
    });

    if (user.userRole === UserRole.USER) {
      return [
        { status: 'Total Complaints', count: summary.total },
        { status: 'Open Complaints', count: summary.pending },
        {
          status: 'Complaints Resolution in Progress',
          count: summary.inProgress,
        },
        // { status: 'Complaints in Draft', count: summary.assigned },
        { status: 'Complaints Resolved', count: summary.resolved },
      ];
    }

    if (user.userRole === UserRole.STAFF) {
      return [
        { status: 'Total Complaints Assigned', count: summary.total },
        { status: 'Open Complaints', count: summary.pending },
        {
          status: 'Complaints Resolution in Progress',
          count: summary.inProgress,
        },
        // { status: 'Complaints in Draft', count: summary.assigned },
        { status: 'Complaints Resolved', count: summary.resolved },
      ];
    }

    return [
      { status: 'Total Complaints', count: summary.total },
      { status: 'Open Complaints', count: summary.pending },
      {
        status: 'Complaints Resolution in Progress',
        count: summary.inProgress,
      },
      // { status: 'Complaints Assigned', count: summary.assigned },
      { status: 'Complaints Resolved', count: summary.resolved },
    ];
  }

  async frequentComplaintStats() {
    const allCategories = await this.prisma.category.findMany({
      select: {
        name: true,
      },
    });

    const defaultCategoryStats = allCategories.map((category) => ({
      category: category.name,
      count: 0,
    }));

    const groupedComplaints = await this.prisma.complaint.groupBy({
      by: ['categoryId'],
      _count: {
        _all: true,
      },
    });

    const complaintStats = await Promise.all(
      groupedComplaints.map(async (complaint) => {
        const category = await this.prisma.category.findUnique({
          where: {
            id: complaint.categoryId,
          },
          select: {
            name: true,
          },
        });

        return {
          name: category?.name || 'Unknown',
          count: complaint._count._all,
        };
      }),
    );

    const finalStats = defaultCategoryStats.map((defaultStat) => {
      const foundStat = complaintStats.find(
        (stat) => stat.name === defaultStat.category,
      );
      return foundStat || defaultStat;
    });

    return finalStats;
  }

  async urgencyLevelStats() {
    const groupedComplaints = await this.prisma.complaint.groupBy({
      by: ['priorityLevel'],
      _count: {
        _all: true,
      },
    });

    const complaintStats = await Promise.all(
      groupedComplaints.map(async (complaint) => {
        const priority =
          PriorityLevel[complaint.priorityLevel as keyof typeof PriorityLevel];
        return {
          name: priority,
          count: complaint._count._all || 0,
        };
      }),
    );

    const allPriorityLevels = Object.values(PriorityLevel).map((level) => ({
      name: level,
      count: 0,
    }));

    const finalStats = allPriorityLevels.map((level) => {
      const found = complaintStats.find((stat) => stat.name === level.name);
      return found || level;
    });

    return finalStats;
  }

  async openComplaintStats() {
    const complaints = await this.prisma.complaint.findMany({
      where: { resolutionTime: null },
      orderBy: { createdAt: 'asc' },
    });

    // Calculate open days
    const currentDate = new Date();
    const complaintsWithOpenDays = complaints.map((complaint) => {
      const openDays = Math.floor(
        (currentDate.getTime() - new Date(complaint.createdAt).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      // return { name: complaint.title, count: openDays };
      return { name: complaint.title, count: `${openDays} days` };
    });

    console.log('complaintsWithOpenDays', complaintsWithOpenDays);
    const openComplaints = complaintsWithOpenDays
      .sort((a: any, b: any) => a.count - b.count)
      .slice(0, 10);

    // const sortedComplaints = openComplaints.sort((a, b) => a.count - b.count);
    const sortedComplaints = openComplaints.sort((a, b) =>
      a.count.localeCompare(b.count),
    );
    return sortedComplaints;
  }

  async addFeedback(
    complaintId: string,
    user: User,
    { rating, comment }: AddFeedbackDto,
  ) {
    const complaintExist = await this.prisma.complaint.findUnique({
      where: { id: complaintId },
    });

    if (!complaintExist) throw new BadRequestException('Complaint not found');

    if (user.userRole == UserRole.USER && complaintExist.userId !== user.id)
      throw new BadRequestException('User cannot give feedback.');

    if (
      complaintExist.status !== ComplaintStatus.RESOLVED &&
      complaintExist.status !== ComplaintStatus.CLOSED
    )
      throw new BadRequestException('Feedbacks not allowed');

    const feedback = await this.prisma.feedback.create({
      data: {
        complaintId: complaintExist.id,
        comment: comment,
        rating: rating,
        userId: user.id,
        createdBy: user.id,
      },
    });
    return feedback;
  }
}
