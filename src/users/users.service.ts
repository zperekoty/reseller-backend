import { Injectable } from '@nestjs/common';

import { FirebaseService } from '../firebase/firebase.service';
import { User } from './user.interface';
import { FirestoreResponse } from '../firebase/response.interface';
import { UidGeneratorService } from '../uid-generator/uid-generator.service';
import { QuickAuth } from 'src/quick-auth/quick-auth.interface';
import { Products } from 'src/products/products.interface';
import { Orders } from 'src/orders/orders.interface';

@Injectable()
export class UsersService {
	constructor(
		private readonly firebaseService: FirebaseService,
		private readonly uidGeneratorService: UidGeneratorService,
	) {}

	async createUser(user: User): Promise<FirestoreResponse<User>> {
		const userLogin = await this.firebaseService.getDocByParams<User>('users', {
			key: 'login',
			operator: '==',
			value: user.login,
		});

		const userTelegram = await this.firebaseService.getDocByParams<User>(
			'users',
			{
				key: 'telegram',
				operator: '==',
				value: user.telegram,
			},
		);

		if (userLogin.status === 'success')
			return {
				message: 'Данный логин уже занят',
				status: 'failure',
				error: 'Логин занят',
			};

		if (userTelegram.status === 'success')
			return {
				message: 'Данный телеграм-аккаунт уже привязан к одному из аккаунтов',
				status: 'failure',
				error: 'Телеграм-аккаунт уже используется',
			};

		const data = {
			...user,
			verification: {
				verified: false,
				verificationCode: this.uidGeneratorService.generateUID(15),
			},
			telegramId: '',
			balance: 300000,
			products: [],
			orders: [],
			buys: [],
			interface: 'users',
		};

		return await this.firebaseService.createDoc<User>(data, 'Пользователь');
	}

	async getUser(id: string): Promise<FirestoreResponse<User>> {
		return await this.firebaseService.getById<User>('users', id);
	}

	async deleteUserById(id: string): Promise<FirestoreResponse<User>> {
		const user = await this.firebaseService.getById<User>('users', id);
		const link = await this.firebaseService.getDocByParams<QuickAuth>('qa', {
			key: 'to',
			operator: '==',
			value: user.data.id,
		});

		for (const prod of user.data.products) {
			await this.firebaseService.deleteDoc<Products>(`products/${prod}`);
		}

		for (const order of user.data.orders) {
			await this.firebaseService.deleteDoc<Orders>(`orders/${order}`);
		}

		const del =
			link.status === 'success'
				? await this.firebaseService.deleteDoc<QuickAuth>(`qa/${link.data.id}`)
				: '';

		return await this.firebaseService.deleteDoc<User>(`users/${id}`);
	}

	async updateUserById(user: User): Promise<FirestoreResponse<User>> {
		return await this.firebaseService.updateDoc<User>(user, 'Пользователь');
	}

	async getUserByLoginAndPassword(
		user: User,
	): Promise<FirestoreResponse<User>> {
		const _user = await this.firebaseService.getDocByParams<User>('users', {
			key: 'login',
			operator: '==',
			value: user.login,
		});

		if (_user.status === 'failure') {
			return {
				message: 'Аккаунта с таким логином не существует',
				status: 'failure',
				error: 'Аккаунт не существует',
			};
		}

		if (_user.data.password !== user.password) {
			return {
				message: 'Неверный пароль',
				status: 'failure',
				error: 'Неверный пароль',
			};
		}

		return _user;
	}
}
