import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import {
    EventStatus,
    PurchaseStatus,
    StockMovementType,
    VendorPaymentType,
} from "../../lib/prisma-exports";
import { StatusCodes } from "http-status-codes";

const paginate = (query: { page?: number; limit?: number }) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    return { page, limit, skip: (page - 1) * limit, meta: (total: number) => ({ page, limit, total, totalPages: Math.ceil(total / limit) }) };
};

// ─── Categories ───────────────────────────────────────────────────────────────

const listCategories = async (query: { search?: string; page?: number; limit?: number }) => {
    const { page, limit, skip, meta } = paginate(query);
    const where = { isDeleted: false, ...(query.search ? { OR: [{ name: { contains: query.search, mode: "insensitive" as const } }, { details: { contains: query.search, mode: "insensitive" as const } }] } : {}) };
    const [data, total] = await Promise.all([
        prisma.inventoryCategory.findMany({ where, orderBy: { name: "asc" }, skip, take: limit }),
        prisma.inventoryCategory.count({ where }),
    ]);
    return { data, meta: meta(total) };
};

const createCategory = async (payload: { name: string; details?: string }) =>
    prisma.inventoryCategory.create({ data: { name: payload.name, details: payload.details ?? "" } });

const updateCategory = async (id: string, payload: { name?: string; details?: string }) => {
    await prisma.inventoryCategory.findFirstOrThrow({ where: { id, isDeleted: false } });
    return prisma.inventoryCategory.update({ where: { id }, data: payload });
};

const deleteCategory = async (id: string) => {
    const count = await prisma.inventoryItem.count({ where: { categoryId: id, isDeleted: false } });
    if (count > 0) throw new AppError(StatusCodes.BAD_REQUEST, "Category has inventory items");
    return prisma.inventoryCategory.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } });
};

const getCategoryById = async (id: string) => {
    const row = await prisma.inventoryCategory.findFirst({ where: { id, isDeleted: false } });
    if (!row) throw new AppError(StatusCodes.NOT_FOUND, "Category not found");
    return row;
};

// ─── Sub Categories ───────────────────────────────────────────────────────────

const listSubCategories = async (query: { search?: string; categoryId?: string; page?: number; limit?: number }) => {
    const { page, limit, skip, meta } = paginate(query);
    const where = {
        isDeleted: false,
        ...(query.categoryId ? { categoryId: query.categoryId } : {}),
        ...(query.search ? { name: { contains: query.search, mode: "insensitive" as const } } : {}),
    };
    const [data, total] = await Promise.all([
        prisma.inventorySubCategory.findMany({ where, include: { category: { select: { name: true } } }, orderBy: { name: "asc" }, skip, take: limit }),
        prisma.inventorySubCategory.count({ where }),
    ]);
    return { data: data.map((s) => ({ ...s, categoryName: s.category.name })), meta: meta(total) };
};

const createSubCategory = async (payload: { categoryId: string; name: string }) =>
    prisma.inventorySubCategory.create({ data: payload });

const updateSubCategory = async (id: string, payload: { categoryId?: string; name?: string }) =>
    prisma.inventorySubCategory.update({ where: { id }, data: payload });

const deleteSubCategory = async (id: string) => {
    const count = await prisma.inventoryItem.count({ where: { subCategoryId: id, isDeleted: false } });
    if (count > 0) throw new AppError(StatusCodes.BAD_REQUEST, "Sub-category has inventory items");
    return prisma.inventorySubCategory.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } });
};

const getSubCategoryById = async (id: string) => {
    const row = await prisma.inventorySubCategory.findFirst({ where: { id, isDeleted: false } });
    if (!row) throw new AppError(StatusCodes.NOT_FOUND, "Sub-category not found");
    return row;
};

// ─── Brands ───────────────────────────────────────────────────────────────────

const listBrands = async (query: { search?: string; page?: number; limit?: number }) => {
    const { page, limit, skip, meta } = paginate(query);
    const where = { isDeleted: false, ...(query.search ? { name: { contains: query.search, mode: "insensitive" as const } } : {}) };
    const [data, total] = await Promise.all([
        prisma.brand.findMany({ where, orderBy: { name: "asc" }, skip, take: limit }),
        prisma.brand.count({ where }),
    ]);
    return { data, meta: meta(total) };
};

const createBrand = async (payload: { name: string; details?: string }) =>
    prisma.brand.create({ data: { name: payload.name, details: payload.details ?? "" } });

