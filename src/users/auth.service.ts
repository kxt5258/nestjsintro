import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { UsersService } from './users.service';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(email: string, password: string) {
    // see duplicate email
    const users = await this.usersService.find(email);
    if (users.length > 0) throw new BadRequestException('Email already in use');

    // hash user password
    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    const result = salt + '.' + hash.toString('hex');

    //create user and save
    const user = await this.usersService.create(email, result);
    return user;
  }

  async signin(email: string, password: string) {
    const [user] = await this.usersService.find(email);
    if (!user) throw new NotFoundException('User not found');

    const [salt, storedHash] = user.password.split('.');

    const currentHash = (await scrypt(password, salt, 32)) as Buffer;

    if (storedHash !== currentHash.toString('hex'))
      throw new BadRequestException('');

    return user;
  }
}
