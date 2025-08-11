import { getDbInstance } from '@/db';
import { BookingsTable, eventsTable } from '@/db/schema';
import { startOfWeek } from 'date-fns';
import { and, eq, gte, sql } from 'drizzle-orm';

export async function getUserStats(clerkUserId: string) {
  const db = getDbInstance();

  try {
    const totalStats = await db
      .select({
        totalBookings: sql`sum(${eventsTable.totalBookings})`.as(
          'totalBookings'
        ),
        totalHours: sql`sum(${eventsTable.totalHours})`.as('totalHours'),
      })
      .from(eventsTable)
      .where(eq(eventsTable.clerkUserId, clerkUserId));

    const thisWeekStart = startOfWeek(new Date());
    const thisWeekBookings = await db
      .select({
        count: sql`count(*)`.as('count'),
        hours: sql`sum(${BookingsTable.duration}) / 60`.as('hours'),
      })
      .from(BookingsTable)
      .where(
        and(
          eq(BookingsTable.userClerkId, clerkUserId),
          gte(BookingsTable.createdAt, thisWeekStart),
          eq(BookingsTable.status, 'confirmed')
        )
      );
    const eventsCount = await db
      .select({
        count: sql`count(*)`.as('count'),
      })
      .from(eventsTable)
      .where(eq(eventsTable.clerkUserId, clerkUserId));
    return {
      totalBookings: Number(totalStats[0]?.totalBookings || 0),
      totalHours: Number(totalStats[0]?.totalHours || 0),
      weeklyBookings: Number(thisWeekBookings[0]?.count || 0),
      activeEvents: Number(eventsCount[0]?.count || 0),
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      totalBookings: 0,
      totalHours: 0,
      weeklyBookings: 0,
      weeklyHours: 0,
    };
  }
}
