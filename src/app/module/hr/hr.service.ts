import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { EmployeeStatus } from "../../lib/prisma-exports";
import { StatusCodes } from "http-status-codes";

const paginate = (query: { page?: number; limit?: number }) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    return { page, limit, skip: (page - 1) * limit, meta: (total: number) => ({ page, limit, total, totalPages: Math.ceil(total / limit) }) };
};

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const getCurrentMonthRange = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end, month: now.getMonth(), year: now.getFullYear() };
};

const formatStatus = (status: EmployeeStatus) => {
    if (status === EmployeeStatus.ACTIVE) return "Active";
    if (status === EmployeeStatus.RETIRED) return "Retired";
    return "Inactive";
};

const formatDesignation = (d: { id: string; name: string; basicSalary: { toString: () => string } }) => ({
    id: d.id,
    ID: d.id,
    name: d.name,
    basic: Number(d.basicSalary) || "",
});

const formatEmployee = (e: {
    id: string;
    name: string;
    contactNo: string;
    status: EmployeeStatus;
    hasAccess: boolean;
    designation: { name: string } | null;
    designationId: string | null;
}) => ({
    id: e.id,
    ID: e.id,
    name: e.name,
    contactNo: e.contactNo,
    status: formatStatus(e.status),
    statusRaw: e.status,
    hasAccess: e.hasAccess,
    access: e.hasAccess,
    designation: e.designation?.name ?? "",
    designationName: e.designation?.name ?? "",
    designationId: e.designationId,
});

const formatEarning = (e: {
    id: string;
    amount: { toString: () => string };
    note: string;
    date: Date;
    head: { name: string };
    employee: { name: string };
}) => ({
    id: e.id,
    ID: e.id,
    earningHeading: e.head.name,
    headName: e.head.name,
    employeeName: e.employee.name,
    particular: e.note,
    note: e.note,
    amount: Number(e.amount),
    monthName: MONTH_NAMES[e.date.getMonth()],
    yearName: e.date.getFullYear(),
    date: e.date.toLocaleString("en-GB"),
    dateISO: e.date.toISOString(),
});

const formatDeduction = (d: {
    id: string;
    amount: { toString: () => string };
    note: string;
    date: Date;
    head: { name: string };
    employee: { name: string };
}) => ({
    id: d.id,
    ID: d.id,
    deductionHeading: d.head.name,
    headName: d.head.name,
    employeeName: d.employee.name,
    particular: d.note,
    note: d.note,
    amount: Number(d.amount),
    monthName: MONTH_NAMES[d.date.getMonth()],
    yearName: d.date.getFullYear(),
    date: d.date.toLocaleString("en-GB"),
    dateISO: d.date.toISOString(),
});

const formatBasicSalary = (b: {
    id: string;
    amount: { toString: () => string };
    note: string;
    date: Date;
    employee: { name: string };
}) => ({
    id: b.id,
    ID: b.id,
    employeeName: b.employee.name,
    amount: Number(b.amount),
    particular: b.note,
    note: b.note,
    monthName: MONTH_NAMES[b.date.getMonth()],
    yearName: b.date.getFullYear(),
    date: b.date.toLocaleString("en-GB"),
    dateISO: b.date.toISOString(),
});

const formatSalaryPayment = (p: {
    id: string;
    amount: { toString: () => string };
    note: string;
    paymentDate: Date;
    paymentMethod: string;
    employee: { name: string };
}) => ({
    id: p.id,
    ID: p.id,
    employeeName: p.employee.name,
    amount: Number(p.amount),
    particular: p.note,
    note: p.note,
    paymentMethod: p.paymentMethod,
    monthName: MONTH_NAMES[p.paymentDate.getMonth()],
    yearName: p.paymentDate.getFullYear(),
    date: p.paymentDate.toLocaleString("en-GB"),
    paymentDate: p.paymentDate.toLocaleString("en-GB"),
    dateISO: p.paymentDate.toISOString(),
});

