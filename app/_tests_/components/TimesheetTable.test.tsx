import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TimesheetTable from '@/components/TimesheetTable';
import { TimesheetEntry } from '@/types';

const mockTimesheets: TimesheetEntry[] = [
  {
    id: '1',
    weekNumber: 1,
    startDate: '2025-01-01',
    endDate: '2025-01-07',
    status: 'pending',
    hoursWorked: 40,
    description: 'Test work',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  },
  {
    id: '2',
    weekNumber: 2,
    startDate: '2025-01-08',
    endDate: '2025-01-14',
    status: 'approved',
    hoursWorked: 35,
    description: 'More work',
    createdAt: '2025-01-08',
    updatedAt: '2025-01-08',
  },
];

describe('TimesheetTable', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    render(
      <TimesheetTable
        timesheets={mockTimesheets}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
  });

  it('renders timesheet entries correctly', () => {
    expect(screen.getByText('Week 1')).toBeInTheDocument();
    expect(screen.getByText('Week 2')).toBeInTheDocument();
    expect(screen.getByText('40h')).toBeInTheDocument();
    expect(screen.getByText('35h')).toBeInTheDocument();
  });

  it('displays status badges', () => {
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const editButtons = screen.getAllByRole('button');
    fireEvent.click(editButtons[0]);
    expect(mockOnEdit).toHaveBeenCalledWith(mockTimesheets[0]);
  });

  it('calls onDelete when delete button is clicked', () => {
    const deleteButtons = screen.getAllByRole('button');
    fireEvent.click(deleteButtons[1]);
    expect(mockOnDelete).toHaveBeenCalledWith(mockTimesheets[0].id);
  });
});