const updateBrand = async (id: string, payload: { name?: string; details?: string }) =>
    prisma.brand.update({ where: { id }, data: payload });

const deleteBrand = async (id: string) =>
    prisma.brand.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } });

const getBrandById = async (id: string) => {
    const row = await prisma.brand.findFirst({ where: { id, isDeleted: false } });
    if (!row) throw new AppError(StatusCodes.NOT_FOUND, "Brand not found");
    return row;
};

// ─── Units ────────────────────────────────────────────────────────────────────

const listUnits = async (query: { search?: string; page?: number; limit?: number }) => {
    const { page, limit, skip, meta } = paginate(query);
    const where = { isDeleted: false, ...(query.search ? { name: { contains: query.search, mode: "insensitive" as const } } : {}) };
    const [data, total] = await Promise.all([
        prisma.unit.findMany({ where, orderBy: { name: "asc" }, skip, take: limit }),
        prisma.unit.count({ where }),
    ]);
    return { data, meta: meta(total) };
};

const createUnit = async (payload: { name: string }) => prisma.unit.create({ data: payload });
const updateUnit = async (id: string, payload: { name?: string }) => prisma.unit.update({ where: { id }, data: payload });
const deleteUnit = async (id: string) => prisma.unit.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } });

const getUnitById = async (id: string) => {
    const row = await prisma.unit.findFirst({ where: { id, isDeleted: false } });
    if (!row) throw new AppError(StatusCodes.NOT_FOUND, "Unit not found");
    return row;
};

// ─── Vendors ──────────────────────────────────────────────────────────────────

const listVendors = async (query: { search?: string; page?: number; limit?: number }) => {
    const { page, limit, skip, meta } = paginate(query);
    const where = {
        isDeleted: false,
        ...(query.search ? {
            OR: [
                { name: { contains: query.search, mode: "insensitive" as const } },
                { address: { contains: query.search, mode: "insensitive" as const } },
                { contact: { contains: query.search, mode: "insensitive" as const } },
            ],
        } : {}),
    };
    const [rows, total] = await Promise.all([
        prisma.vendor.findMany({ where, orderBy: { name: "asc" }, skip, take: limit }),
        prisma.vendor.count({ where }),
    ]);
    const data = rows.map((v) => ({ ...v, openingBalance: Number(v.openingBalance).toFixed(2) }));
    return { data, meta: meta(total) };
};

const createVendor = async (payload: { name: string; address?: string; contact?: string; openingBalance?: number }) =>
    prisma.vendor.create({ data: { ...payload, openingBalance: payload.openingBalance ?? 0 } });

const updateVendor = async (id: string, payload: Partial<{ name: string; address: string; contact: string; openingBalance: number }>) =>
    prisma.vendor.update({ where: { id }, data: payload });

const deleteVendor = async (id: string) =>
    prisma.vendor.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } });

const getVendorById = async (id: string) => {
    const row = await prisma.vendor.findFirst({ where: { id, isDeleted: false } });
    if (!row) throw new AppError(StatusCodes.NOT_FOUND, "Vendor not found");
    return { ...row, openingBalance: Number(row.openingBalance) };
};

// ─── Stock Locations ────────────────────────────────────────────────────────

const listStockLocations = async (query: { search?: string; page?: number; limit?: number }) => {
    const { page, limit, skip, meta } = paginate(query);
    const where = { isDeleted: false, ...(query.search ? { name: { contains: query.search, mode: "insensitive" as const } } : {}) };
    const [data, total] = await Promise.all([
        prisma.stockLocation.findMany({ where, orderBy: { name: "asc" }, skip, take: limit }),
        prisma.stockLocation.count({ where }),
    ]);
    return { data, meta: meta(total) };
};

const createStockLocation = async (payload: { name: string }) => prisma.stockLocation.create({ data: payload });
const updateStockLocation = async (id: string, payload: { name?: string }) => prisma.stockLocation.update({ where: { id }, data: payload });
const deleteStockLocation = async (id: string) => prisma.stockLocation.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } });

const getStockLocationById = async (id: string) => {
    const row = await prisma.stockLocation.findFirst({ where: { id, isDeleted: false } });
    if (!row) throw new AppError(StatusCodes.NOT_FOUND, "Stock location not found");
    return row;
};

// ─── Inventory Items ────────────────────────────────────────────────────────

