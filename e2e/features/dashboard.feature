@dashboard @portal
Feature: Authenticated Dashboard & Setup Instructions
  As an authenticated developer
  I want to monitor my quota balance, usage statistics, and integration guides
  So that I can manage my budget and configure coding agents easily

  Scenario: View live quota balance and user greeting
    Given I am logged in with a valid session
    When I visit "/dashboard"
    Then I should see the user greeting "Xin chào"
    And I should see the quota balance card with "Số dư khả dụng"
    And I should see the usage statistics section

  Scenario: Switch between developer setup instructions tabs
    Given I am logged in with a valid session
    When I visit "/dashboard"
    Then I should see setup guide tab "Claude Code"
    When I click on the setup guide tab "OpenCode"
    Then I should see setup command containing "opencode"
    When I click on the setup guide tab "Cursor"
    Then I should see setup instruction for "Cursor"

  Scenario: Quick action navigation from dashboard
    Given I am logged in with a valid session
    When I visit "/dashboard"
    And I click on the quick action "Quản lý API Key"
    Then I should be on the "/tokens" page

  Scenario: Open and close voucher redemption dialog from dashboard
    Given I am logged in with a valid session
    When I visit "/dashboard"
    When I click on the "Nạp Quota" button in the dashboard header
    Then I should see the voucher redemption dialog titled "Nạp Quota bằng Voucher"
    When I close the dialog
    Then the voucher redemption dialog should be closed

  Scenario: Degraded gateway handles offline backend gracefully
    Given I am logged in with an invalid backend gateway token
    When I visit "/dashboard"
    Then I should see the degraded warning banner "Không thể kết nối gateway"
    And the balance display should fallback gracefully to "0"
