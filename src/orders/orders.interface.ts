import { Products } from '../products/products.interface';

export interface Orders {
	id: string;
	products: Products[];
	owner: string;
	interface: 'orders';
}
