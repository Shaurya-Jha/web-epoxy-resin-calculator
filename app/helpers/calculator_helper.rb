module CalculatorHelper
  SHAPE_ICONS = {
    "box" => [
      "M12 2.5 21 7.5v9l-9 5-9-5v-9l9-5Z",
      "M3 7.5l9 5 9-5",
      "M12 12.5v9"
    ],
    "cylinder" => [
      "M19 6c0 1.7-3.1 3-7 3S5 7.7 5 6s3.1-3 7-3 7 1.3 7 3Z",
      "M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6"
    ],
    "sphere" => [
      "M20.5 12a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0Z",
      "M20.5 12c0 1.8-3.8 3.2-8.5 3.2S3.5 13.8 3.5 12 7.3 8.8 12 8.8s8.5 1.4 8.5 3.2Z"
    ]
  }.freeze

  def shape_icon(shape)
    paths = SHAPE_ICONS.fetch(shape, []).map { |d| tag.path(d: d) }

    tag.svg(safe_join(paths),
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": 1.6,
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            class: "shape__icon",
            aria: { hidden: true })
  end

  def ml(amount)
    "#{number_with_precision(amount, precision: amount.abs >= 10 ? 1 : 2, delimiter: ",")} ml"
  end

  def mix_ratio_text(calculation)
    [ calculation.resin_parts, calculation.hardener_parts ]
      .map { |parts| tidy_number(parts) }
      .join(" : ")
  end

  def mix_share(part, total)
    return 0 if total.to_f.zero?

    (part / total * 100).round
  end

  def tidy_number(value)
    return if value.nil?

    value == value.to_i ? value.to_i : value
  end
end
