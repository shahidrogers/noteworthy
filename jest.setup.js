const { TextEncoder, TextDecoder } = require("util");

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock BroadcastChannel with necessary methods
class BroadcastChannelMock {
  constructor(name) {
    this.name = name;
    this.onmessage = null;
    this.listeners = {};
  }

  postMessage(data) {
    if (this.onmessage) {
      this.onmessage({ data });
    }
    if (this.listeners["message"]) {
      this.listeners["message"].forEach((callback) => callback({ data }));
    }
  }

  addEventListener(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  removeEventListener(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(
      (cb) => cb !== callback
    );
  }

  close() {}
}

global.BroadcastChannel = BroadcastChannelMock;

// Mock SubtleCrypto
const subtleCryptoMock = {
  importKey: jest.fn().mockResolvedValue({
    algorithm: { name: "PBKDF2" },
    extractable: false,
    type: "secret",
    usages: ["deriveKey", "deriveBits"],
  }),
  deriveKey: jest.fn().mockResolvedValue({
    algorithm: { name: "AES-GCM", length: 256 },
    extractable: true,
    type: "secret",
    usages: ["encrypt", "decrypt"],
  }),
  encrypt: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4]).buffer),
  decrypt: jest.fn().mockResolvedValue(new TextEncoder().encode("test").buffer),
};

// Mock Crypto
const cryptoMock = {
  subtle: subtleCryptoMock,
  getRandomValues: jest.fn((arr) => arr),
  randomUUID: jest.fn(() => "test-uuid"),
};

// Ensure crypto is defined globally
Object.defineProperty(global, "crypto", {
  value: cryptoMock,
  writable: true,
});

// Also define it on window for completeness
Object.defineProperty(window, "crypto", {
  value: cryptoMock,
  writable: true,
});

// Set test environment flag
process.env.NODE_ENV = "test";
