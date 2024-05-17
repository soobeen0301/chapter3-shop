import express from 'express';
import Joi from 'joi';
import Product from '../schemas/product.schema.js';

const router = express.Router();

const productSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': '상품명을 입력해 주세요.',
  }),
  description: Joi.string().required().messages({
    'any.required': '상품 설명을 입력해 주세요.',
  }),
  manager: Joi.string().required().messages({
    'any.required': '담당자를 입력해 주세요.',
  }),
  status: Joi.string().valid('FOR SALE', 'SOLD_OUT').messages({
    'any.only': '상품 상태는 [FOR SALE, SOLD_OUT] 중 하나여야 합니다.',
  }),
  password: Joi.string().required().messages({
    'any.required': '비밀번호를 입력해 주세요.',
  }),
});

/* 상품 생성 API */
router.post('/products', async (req, res, next) => {
  try {
    const { error } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ errorMessage: error.details[0].message });
    }

    const { name, description, manager, password } = req.body;

    const existingProduct = await Product.findOne({ name }).exec();
    if (existingProduct) {
      return res.status(400).json({ errorMessage: '이미 등록된 상품입니다.' });
    }

    const product = new Product({
      name,
      description,
      manager,
      password,
      status: 'FOR SALE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await product.save();

    return res
      .status(201)
      .json({ message: '상품 생성에 성공했습니다.', product });
  } catch (error) {
    next(error);
  }
});

/* 상품 목록 조회 API */
router.get('/products', async (req, res, next) => {
  try {
    const products = await Product.find({}, '-password').sort({
      createdAt: -1,
    });
    return res.status(200).json({
      message: '상품 목록 조회에 성공했습니다.',
      data: products,
    });
  } catch (error) {
    next(error);
  }
});

/* 상품 상세 조회 API */
router.get('/products/:id', async (req, res, next) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId, '-password').exec();

    if (!product) {
      return res.status(404).json({ errorMessage: '상품을 찾을 수 없습니다.' });
    }

    return res.status(200).json({
      message: '상품 상세 조회에 성공했습니다.',
      data: product,
    });
  } catch (error) {
    next(error);
  }
});

/* 상품 수정 API */
router.put('/products/:id', async (req, res, next) => {
  try {
    const { error } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ errorMessage: error.details[0].message });
    }

    const productId = req.params.id;
    const { name, description, manager, status, password } = req.body;

    const updateFields = {};

    if (name) {
      updateFields.name = name;
    }

    if (description) {
      updateFields.description = description;
    }

    if (manager) {
      updateFields.manager = manager;
    }

    if (status) {
      updateFields.status = status;
    }

    if (Object.keys(updateFields).length === 0) {
      return res
        .status(400)
        .json({ errorMessage: '수정할 상품 정보를 입력해주세요.' });
    }

    const product = await Product.findById(productId).exec();

    if (!product) {
      return res.status(404).json({ errorMessage: '상품을 찾을 수 없습니다.' });
    }

    if (password !== product.password) {
      return res
        .status(401)
        .json({ errorMessage: '비밀번호가 일치하지 않습니다.' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: updateFields },
      { new: true, select: '-password' }
    );

    return res.status(200).json({
      message: '상품 수정에 성공했습니다.',
      data: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
});

/* 상품 삭제 API */
router.delete('/products/:id', async (req, res, next) => {
  try {
    const productId = req.params.id;
    const { password } = req.body;

    const product = await Product.findById(productId).exec();

    if (!product) {
      return res.status(404).json({ errorMessage: '상품을 찾을 수 없습니다.' });
    }

    if (password !== product.password) {
      return res
        .status(401)
        .json({ errorMessage: '비밀번호가 일치하지 않습니다.' });
    }

    await Product.findByIdAndDelete(productId);

    return res.status(200).json({
      message: '상품 삭제에 성공했습니다.',
      data: {
        id: productId,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
