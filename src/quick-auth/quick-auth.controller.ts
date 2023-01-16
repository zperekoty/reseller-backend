import { Controller, Get, Param } from '@nestjs/common';

import { QuickAuthService } from './quick-auth.service';
import { FirestoreResponse } from '../firebase/response.interface';
import { User } from 'src/users/user.interface';

@Controller('qa')
export class QuickAuthController {
	constructor(private readonly quickAuthService: QuickAuthService) {}

	// @Post()
	// async createAuthLink(@Body() link: QuickAuth): Promise<FirestoreResponse> {
	// 	return await this.quickAuthService.createAuthLink(link);
	// }

	@Get(':id')
	async getLink(@Param('id') id: string): Promise<FirestoreResponse<User>> {
		return await this.quickAuthService.getLink(id);
	}
}
