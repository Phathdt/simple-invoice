@auth @smoke
Feature: Login

  Scenario: Successful login redirects to invoice list
    Given I am on the login page
    When I log in with valid credentials
    Then I should be on the invoice list page

  Scenario: Invalid credentials show error and stay on login
    Given I am on the login page
    When I log in with email "wrong@example.com" and password "wrongpass"
    Then I should see a login error
    And I should still be on the login page
