import { afterEach, beforeEach, describe, expect, jest, test } from "@jest/globals";
import {ChromeApiService} from "@popup/services/chromeApi.service";
import {PopupService} from "@popup/services/popup.service";
import { SpiedFunction } from "jest-mock";

jest.mock("@popup/services/chromeApi.service");

describe("popup service", () => {
  let consoleErrorSpy: SpiedFunction<(...data: never[]) => void>;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("response is not successful", async () => {
    // @ts-ignore
    ChromeApiService.mockImplementation(() => {
      return {
        sendMessage: jest.fn(() => {
          return { success: false, error: "Unknown" };
        }),
      };
    });

    try {
      await new PopupService().saveCurrentSession("test");
    } catch (e) {
      // @ts-ignore
      expect(e.message).toBe("Unknown");
    }

    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});