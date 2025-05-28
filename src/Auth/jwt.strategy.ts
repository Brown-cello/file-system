import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/user/schemas/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private userService: UserService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('JWTSECRET'),
    });
  }

  async validate(payload: { id: string; email: string }): Promise<Partial<User>> {
    const user = await this.userService.findOne(payload.id);
    if (!user) {
      throw new UnauthorizedException('Login first to access this endpoint');
    }

    return {
      _id: user._id,
      email: user.email,
      profilePictureUrl: user.profilePictureUrl,
    };
  }
}
