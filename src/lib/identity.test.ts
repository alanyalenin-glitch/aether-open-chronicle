import { describe, expect, it } from "vitest";
import { publicName, zodiacFor } from "./identity";

describe("publicName shows only first name + first surname", () => {
  it("4 words", () => expect(publicName("Lenin José Alanya Pérez")).toBe("Lenin Alanya"));
  it("3 words", () => expect(publicName("Lucía Ríos Castro")).toBe("Lucía Ríos"));
  it("2 words", () => expect(publicName("Mateo Vega")).toBe("Mateo Vega"));
});

describe("zodiacFor", () => {
  it("Escorpio", () => expect(zodiacFor("1995-11-02")).toBe("Escorpio"));
  it("Géminis", () => expect(zodiacFor("2000-06-01")).toBe("Géminis"));
  it("Capricornio before Jan 20", () => expect(zodiacFor("1990-01-10")).toBe("Capricornio"));
  it("Acuario from Jan 20", () => expect(zodiacFor("1990-01-25")).toBe("Acuario"));
});
