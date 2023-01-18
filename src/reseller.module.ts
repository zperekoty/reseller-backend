import { Module } from '@nestjs/common';

import { UsersModule } from './users/users.module';
import { FirebaseModule } from './firebase/firebase.module';
import { UidGeneratorModule } from './uid-generator/uid-generator.module';
import { ProductsModule } from './products/products.module';
// import { TelegramModule } from './telegram/telegram.module';
import { OrdersModule } from './orders/orders.module';
import { QuickAuthModule } from './quick-auth/quick-auth.module';

@Module({
	imports: [
		UsersModule,
		FirebaseModule,
		UidGeneratorModule,
		ProductsModule,
		OrdersModule,
		QuickAuthModule,
	],
})
export class ReSellerModule {}
