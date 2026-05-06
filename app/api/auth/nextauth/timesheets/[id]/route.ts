import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../[...nextauth]/route';
import { UpdateTimesheetDTO, ApiResponse, TimesheetEntry } from '@/types';

declare global {
  var timesheets: TimesheetEntry[] | undefined;
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
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
    const index = timesheets.findIndex(ts => ts.id === id);
    
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
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' } as ApiResponse<never>,
      { status: 401 }
    );
  }

  const timesheets = global.timesheets || [];
  const index = timesheets.findIndex(ts => ts.id === id);
  
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