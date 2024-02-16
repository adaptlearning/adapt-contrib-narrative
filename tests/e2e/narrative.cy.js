describe('Narrative', function () {
  beforeEach(function () {
    cy.getData()
    cy.visit('/');
  });

  it('should display the narrative component', function () {
    const narrativeComponents = this.data.components.filter((component) => component._component === 'narrative')
    
    this.data.contentObjects.filter((page) => page._classes !== 'assessment').forEach((page) => {
      cy.visit(`/#/id/${page._id}`)
      const articlesOnPage = this.data.articles.filter((article) => article._parentId === page._id).map(article => article._id)
      const blocksOnPage = this.data.blocks.filter((block) => articlesOnPage.includes(block._parentId)).map(blocks => blocks._id)
      const componentsOnPage = narrativeComponents.filter((component) => blocksOnPage.includes(component._parentId))

      componentsOnPage.forEach((narrativeComponent) => {
        const bodyWithoutHtml = narrativeComponent.body.replace(/<[^>]*>/g, '')

        cy.testContainsOrNotExists('.narrative__title', narrativeComponent.displayTitle)
        cy.testContainsOrNotExists('.narrative__body', bodyWithoutHtml)
        cy.testContainsOrNotExists('.narrative__instruction', narrativeComponent.instruction)

        cy.testContainsOrNotExists('.narrative__content-item.is-active', narrativeComponent._items[0].title)
        cy.get('.narrative__progress').eq(0).should('have.class', 'is-selected')

        //Do a length function
        //Should be no more left can do right
        //Should be no more left no more right
        //Should be can do left can do right
        //Should be can do left no more right

        cy.loopThroughNarrative()

        if(narrativeComponent._items.length() > 1) {
          cy.get('.narrative__controls-left.is-disabled').should('exist')
          cy.get('.narrative__progress').eq(0).should('have.class', 'is-selected')
          cy.get('.narrative__controls-right').eq(1).click()
          cy.get('.narrative__content-item.is-active').should('contain', narrativeComponent._items[1].title)
          cy.get('.narrative__progress').eq(1).should('have.class', 'is-selected')
        } else {
          cy.get('.narrative__controls-left.is-disabled').should('exist')
          cy.get('.narrative__controls-right.is-disabled').should('exist')
          return
        }

        if(narrativeComponent._items.length() > 2) {
          cy.get('.narrative__controls-left.is-disabled').should('exist')
          cy.get('.narrative__progress').eq(0).should('have.class', 'is-selected')
          cy.get('.narrative__controls-right').eq(1).click()
          cy.get('.narrative__content-item.is-active').should('contain', narrativeComponent._items[1].title)
          cy.get('.narrative__progress').eq(1).should('have.class', 'is-selected')
        } else {
          cy.get('.narrative__controls-left.is-disabled').should('exist')
          cy.get('.narrative__controls-right.is-disabled').should('exist')
        }

          cy.get('.narrative__content-item.is-active').should('contain', narrativeComponent._items[0].title)
          
          cy.get('.narrative__controls-right').eq(1).click()
          cy.get('.narrative__content-item.is-active').should('contain', narrativeComponent._items[1].title)
          
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
      })
    })
  });
});
