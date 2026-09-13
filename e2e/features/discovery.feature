@discovery @public
Feature: Public Discovery & Models Pricing
  As a developer or visitor
  I want to explore the Mezon LLM platform and view model pricing
  So that I understand capabilities, costs, and setup before or after logging in

  Scenario: Visitor explores landing page branding and features
    Given I am an unauthenticated visitor
    When I visit "/"
    Then I should see the hero heading "Cổng kết nối AI cho Mezon"
    And I should see the advisory warning "Lưu ý quan trọng"
    And I should see the ecosystem tools section
    And I should see the code snippet block

  Scenario: Visitor navigates to models pricing page from landing page
    Given I am an unauthenticated visitor
    When I visit "/"
    And I click on the link to view pricing "Xem bảng giá"
    Then I should be on the "/models" page
    And I should see the pricing title "Bảng giá mô hình"

  Scenario: Search and filter models in the pricing catalog
    Given I am on the "/models" page
    Then I should see models listed in the pricing table
    When I search for "claude-3-5" in the model search input
    Then all visible model cards should contain "claude"
    When I search for "nonexistent-model-xyz" in the model search input
    Then I should see the empty models message "Không tìm thấy model phù hợp"

  Scenario: Filter models by provider category chips
    Given I am on the "/models" page
    When I select the provider chip "anthropic"
    Then all visible model cards should be provided by "anthropic"

  Scenario: Copy model identifier to clipboard
    Given I am on the "/models" page
    When I click the copy button on the first model card
    Then the model identifier should be copied to clipboard