const formatItem = (item: {
    id: string; name: string; reorderLevel: { toString: () => string };
    category: { name: string }; subCategory: { name: string };
    brand: { name: string } | null; unit: { name: string };
    stocks?: { quantity: { toString: () => string } }[];
}) => {
    const stockQty = item.stocks?.reduce((sum, s) => sum + Number(s.quantity), 0) ?? 0;
    return {
        id: item.id,
        category: item.category.name,
        subCategory: item.subCategory.name,
        brand: item.brand?.name ?? "",
        unit: item.unit.name,
        item: `${item.name} (${stockQty.toFixed(2)})`,
        name: item.name,
        reorderLevel: Number(item.reorderLevel).toFixed(2),
        stockQty,
    };
};

const listItems = async (query: { search?: string; page?: number; limit?: number }) => {
    const { page, limit, skip, meta } = paginate(query);
    const where = {
        isDeleted: false,
        ...(query.search ? {
            OR: [
                { name: { contains: query.search, mode: "insensitive" as const } },
                { category: { name: { contains: query.search, mode: "insensitive" as const } } },
            ],
        } : {}),
    };
    const [rows, total] = await Promise.all([
        prisma.inventoryItem.findMany({
            where,
            include: { category: true, subCategory: true, brand: true, unit: true, stocks: true },
            orderBy: { name: "asc" },
            skip,
            take: limit,
        }),
        prisma.inventoryItem.count({ where }),
    ]);
    return { data: rows.map(formatItem), meta: meta(total) };
};

const getAllItems = async () => {
    const rows = await prisma.inventoryItem.findMany({
        where: { isDeleted: false },
        include: { category: true, subCategory: true, brand: true, unit: true, stocks: true },
        orderBy: { name: "asc" },
    });
    return rows.map(formatItem);
};

const createItem = async (payload: {
    categoryId: string; subCategoryId: string; brandId?: string;
    unitId: string; name: string; reorderLevel?: number;
}) => {
    const item = await prisma.inventoryItem.create({
        data: { ...payload, reorderLevel: payload.reorderLevel ?? 0 },
        include: { category: true, subCategory: true, brand: true, unit: true, stocks: true },
    });
    return formatItem(item);
};

const updateItem = async (id: string, payload: Partial<{ categoryId: string; subCategoryId: string; brandId: string; unitId: string; name: string; reorderLevel: number }>) => {
    const item = await prisma.inventoryItem.update({
        where: { id },
        data: payload,
        include: { category: true, subCategory: true, brand: true, unit: true, stocks: true },
    });
    return formatItem(item);
};

const deleteItem = async (id: string) =>
    prisma.inventoryItem.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } });

const getItemById = async (id: string) => {
    const item = await prisma.inventoryItem.findFirst({
        where: { id, isDeleted: false },
        include: { category: true, subCategory: true, brand: true, unit: true },
    });
    if (!item) throw new AppError(StatusCodes.NOT_FOUND, "Item not found");
    return {
        id: item.id,
        name: item.name,
        categoryId: item.categoryId,
        subCategoryId: item.subCategoryId,
        brandId: item.brandId,
        unitId: item.unitId,
        reorderLevel: Number(item.reorderLevel),
    };
};

// ─── Stock operations ─────────────────────────────────────────────────────────

const stockIn = async (payload: { itemId: string; locationId: string; quantity: number; note?: string }) => {
    await prisma.$transaction(async (tx) => {
        const existing = await tx.stock.findUnique({
            where: { itemId_locationId: { itemId: payload.itemId, locationId: payload.locationId } },
        });
        const newQty = Number(existing?.quantity ?? 0) + payload.quantity;
        if (existing) {
            await tx.stock.update({ where: { id: existing.id }, data: { quantity: newQty } });
        } else {
            await tx.stock.create({ data: { itemId: payload.itemId, locationId: payload.locationId, quantity: payload.quantity } });
        }
        await tx.stockMovement.create({
            data: {
                itemId: payload.itemId,
                toLocationId: payload.locationId,
                quantity: payload.quantity,
                type: StockMovementType.STOCK_IN,
                note: payload.note,
            },
        });
    });
};

const stockOut = async (payload: { itemId: string; locationId: string; quantity: number; note?: string }) => {
    await prisma.$transaction(async (tx) => {
        const stock = await tx.stock.findUnique({
            where: { itemId_locationId: { itemId: payload.itemId, locationId: payload.locationId } },
        });
        if (!stock || Number(stock.quantity) < payload.quantity) {
            throw new AppError(StatusCodes.BAD_REQUEST, "Insufficient stock");
        }
        await tx.stock.update({
            where: { id: stock.id },
            data: { quantity: { decrement: payload.quantity } },
        });
        await tx.stockMovement.create({
            data: {
                itemId: payload.itemId,
                fromLocationId: payload.locationId,
                quantity: payload.quantity,
                type: StockMovementType.STOCK_OUT,
                note: payload.note,
            },
        });
    });
};

