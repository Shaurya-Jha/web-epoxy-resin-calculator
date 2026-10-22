import { Controller } from "@hotwired/stimulus"
import {
  calculate,
  requiredDimensions,
  dimensionLabel,
  formatMl
} from "lib/resin_math"

const INVALID_MESSAGES = {
  shape: "Pick a shape.",
  quantity: "Pieces must be a whole number of at least 1.",
  resin_parts: "Resin parts must be greater than 0.",
  hardener_parts: "Hardener parts must be greater than 0.",
  waste_percent: "Waste margin cannot be negative."
}

export default class extends Controller {
  static targets = [
    "form", "empty", "emptyTitle", "emptyText", "error", "errorList", "body",
    "total", "resin", "hardener", "perPiece", "pieces", "waste",
    "ratioBadge", "resinShare", "hardenerShare", "barResin", "barHardener",
    "wasteOutput", "submit", "copy", "dimensionField", "ratioChip", "jsOnly"
  ]

  connect() {
    this.jsOnlyTargets.forEach((element) => { element.hidden = false })
    if (this.hasSubmitTarget) this.submitTarget.hidden = true

    if (!this.formTarget.querySelector("input[name='shape']:checked")) {
      this.formTarget.querySelector("input[name='shape'][value='box']").checked = true
    }

    this.refresh()
  }

  refresh() {
    const values = this.values()
    this.revealDimensionFields(values.shape)
    this.updateWasteLabel(values.wastePercent)
    this.updateRatioChips(values.resinParts, values.hardenerParts)

    const result = calculate(values)
    this.markInvalid(result.ok ? [] : result.invalid)

    if (result.ok) {
      this.renderResult(result)
      this.syncUrl(values)
    } else if (result.invalid.length > 0) {
      this.showError(result.invalid)
    } else {
      this.showEmpty(result.missing)
    }
  }

  preventSubmit(event) {
    event.preventDefault()
    this.refresh()
  }

  chooseRatio(event) {
    const { resin, hardener } = event.currentTarget.dataset
    this.formTarget.elements.namedItem("resin_parts").value = resin
    this.formTarget.elements.namedItem("hardener_parts").value = hardener
    this.refresh()
  }

  increment() {
    this.bumpQuantity(1)
  }

  decrement() {
    this.bumpQuantity(-1)
  }

  async copy() {
    const text = [
      `Resin: ${this.resinTarget.textContent}`,
      `Hardener: ${this.hardenerTarget.textContent}`,
      `Total: ${this.totalTarget.textContent} (${this.ratioBadgeTarget.textContent})`
    ].join("\n")

    try {
      await navigator.clipboard.writeText(text)
      const button = this.copyTarget
      const original = button.textContent
      button.textContent = "Copied!"
      clearTimeout(this.copyTimer)
      this.copyTimer = setTimeout(() => { button.textContent = original }, 1600)
    } catch {
      // Clipboard is unavailable (older browser or denied permission); the amounts stay on screen.
    }
  }

  values() {
    const data = new FormData(this.formTarget)
    return {
      shape: data.get("shape") || "box",
      length: data.get("length"),
      width: data.get("width"),
      height: data.get("height"),
      diameter: data.get("diameter"),
      quantity: data.get("quantity"),
      resinParts: data.get("resin_parts"),
      hardenerParts: data.get("hardener_parts"),
      wastePercent: data.get("waste_percent")
    }
  }

  revealDimensionFields(shape) {
    const required = requiredDimensions(shape)
    this.dimensionFieldTargets.forEach((field) => {
      field.hidden = !required.includes(field.dataset.dimension)
    })
  }

  updateWasteLabel(value) {
    if (!this.hasWasteOutputTarget) return
    const parsed = Number.parseFloat(value)
    this.wasteOutputTarget.textContent = `${Number.isFinite(parsed) ? parsed : 0}%`
  }

  updateRatioChips(resin, hardener) {
    const resinValue = Number.parseFloat(resin)
    const hardenerValue = Number.parseFloat(hardener)
    this.ratioChipTargets.forEach((chip) => {
      const active =
        Number.parseFloat(chip.dataset.resin) === resinValue &&
        Number.parseFloat(chip.dataset.hardener) === hardenerValue
      chip.classList.toggle("is-active", active)
      chip.setAttribute("aria-pressed", active ? "true" : "false")
    })
  }

  renderResult(result) {
    this.toggleState("body")

    const resinShare = Math.round((result.resinVolume / result.totalVolume) * 100)
    this.totalTarget.textContent = formatMl(result.totalVolume)
    this.resinTarget.textContent = formatMl(result.resinVolume)
    this.hardenerTarget.textContent = formatMl(result.hardenerVolume)
    this.perPieceTarget.textContent = formatMl(result.volumePerPiece)
    this.piecesTarget.textContent = String(result.quantity)
    this.wasteTarget.textContent = `${this.trim(result.wastePercent)}%`
    this.ratioBadgeTarget.textContent =
      `${this.trim(result.resinParts)} : ${this.trim(result.hardenerParts)} by volume`
    this.resinShareTarget.textContent = `${resinShare}%`
    this.hardenerShareTarget.textContent = `${100 - resinShare}%`
    this.barResinTarget.style.width = `${resinShare}%`
    this.barHardenerTarget.style.width = `${100 - resinShare}%`
  }

  showEmpty(missing) {
    this.toggleState("empty")
    const names = missing.map(dimensionLabel)
    const list = this.list(names)

    this.emptyTitleTarget.textContent = "One more step"
    this.emptyTextTarget.textContent = list
      ? `Add the ${list} to see how much to mix.`
      : "Add your dimensions to see how much to mix."
  }

  showError(fields) {
    this.toggleState("error")
    this.errorListTarget.replaceChildren(
      ...fields.map((field) => {
        const item = document.createElement("li")
        item.textContent = INVALID_MESSAGES[field] || `${dimensionLabel(field)} must be greater than 0.`
        return item
      })
    )
  }

  toggleState(state) {
    this.emptyTarget.hidden = state !== "empty"
    this.errorTarget.hidden = state !== "error"
    this.bodyTarget.hidden = state !== "body"
  }

  markInvalid(fields) {
    const names = [
      "length", "width", "height", "diameter",
      "quantity", "resin_parts", "hardener_parts", "waste_percent"
    ]

    names.forEach((name) => {
      const input = this.formTarget.elements.namedItem(name)
      if (!input) return
      if (fields.includes(name)) input.setAttribute("aria-invalid", "true")
      else input.removeAttribute("aria-invalid")
    })
  }

  syncUrl(values) {
    const params = new URLSearchParams({ shape: values.shape })
    requiredDimensions(values.shape).forEach((dimension) => {
      const value = values[dimension]
      if (value !== null && value !== "") params.set(dimension, value)
    })
    params.set("quantity", values.quantity || "1")
    params.set("resin_parts", values.resinParts || "2")
    params.set("hardener_parts", values.hardenerParts || "1")
    params.set("waste_percent", values.wastePercent || "10")

    window.history.replaceState({}, "", `${window.location.pathname}?${params}`)
  }

  bumpQuantity(amount) {
    const input = this.formTarget.elements.namedItem("quantity")
    const current = Number.parseInt(input.value, 10)
    const next = Math.max(1, (Number.isFinite(current) ? current : 1) + amount)
    input.value = String(next)
    this.refresh()
  }

  trim(value) {
    return String(Number(value.toFixed(2)))
  }

  list(items) {
    if (items.length <= 1) return items[0] || ""
    return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`
  }
}
