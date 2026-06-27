import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { StatusCodes } from "http-status-codes";

interface IListFoodCategories {
    search?: string;
    page?: number;
    limit?: number;
}

interface ICreateFoodCategory {
    name: string;
    note?: string;
    serialNo: number;
}

interface IUpdateFoodCategory {
    name?: string;
    note?: string;
    serialNo?: number;
}

const listFoodCategories = async (query: IListFoodCategories) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where = {
        isDeleted: false,
        ...(query.search
            ? {
                  OR: [
                      { name: { contains: query.search, mode: "insensitive" as const } },
                      { note: { contains: query.search, mode: "insensitive" as const } },
                  ],
              }
            : {}),
    };

    const [categories, total] = await Promise.all([
        prisma.foodCategory.findMany({
            where,
            orderBy: { serialNo: "asc" },
            skip,
            take: limit,
        }),
        prisma.foodCategory.count({ where }),
    ]);

    return {
        categories,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

const getAllFoodCategories = async () => {
    return prisma.foodCategory.findMany({
        where: { isDeleted: false },
        orderBy: { serialNo: "asc" },
    });
};

const getFoodCategoryById = async (id: string) => {
    const category = await prisma.foodCategory.findFirst({
        where: { id, isDeleted: false },
    });

    if (!category) {
        throw new AppError(StatusCodes.NOT_FOUND, "Food category not found");
    }

    return category;
};

const createFoodCategory = async (payload: ICreateFoodCategory) => {
    return prisma.foodCategory.create({
        data: {
            name: payload.name,
            note: payload.note ?? "",
            serialNo: payload.serialNo,
        },
    });
};

const updateFoodCategory = async (id: string, payload: IUpdateFoodCategory) => {
    await getFoodCategoryById(id);

    return prisma.foodCategory.update({
        where: { id },
        data: payload,
    });
};

const deleteFoodCategory = async (id: string) => {
    await getFoodCategoryById(id);

    const foodCount = await prisma.food.count({
        where: { categoryId: id, isDeleted: false },
    });

    if (foodCount > 0) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            "Cannot delete category with existing food items",
        );
    }

    return prisma.foodCategory.update({
        where: { id },
        data: {
            isDeleted: true,
            deletedAt: new Date(),
        },
    });
};

export const FoodCategoryService = {
    listFoodCategories,
    getAllFoodCategories,
    getFoodCategoryById,
    createFoodCategory,
    updateFoodCategory,
    deleteFoodCategory,
};
