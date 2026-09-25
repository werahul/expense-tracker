import { Currency } from '@prisma/client';
import ExcelJS from 'exceljs';
import prisma from '../config/prisma';

interface ExpenseRow {
  date: Date;
  category: string;
  description: string | null;
  amount: number;
  currency: Currency;
}

const fetchExpenseRows = async (
  userId: string,
  year: number,
  month: number | undefined,
  currency: Currency
): Promise<ExpenseRow[]> => {
  const rangeStart = month ? new Date(year, month - 1, 1) : new Date(year, 0, 1);
  const rangeEnd = month ? new Date(year, month, 1) : new Date(year + 1, 0, 1);

  const expenses = await prisma.expense.findMany({
    where: { userId, currency, date: { gte: rangeStart, lt: rangeEnd } },
    include: { category: true },
    orderBy: { date: 'asc' },
  });

  return expenses.map((e) => ({
    date: e.date,
    category: e.category.name,
    description: e.description,
    amount: Number(e.amount),
    currency: e.currency,
  }));
};

export const getMonthlyReport = async (userId: string, year: number, month: number, currency: Currency) => {
  const rows = await fetchExpenseRows(userId, year, month, currency);

  const byDay = new Map<number, number>();
  const byCategory = new Map<string, number>();

  for (const row of rows) {
    const day = row.date.getDate();
    byDay.set(day, (byDay.get(day) ?? 0) + row.amount);
    byCategory.set(row.category, (byCategory.get(row.category) ?? 0) + row.amount);
  }

  return {
    year,
    month,
    currency,
    total: rows.reduce((sum, r) => sum + r.amount, 0),
    byDay: Array.from(byDay.entries()).map(([day, total]) => ({ day, total })),
    byCategory: Array.from(byCategory.entries()).map(([category, total]) => ({ category, total })),
  };
};

export const getYearlyReport = async (userId: string, year: number, currency: Currency) => {
  const rows = await fetchExpenseRows(userId, year, undefined, currency);

  const byMonth = new Map<number, number>();
  const byCategory = new Map<string, number>();

  for (const row of rows) {
    const monthIndex = row.date.getMonth() + 1;
    byMonth.set(monthIndex, (byMonth.get(monthIndex) ?? 0) + row.amount);
    byCategory.set(row.category, (byCategory.get(row.category) ?? 0) + row.amount);
  }

  return {
    year,
    currency,
    total: rows.reduce((sum, r) => sum + r.amount, 0),
    byMonth: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, total: byMonth.get(i + 1) ?? 0 })),
    byCategory: Array.from(byCategory.entries()).map(([category, total]) => ({ category, total })),
  };
};

const toCsv = (rows: ExpenseRow[]): string => {
  const header = 'Date,Category,Description,Amount,Currency';
  const lines = rows.map((r) => {
    const desc = (r.description ?? '').replace(/"/g, '""');
    return `${r.date.toISOString().slice(0, 10)},"${r.category}","${desc}",${r.amount.toFixed(2)},${r.currency}`;
  });
  return [header, ...lines].join('\n');
};

const toXlsx = async (rows: ExpenseRow[]): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Expenses');

  sheet.columns = [
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Description', key: 'description', width: 32 },
    { header: 'Amount', key: 'amount', width: 14 },
    { header: 'Currency', key: 'currency', width: 10 },
  ];

  rows.forEach((row) => {
    sheet.addRow({
      date: row.date.toISOString().slice(0, 10),
      category: row.category,
      description: row.description ?? '',
      amount: row.amount,
      currency: row.currency,
    });
  });

  sheet.getRow(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
};

export const buildExport = async (
  userId: string,
  year: number,
  month: number | undefined,
  format: 'csv' | 'xlsx',
  currency: Currency
) => {
  const rows = await fetchExpenseRows(userId, year, month, currency);

  if (format === 'xlsx') {
    return { buffer: await toXlsx(rows), contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
  }

  return { buffer: Buffer.from(toCsv(rows)), contentType: 'text/csv' };
};