const sumAmounts = (rows: { amount: { toString: () => string } }[]) =>
    rows.reduce((sum, r) => sum + Number(r.amount), 0);

const getLatestBasicAmount = async (employeeId: string, beforeDate: Date) => {
    const latest = await prisma.employeeBasicSalary.findFirst({
        where: { employeeId, isDeleted: false, date: { lte: beforeDate } },
        orderBy: { date: "desc" },
    });
    if (latest) return Number(latest.amount);

    const employee = await prisma.employee.findFirst({
        where: { id: employeeId, isDeleted: false },
        include: { designation: true },
    });
    return employee?.designation ? Number(employee.designation.basicSalary) : 0;
};

const computeEmployeeSalary = async (employeeId: string) => {
    const { start, end, month, year } = getCurrentMonthRange();

    const [basicAmount, earnings, deductions, payments] = await Promise.all([
        getLatestBasicAmount(employeeId, end),
        prisma.employeeEarning.findMany({
            where: { employeeId, isDeleted: false, date: { gte: start, lte: end } },
        }),
        prisma.employeeDeduction.findMany({
            where: { employeeId, isDeleted: false, date: { gte: start, lte: end } },
        }),
        prisma.salaryPayment.findMany({
            where: { employeeId, isDeleted: false, paymentDate: { gte: start, lte: end } },
        }),
    ]);

    const totalEarnings = sumAmounts(earnings);
    const totalDeductions = sumAmounts(deductions);
    const totalPaid = sumAmounts(payments);
    const salaryPayable = basicAmount + totalEarnings - totalDeductions;
    const netPayable = salaryPayable - totalPaid;

    return {
        basicAmount,
        totalEarnings,
        totalDeductions,
        salaryPayable,
        salaryPaid: totalPaid,
        netPayable,
        due: netPayable,
        month: MONTH_NAMES[month],
        year,
    };
};

const assertEmployee = async (employeeId: string) => {
    const employee = await prisma.employee.findFirst({ where: { id: employeeId, isDeleted: false } });
    if (!employee) throw new AppError(StatusCodes.NOT_FOUND, "Employee not found");
    return employee;
};

// ─── Designations ───────────────────────────────────────────────────────────

const listDesignations = async (query: { search?: string; page?: number; limit?: number }) => {
    const { page, limit, skip, meta } = paginate(query);
    const where = {
        isDeleted: false,
        ...(query.search ? { name: { contains: query.search, mode: "insensitive" as const } } : {}),
    };
    const [rows, total] = await Promise.all([
        prisma.hrDesignation.findMany({ where, orderBy: { name: "asc" }, skip, take: limit }),
        prisma.hrDesignation.count({ where }),
    ]);
    return { data: rows.map(formatDesignation), meta: meta(total) };
};

const getDesignationById = async (id: string) => {
    const row = await prisma.hrDesignation.findFirst({ where: { id, isDeleted: false } });
    if (!row) throw new AppError(StatusCodes.NOT_FOUND, "Designation not found");
    return formatDesignation(row);
};

const createDesignation = async (payload: { name: string; basic?: number; basicSalary?: number }) => {
    const basicSalary = payload.basic ?? payload.basicSalary ?? 0;
    return formatDesignation(await prisma.hrDesignation.create({ data: { name: payload.name, basicSalary } }));
};

const updateDesignation = async (id: string, payload: { name?: string; basic?: number; basicSalary?: number }) => {
    await getDesignationById(id);
    const data: { name?: string; basicSalary?: number } = {};
    if (payload.name !== undefined) data.name = payload.name;
    if (payload.basic !== undefined) data.basicSalary = payload.basic;
    if (payload.basicSalary !== undefined) data.basicSalary = payload.basicSalary;
    return formatDesignation(await prisma.hrDesignation.update({ where: { id }, data }));
};

const deleteDesignation = async (id: string) => {
    await getDesignationById(id);
    return prisma.hrDesignation.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } });
};

// ─── Earning Heads ────────────────────────────────────────────────────────────

