class CalculatorController < ApplicationController
  def show
    @calculation = ResinCalculation.new(calculation_params)
    @submitted = params[:shape].present?
  end

  private

  def calculation_params
    params.permit(:shape, :length, :width, :height, :diameter, :quantity,
                  :resin_parts, :hardener_parts, :waste_percent)
  end
end
