import { describe, expect, it } from "vitest";
import { fromSqft, toSqft } from "@/lib/area";
import { generateTitle, slugify, titleToSlug } from "@/lib/slug";
import { containsSaleLanguage, monthlyFrom } from "@/lib/rent-rules";
import { formatArea, formatPKR, formatPKRCompact } from "@/lib/format";
import { enquirySchema, normalizePhone, phoneSchema, propertyFormSchema } from "@/lib/validation";

describe("area conversion", () => {
  it("uses Lahore society conventions (1 Marla = 225 sq ft, 1 Kanal = 20 Marla)", () => {
    expect(toSqft(5, "MARLA")).toBe(1125);
    expect(toSqft(1, "KANAL")).toBe(4500);
    expect(toSqft(100, "SQYD")).toBe(900);
    expect(fromSqft(4500, "MARLA")).toBe(20);
  });
});

describe("titles and slugs", () => {
  it("generates natural rental titles", () => {
    expect(generateTitle({ typeName: "House", typeSlug: "house", area: 5, areaUnit: "MARLA", bedrooms: 3, locationName: "Johar Town" })).toBe("5 Marla House for Rent in Johar Town");
    expect(generateTitle({ typeName: "Flat", typeSlug: "flat", area: 900, areaUnit: "SQFT", bedrooms: 3, locationName: "Gulberg" })).toBe("3 Bedroom Flat for Rent in Gulberg");
    expect(generateTitle({ typeName: "Office", typeSlug: "office", area: 800, areaUnit: "SQFT", locationName: "DHA Lahore" })).toBe("Office for Rent in DHA Lahore");
    expect(generateTitle({ typeName: "Warehouse", typeSlug: "warehouse", area: 9000, areaUnit: "SQFT", locationName: "Raiwind Road" })).toBe("Warehouse for Rent on Raiwind Road");
  });

  it("creates clean slugs", () => {
    expect(titleToSlug("5 Marla House for Rent in Johar Town")).toBe("5-marla-house-for-rent-johar-town");
    expect(slugify("  Gulberg III — Main Boulevard & MM Alam!! ")).toBe("gulberg-iii-main-boulevard-and-mm-alam");
  });
});

describe("rent-only rules", () => {
  it("rejects sale language", () => {
    expect(containsSaleLanguage("House for sale in DHA")).toBe(true);
    expect(containsSaleLanguage("Buy this flat now")).toBe(true);
    expect(containsSaleLanguage("5 Marla House for Rent in Johar Town", "Separate meters, near park.")).toBe(false);
  });

  it("normalises monthly rent", () => {
    expect(monthlyFrom(120000, "MONTHLY")).toBe(120000);
    expect(monthlyFrom(1200000, "YEARLY")).toBe(100000);
    expect(monthlyFrom(300000, "QUARTERLY")).toBe(100000);
  });
});

describe("formatting", () => {
  it("formats rent and area", () => {
    expect(formatPKR(85000)).toBe("PKR 85,000");
    expect(formatPKRCompact(150000)).toBe("1.5 Lakh");
    expect(formatPKRCompact(25000000)).toBe("2.5 Crore");
    expect(formatArea(10, "MARLA")).toBe("10 Marla");
    expect(formatArea(1250, "SQFT")).toBe("1,250 Sq. Ft.");
  });
});

describe("validation", () => {
  it("validates and normalises Pakistani phone numbers", () => {
    expect(phoneSchema.safeParse("0300 1234567").success).toBe(true);
    expect(phoneSchema.safeParse("+92 300 1234567").success).toBe(true);
    expect(phoneSchema.safeParse("12345").success).toBe(false);
    expect(normalizePhone("0300-1234567")).toBe("+923001234567");
    expect(normalizePhone("00923001234567")).toBe("+923001234567");
  });

  it("validates enquiries", () => {
    const ok = enquirySchema.safeParse({ propertyId: "abc", name: "Ali", phone: "03001234567", email: "", message: "Is this still available?", preferredContact: "WHATSAPP" });
    expect(ok.success).toBe(true);
    const bad = enquirySchema.safeParse({ propertyId: "abc", name: "A", phone: "1", message: "hi" });
    expect(bad.success).toBe(false);
  });

  it("validates the property form and keeps coordinates inside Lahore", () => {
    const base = {
      propertyTypeId: "t", price: "85,000", priceFrequency: "MONTHLY", area: "10", areaUnit: "MARLA", locationId: "l",
      description: "A well maintained family house with separate meters and a lawn.", amenityIds: [],
    };
    expect(propertyFormSchema.safeParse(base).success).toBe(true);
    expect(propertyFormSchema.safeParse({ ...base, latitude: "24.86", longitude: "67.0" }).success).toBe(false); // Karachi
    expect(propertyFormSchema.safeParse({ ...base, videoUrl: "https://evil.example.com/x" }).success).toBe(false);
  });
});
