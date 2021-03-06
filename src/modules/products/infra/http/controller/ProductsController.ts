import { Request, Response } from 'express';

import { container } from 'tsyringe';
import CreateProductService from '@modules/products/services/CreateProductService';

export default class ProductsController {
  public async create(request: Request, response: Response): Promise<Response> {
    // TODO
    const { name, quantity, price } = request.body;

    const productContainer = container.resolve(CreateProductService);

    const product = await productContainer.execute({
      name,
      quantity,
      price,
    });

    return response.json(product);
  }
}
