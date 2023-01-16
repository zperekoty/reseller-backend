import { Injectable } from '@nestjs/common';

import { FirebaseService } from '../firebase/firebase.service';
import { TelegramService } from '../telegram/telegram.service';
import { Orders } from './orders.interface';
import { FirestoreResponse } from '../firebase/response.interface';
import { User } from '../users/user.interface';
import { Products } from 'src/products/products.interface';

@Injectable()
export class OrdersService {
	constructor(
		private readonly firebaseService: FirebaseService,
		private readonly telegramService: TelegramService,
	) {}

	async createOrder(order: Orders): Promise<FirestoreResponse<Orders>> {
		try {
			const buyer = await this.firebaseService.getById<User>(
				'users',
				order.owner,
			);
			let priceOfAll: number = 0;
			let balance: number = buyer.data['balance'];

			order.products.forEach(
				product => (priceOfAll += product.price * product.amount),
			);

			if (buyer.data['balance'] < priceOfAll)
				return {
					message: 'Ваш баланс меньше суммы товаров',
					status: 'failure',
					error: 'Баланс меньше допустимого',
				};

			for (const product of order.products) {
				const prod = await this.firebaseService.getById<Products>(
					'products',
					product.id,
				);

				if (product.amount > prod.data['amount'])
					return {
						message: `Количество товара ${product.name} - ${prod.data['amount']}, вы пытаетесь заказать - ${product.amount}`,
						status: 'failure',
						error: 'Количество больше допустимого',
					};
			}

			for (const product of order.products) {
				const owner = await this.firebaseService.getById<User>(
					'users',
					product.owner,
				);

				const data = {
					id: owner.data['id'],
					buys: [product, ...owner.data['buys']],
					balance: owner.data['balance'] + product.price * product.amount,
					interface: 'users',
				};

				await this.telegramService.sendMessage(
					owner.data['telegramId'],
					`<i>🛍️ Покупка товара</i>: <b>${
						product.name
					}</b>!\n\n<i>🔢 Количество</i>: <b>${
						product.amount
					}</b>\n<i>💵 Цена за 1 единицу товара</i>: <b>₽${product.price.toLocaleString(
						'ru-RU',
						{
							maximumFractionDigits: 2,
						},
					)}</b>\n<i>💰 Итого</i>: <b>₽${(
						(product.price * product.amount) as number
					).toLocaleString('ru-RU', {
						maximumFractionDigits: 2,
					})}</b>\n\n<i>💰 Баланс</i>: <b>₽${(
						(owner.data['balance'] + product.price * product.amount) as number
					).toLocaleString('ru-RU', {
						maximumFractionDigits: 2,
					})}</b>`,
				);

				await this.telegramService.sendMessage(
					buyer.data['telegramId'],
					`<b>😊 Спасибо за покупку</b>\n\n<i>🛍️ Название товара</i>: <b>${
						product.name
					}</b>\n<i>🔢 Количество</i>: <b>${
						product.amount
					}</b>\n<i>💵 Цена за 1 ед</i>: <b>₽${product.price.toLocaleString(
						'ru-RU',
						{
							maximumFractionDigits: 2,
						},
					)}</b>\n<i>💰 Итого</i>: <b>₽${(
						(product.price * product.amount) as number
					).toLocaleString('ru-RU', {
						maximumFractionDigits: 2,
					})}</b>\n\n<i>💰 Баланс</i>: <b>₽${(
						balance -
						product.price * product.amount
					).toLocaleString('ru-RU', {
						maximumFractionDigits: 2,
					})}</b>`,
				);

				balance -= product.price * product.amount;

				const upd = await this.firebaseService.updateDoc<User>(
					data as User,
					'Пользователь',
				);
			}

			for (const product of order.products) {
				const prod = await this.firebaseService.getById<Products>(
					'products',
					product.id,
				);

				const data = {
					id: prod.data['id'],
					amount: prod.data['amount'] - product.amount,
					interface: 'products',
				};

				const upd = await this.firebaseService.updateDoc<Products>(
					data as Products,
					'Товар',
				);
			}

			const _order = await this.firebaseService.createDoc<Orders>(
				order,
				'Заказ',
			);

			const data = {
				id: buyer.data['id'],
				orders: [_order.data['id'], ...buyer.data['orders']],
				balance: buyer.data['balance'] - priceOfAll,
				interface: 'users',
			};

			const upd = await this.firebaseService.updateDoc<User>(
				data as User,
				'Пользователь',
			);

			return {
				..._order,
				message: '',
				status: 'success',
			};
		} catch {
			return {
				message: `Неизвестная ошибка`,
				status: 'failure',
				error: 'Неизвестная ошибка',
			};
		}
	}

	async getOrders(id: string): Promise<FirestoreResponse<Orders[]>> {
		return await this.firebaseService.getDocsByParams<Orders[]>('orders', {
			key: 'owner',
			operator: '==',
			value: id,
		});
	}
}
