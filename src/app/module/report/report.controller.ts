import { Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { ReportService } from "./report.service";

const ok = (res: Response, data: unknown, message: string) =>
    sendResponse(res, { statusCode: 200, success: true, message, data });

export const getCurrentReport = catchAsync(async (_req, res) => {
    ok(res, await ReportService.getCurrentReport(), "Current report fetched");
});

export const getDailyReport = catchAsync(async (req, res) => {
    ok(res, await ReportService.getDailyReport(req.query.date as string), "Daily report fetched");
});
