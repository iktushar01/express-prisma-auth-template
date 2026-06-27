import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { FinanceService } from "./finance.service";

const ok = (res: Response, data: unknown, message: string, meta?: unknown, code = StatusCodes.OK) =>
    sendResponse(res, { statusCode: code, success: true, message, data, meta });

export const listIncomeHeads = catchAsync(async (req, res) => {
    const result = await FinanceService.listIncomeHeads(req.query as any);
    ok(res, result.data, "Income heads fetched", result.meta);
});
export const getIncomeHeadById = catchAsync(async (req, res) => {
    ok(res, await FinanceService.getIncomeHeadById(req.params.id), "Income head fetched");
});
export const createIncomeHead = catchAsync(async (req, res) => {
    ok(res, await FinanceService.createIncomeHead(req.body), "Income head created", undefined, StatusCodes.CREATED);
});
export const updateIncomeHead = catchAsync(async (req, res) => {
    ok(res, await FinanceService.updateIncomeHead(req.params.id, req.body), "Income head updated");
});
export const deleteIncomeHead = catchAsync(async (req, res) => {
    await FinanceService.deleteIncomeHead(req.params.id);
    ok(res, null, "Income head deleted");
});

export const listIncomeEntries = catchAsync(async (req, res) => {
    const result = await FinanceService.listIncomeEntries(req.query as any);
    ok(res, result.data, "Income entries fetched", result.meta);
});
export const getIncomeEntryById = catchAsync(async (req, res) => {
    ok(res, await FinanceService.getIncomeEntryById(req.params.id), "Income entry fetched");
});
export const createIncomeEntry = catchAsync(async (req, res) => {
    ok(res, await FinanceService.createIncomeEntry(req.body), "Income entry created", undefined, StatusCodes.CREATED);
});
export const updateIncomeEntry = catchAsync(async (req, res) => {
    ok(res, await FinanceService.updateIncomeEntry(req.params.id, req.body), "Income entry updated");
});
export const deleteIncomeEntry = catchAsync(async (req, res) => {
    await FinanceService.deleteIncomeEntry(req.params.id);
    ok(res, null, "Income entry deleted");
});

export const listExpenseHeads = catchAsync(async (req, res) => {
    const result = await FinanceService.listExpenseHeads(req.query as any);
    ok(res, result.data, "Expense heads fetched", result.meta);
});
export const getExpenseHeadById = catchAsync(async (req, res) => {
    ok(res, await FinanceService.getExpenseHeadById(req.params.id), "Expense head fetched");
});
export const createExpenseHead = catchAsync(async (req, res) => {
    ok(res, await FinanceService.createExpenseHead(req.body), "Expense head created", undefined, StatusCodes.CREATED);
});
export const updateExpenseHead = catchAsync(async (req, res) => {
    ok(res, await FinanceService.updateExpenseHead(req.params.id, req.body), "Expense head updated");
});
export const deleteExpenseHead = catchAsync(async (req, res) => {
    await FinanceService.deleteExpenseHead(req.params.id);
    ok(res, null, "Expense head deleted");
});

export const listExpenseEntries = catchAsync(async (req, res) => {
    const result = await FinanceService.listExpenseEntries(req.query as any);
    ok(res, result.data, "Expense entries fetched", result.meta);
});
export const getExpenseEntryById = catchAsync(async (req, res) => {
    ok(res, await FinanceService.getExpenseEntryById(req.params.id), "Expense entry fetched");
});
export const createExpenseEntry = catchAsync(async (req, res) => {
    ok(res, await FinanceService.createExpenseEntry(req.body), "Expense entry created", undefined, StatusCodes.CREATED);
});
export const updateExpenseEntry = catchAsync(async (req, res) => {
    ok(res, await FinanceService.updateExpenseEntry(req.params.id, req.body), "Expense entry updated");
});
export const deleteExpenseEntry = catchAsync(async (req, res) => {
    await FinanceService.deleteExpenseEntry(req.params.id);
    ok(res, null, "Expense entry deleted");
});