const listEarningHeads = async (query: { search?: string; page?: number; limit?: number }) => {
    const { page, limit, skip, meta } = paginate(query);
    const where = {
        isDeleted: false,
        ...(query.search ? { name: { contains: query.search, mode: "insensitive" as const } } : {}),
    };
    const [rows, total] = await Promise.all([
        prisma.hrEarningHead.findMany({ where, orderBy: { name: "asc" }, skip, take: limit }),
        prisma.hrEarningHead.count({ where }),
    ]);
    return {
        data: rows.map((h) => ({ id: h.id, ID: h.id, name: h.name, earningheadname: h.name })),
        meta: meta(total),
    };
};

const getEarningHeadById = async (id: string) => {
    const row = await prisma.hrEarningHead.findFirst({ where: { id, isDeleted: false } });
    if (!row) throw new AppError(StatusCodes.NOT_FOUND, "Earning head not found");
    return { id: row.id, ID: row.id, name: row.name, earningheadname: row.name };
};

const createEarningHead = async (payload: { name: string }) => {
    const row = await prisma.hrEarningHead.create({ data: payload });
    return { id: row.id, ID: row.id, name: row.name, earningheadname: row.name };
};

const updateEarningHead = async (id: string, payload: { name?: string }) => {
    await getEarningHeadById(id);
    const row = await prisma.hrEarningHead.update({ where: { id }, data: payload });
    return { id: row.id, ID: row.id, name: row.name, earningheadname: row.name };
};

const deleteEarningHead = async (id: string) => {
    await getEarningHeadById(id);
    return prisma.hrEarningHead.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } });
};

// ─── Deduction Heads ──────────────────────────────────────────────────────────

const listDeductionHeads = async (query: { search?: string; page?: number; limit?: number }) => {
    const { page, limit, skip, meta } = paginate(query);
    const where = {
        isDeleted: false,
        ...(query.search ? { name: { contains: query.search, mode: "insensitive" as const } } : {}),
    };
    const [rows, total] = await Promise.all([
        prisma.hrDeductionHead.findMany({ where, orderBy: { name: "asc" }, skip, take: limit }),
        prisma.hrDeductionHead.count({ where }),
    ]);
    return {
        data: rows.map((h) => ({ id: h.id, ID: h.id, name: h.name, deductionheadname: h.name })),
        meta: meta(total),
    };
};

const getDeductionHeadById = async (id: string) => {
    const row = await prisma.hrDeductionHead.findFirst({ where: { id, isDeleted: false } });
    if (!row) throw new AppError(StatusCodes.NOT_FOUND, "Deduction head not found");
    return { id: row.id, ID: row.id, name: row.name, deductionheadname: row.name };
};

const createDeductionHead = async (payload: { name: string }) => {
    const row = await prisma.hrDeductionHead.create({ data: payload });
    return { id: row.id, ID: row.id, name: row.name, deductionheadname: row.name };
};

const updateDeductionHead = async (id: string, payload: { name?: string }) => {
    await getDeductionHeadById(id);
    const row = await prisma.hrDeductionHead.update({ where: { id }, data: payload });
    return { id: row.id, ID: row.id, name: row.name, deductionheadname: row.name };
};

const deleteDeductionHead = async (id: string) => {
    await getDeductionHeadById(id);
    return prisma.hrDeductionHead.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } });
};

// ─── Employees ────────────────────────────────────────────────────────────────

const listEmployees = async (query: {
    search?: string;
    status?: EmployeeStatus;
    designationId?: string;
    page?: number;
    limit?: number;
}) => {
    const { page, limit, skip, meta } = paginate(query);
    const where = {
        isDeleted: false,
        ...(query.status ? { status: query.status } : {}),
        ...(query.designationId ? { designationId: query.designationId } : {}),
        ...(query.search ? {
            OR: [
                { name: { contains: query.search, mode: "insensitive" as const } },
                { contactNo: { contains: query.search, mode: "insensitive" as const } },
                { designation: { name: { contains: query.search, mode: "insensitive" as const } } },
            ],
        } : {}),
    };
    const [rows, total] = await Promise.all([
        prisma.employee.findMany({
            where,
            include: { designation: true },
            orderBy: { name: "asc" },
            skip,
            take: limit,
        }),
        prisma.employee.count({ where }),
    ]);
    return { data: rows.map(formatEmployee), meta: meta(total) };
};

