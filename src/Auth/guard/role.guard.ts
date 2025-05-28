import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserService } from '../../user/user.service';
import { ForbiddenRoleException } from '../exception/role.exception';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Retrieve the roles metadata attached to the route handler
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true; // If no roles are specified, allow access
    }

    // Get the request object
    const request = context.switchToHttp().getRequest();
    const headers = request.headers;

    if (headers?.authorization) {
      // Retrieve the user details using the userService
      const user = await this.userService.user(headers);

      // Check if the user's role is included in the allowed roles
      if (!roles.includes(user.role)) {
        throw new ForbiddenRoleException(roles.join(' or '));
      }

      return true; // Allow access if the user's role matches
    }

    return false; // Deny access if no authorization header is present
  }
}