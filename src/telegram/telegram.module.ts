import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import * as LocalSession from 'telegraf-session-local';

import { TelegramService } from './telegram.service';
import { FirebaseModule } from '../firebase/firebase.module';
import { TelegramUpdate } from './telegram.update';
import { QuickAuthModule } from '../quick-auth/quick-auth.module';

const sessions = new LocalSession({ database: 'session.json' });

@Module({
	imports: [
		TelegrafModule.forRoot({
			token: process.env.BOT_TOKEN,
			middlewares: [sessions.middleware()],
		}),
		FirebaseModule,
		QuickAuthModule,
	],
	providers: [TelegramService, TelegramUpdate],
	exports: [TelegramService],
})
export class TelegramModule {}
