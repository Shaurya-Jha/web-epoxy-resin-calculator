require "test_helper"

class CalculatorTest < ActionDispatch::IntegrationTest
  test "renders the calculator" do
    get root_path

    assert_response :success
    assert_select "h1", /first pour/
    assert_select "form"
    assert_select "input[name=shape]", count: 3
    assert_select "input[name=shape][value=box][checked]"
    assert_select ".result-empty", /amounts land here/
    assert_select ".site-footer__legal", /© \d{4} Resin Calculator\. All rights reserved\./
  end

  test "calculates resin and hardener with waste" do
    get root_path, params: {
      shape: "box", length: 10, width: 10, height: 10,
      quantity: 1, resin_parts: 2, hardener_parts: 1, waste_percent: 10
    }

    assert_response :success
    assert_select ".result-body:not([hidden])"
    assert_select ".result-empty[hidden]"
    assert_select ".amount__value", count: 2
    assert_includes response.body, "733.3 ml"
    assert_includes response.body, "366.7 ml"
    assert_includes response.body, "1,100.0 ml"
    assert_select ".badge", "2 : 1 by volume"
  end

  test "keeps the submitted values in the form" do
    get root_path, params: { shape: "sphere", diameter: 6, quantity: 2 }

    assert_select "input[name=shape][value=sphere][checked]"
    assert_select "input[name=diameter][value='6']"
    assert_select "input[name=quantity][value='2']"
  end

  test "shows errors instead of amounts for invalid input" do
    get root_path, params: { shape: "box", length: 0, width: 10, height: 10 }

    assert_response :success
    assert_select ".result-error:not([hidden])", text: /greater than 0/
    assert_select ".result-body[hidden]"
    assert_select ".result-body[hidden] .amount__value", text: "—", count: 2
  end
end
