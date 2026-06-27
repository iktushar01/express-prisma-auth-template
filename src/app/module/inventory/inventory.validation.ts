import { z } from "zod";
import { PurchaseStatus, StockMovementType, EventStatus, VendorPaymentType } from "../../lib/prisma-exports";

export const listQuerySchema = z.object({
    search: z.string().optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const listStockQuerySchema = z.object({
    locationId: z.string().uuid().optional(),
    itemId: z.string().uuid().optional(),
});

export const listSubCategoriesQuerySchema = listQuerySchema.extend({
    categoryId: z.string().uuid().optional(),
});

export const idParamSchema = z.object({ id: z.string().uuid() });

export const createCategorySchema = z.object({
    name: z.string().min(2),
    details: z.string().optional(),
});

export const createSubCategorySchema = z.object({
    categoryId: z.string().uuid(),
    name: z.string().min(2),
});

export const createBrandSchema = z.object({
    name: z.string().min(1),
    details: z.string().optional(),
});

export const createUnitSchema = z.object({ name: z.string().min(1) });

export const createVendorSchema = z.object({
    name: z.string().min(2),
    address: z.string().optional(),
    contact: z.string().optional(),
    openingBalance: z.coerce.number().optional().default(0),
});

export const createStockLocationSchema = z.object({ name: z.string().min(2) });

export const createInventoryItemSchema = z.object({
    categoryId: z.string().uuid(),
    subCategoryId: z.string().uuid(),
    brandId: z.string().uuid().optional(),
    unitId: z.string().uuid(),
    name: z.string().min(2),
    reorderLevel: z.coerce.number().min(0).optional().default(0),
});

export const createPurchaseSchema = z.object({
    memoNo: z.string().min(1),
    vendorId: z.string().uuid(),
    purchaseDate: z.string().datetime().optional(),
    discount: z.coerce.number().min(0).optional().default(0),
    advanceAmount: z.coerce.number().min(0).optional().default(0),
    status: z.nativeEnum(PurchaseStatus).optional(),
    items: z.array(z.object({
        itemId: z.string().uuid(),
        quantity: z.coerce.number().min(0.01),
        price: z.coerce.number().min(0),
    })).min(1),
});

export const stockMovementSchema = z.object({
    itemId: z.string().uuid(),
    quantity: z.coerce.number().min(0.01),
    note: z.string().optional(),
});

export const stockInSchema = stockMovementSchema.extend({
    locationId: z.string().uuid(),
});

export const stockOutSchema = stockMovementSchema.extend({
    locationId: z.string().uuid(),
});

export const moveStockSchema = stockMovementSchema.extend({
    fromLocationId: z.string().uuid(),
    toLocationId: z.string().uuid(),
});

export const createEventSchema = z.object({
    subject: z.string().min(2),
    customerName: z.string().min(2),
    phone: z.string().optional(),
    date: z.string().datetime(),
    noOfPerson: z.coerce.number().int().min(1),
    advanceAmount: z.coerce.number().min(0).optional().default(0),
    menu: z.string().optional(),
    description: z.string().optional(),
    status: z.nativeEnum(EventStatus).optional(),
});

export const updateEventSchema = createEventSchema.partial();

export const listEventsQuerySchema = listQuerySchema.extend({
    status: z.nativeEnum(EventStatus).optional(),
});

export const createVendorPaymentSchema = z.object({
    vendorId: z.string().uuid(),
    purchaseId: z.string().uuid().optional(),
    type: z.nativeEnum(VendorPaymentType).optional().default(VendorPaymentType.PAY),
    paid: z.coerce.number().min(0.01),
    discount: z.coerce.number().min(0).optional().default(0),
    paymentDate: z.string().optional(),
    note: z.string().optional(),
});
