import { getFrontendFlags } from "./getFrontendFlags";

const mockClient = {
  start: vi.fn(),
  stop: vi.fn(),
  on: vi.fn(),
  getAllToggles: vi.fn(),
};

describe("getFrontendFlags", () => {
  vi.mock("unleash-proxy-client", () => ({
    UnleashClient: vi.fn().mockImplementation(() => mockClient),
  }));

  it("should return a list of toggles", async () => {
    mockClient.getAllToggles.mockReturnValue([]);
    mockClient.on.mockImplementation((event, callback) => {
      if (event === "ready") {
        callback();
      }
    });

    const result = await getFrontendFlags();
    expect(result).toEqual({ toggles: [] });
    expect(mockClient.start).toHaveBeenCalledOnce();
    expect(mockClient.getAllToggles).toHaveBeenCalledOnce();
    expect(mockClient.on).toHaveBeenCalledOnce();
    expect(mockClient.on).toHaveBeenLastCalledWith(
      "ready",
      expect.any(Function)
    );
    expect(mockClient.stop).toHaveBeenCalledOnce();
  });
});
