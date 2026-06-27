import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { StatusCodes } from "http-status-codes";

const paginate = (query: { page?: number; limit?: number }) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    return { page, limit, skip: (page - 1) * limit, meta: (total: number) => ({ page, limit, total, totalPages: Math.ceil(total / limit) }) };
};

const formatHead = (h: { id: string; name: string; description: string }) => ({
    id: h.id,
    ID: h.id,
    incomeheadname: h.name,
    expenseheadname: h.name,
    name: h.name,
    description: h.description,
});

const formatIncomeEntry = (e: {
    id: string; amount: { toString: () => string }; note: string; date: Date;
    head: { name: string };
}) => ({
    id: e.id,
    ID: e.id,
    incomeHeadName: e.head.name,
    amount: Number(e.amount),
    note: e.note,
    date: e.date.toLocaleDateString("en-GB"),
    dateISO: e.date.toISOString(),
    headId: (e as { headId?: string }).headId,
});

const formatExpenseEntry = (e: {
    id: string; amount: { toString: () => string }; note: string; date: Date;
    head: { name: string };
}) => ({
    id: e.id,
    ID: e.id,
    expenseHeadName: e.head.name,
    amount: Number(e.amount),
    note: e.note,
    date: e.date.toLocaleDateString("en-GB"),
    dateISO: e.date.toISOString(),
    headId: (e as { headId?: string }).headId,
});

// ─── Income Heads ─────────────────────────────────────────────────────────────

const listIncomeHeads = async (query: { search?: string; page?: number; limit?: number }) => {
    const { page, limit, skip, meta } = paginate(query);
    const where = {
        isDeleted: false,
        ...(query.search ? { name: { contains: query.search, mode: "insensitive" as const } } : {}),
    };
    const [rows, total] = await Promise.all([
        prisma.incomeHead.findMany({ where, orderBy: { name: "asc" }, skip, take: limit }),
        prisma.incomeHead.count({ where }),
    ]);
    return { data: rows.map(formatHead), meta: meta(total) };
};

const getIncomeHeadById = async (id: string) => {
    const row = await prisma.incomeHead.findFirst({ where: { id, isDeleted: false } });
    if (!row) throw new AppError(StatusCodes.NOT_FOUND, "Income head not found");
    return formatHead(row);
};

const createIncomeHead = async (payload: { name: string; description?: string }) =>
    formatHead(await prisma.incomeHead.create({ data: { name: payload.name, description: payload.description ?? "" } }));

const updateIncomeHead = async (id: string, payload: { name?: string; description?: string }) => {
    await getIncomeHeadById(id);
    return formatHead(await prisma.incomeHead.update({ where: { id }, data: payload }));
};

const deleteIncomeHead = async (id: string) => {
    await getIncomeHeadById(id);
    return prisma.incomeHead.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } });
};

// ─── Income Entries ───────────────────────────────────────────────────────────

const listIncomeEntries = async (query: { search?: string; headId?: string; from?: string; to?: string; page?: number; limit?: number }) => {
    const { page, limit, skip, meta } = paginate(query);
    const where = {
        isDeleted: false,
        ...(query.headId ? { headId: query.headId } : {}),
        ...(query.from || query.to ? {
            date: {
                ...(query.from ? { gte: new Date(query.from) } : {}),
                ...(query.to ? { lte: new Date(query.to) } : {}),
            },
        } : {}),
        ...(query.search ? {
            OR: [
                { note: { contains: query.search, mode: "insensitive" as const } },
                { head: { name: { contains: query.search, mode: "insensitive" as const } } },
            ],
        } : {}),
    };
    const [rows, total] = await Promise.all([
        prisma.incomeEntry.findMany({ where, include: { head: true }, orderBy: { date: "desc" }, skip, take: limit }),
        prisma.incomeEntry.count({ where }),
    ]);
    return { data: rows.map((r) => ({ ...formatIncomeEntry(r), headId: r.headId })), meta: meta(total) };
};

const getIncomeEntryById = async (id: string) => {
    const row = await prisma.incomeEntry.findFirst({ where: { id, isDeleted: false }, include: { head: true } });
    if (!row) throw new AppError(StatusCodes.NOT_FOUND, "Income entry not found");
    return { ...formatIncomeEntry(row), headId: row.headId };
};

const createIncomeEntry = async (payload: { headId: string; amount: number; note?: string; date: string }) => {
    const row = await prisma.incomeEntry.create({
        data: {
            headId: payload.headId,
            amount: payload.amount,
            note: payload.note ?? "",
            date: new Date(payload.date),
        },
        include: { head: true },
    });
    return { ...formatIncomeEntry(row), headId: row.headId };
};

