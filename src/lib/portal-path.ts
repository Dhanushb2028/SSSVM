export function basePathFor(portal: "admin" | "teacher" | "student" | "parent"): string {
  return `/${portal}`;
}
