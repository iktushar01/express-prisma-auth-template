import { prisma } from "../../lib/prisma";

const formatProperty = (property: {
    id: string;
    propertyName: string | null;
    propertyGrade: string | null;
    city: string | null;
    state: string | null;
    phone: string | null;
    email: string | null;
    registrationVAT: string | null;
    registrationCST: string | null;
    propertyType: string | null;
    address: string | null;
    postalCode: string | null;
    country: string | null;
    fax: string | null;
    website: string | null;
    registrationTIN: string | null;
    companyLogo: string | null;
    vatPercent: { toString: () => string };
    serviceChargePercent: { toString: () => string };
    createdAt: Date;
    updatedAt: Date;
}) => ({
    ...property,
    vatPercent: Number(property.vatPercent),
    serviceChargePercent: Number(property.serviceChargePercent),
});

const getProperty = async () => {
    let property = await prisma.property.findFirst();

    if (!property) {
        property = await prisma.property.create({
            data: {
                propertyName: "DineFlow Restaurant",
            },
        });
    }

    return formatProperty(property);
};

const updateProperty = async (payload: Record<string, string | number | undefined>) => {
    const existing = await prisma.property.findFirst();
    if (!existing) {
        const created = await prisma.property.create({
            data: {
                propertyName: "DineFlow Restaurant",
                ...payload,
            },
        });
        return formatProperty(created);
    }

    return formatProperty(await prisma.property.update({
        where: { id: existing.id },
        data: payload,
    }));
};

export const PropertyService = {
    getProperty,
    updateProperty,
};
