import * as csrf from "uncsrf";
import { getCookie, setCookie } from "h3";
import type { NitroApp } from "nitropack";
import { useSecretKey } from "../helpers";
import { useRuntimeConfig } from "#imports";

type NitroAppPlugin = (nitro: NitroApp) => void;

const defineNitroPlugin = (def: NitroAppPlugin): NitroAppPlugin => def;

// Export runtime plugin
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("render:html", async (html, { event }) => {
    const csrfConfig = useRuntimeConfig().csurf;
    const cookieKey = csrfConfig.cookieKey!;

    let secret = getCookie(event, cookieKey);
    if (!secret) {
      secret = csrf.randomSecret();
      setCookie(event, cookieKey, secret, csrfConfig.cookie);
    }

    const csrfToken = await csrf.create(
      secret,
      await useSecretKey(csrfConfig),
      csrfConfig.encryptAlgorithm,
    );
    html.body.push(`<script>window._csrfToken = "${csrfToken}"</script>`);
  });
});
