@auth @security
Feature: Authentication Guard & Session Security
  As a Mezon LLM Portal system
  I want to protect private routes and validate session cookies
  So that unauthorized users cannot access developer resources and valid users are safely guided

  Scenario Outline: Unauthenticated access to protected route redirects to login
    Given I am an unauthenticated visitor
    When I visit "<route>"
    Then I should be redirected to "/login" with callbackUrl to "<route>"
    And I should see the login heading "Đăng nhập"
    And I should see the Mezon login link

    Examples:
      | route      |
      | /dashboard |
      | /tokens    |
      | /logs      |
      | /vouchers  |

  Scenario: Expired session JWT redirects to login
    Given I have an expired session cookie
    When I visit "/dashboard"
    Then I should be redirected to "/login"
    And I should see the login heading "Đăng nhập"

  Scenario: Malformed or tampered session cookie redirects to login
    Given I have an invalid tampered session cookie
    When I visit "/dashboard"
    Then I should be redirected to "/login"
    And I should see the login heading "Đăng nhập"

  Scenario: Authenticated user visiting login page redirects to dashboard
    Given I am logged in with a valid session
    When I visit "/login"
    Then I should be redirected to "/dashboard"
