import { describe, expect, it } from "vitest";
import { filtersToQuery, hasRefinements, listingHref, listingPath, parseSearchParams } from "@/lib/search-params";

describe("parseSearchParams", () => {
  it("parses clean filter parameters", () => {
    const f = parseSearchParams({ area: "dha-phase-6", beds: "3", min_price: "50,000", max_price: "150000", sort: "price_asc" });
    expect(f).toEqual({ area: "dha-phase-6", beds: 3, minPrice: 50000, maxPrice: 150000, sort: "price_asc" });
  });

  it("ignores invalid and malicious values", () => {
    const f = parseSearchParams({ beds: "abc", min_price: "-5", area: "../etc/passwd", sort: "drop table", furnished: "nope", q: "" });
    expect(f).toEqual({});
  });

  it("swaps reversed ranges", () => {
    expect(parseSearchParams({ min_price: "200000", max_price: "50000" })).toMatchObject({ minPrice: 50000, maxPrice: 200000 });
    expect(parseSearchParams({ min_area: "10", max_area: "5" })).toMatchObject({ minArea: 5, maxArea: 10 });
  });

  it("normalises amenities (dedupe + sort) and booleans", () => {
    const f = parseSearchParams({ amenities: "parking,gas,parking", main_road: "1", corner: "0" });
    expect(f.amenities).toEqual(["gas", "parking"]);
    expect(f.mainRoad).toBe(true);
    expect(f.corner).toBeUndefined();
  });

  it("accepts repeated amenities params (no-JS form submit)", () => {
    expect(parseSearchParams({ amenities: ["gym", "elevator"] }).amenities).toEqual(["elevator", "gym"]);
  });
});

describe("URL building", () => {
  it("builds clean canonical listing paths without repeating lahore", () => {
    expect(listingPath({})).toBe("/rent/");
    expect(listingPath({ type: "houses" })).toBe("/rent/houses/");
    expect(listingPath({ area: "dha-lahore" })).toBe("/rent/dha-lahore/");
    expect(listingPath({ area: "johar-town", type: "houses" })).toBe("/rent/johar-town/houses/");
    expect(listingPath({ type: "houses", page: 2 })).toBe("/rent/houses/page/2/");
    expect(listingPath({ type: "houses", page: 1 })).toBe("/rent/houses/");
  });

  it("keeps type/area in the path and refinements in a stable query string", () => {
    const href = listingHref({ type: "houses", area: "dha-phase-6", beds: 3, minPrice: 50000, maxPrice: 150000, sort: "newest" });
    expect(href).toBe("/rent/dha-phase-6/houses/?min_price=50000&max_price=150000&beds=3");
  });

  it("only emits unit when an area range is set", () => {
    expect(filtersToQuery({ unit: "kanal" }).toString()).toBe("");
    expect(filtersToQuery({ unit: "kanal", minArea: 1 }).toString()).toBe("min_area=1&unit=kanal");
  });

  it("detects refinements", () => {
    expect(hasRefinements({ type: "houses", area: "gulberg" })).toBe(false);
    expect(hasRefinements({ type: "houses", beds: 2 })).toBe(true);
    expect(hasRefinements({ sort: "newest" })).toBe(false);
    expect(hasRefinements({ sort: "price_asc" })).toBe(true);
  });
});
