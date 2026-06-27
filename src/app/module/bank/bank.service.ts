import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";

const paginate = (query: { page?: number; limit?: number }) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    return { page, limit, skip: (page - 1) * limit, meta: (total: number) => ({ page, limit, total, totalPages: Math.ceil(total / limit) }) };
};

const accountInclude = {
    branch: { include: { bank: true } },
} as const;

const branchInclude = { bank: true } as const;

const formatBank = (b: { id: string; name: string; description: string }) => ({
    id: b.id,
    ID: b.id,
    bankName: b.name,
    description: b.description,
});

const formatBranch = (b: {
    id: string;
    branchName: string;
    address: string;
    bankId: string;
    bank?: { name: string };
}) => ({
    id: b.id,
    ID: b.id,
    branchName: b.branchName,
    bankName: b.bank?.name ?? "",
    address: b.address,
    bankId: b.bankId,
});

const formatAccount = (a: {
    id: string;
    accountName: string;
    accountNo: string;
    note: string;
    branchId: string;
    branch?: { branchName: string; bank?: { name: string } };
}) => ({
    id: a.id,
    ID: a.id,
    accountName: a.accountName,
    accountNo: a.accountNo,
    bankName: a.branch?.bank?.name ?? "",
    branchName: a.branch?.branchName ?? "",
    note: a.note,
    branchId: a.branchId,
});

const formatTransaction = (t: {
    id: string;
    type: string;
    amount: { toString: () => string };
    date: Date;
    note: string;
    accountId: string;
}) => ({
    id: t.id,
    ID: t.id,
    type: t.type,
    amount: Number(t.amount),
    date: t.date.toLocaleDateString("en-GB"),
    note: t.note,
    accountId: t.accountId,
});

const assertBankExists = async (id: string) => {
    const row = await prisma.bank.findFirst({ where: { id, isDeleted: false } });
    if (!row) throw new AppError(StatusCodes.NOT_FOUND, "Bank not found");
    return row;
};

const assertBranchExists = async (id: string) => {
    const row = await prisma.bankBranch.findFirst({
        where: { id, isDeleted: false },
        include: branchInclude,
    });
    if (!row) throw new AppError(StatusCodes.NOT_FOUND, "Bank branch not found");
    return row;
};

const assertAccountExists = async (id: string) => {
    const row = await prisma.bankAccount.findFirst({
        where: { id, isDeleted: false },
        include: accountInclude,
    });
    if (!row) throw new AppError(StatusCodes.NOT_FOUND, "Bank account not found");
    return row;
};

// ─── Banks ────────────────────────────────────────────────────────────────────

const listBanks = async (query: { search?: string; page?: number; limit?: number }) => {
    const { page, limit, skip, meta } = paginate(query);
    const where = {
        isDeleted: false,
        ...(query.search ? { name: { contains: query.search, mode: "insensitive" as const } } : {}),
    };
    const [rows, total] = await Promise.all([
        prisma.bank.findMany({ where, orderBy: { name: "asc" }, skip, take: limit }),
        prisma.bank.count({ where }),
    ]);
    return { data: rows.map(formatBank), meta: meta(total) };
};

const getBankById = async (id: string) => formatBank(await assertBankExists(id));

const createBank = async (payload: { bankName: string; description?: string }) =>
    formatBank(
        await prisma.bank.create({
            data: { name: payload.bankName, description: payload.description ?? "" },
        }),
    );

const updateBank = async (id: string, payload: { bankName?: string; description?: string }) => {
    await assertBankExists(id);
    return formatBank(
        await prisma.bank.update({
            where: { id },
            data: {
                ...(payload.bankName !== undefined ? { name: payload.bankName } : {}),
                ...(payload.description !== undefined ? { description: payload.description } : {}),
            },
        }),
    );
};

const deleteBank = async (id: string) => {
    await assertBankExists(id);
    return prisma.bank.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } });
};

// ─── Branches ─────────────────────────────────────────────────────────────────

