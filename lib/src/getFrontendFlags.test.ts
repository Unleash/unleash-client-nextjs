import { getFrontendFlags } from "./getFrontendFlags";

const mockClient = {
  start: vi.fn(),
  stop: vi.fn(),
  on: vi.fn(),
  getAllToggles: vi.fn(),
};

describe("getFrontendFlags", () => {
  beforeEach(() => {
    vi.mock("unleash-proxy-client", () => ({
      UnleashClient: vi.fn().mockImplementation(() => mockClient),
    }));
  });

  afterEach(() => {
    Object.keys(mockClient).forEach((key) => {
      mockClient[key as keyof typeof mockClient].mockReset();
    });
  });

  it("should return a list of toggles", async () => {
    mockClient.getAllToggles.mockReturnValue([]);
    mockClient.on.mockImplementation((event, callback) => {
      if (event === "ready") {
        callback();
      }
    });

    await expect(getFrontendFlags()).resolves.toEqual({ toggles: [] });
    expect(mockClient.start).toHaveBeenCalledOnce();
    expect(mockClient.getAllToggles).toHaveBeenCalledOnce();
    expect(mockClient.on).toHaveBeenCalledWith("ready", expect.any(Function));
    expect(mockClient.stop).toHaveBeenCalledOnce();
  });

  it("should add error handler", async () => {
    mockClient.getAllToggles.mockReturnValue([]);
    mockClient.on.mockImplementation((event, callback) => {
      if (event === "error") {
        callback(new Error());
      }
    });

    await expect(getFrontendFlags()).rejects.toThrow();
    expect(mockClient.start).toHaveBeenCalledOnce();
    expect(mockClient.on).toHaveBeenCalledWith("ready", expect.any(Function));
    expect(mockClient.stop).toHaveBeenCalledOnce();
  });

  it("should not hang on error", async () => {
    let errorCallback = vi.fn();
    mockClient.on.mockImplementation((event, callback) => {
      if (event === "error") {
        errorCallback = callback;
      }
    });
    const pendingPromise = getFrontendFlags();

    errorCallback(new Error("error!"));

    await expect(pendingPromise).rejects.toThrow("error!");
  });
});
