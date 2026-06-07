@invoice
Feature: Invoice List and Detail

  Background:
    Given a seeded invoice exists via the API

  Scenario: List shows the seeded invoice when searched
    Given I am logged in
    And I am on the invoice list page
    When I search for the seeded invoice number
    Then I should see the seeded invoice row in the list

  Scenario: Clicking a row opens the detail page
    Given I am logged in
    And I am on the invoice list page
    When I search for the seeded invoice number
    And I click on the seeded invoice row
    Then I should be on the invoice detail page showing the seeded invoice number

  Scenario: Changing rows per page shows more invoices
    Given I am logged in
    And I am on the invoice list page
    When I select 50 rows per page
    Then I should see more than 10 invoice rows
