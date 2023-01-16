import { Injectable } from '@nestjs/common';

@Injectable()
export class UidGeneratorService {
	generateUID(length: number): string {
		const chars =
			'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		let uid = '';

		for (let i = 0; i < length; i++) {
			uid += chars.charAt(Math.floor(Math.random() * chars.length));
		}

		return uid;
	}
}
