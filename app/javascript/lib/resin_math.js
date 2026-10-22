export const REQUIRED_DIMENSIONS = {
  box: ["length", "width", "height"],
  cylinder: ["diameter", "height"],
  sphere: ["diameter"]
};

export const DIMENSION_LABELS = {
  length: "length",
  width: "width",
  height: "height",
  diameter: "diameter"
};

export function requiredDimensions(shape) {
  return REQUIRED_DIMENSIONS[shape] || [];
}

export function dimensionLabel(dimension) {
  return DIMENSION_LABELS[dimension] || dimension;
}

function parse(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (text === "") return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : NaN;
}

export function calculate(input) {
  const shape = input.shape || "box";
  const required = requiredDimensions(shape);
  const dimensions = {
    length: parse(input.length),
    width: parse(input.width),
    height: parse(input.height),
    diameter: parse(input.diameter)
  };
  const quantity = parse(input.quantity) ?? 1;
  const resinParts = parse(input.resinParts) ?? 2;
  const hardenerParts = parse(input.hardenerParts) ?? 1;
  const wastePercent = parse(input.wastePercent) ?? 10;

  const missing = [];
  const invalid = [];

  required.forEach((dimension) => {
    const value = dimensions[dimension];
    if (value === null) missing.push(dimension);
    else if (!(value > 0)) invalid.push(dimension);
  });

  if (!Number.isInteger(quantity) || quantity < 1) invalid.push("quantity");
  if (!(resinParts > 0)) invalid.push("resin_parts");
  if (!(hardenerParts > 0)) invalid.push("hardener_parts");
  if (!(wastePercent >= 0)) invalid.push("waste_percent");

  if (missing.length || invalid.length) {
    return { ok: false, shape, missing, invalid };
  }

  let volumePerPiece;
  if (shape === "box") {
    volumePerPiece = dimensions.length * dimensions.width * dimensions.height;
  } else if (shape === "cylinder") {
    volumePerPiece = Math.PI * (dimensions.diameter / 2) ** 2 * dimensions.height;
  } else if (shape === "sphere") {
    volumePerPiece = (4 / 3) * Math.PI * (dimensions.diameter / 2) ** 3;
  } else {
    return { ok: false, shape, missing: [], invalid: ["shape"] };
  }

  const totalVolume = volumePerPiece * quantity * (1 + wastePercent / 100);
  const resinVolume = (totalVolume * resinParts) / (resinParts + hardenerParts);

  return {
    ok: true,
    shape,
    volumePerPiece,
    totalVolume,
    resinVolume,
    hardenerVolume: totalVolume - resinVolume,
    quantity,
    resinParts,
    hardenerParts,
    wastePercent
  };
}

export function formatMl(value) {
  const precision = Math.abs(value) >= 10 ? 1 : 2;
  return `${value.toLocaleString("en-US", {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  })} ml`;
}
