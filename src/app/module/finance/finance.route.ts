import { Router } from "express";
import { ALL_ROLES } from "../../constants/roles";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import * as C from "./finance.controller";
import {
    createEntrySchema,
    createHeadSchema,
    idParamSchema,
    listEntriesQuerySchema,
    listQuerySchema,
    updateEntrySchema,
} from "./finance.validation";

const router = Router();
const auth = checkAuth(...ALL_ROLES);
const v = (schema: Parameters<typeof validateRequest>[0], src: "body" | "query" | "params" = "body") =>
    validateRequest(schema, src);

router.get("/income-heads", auth, v(listQuerySchema, "query"), C.listIncomeHeads);
router.post("/income-heads", auth, v(createHeadSchema), C.createIncomeHead);
router.get("/income-heads/:id", auth, v(idParamSchema, "params"), C.getIncomeHeadById);
router.patch("/income-heads/:id", auth, v(idParamSchema, "params"), v(createHeadSchema.partial()), C.updateIncomeHead);
router.delete("/income-heads/:id", auth, v(idParamSchema, "params"), C.deleteIncomeHead);

router.get("/income-entries", auth, v(listEntriesQuerySchema, "query"), C.listIncomeEntries);
router.post("/income-entries", auth, v(createEntrySchema), C.createIncomeEntry);
router.get("/income-entries/:id", auth, v(idParamSchema, "params"), C.getIncomeEntryById);
router.patch("/income-entries/:id", auth, v(idParamSchema, "params"), v(updateEntrySchema), C.updateIncomeEntry);
router.delete("/income-entries/:id", auth, v(idParamSchema, "params"), C.deleteIncomeEntry);

router.get("/expense-heads", auth, v(listQuerySchema, "query"), C.listExpenseHeads);
router.post("/expense-heads", auth, v(createHeadSchema), C.createExpenseHead);
router.get("/expense-heads/:id", auth, v(idParamSchema, "params"), C.getExpenseHeadById);
router.patch("/expense-heads/:id", auth, v(idParamSchema, "params"), v(createHeadSchema.partial()), C.updateExpenseHead);
router.delete("/expense-heads/:id", auth, v(idParamSchema, "params"), C.deleteExpenseHead);

router.get("/expense-entries", auth, v(listEntriesQuerySchema, "query"), C.listExpenseEntries);
router.post("/expense-entries", auth, v(createEntrySchema), C.createExpenseEntry);
router.get("/expense-entries/:id", auth, v(idParamSchema, "params"), C.getExpenseEntryById);
router.patch("/expense-entries/:id", auth, v(idParamSchema, "params"), v(updateEntrySchema), C.updateExpenseEntry);
router.delete("/expense-entries/:id", auth, v(idParamSchema, "params"), C.deleteExpenseEntry);

export const FinanceRoute = router;
