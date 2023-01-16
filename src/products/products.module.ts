import { Module } from '@nestjs/common';

import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { FirebaseModule } from '../firebase/firebase.module';
import { UidGeneratorModule } from '../uid-generator/uid-generator.module';

@Module({
	imports: [FirebaseModule, UidGeneratorModule],
	controllers: [ProductsController],
	providers: [ProductsService],
})
export class ProductsModule {}