const moveStock = async (payload: { itemId: string; fromLocationId: string; toLocationId: string; quantity: number; note?: string }) => {
    await prisma.$transaction(async (tx) => {
        const stock = await tx.stock.findUnique({
            where: { itemId_locationId: { itemId: payload.itemId, locationId: payload.fromLocationId } },
        });
        if (!stock || Number(stock.quantity) < payload.quantity) {
            throw new AppError(StatusCodes.BAD_REQUEST, "Insufficient stock at source location");
        }
        await tx.stock.update({ where: { id: stock.id }, data: { quantity: { decrement: payload.quantity } } });
        const dest = await tx.stock.findUnique({
            where: { itemId_locationId: { itemId: payload.itemId, locationId: payload.toLocationId } },
        });
        if (dest) {
            await tx.stock.update({ where: { id: dest.id }, data: { quantity: { increment: payload.quantity } } });
        } else {
            await tx.stock.create({ data: { itemId: payload.itemId, locationId: payload.toLocationId, quantity: payload.quantity } });
        }
        await tx.stockMovement.create({
            data: {
                itemId: payload.itemId,
                fromLocationId: payload.fromLocationId,
                toLocationId: payload.toLocationId,
                quantity: payload.quantity,
                type: StockMovementType.MOVE,
                note: payload.note,
            },
        });
    });
};

const listStockByLocation = async (query?: { locationId?: string; itemId?: string }) => {
    const stocks = await prisma.stock.findMany({
        where: {
            ...(query?.locationId ? { locationId: query.locationId } : {}),
            ...(query?.itemId ? { itemId: query.itemId } : {}),
        },
        include: {
            item: { select: { id: true, name: true, unit: { select: { name: true } } } },
            location: { select: { id: true, name: true } },
        },
        orderBy: { item: { name: "asc" } },
    });
    return stocks.map((s, i) => ({
        siNo: i + 1,
        itemId: s.itemId,
        itemName: s.item.name,
        locationId: s.locationId,
        location: s.location.name,
        unit: s.item.unit.name,
        stock: Number(s.quantity),
        stockFormatted: `${Number(s.quantity).toFixed(2)} ${s.item.unit.name}`,
    }));
};

// ─── Purchases ────────────────────────────────────────────────────────────────

const listPurchases = async (query: { search?: string; page?: number; limit?: number }) => {
    const { page, limit, skip, meta } = paginate(query);
    const where = query.search ? { memoNo: { contains: query.search, mode: "insensitive" as const } } : {};
    const [rows, total] = await Promise.all([
        prisma.purchase.findMany({
            where,
            include: { vendor: { select: { name: true } } },
            orderBy: { purchaseDate: "desc" },
            skip,
            take: limit,
        }),
        prisma.purchase.count({ where }),
    ]);
    const data = rows.map((p) => ({
        id: p.id,
        memoNo: p.memoNo,
        supplierName: p.vendor.name,
        total: Number(p.total).toFixed(2),
        purchaseDate: p.purchaseDate.toLocaleDateString("en-GB"),
        status: p.status,
    }));
    return { data, meta: meta(total) };
};

const createPurchase = async (payload: {
    memoNo: string; vendorId: string; purchaseDate?: string;
    discount?: number; advanceAmount?: number; status?: PurchaseStatus;
    items: { itemId: string; quantity: number; price: number }[];
}) => {
    const total = payload.items.reduce((sum, i) => sum + i.quantity * i.price, 0);
    const discountAmt = total * ((payload.discount ?? 0) / 100);
    const netTotal = total - discountAmt;
    const due = netTotal - (payload.advanceAmount ?? 0);

    return prisma.purchase.create({
        data: {
            memoNo: payload.memoNo,
            vendorId: payload.vendorId,
            purchaseDate: payload.purchaseDate ? new Date(payload.purchaseDate) : new Date(),
            total: netTotal,
            discount: discountAmt,
            advanceAmount: payload.advanceAmount ?? 0,
            due,
            status: payload.status ?? PurchaseStatus.PENDING,
            items: {
                create: payload.items.map((i) => ({
                    itemId: i.itemId,
                    quantity: i.quantity,
                    price: i.price,
                    subTotal: i.quantity * i.price,
                })),
            },
        },
        include: { vendor: true, items: true },
    });
};

