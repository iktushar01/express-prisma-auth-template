import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { BankService } from "./bank.service";

const ok = (res: Response, data: unknown, message: string, meta?: unknown, code = StatusCodes.OK) =>
    sendResponse(res, { statusCode: code, success: true, message, data, meta });

export const listBanks = catchAsync(async (req, res) => {
    const result = await BankService.listBanks(req.query as any);
    ok(res, result.data, "Banks fetched", result.meta);
});

export const getBankById = catchAsync(async (req, res) => {
    ok(res, await BankService.getBankById(req.params.id), "Bank fetched");
});

export const createBank = catchAsync(async (req, res) => {
    ok(res, await BankService.createBank(req.body), "Bank created", undefined, StatusCodes.CREATED);
});

export const updateBank = catchAsync(async (req, res) => {
    ok(res, await BankService.updateBank(req.params.id, req.body), "Bank updated");
});

export const deleteBank = catchAsync(async (req, res) => {
    await BankService.deleteBank(req.params.id);
    ok(res, null, "Bank deleted");
});

export const listBranches = catchAsync(async (req, res) => {
    const result = await BankService.listBranches(req.query as any);
    ok(res, result.data, "Bank branches fetched", result.meta);
});

export const getBranchById = catchAsync(async (req, res) => {
    ok(res, await BankService.getBranchById(req.params.id), "Bank branch fetched");
});

export const createBranch = catchAsync(async (req, res) => {
    ok(res, await BankService.createBranch(req.body), "Bank branch created", undefined, StatusCodes.CREATED);
});

export const updateBranch = catchAsync(async (req, res) => {
    ok(res, await BankService.updateBranch(req.params.id, req.body), "Bank branch updated");
});

export const deleteBranch = catchAsync(async (req, res) => {
    await BankService.deleteBranch(req.params.id);
    ok(res, null, "Bank branch deleted");
});

export const listAccounts = catchAsync(async (req, res) => {
    const result = await BankService.listAccounts(req.query as any);
    ok(res, result.data, "Bank accounts fetched", result.meta);
});

export const getAccountById = catchAsync(async (req, res) => {
    ok(res, await BankService.getAccountById(req.params.id), "Bank account fetched");
});

export const createAccount = catchAsync(async (req, res) => {
    ok(res, await BankService.createAccount(req.body), "Bank account created", undefined, StatusCodes.CREATED);
});

export const updateAccount = catchAsync(async (req, res) => {
    ok(res, await BankService.updateAccount(req.params.id, req.body), "Bank account updated");
});

export const deleteAccount = catchAsync(async (req, res) => {
    await BankService.deleteAccount(req.params.id);
    ok(res, null, "Bank account deleted");
});

export const listTransactions = catchAsync(async (req, res) => {
    const result = await BankService.listTransactions(req.query as any);
    ok(res, result.data, "Bank transactions fetched", result.meta);
});

export const getTransactionById = catchAsync(async (req, res) => {
    ok(res, await BankService.getTransactionById(req.params.id), "Bank transaction fetched");
});

export const createTransaction = catchAsync(async (req, res) => {
    ok(res, await BankService.createTransaction(req.body), "Bank transaction created", undefined, StatusCodes.CREATED);
});

export const updateTransaction = catchAsync(async (req, res) => {
    ok(res, await BankService.updateTransaction(req.params.id, req.body), "Bank transaction updated");
});

export const deleteTransaction = catchAsync(async (req, res) => {
    await BankService.deleteTransaction(req.params.id);
    ok(res, null, "Bank transaction deleted");
});

export const getStatement = catchAsync(async (req, res) => {
    ok(res, await BankService.getStatement(req.query as any), "Bank statement fetched");
});
