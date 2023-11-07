import { defineNuxtPlugin } from "#app";
import { $fetch } from "ofetch";
import type { FetchOptions } from "ofetch";
import { useCsrf } from "./composables";

export default defineNuxtPlugin(() => {
  const { csrf } = useCsrf();
  return {
    provide: {
      csrfFetch: (request: string, options?: FetchOptions, fetch = $fetch) => {
        if (!options) {
          options = {};
        }
        options.headers = (options.headers || {}) as Record<string, string>;
        if (csrf && csrf.length) {
          options.headers["csrf-token"] = csrf;
        }
        return fetch(request, options);
      },
      csrf,
    },
  };
});
