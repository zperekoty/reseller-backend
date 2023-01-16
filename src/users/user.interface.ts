import { Products } from '../products/products.interface';
import { Orders } from '../orders/orders.interface';

export interface User {
	id: string;
	name: string;
	login: string;
	password: string;
	telegram: string;
	telegramId: string | number;
	balance: number;
	verification: {
		verified: boolean;
		verificationCode?: string;
	};
	products: Products[];
	orders: Orders[];
	buys: Products[];
	interface: string;
}
