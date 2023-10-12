import Components from '../../src/course/en/components.json'
const narrativeComponent = Components[5]

describe('Narrative', () => {
  beforeEach(() => {
    cy.visit('/');
  })

  it('should display the narrative component', () => {
    cy.get('.menu-item').first().should('contain', 'Presentation Components').within(() => {
      cy.get('button').contains('View').click()
    });

    cy.get('.narrative').within(() => {
      cy.get('.narrative__title').should('contain', narrativeComponent.displayTitle)
      cy.get('.narrative__body').should('contain', 'Narrative')
      cy.get('.narrative__instruction').should('contain', narrativeComponent.instruction)
    });
  });


  it('should be able to scroll right and left', () => {
    cy.get('.narrative').within(() => {
      cy.get('.narrative__widget').within(() => {
        cy.get('.narrative__content-item.is-active').should('contain', narrativeComponent._items[0].title)
        cy.get('.narrative__progress').eq(0).should('have.class', 'is-selected')
        cy.get('.narrative__controls-right').eq(1).click()
        cy.get('.narrative__content-item.is-active').should('contain', narrativeComponent._items[1].title)
        cy.get('.narrative__progress').eq(1).should('have.class', 'is-selected')
        cy.get('.narrative__controls-right').eq(1).click()
        cy.get('.narrative__content-item.is-active').should('contain', narrativeComponent._items[2].title)
        cy.get('.narrative__progress').eq(2).should('have.class', 'is-selected')
        cy.get('.narrative__controls-right.is-disabled').should('exist')
        cy.get('.narrative__controls-left').eq(1).click()
        cy.get('.narrative__content-item.is-active').should('contain', narrativeComponent._items[1].title)
        cy.get('.narrative__progress').eq(1).should('have.class', 'is-selected')
        cy.get('.narrative__controls-left').eq(1).click()
        cy.get('.narrative__content-item.is-active').should('contain', narrativeComponent._items[0].title)
        cy.get('.narrative__progress').eq(0).should('have.class', 'is-selected')
        cy.get('.narrative__controls-left.is-disabled').should('exist')
      });
    });
  });
});
