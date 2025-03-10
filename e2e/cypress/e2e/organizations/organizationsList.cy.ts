import { HOST } from '../../common/constants';
import 'cypress-file-upload';
import {
  clickGlobalSave,
  gcy,
  switchToOrganization,
} from '../../common/shared';
import { organizationTestData } from '../../common/apiCalls/testData/testData';
import { login } from '../../common/apiCalls/common';
import {
  awaitPendingRequests,
  setupRequestAwaiter,
} from '../../common/requestsAwaiter';

describe('Organization List', () => {
  beforeEach(() => {
    setupRequestAwaiter();
    organizationTestData.clean();
    organizationTestData
      .generate()
      .then(() => login())
      .then(() => visit());
  });

  afterEach(() => {
    awaitPendingRequests();
    organizationTestData.clean();
  });

  it('creates organization', () => {
    goToNewOrganizationForm();
    gcy('organization-name-field').within(() =>
      cy.get('input').type('What a nice organization')
    );
    gcy('organization-address-part-field').within(() =>
      cy.get('input').should('have.value', 'what-a-nice-organization')
    );
    gcy('organization-description-field').within(() =>
      cy.get('input').type('Very nice organization! Which is nice to create!')
    );
    clickGlobalSave();
    gcy('organization-switch').contains('What a nice organization');
    cy.contains('Organization created').should('be.visible');
    gcy('organization-switch')
      .contains('What a nice organization')
      .should('be.visible');
  });

  it('creates organization without description', () => {
    goToNewOrganizationForm();
    gcy('organization-name-field').within(() =>
      cy.get('input').type('What a nice organization')
    );
    gcy('organization-address-part-field').within(() =>
      cy.get('input').should('have.value', 'what-a-nice-organization')
    );
    clickGlobalSave();
    cy.contains('Organization created').should('be.visible');
  });

  it('validates creation fields', { retries: { runMode: 3 } }, () => {
    goToNewOrganizationForm();
    gcy('organization-name-field').within(() => {
      cy.get('input').type('aaa').clear();
    });

    gcy('organization-address-part-field').click();

    gcy('organization-name-field').within(() => {
      cy.contains('This field is required');
    });

    gcy('organization-name-field').within(() => {
      cy.get('input').type(
        'This is too too too too too too too too too too too too too too too too too too long'
      );
      cy.contains('This field can contain at maximum 50 characters');
    });

    clickGlobalSave();
    cy.contains('Organization created').should('not.exist');

    gcy('organization-description-field').click();

    gcy('organization-address-part-field').contains('This field is required');
  });

  describe('list', () => {
    it('contains created data', () => {
      cy.waitForDom();
      cy.gcy('organization-switch').click();
      cy.gcy('organization-switch-item')
        .contains('Facebook')
        .should('be.visible');

      cy.gcy('organization-switch-item')
        .contains('ZZZ Cool company 10')
        .should('be.visible');
      cy.contains('ZZZ Cool company 14').scrollIntoView().should('be.visible');
    });

    it('admin leaves Microsoft', { scrollBehavior: 'center' }, () => {
      switchToOrganization('Microsoft');
      cy.gcy('global-user-menu-button').click();
      cy.gcy('user-menu-organization-settings')
        .contains('Organization settings')
        .click();

      gcy('organization-profile-leave-button').click();

      gcy('global-confirmation-confirm').click();
      cy.contains('Organization left').should('be.visible');
    });

    it('admin cannot leave Techfides', { scrollBehavior: 'center' }, () => {
      switchToOrganization('Techfides');
      cy.gcy('global-user-menu-button').click();
      cy.gcy('user-menu-organization-settings')
        .contains('Organization settings')
        .click();

      gcy('organization-profile-leave-button').click();

      gcy('global-confirmation-confirm').click();
      cy.contains('Organization has no other owner.').should('be.visible');
    });

    it('admin can change Tolgee settings', { scrollBehavior: 'center' }, () => {
      switchToOrganization('Tolgee');
      cy.gcy('global-user-menu-button').click();
      cy.gcy('user-menu-organization-settings')
        .contains('Organization settings')
        .click();

      cy.gcy('global-form-save-button').should('not.be.disabled');
      cy.gcy('organization-profile-delete-button').should('not.be.disabled');
    });
  });

  after(() => {
    organizationTestData.clean();
  });

  const goToNewOrganizationForm = () => {
    gcy('organization-switch').click();
    gcy('organization-switch-new').click();
  };

  const visit = () => {
    cy.visit(`${HOST}/projects`);
  };
});
