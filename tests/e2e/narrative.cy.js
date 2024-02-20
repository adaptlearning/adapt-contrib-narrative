describe('Narrative', function () {
  function loopThroughNarrative(narrativeItems) {
    const itemsCount = Object.keys(narrativeItems).length
    for (let i = 0; i < itemsCount-1; i++) {
      cy.get('.narrative__controls-right').eq(1).click()
      cy.get('.narrative__content-item.is-active').should('contain', narrativeItems[i+1].title)
      cy.get('.narrative__progress').eq(i+1).should('have.class', 'is-selected')
    }
    cy.get('.narrative__controls-right.is-disabled').should('exist')
    for (let i = itemsCount-2; i >= 0; i--) {
      cy.get('.narrative__controls-left').eq(1).click()
      cy.get('.narrative__content-item.is-active').should('contain', narrativeItems[i].title)
      cy.get('.narrative__progress').eq(i).should('have.class', 'is-selected')
    }
    cy.get('.narrative__controls-left.is-disabled').should('exist')
  }

  beforeEach(function () {
    cy.getData()
  });

  it('should display the narrative component', function () {
    const narrativeComponents = this.data.components.filter((component) => component._component === 'narrative')
    narrativeComponents.forEach((narrativeComponent) => {
      cy.visit(`/#/preview/${narrativeComponent._id}`);
      const bodyWithoutHtml = narrativeComponent.body.replace(/<[^>]*>/g, '')

      cy.testContainsOrNotExists('.narrative__title', narrativeComponent.displayTitle)
      cy.testContainsOrNotExists('.narrative__body', bodyWithoutHtml)
      cy.testContainsOrNotExists('.narrative__instruction', narrativeComponent.instruction)

      cy.testContainsOrNotExists('.narrative__content-item.is-active', narrativeComponent._items[0].title)
      cy.get('.narrative__progress').eq(0).should('have.class', 'is-selected')
      cy.get('.narrative__controls-left.is-disabled').should('exist')

      loopThroughNarrative(narrativeComponent._items)
    })
  });
});