const updateIncomeEntry = async (id: string, payload: Partial<{ headId: string; amount: number; note: string; date: string }>) => {
    const row = await prisma.incomeEntry.update({
        where: { id },
        data: {
            ...payload,
            ...(payload.date ? { date: new Date(payload.date) } : {}),
        },
        include: { head: true },
    });
    return { ...formatIncomeEntry(row), headId: row.headId };
};

const deleteIncomeEntry = async (id: string) =>
    prisma.incomeEntry.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } });

// ─── Expense Heads ────────────────────────────────────────────────────────────

const listExpenseHeads = async (query: { search?: string; page?: number; limit?: number }) => {
    const { page, limit, skip, meta } = paginate(query);
    const where = {
        isDeleted: false,
        ...(query.search ? { name: { contains: query.search, mode: "insensitive" as const } } : {}),
    };
    const [rows, total] = await Promise.all([
        prisma.expenseHead.findMany({ where, orderBy: { name: "asc" }, skip, take: limit }),
        prisma.expenseHead.count({ where }),
    ]);
    return { data: rows.map(formatHead), meta: meta(total) };
};

const getExpenseHeadById = async (id: string) => {
    const row = await prisma.expenseHead.findFirst({ where: { id, isDeleted: false } });
    if (!row) throw new AppError(StatusCodes.NOT_FOUND, "Expense head not found");
    return formatHead(row);
};

const createExpenseHead = async (payload: { name: string; description?: string }) =>
    formatHead(await prisma.expenseHead.create({ data: { name: payload.name, description: payload.description ?? "" } }));

const updateExpenseHead = async (id: string, payload: { name?: string; description?: string }) => {
    await getExpenseHeadById(id);
    return formatHead(await prisma.expenseHead.update({ where: { id }, data: payload }));
};

const deleteExpenseHead = async (id: string) => {
    await getExpenseHeadById(id);
    return prisma.expenseHead.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } });
};

// ─── Expense Entries ──────────────────────────────────────────────────────────

const listExpenseEntries = async (query: { search?: string; headId?: string; from?: string; to?: string; page?: number; limit?: number }) => {
    const { page, limit, skip, meta } = paginate(query);
    const where = {
        isDeleted: false,
        ...(query.headId ? { headId: query.headId } : {}),
        ...(query.from || query.to ? {
            date: {
                ...(query.from ? { gte: new Date(query.from) } : {}),
                ...(query.to ? { lte: new Date(query.to) } : {}),
            },
        } : {}),
        ...(query.search ? {
            OR: [
                { note: { contains: query.search, mode: "insensitive" as const } },
                { head: { name: { contains: query.search, mode: "insensitive" as const } } },
            ],
        } : {}),
    };
    const [rows, total] = await Promise.all([
        prisma.expenseEntry.findMany({ where, include: { head: true }, orderBy: { date: "desc" }, skip, take: limit }),
        prisma.expenseEntry.count({ where }),
    ]);
    return { data: rows.map((r) => ({ ...formatExpenseEntry(r), headId: r.headId })), meta: meta(total) };
};

const getExpenseEntryById = async (id: string) => {
    const row = await prisma.expenseEntry.findFirst({ where: { id, isDeleted: false }, include: { head: true } });
    if (!row) throw new AppError(StatusCodes.NOT_FOUND, "Expense entry not found");
    return { ...formatExpenseEntry(row), headId: row.headId };
};

const createExpenseEntry = async (payload: { headId: string; amount: number; note?: string; date: string }) => {
    const row = await prisma.expenseEntry.create({
        data: {
            headId: payload.headId,
            amount: payload.amount,
            note: payload.note ?? "",
            date: new Date(payload.date),
        },
        include: { head: true },
    });
    return { ...formatExpenseEntry(row), headId: row.headId };
};

const updateExpenseEntry = async (id: string, payload: Partial<{ headId: string; amount: number; note: string; date: string }>) => {
    const row = await prisma.expenseEntry.update({
        where: { id },
        data: {
            ...payload,
            ...(payload.date ? { date: new Date(payload.date) } : {}),
        },
        include: { head: true },
    });
    return { ...formatExpenseEntry(row), headId: row.headId };
};

const deleteExpenseEntry = async (id: string) =>
    prisma.expenseEntry.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } });

export const FinanceService = {
    listIncomeHeads, getIncomeHeadById, createIncomeHead, updateIncomeHead, deleteIncomeHead,
    listIncomeEntries, getIncomeEntryById, createIncomeEntry, updateIncomeEntry, deleteIncomeEntry,
    listExpenseHeads, getExpenseHeadById, createExpenseHead, updateExpenseHead, deleteExpenseHead,
    listExpenseEntries, getExpenseEntryById, createExpenseEntry, updateExpenseEntry, deleteExpenseEntry,
};