const getEmployeeById = async (id: string) => {
    const row = await prisma.employee.findFirst({
        where: { id, isDeleted: false },
        include: { designation: true },
    });
    if (!row) throw new AppError(StatusCodes.NOT_FOUND, "Employee not found");
    return formatEmployee(row);
};

const createEmployee = async (payload: {
    name: string;
    contactNo?: string;
    designationId?: string | null;
    status?: EmployeeStatus;
    hasAccess?: boolean;
}) =>
    formatEmployee(await prisma.employee.create({
        data: {
            name: payload.name,
            contactNo: payload.contactNo ?? "",
            designationId: payload.designationId ?? null,
            status: payload.status ?? EmployeeStatus.ACTIVE,
            hasAccess: payload.hasAccess ?? false,
        },
        include: { designation: true },
    }));

const updateEmployee = async (id: string, payload: Partial<{
    name: string;
    contactNo: string;
    designationId: string | null;
    status: EmployeeStatus;
    hasAccess: boolean;
}>) => {
    await getEmployeeById(id);
    return formatEmployee(await prisma.employee.update({
        where: { id },
        data: payload,
        include: { designation: true },
    }));
};

const deleteEmployee = async (id: string) => {
    await getEmployeeById(id);
    return prisma.employee.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } });
};

// ─── Employee Earnings ────────────────────────────────────────────────────────

const listEmployeeEarnings = async (
    employeeId: string,
    query: { search?: string; headId?: string; from?: string; to?: string; page?: number; limit?: number },
) => {
    await assertEmployee(employeeId);
    const { page, limit, skip, meta } = paginate(query);
    const where = {
        employeeId,
        isDeleted: false,
        ...(query.headId ? { headId: query.headId } : {}),
        ...(query.from || query.to ? {
            date: {
                ...(query.from ? { gte: new Date(query.from) } : {}),
                ...(query.to ? { lte: new Date(query.to) } : {}),
            },
        } : {}),
        ...(query.search ? {
            OR: [
                { note: { contains: query.search, mode: "insensitive" as const } },
                { head: { name: { contains: query.search, mode: "insensitive" as const } } },
            ],
        } : {}),
    };
    const [rows, total] = await Promise.all([
        prisma.employeeEarning.findMany({
            where,
            include: { head: true, employee: true },
            orderBy: { date: "desc" },
            skip,
            take: limit,
        }),
        prisma.employeeEarning.count({ where }),
    ]);
    return {
        data: rows.map((r) => ({ ...formatEarning(r), headId: r.headId })),
        meta: meta(total),
    };
};

const getEmployeeEarningById = async (employeeId: string, id: string) => {
    const row = await prisma.employeeEarning.findFirst({
        where: { id, employeeId, isDeleted: false },
        include: { head: true, employee: true },
    });
    if (!row) throw new AppError(StatusCodes.NOT_FOUND, "Earning record not found");
    return { ...formatEarning(row), headId: row.headId };
};

const createEmployeeEarning = async (
    employeeId: string,
    payload: { headId: string; amount: number; date: string; note?: string },
) => {
    await assertEmployee(employeeId);
    const row = await prisma.employeeEarning.create({
        data: {
            employeeId,
            headId: payload.headId,
            amount: payload.amount,
            date: new Date(payload.date),
            note: payload.note ?? "",
        },
        include: { head: true, employee: true },
    });
    return { ...formatEarning(row), headId: row.headId };
};

const updateEmployeeEarning = async (
    employeeId: string,
    id: string,
    payload: Partial<{ headId: string; amount: number; date: string; note: string }>,
) => {
    await getEmployeeEarningById(employeeId, id);
    const row = await prisma.employeeEarning.update({
        where: { id },
        data: {
            ...payload,
            ...(payload.date ? { date: new Date(payload.date) } : {}),
        },
        include: { head: true, employee: true },
    });
    return { ...formatEarning(row), headId: row.headId };
};

