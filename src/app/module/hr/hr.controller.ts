import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { HrService } from "./hr.service";

const ok = (res: Response, data: unknown, message: string, meta?: unknown, code = StatusCodes.OK) =>
    sendResponse(res, { statusCode: code, success: true, message, data, meta });

// Designations
export const listDesignations = catchAsync(async (req, res) => {
    const result = await HrService.listDesignations(req.query as any);
    ok(res, result.data, "Designations fetched", result.meta);
});
export const getDesignationById = catchAsync(async (req, res) => {
    ok(res, await HrService.getDesignationById(req.params.id), "Designation fetched");
});
export const createDesignation = catchAsync(async (req, res) => {
    ok(res, await HrService.createDesignation(req.body), "Designation created", undefined, StatusCodes.CREATED);
});
export const updateDesignation = catchAsync(async (req, res) => {
    ok(res, await HrService.updateDesignation(req.params.id, req.body), "Designation updated");
});
export const deleteDesignation = catchAsync(async (req, res) => {
    await HrService.deleteDesignation(req.params.id);
    ok(res, null, "Designation deleted");
});

// Earning Heads
export const listEarningHeads = catchAsync(async (req, res) => {
    const result = await HrService.listEarningHeads(req.query as any);
    ok(res, result.data, "Earning heads fetched", result.meta);
});
export const getEarningHeadById = catchAsync(async (req, res) => {
    ok(res, await HrService.getEarningHeadById(req.params.id), "Earning head fetched");
});
export const createEarningHead = catchAsync(async (req, res) => {
    ok(res, await HrService.createEarningHead(req.body), "Earning head created", undefined, StatusCodes.CREATED);
});
export const updateEarningHead = catchAsync(async (req, res) => {
    ok(res, await HrService.updateEarningHead(req.params.id, req.body), "Earning head updated");
});
export const deleteEarningHead = catchAsync(async (req, res) => {
    await HrService.deleteEarningHead(req.params.id);
    ok(res, null, "Earning head deleted");
});

// Deduction Heads
export const listDeductionHeads = catchAsync(async (req, res) => {
    const result = await HrService.listDeductionHeads(req.query as any);
    ok(res, result.data, "Deduction heads fetched", result.meta);
});
export const getDeductionHeadById = catchAsync(async (req, res) => {
    ok(res, await HrService.getDeductionHeadById(req.params.id), "Deduction head fetched");
});
export const createDeductionHead = catchAsync(async (req, res) => {
    ok(res, await HrService.createDeductionHead(req.body), "Deduction head created", undefined, StatusCodes.CREATED);
});
export const updateDeductionHead = catchAsync(async (req, res) => {
    ok(res, await HrService.updateDeductionHead(req.params.id, req.body), "Deduction head updated");
});
export const deleteDeductionHead = catchAsync(async (req, res) => {
    await HrService.deleteDeductionHead(req.params.id);
    ok(res, null, "Deduction head deleted");
});

// Employees
export const listEmployees = catchAsync(async (req, res) => {
    const result = await HrService.listEmployees(req.query as any);
    ok(res, result.data, "Employees fetched", result.meta);
});
export const getEmployeeById = catchAsync(async (req, res) => {
    ok(res, await HrService.getEmployeeById(req.params.id), "Employee fetched");
});
export const createEmployee = catchAsync(async (req, res) => {
    ok(res, await HrService.createEmployee(req.body), "Employee created", undefined, StatusCodes.CREATED);
});
export const updateEmployee = catchAsync(async (req, res) => {
    ok(res, await HrService.updateEmployee(req.params.id, req.body), "Employee updated");
});
export const deleteEmployee = catchAsync(async (req, res) => {
    await HrService.deleteEmployee(req.params.id);
    ok(res, null, "Employee deleted");
});

// Employee Earnings
export const listEmployeeEarnings = catchAsync(async (req, res) => {
    const result = await HrService.listEmployeeEarnings(req.params.employeeId, req.query as any);
    ok(res, result.data, "Employee earnings fetched", result.meta);
});
export const getEmployeeEarningById = catchAsync(async (req, res) => {
    ok(res, await HrService.getEmployeeEarningById(req.params.employeeId, req.params.id), "Employee earning fetched");
});
export const createEmployeeEarning = catchAsync(async (req, res) => {
    ok(res, await HrService.createEmployeeEarning(req.params.employeeId, req.body), "Employee earning created", undefined, StatusCodes.CREATED);
});
export const updateEmployeeEarning = catchAsync(async (req, res) => {
    ok(res, await HrService.updateEmployeeEarning(req.params.employeeId, req.params.id, req.body), "Employee earning updated");
});
export const deleteEmployeeEarning = catchAsync(async (req, res) => {
    await HrService.deleteEmployeeEarning(req.params.employeeId, req.params.id);
    ok(res, null, "Employee earning deleted");
});

