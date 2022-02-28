import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Session,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { Serialize } from '../interceptors/serialize.interceptor';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserDto } from './dtos/user.dto';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Serialize(UserDto)
@Controller('auth')
export class UsersController {
  constructor(
    private userService: UsersService,
    private authService: AuthService,
  ) {}

  @Post('signup')
  async createUser(@Body() body: CreateUserDto, @Session() session: any) {
    const user = await this.authService.signup(body.email, body.password);
    session.userId = user.id;
    return user;
  }

  @Post('signin')
  async signin(@Body() body: CreateUserDto, @Session() session: any) {
    const user = await this.authService.signin(body.email, body.password);
    session.userId = user.id;
    return user;
  }

  @UseGuards(AuthGuard)
  @Post('/signout')
  signout(@Session() session: any) {
    session.userId = null;
  }

  // @Get('/whoami')
  // whoAmI(@Session() session: any) {
  //   return this.userService.findOne(session.userId);
  // }

  @UseGuards(AuthGuard)
  @Get('/whoami')
  whoAmI(@CurrentUser() user: User) {
    return user;
  }

  @Get('/:id')
  async findUser(@Param('id') id: string) {
    const user = await this.userService.findOne(parseInt(id));
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  @Get()
  findAllUser(@Query('email') email: string) {
    return this.userService.find(email);
  }

  @Patch('/:id')
  updateUser(@Param('id') id: string, @Body() attrs: UpdateUserDto) {
    return this.userService.update(parseInt(id), attrs);
  }

  @Delete('/:id')
  removeUser(@Param('id') id: string) {
    return this, this.userService.remove(parseInt(id));
  }
}
