import { z } from "zod";

export const listQuerySchema = z.object({
    search: z.string().optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const idParamSchema = z.object({ id: z.string().uuid() });

export const createEntrySchema = z.object({
    guestName: z.string().min(2),
    phoneNo: z.string().optional(),
    totalDueAmount: z.coerce.number().min(0),
    paymentMethod: z.string().optional().default("Cash"),
    payAmount: z.coerce.number().min(0).optional().default(0),
    date: z.string().min(1),
});

export const updateEntrySchema = createEntrySchema.partial();
