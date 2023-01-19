import { Injectable } from '@nestjs/common';

import { FirebaseService } from '../firebase/firebase.service';
import { Products } from './products.interface';
import { FirestoreResponse } from '../firebase/response.interface';
import { User } from '../users/user.interface';

@Injectable()
export class ProductsService {
	constructor(private readonly firebaseService: FirebaseService) {}

	async createProduct(
		product: Products,
	): Promise<
		| FirestoreResponse<Products>
		| { message: string; status: string; error: string }
	> {
		try {
			const prod = await this.firebaseService.createDoc<Products>(
				product,
				'Товар',
			);
			const owner = await this.firebaseService.getById<User>(
				'users',
				prod.data.owner,
			);

			const data = {
				id: owner.data.id,
				interface: 'users',
				products: [prod.data.id, ...owner.data.products],
			};

			const upd = await this.firebaseService.updateDoc<User>(
				data as User,
				'Пользователь',
			);

			return prod;
		} catch {
			return {
				message: 'Ошибка при попытке создать продукт',
				status: 'failure',
				error: 'Неизвестная ошибка',
			};
		}
	}

	async getProducts(inf: string): Promise<FirestoreResponse<Products[]>> {
		return await this.firebaseService.getDocsByInf<Products[]>(inf);
	}

	async getProduct(id: string): Promise<FirestoreResponse<Products>> {
		return await this.firebaseService.getById<Products>('products', id);
	}

	async getUserProducts(id: string): Promise<FirestoreResponse<Products[]>> {
		return await this.firebaseService.getDocsByParams<Products[]>('products', {
			key: 'owner',
			operator: '==',
			value: id,
		});
	}

	async updateProduct(product: Products): Promise<FirestoreResponse<Products>> {
		return await this.firebaseService.updateDoc<Products>(product, 'Товар');
	}

	async deleteProduct(
		id: string,
	): Promise<
		| FirestoreResponse<Products>
		| { message: string; status: string; error: string }
	> {
		try {
			const prod = await this.firebaseService.getById<Products>('products', id);
			const owner = await this.firebaseService.getById<User>(
				'users',
				prod.data.owner,
			);

			//@ts-ignore
			const list: [] = owner.data.products.filter(p => p !== id);

			const data = {
				id: owner.data.id,
				products: [...list],
				interface: 'users',
			};

			const upd = this.firebaseService.updateDoc<User>(
				data as unknown as User,
				'Пользователь',
			);

			return await this.firebaseService.deleteDoc<Products>(`products/${id}`);
		} catch {
			return {
				message: 'Ошибка при попытке удалить продукт',
				status: 'failure',
				error: 'Неизвестная ошибка',
			};
		}
	}
}
