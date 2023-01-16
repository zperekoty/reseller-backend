import { Module } from '@nestjs/common';

import { FirebaseModule } from '../firebase/firebase.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UidGeneratorModule } from '../uid-generator/uid-generator.module';

@Module({
	imports: [FirebaseModule, UidGeneratorModule],
	controllers: [UsersController],
	providers: [UsersService],
})
export class UsersModule {}