const deleteEmployeeEarning = async (employeeId: string, id: string) => {
    await getEmployeeEarningById(employeeId, id);
    return prisma.employeeEarning.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } });
};

// ─── Employee Deductions ──────────────────────────────────────────────────────

const listEmployeeDeductions = async (
    employeeId: string,
    query: { search?: string; headId?: string; from?: string; to?: string; page?: number; limit?: number },
) => {
    await assertEmployee(employeeId);
    const { page, limit, skip, meta } = paginate(query);
    const where = {
        employeeId,
        isDeleted: false,
        ...(query.headId ? { headId: query.headId } : {}),
        ...(query.from || query.to ? {
            date: {
                ...(query.from ? { gte: new Date(query.from) } : {}),
                ...(query.to ? { lte: new Date(query.to) } : {}),
            },
        } : {}),
        ...(query.search ? {
            OR: [
                { note: { contains: query.search, mode: "insensitive" as const } },
                { head: { name: { contains: query.search, mode: "insensitive" as const } } },
            ],
        } : {}),
    };
    const [rows, total] = await Promise.all([
        prisma.employeeDeduction.findMany({
            where,
            include: { head: true, employee: true },
            orderBy: { date: "desc" },
            skip,
            take: limit,
        }),
        prisma.employeeDeduction.count({ where }),
    ]);
    return {
        data: rows.map((r) => ({ ...formatDeduction(r), headId: r.headId })),
        meta: meta(total),
    };
};

const getEmployeeDeductionById = async (employeeId: string, id: string) => {
    const row = await prisma.employeeDeduction.findFirst({
        where: { id, employeeId, isDeleted: false },
        include: { head: true, employee: true },
    });
    if (!row) throw new AppError(StatusCodes.NOT_FOUND, "Deduction record not found");
    return { ...formatDeduction(row), headId: row.headId };
};

const createEmployeeDeduction = async (
    employeeId: string,
    payload: { headId: string; amount: number; date: string; note?: string },
) => {
    await assertEmployee(employeeId);
    const row = await prisma.employeeDeduction.create({
        data: {
            employeeId,
            headId: payload.headId,
            amount: payload.amount,
            date: new Date(payload.date),
            note: payload.note ?? "",
        },
        include: { head: true, employee: true },
    });
    return { ...formatDeduction(row), headId: row.headId };
};

const updateEmployeeDeduction = async (
    employeeId: string,
    id: string,
    payload: Partial<{ headId: string; amount: number; date: string; note: string }>,
) => {
    await getEmployeeDeductionById(employeeId, id);
    const row = await prisma.employeeDeduction.update({
        where: { id },
        data: {
            ...payload,
            ...(payload.date ? { date: new Date(payload.date) } : {}),
        },
        include: { head: true, employee: true },
    });
    return { ...formatDeduction(row), headId: row.headId };
};

const deleteEmployeeDeduction = async (employeeId: string, id: string) => {
    await getEmployeeDeductionById(employeeId, id);
    return prisma.employeeDeduction.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } });
};

// ─── Employee Basic Salaries ──────────────────────────────────────────────────

const listEmployeeBasicSalaries = async (
    employeeId: string,
    query: { search?: string; from?: string; to?: string; page?: number; limit?: number },
) => {
    await assertEmployee(employeeId);
    const { page, limit, skip, meta } = paginate(query);
    const where = {
        employeeId,
        isDeleted: false,
        ...(query.from || query.to ? {
            date: {
                ...(query.from ? { gte: new Date(query.from) } : {}),
                ...(query.to ? { lte: new Date(query.to) } : {}),
            },
        } : {}),
        ...(query.search ? { note: { contains: query.search, mode: "insensitive" as const } } : {}),
    };
    const [rows, total] = await Promise.all([
        prisma.employeeBasicSalary.findMany({
            where,
            include: { employee: true },
            orderBy: { date: "desc" },
            skip,
            take: limit,
        }),
        prisma.employeeBasicSalary.count({ where }),
    ]);
    return { data: rows.map(formatBasicSalary), meta: meta(total) };
};

