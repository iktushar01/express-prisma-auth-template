import { Router } from "express";
import { ALL_ROLES } from "../../constants/roles";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import * as C from "./due.controller";
import {
    createEntrySchema,
    idParamSchema,
    listQuerySchema,
    updateEntrySchema,
} from "./due.validation";

const router = Router();
const auth = checkAuth(...ALL_ROLES);
const v = (schema: Parameters<typeof validateRequest>[0], src: "body" | "query" | "params" = "body") =>
    validateRequest(schema, src);

router.get("/entries", auth, v(listQuerySchema, "query"), C.listEntries);
router.post("/entries", auth, v(createEntrySchema), C.createEntry);
router.get("/entries/:id", auth, v(idParamSchema, "params"), C.getEntryById);
router.patch("/entries/:id", auth, v(idParamSchema, "params"), v(updateEntrySchema), C.updateEntry);
router.delete("/entries/:id", auth, v(idParamSchema, "params"), C.deleteEntry);

export const DueRoute = router;
