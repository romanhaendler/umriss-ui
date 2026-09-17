/* Reading the plot's canvases: what a picture actually put where.

   The schedule says most of what it says on a canvas, and a snapshot only
   proves that the picture did not change - not that a bar is hollow, that a
   fixed one carries caps, or that a held ghost is tied to the pointer. Those
   are statements about PIXELS at a place, and this is how a test asks for
   them.

   Everything is counted inside the browser: an 800 by 200 plot at two device
   pixels a side is over two million numbers, and none of them has to cross
   into the test. Rectangles are in CSS pixels, relative to the plot's top left
   corner - the same coordinates `plot.ts` hands out, minus the plot's own
   position. */

import type { Locator } from "@playwright/test";

/** Which of the plot's two canvases: the data layer carries the grid, the
    bars and the findings; the overlay carries hover, the ghost and everything
    a gesture draws. */
export type Layer = "data" | "overlay";

export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

function canvasOf(example: Locator, layer: Layer): Locator {
  return example.locator("[data-schedule-plot] canvas").nth(layer === "data" ? 0 : 1);
}

/** The bytes of a rectangle, and the rectangle as the canvas really holds it.

    One reading for all of them: the canvas is sized at the device's pixel
    ratio while the caller counts in CSS pixels, and the conversion is a place
    to get wrong once rather than four times. Everything is counted inside the
    browser - an 800 by 200 plot at two device pixels a side is over two
    million numbers, and none of them has to cross into the test. */
async function bytesOf(example: Locator, layer: Layer, rect: Rect): Promise<{ data: number[]; pixels: number }> {
  return await canvasOf(example, layer).evaluate((canvas, box) => {
    const element = canvas as HTMLCanvasElement;
    const ctx = element.getContext("2d");
    if (ctx === null) throw new Error("no 2d context");
    const ratio = element.width / element.clientWidth;
    const w = Math.max(1, Math.round(box.width * ratio));
    const h = Math.max(1, Math.round(box.height * ratio));
    const data = ctx.getImageData(Math.round(box.x * ratio), Math.round(box.y * ratio), w, h).data;
    return { data: [...data], pixels: w * h };
  }, rect);
}

/** How many pixels of a rectangle carry any paint at all. */
export async function painted(example: Locator, layer: Layer, rect: Rect): Promise<number> {
  const { data } = await bytesOf(example, layer, rect);
  let count = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i]! > 8) count++;
  return count;
}

/** The share of a rectangle that carries paint, from 0 to 1 - the measure for
    "hollow", "filled" and "drawn back", which a raw count cannot give without
    the reader working out the area as well. */
export async function paintedShare(example: Locator, layer: Layer, rect: Rect): Promise<number> {
  const { data, pixels } = await bytesOf(example, layer, rect);
  let count = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i]! > 8) count++;
  return count / pixels;
}

export interface Point {
  readonly x: number;
  readonly y: number;
}

/** The four channels at a point of a canvas, in CSS pixels from the plot's top
    left. Alpha is the canvas' own: nothing drawn is a zero there, and the
    surface a reader sees through it belongs to the CSS beneath. */
export async function rgba(example: Locator, layer: Layer, point: Point): Promise<[number, number, number, number]> {
  const { data } = await bytesOf(example, layer, { ...point, width: 1, height: 1 });
  return [data[0]!, data[1]!, data[2]!, data[3]!];
}

/** The paint at a point as one comparable value - for asking whether two
    places carry the same thing without the test having to know the theme's
    values. */
export async function colour(example: Locator, layer: Layer, point: Point): Promise<string> {
  return (await rgba(example, layer, point)).join(",");
}

/** How far the paint at a point stands from a colour, over all four channels.
    A fade is a gradient, so this is how a test says "further along it". */
export async function distanceFrom(
  example: Locator,
  layer: Layer,
  point: Point,
  from: readonly [number, number, number, number],
): Promise<number> {
  const here = await rgba(example, layer, point);
  return here.reduce((sum, value, i) => sum + Math.abs(value - from[i]!), 0);
}