// ─── Events ───────────────────────────────────────────────────────────────────

const formatEvent = (e: {
    id: string; subject: string; customerName: string; phone: string | null;
    date: Date; noOfPerson: number; advanceAmount: { toString: () => string };
    menu: string | null; description: string | null; status: EventStatus;
}) => ({
    id: e.id,
    subject: e.subject,
    customerName: e.customerName,
    phone: e.phone ?? "",
    date: e.date.toLocaleString("en-GB"),
    noOfPerson: e.noOfPerson,
    advanceAmount: Number(e.advanceAmount).toFixed(2),
    menu: e.menu ?? "",
    description: e.description ?? "",
    status: e.status === EventStatus.BOOKED ? "Booked" : e.status === EventStatus.RESOLVED ? "Resolved" : e.status === EventStatus.CONFIRMED ? "Confirmed" : "Cancelled",
    statusRaw: e.status,
    dateISO: e.date.toISOString(),
});

const listEvents = async (query: { search?: string; status?: EventStatus; page?: number; limit?: number }) => {
    const { page, limit, skip, meta } = paginate(query);
    const where = {
        isDeleted: false,
        ...(query.status ? { status: query.status } : {}),
        ...(query.search ? {
            OR: [
                { subject: { contains: query.search, mode: "insensitive" as const } },
                { customerName: { contains: query.search, mode: "insensitive" as const } },
            ],
        } : {}),
    };
    const [rows, total] = await Promise.all([
        prisma.event.findMany({ where, orderBy: { date: "desc" }, skip, take: limit }),
        prisma.event.count({ where }),
    ]);
    return { data: rows.map(formatEvent), meta: meta(total) };
};

const getTodayEvents = async () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const rows = await prisma.event.findMany({
        where: { isDeleted: false, date: { gte: start, lte: end } },
        orderBy: { date: "asc" },
    });
    return rows.map(formatEvent);
};

const getEventById = async (id: string) => {
    const event = await prisma.event.findFirst({ where: { id, isDeleted: false } });
    if (!event) throw new AppError(StatusCodes.NOT_FOUND, "Event not found");
    return formatEvent(event);
};

const createEvent = async (payload: {
    subject: string; customerName: string; phone?: string; date: string;
    noOfPerson: number; advanceAmount?: number; menu?: string; description?: string; status?: EventStatus;
}) => {
    const event = await prisma.event.create({
        data: {
            subject: payload.subject,
            customerName: payload.customerName,
            phone: payload.phone,
            date: new Date(payload.date),
            noOfPerson: payload.noOfPerson,
            advanceAmount: payload.advanceAmount ?? 0,
            menu: payload.menu,
            description: payload.description,
            status: payload.status ?? EventStatus.BOOKED,
        },
    });
    return formatEvent(event);
};

const updateEvent = async (id: string, payload: Partial<{
    subject: string; customerName: string; phone: string; date: string;
    noOfPerson: number; advanceAmount: number; menu: string; description: string; status: EventStatus;
}>) => {
    const event = await prisma.event.update({
        where: { id },
        data: {
            ...payload,
            ...(payload.date ? { date: new Date(payload.date) } : {}),
        },
    });
    return formatEvent(event);
};

const deleteEvent = async (id: string) =>
    prisma.event.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } });

// ─── Vendor Payments ──────────────────────────────────────────────────────────

const formatVendorPayment = (payment: {
    id: string;
    type: VendorPaymentType;
    paid: { toString: () => string };
    discount: { toString: () => string };
    due: { toString: () => string };
    paymentDate: Date;
    note: string;
    vendor: { id: string; name: string };
    purchase: { id: string; memoNo: string } | null;
}) => ({
    id: payment.id,
    vendorId: payment.vendor.id,
    vendorName: payment.vendor.name,
    purchaseId: payment.purchase?.id ?? null,
    memoNo: payment.purchase?.memoNo ?? "",
    type: payment.type,
    paid: Number(payment.paid),
    discount: Number(payment.discount),
    due: Number(payment.due),
    paymentDate: payment.paymentDate.toISOString(),
    note: payment.note,
});

