
import { createParamDecorator, ExecutionContext, SetMetadata, UseInterceptors } from '@nestjs/common';
import { ClassContrustor, SerializeInterceptor } from '../core/serialize.interceptor';
import { UserRole } from '../enum/userRole.enum';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const RESPONSE_MESSAGE = 'response_message'; 
export const ResponseMessage = (message: string) =>
      SetMetadata(RESPONSE_MESSAGE, message);


export const User = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
      const request = ctx.switchToHttp().getRequest();
      return request.user;
    },
  );


  export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);


export function Serialize(dto: ClassContrustor) {
  return UseInterceptors(new SerializeInterceptor(dto));
}