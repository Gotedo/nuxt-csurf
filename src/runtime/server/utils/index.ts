import type { MultiPartData } from "h3";

export function parseMultipartData(
  multipartData: MultiPartData[] | undefined | void,
) {
  if (!multipartData) {
    return {};
  }
  return multipartData.reduce(
    (prev, cur) => {
      if (cur.name) {
        prev[cur.name] = cur.data.toString();
      }
      return prev;
    },
    {} as Record<string, string>,
  );
}
