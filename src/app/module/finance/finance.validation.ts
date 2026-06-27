import { z } from "zod";

export const listQuerySchema = z.object({
    search: z.string().optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const idParamSchema = z.object({ id: z.string().uuid() });

export const createHeadSchema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
});

export const createEntrySchema = z.object({
    headId: z.string().uuid(),
    amount: z.coerce.number().min(0.01),
    note: z.string().optional(),
    date: z.string().min(1),
});

export const updateEntrySchema = createEntrySchema.partial();

export const listEntriesQuerySchema = listQuerySchema.extend({
    headId: z.string().uuid().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
});
