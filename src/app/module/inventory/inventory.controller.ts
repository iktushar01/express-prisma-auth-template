import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { InventoryService } from "./inventory.service";

const ok = (res: Response, data: unknown, message: string, meta?: unknown, code = StatusCodes.OK) =>
    sendResponse(res, { statusCode: code, success: true, message, data, meta });

// Categories
export const listCategories = catchAsync(async (req, res) => {
    const result = await InventoryService.listCategories(req.query as any);
    ok(res, result.data, "Categories fetched", result.meta);
});
export const createCategory = catchAsync(async (req, res) => {
    const data = await InventoryService.createCategory(req.body);
    ok(res, data, "Category created", undefined, StatusCodes.CREATED);
});
export const getCategoryById = catchAsync(async (req, res) => {
    ok(res, await InventoryService.getCategoryById(req.params.id), "Category fetched");
});
export const updateCategory = catchAsync(async (req, res) => {
    ok(res, await InventoryService.updateCategory(req.params.id, req.body), "Category updated");
});
export const deleteCategory = catchAsync(async (req, res) => {
    await InventoryService.deleteCategory(req.params.id);
    ok(res, null, "Category deleted");
});

// Sub Categories
export const listSubCategories = catchAsync(async (req, res) => {
    const result = await InventoryService.listSubCategories(req.query as any);
    ok(res, result.data, "Sub-categories fetched", result.meta);
});
export const createSubCategory = catchAsync(async (req, res) => {
    ok(res, await InventoryService.createSubCategory(req.body), "Sub-category created", undefined, StatusCodes.CREATED);
});
export const getSubCategoryById = catchAsync(async (req, res) => {
    ok(res, await InventoryService.getSubCategoryById(req.params.id), "Sub-category fetched");
});
export const updateSubCategory = catchAsync(async (req, res) => {
    ok(res, await InventoryService.updateSubCategory(req.params.id, req.body), "Sub-category updated");
});
export const deleteSubCategory = catchAsync(async (req, res) => {
    await InventoryService.deleteSubCategory(req.params.id);
    ok(res, null, "Sub-category deleted");
});

// Brands
export const listBrands = catchAsync(async (req, res) => {
    const result = await InventoryService.listBrands(req.query as any);
    ok(res, result.data, "Brands fetched", result.meta);
});
export const createBrand = catchAsync(async (req, res) => {
    ok(res, await InventoryService.createBrand(req.body), "Brand created", undefined, StatusCodes.CREATED);
});
export const getBrandById = catchAsync(async (req, res) => {
    ok(res, await InventoryService.getBrandById(req.params.id), "Brand fetched");
});
export const updateBrand = catchAsync(async (req, res) => {
    ok(res, await InventoryService.updateBrand(req.params.id, req.body), "Brand updated");
});
export const deleteBrand = catchAsync(async (req, res) => {
    await InventoryService.deleteBrand(req.params.id);
    ok(res, null, "Brand deleted");
});

// Units
export const listUnits = catchAsync(async (req, res) => {
    const result = await InventoryService.listUnits(req.query as any);
    ok(res, result.data, "Units fetched", result.meta);
});
export const createUnit = catchAsync(async (req, res) => {
    ok(res, await InventoryService.createUnit(req.body), "Unit created", undefined, StatusCodes.CREATED);
});
export const getUnitById = catchAsync(async (req, res) => {
    ok(res, await InventoryService.getUnitById(req.params.id), "Unit fetched");
});
export const updateUnit = catchAsync(async (req, res) => {
    ok(res, await InventoryService.updateUnit(req.params.id, req.body), "Unit updated");
});
export const deleteUnit = catchAsync(async (req, res) => {
    await InventoryService.deleteUnit(req.params.id);
    ok(res, null, "Unit deleted");
});

// Vendors
export const listVendors = catchAsync(async (req, res) => {
    const result = await InventoryService.listVendors(req.query as any);
    ok(res, result.data, "Vendors fetched", result.meta);
});
export const createVendor = catchAsync(async (req, res) => {
    ok(res, await InventoryService.createVendor(req.body), "Vendor created", undefined, StatusCodes.CREATED);
});
export const getVendorById = catchAsync(async (req, res) => {
    ok(res, await InventoryService.getVendorById(req.params.id), "Vendor fetched");
});
export const updateVendor = catchAsync(async (req, res) => {
    ok(res, await InventoryService.updateVendor(req.params.id, req.body), "Vendor updated");
});
export const deleteVendor = catchAsync(async (req, res) => {
    await InventoryService.deleteVendor(req.params.id);
    ok(res, null, "Vendor deleted");
});

