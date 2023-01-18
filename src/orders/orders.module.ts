import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
	imports: [FirebaseModule, HttpModule],
	controllers: [OrdersController],
	providers: [OrdersService],
})
export class OrdersModule {}
