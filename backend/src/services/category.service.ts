import prisma from '../config/prisma';
import { ApiError } from '../utils/apiError';
import { CreateCategoryInput, UpdateCategoryInput } from '../validation/category.schema';

export const listCategories = (userId: string) => {
  return prisma.category.findMany({ where: { userId }, orderBy: { name: 'asc' } });
};

export const createCategory = async (userId: string, input: CreateCategoryInput) => {
  const existing = await prisma.category.findUnique({
    where: { userId_name: { userId, name: input.name } },
  });
  if (existing) {
    throw ApiError.conflict('A category with this name already exists');
  }

  return prisma.category.create({ data: { userId, name: input.name, color: input.color } });
};

const getOwnedCategory = async (userId: string, id: string) => {
  const category = await prisma.category.findFirst({ where: { id, userId } });
  if (!category) {
    throw ApiError.notFound('Category not found');
  }
  return category;
};

export const updateCategory = async (userId: string, id: string, input: UpdateCategoryInput) => {
  await getOwnedCategory(userId, id);
  return prisma.category.update({ where: { id }, data: input });
};

export const deleteCategory = async (userId: string, id: string) => {
  await getOwnedCategory(userId, id);

  const usedByExpense = await prisma.expense.findFirst({ where: { categoryId: id } });
  if (usedByExpense) {
    throw ApiError.conflict('Cannot delete a category that has expenses linked to it');
  }

  await prisma.$transaction([
    prisma.budget.deleteMany({ where: { categoryId: id } }),
    prisma.category.delete({ where: { id } }),
  ]);
};
