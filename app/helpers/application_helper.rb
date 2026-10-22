module ApplicationHelper
  def copyright_notice
    "© #{Time.current.year} #{Rails.application.config.x.copyright_name}"
  end
end
