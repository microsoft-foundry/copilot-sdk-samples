import { describe, it, expect, beforeEach } from "vitest";
import {
  BaseISVConnector,
  ISVConnectorConfig,
  ISVConnector,
} from "../../shared/connectors/isv/types.js";
import {
  ConnectorResult,
  success,
  failure,
  ErrorCodes,
} from "../../shared/connectors/types.js";
import { expectSuccess, expectFailure } from "../helpers/index.js";

// Mock implementation for testing
class MockISVConnector extends BaseISVConnector {
  readonly name = "mock-isv";
  readonly vendor = "MockVendor";

  async initialize(): Promise<ConnectorResult<void>> {
    this._isInitialized = true;
    return success(undefined);
  }

  async dispose(): Promise<void> {
    this._isInitialized = false;
  }

  async healthCheck(): Promise<
    ConnectorResult<{ healthy: boolean; version: string }>
  > {
    if (!this._isInitialized) {
      return failure({
        code: ErrorCodes.NOT_INITIALIZED,
        message: "Connector not initialized",
      });
    }
    return success({ healthy: true, version: "1.0.0" });
  }
}

describe("isv/types", () => {
  describe("ISVConnectorConfig", () => {
    it("should allow creating config with apiKey", () => {
      const config: ISVConnectorConfig = {
        mode: "mock",
        apiKey: "test-key",
      };

      expect(config.apiKey).toBe("test-key");
      expect(config.mode).toBe("mock");
    });

    it("should allow creating config with baseUrl", () => {
      const config: ISVConnectorConfig = {
        mode: "mock",
        baseUrl: "https://api.example.com",
      };

      expect(config.baseUrl).toBe("https://api.example.com");
    });

    it("should allow creating config with both apiKey and baseUrl", () => {
      const config: ISVConnectorConfig = {
        mode: "mock",
        apiKey: "test-key",
        baseUrl: "https://api.example.com",
      };

      expect(config.apiKey).toBe("test-key");
      expect(config.baseUrl).toBe("https://api.example.com");
    });

    it("should allow optional apiKey and baseUrl", () => {
      const config: ISVConnectorConfig = {
        mode: "mock",
      };

      expect(config.apiKey).toBeUndefined();
      expect(config.baseUrl).toBeUndefined();
    });
  });

  describe("ISVConnector interface", () => {
    it("should extend BaseConnector", () => {
      const connector: ISVConnector = {
        name: "test",
        vendor: "TestVendor",
        mode: "mock",
        isInitialized: false,
        initialize: async () => success(undefined),
        dispose: async () => {},
        healthCheck: async () => success({ healthy: true, version: "1.0.0" }),
      };

      expect(connector.vendor).toBe("TestVendor");
      expect(connector.name).toBe("test");
    });
  });

  describe("BaseISVConnector", () => {
    let connector: MockISVConnector;
    let config: ISVConnectorConfig;

    beforeEach(() => {
      config = {
        mode: "mock",
        apiKey: "test-key",
        baseUrl: "https://api.example.com",
      };
      connector = new MockISVConnector(config);
    });

    describe("constructor", () => {
      it("should initialize with config", () => {
        expect(connector.mode).toBe("mock");
        expect(connector.name).toBe("mock-isv");
        expect(connector.vendor).toBe("MockVendor");
      });

      it("should start as not initialized", () => {
        expect(connector.isInitialized).toBe(false);
      });
    });

    describe("name property", () => {
      it("should have a name", () => {
        expect(connector.name).toBe("mock-isv");
        expect(typeof connector.name).toBe("string");
      });
    });

    describe("vendor property", () => {
      it("should have a vendor", () => {
        expect(connector.vendor).toBe("MockVendor");
        expect(typeof connector.vendor).toBe("string");
      });
    });

    describe("mode property", () => {
      it("should respect mode from config", () => {
        expect(connector.mode).toBe("mock");
      });

      it("should support live mode", () => {
        const liveConnector = new MockISVConnector({ mode: "live" });
        expect(liveConnector.mode).toBe("live");
      });
    });

    describe("isInitialized property", () => {
      it("should return false before initialization", () => {
        expect(connector.isInitialized).toBe(false);
      });

      it("should return true after initialization", async () => {
        await connector.initialize();
        expect(connector.isInitialized).toBe(true);
      });

      it("should return false after disposal", async () => {
        await connector.initialize();
        await connector.dispose();
        expect(connector.isInitialized).toBe(false);
      });
    });

    describe("initialize", () => {
      it("should initialize successfully", async () => {
        const result = await connector.initialize();
        expectSuccess(result);
        expect(connector.isInitialized).toBe(true);
      });

      it("should be idempotent", async () => {
        await connector.initialize();
        const result = await connector.initialize();
        expectSuccess(result);
        expect(connector.isInitialized).toBe(true);
      });
    });

    describe("dispose", () => {
      it("should dispose successfully", async () => {
        await connector.initialize();
        await connector.dispose();
        expect(connector.isInitialized).toBe(false);
      });

      it("should handle disposal when not initialized", async () => {
        await expect(connector.dispose()).resolves.not.toThrow();
      });
    });

    describe("healthCheck", () => {
      it("should return healthy status when initialized", async () => {
        await connector.initialize();
        const result = await connector.healthCheck();

        expectSuccess(result);
        expect(result.data.healthy).toBe(true);
        expect(result.data.version).toBe("1.0.0");
      });

      it("should return error when not initialized", async () => {
        const result = await connector.healthCheck();

        expectFailure(result, ErrorCodes.NOT_INITIALIZED);
        expect(result.error?.message).toContain("not initialized");
      });
    });

    describe("lifecycle", () => {
      it("should follow initialize -> use -> dispose pattern", async () => {
        // Initialize
        const initResult = await connector.initialize();
        expectSuccess(initResult);
        expect(connector.isInitialized).toBe(true);

        // Use
        const healthResult = await connector.healthCheck();
        expectSuccess(healthResult);

        // Dispose
        await connector.dispose();
        expect(connector.isInitialized).toBe(false);
      });
    });
  });

  describe("ISVConnectorFactory type", () => {
    it("should allow creating factory function", () => {
      type TestConfig = ISVConnectorConfig & { customField?: string };
      type TestConnector = ISVConnector & { customMethod: () => void };

      const factory = (
        config: TestConfig,
      ): TestConnector & BaseISVConnector => {
        class TestConnector extends BaseISVConnector {
          readonly name = "test";
          readonly vendor = "Test";

          customMethod() {
            return config.customField;
          }

          async initialize() {
            this._isInitialized = true;
            return success(undefined);
          }

          async dispose() {
            this._isInitialized = false;
          }

          async healthCheck() {
            return success({ healthy: true, version: "1.0.0" });
          }
        }

        return new TestConnector(config) as TestConnector & BaseISVConnector;
      };

      const connector = factory({ mode: "mock", customField: "test" });
      expect(connector.customMethod()).toBe("test");
    });
  });
});
