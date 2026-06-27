import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { StatusCodes } from "http-status-codes";

const paginate = (query: { page?: number; limit?: number }) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    return { page, limit, skip: (page - 1) * limit, meta: (total: number) => ({ page, limit, total, totalPages: Math.ceil(total / limit) }) };
};

const formatEntry = (entry: {
    id: string;
    guestName: string;
    phoneNo: string;
    totalDueAmount: { toString: () => string };
    paymentMethod: string;
    payAmount: { toString: () => string };
    date: Date;
}) => ({
    id: entry.id,
    guestName: entry.guestName,
    phoneNo: entry.phoneNo,
    totalDueAmount: Number(entry.totalDueAmount),
    paymentMethod: entry.paymentMethod,
    payAmount: Number(entry.payAmount),
    date: entry.date.toISOString(),
});

const listEntries = async (query: { search?: string; page?: number; limit?: number }) => {
    const { page, limit, skip, meta } = paginate(query);
    const where = {
        isDeleted: false,
        ...(query.search ? {
            OR: [
                { guestName: { contains: query.search, mode: "insensitive" as const } },
                { phoneNo: { contains: query.search, mode: "insensitive" as const } },
                { paymentMethod: { contains: query.search, mode: "insensitive" as const } },
            ],
        } : {}),
    };
    const [rows, total] = await Promise.all([
        prisma.guestDue.findMany({ where, orderBy: { date: "desc" }, skip, take: limit }),
        prisma.guestDue.count({ where }),
    ]);
    return { data: rows.map(formatEntry), meta: meta(total) };
};

const getEntryById = async (id: string) => {
    const row = await prisma.guestDue.findFirst({ where: { id, isDeleted: false } });
    if (!row) throw new AppError(StatusCodes.NOT_FOUND, "Due entry not found");
    return formatEntry(row);
};

const createEntry = async (payload: {
    guestName: string;
    phoneNo?: string;
    totalDueAmount: number;
    paymentMethod?: string;
    payAmount?: number;
    date: string;
}) => {
    const row = await prisma.guestDue.create({
        data: {
            guestName: payload.guestName,
            phoneNo: payload.phoneNo ?? "",
            totalDueAmount: payload.totalDueAmount,
            paymentMethod: payload.paymentMethod ?? "Cash",
            payAmount: payload.payAmount ?? 0,
            date: new Date(payload.date),
        },
    });
    return formatEntry(row);
};

const updateEntry = async (id: string, payload: Partial<{
    guestName: string;
    phoneNo: string;
    totalDueAmount: number;
    paymentMethod: string;
    payAmount: number;
    date: string;
}>) => {
    await getEntryById(id);
    const row = await prisma.guestDue.update({
        where: { id },
        data: {
            ...payload,
            ...(payload.date ? { date: new Date(payload.date) } : {}),
        },
    });
    return formatEntry(row);
};

const deleteEntry = async (id: string) => {
    await getEntryById(id);
    return prisma.guestDue.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } });
};

export const DueService = {
    listEntries,
    getEntryById,
    createEntry,
    updateEntry,
    deleteEntry,
};
