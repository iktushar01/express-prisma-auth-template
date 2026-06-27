import { z } from "zod";

export const updatePropertyZodSchema = z.object({
    propertyName: z.string().optional(),
    propertyGrade: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    registrationVAT: z.string().optional(),
    registrationCST: z.string().optional(),
    propertyType: z.string().optional(),
    address: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
    fax: z.string().optional(),
    website: z.string().optional(),
    registrationTIN: z.string().optional(),
    companyLogo: z.string().optional(),
    vatPercent: z.coerce.number().min(0).max(100).optional(),
    serviceChargePercent: z.coerce.number().min(0).max(100).optional(),
});
