export const QUEUE = 'messaging:';

export enum JOBS {
  QUEUE_EMAIL = 'queueEmail',
  QUEUE_WELCOME_EMAIL = 'queueWelcomeEmail',
  QUEUE_RESET_TOKEN_EMAIL = 'queueResetTokenEmail',
  SEND_EMAIL = 'sendEmail',
  QUEUE_CREATE_STAFF_EMAIL = 'queueCreateStaffEmail',
  QUEUE_ASSIGN_COMPLAINT_EMAIL = 'queueAssignComplaintEmail',
  QUEUE_CREATE_COMPLAINT_EMAIL = 'queueCreateComplaintEmail',
}
