import { Router } from "express";
import { ALL_ROLES } from "../../constants/roles";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import * as C from "./report.controller";
import { dailyReportQuerySchema } from "./report.validation";

const router = Router();
const auth = checkAuth(...ALL_ROLES);
const v = (schema: Parameters<typeof validateRequest>[0], src: "body" | "query" | "params" = "body") =>
    validateRequest(schema, src);

router.get("/current", auth, C.getCurrentReport);
router.get("/daily", auth, v(dailyReportQuerySchema, "query"), C.getDailyReport);

export const ReportRoute = router;
