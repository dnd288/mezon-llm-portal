@journey @full
Feature: Complete End-to-End User Journey
  As a new Mezon user
  I want to explore models, log in, create an API key, top up quota, check logs, and log out
  So that I have full confidence in the Mezon LLM Portal workflow

  Scenario: Full user journey from visitor exploration to key generation and voucher redemption
    Given I am an unauthenticated visitor
    When I visit "/"
    Then I should see the hero heading "Cổng kết nối AI cho Mezon"
    When I click on the link to view pricing "Xem bảng giá"
    Then I should be on the "/models" page
    And I should see models listed in the pricing table
    When I authenticate with a valid session and visit "/dashboard"
    Then I should see the user greeting "Xin chào"
    And I should see the quota balance card with "Số dư khả dụng"
    When I visit "/tokens"
    And I click the create token button "Tạo API Key"
    And I enter "Journey Test Key" in the key name input
    And I submit the create token form
    Then I should see the secret token displayed starting with "sk-"
    When I finish and close the token creation dialog
    Then I should see "Journey Test Key" in the API keys table
    When I visit "/vouchers"
    And I submit the voucher code "VOUCHER-VALID-500K"
    Then I should see a success notification "Nạp voucher thành công"
    When I visit "/logs"
    Then I should see the logs table with headers "Thời gian", "Key", "Model", "Tokens", and "Chi phí"
    When I click the logout button
    Then I should be redirected to "/"
