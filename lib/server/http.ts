import { z } from "zod";

// Builds a standardized success response payload.
export function ok<T>(data: T, status = 200) {
  return Response.json({ success: true, data }, { status });
}

// Builds a standardized error response payload.
export function fail(message: string, status = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// Parses and validates JSON body against the given schema.
export async function parseJson<T extends z.ZodTypeAny>(request: Request, schema: T): Promise<z.output<T>> {
  const json = await request.json();
  return schema.parse(json);
}
