import { Module } from '@nestjs/common';

import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { FirebaseModule } from '../firebase/firebase.module';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
	imports: [FirebaseModule, TelegramModule],
	controllers: [OrdersController],
	providers: [OrdersService],
})
export class OrdersModule {}