// Stock Locations
export const listStockLocations = catchAsync(async (req, res) => {
    const result = await InventoryService.listStockLocations(req.query as any);
    ok(res, result.data, "Stock locations fetched", result.meta);
});
export const createStockLocation = catchAsync(async (req, res) => {
    ok(res, await InventoryService.createStockLocation(req.body), "Stock location created", undefined, StatusCodes.CREATED);
});
export const getStockLocationById = catchAsync(async (req, res) => {
    ok(res, await InventoryService.getStockLocationById(req.params.id), "Stock location fetched");
});
export const updateStockLocation = catchAsync(async (req, res) => {
    ok(res, await InventoryService.updateStockLocation(req.params.id, req.body), "Stock location updated");
});
export const deleteStockLocation = catchAsync(async (req, res) => {
    await InventoryService.deleteStockLocation(req.params.id);
    ok(res, null, "Stock location deleted");
});

// Items
export const listItems = catchAsync(async (req, res) => {
    const result = await InventoryService.listItems(req.query as any);
    ok(res, result.data, "Inventory items fetched", result.meta);
});
export const getAllItems = catchAsync(async (_req, res) => {
    ok(res, await InventoryService.getAllItems(), "Inventory items fetched");
});
export const getItemById = catchAsync(async (req, res) => {
    ok(res, await InventoryService.getItemById(req.params.id), "Item fetched");
});
export const createItem = catchAsync(async (req, res) => {
    ok(res, await InventoryService.createItem(req.body), "Item created", undefined, StatusCodes.CREATED);
});
export const updateItem = catchAsync(async (req, res) => {
    ok(res, await InventoryService.updateItem(req.params.id, req.body), "Item updated");
});
export const deleteItem = catchAsync(async (req, res) => {
    await InventoryService.deleteItem(req.params.id);
    ok(res, null, "Item deleted");
});

// Stock ops
export const stockIn = catchAsync(async (req, res) => {
    await InventoryService.stockIn(req.body);
    ok(res, null, "Stock in recorded");
});
export const stockOut = catchAsync(async (req, res) => {
    await InventoryService.stockOut(req.body);
    ok(res, null, "Stock out recorded");
});
export const moveStock = catchAsync(async (req, res) => {
    await InventoryService.moveStock(req.body);
    ok(res, null, "Stock moved");
});
export const listStockByLocation = catchAsync(async (req, res) => {
    ok(res, await InventoryService.listStockByLocation(req.query as { locationId?: string; itemId?: string }), "Stock fetched");
});

// Purchases
export const listPurchases = catchAsync(async (req, res) => {
    const result = await InventoryService.listPurchases(req.query as any);
    ok(res, result.data, "Purchases fetched", result.meta);
});
export const createPurchase = catchAsync(async (req, res) => {
    ok(res, await InventoryService.createPurchase(req.body), "Purchase created", undefined, StatusCodes.CREATED);
});

// Events
export const listEvents = catchAsync(async (req, res) => {
    const result = await InventoryService.listEvents(req.query as any);
    ok(res, result.data, "Events fetched", result.meta);
});
export const getTodayEvents = catchAsync(async (_req, res) => {
    ok(res, await InventoryService.getTodayEvents(), "Today's events fetched");
});
export const getEventById = catchAsync(async (req, res) => {
    ok(res, await InventoryService.getEventById(req.params.id), "Event fetched");
});
export const createEvent = catchAsync(async (req, res) => {
    ok(res, await InventoryService.createEvent(req.body), "Event created", undefined, StatusCodes.CREATED);
});
export const updateEvent = catchAsync(async (req, res) => {
    ok(res, await InventoryService.updateEvent(req.params.id, req.body), "Event updated");
});
export const deleteEvent = catchAsync(async (req, res) => {
    await InventoryService.deleteEvent(req.params.id);
    ok(res, null, "Event deleted");
});

export const listVendorPayments = catchAsync(async (req, res) => {
    const result = await InventoryService.listVendorPayments(req.query as any);
    ok(res, result.data, "Vendor payments fetched", result.meta);
});

export const createVendorPayment = catchAsync(async (req, res) => {
    ok(res, await InventoryService.createVendorPayment(req.body), "Vendor payment created", undefined, StatusCodes.CREATED);
});

export const getVendorsWithDuePurchases = catchAsync(async (_req, res) => {
    ok(res, await InventoryService.getVendorsWithDuePurchases(), "Vendors with due purchases fetched");
});
