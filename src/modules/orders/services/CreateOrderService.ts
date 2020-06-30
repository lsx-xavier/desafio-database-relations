import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

interface IProductDTO {
  product_id: string;
  price: number;
  quantity: number;
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    // TODO
    const orderExits = await this.ordersRepository.findById(customer_id);

    if (orderExits) {
      throw new AppError('Order already exists');
    }

    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer does not exists');
    }

    const findProducts = await this.productsRepository.findAllById(products);

    if (findProducts.length < products.length) {
      throw new AppError("Some products doesn't exists");
    }

    const orderProducts: IProductDTO[] = [];
    // const index = 0;

    // findProducts.map(p => {
    //   if (products[index].id === p.id) {
    //     if (p.quantity < products[index].quantity) {
    //       throw new AppError('Product is missing');
    //     }
    //   }

    //   orderProducts.push({
    //     price: p.price,
    //     product_id: p.id,
    //     quantity: p.quantity,
    //   });

    //   index += 1;

    //   return orderProducts;
    // });

    for (let index = 0; index < findProducts.length; index += 1) {
      if (findProducts[index].quantity < products[index].quantity) {
        throw new AppError('Not enough products');
      }

      orderProducts.push({
        price: findProducts[index].price,
        product_id: findProducts[index].id,
        quantity: products[index].quantity,
      });
    }

    const order = await this.ordersRepository.create({
      customer,
      products: orderProducts,
    });

    await this.productsRepository.updateQuantity(products);

    return order;
  }
}

export default CreateOrderService;
