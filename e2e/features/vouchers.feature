@vouchers @portal
Feature: Voucher Redemption & Top-up History
  As an authenticated developer
  I want to redeem top-up voucher codes and view transaction history
  So that I can increase my balance and verify previous payments

  Scenario: Render voucher redemption page and history table
    Given I am logged in with a valid session
    When I visit "/vouchers"
    Then I should see the section title "Lịch sử nạp"
    And I should see the voucher input field and redeem button
    And I should see the top-up transaction history table

  Scenario: Submit an invalid voucher code and receive an error message
    Given I am logged in with a valid session
    When I visit "/vouchers"
    When I submit the voucher code "INVALID_CODE"
    Then I should see an error notification containing "Lỗi"

  Scenario: Successfully redeem a valid voucher code
    Given I am logged in with a valid session
    When I visit "/vouchers"
    When I submit the voucher code "MZ-FREE-250K-PROMO"
    Then I should see a success notification "Nạp voucher thành công"
    And the transaction history table should update with new top-up record
