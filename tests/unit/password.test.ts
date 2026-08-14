import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("password hashing", () => {
  it("verifies a correct password against its hash", async () => {
    const hash = await hashPassword("Correct-Horse-1");
    await expect(verifyPassword("Correct-Horse-1", hash)).resolves.toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("Correct-Horse-1");
    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
  });

  it("never stores the password in plain text", async () => {
    const hash = await hashPassword("Correct-Horse-1");
    expect(hash).not.toContain("Correct-Horse-1");
  });
});
