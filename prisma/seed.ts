import { PrismaClient, Availability, DineTableStatus } from "../src/generated/prisma/index";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const categories = [
    { name: "Appetizer (Thai)", note: "", serialNo: 1 },
    { name: "Salad (Thai)", note: "", serialNo: 2 },
    { name: "Soup (Thai)", note: "", serialNo: 3 },
    { name: "Rice (Thai)", note: "", serialNo: 4 },
    { name: "Noodles (Thai)", note: "", serialNo: 5 },
    { name: "Beef (Thai)", note: "", serialNo: 6 },
    { name: "Chicken (Thai)", note: "", serialNo: 7 },
    { name: "Seafood (Thai)", note: "", serialNo: 8 },
    { name: "Vegetarian (Thai)", note: "", serialNo: 9 },
    { name: "Dessert (Thai)", note: "", serialNo: 10 },
];

const foods = [
    { foodNo: "01", name: "Chicken Saizy", serialNo: 1, price: 395 },
    { foodNo: "02", name: "Fried/Grilled Chicken Wings", serialNo: 2, price: 330 },
    { foodNo: "03", name: "Fish Finger (Fish Chup Pang Tod)", serialNo: 3, price: 360 },
    { foodNo: "04", name: "Butter Fried Prawn", serialNo: 4, price: 380 },
    { foodNo: "05", name: "Drums of Haven", serialNo: 5, price: 360 },
    { foodNo: "06", name: "Tempura Vegetable", serialNo: 6, price: 280 },
    { foodNo: "07", name: "Tempura Mixed", serialNo: 7, price: 380 },
    { foodNo: "08", name: "Royal Spring Roll", serialNo: 8, price: 320 },
    { foodNo: "09", name: "Lab Kai (Chicken Salad)", serialNo: 9, price: 425 },
    { foodNo: "10", name: "Mixed Seafood Salad (Yan Talay)", serialNo: 10, price: 450 },
    { foodNo: "11", name: "Cashewnut Salad (Sauç)", serialNo: 11, price: 390 },
    { foodNo: "12", name: "Papaya Salad (Som Tam)", serialNo: 12, price: 325 },
    { foodNo: "13", name: "Tom Yam Soup (Clear)", serialNo: 13, price: 400 },
    { foodNo: "14", name: "Mixed Tom Yam Soup (Cloudy)", serialNo: 14, price: 450 },
    { foodNo: "15", name: "King Prawn Soup (Clear/Cloudy)", serialNo: 15, price: 550 },
];

async function main() {
    const existingCategories = await prisma.foodCategory.count();

    if (existingCategories === 0) {
        const createdCategories = await Promise.all(
            categories.map((category) =>
                prisma.foodCategory.create({ data: category }),
            ),
        );

        const appetizerCategory = createdCategories[0];

        await prisma.food.createMany({
            data: foods.map((food) => ({
                ...food,
                categoryId: appetizerCategory.id,
                availability: Availability.AVAILABLE,
            })),
        });

        await prisma.property.create({
            data: {
                propertyName: "DineFlow Restaurant",
                city: "Dhaka",
                country: "Bangladesh",
            },
        });

        console.log("Restaurant seed data created successfully.");
    } else {
        console.log("Food seed skipped — already exists.");
    }

    await seedDineAndWaiters();
    await seedInventoryAndEvents();
    await seedFinance();
    await seedBankHrDue();
}

async function seedDineAndWaiters() {
    const existing = await prisma.dineLocation.count();
    if (existing > 0) {
        console.log("Dine/waiter seed skipped — already exists.");
        return;
    }

    const central = await prisma.dineLocation.create({
        data: { name: "Central", type: "Indoor" },
    });
    const terrace = await prisma.dineLocation.create({
        data: { name: "Terrace", type: "Outdoor" },
    });
    const bar = await prisma.dineLocation.create({
        data: { name: "Bar Area", type: "Bar" },
    });
    const privateRoom = await prisma.dineLocation.create({
        data: { name: "Private Room", type: "Private" },
    });

    const centralTables = [
        { tableNo: "KABIN 1", capacity: 4 },
        { tableNo: "A2", capacity: 8 },
        { tableNo: "A3", capacity: 8 },
        { tableNo: "A4", capacity: 8 },
        { tableNo: "B1", capacity: 4 },
        { tableNo: "B2", capacity: 4 },
        { tableNo: "C1", capacity: 4 },
        { tableNo: "C2", capacity: 4 },
    ];

    await prisma.dineTable.createMany({
        data: centralTables.map((t) => ({
            ...t,
            locationId: central.id,
            status: DineTableStatus.AVAILABLE,
        })),
    });

    await prisma.dineTable.createMany({
        data: [
            { locationId: terrace.id, tableNo: "T1", capacity: 6, status: DineTableStatus.OCCUPIED },
            { locationId: terrace.id, tableNo: "T2", capacity: 4, status: DineTableStatus.AVAILABLE },
            { locationId: bar.id, tableNo: "BAR1", capacity: 2, status: DineTableStatus.AVAILABLE },
            { locationId: bar.id, tableNo: "BAR2", capacity: 2, status: DineTableStatus.RESERVED },
            { locationId: privateRoom.id, tableNo: "PR1", capacity: 10, status: DineTableStatus.AVAILABLE },
        ],
    });

    await prisma.waiter.createMany({
        data: [
            { name: "Shawan", note: "" },
            { name: "Robiul", note: "" },
            { name: "ADMIN", note: "" },
            { name: "Payel", note: "" },
        ],
    });

    await prisma.workPeriod.create({
        data: { startDate: new Date(), openingCash: 0 },
    });

    console.log("Dine locations, tables, waiters, and work period seeded.");
}

