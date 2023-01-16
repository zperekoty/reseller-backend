import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { FirestoreResponse } from '../firebase/response.interface';
import { User } from './user.interface';

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get(':id')
	async getUser(@Param('id') id: string): Promise<FirestoreResponse<User>> {
		return await this.usersService.getUser(id);
	}

	@Post('login')
	async getUserByLoginAndPassword(
		@Body() user: User,
	): Promise<FirestoreResponse<User>> {
		return await this.usersService.getUserByLoginAndPassword(user);
	}

	@Post()
	async createUser(@Body() user: User): Promise<FirestoreResponse<User>> {
		return await this.usersService.createUser(user);
	}

	@Delete(':id')
	async deleteUserById(
		@Param('id') id: string,
	): Promise<FirestoreResponse<User>> {
		return await this.usersService.deleteUserById(id);
	}

	@Put()
	async updateUser(@Body() user: User): Promise<FirestoreResponse<User>> {
		return this.usersService.updateUserById(user);
	}
}
