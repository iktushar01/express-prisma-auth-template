import { Router } from "express";
import { ALL_ROLES } from "../../constants/roles";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import * as C from "./inventory.controller";
import {
    createBrandSchema,
    createCategorySchema,
    createEventSchema,
    createInventoryItemSchema,
    createPurchaseSchema,
    createVendorPaymentSchema,
    createStockLocationSchema,
    createSubCategorySchema,
    createUnitSchema,
    createVendorSchema,
    idParamSchema,
    listEventsQuerySchema,
    listQuerySchema,
    listSubCategoriesQuerySchema,
    listStockQuerySchema,
    moveStockSchema,
    stockInSchema,
    stockOutSchema,
    updateEventSchema,
} from "./inventory.validation";

const router = Router();
const auth = checkAuth(...ALL_ROLES);
const v = (schema: Parameters<typeof validateRequest>[0], src: "body" | "query" | "params" = "body") =>
    validateRequest(schema, src);

// Inventory Categories
router.get("/categories", auth, v(listQuerySchema, "query"), C.listCategories);
router.post("/categories", auth, v(createCategorySchema), C.createCategory);
router.get("/categories/:id", auth, v(idParamSchema, "params"), C.getCategoryById);
router.patch("/categories/:id", auth, v(idParamSchema, "params"), v(createCategorySchema.partial()), C.updateCategory);
router.delete("/categories/:id", auth, v(idParamSchema, "params"), C.deleteCategory);

// Sub Categories
router.get("/sub-categories", auth, v(listSubCategoriesQuerySchema, "query"), C.listSubCategories);
router.post("/sub-categories", auth, v(createSubCategorySchema), C.createSubCategory);
router.get("/sub-categories/:id", auth, v(idParamSchema, "params"), C.getSubCategoryById);
router.patch("/sub-categories/:id", auth, v(idParamSchema, "params"), v(createSubCategorySchema.partial()), C.updateSubCategory);
router.delete("/sub-categories/:id", auth, v(idParamSchema, "params"), C.deleteSubCategory);

// Brands
router.get("/brands", auth, v(listQuerySchema, "query"), C.listBrands);
router.post("/brands", auth, v(createBrandSchema), C.createBrand);
router.get("/brands/:id", auth, v(idParamSchema, "params"), C.getBrandById);
router.patch("/brands/:id", auth, v(idParamSchema, "params"), v(createBrandSchema.partial()), C.updateBrand);
router.delete("/brands/:id", auth, v(idParamSchema, "params"), C.deleteBrand);

// Units
router.get("/units", auth, v(listQuerySchema, "query"), C.listUnits);
router.post("/units", auth, v(createUnitSchema), C.createUnit);
router.get("/units/:id", auth, v(idParamSchema, "params"), C.getUnitById);
router.patch("/units/:id", auth, v(idParamSchema, "params"), v(createUnitSchema.partial()), C.updateUnit);
router.delete("/units/:id", auth, v(idParamSchema, "params"), C.deleteUnit);

// Vendors
router.get("/vendors/due-purchases", auth, C.getVendorsWithDuePurchases);
router.get("/vendors", auth, v(listQuerySchema, "query"), C.listVendors);
router.post("/vendors", auth, v(createVendorSchema), C.createVendor);
router.get("/vendors/:id", auth, v(idParamSchema, "params"), C.getVendorById);
router.patch("/vendors/:id", auth, v(idParamSchema, "params"), v(createVendorSchema.partial()), C.updateVendor);
router.delete("/vendors/:id", auth, v(idParamSchema, "params"), C.deleteVendor);

// Stock Locations
router.get("/stock-locations", auth, v(listQuerySchema, "query"), C.listStockLocations);
router.post("/stock-locations", auth, v(createStockLocationSchema), C.createStockLocation);
router.get("/stock-locations/:id", auth, v(idParamSchema, "params"), C.getStockLocationById);
router.patch("/stock-locations/:id", auth, v(idParamSchema, "params"), v(createStockLocationSchema.partial()), C.updateStockLocation);
router.delete("/stock-locations/:id", auth, v(idParamSchema, "params"), C.deleteStockLocation);

// Inventory Items
router.get("/items", auth, v(listQuerySchema, "query"), C.listItems);
router.get("/items/all", auth, C.getAllItems);
router.post("/items", auth, v(createInventoryItemSchema), C.createItem);
router.get("/items/:id", auth, v(idParamSchema, "params"), C.getItemById);
router.patch("/items/:id", auth, v(idParamSchema, "params"), v(createInventoryItemSchema.partial()), C.updateItem);
router.delete("/items/:id", auth, v(idParamSchema, "params"), C.deleteItem);

// Stock operations
router.get("/stock", auth, v(listStockQuerySchema, "query"), C.listStockByLocation);
router.post("/stock/in", auth, v(stockInSchema), C.stockIn);
router.post("/stock/out", auth, v(stockOutSchema), C.stockOut);
router.post("/stock/move", auth, v(moveStockSchema), C.moveStock);

// Purchases
router.get("/purchases", auth, v(listQuerySchema, "query"), C.listPurchases);
router.post("/purchases", auth, v(createPurchaseSchema), C.createPurchase);

// Vendor Payments
router.get("/vendor-payments", auth, v(listQuerySchema, "query"), C.listVendorPayments);
router.post("/vendor-payments", auth, v(createVendorPaymentSchema), C.createVendorPayment);

// Events
router.get("/events", auth, v(listEventsQuerySchema, "query"), C.listEvents);
router.get("/events/today", auth, C.getTodayEvents);
router.get("/events/:id", auth, v(idParamSchema, "params"), C.getEventById);
router.post("/events", auth, v(createEventSchema), C.createEvent);
router.patch("/events/:id", auth, v(idParamSchema, "params"), v(updateEventSchema), C.updateEvent);
router.delete("/events/:id", auth, v(idParamSchema, "params"), C.deleteEvent);

export const InventoryRoute = router;