const listBranches = async (query: { search?: string; bankId?: string; page?: number; limit?: number }) => {
    const { page, limit, skip, meta } = paginate(query);
    const where = {
        isDeleted: false,
        ...(query.bankId ? { bankId: query.bankId } : {}),
        ...(query.search
            ? {
                  OR: [
                      { branchName: { contains: query.search, mode: "insensitive" as const } },
                      { address: { contains: query.search, mode: "insensitive" as const } },
                      { bank: { name: { contains: query.search, mode: "insensitive" as const } } },
                  ],
              }
            : {}),
    };
    const [rows, total] = await Promise.all([
        prisma.bankBranch.findMany({ where, include: branchInclude, orderBy: { branchName: "asc" }, skip, take: limit }),
        prisma.bankBranch.count({ where }),
    ]);
    return { data: rows.map(formatBranch), meta: meta(total) };
};

const getBranchById = async (id: string) => formatBranch(await assertBranchExists(id));

const createBranch = async (payload: { bankId: string; branchName: string; address?: string }) => {
    await assertBankExists(payload.bankId);
    return formatBranch(
        await prisma.bankBranch.create({
            data: {
                bankId: payload.bankId,
                branchName: payload.branchName,
                address: payload.address ?? "",
            },
            include: branchInclude,
        }),
    );
};

const updateBranch = async (
    id: string,
    payload: Partial<{ bankId: string; branchName: string; address: string }>,
) => {
    await assertBranchExists(id);
    if (payload.bankId) await assertBankExists(payload.bankId);
    return formatBranch(
        await prisma.bankBranch.update({
            where: { id },
            data: payload,
            include: branchInclude,
        }),
    );
};

const deleteBranch = async (id: string) => {
    await assertBranchExists(id);
    return prisma.bankBranch.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } });
};

// ─── Accounts ─────────────────────────────────────────────────────────────────

const listAccounts = async (query: { search?: string; branchId?: string; page?: number; limit?: number }) => {
    const { page, limit, skip, meta } = paginate(query);
    const where = {
        isDeleted: false,
        ...(query.branchId ? { branchId: query.branchId } : {}),
        ...(query.search
            ? {
                  OR: [
                      { accountName: { contains: query.search, mode: "insensitive" as const } },
                      { accountNo: { contains: query.search, mode: "insensitive" as const } },
                      { note: { contains: query.search, mode: "insensitive" as const } },
                      { branch: { branchName: { contains: query.search, mode: "insensitive" as const } } },
                      { branch: { bank: { name: { contains: query.search, mode: "insensitive" as const } } } },
                  ],
              }
            : {}),
    };
    const [rows, total] = await Promise.all([
        prisma.bankAccount.findMany({ where, include: accountInclude, orderBy: { accountName: "asc" }, skip, take: limit }),
        prisma.bankAccount.count({ where }),
    ]);
    return { data: rows.map(formatAccount), meta: meta(total) };
};

const getAccountById = async (id: string) => formatAccount(await assertAccountExists(id));

const createAccount = async (payload: { branchId: string; accountName: string; accountNo: string; note?: string }) => {
    await assertBranchExists(payload.branchId);
    return formatAccount(
        await prisma.bankAccount.create({
            data: {
                branchId: payload.branchId,
                accountName: payload.accountName,
                accountNo: payload.accountNo,
                note: payload.note ?? "",
            },
            include: accountInclude,
        }),
    );
};

const updateAccount = async (
    id: string,
    payload: Partial<{ branchId: string; accountName: string; accountNo: string; note: string }>,
) => {
    await assertAccountExists(id);
    if (payload.branchId) await assertBranchExists(payload.branchId);
    return formatAccount(
        await prisma.bankAccount.update({
            where: { id },
            data: payload,
            include: accountInclude,
        }),
    );
};

const deleteAccount = async (id: string) => {
    await assertAccountExists(id);
    return prisma.bankAccount.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } });
};

// ─── Transactions ─────────────────────────────────────────────────────────────

