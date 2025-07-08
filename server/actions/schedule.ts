'use server';
import { db } from '@/db';
import { scheduleAvailabilitiesTable, schedulesTable } from '@/db/schema';
import { ScheduleWithAvailabilities } from '@/lib/types/schedule';
import { ScheduleFormData, scheduleFormSchema } from '@/validations/schedule';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

export const getUserSchedule = async (
  userId: string
): Promise<ScheduleWithAvailabilities | undefined> => {
  return db.query.schedulesTable.findFirst({
    where({ clerkUserId }, { eq }) {
      return eq(clerkUserId, userId);
    },
    with: {
      availabilities: true,
    },
    orderBy: (schedules, { desc }) => {
      return desc(schedules.createdAt);
    },
  });
};

export const saveUserSchedule = async (
  unsafeScheduleData: ScheduleFormData
) => {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    return redirectToSignIn();
  }
  const { success, data, error } =
    scheduleFormSchema.safeParse(unsafeScheduleData);
  if (!success || error) {
    return {
      success: false,
      error: error ? error.message : 'Invalid schedule data',
      fieldErrors: error?.flatten().fieldErrors,
    };
  }
  const { availabilities, ...scheduleData } = data;

  await db.transaction(async tx => {
    const [schedule] = await tx
      .insert(schedulesTable)
      .values({
        ...scheduleData,
        clerkUserId: userId,
      })
      .onConflictDoUpdate({
        target: schedulesTable.clerkUserId,
        set: {
          ...scheduleData,
          updatedAt: new Date(),
        },
      })
      .returning({
        id: schedulesTable.id,
      });

    if (availabilities && availabilities.length > 0) {
      await tx
        .delete(scheduleAvailabilitiesTable)
        .where(eq(scheduleAvailabilitiesTable.scheduleId, schedule.id));

      const availabilityValues = availabilities.map(availability => {
        const today = new Date();
        const [startHour, startMinute] = availability.startTime
          .split(':')
          .map(Number);
        const [endHour, endMinute] = availability.endTime
          .split(':')
          .map(Number);

        const startTime = new Date(today);
        startTime.setHours(startHour, startMinute, 0, 0);

        const endTime = new Date(today);
        endTime.setHours(endHour, endMinute, 0, 0);

        return {
          scheduleId: schedule.id,
          dayOfWeek: availability.dayOfWeek,
          startTime,
          endTime,
        };
      });

      await tx.insert(scheduleAvailabilitiesTable).values(availabilityValues);
    }
  });
  return {
    success: true,
    message: 'User schedule saved successfully',
  };
};