const listVendorPayments = async (query: { search?: string; vendorId?: string; page?: number; limit?: number }) => {
    const { page, limit, skip, meta } = paginate(query);
    const where = {
        ...(query.vendorId ? { vendorId: query.vendorId } : {}),
        ...(query.search ? {
            OR: [
                { note: { contains: query.search, mode: "insensitive" as const } },
                { vendor: { name: { contains: query.search, mode: "insensitive" as const } } },
                { purchase: { memoNo: { contains: query.search, mode: "insensitive" as const } } },
            ],
        } : {}),
    };
    const [rows, total] = await Promise.all([
        prisma.vendorPayment.findMany({
            where,
            include: {
                vendor: { select: { id: true, name: true } },
                purchase: { select: { id: true, memoNo: true } },
            },
            orderBy: { paymentDate: "desc" },
            skip,
            take: limit,
        }),
        prisma.vendorPayment.count({ where }),
    ]);
    return { data: rows.map(formatVendorPayment), meta: meta(total) };
};

const createVendorPayment = async (payload: {
    vendorId: string;
    purchaseId?: string;
    type?: VendorPaymentType;
    paid: number;
    discount?: number;
    paymentDate?: string;
    note?: string;
}) => {
    const vendor = await prisma.vendor.findFirst({ where: { id: payload.vendorId, isDeleted: false } });
    if (!vendor) throw new AppError(StatusCodes.BAD_REQUEST, "Vendor not found");

    return prisma.$transaction(async (tx) => {
        let remainingDue = 0;

        if (payload.purchaseId) {
            const purchase = await tx.purchase.findFirst({
                where: { id: payload.purchaseId, vendorId: payload.vendorId },
            });
            if (!purchase) throw new AppError(StatusCodes.BAD_REQUEST, "Purchase not found for this vendor");

            remainingDue = Math.max(
                Number(purchase.due) - (payload.paid + (payload.discount ?? 0)),
                0,
            );

            await tx.purchase.update({
                where: { id: purchase.id },
                data: {
                    due: remainingDue,
                    status: remainingDue === 0
                        ? PurchaseStatus.PAID
                        : PurchaseStatus.PARTIAL,
                },
            });
        }

        const payment = await tx.vendorPayment.create({
            data: {
                vendorId: payload.vendorId,
                purchaseId: payload.purchaseId ?? null,
                type: payload.type ?? VendorPaymentType.PAY,
                paid: payload.paid,
                discount: payload.discount ?? 0,
                due: remainingDue,
                paymentDate: payload.paymentDate ? new Date(payload.paymentDate) : new Date(),
                note: payload.note ?? "",
            },
            include: {
                vendor: { select: { id: true, name: true } },
                purchase: { select: { id: true, memoNo: true } },
            },
        });

        return formatVendorPayment(payment);
    });
};

const getVendorsWithDuePurchases = async () => {
    const vendors = await prisma.vendor.findMany({
        where: {
            isDeleted: false,
            purchases: { some: { due: { gt: 0 } } },
        },
        include: {
            purchases: {
                where: { due: { gt: 0 } },
                select: {
                    id: true,
                    memoNo: true,
                    total: true,
                    due: true,
                    purchaseDate: true,
                },
                orderBy: { purchaseDate: "desc" },
            },
        },
        orderBy: { name: "asc" },
    });

    return vendors.map((vendor) => ({
        id: vendor.id,
        name: vendor.name,
        address: vendor.address ?? "",
        contact: vendor.contact ?? "",
        memos: vendor.purchases.map((purchase) => ({
            id: purchase.id,
            no: purchase.memoNo,
            payable: Number(purchase.due),
            total: Number(purchase.total),
            purchaseDate: purchase.purchaseDate.toISOString(),
        })),
    }));
};

export const InventoryService = {
    listCategories, getCategoryById, createCategory, updateCategory, deleteCategory,
    listSubCategories, getSubCategoryById, createSubCategory, updateSubCategory, deleteSubCategory,
    listBrands, getBrandById, createBrand, updateBrand, deleteBrand,
    listUnits, getUnitById, createUnit, updateUnit, deleteUnit,
    listVendors, getVendorById, createVendor, updateVendor, deleteVendor,
    listStockLocations, getStockLocationById, createStockLocation, updateStockLocation, deleteStockLocation,
    listItems, getAllItems, getItemById, createItem, updateItem, deleteItem,
    stockIn, stockOut, moveStock, listStockByLocation,
    listPurchases, createPurchase,
    listEvents, getTodayEvents, getEventById, createEvent, updateEvent, deleteEvent,
    listVendorPayments, createVendorPayment, getVendorsWithDuePurchases,
};
