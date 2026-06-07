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

  Scenario: Created invoice appears in the list and is not overdue
    Given I am logged in
    And I am on the create invoice page
    When I fill in the invoice form with a future due date
    And I submit the create invoice form
    Then I should see the invoice creation success message
    When I open the created invoice from the list
    Then the invoice status should be "Draft"

  Scenario: Invalid email shows validation error
    Given I am logged in
    And I am on the create invoice page
    When I fill in the customer email with "not-an-email"
    And I submit the create invoice form
    Then I should see the email validation error "Invalid email"

  Scenario: Invalid phone number shows validation error
    Given I am logged in
    And I am on the create invoice page
    When I fill in the customer phone with "123"
    And I submit the create invoice form
    Then I should see the phone validation error "Phone number too short (min 7 digits)"
