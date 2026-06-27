import { z } from "zod";

export const listQuerySchema = z.object({
    search: z.string().optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const idParamSchema = z.object({ id: z.string().uuid() });

export const employeeIdParamSchema = z.object({ employeeId: z.string().uuid() });

export const employeeRecordParamSchema = z.object({
    employeeId: z.string().uuid(),
    id: z.string().uuid(),
});

export const createDesignationSchema = z.object({
    name: z.string().min(2),
    basic: z.coerce.number().min(0).optional(),
    basicSalary: z.coerce.number().min(0).optional(),
});

export const createHeadSchema = z.object({
    name: z.string().min(2),
});

export const employeeStatusSchema = z.enum(["ACTIVE", "RETIRED", "INACTIVE"]);

export const createEmployeeSchema = z.object({
    name: z.string().min(2),
    contactNo: z.string().optional(),
    designationId: z.string().uuid().optional().nullable(),
    status: employeeStatusSchema.optional(),
    hasAccess: z.boolean().optional(),
});

export const listEmployeeQuerySchema = listQuerySchema.extend({
    status: employeeStatusSchema.optional(),
    designationId: z.string().uuid().optional(),
});

export const listEmployeeRecordsQuerySchema = listQuerySchema.extend({
    headId: z.string().uuid().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
});

export const createEarningSchema = z.object({
    headId: z.string().uuid(),
    amount: z.coerce.number().min(0.01),
    date: z.string().min(1),
    note: z.string().optional(),
});

export const createDeductionSchema = createEarningSchema;

export const createBasicSalarySchema = z.object({
    amount: z.coerce.number().min(0),
    date: z.string().min(1),
    note: z.string().optional(),
});

export const createSalaryPaymentSchema = z.object({
    amount: z.coerce.number().min(0.01),
    paymentDate: z.string().min(1),
    paymentMethod: z.string().optional(),
    note: z.string().optional(),
});
