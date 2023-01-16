import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { Orders } from './orders.interface';
import { OrdersService } from './orders.service';
import { FirestoreResponse } from '../firebase/response.interface';

@Controller('orders')
export class OrdersController {
	constructor(private readonly ordersService: OrdersService) {}

	@Post()
	async createOrder(@Body() order: Orders): Promise<FirestoreResponse<Orders>> {
		return await this.ordersService.createOrder(order);
	}

	@Get(':id')
	async getOrders(
		@Param('id') id: string,
	): Promise<FirestoreResponse<Orders[]>> {
		return await this.ordersService.getOrders(id);
	}
}
