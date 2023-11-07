import * as csrf from "uncsrf";
import {
  defineEventHandler,
  getCookie,
  getHeader,
  createError,
  readBody,
  readMultipartFormData,
} from "h3";
import { useSecretKey } from "../helpers";
import type { ModuleOptions } from "../../../types";
import { useRuntimeConfig } from "#imports";
import { parseMultipartData } from "../utils";

const logger = (event: any) => {
  if (process.env.NODE_ENV === "production") {
    return;
  }
  console.error(event);
};

export default defineEventHandler(async (event) => {
  const csrfConfig: ModuleOptions = useRuntimeConfig().csurf;
  const methodsToProtect = csrfConfig.methodsToProtect ?? [];
  const excludedUrls = csrfConfig.excludedUrls ?? [];

  const method = event.node.req.method ?? "";
  if (!methodsToProtect.includes(method)) {
    return;
  }

  const secret = getCookie(event, csrfConfig.cookieKey!) ?? "";
  const headerToken = getHeader(event, "csrf-token");
  const reqBody = await readBody(event).catch(logger);
  const multipartFormData = await readMultipartFormData(event).catch(logger);
  const reqFormData = parseMultipartData(multipartFormData);
  const bodyToken = reqBody?.["csrf-token"];
  const formDataToken = reqFormData?.["csrf-token"];
  const token =
    headerToken ??
    (csrfConfig.useFormToken ? bodyToken ?? formDataToken : undefined) ??
    "";

  // verify the incoming csrf token
  const url = event.node.req.url ?? "";
  const excluded = excludedUrls.some((el) =>
    Array.isArray(el) ? new RegExp(...el).test(url) : el === url,
  );
  if (
    !excluded &&
    !(await csrf.verify(
      secret,
      token,
      await useSecretKey(csrfConfig),
      csrfConfig.encryptAlgorithm,
    ))
  ) {
    throw createError({
      statusCode: 403,
      name: "EBADCSRFTOKEN",
      statusMessage: "CSRF Token Mismatch",
    });
  }
});
