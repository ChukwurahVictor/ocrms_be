import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Online Complaint Registration and Management System (OCRMS)';
  }
}
