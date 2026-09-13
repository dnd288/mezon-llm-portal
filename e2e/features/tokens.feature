@tokens @portal
Feature: API Key Lifecycle & Management
  As an authenticated developer
  I want to create, inspect, copy, and delete API keys
  So that I can connect my developer tools and revoke compromised keys

  Scenario: Render API key list and status badges
    Given I am logged in with a valid session
    When I visit "/tokens"
    Then I should see the page heading "API Keys"
    And I should see the create token button "Tạo API Key"
    And I should see existing API keys in the tokens table

  Scenario: Validate required token name when creating a new key
    Given I am logged in with a valid session
    When I visit "/tokens"
    And I click the create token button "Tạo API Key"
    Then I should see the create token dialog titled "Tạo API Key mới"
    When I submit the create token form without entering a name
    Then I should see the validation error "Vui lòng nhập tên"

  Scenario: Create new API key and copy secret token
    Given I am logged in with a valid session
    When I visit "/tokens"
    And I click the create token button "Tạo API Key"
    And I enter "Production Key BDD" in the key name input
    And I submit the create token form
    Then I should see the secret token displayed starting with "sk-"
    And I should see the copy token button
    When I finish and close the token creation dialog
    Then I should see "Production Key BDD" in the API keys table

  Scenario: Revoke an API key with confirmation dialog
    Given I am logged in with a valid session
    When I visit "/tokens"
    When I click the delete action on the first API key
    Then I should see the confirmation dialog titled "Xóa API Key"
    When I confirm the deletion
    Then the API key should be removed from the table
