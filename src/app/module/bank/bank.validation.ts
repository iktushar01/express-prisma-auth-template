import { z } from "zod";

export const listQuerySchema = z.object({
    search: z.string().optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const idParamSchema = z.object({ id: z.string().uuid() });

export const createBankSchema = z.object({
    bankName: z.string().min(2),
    description: z.string().optional(),
});

export const updateBankSchema = createBankSchema.partial();

export const createBranchSchema = z.object({
    bankId: z.string().uuid(),
    branchName: z.string().min(2),
    address: z.string().optional(),
});

export const updateBranchSchema = createBranchSchema.partial();

export const listBranchesQuerySchema = listQuerySchema.extend({
    bankId: z.string().uuid().optional(),
});

export const createAccountSchema = z.object({
    branchId: z.string().uuid(),
    accountName: z.string().min(2),
    accountNo: z.string().min(1),
    note: z.string().optional(),
});

export const updateAccountSchema = createAccountSchema.partial();

export const listAccountsQuerySchema = listQuerySchema.extend({
    branchId: z.string().uuid().optional(),
});

export const createTransactionSchema = z.object({
    accountId: z.string().uuid(),
    type: z.enum(["DEPOSIT", "WITHDRAW"]),
    amount: z.coerce.number().min(0.01),
    date: z.string().min(1),
    note: z.string().optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const listTransactionsQuerySchema = listQuerySchema.extend({
    accountId: z.string().uuid().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
});

export const statementsQuerySchema = z.object({
    accountId: z.string().uuid(),
    from: z.string().min(1),
    to: z.string().min(1),
});