const getEmployeeBasicSalaryById = async (employeeId: string, id: string) => {
    const row = await prisma.employeeBasicSalary.findFirst({
        where: { id, employeeId, isDeleted: false },
        include: { employee: true },
    });
    if (!row) throw new AppError(StatusCodes.NOT_FOUND, "Basic salary record not found");
    return formatBasicSalary(row);
};

const createEmployeeBasicSalary = async (
    employeeId: string,
    payload: { amount: number; date: string; note?: string },
) => {
    await assertEmployee(employeeId);
    const row = await prisma.employeeBasicSalary.create({
        data: {
            employeeId,
            amount: payload.amount,
            date: new Date(payload.date),
            note: payload.note ?? "",
        },
        include: { employee: true },
    });
    return formatBasicSalary(row);
};

const updateEmployeeBasicSalary = async (
    employeeId: string,
    id: string,
    payload: Partial<{ amount: number; date: string; note: string }>,
) => {
    await getEmployeeBasicSalaryById(employeeId, id);
    const row = await prisma.employeeBasicSalary.update({
        where: { id },
        data: {
            ...payload,
            ...(payload.date ? { date: new Date(payload.date) } : {}),
        },
        include: { employee: true },
    });
    return formatBasicSalary(row);
};

const deleteEmployeeBasicSalary = async (employeeId: string, id: string) => {
    await getEmployeeBasicSalaryById(employeeId, id);
    return prisma.employeeBasicSalary.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } });
};

// ─── Salary Payments ──────────────────────────────────────────────────────────

const listEmployeeSalaryPayments = async (
    employeeId: string,
    query: { search?: string; from?: string; to?: string; page?: number; limit?: number },
) => {
    await assertEmployee(employeeId);
    const { page, limit, skip, meta } = paginate(query);
    const where = {
        employeeId,
        isDeleted: false,
        ...(query.from || query.to ? {
            paymentDate: {
                ...(query.from ? { gte: new Date(query.from) } : {}),
                ...(query.to ? { lte: new Date(query.to) } : {}),
            },
        } : {}),
        ...(query.search ? {
            OR: [
                { note: { contains: query.search, mode: "insensitive" as const } },
                { paymentMethod: { contains: query.search, mode: "insensitive" as const } },
            ],
        } : {}),
    };
    const [rows, total] = await Promise.all([
        prisma.salaryPayment.findMany({
            where,
            include: { employee: true },
            orderBy: { paymentDate: "desc" },
            skip,
            take: limit,
        }),
        prisma.salaryPayment.count({ where }),
    ]);
    return { data: rows.map(formatSalaryPayment), meta: meta(total) };
};

const getEmployeeSalaryPaymentById = async (employeeId: string, id: string) => {
    const row = await prisma.salaryPayment.findFirst({
        where: { id, employeeId, isDeleted: false },
        include: { employee: true },
    });
    if (!row) throw new AppError(StatusCodes.NOT_FOUND, "Salary payment not found");
    return formatSalaryPayment(row);
};

const createEmployeeSalaryPayment = async (
    employeeId: string,
    payload: { amount: number; paymentDate: string; paymentMethod?: string; note?: string },
) => {
    await assertEmployee(employeeId);
    const row = await prisma.salaryPayment.create({
        data: {
            employeeId,
            amount: payload.amount,
            paymentDate: new Date(payload.paymentDate),
            paymentMethod: payload.paymentMethod ?? "Cash",
            note: payload.note ?? "",
        },
        include: { employee: true },
    });
    return formatSalaryPayment(row);
};

