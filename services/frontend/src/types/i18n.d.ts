import "i18next";

import common from "@/../public/locales/pt-BR/common.json";
import auth from "@/../public/locales/pt-BR/auth.json";
import user from "@/../public/locales/pt-BR/user.json";
import poke from "@/../public/locales/pt-BR/poke.json";
import weather from "@/../public/locales/pt-BR/weather.json";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: {
      common: typeof common;
      auth: typeof auth;
      user: typeof user;
      poke: typeof poke;
      weather: typeof weather;
    };
  }
}
