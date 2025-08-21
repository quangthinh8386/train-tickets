import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from 'src/user/dto/register-user.dto';
import { DbService } from 'src/db/db.service';
import { User } from 'src/user/entities/user.entity';
import { LoginUserDto } from 'src/user/dto/login-user.dto';

@Injectable()
export class UserService {

  @Inject(DbService)
  dbService: DbService;

  async login(loginUserDto: LoginUserDto){
    const users: User[] = await this.dbService.read();

    //Check user already
    const userFound = users.find(user => user.accountname === loginUserDto.accountname);
    if (!userFound) {
      throw new BadRequestException(`Login failed`);
    }

    if (userFound.password !== loginUserDto.password) {
      throw new BadRequestException(`Login failed`);
    }

    return userFound

  }

  async register(registerUserDto: RegisterUserDto) {
    const users: User[] = await this.dbService.read();

    //Check user already
    const userFound = users.find(user => user.accountname === registerUserDto.accountname);
    if (userFound) {
      throw new BadRequestException(`User ${registerUserDto.accountname} already`);
    }

    const user = new User();
    user.accountname = registerUserDto.accountname;
    user.password = registerUserDto.password;

    // Push
    users.push(user);

    // Save file
    await this.dbService.write(users);
    return user;
  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}

