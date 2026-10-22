require "test_helper"

class ResinCalculationTest < ActiveSupport::TestCase
  test "box volume split by a 2:1 ratio" do
    calc = ResinCalculation.new(
      shape: "box", length: 10, width: 5, height: 2,
      quantity: 1, resin_parts: 2, hardener_parts: 1, waste_percent: 0
    )

    assert calc.valid?
    assert_in_delta 100, calc.volume_per_piece, 0.001
    assert_in_delta 100, calc.total_volume, 0.001
    assert_in_delta 66.667, calc.resin_volume, 0.01
    assert_in_delta 33.333, calc.hardener_volume, 0.01
  end

  test "cylinder volume" do
    calc = ResinCalculation.new(shape: "cylinder", diameter: 5, height: 10, waste_percent: 0, resin_parts: 1, hardener_parts: 1)

    assert calc.valid?
    assert_in_delta 196.35, calc.volume_per_piece, 0.01
  end

  test "sphere volume" do
    calc = ResinCalculation.new(shape: "sphere", diameter: 6, waste_percent: 0)

    assert calc.valid?
    assert_in_delta 113.10, calc.volume_per_piece, 0.01
  end

  test "quantity, waste and decimal ratio are applied" do
    calc = ResinCalculation.new(
      shape: "box", length: 10, width: 10, height: 1,
      quantity: 3, waste_percent: 10, resin_parts: 2.5, hardener_parts: 1
    )

    assert calc.valid?
    assert_in_delta 330, calc.total_volume, 0.001
    assert_in_delta 235.714, calc.resin_volume, 0.01
    assert_in_delta 94.286, calc.hardener_volume, 0.01
  end

  test "blank optional numbers fall back to defaults" do
    calc = ResinCalculation.new(shape: "box", length: 10, width: 10, height: 1)

    assert calc.valid?
    assert_equal 1, calc.quantity
    assert_equal 2, calc.resin_parts
    assert_equal 1, calc.hardener_parts
    assert_equal 10, calc.waste_percent
  end

  test "dimensions not used by the shape are ignored" do
    calc = ResinCalculation.new(shape: "box", length: 10, width: 10, height: 1, diameter: 0)

    assert calc.valid?
  end

  test "missing, zero or non-numeric dimensions are rejected" do
    assert_not ResinCalculation.new(shape: "box", length: 10, width: 10).valid?
    assert_not ResinCalculation.new(shape: "cylinder", diameter: 0, height: 5).valid?
    assert_not ResinCalculation.new(shape: "sphere", diameter: "wide").valid?
  end

  test "invalid quantity, ratio and waste are rejected" do
    base = { shape: "box", length: 10, width: 10, height: 1 }

    assert_not ResinCalculation.new(base.merge(quantity: 1.5)).valid?
    assert_not ResinCalculation.new(base.merge(resin_parts: 0)).valid?
    assert_not ResinCalculation.new(base.merge(hardener_parts: -1)).valid?
    assert_not ResinCalculation.new(base.merge(waste_percent: -5)).valid?
  end

  test "unknown shape is rejected" do
    assert_not ResinCalculation.new(shape: "pyramid", length: 10).valid?
  end
end
