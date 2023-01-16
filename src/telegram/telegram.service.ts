import { Injectable } from '@nestjs/common';
import { Ctx, InjectBot, Message } from 'nestjs-telegraf';
import { Markup, Telegraf } from 'telegraf';

import { FirebaseService } from '../firebase/firebase.service';
import { Context } from './context.interface';
import { DocData } from '../firebase/docdata.interface';
import { QuickAuthService } from '../quick-auth/quick-auth.service';
import { QuickAuth } from '../quick-auth/quick-auth.interface';

@Injectable()
export class TelegramService {
	constructor(
		private readonly firebaseService: FirebaseService,
		@InjectBot() private readonly reSellerBot: Telegraf<Context>,
		private readonly quickAuthService: QuickAuthService,
	) {}

	async botStart(@Ctx() ctx: Context): Promise<any> {
		try {
			const user = await this.firebaseService.getDocByParams('users', {
				key: 'telegram',
				operator: '==',
				value: ctx.from.username,
			});

			if (user.error) {
				ctx.session.type = 'not_registered';

				return await ctx.replyWithHTML(
					`<i><b>Вы</b> <b>не зарегистрированы</b>. Вы можете <b>создать аккаунт</b>, <b>кликнув</b> по кнопке "Создать аккаунт 👨‍🚀"\n\n<b>Можете</b> зарегистрироваться на сайте по <a href='${process.env.SITE_BASE_URL}/registration'>Ссылке</a>, после <b>кликните</b> по кнопке "Проверить ⏳"</i>`,
					Markup.keyboard(['Создать аккаунт 👨‍🚀', 'Проверить ⏳'], {
						columns: 2,
					}),
				);
			}

			const data = {
				id: user.data['id'],
				telegramId: ctx.from.id,
				interface: 'users',
			};

			const upd = await this.firebaseService.updateDoc(
				data as DocData,
				'Пользователь',
			);

			if (user.data['verification']['verified']) {
				ctx.session.type = 'none';

				return await ctx.replyWithHTML(
					`Здравствуйте, <b>${user.data['name']}</b>`,
					Markup.keyboard(
						['Аккаунт 👨‍🚀', 'Удалить аккаунт ❌', 'Получить ссылку 🔗'],
						{ columns: 2 },
					),
				);
			}

			ctx.session.type = 'verification';

			return await ctx.replyWithHTML(
				`👋 Здравствуйте, <b>${user.data['name']}</b>\n\nВведите уникальный код для верификации вашего аккаунта`,
			);
		} catch {
			return ctx.replyWithHTML(
				'<b>Произошла неизвестная ошибка ❌</b>\n\nПовторите попытку позже',
			);
		}
	}

