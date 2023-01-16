import { Context as ContextTelegraf } from 'telegraf';

export interface Context extends ContextTelegraf {
	session: {
		type?:
			| 'verification'
			| 'none'
			| 'registration'
			| 'registration-login'
			| 'registration-password'
			| 'not_registered'
			| 'delete'
			| 'delete-confirm';
		name: string;
		login: string;
		password: string;
	};
}
