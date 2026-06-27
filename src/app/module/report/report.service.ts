import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { OrderStatus, WorkPeriodStatus } from "../../lib/prisma-exports";
import { StatusCodes } from "http-status-codes";

const formatOrderStatus = (status: OrderStatus) => {
    switch (status) {
        case OrderStatus.CANCELLED:
            return "Cancelled";
        case OrderStatus.COMPLETED:
            return "Completed";
        case OrderStatus.PENDING:
        case OrderStatus.PREPARING:
            return "Ordered";
        default:
            return status.charAt(0) + status.slice(1).toLowerCase();
    }
};

const formatReportOrder = (order: {
    id: string;
    status: OrderStatus;
    total: { toString: () => string };
    createdAt: Date;
    table?: { tableNo: string } | null;
    orderType: string;
}) => ({
    id: order.id,
    orderDetail: order.table?.tableNo ?? order.orderType,
    status: formatOrderStatus(order.status),
    orderTime: order.createdAt.toLocaleString("en-GB"),
    total: Number(order.total),
});

const getDayRange = (dateStr: string) => {
    const start = new Date(`${dateStr}T00:00:00.000Z`);
    const end = new Date(`${dateStr}T23:59:59.999Z`);
    return { start, end };
};

const buildSummary = async (workPeriod: {
    totalSale: { toString: () => string };
    discount: { toString: () => string };
    onTheHouse: { toString: () => string };
    cardPayment: { toString: () => string };
    cashPayment: { toString: () => string };
    startDate: Date;
    endDate: Date | null;
} | null, dateRange?: { start: Date; end: Date }) => {
    const dueWhere = {
        isDeleted: false,
        ...(dateRange ? { date: { gte: dateRange.start, lte: dateRange.end } } : {}),
    };

    const dues = await prisma.guestDue.findMany({ where: dueWhere });

    const totalDueOrders = dues.reduce(
        (sum, d) => sum + Math.max(Number(d.totalDueAmount) - Number(d.payAmount), 0),
        0,
    );
    const totalDueCollect = dues.reduce((sum, d) => sum + Number(d.payAmount), 0);

    return {
        totalFoodCost: workPeriod ? Number(workPeriod.totalSale) : 0,
        totalDiscount: workPeriod ? Number(workPeriod.discount) : 0,
        totalOnHouse: workPeriod ? Number(workPeriod.onTheHouse) : 0,
        totalDueOrders,
        totalDueCollect,
        totalCard: workPeriod ? Number(workPeriod.cardPayment) : 0,
        totalCash: workPeriod ? Number(workPeriod.cashPayment) : 0,
    };
};

const getCurrentReport = async () => {
    const workPeriod = await prisma.workPeriod.findFirst({
        where: { status: WorkPeriodStatus.OPEN },
        orderBy: { startDate: "desc" },
    });

    if (!workPeriod) {
        throw new AppError(StatusCodes.NOT_FOUND, "No open work period found");
    }

    const orders = await prisma.order.findMany({
        where: { workPeriodId: workPeriod.id },
        include: { table: { select: { tableNo: true } } },
        orderBy: { createdAt: "desc" },
    });

    const allOrders = orders
        .filter((o) => o.status !== OrderStatus.CANCELLED)
        .map(formatReportOrder);
    const cancelledOrders = orders
        .filter((o) => o.status === OrderStatus.CANCELLED)
        .map(formatReportOrder);

    const summary = await buildSummary(workPeriod);

    return { allOrders, cancelledOrders, summary };
};

const getDailyReport = async (dateStr: string) => {
    const { start, end } = getDayRange(dateStr);

    const workPeriod = await prisma.workPeriod.findFirst({
        where: {
            startDate: { lte: end },
            OR: [{ endDate: null }, { endDate: { gte: start } }],
        },
        orderBy: { startDate: "desc" },
    });

    const orders = await prisma.order.findMany({
        where: {
            createdAt: { gte: start, lte: end },
            ...(workPeriod ? { workPeriodId: workPeriod.id } : {}),
        },
        include: { table: { select: { tableNo: true } } },
        orderBy: { createdAt: "asc" },
    });

    const property = await prisma.property.findFirst();
    const vatPercent = property ? Number(property.vatPercent) : 0;
    const serviceChargePercent = property ? Number(property.serviceChargePercent) : 0;

    const foodSalePrice = orders
        .filter((o) => o.status !== OrderStatus.CANCELLED)
        .reduce((sum, o) => sum + Number(o.total), 0);

    const paidThroughCash = workPeriod ? Number(workPeriod.cashPayment) : 0;
    const paidThroughCard = workPeriod ? Number(workPeriod.cardPayment) : 0;
    const discount = workPeriod ? Number(workPeriod.discount) : 0;
    const vat = (foodSalePrice * vatPercent) / 100;
    const serviceCharge = (foodSalePrice * serviceChargePercent) / 100;
    const totalPrice = foodSalePrice + vat + serviceCharge - discount;

    const [incomeAgg, expenseAgg] = await Promise.all([
        prisma.incomeEntry.aggregate({
            where: { isDeleted: false, date: { gte: start, lte: end } },
            _sum: { amount: true },
        }),
        prisma.expenseEntry.aggregate({
            where: { isDeleted: false, date: { gte: start, lte: end } },
            _sum: { amount: true },
        }),
    ]);

    const totalIncome = Number(incomeAgg._sum.amount ?? 0) + totalPrice;
    const totalExpense = Number(expenseAgg._sum.amount ?? 0);
    const totalBalance = totalIncome - totalExpense;

    const summary = await buildSummary(workPeriod, { start, end });

    return {
        date: dateStr,
        workPeriod: workPeriod ? {
            id: workPeriod.id,
            startDate: workPeriod.startDate.toISOString(),
            endDate: workPeriod.endDate?.toISOString() ?? null,
            status: workPeriod.status,
        } : null,
        salesSummary: {
            foodSalePrice,
            paidThroughCash,
            paidThroughCard,
            totalPrice,
        },
        charges: {
            vat,
            serviceCharge,
            discount,
            vatPercent,
            serviceChargePercent,
        },
        financialSummary: {
            totalIncome,
            totalExpense,
            totalBalance,
        },
        allOrders: orders
            .filter((o) => o.status !== OrderStatus.CANCELLED)
            .map(formatReportOrder),
        cancelledOrders: orders
            .filter((o) => o.status === OrderStatus.CANCELLED)
            .map(formatReportOrder),
        summary,
    };
};

export const ReportService = {
    getCurrentReport,
    getDailyReport,
};