const listTransactions = async (query: {
    search?: string;
    accountId?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
}) => {
    const { page, limit, skip, meta } = paginate(query);
    const where = {
        isDeleted: false,
        ...(query.accountId ? { accountId: query.accountId } : {}),
        ...(query.from || query.to
            ? {
                  date: {
                      ...(query.from ? { gte: new Date(query.from) } : {}),
                      ...(query.to ? { lte: new Date(query.to) } : {}),
                  },
              }
            : {}),
        ...(query.search ? { note: { contains: query.search, mode: "insensitive" as const } } : {}),
    };
    const [rows, total] = await Promise.all([
        prisma.bankTransaction.findMany({ where, orderBy: [{ date: "desc" }, { createdAt: "desc" }], skip, take: limit }),
        prisma.bankTransaction.count({ where }),
    ]);
    return { data: rows.map(formatTransaction), meta: meta(total) };
};

const getTransactionById = async (id: string) => {
    const row = await prisma.bankTransaction.findFirst({ where: { id, isDeleted: false } });
    if (!row) throw new AppError(StatusCodes.NOT_FOUND, "Bank transaction not found");
    return formatTransaction(row);
};

const createTransaction = async (payload: {
    accountId: string;
    type: "DEPOSIT" | "WITHDRAW";
    amount: number;
    date: string;
    note?: string;
}) => {
    await assertAccountExists(payload.accountId);
    return formatTransaction(
        await prisma.bankTransaction.create({
            data: {
                accountId: payload.accountId,
                type: payload.type,
                amount: payload.amount,
                date: new Date(payload.date),
                note: payload.note ?? "",
            },
        }),
    );
};

const updateTransaction = async (
    id: string,
    payload: Partial<{ accountId: string; type: "DEPOSIT" | "WITHDRAW"; amount: number; date: string; note: string }>,
) => {
    await getTransactionById(id);
    if (payload.accountId) await assertAccountExists(payload.accountId);
    return formatTransaction(
        await prisma.bankTransaction.update({
            where: { id },
            data: {
                ...payload,
                ...(payload.date ? { date: new Date(payload.date) } : {}),
            },
        }),
    );
};

const deleteTransaction = async (id: string) =>
    prisma.bankTransaction.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } });

// ─── Statements ───────────────────────────────────────────────────────────────

const getStatement = async (query: { accountId: string; from: string; to: string }) => {
    const account = await assertAccountExists(query.accountId);
    const fromDate = new Date(query.from);
    const toDate = new Date(query.to);

    const priorTransactions = await prisma.bankTransaction.findMany({
        where: {
            accountId: query.accountId,
            isDeleted: false,
            date: { lt: fromDate },
        },
    });

    const openingBalance = priorTransactions.reduce((balance, txn) => {
        const amount = Number(txn.amount);
        return txn.type === "DEPOSIT" ? balance + amount : balance - amount;
    }, 0);

    const periodTransactions = await prisma.bankTransaction.findMany({
        where: {
            accountId: query.accountId,
            isDeleted: false,
            date: { gte: fromDate, lte: toDate },
        },
        orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    });

    let runningBalance = openingBalance;
    let totalDeposits = 0;
    let totalWithdrawals = 0;

    const transactions = periodTransactions.map((txn) => {
        const amount = Number(txn.amount);
        const deposit = txn.type === "DEPOSIT" ? amount : 0;
        const withdrawn = txn.type === "WITHDRAW" ? amount : 0;

        totalDeposits += deposit;
        totalWithdrawals += withdrawn;
        runningBalance = txn.type === "DEPOSIT" ? runningBalance + amount : runningBalance - amount;

        return {
            ...formatTransaction(txn),
            deposit,
            withdrawn,
            balance: runningBalance,
        };
    });

    return {
        account: formatAccount(account),
        summary: {
            openingBalance,
            totalDeposits,
            totalWithdrawals,
            closingBalance: runningBalance,
        },
        transactions,
    };
};

export const BankService = {
    listBanks,
    getBankById,
    createBank,
    updateBank,
    deleteBank,
    listBranches,
    getBranchById,
    createBranch,
    updateBranch,
    deleteBranch,
    listAccounts,
    getAccountById,
    createAccount,
    updateAccount,
    deleteAccount,
    listTransactions,
    getTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getStatement,
};