async function seedInventoryAndEvents() {
    const existing = await prisma.inventoryCategory.count();
    if (existing > 0) {
        console.log("Inventory seed skipped — already exists.");
        return;
    }

    const rawMaterials = await prisma.inventoryCategory.create({
        data: { name: "Raw Materials", details: "nice" },
    });
    const rice = await prisma.inventoryCategory.create({
        data: { name: "RICE", details: "FEFW" },
    });

    const meat = await prisma.inventorySubCategory.create({
        data: { categoryId: rawMaterials.id, name: "Meat" },
    });
    const fish = await prisma.inventorySubCategory.create({
        data: { categoryId: rawMaterials.id, name: "Fish" },
    });

    const kg = await prisma.unit.create({ data: { name: "KG" } });
    await prisma.unit.createMany({
        data: [{ name: "LITRE" }, { name: "PIECE" }, { name: "DOZEN" }],
    });

    const mainStore = await prisma.stockLocation.create({ data: { name: "Main Store" } });
    const kitchen = await prisma.stockLocation.create({ data: { name: "Kitchen" } });

    await prisma.vendor.create({
        data: { name: "Sakura Shop", address: "Dhaka", contact: "01111111111", openingBalance: 0 },
    });

    const items = [
        { name: "Chicken", subCategoryId: meat.id, reorderLevel: 5 },
        { name: "Beef", subCategoryId: meat.id, reorderLevel: 3 },
        { name: "Rupcanda Fish", subCategoryId: fish.id, reorderLevel: 2 },
    ];

    for (const item of items) {
        const created = await prisma.inventoryItem.create({
            data: {
                categoryId: rawMaterials.id,
                subCategoryId: item.subCategoryId,
                unitId: kg.id,
                name: item.name,
                reorderLevel: item.reorderLevel,
            },
        });
        await prisma.stock.create({
            data: { itemId: created.id, locationId: mainStore.id, quantity: 20 },
        });
    }

    await prisma.event.createMany({
        data: [
            {
                subject: "Birthday Party",
                customerName: "Yasin",
                phone: "87568732465",
                date: new Date("2025-08-15"),
                noOfPerson: 12,
                advanceAmount: 100,
                menu: "Set Menu A",
                description: "Birthday celebration",
            },
            {
                subject: "Corporate Dinner",
                customerName: "Tushar",
                phone: "2342342234",
                date: new Date("2025-09-04"),
                noOfPerson: 24,
                advanceAmount: 5000,
                menu: "Buffet",
                description: "Company event",
            },
        ],
    });

    console.log("Inventory and events seeded.");
}

async function seedFinance() {
    const existing = await prisma.incomeHead.count();
    if (existing > 0) {
        console.log("Finance seed skipped — already exists.");
        return;
    }

    const incomeHead = await prisma.incomeHead.create({
        data: { name: "Miscellaneous Income", description: "Other income sources" },
    });
    await prisma.incomeEntry.create({
        data: {
            headId: incomeHead.id,
            amount: 500,
            note: "Sample income",
            date: new Date(),
        },
    });

    const expenseHead = await prisma.expenseHead.create({
        data: { name: "Staff Bazar", description: "Staff purchases" },
    });
    await prisma.expenseEntry.create({
        data: {
            headId: expenseHead.id,
            amount: 200,
            note: "Weekly supplies",
            date: new Date(),
        },
    });

    console.log("Finance income/expense seeded.");
}

async function seedBankHrDue() {
    const existing = await prisma.bank.count();
    if (existing > 0) {
        console.log("Bank/HR/Due seed skipped — already exists.");
        return;
    }

    const bank = await prisma.bank.create({
        data: { name: "DBBL", description: "Dutch Bangla Bank" },
    });
    const branch = await prisma.bankBranch.create({
        data: { bankId: bank.id, branchName: "Halishahar", address: "Chittagong" },
    });
    const account = await prisma.bankAccount.create({
        data: { branchId: branch.id, accountName: "Main Account", accountNo: "15141", note: "" },
    });
    await prisma.bankTransaction.create({
        data: { accountId: account.id, type: "DEPOSIT", amount: 50000, date: new Date(), note: "Opening deposit" },
    });

    const designation = await prisma.hrDesignation.create({
        data: { name: "General Manager", basicSalary: 25000 },
    });
    await prisma.hrDesignation.createMany({
        data: [{ name: "Waiter", basicSalary: 12000 }, { name: "Cashier", basicSalary: 15000 }],
    });
    await prisma.hrEarningHead.create({ data: { name: "Bonus" } });
    await prisma.hrDeductionHead.create({ data: { name: "Advance" } });

    const employee = await prisma.employee.create({
        data: {
            name: "Amir Hossain",
            contactNo: "01827123671",
            designationId: designation.id,
            status: "ACTIVE",
            hasAccess: true,
        },
    });
    await prisma.employeeBasicSalary.create({
        data: { employeeId: employee.id, amount: 25000, date: new Date(), note: "Monthly basic" },
    });

    await prisma.guestDue.create({
        data: {
            guestName: "John Smith",
            phoneNo: "0123456789",
            totalDueAmount: 1500,
            paymentMethod: "Cash",
            payAmount: 500,
            date: new Date(),
        },
    });

    console.log("Bank, HR, and guest due seeded.");
}

main()
    .catch((error) => {
        console.error("Seed failed:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
