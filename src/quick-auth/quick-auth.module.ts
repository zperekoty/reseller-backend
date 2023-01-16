import { Module } from '@nestjs/common';

import { FirebaseModule } from '../firebase/firebase.module';
import { QuickAuthService } from './quick-auth.service';
import { QuickAuthController } from './quick-auth.controller';

@Module({
	imports: [FirebaseModule],
	controllers: [QuickAuthController],
	providers: [QuickAuthService],
	exports: [QuickAuthService],
})
export class QuickAuthModule {}
