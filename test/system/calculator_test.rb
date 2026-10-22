require "application_system_test_case"

class CalculatorSystemTest < ApplicationSystemTestCase
  test "results update live as the pour changes" do
    visit root_path

    assert_text "One more step"
    assert_text "Add the length, width and height to see how much to mix."

    fill_in "Length", with: 10
    fill_in "Width", with: 5
    fill_in "Height", with: 2

    within ".amount--resin" do
      assert_text "73.3 ml"
    end
    within ".amount--hardener" do
      assert_text "36.7 ml"
    end
    assert_text "110.0 ml"
  end

  test "shape switches the dimensions and validates live" do
    visit root_path

    find("label.shape", text: "Sphere").click

    assert_no_selector "input[name=length]"
    assert_selector "input[name=diameter]"
    assert_text "Add the diameter to see how much to mix."

    fill_in "Diameter", with: 6
    assert_text "124.4 ml"

    fill_in "Diameter", with: 0
    assert_selector ".result-error", visible: true
    assert_text "diameter must be greater than 0."
    assert_selector "input[name=diameter][aria-invalid=true]"
  end
end
