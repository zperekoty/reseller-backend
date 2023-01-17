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
			middlewares: [sessions.middleware()],
			token: process.env.BOT_TOKEN,
			launchOptions: {
				webhook: {
					domain: process.env.WEBHOOK_URL,
					port: Number(process.env.WEBHOOK_PORT),
				},
			},
		}),
		FirebaseModule,
		QuickAuthModule,
	],
	providers: [TelegramService, TelegramUpdate],
	exports: [TelegramService],
})
export class TelegramModule {}