	async textHandler(
		@Message('text') message: string,
		@Ctx() ctx: Context,
	): Promise<any> {
		try {
			if (ctx.session.type === 'none' || ctx.session.type === 'not_registered')
				return await ctx.deleteMessage();

			if (ctx.session.type === 'verification') {
				const user = await this.firebaseService.getDocByParams('users', {
					key: 'telegram',
					operator: '==',
					value: ctx.from.username,
				});

				const code = user.data['verification']['verificationCode'];

				if (code !== message) {
					return await ctx.reply('Неверный код!\nПовторите попытку');
				}

				const data = {
					id: user.data['id'],
					verification: {
						verified: true,
					},
					interface: 'users',
				};

				const upd = await this.firebaseService.updateDoc(
					data as any,
					'Пользователь',
				);

				ctx.session.type = 'none';

				await ctx.deleteMessage();

				return await ctx.replyWithHTML(
					'<b>🍻 Ваш аккаунт успешно верифицирован!</b>',
					Markup.keyboard(
						['Аккаунт 👨‍🚀', 'Удалить аккаунт ❌', 'Получить ссылку 🔗'],
						{ columns: 2 },
					),
				);
			}

			if (ctx.session.type === 'registration') {
				ctx.session.name = message;

				await ctx.deleteMessage();

				ctx.session.type = 'registration-login';

				return await ctx.replyWithHTML('<i>🪪 Введите <b>логин</b></i>');
			}

			if (ctx.session.type === 'registration-login') {
				const user = await this.firebaseService.getDocByParams('users', {
					key: 'login',
					operator: '==',
					value: message,
				});

				if (user.error) {
					ctx.session.login = message;

					ctx.session.type = 'registration-password';

					await ctx.deleteMessage();

					return await ctx.replyWithHTML('<i>🔐 Введите <b>пароль</b></i>');
				}

				await ctx.deleteMessage();

				return await ctx.replyWithHTML(
					`<i>ℹ️ Логин <b>${message}</b> уже занят</i>`,
				);
			}

			if (ctx.session.type === 'registration-password') {
				ctx.session.password = message;

				await ctx.deleteMessage();

				const data = {
					name: ctx.session.name,
					login: ctx.session.login,
					password: ctx.session.password,
					telegram: ctx.from.username,
					telegramId: ctx.from.id,
					verification: {
						verified: true,
					},
					balance: 300000,
					products: [],
					orders: [],
					buys: [],
					interface: 'users',
				};

				const user = await this.firebaseService.createDoc(
					data as any,
					'Пользователь',
				);

				const link = await this.quickAuthService.createAuthLink({
					to: user.data['id'],
				} as QuickAuth);

				ctx.session.type = 'none';

				return await ctx.replyWithHTML(
					`<b>✅ Аккаунт успешно создан</b>\n\n<i>👨‍🚀 Аккаунт привязан к этому телеграм-аккаунту</i>\n\n<i>🪪 Ваш ID</i>: <b>${user.data['id']}</b>\n\n\n<b>Ссылка для быстрой авторизации - <a href='${process.env.SITE_BASE_URL}/qa/${link.data['id']}'>Клик!</a>\n\n⏳ Ссылка действительна 15 минут!</b>`,
					Markup.keyboard(
						['Аккаунт 👨‍🚀', 'Удалить аккаунт ❌', 'Получить ссылку 🔗'],
						{ columns: 2 },
					),
				);
			}

			if (ctx.session.type === 'delete') {
				if (message === 'Нет 😊') {
					ctx.session.type = 'none';

					await ctx.deleteMessage();

					return await ctx.replyWithHTML(
						'<b>Спасибо, что остаетесь с нами 😊</b>',
						Markup.keyboard(
							['Аккаунт 👨‍🚀', 'Удалить аккаунт ❌', 'Получить ссылку 🔗'],
							{
								columns: 2,
							},
						),
					);
				}

				if (message === 'Да 😢') {
					ctx.session.type = 'delete-confirm';

					await ctx.deleteMessage();

					return await ctx.replyWithHTML(
						`<i>ℹ️ Введите <b>Ваш</b> пароль, чтобы подтвердить удаление аккаунта</i>`,
						Markup.removeKeyboard(),
					);
				}
			}

			if (ctx.session.type === 'delete-confirm') {
				const user = await this.firebaseService.getDocByParams('users', {
					key: 'telegram',
					operator: '==',
					value: ctx.from.username,
				});

				if (user.data['password'] !== message) {
					return await ctx.replyWithHTML(
						`<i>❌ <b>Вы ввели неверный пароль! Попробуйте еще раз</b></i>`,
					);
				}

				const link = await this.firebaseService.getDocByParams('qa', {
					key: 'to',
					operator: '==',
					value: user.data['id'],
				});

				for (const product of user.data['products']) {
					await this.firebaseService.deleteDoc(`products/${product}`);
				}

				for (const order of user.data['orders']) {
					await this.firebaseService.deleteDoc(`orders/${order}`);
				}

				const del = await this.firebaseService.deleteDoc(
					`users/${user.data['id']}`,
				);

				const delLink =
					link.status === 'success'
						? await this.firebaseService.deleteDoc(`qa/${link.data['id']}`)
						: '';

				await ctx.replyWithHTML(`<i><b>✅ Ваш</b> аккаунт успешно удален</i>`);

				return await this.botStart(ctx);
			}
		} catch {
			return await ctx.replyWithHTML(
				`<b>Произошла неизвестная ошибка ❌</b>\n\nПовторите попытку позже`,
			);
		}
	}

	async createAccount(@Ctx() ctx: Context): Promise<any> {
		if (ctx.session.type !== 'not_registered') return;

		ctx.session.type = 'registration';

		await ctx.deleteMessage();

		return await ctx.replyWithHTML(
			'<i>Введите <b>Ваше</b> имя</i>',
			Markup.removeKeyboard(),
		);
	}

	async sendMessage(to: string | number, message: string): Promise<any> {
		return await this.reSellerBot.telegram.sendMessage(to, message, {
			parse_mode: 'HTML',
		});
	}

	async profileInfo(@Ctx() ctx: Context): Promise<any> {
		if (ctx.session.type !== 'none') return;

		await ctx.deleteMessage();

		const user = await this.firebaseService.getDocByParams('users', {
			key: 'telegram',
			operator: '==',
			value: ctx.from.username,
		});

		if (user.status === 'failure') {
			ctx.session.type = 'not_registered';

			return await ctx.replyWithHTML(
				'<b>❌ Ваш аккаунт был удален!</b>',
				Markup.keyboard(['Создать аккаунт 👨‍🚀', 'Проверить ⏳'], { columns: 2 }),
			);
		}

		let buysLength: number = 0;

		for (const buy of user.data['buys']) {
			buysLength += buy['amount'];
		}

		return await ctx.replyWithHTML(
			`<b>🪪 ID</b>: ${user.data['id']}\n\n\n<i>ℹ️ Имя</i>: <b>${
				user.data['name']
			}</b>\n\n<i>🔐 Логин</i>: <b>${
				user.data['login']
			}</b>\n\n<i>📲 Telegram ID</i>: <b>${
				user.data['telegramId']
			}</b>\n\n<i>🛍️ Количество товаров</i>: <b>${
				user.data['products'].length
			}</b>\n\n<i>💵 Количество продаж</i>: <b>${buysLength}</b>\n\n\n<i>💰 Баланс</i>: <b>₽${(
				user.data['balance'] as number
			).toLocaleString('ru-RU', {
				style: 'currency',
				maximumFractionDigits: 2,
			})}</b>`,
		);
	}

