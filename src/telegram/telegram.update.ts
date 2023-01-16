import { Ctx, Hears, Message, On, Start, Update } from 'nestjs-telegraf';

import { TelegramService } from './telegram.service';
import { Context } from './context.interface';

@Update()
export class TelegramUpdate {
	constructor(private readonly telegramService: TelegramService) {}

	@Start()
	async botStart(@Ctx() ctx: Context): Promise<void> {
		await this.telegramService.botStart(ctx);
	}

	@Hears('Создать аккаунт 👨‍🚀')
	async createAccount(@Ctx() ctx: Context): Promise<void> {
		await this.telegramService.createAccount(ctx);
	}

	@Hears('Аккаунт 👨‍🚀')
	async profileInfo(@Ctx() ctx: Context): Promise<void> {
		await this.telegramService.profileInfo(ctx);
	}

	@Hears('Удалить аккаунт ❌')
	async deleteAccount(@Ctx() ctx: Context): Promise<void> {
		await this.telegramService.deleteAccount(ctx);
	}

	@Hears('Проверить ⏳')
	async checkReg(@Ctx() ctx: Context): Promise<void> {
		await this.telegramService.checkReg(ctx);
	}

	@Hears('Получить ссылку 🔗')
	async getQuickLink(@Ctx() ctx: Context) {
		await this.telegramService.getQuickLink(ctx);
	}

	@On('text')
	async textHandler(
		@Message('text') message: string,
		@Ctx() ctx: Context,
	): Promise<void> {
		await this.telegramService.textHandler(message, ctx);
	}
}
