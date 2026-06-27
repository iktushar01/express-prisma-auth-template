import prismaPkg from "../../generated/prisma/index";

const prismaModule = prismaPkg as typeof import("../../generated/prisma/index");

export const PrismaClient = prismaModule.PrismaClient;
export const Prisma = prismaModule.Prisma;

export const Role = prismaModule.Role;
export type Role = (typeof Role)[keyof typeof Role];

export const UserStatus = prismaModule.UserStatus;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const Gender = prismaModule.Gender;
export type Gender = (typeof Gender)[keyof typeof Gender];

export const Availability = prismaModule.Availability;
export type Availability = (typeof Availability)[keyof typeof Availability];

export const DineTableStatus = prismaModule.DineTableStatus;
export type DineTableStatus =
    (typeof DineTableStatus)[keyof typeof DineTableStatus];

export const OrderStatus = prismaModule.OrderStatus;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const OrderType = prismaModule.OrderType;
export type OrderType = (typeof OrderType)[keyof typeof OrderType];

export const WorkPeriodStatus = prismaModule.WorkPeriodStatus;
export type WorkPeriodStatus =
    (typeof WorkPeriodStatus)[keyof typeof WorkPeriodStatus];

export const PurchaseStatus = prismaModule.PurchaseStatus;
export type PurchaseStatus = (typeof PurchaseStatus)[keyof typeof PurchaseStatus];

export const StockMovementType = prismaModule.StockMovementType;
export type StockMovementType =
    (typeof StockMovementType)[keyof typeof StockMovementType];

export const EventStatus = prismaModule.EventStatus;
export type EventStatus = (typeof EventStatus)[keyof typeof EventStatus];

export const EmployeeStatus = prismaModule.EmployeeStatus;
export type EmployeeStatus = (typeof EmployeeStatus)[keyof typeof EmployeeStatus];

export const VendorPaymentType = prismaModule.VendorPaymentType;
export type VendorPaymentType =
    (typeof VendorPaymentType)[keyof typeof VendorPaymentType];
