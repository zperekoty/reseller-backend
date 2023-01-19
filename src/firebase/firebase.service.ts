import { Injectable } from '@nestjs/common';
import { initializeApp } from 'firebase/app';
import {
	collection,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	getFirestore,
	query,
	setDoc,
	updateDoc,
	where,
} from 'firebase/firestore';

import { firebaseConfig } from '../firebase.config';
import { UidGeneratorService } from '../uid-generator/uid-generator.service';
import { FirestoreResponse } from './response.interface';
import { Params } from './params.interface';

@Injectable()
export class FirebaseService {
	constructor(private readonly uidGeneratorService: UidGeneratorService) {}

	fire = initializeApp(firebaseConfig);
	firestore = getFirestore(this.fire);

	async createDoc<T extends { id: string; interface: string }>(
		docData: T,
		writeName: string,
	): Promise<FirestoreResponse<T>> {
		const id = this.uidGeneratorService.generateUID(30);

		return await setDoc(doc(this.firestore, `${docData.interface}/${id}`), {
			id,
			...docData,
		})
			.then((): FirestoreResponse<T> => {
				return {
					data: {
						id,
						...docData,
					},
					message: `${writeName} c id: ${id} успешно создан`,
					status: 'success',
				};
			})
			.catch((): FirestoreResponse<T> => {
				return {
					message: `Ошибка при создании документа с интерфейсом ${docData.interface}`,
					status: 'failure',
					error: 'Неизвестная ошибка',
				};
			});
	}

	async deleteDoc<T extends object>(
		path: string,
	): Promise<FirestoreResponse<T>> {
		return await deleteDoc(doc(this.firestore, path))
			.then((): FirestoreResponse<T> => {
				return {
					message: `Документ по пути "${path}" успешно удален`,
					status: 'success',
				};
			})
			.catch((): FirestoreResponse<T> => {
				return {
					message: `Ошибка при удалении документа по пути "${path}"`,
					status: 'failure',
					error: `Возможно путь "${path}" не существует`,
				};
			});
	}

	async getDocByInfAndId<T extends { id: string; interface: string }>(
		docData: T,
	): Promise<FirestoreResponse<T>> {
		return await getDoc(
			doc(this.firestore, `${docData.interface}/${docData.id}`),
		)
			.then((snap): FirestoreResponse<T> => {
				if (snap.exists())
					return {
						data: snap.data() as T,
						message: `Данные из "${docData.interface}/${docData.id}" успешно получены`,
						status: 'success',
					};

				return {
					message: `Документ с id: ${docData.id} не существует`,
					status: 'failure',
					error: 'Документ не существует',
				};
			})
			.catch((): FirestoreResponse<T> => {
				return {
					message: `Произошла ошибка при получении данных из "${docData.interface}/${docData.id}"`,
					status: 'failure',
					error: `Возможно путь "${docData.interface}/${docData.id}" не существует`,
				};
			});
	}

	async getDocsByInf<T extends object>(
		inf: string,
	): Promise<FirestoreResponse<T>> {
		const q = query(collection(this.firestore, inf));

		return await getDocs(q)
			.then((snap): FirestoreResponse<T> => {
				let list = [];

				snap.forEach(s => list.push(s.data()));

				return {
					data: list as T,
					message: `Данные из "${inf}" успешно получены`,
					status: 'success',
				};
			})
			.catch((): FirestoreResponse<T> => {
				return {
					message: `Ошибка при получении данных из "${inf}"`,
					status: 'failure',
					error: `Возможно путь "${inf}" не существует`,
				};
			});
	}

	async getById<T extends object>(
		inf: string,
		id: string,
	): Promise<FirestoreResponse<T>> {
		const q = query(collection(this.firestore, inf), where('id', '==', id));

		return await getDocs(q)
			.then((snap): FirestoreResponse<T> => {
				return {
					data: snap.docs[0].data() as T,
					message: `Получены данные из "${inf}/${id}"`,
					status: 'success',
				};
			})
			.catch((): FirestoreResponse<T> => {
				return {
					message: `Ошибка при получении данных из "${inf}/${id}"`,
					status: 'failure',
					error: `Возможно путь "${inf}/${id}" не существует`,
				};
			});
	}

	async getDocByParams<T extends object>(
		inf: string,
		params: Params,
	): Promise<FirestoreResponse<T>> {
		const q = query(
			collection(this.firestore, inf),
			where(params.key, params.operator, params.value),
		);

		return await getDocs(q)
			.then((snap): FirestoreResponse<T> => {
				return {
					data: snap.docs[0].data() as T,
					message: `Получены данные из "${inf}"`,
					status: 'success',
				};
			})
			.catch((): FirestoreResponse<T> => {
				return {
					message: `Ошибка при получении данных из "${inf}"`,
					status: 'failure',
					error: `Возможно путь "${inf}" не существует`,
				};
			});
	}

	async getDocsByParams<T extends object>(
		inf: string,
		params: Params,
	): Promise<FirestoreResponse<T>> {
		const q = query(
			collection(this.firestore, inf),
			where(params.key, params.operator, params.value),
		);

		return await getDocs(q)
			.then((snap): FirestoreResponse<T> => {
				if (snap.docs.length < 1)
					return {
						message: `Ошибка при получении данных из "${inf}"`,
						status: 'failure',
						error: 'Данные отсутствуют',
					};

				let list = [];

				snap.forEach(doc => list.push(doc.data()));

				return {
					data: [...list] as T,
					message: `Получены данные из "${inf}"`,
					status: 'success',
				};
			})
			.catch((): FirestoreResponse<T> => {
				return {
					message: `Ошибка при получении данных из "${inf}"`,
					status: 'failure',
					error: `Возможно путь "${inf}" не существует`,
				};
			});
	}

	async updateDoc<T extends { id: string; interface: string }>(
		docData: T,
		writeName: string,
	): Promise<FirestoreResponse<T>> {
		return await updateDoc(
			doc(this.firestore, `${docData.interface}/${docData.id}`),
			{
				...docData,
			},
		)
			.then((): FirestoreResponse<T> => {
				return {
					message: `${writeName} с id: ${docData.id} успешно обновлен`,
					status: 'success',
				};
			})
			.catch((): FirestoreResponse<T> => {
				return {
					message: `Ошибка при обновлении документа с id: ${docData.id}`,
					status: 'failure',
					error: `Возможно документ с id: ${docData.id} не существует`,
				};
			});
	}
}
