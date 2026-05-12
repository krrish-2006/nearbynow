import assert from "node:assert/strict";
import test from "node:test";

import {
  getNsfwScore,
  isUnsafeProductImage,
} from "../src/lib/moderation/product-image-moderation.ts";

test("extracts nsfw score from Falconsai moderation response", () => {
  assert.equal(
    getNsfwScore([
      {
        label: "normal",
        score: 0.98,
      },
      {
        label: "nsfw",
        score: 0.02,
      },
    ]),
    0.02,
  );
});

test("rejects images above the nsfw threshold", () => {
  assert.equal(
    isUnsafeProductImage([
      {
        label: "normal",
        score: 0.05,
      },
      {
        label: "nsfw",
        score: 0.95,
      },
    ]),
    true,
  );
});

test("allows images below the nsfw threshold", () => {
  assert.equal(
    isUnsafeProductImage([
      {
        label: "normal",
        score: 0.99,
      },
      {
        label: "nsfw",
        score: 0.01,
      },
    ]),
    false,
  );
});
