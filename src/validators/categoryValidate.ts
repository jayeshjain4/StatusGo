import Joi from "joi";

const categoryScheme = Joi.object({
    name: Joi.string().required(),
    imageUrl: Joi.string().uri().optional().allow(null, '')
})

const updateCategoryScheme = Joi.object({
    name: Joi.string().required(),
    imageUrl: Joi.string().uri().optional().allow(null, '')
});

export const validateCategoryScheme = (createCategory: any) => categoryScheme.validate(createCategory);
export const validateUpdateCategoryScheme = (updateCategory: any) => updateCategoryScheme.validate(updateCategory);