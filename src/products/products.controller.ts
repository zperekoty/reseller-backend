import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
} from '@nestjs/common';

import { Products } from './products.interface';
import { ProductsService } from './products.service';
import { FirestoreResponse } from '../firebase/response.interface';

@Controller('products')
export class ProductsController {
	constructor(private readonly productsService: ProductsService) {}

	@Post()
	async createProduct(
		@Body() product: Products,
	): Promise<
		| FirestoreResponse<Products>
		| { message: string; status: string; error: string }
	> {
		return await this.productsService.createProduct(product);
	}

	@Get()
	async getProducts(): Promise<FirestoreResponse<Products[]>> {
		return await this.productsService.getProducts('products');
	}

	@Get(':id')
	async getProduct(
		@Param('id') id: string,
	): Promise<FirestoreResponse<Products>> {
		return this.productsService.getProduct(id);
	}

	@Get('user/:id')
	async getUserProducts(
		@Param('id') id: string,
	): Promise<FirestoreResponse<Products[]>> {
		return await this.productsService.getUserProducts(id);
	}

	@Put()
	async updateProduct(
		@Body() product: Products,
	): Promise<FirestoreResponse<Products>> {
		return await this.productsService.updateProduct(product);
	}

	@Delete(':id')
	async deleteProduct(
		@Param('id') id: string,
	): Promise<
		| FirestoreResponse<Products>
		| { message: string; status: string; error: string }
	> {
		return await this.productsService.deleteProduct(id);
	}
}