const updateEmployeeSalaryPayment = async (
    employeeId: string,
    id: string,
    payload: Partial<{ amount: number; paymentDate: string; paymentMethod: string; note: string }>,
) => {
    await getEmployeeSalaryPaymentById(employeeId, id);
    const row = await prisma.salaryPayment.update({
        where: { id },
        data: {
            ...payload,
            ...(payload.paymentDate ? { paymentDate: new Date(payload.paymentDate) } : {}),
        },
        include: { employee: true },
    });
    return formatSalaryPayment(row);
};

const deleteEmployeeSalaryPayment = async (employeeId: string, id: string) => {
    await getEmployeeSalaryPaymentById(employeeId, id);
    return prisma.salaryPayment.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } });
};

// ─── Salary Payable Reports ───────────────────────────────────────────────────

const listSalaryPayable = async (query: { search?: string; page?: number; limit?: number }) => {
    const { page, limit, skip, meta } = paginate(query);
    const where = {
        isDeleted: false,
        status: EmployeeStatus.ACTIVE,
        ...(query.search ? { name: { contains: query.search, mode: "insensitive" as const } } : {}),
    };
    const [employees, total] = await Promise.all([
        prisma.employee.findMany({ where, orderBy: { name: "asc" }, skip, take: limit }),
        prisma.employee.count({ where }),
    ]);

    const data = await Promise.all(employees.map(async (employee) => {
        const salary = await computeEmployeeSalary(employee.id);
        return {
            id: employee.id,
            ID: employee.id,
            employeeName: employee.name,
            month: salary.month,
            year: salary.year,
            netPayable: salary.netPayable,
            salaryPayable: salary.salaryPayable,
            salaryPaid: salary.salaryPaid,
        };
    }));

    return { data, meta: meta(total) };
};

const getGrandSalaryPayable = async (query: { search?: string }) => {
    const where = {
        isDeleted: false,
        status: EmployeeStatus.ACTIVE,
        ...(query.search ? { name: { contains: query.search, mode: "insensitive" as const } } : {}),
    };
    const employees = await prisma.employee.findMany({ where, orderBy: { name: "asc" } });

    const rows = await Promise.all(employees.map(async (employee) => {
        const salary = await computeEmployeeSalary(employee.id);
        return {
            employeeId: employee.id,
            employeeName: employee.name,
            salaryPayable: salary.salaryPayable,
            salaryPaid: salary.salaryPaid,
            due: salary.due,
        };
    }));

    const totals = rows.reduce(
        (acc, row) => ({
            salaryPayable: acc.salaryPayable + row.salaryPayable,
            salaryPaid: acc.salaryPaid + row.salaryPaid,
            due: acc.due + row.due,
        }),
        { salaryPayable: 0, salaryPaid: 0, due: 0 },
    );

    return {
        rows,
        totals: {
            totalSalaryPayable: totals.salaryPayable,
            totalSalaryPaid: totals.salaryPaid,
            totalSalaryDue: totals.due,
            salaryPayable: totals.salaryPayable,
            salaryPaid: totals.salaryPaid,
            due: totals.due,
        },
    };
};

export const HrService = {
    listDesignations, getDesignationById, createDesignation, updateDesignation, deleteDesignation,
    listEarningHeads, getEarningHeadById, createEarningHead, updateEarningHead, deleteEarningHead,
    listDeductionHeads, getDeductionHeadById, createDeductionHead, updateDeductionHead, deleteDeductionHead,
    listEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee,
    listEmployeeEarnings, getEmployeeEarningById, createEmployeeEarning, updateEmployeeEarning, deleteEmployeeEarning,
    listEmployeeDeductions, getEmployeeDeductionById, createEmployeeDeduction, updateEmployeeDeduction, deleteEmployeeDeduction,
    listEmployeeBasicSalaries, getEmployeeBasicSalaryById, createEmployeeBasicSalary, updateEmployeeBasicSalary, deleteEmployeeBasicSalary,
    listEmployeeSalaryPayments, getEmployeeSalaryPaymentById, createEmployeeSalaryPayment, updateEmployeeSalaryPayment, deleteEmployeeSalaryPayment,
    listSalaryPayable, getGrandSalaryPayable,
};
