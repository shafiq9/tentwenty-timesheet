import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { UpdateTimesheetDTO, ApiResponse, TimesheetEntry } from '@/types';

// In-memory storage reference
declare global {
  var timesheets: TimesheetEntry[];
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' } as ApiResponse<never>,
      { status: 401 }
    );
  }

  try {
    const body: UpdateTimesheetDTO = await request.json();
    const timesheets = global.timesheets || [];
    const index = timesheets.findIndex(ts => ts.id === params.id);
    
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Timesheet entry not found' } as ApiResponse<never>,
        { status: 404 }
      );
    }

    timesheets[index] = {
      ...timesheets[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    
    return NextResponse.json({
      success: true,
      data: timesheets[index],
      message: 'Timesheet entry updated successfully',
    } as ApiResponse<TimesheetEntry>);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' } as ApiResponse<never>,
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' } as ApiResponse<never>,
      { status: 401 }
    );
  }

  const timesheets = global.timesheets || [];
  const index = timesheets.findIndex(ts => ts.id === params.id);
  
  if (index === -1) {
    return NextResponse.json(
      { success: false, error: 'Timesheet entry not found' } as ApiResponse<never>,
      { status: 404 }
    );
  }

  timesheets.splice(index, 1);
  
  return NextResponse.json({
    success: true,
    message: 'Timesheet entry deleted successfully',
  } as ApiResponse<never>);
}