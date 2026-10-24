import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchCover } from "./import";

const image = () =>
  new Response("img", { headers: { "content-type": "image/jpeg" } });
const redirect = (location: string) =>
  new Response(null, { headers: { location }, status: 302 });

afterEach(() => vi.unstubAllGlobals());

describe("fetchCover", () => {
  it("follows a redirect to an allowed host", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(redirect("https://ia800100.us.archive.org/a.jpg"))
      .mockResolvedValueOnce(image());
    vi.stubGlobal("fetch", fetchMock);
    const response = await fetchCover(
      "https://covers.openlibrary.org/b/id/1-L.jpg"
    );
    expect(response?.ok).toBe(true);
    expect(fetchMock).toHaveBeenLastCalledWith(
      "https://ia800100.us.archive.org/a.jpg",
      expect.objectContaining({ redirect: "manual" })
    );
  });

  it("resolves relative redirects against the current URL", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(redirect("/b/x.jpg"))
      .mockResolvedValueOnce(image());
    vi.stubGlobal("fetch", fetchMock);
    await fetchCover("https://covers.openlibrary.org/b/id/1-L.jpg");
    expect(fetchMock.mock.calls[1]?.[0]).toBe(
      "https://covers.openlibrary.org/b/x.jpg"
    );
  });

  it("refuses a redirect to a disallowed host", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(redirect("https://evil.example/a.jpg"));
    vi.stubGlobal("fetch", fetchMock);
    const response = await fetchCover(
      "https://coverartarchive.org/release-group/x/front-500"
    );
    expect(response).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("gives up after three redirects", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(() =>
        Promise.resolve(redirect("https://archive.org/loop"))
      );
    vi.stubGlobal("fetch", fetchMock);
    expect(await fetchCover("https://archive.org/start")).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });
});
