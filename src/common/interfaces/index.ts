export enum ResponseMessage {
  SUCCESS = 'Request Successful',
  FAILED = 'Request Failed',
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export enum UserRole {
  ADMIN = 'Admin',
  STAFF = 'Staff',
  USER = 'User',
  SUPER_ADMIN = 'Super_Admin',
}

export enum ComplaintStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In_progress',
  RESOLVED = 'Resolved',
  CLOSED = 'Closed',
  ESCALATED = 'Escalated',
  DRAFT = 'Draft',
  ARCHIVED = 'Archived',
}
