import { Injectable } from '@nestjs/common';

import { QuickAuth } from './quick-auth.interface';
import { FirebaseService } from '../firebase/firebase.service';
import { FirestoreResponse } from '../firebase/response.interface';
import { User } from 'src/users/user.interface';

@Injectable()
export class QuickAuthService {
	constructor(private readonly firebaseService: FirebaseService) {}

	async createAuthLink(link: QuickAuth): Promise<FirestoreResponse<QuickAuth>> {
		const data = {
			...link,
			until: new Date().setSeconds(900),
			interface: 'qa',
		};

		return await this.firebaseService.createDoc(
			data,
			'Ссылка быстрой авторизации',
		);
	}

	async getLink(id: string): Promise<FirestoreResponse<User>> {
		const link = await this.firebaseService.getById<QuickAuth>('qa', id);

		if (link.status === 'failure')
			return {
				message: 'Такая ссылка не существует',
				status: 'failure',
				error: 'Ссылка не существует',
			};

		if (link.data.until <= new Date().getTime())
			return {
				message: 'Ссылка больше недоступна',
				status: 'failure',
				error: 'Время истекло',
			};

		return await this.firebaseService.getById('users', link.data.to);
	}
}
