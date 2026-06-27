import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { StatusCodes } from "http-status-codes";
import { Availability } from "../../lib/prisma-exports";

interface IListFoods {
    search?: string;
    categoryId?: string;
    page?: number;
    limit?: number;
}

interface ICreateFood {
    categoryId: string;
    foodNo: string;
    name: string;
    serialNo: number;
    availability?: Availability;
    price: number;
    image?: string;
}

interface IUpdateFood {
    categoryId?: string;
    foodNo?: string;
    name?: string;
    serialNo?: number;
    availability?: Availability;
    price?: number;
    image?: string;
}

const formatFood = (food: {
    id: string;
    categoryId: string;
    foodNo: string;
    name: string;
    serialNo: number;
    availability: Availability;
    price: { toNumber?: () => number } | number | string;
    image: string | null;
    category?: { name: string };
}) => ({
    id: food.id,
    categoryId: food.categoryId,
    category: food.category?.name ?? "",
    foodNo: food.foodNo,
    foodName: food.name,
    name: food.name,
    serialNo: food.serialNo,
    availability:
        food.availability === Availability.AVAILABLE ? "Available" : "Unavailable",
    price: Number(food.price),
    quantity: Number(food.price),
    image: food.image,
});

const listFoods = async (query: IListFoods) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where = {
        isDeleted: false,
        ...(query.categoryId ? { categoryId: query.categoryId } : {}),
        ...(query.search
            ? {
                  OR: [
                      { name: { contains: query.search, mode: "insensitive" as const } },
                      { foodNo: { contains: query.search, mode: "insensitive" as const } },
                      {
                          category: {
                              name: { contains: query.search, mode: "insensitive" as const },
                          },
                      },
                  ],
              }
            : {}),
    };

    const [foods, total] = await Promise.all([
        prisma.food.findMany({
            where,
            include: { category: { select: { name: true } } },
            orderBy: { serialNo: "asc" },
            skip,
            take: limit,
        }),
        prisma.food.count({ where }),
    ]);

    return {
        foods: foods.map(formatFood),
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

const getAllFoods = async () => {
    const foods = await prisma.food.findMany({
        where: { isDeleted: false },
        include: { category: { select: { name: true } } },
        orderBy: { serialNo: "asc" },
    });

    return foods.map(formatFood);
};

const getFoodById = async (id: string) => {
    const food = await prisma.food.findFirst({
        where: { id, isDeleted: false },
        include: { category: { select: { name: true } } },
    });

    if (!food) {
        throw new AppError(StatusCodes.NOT_FOUND, "Food item not found");
    }

    return formatFood(food);
};

const createFood = async (payload: ICreateFood) => {
    const category = await prisma.foodCategory.findFirst({
        where: { id: payload.categoryId, isDeleted: false },
    });

    if (!category) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Food category not found");
    }

    const food = await prisma.food.create({
        data: {
            categoryId: payload.categoryId,
            foodNo: payload.foodNo,
            name: payload.name,
            serialNo: payload.serialNo,
            availability: payload.availability ?? Availability.AVAILABLE,
            price: payload.price,
            image: payload.image || null,
        },
        include: { category: { select: { name: true } } },
    });

    return formatFood(food);
};

const updateFood = async (id: string, payload: IUpdateFood) => {
    await getFoodById(id);

    if (payload.categoryId) {
        const category = await prisma.foodCategory.findFirst({
            where: { id: payload.categoryId, isDeleted: false },
        });

        if (!category) {
            throw new AppError(StatusCodes.BAD_REQUEST, "Food category not found");
        }
    }

    const food = await prisma.food.update({
        where: { id },
        data: {
            ...payload,
            image: payload.image === "" ? null : payload.image,
        },
        include: { category: { select: { name: true } } },
    });

    return formatFood(food);
};

const deleteFood = async (id: string) => {
    await getFoodById(id);

    return prisma.food.update({
        where: { id },
        data: {
            isDeleted: true,
            deletedAt: new Date(),
        },
    });
};

export const FoodService = {
    listFoods,
    getAllFoods,
    getFoodById,
    createFood,
    updateFood,
    deleteFood,
};
