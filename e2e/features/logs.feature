@logs @portal
Feature: Usage Logs & Pagination Flow
  As an authenticated developer
  I want to review past API requests and token expenditures
  So that I can audit usage, verify charges, and debug requests

  Scenario: Render usage logs table with request metrics
    Given I am logged in with a valid session
    When I visit "/logs"
    Then I should see the page heading "Nhật ký sử dụng"
    And I should see the logs table with headers "Thời gian", "Key", "Model", "Tokens", and "Chi phí"
    And I should see log entries displayed with model badges

  Scenario: Navigate between pages in usage logs
    Given I am logged in with a valid session
    When I visit "/logs"
    Then I should see the pagination controls
    When I click the next page button
    Then the page number should indicate page 2
    When I click the previous page button
    Then the page number should indicate page 1
