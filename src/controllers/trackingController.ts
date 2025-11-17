import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth';

const getTodayDate = (): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const getLast7Days = (): Date[] => {
  const dates: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    dates.push(date);
  }
  return dates;
};

const calculateStreak = (logs: { date: Date }[]): number => {
  if (logs.length === 0) return 0;

  const sortedDates = logs
    .map(log => new Date(log.date))
    .sort((a, b) => b.getTime() - a.getTime());

  let streak = 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mostRecent = new Date(sortedDates[0]);
  mostRecent.setHours(0, 0, 0, 0);

  const oneDayMs = 24 * 60 * 60 * 1000;
  const daysSinceLastLog = Math.floor((today.getTime() - mostRecent.getTime()) / oneDayMs);

  if (daysSinceLastLog > 1) {
    return 0;
  }

  for (let i = 1; i < sortedDates.length; i++) {
    const current = new Date(sortedDates[i]);
    current.setHours(0, 0, 0, 0);
    const previous = new Date(sortedDates[i - 1]);
    previous.setHours(0, 0, 0, 0);

    const dayDiff = Math.floor((previous.getTime() - current.getTime()) / oneDayMs);

    if (dayDiff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

export const trackHabit = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const habit = await prisma.habit.findFirst({
    where: {
      id,
      userId: req.userId,
    },
  });

  if (!habit) {
    throw new ApiError(404, 'Habit not found');
  }

  const today = getTodayDate();

  const existingLog = await prisma.habitLog.findUnique({
    where: {
      habitId_date: {
        habitId: id,
        date: today,
      },
    },
  });

  if (existingLog) {
    throw new ApiError(400, 'Habit already tracked for today');
  }

  const log = await prisma.habitLog.create({
    data: {
      habitId: id,
      date: today,
    },
  });

  return ApiResponse.success(res, log, 'Habit tracked successfully', 201);
};

export const getHabitHistory = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const habit = await prisma.habit.findFirst({
    where: {
      id,
      userId: req.userId,
    },
  });

  if (!habit) {
    throw new ApiError(404, 'Habit not found');
  }

  const last7Days = getLast7Days();
  const startDate = last7Days[0];

  const logs = await prisma.habitLog.findMany({
    where: {
      habitId: id,
      date: {
        gte: startDate,
      },
    },
    orderBy: {
      date: 'desc',
    },
  });

  const allLogs = await prisma.habitLog.findMany({
    where: { habitId: id },
    orderBy: { date: 'desc' },
  });

  const streak = calculateStreak(allLogs);

  const history = last7Days.map(date => {
    const log = logs.find(
      l => new Date(l.date).getTime() === date.getTime()
    );
    return {
      date: date.toISOString().split('T')[0],
      completed: !!log,
    };
  });

  return ApiResponse.success(res, {
    history,
    streak,
  });
};
