/// <reference types="cypress" />

// Custom commands for Cypress tests

declare global {
  namespace Cypress {
    interface Chainable {
      // Add custom command types here
    }
  }
}

export {};
