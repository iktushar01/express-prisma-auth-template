import { Router } from "express";
import { ALL_ROLES } from "../../constants/roles";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import * as C from "./bank.controller";
import {
    createAccountSchema,
    createBankSchema,
    createBranchSchema,
    createTransactionSchema,
    idParamSchema,
    listAccountsQuerySchema,
    listBranchesQuerySchema,
    listQuerySchema,
    listTransactionsQuerySchema,
    statementsQuerySchema,
    updateAccountSchema,
    updateBankSchema,
    updateBranchSchema,
    updateTransactionSchema,
} from "./bank.validation";

const router = Router();
const auth = checkAuth(...ALL_ROLES);
const v = (schema: Parameters<typeof validateRequest>[0], src: "body" | "query" | "params" = "body") =>
    validateRequest(schema, src);

router.get("/banks", auth, v(listQuerySchema, "query"), C.listBanks);
router.post("/banks", auth, v(createBankSchema), C.createBank);
router.get("/banks/:id", auth, v(idParamSchema, "params"), C.getBankById);
router.patch("/banks/:id", auth, v(idParamSchema, "params"), v(updateBankSchema), C.updateBank);
router.delete("/banks/:id", auth, v(idParamSchema, "params"), C.deleteBank);

router.get("/branches", auth, v(listBranchesQuerySchema, "query"), C.listBranches);
router.post("/branches", auth, v(createBranchSchema), C.createBranch);
router.get("/branches/:id", auth, v(idParamSchema, "params"), C.getBranchById);
router.patch("/branches/:id", auth, v(idParamSchema, "params"), v(updateBranchSchema), C.updateBranch);
router.delete("/branches/:id", auth, v(idParamSchema, "params"), C.deleteBranch);

router.get("/accounts", auth, v(listAccountsQuerySchema, "query"), C.listAccounts);
router.post("/accounts", auth, v(createAccountSchema), C.createAccount);
router.get("/accounts/:id", auth, v(idParamSchema, "params"), C.getAccountById);
router.patch("/accounts/:id", auth, v(idParamSchema, "params"), v(updateAccountSchema), C.updateAccount);
router.delete("/accounts/:id", auth, v(idParamSchema, "params"), C.deleteAccount);

router.get("/transactions", auth, v(listTransactionsQuerySchema, "query"), C.listTransactions);
router.post("/transactions", auth, v(createTransactionSchema), C.createTransaction);
router.get("/transactions/:id", auth, v(idParamSchema, "params"), C.getTransactionById);
router.patch("/transactions/:id", auth, v(idParamSchema, "params"), v(updateTransactionSchema), C.updateTransaction);
router.delete("/transactions/:id", auth, v(idParamSchema, "params"), C.deleteTransaction);

router.get("/statements", auth, v(statementsQuerySchema, "query"), C.getStatement);

export const BankRoute = router;
