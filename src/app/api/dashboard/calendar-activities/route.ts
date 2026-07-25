import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth';
import { getDb, ensureDbInit } from '@/src/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { error, user } = authenticate(req);
    if (error) return error;

    await ensureDbInit();
    const db = getDb();

    // Get unique dates with activities (bazaar or meals)
    const activityDates = new Set<string>();
    
    db.bazaarExpenses.forEach(exp => activityDates.add(exp.date));
    db.bazaarAssignments.forEach(assign => activityDates.add(assign.date));
    db.records.forEach(rec => activityDates.add(rec.date));

    // For each date, aggregate activities
    const activitiesByDate = Array.from(activityDates).reduce((acc, date) => {
      // Bazaar activities for this date (show all members who did bazaar)
      const bazaarExpenses = db.bazaarExpenses.filter(
        exp => exp.date === date && exp.status === 'approved'
      );

      const bazaarData = bazaarExpenses.map(exp => {
        const userData = db.users.find(u => u.id === exp.userId);
        const itemsInfo = exp.items.map(i => `${i.name} (₹${i.cost})`).join(', ');
        return {
          userId: exp.userId,
          userName: userData?.name || 'Unknown',
          totalCost: exp.totalCost,
          items: itemsInfo,
          status: exp.status,
        };
      });

      // Meal records for this date
      const mealRecords = db.records.filter(r => r.date === date);
      const mealSummary = {
        totalMeals: mealRecords.reduce((sum, r) => sum + r.count, 0),
        lunch: mealRecords.filter(r => r.mealType === 'lunch').reduce((sum, r) => sum + r.count, 0),
        dinner: mealRecords.filter(r => r.mealType === 'dinner').reduce((sum, r) => sum + r.count, 0),
      };

      acc[date] = {
        date,
        dayName: new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' }),
        bazaarCount: bazaarData.length,
        bazaarDetails: bazaarData,
        totalBazaarCost: bazaarData.reduce((sum, b) => sum + b.totalCost, 0),
        mealSummary,
      };

      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      activitiesByDate,
      datesWithActivity: Array.from(activityDates).sort(),
    });
  } catch (error) {
    console.error('Calendar activities fetch error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
