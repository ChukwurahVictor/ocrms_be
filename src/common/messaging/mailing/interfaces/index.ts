export enum Template {
  passwordResetEmail = 'passwordResetEmail',
  welcomeUserEmail = 'welcomeUserEmail',
  createStaffEmail = 'createStaffEmail',
  complaintAssignmentEmail = 'complaintAssignmentEmail',
  createComplaintEmail = 'createComplaintEmail',
}

export interface ISendEmail {
  email: string;
  firstName: string;
  template?: Template;
  subject?: string;
  password?: string;
}

export interface IResetPassword extends ISendEmail {
  link: string;
}

export interface IWelcomeEmail extends ISendEmail {
  email: string;
}

export interface IAssignEmail extends ISendEmail {
  referenceNo: string;
  department: string;
}

export interface ICreateEmail extends ISendEmail {
  referenceNo: string;
}
