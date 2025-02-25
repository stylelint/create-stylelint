import { Context, PromptWithOverride } from "../../src/actions/context.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { log, logAction, newline } from "../../src/utils/logger.js";
import { MockPrompt } from "../helpers.js";
import { PackageManager } from "../../src/utils/package-utils.js";
import { getPackageManagerConfirmation } from "../../src/prompts/package-manager.js";
import prompts from "prompts";
import { stripVTControlCharacters } from "node:util";

vi.mock("../../src/utils/logger.ts", () => ({
  log: vi.fn(),
  logAction: vi.fn(),
  newline: vi.fn(),
}));

describe("getPackageManagerConfirmation", () => {
  const mockPrompt = vi.fn() as unknown as MockPrompt;

  mockPrompt.override = vi.fn();

  const mockContext: Context = {
    isDryRun: false,
    help: false,
    prompt: mockPrompt as unknown as PromptWithOverride,
    cwd: new URL("file:///test/"),
    packageManager: undefined,
    shouldSkipInstall: false,
    exit: vi.fn((code: number): never => {
      throw new Error(`Process exited with code ${code}`);
    }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return pre-selected package manager if provided", async () => {
    const contextWithPM = {
      ...mockContext,
      packageManager: "npm" as PackageManager,
    };

    const result = await getPackageManagerConfirmation(contextWithPM);

    expect(result).toBe("npm");
    expect(mockPrompt.override).toHaveBeenCalledWith({ packageManager: "npm" });
    expect(log).toHaveBeenCalledWith(
      expect.stringContaining("Selected package manager: npm")
    );
    expect(newline).toHaveBeenCalled();
  });

  it("should prompt for package manager selection if none pre-selected", async () => {
    mockPrompt.mockResolvedValueOnce({ packageManager: "pnpm" });

    const result = await getPackageManagerConfirmation(mockContext);

    expect(result).toBe("pnpm");
    expect(mockPrompt).toHaveBeenCalledWith(
      {
        type: "select",
        name: "packageManager",
        message: "Select the package manager you'd like to use:",
        choices: [
          { title: "npm", value: "npm" },
          { title: "pnpm", value: "pnpm" },
          { title: "yarn", value: "yarn" },
          { title: "bun", value: "bun" },
          { title: "deno", value: "deno" },
        ],
        initial: 0,
      },
      expect.any(Object)
    );
  });

  it("should log action in dry run mode", async () => {
    const dryRunContext = { ...mockContext, isDryRun: true };

    mockPrompt.mockResolvedValueOnce({ packageManager: "npm" });

    await getPackageManagerConfirmation(dryRunContext);

    expect(logAction).toHaveBeenCalledWith(
      "--dry-run",
      "Skipping package manager selection"
    );
  });

  it("should handle prompt rejection", async () => {
    mockPrompt.mockRejectedValueOnce(new Error("Prompt failed"));

    await expect(getPackageManagerConfirmation(mockContext)).rejects.toThrow(
      "Prompt failed"
    );
  });

  it("should handle cancellation and exit", async () => {
    mockPrompt.mockImplementationOnce(
      (
        _questions: prompts.PromptObject | Array<prompts.PromptObject>,
        options?: prompts.Options
      ) => {
        options?.onCancel?.(
          // prompt
          { name: "packageManager", type: "select" },
          // answers
          {}
        );

        return Promise.resolve({ packageManager: undefined });
      }
    );

    await expect(getPackageManagerConfirmation(mockContext)).rejects.toThrow(
      "Process exited with code 0"
    );

    expect(newline).toHaveBeenCalled();

    const loggedMessage = vi.mocked(log).mock.calls[0]?.[0];

    expect(loggedMessage).toBeDefined();

    const expectedMessage = [
      "⚠ Operation cancelled",
      "❯ You can either:",
      "  1. Rerun with --help for options",
      "  2. Use flags like --use-npm or --use-pnpm or --use-yarn or --use-bun or --use-deno",
    ].join("\n");

    expect(stripVTControlCharacters(loggedMessage!)).toBe(expectedMessage);
    expect(mockContext.exit).toHaveBeenCalledWith(0);
  });
});
