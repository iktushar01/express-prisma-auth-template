import { Router } from "express";
import { ALL_ROLES } from "../../constants/roles";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import * as C from "./hr.controller";
import {
    createBasicSalarySchema,
    createDeductionSchema,
    createDesignationSchema,
    createEarningSchema,
    createEmployeeSchema,
    createHeadSchema,
    createSalaryPaymentSchema,
    employeeIdParamSchema,
    employeeRecordParamSchema,
    idParamSchema,
    listEmployeeQuerySchema,
    listEmployeeRecordsQuerySchema,
    listQuerySchema,
} from "./hr.validation";

const router = Router();
const auth = checkAuth(...ALL_ROLES);
const v = (schema: Parameters<typeof validateRequest>[0], src: "body" | "query" | "params" = "body") =>
    validateRequest(schema, src);

// Reports (registered before nested employee routes)
router.get("/salary-payable", auth, v(listQuerySchema, "query"), C.listSalaryPayable);
router.get("/grand-salary-payable", auth, v(listQuerySchema, "query"), C.getGrandSalaryPayable);

// Designations
router.get("/designations", auth, v(listQuerySchema, "query"), C.listDesignations);
router.post("/designations", auth, v(createDesignationSchema), C.createDesignation);
router.get("/designations/:id", auth, v(idParamSchema, "params"), C.getDesignationById);
router.patch("/designations/:id", auth, v(idParamSchema, "params"), v(createDesignationSchema.partial()), C.updateDesignation);
router.delete("/designations/:id", auth, v(idParamSchema, "params"), C.deleteDesignation);

// Earning Heads
router.get("/earning-heads", auth, v(listQuerySchema, "query"), C.listEarningHeads);
router.post("/earning-heads", auth, v(createHeadSchema), C.createEarningHead);
router.get("/earning-heads/:id", auth, v(idParamSchema, "params"), C.getEarningHeadById);
router.patch("/earning-heads/:id", auth, v(idParamSchema, "params"), v(createHeadSchema.partial()), C.updateEarningHead);
router.delete("/earning-heads/:id", auth, v(idParamSchema, "params"), C.deleteEarningHead);

// Deduction Heads
router.get("/deduction-heads", auth, v(listQuerySchema, "query"), C.listDeductionHeads);
router.post("/deduction-heads", auth, v(createHeadSchema), C.createDeductionHead);
router.get("/deduction-heads/:id", auth, v(idParamSchema, "params"), C.getDeductionHeadById);
router.patch("/deduction-heads/:id", auth, v(idParamSchema, "params"), v(createHeadSchema.partial()), C.updateDeductionHead);
router.delete("/deduction-heads/:id", auth, v(idParamSchema, "params"), C.deleteDeductionHead);

// Employees
router.get("/employees", auth, v(listEmployeeQuerySchema, "query"), C.listEmployees);
router.post("/employees", auth, v(createEmployeeSchema), C.createEmployee);
router.get("/employees/:id", auth, v(idParamSchema, "params"), C.getEmployeeById);
router.patch("/employees/:id", auth, v(idParamSchema, "params"), v(createEmployeeSchema.partial()), C.updateEmployee);
router.delete("/employees/:id", auth, v(idParamSchema, "params"), C.deleteEmployee);

// Employee Earnings
router.get("/employees/:employeeId/earnings", auth, v(employeeIdParamSchema, "params"), v(listEmployeeRecordsQuerySchema, "query"), C.listEmployeeEarnings);
router.post("/employees/:employeeId/earnings", auth, v(employeeIdParamSchema, "params"), v(createEarningSchema), C.createEmployeeEarning);
router.get("/employees/:employeeId/earnings/:id", auth, v(employeeRecordParamSchema, "params"), C.getEmployeeEarningById);
router.patch("/employees/:employeeId/earnings/:id", auth, v(employeeRecordParamSchema, "params"), v(createEarningSchema.partial()), C.updateEmployeeEarning);
router.delete("/employees/:employeeId/earnings/:id", auth, v(employeeRecordParamSchema, "params"), C.deleteEmployeeEarning);

// Employee Deductions
router.get("/employees/:employeeId/deductions", auth, v(employeeIdParamSchema, "params"), v(listEmployeeRecordsQuerySchema, "query"), C.listEmployeeDeductions);
router.post("/employees/:employeeId/deductions", auth, v(employeeIdParamSchema, "params"), v(createDeductionSchema), C.createEmployeeDeduction);
router.get("/employees/:employeeId/deductions/:id", auth, v(employeeRecordParamSchema, "params"), C.getEmployeeDeductionById);
router.patch("/employees/:employeeId/deductions/:id", auth, v(employeeRecordParamSchema, "params"), v(createDeductionSchema.partial()), C.updateEmployeeDeduction);
router.delete("/employees/:employeeId/deductions/:id", auth, v(employeeRecordParamSchema, "params"), C.deleteEmployeeDeduction);

// Employee Basic Salaries
router.get("/employees/:employeeId/basic-salaries", auth, v(employeeIdParamSchema, "params"), v(listEmployeeRecordsQuerySchema, "query"), C.listEmployeeBasicSalaries);
router.post("/employees/:employeeId/basic-salaries", auth, v(employeeIdParamSchema, "params"), v(createBasicSalarySchema), C.createEmployeeBasicSalary);
router.get("/employees/:employeeId/basic-salaries/:id", auth, v(employeeRecordParamSchema, "params"), C.getEmployeeBasicSalaryById);
router.patch("/employees/:employeeId/basic-salaries/:id", auth, v(employeeRecordParamSchema, "params"), v(createBasicSalarySchema.partial()), C.updateEmployeeBasicSalary);
router.delete("/employees/:employeeId/basic-salaries/:id", auth, v(employeeRecordParamSchema, "params"), C.deleteEmployeeBasicSalary);

// Salary Payments
router.get("/employees/:employeeId/salary-payments", auth, v(employeeIdParamSchema, "params"), v(listEmployeeRecordsQuerySchema, "query"), C.listEmployeeSalaryPayments);
router.post("/employees/:employeeId/salary-payments", auth, v(employeeIdParamSchema, "params"), v(createSalaryPaymentSchema), C.createEmployeeSalaryPayment);
router.get("/employees/:employeeId/salary-payments/:id", auth, v(employeeRecordParamSchema, "params"), C.getEmployeeSalaryPaymentById);
router.patch("/employees/:employeeId/salary-payments/:id", auth, v(employeeRecordParamSchema, "params"), v(createSalaryPaymentSchema.partial()), C.updateEmployeeSalaryPayment);
router.delete("/employees/:employeeId/salary-payments/:id", auth, v(employeeRecordParamSchema, "params"), C.deleteEmployeeSalaryPayment);

export const HrRoute = router;
