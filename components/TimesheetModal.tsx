'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TimesheetEntry } from '@/types';

const timesheetSchema = z.object({
  weekNumber: z.number()
    .min(1, 'Week number must be at least 1')
    .max(52, 'Week number cannot exceed 52'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  hoursWorked: z.number()
    .min(0, 'Hours must be at least 0')
    .max(168, 'Hours cannot exceed 168'),
  description: z.string().optional(),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end >= start;
}, {
  message: 'End date must be after or equal to start date',
  path: ['endDate'],
});

type TimesheetFormData = z.infer<typeof timesheetSchema>;

interface TimesheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingEntry?: TimesheetEntry | null;
}

export default function TimesheetModal({
  isOpen,
  onClose,
  onSuccess,
  editingEntry,
}: TimesheetModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TimesheetFormData>({
    resolver: zodResolver(timesheetSchema),
    defaultValues: {
      weekNumber: 1,
      hoursWorked: 40,
      description: '',
    },
  });

  useEffect(() => {
    if (editingEntry) {
      reset({
        weekNumber: editingEntry.weekNumber,
        startDate: editingEntry.startDate,
        endDate: editingEntry.endDate,
        hoursWorked: editingEntry.hoursWorked || 40,
        description: editingEntry.description || '',
      });
    } else {
      reset({
        weekNumber: 1,
        hoursWorked: 40,
        description: '',
      });
    }
  }, [editingEntry, reset]);

  const onSubmit = async (data: TimesheetFormData) => {
    try {
      const url = editingEntry
        ? `/api/auth/nextauth/timesheets/${editingEntry.id}`
        : '/api/auth/nextauth/timesheets';
      const method = editingEntry ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess();
      } else {
        alert(result.error || 'Failed to save timesheet entry');
      }
    } catch (error) {
      console.error('Error saving timesheet:', error);
      alert('An error occurred while saving');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="px-6 pt-6 pb-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              {editingEntry ? 'Edit Timesheet Entry' : 'Add New Timesheet Entry'}
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Week Number *
                </label>
                <input
                  type="number"
                  {...register('weekNumber', { valueAsNumber: true })}
                  className="input-field"
                  placeholder="1-52"
                />
                {errors.weekNumber && (
                  <p className="mt-1 text-xs text-red-600">{errors.weekNumber.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  {...register('startDate')}
                  className="input-field"
                />
                {errors.startDate && (
                  <p className="mt-1 text-xs text-red-600">{errors.startDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  {...register('endDate')}
                  className="input-field"
                />
                {errors.endDate && (
                  <p className="mt-1 text-xs text-red-600">{errors.endDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hours Worked
                </label>
                <input
                  type="number"
                  {...register('hoursWorked', { valueAsNumber: true })}
                  className="input-field"
                  placeholder="0-168"
                />
                {errors.hoursWorked && (
                  <p className="mt-1 text-xs text-red-600">{errors.hoursWorked.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="input-field"
                  placeholder="Brief description of work completed..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary disabled:opacity-50"
                >
                  {isSubmitting
                    ? 'Saving...'
                    : editingEntry
                    ? 'Update'
                    : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}