describe('Home Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display the main heading', () => {
    cy.contains('Forecast History').should('be.visible');
  });

  it('should display the search form', () => {
    cy.get('input[placeholder*="Buscar playa"]').should('be.visible');
    cy.contains('button', 'Buscar').should('be.visible');
  });

  it('should display the link to all beaches', () => {
    cy.contains('Ver todas las playas').should('be.visible');
  });

  it('should navigate to beaches page', () => {
    cy.contains('Ver todas las playas').click();
    cy.url().should('include', '/beaches');
  });

  it('should show error when searching with empty query', () => {
    cy.contains('button', 'Buscar').click();
    // The form should not submit and stay on the same page
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });
});
