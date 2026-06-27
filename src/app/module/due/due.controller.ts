import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { DueService } from "./due.service";

const ok = (res: Response, data: unknown, message: string, meta?: unknown, code = StatusCodes.OK) =>
    sendResponse(res, { statusCode: code, success: true, message, data, meta });

export const listEntries = catchAsync(async (req, res) => {
    const result = await DueService.listEntries(req.query as any);
    ok(res, result.data, "Due entries fetched", result.meta);
});

export const getEntryById = catchAsync(async (req, res) => {
    ok(res, await DueService.getEntryById(req.params.id), "Due entry fetched");
});

export const createEntry = catchAsync(async (req, res) => {
    ok(res, await DueService.createEntry(req.body), "Due entry created", undefined, StatusCodes.CREATED);
});

export const updateEntry = catchAsync(async (req, res) => {
    ok(res, await DueService.updateEntry(req.params.id, req.body), "Due entry updated");
});

export const deleteEntry = catchAsync(async (req, res) => {
    await DueService.deleteEntry(req.params.id);
    ok(res, null, "Due entry deleted");
});
