import { NestFactory } from '@nestjs/core';

import { ReSellerModule } from './';

async function bootstrap() {
	const ReSeller = await NestFactory.create(ReSellerModule);

	ReSeller.enableCors();

	await ReSeller.listen(process.env.PORT || 3000, () =>
		console.log(
			`\x1b[31mNestJS server \x1b[34mstarted \x1b[0mon port \x1b[35m${
				process.env.PORT
			}\x1b[0m\nTest it at \x1b[32mhttp://localhost:${
				process.env.PORT || 3000
			}\x1b[0m`,
		),
	);
}

bootstrap();
