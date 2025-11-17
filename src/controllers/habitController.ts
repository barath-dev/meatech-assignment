import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth';
import { validationResult } from 'express-validator';

export const createHabit = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { title, description, frequency, tags, reminderTime } = req.body;

  const habit = await prisma.habit.create({
    data: {
      title,
      description,
      frequency,
      tags: tags || [],
      reminderTime,
      userId: req.userId!,
    },
  });

  return ApiResponse.success(res, habit, 'Habit created successfully', 201);
};

export const getHabits = async (req: AuthRequest, res: Response) => {
  const { tag, page = '1', limit = '10' } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = { userId: req.userId };

  if (tag) {
    where.tags = { has: tag };
  }

  const [habits, total] = await Promise.all([
    prisma.habit.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.habit.count({ where }),
  ]);

  return ApiResponse.success(res, {
    habits,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
};

export const getHabit = async (req: AuthRequest, res: Response) => {
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

  return ApiResponse.success(res, habit);
};

export const updateHabit = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { id } = req.params;
  const { title, description, frequency, tags, reminderTime } = req.body;

  const habit = await prisma.habit.findFirst({
    where: {
      id,
      userId: req.userId,
    },
  });

  if (!habit) {
    throw new ApiError(404, 'Habit not found');
  }

  const updatedHabit = await prisma.habit.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(frequency !== undefined && { frequency }),
      ...(tags !== undefined && { tags }),
      ...(reminderTime !== undefined && { reminderTime }),
    },
  });

  return ApiResponse.success(res, updatedHabit, 'Habit updated successfully');
};

export const deleteHabit = async (req: AuthRequest, res: Response) => {
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

  await prisma.habit.delete({
    where: { id },
  });

  return ApiResponse.success(res, null, 'Habit deleted successfully');
};
