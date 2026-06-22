import { expect, test } from "@playwright/test";
import { resolveAutomaticLanguage } from "../src/lib/locales";

test.describe("automatic language resolution", () => {
  test("prefers the first supported browser language over later English candidates", ({
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "one project is enough for this module test");

    expect(resolveAutomaticLanguage(["de-DE", "en-US"])).toBe("de");
    expect(resolveAutomaticLanguage(["pt-PT", "en-US"])).toBe("pt");
    expect(resolveAutomaticLanguage(["nl-NL"])).toBe("nl");
    expect(resolveAutomaticLanguage(["ms-MY", "id-ID", "en-US"])).toBe("id");
  });

  test("falls back to English when no browser language is supported", ({ browserName }) => {
    test.skip(browserName !== "chromium", "one project is enough for this module test");

    expect(resolveAutomaticLanguage(["ms-MY"])).toBe("en");
  });
});
