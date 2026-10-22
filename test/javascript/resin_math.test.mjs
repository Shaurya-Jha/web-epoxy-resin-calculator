import { test } from "node:test"
import assert from "node:assert/strict"
import { calculate, formatMl, requiredDimensions } from "../../app/javascript/lib/resin_math.js"

function close(actual, expected, epsilon = 0.01) {
  assert.ok(
    Math.abs(actual - expected) < epsilon,
    `expected ${actual} to be close to ${expected}`
  )
}

test("box volume split by a 2:1 ratio", () => {
  const result = calculate({
    shape: "box", length: "10", width: "5", height: "2",
    quantity: "1", resinParts: "2", hardenerParts: "1", wastePercent: "0"
  })

  assert.equal(result.ok, true)
  close(result.volumePerPiece, 100)
  close(result.totalVolume, 100)
  close(result.resinVolume, 66.667)
  close(result.hardenerVolume, 33.333)
})

test("cylinder volume", () => {
  const result = calculate({
    shape: "cylinder", diameter: "5", height: "10", wastePercent: "0",
    resinParts: "1", hardenerParts: "1"
  })

  assert.equal(result.ok, true)
  close(result.volumePerPiece, 196.35)
})

test("sphere volume", () => {
  const result = calculate({ shape: "sphere", diameter: "6", wastePercent: "0" })

  assert.equal(result.ok, true)
  close(result.volumePerPiece, 113.1)
})

test("quantity, waste and decimal ratio are applied", () => {
  const result = calculate({
    shape: "box", length: "10", width: "10", height: "1",
    quantity: "3", wastePercent: "10", resinParts: "2.5", hardenerParts: "1"
  })

  assert.equal(result.ok, true)
  close(result.totalVolume, 330)
  close(result.resinVolume, 235.714)
  close(result.hardenerVolume, 94.286)
})

test("blank optional values fall back to the server defaults", () => {
  const result = calculate({ shape: "box", length: "10", width: "10", height: "1" })

  assert.equal(result.ok, true)
  assert.equal(result.quantity, 1)
  assert.equal(result.resinParts, 2)
  assert.equal(result.hardenerParts, 1)
  assert.equal(result.wastePercent, 10)
  close(result.totalVolume, 110)
})

test("dimensions not used by the shape are ignored", () => {
  const result = calculate({ shape: "box", length: "10", width: "10", height: "1", diameter: "0" })

  assert.equal(result.ok, true)
})

test("missing dimensions are reported separately from invalid ones", () => {
  const result = calculate({ shape: "box", length: "10" })

  assert.equal(result.ok, false)
  assert.deepEqual(result.missing, ["width", "height"])
  assert.deepEqual(result.invalid, [])
})

test("invalid dimensions, quantity, ratio and waste are rejected", () => {
  const box = { shape: "box", length: "10", width: "10", height: "1" }

  assert.deepEqual(calculate({ ...box, length: "0" }).invalid, ["length"])
  assert.deepEqual(calculate({ ...box, height: "wide" }).invalid, ["height"])
  assert.deepEqual(calculate({ ...box, quantity: "1.5" }).invalid, ["quantity"])
  assert.deepEqual(calculate({ ...box, resinParts: "0" }).invalid, ["resin_parts"])
  assert.deepEqual(calculate({ ...box, hardenerParts: "-1" }).invalid, ["hardener_parts"])
  assert.deepEqual(calculate({ ...box, wastePercent: "-5" }).invalid, ["waste_percent"])
})

test("required dimensions match the shape", () => {
  assert.deepEqual(requiredDimensions("box"), ["length", "width", "height"])
  assert.deepEqual(requiredDimensions("cylinder"), ["diameter", "height"])
  assert.deepEqual(requiredDimensions("sphere"), ["diameter"])
})

test("formatMl matches the server formatting", () => {
  assert.equal(formatMl(1100), "1,100.0 ml")
  assert.equal(formatMl(10), "10.0 ml")
  assert.equal(formatMl(1.234), "1.23 ml")
})
