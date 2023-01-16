import { Module } from '@nestjs/common';

import { UidGeneratorModule } from '../uid-generator/uid-generator.module';
import { FirebaseService } from './firebase.service';

@Module({
	imports: [UidGeneratorModule],
	providers: [FirebaseService],
	exports: [FirebaseService],
})
export class FirebaseModule {}
