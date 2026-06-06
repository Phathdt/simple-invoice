@invoice @smoke
Feature: Create Invoice

  Scenario: Logged-in user creates an invoice and sees success message
    Given I am logged in
    And I am on the create invoice page
    When I fill in the invoice form with a unique invoice number
    And I submit the create invoice form
    Then I should see the invoice creation success message

  Scenario: Empty submit shows validation error
    Given I am logged in
    And I am on the create invoice page
    When I submit the create invoice form without filling it in
    Then I should see a validation error on the create form
