import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-facebook";
import { UsersService } from "src/users/users.service";

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, "facebook") {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService
  ) {
    super({

      clientID: configService.get<string>("FACEBOOK_APP_ID"),
      clientSecret: configService.get<string>("FACEBOOK_APP_SECRET"),
      callbackURL: `${configService.get<string>("CLIENT_URL")}/api/v1/auth/facebook/redirect`,
      scope: "email",
      profileFields: ["emails", "name"],
    });
  }

  async validate(
    access_token: string,
    refresh_token: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void
  ): Promise<any> {
    const { name, emails } = profile;

    const user = await this.usersService.checkUserExists(emails[0].value);
    if (!user) {
      const newUser = await this.usersService.register({
        name: name.familyName + " " + name.middleName + " " + name.givenName,
        email: emails[0].value,
        password: "123456",
        phoneNumber: "",
        address: "",
      });
      return done(null, newUser);
    }


    done(null, user);
  }


}
