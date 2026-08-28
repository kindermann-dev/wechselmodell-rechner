import { describe, it, expect, vi, beforeEach } from "vitest";
import { copyTextToClipboard } from "../clipboard";

describe("Clipboard Utility", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("sollte false zurückgeben wenn kein Text übergeben wird", async () => {
    expect(await copyTextToClipboard("")).toBe(false);
  });

  it("sollte navigator.clipboard.writeText verwenden wenn verfügbar", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: writeTextMock,
      },
      configurable: true,
      writable: true,
    });

    const success = await copyTextToClipboard("https://example.com/#v1=test");
    expect(success).toBe(true);
    expect(writeTextMock).toHaveBeenCalledWith("https://example.com/#v1=test");
  });

  it("sollte auf execCommand zurückfallen, wenn navigator.clipboard fehlschlägt", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: vi.fn().mockRejectedValue(new Error("Permission denied")),
      },
      configurable: true,
      writable: true,
    });

    const execCommandMock = vi.fn().mockReturnValue(true);
    document.execCommand = execCommandMock;

    const success = await copyTextToClipboard("https://example.com/#v1=fallback");
    expect(success).toBe(true);
    expect(execCommandMock).toHaveBeenCalledWith("copy");
  });
});
