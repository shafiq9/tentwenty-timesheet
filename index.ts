export interface TimesheetEntry {
  id: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  hoursWorked?: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTimesheetDTO {
  weekNumber: number;
  startDate: string;
  endDate: string;
  hoursWorked: number;
  description: string;
}

export interface UpdateTimesheetDTO extends Partial<CreateTimesheetDTO> {
  status?: 'pending' | 'approved' | 'rejected';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}