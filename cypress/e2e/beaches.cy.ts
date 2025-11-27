describe('Beaches Page', () => {
  beforeEach(() => {
    cy.visit('/beaches');
  });

  it('should display the page title', () => {
    cy.contains('Todas las Playas').should('be.visible');
  });

  it('should display the back to home button', () => {
    cy.contains('Volver al inicio').should('be.visible');
  });

  it('should navigate back to home page', () => {
    cy.contains('Volver al inicio').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('should display message when no beaches exist', () => {
    cy.contains('No hay playas registradas aún').should('exist');
  });
});
