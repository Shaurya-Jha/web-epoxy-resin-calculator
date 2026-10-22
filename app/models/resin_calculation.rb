# Works out resin and hardener volumes for a cast, by volume.
class ResinCalculation
  SHAPES = {
    "box" => "Box",
    "cylinder" => "Cylinder",
    "sphere" => "Sphere"
  }.freeze

  REQUIRED_DIMENSIONS = {
    "box" => %i[length width height],
    "cylinder" => %i[diameter height],
    "sphere" => %i[diameter]
  }.freeze

  DIMENSION_LABELS = {
    length: "Length",
    width: "Width",
    height: "Height",
    diameter: "Diameter"
  }.freeze

  attr_reader :shape, :length, :width, :height, :diameter,
              :quantity, :resin_parts, :hardener_parts, :waste_percent, :errors

  def initialize(params = {})
    @shape = params[:shape].presence || "box"
    @errors = []

    @length = number(params[:length])
    @width = number(params[:width])
    @height = number(params[:height])
    @diameter = number(params[:diameter])
    @quantity = number(params[:quantity]) || 1
    @resin_parts = number(params[:resin_parts]) || 2
    @hardener_parts = number(params[:hardener_parts]) || 1
    @waste_percent = number(params[:waste_percent]) || 10

    validate
  end

  def valid?
    errors.empty?
  end

  def volume_per_piece
    case shape
    when "box" then length * width * height
    when "cylinder" then Math::PI * (diameter / 2.0)**2 * height
    when "sphere" then 4.0 / 3 * Math::PI * (diameter / 2.0)**3
    end
  end

  def total_volume
    volume_per_piece * quantity * (1 + waste_percent / 100.0)
  end

  # ratio is applied by volume; shortcut: add part densities if weight ratios are needed
  def resin_volume
    total_volume * resin_parts / (resin_parts + hardener_parts)
  end

  def hardener_volume
    total_volume - resin_volume
  end

  private

  def number(value)
    return nil if value.blank?

    Float(value)
  rescue ArgumentError, TypeError
    nil
  end

  def positive?(value)
    value&.finite? && value.positive?
  end

  def validate
    errors << "Pick a shape." unless SHAPES.key?(shape)

    REQUIRED_DIMENSIONS.fetch(shape, []).each do |dimension|
      unless positive?(public_send(dimension))
        errors << "Enter a #{DIMENSION_LABELS[dimension].downcase} greater than 0."
      end
    end

    unless positive?(quantity) && quantity == quantity.floor
      errors << "Quantity must be a whole number of at least 1."
    end

    errors << "Mix ratio parts must be greater than 0." unless positive?(resin_parts) && positive?(hardener_parts)
    errors << "Waste % must be 0 or more." unless waste_percent&.finite? && waste_percent >= 0
  end
end