	async deleteAccount(@Ctx() ctx: Context): Promise<any> {
		if (ctx.session.type !== 'none') return;

		const user = await this.firebaseService.getDocByParams('users', {
			key: 'telegram',
			operator: '==',
			value: ctx.from.username,
		});

		if (user.status === 'failure') {
			ctx.session.type = 'not_registered';

			return await ctx.replyWithHTML(
				'<b>❌ Ваш аккаунт был удален!</b>',
				Markup.keyboard(['Создать аккаунт 👨‍🚀', 'Проверить ⏳'], { columns: 2 }),
			);
		}

		ctx.session.type = 'delete';

		await ctx.deleteMessage();

		return await ctx.replyWithHTML(
			`<i><b>ℹ️ Вы</b> уверены, что хотите удалить <b>Ваш</b> аккаунт\n\n💰 Ваш баланс: <b>₽${(
				user.data['balance'] as number
			).toLocaleString('ru-RU', {
				style: 'currency',
				maximumFractionDigits: 2,
			})}</b></i>`,
			Markup.keyboard(['Да 😢', 'Нет 😊'], { columns: 2 }),
		);
	}

	async checkReg(@Ctx() ctx: Context): Promise<any> {
		if (ctx.session.type !== 'not_registered') return;

		const user = await this.firebaseService.getDocByParams('users', {
			key: 'telegram',
			operator: '==',
			value: ctx.from.username,
		});

		if (user.error) {
			return await ctx.replyWithHTML(
				`<i><b>❌ Вы</b> все еще не зарегистрированы\n\n<a href='${process.env.SITE_BASE_URL}/registration'>Регистрация</a>\n\nℹ️ Если <b>Вы</b> зарегистрировались, но проверка не проходит, то попробуйте чуть позже...</i>`,
			);
		}

		return await this.botStart(ctx);
	}

	async getQuickLink(@Ctx() ctx: Context) {
		if (ctx.session.type !== 'none') return;

		const user = await this.firebaseService.getDocByParams('users', {
			key: 'telegram',
			operator: '==',
			value: ctx.from.username,
		});

		if (user.status === 'failure') {
			ctx.session.type = 'not_registered';

			return await ctx.replyWithHTML(
				'<b>❌ Ваш аккаунт был удален!</b>',
				Markup.keyboard(['Создать аккаунт 👨‍🚀', 'Проверить ⏳'], { columns: 2 }),
			);
		}

		const link = await this.firebaseService.getDocByParams('qa', {
			key: 'to',
			operator: '==',
			value: user.data['id'],
		});

		if (link.status === 'failure') {
			const link = await this.quickAuthService.createAuthLink({
				to: user.data['id'],
			} as QuickAuth);

			return await ctx.replyWithHTML(
				`<i><b>🔗 Ваша</b> <a href='${process.env.SITE_BASE_URL}/qa/${link.data['id']}'>Ссылка</a> для быстрой авторизации</i>\n\n<b>⏳ Ссылка действительна 15 минут!</b>`,
			);
		}

		if (link.data['until'] >= new Date().getTime()) {
			const time = Math.round(
				(link.data['until'] - new Date().getTime()) / 1000 / 60,
			);

			return await ctx.replyWithHTML(
				`<i><b>🔗 Ваша</b> <a href='${process.env.SITE_BASE_URL}/qa/${
					link.data['id']
				}'>Ссылка</a> для быстрой авторизации\n\n<b>⏳ Ссылка действительна еще ${
					time > 1 ? time : '~0'
				} ${time >= 5 ? 'минут' : time > 1 ? 'минуты' : 'минут'}</b></i>`,
			);
		}

		const delLink = await this.firebaseService.deleteDoc(
			`qa/${link.data['id']}`,
		);

		const newLink = await this.quickAuthService.createAuthLink({
			to: user.data['id'],
		} as QuickAuth);

		return await ctx.replyWithHTML(
			`<i><b>🔗 Ваша</b> <a href='${process.env.SITE_BASE_URL}/qa/${newLink.data['id']}'>Ссылка</a> для быстрой авторизации</i>\n\n<b>⏳ Ссылка действительна 15 минут!</b>`,
		);
	}
}
