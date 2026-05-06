import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../[...nextauth]/route';
import { TimesheetEntry, CreateTimesheetDTO, ApiResponse } from '@/types';

// In-memory storage (replace with database in production)
let timesheets: TimesheetEntry[] = [];

// Helper to generate mock data
function generateMockData() {
  if (timesheets.length === 0) {
    const weeks = [1, 2, 3, 4];
    const statuses: Array<'pending' | 'approved' | 'rejected'> = ['pending', 'approved', 'rejected'];
    
    weeks.forEach((week, index) => {
      const startDate = new Date(2025, 0, 1 + (week - 1) * 7);
      const endDate = new Date(2025, 0, 7 + (week - 1) * 7);
      
      timesheets.push({
        id: `ts-${week}`,
        weekNumber: week,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        status: statuses[index % 3],
        hoursWorked: 40,
        description: `Work completed for week ${week}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' } as ApiResponse<never>,
      { status: 401 }
    );
  }

  generateMockData();
  
  return NextResponse.json({
    success: true,
    data: timesheets,
  } as ApiResponse<TimesheetEntry[]>);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' } as ApiResponse<never>,
      { status: 401 }
    );
  }

  try {
    const body: CreateTimesheetDTO = await request.json();
    
    // Validation
    if (!body.weekNumber || !body.startDate || !body.endDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' } as ApiResponse<never>,
        { status: 400 }
      );
    }

    const newEntry: TimesheetEntry = {
      id: `ts-${Date.now()}`,
      weekNumber: body.weekNumber,
      startDate: body.startDate,
      endDate: body.endDate,
      status: 'pending',
      hoursWorked: body.hoursWorked,
      description: body.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    timesheets.push(newEntry);
    
    return NextResponse.json({
      success: true,
      data: newEntry,
      message: 'Timesheet entry created successfully',
    } as ApiResponse<TimesheetEntry>, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' } as ApiResponse<never>,
      { status: 400 }
    );
  }
}