// Employee Deductions
export const listEmployeeDeductions = catchAsync(async (req, res) => {
    const result = await HrService.listEmployeeDeductions(req.params.employeeId, req.query as any);
    ok(res, result.data, "Employee deductions fetched", result.meta);
});
export const getEmployeeDeductionById = catchAsync(async (req, res) => {
    ok(res, await HrService.getEmployeeDeductionById(req.params.employeeId, req.params.id), "Employee deduction fetched");
});
export const createEmployeeDeduction = catchAsync(async (req, res) => {
    ok(res, await HrService.createEmployeeDeduction(req.params.employeeId, req.body), "Employee deduction created", undefined, StatusCodes.CREATED);
});
export const updateEmployeeDeduction = catchAsync(async (req, res) => {
    ok(res, await HrService.updateEmployeeDeduction(req.params.employeeId, req.params.id, req.body), "Employee deduction updated");
});
export const deleteEmployeeDeduction = catchAsync(async (req, res) => {
    await HrService.deleteEmployeeDeduction(req.params.employeeId, req.params.id);
    ok(res, null, "Employee deduction deleted");
});

// Employee Basic Salaries
export const listEmployeeBasicSalaries = catchAsync(async (req, res) => {
    const result = await HrService.listEmployeeBasicSalaries(req.params.employeeId, req.query as any);
    ok(res, result.data, "Employee basic salaries fetched", result.meta);
});
export const getEmployeeBasicSalaryById = catchAsync(async (req, res) => {
    ok(res, await HrService.getEmployeeBasicSalaryById(req.params.employeeId, req.params.id), "Employee basic salary fetched");
});
export const createEmployeeBasicSalary = catchAsync(async (req, res) => {
    ok(res, await HrService.createEmployeeBasicSalary(req.params.employeeId, req.body), "Employee basic salary created", undefined, StatusCodes.CREATED);
});
export const updateEmployeeBasicSalary = catchAsync(async (req, res) => {
    ok(res, await HrService.updateEmployeeBasicSalary(req.params.employeeId, req.params.id, req.body), "Employee basic salary updated");
});
export const deleteEmployeeBasicSalary = catchAsync(async (req, res) => {
    await HrService.deleteEmployeeBasicSalary(req.params.employeeId, req.params.id);
    ok(res, null, "Employee basic salary deleted");
});

// Salary Payments
export const listEmployeeSalaryPayments = catchAsync(async (req, res) => {
    const result = await HrService.listEmployeeSalaryPayments(req.params.employeeId, req.query as any);
    ok(res, result.data, "Salary payments fetched", result.meta);
});
export const getEmployeeSalaryPaymentById = catchAsync(async (req, res) => {
    ok(res, await HrService.getEmployeeSalaryPaymentById(req.params.employeeId, req.params.id), "Salary payment fetched");
});
export const createEmployeeSalaryPayment = catchAsync(async (req, res) => {
    ok(res, await HrService.createEmployeeSalaryPayment(req.params.employeeId, req.body), "Salary payment created", undefined, StatusCodes.CREATED);
});
export const updateEmployeeSalaryPayment = catchAsync(async (req, res) => {
    ok(res, await HrService.updateEmployeeSalaryPayment(req.params.employeeId, req.params.id, req.body), "Salary payment updated");
});
export const deleteEmployeeSalaryPayment = catchAsync(async (req, res) => {
    await HrService.deleteEmployeeSalaryPayment(req.params.employeeId, req.params.id);
    ok(res, null, "Salary payment deleted");
});

// Reports
export const listSalaryPayable = catchAsync(async (req, res) => {
    const result = await HrService.listSalaryPayable(req.query as any);
    ok(res, result.data, "Salary payable list fetched", result.meta);
});
export const getGrandSalaryPayable = catchAsync(async (req, res) => {
    ok(res, await HrService.getGrandSalaryPayable(req.query as any), "Grand salary payable fetched");
});
