describe('Login', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/login')
  })

  it(`TC1.1 Login failed: Couldn't find user of username: Alex@ndra11`, () => {
    cy.get('input[placeholder="Username"]').type('Alex@ndra11')
    cy.get('input[placeholder="Password"]').type('wrongpass')

    cy.get('.login_button').click()
    cy.on('window:alert', (text) => {
      expect(text).to.contains(`Login failed: Couldn't find user of username:`)
    })
  })

  it(`TC1.2 Login failed: Invalid credentials entered for user of username: 'cleaner'`, () => {
    cy.on('window:alert', (text) => {
      expect(text).to.contains("Login failed: Invalid credentials entered for user of username")
    })

    cy.get('input[placeholder=Username]').type('cleaner')
    cy.get('input[placeholder="Password"]').type('cleanes')
    cy.get('.login_button').click()
    cy.url().should('include', '/login')
  })

  it(`TC1.3 Login failed: Couldn't find user of username:`, () => {

    cy.get('input[placeholder="Username"]').type('Alex@ndra11')
    cy.get('input[placeholder="Password"]').type('Alexandra111111')

    cy.get('.login_button').click()
    // cy.on('window:alert', (text) => {
    //   expect(text).to.eq("Login failed: Couldn't find user of username: Alex@ndra11")
    // })
  })
  it(`TC1.4 Empty username shows the web browser's own warning`, () => {
    cy.get('input[placeholder="Password"]').type('Alexandra111111')

    cy.get('.login_button').click()
    cy.get('form').then(
      ($form) => expect(($form[0] as HTMLFormElement).checkValidity()).to.be.false,
    )
  })
  it(`TC1.5 Empty Password shows the web browser's own warning`, () => {

    cy.get('input[placeholder="Username"]').type('Alexandra11')

    cy.get('.login_button').click()
    cy.get('form').then(
      ($form) => expect(($form[0] as HTMLFormElement).checkValidity()).to.be.false,
    )
  })
  it(`TC1.6 Empty Username/Password shows the web browser's warning`, () => {


    cy.get('.login_button').click()
    cy.get('form').then(
      ($form) => expect(($form[0] as HTMLFormElement).checkValidity()).to.be.false,
    )
  })
  it(`TC1.7 Successful Login to Cleaner Account`, () => {

    cy.get('input[placeholder="Username"]').type('cleaner')
    cy.get('input[placeholder="Password"]').type('cleaner')

    cy.get('.login_button').click()
    cy.url().should('include', '/cleaner-dashboard')
    cy.url().should('not.contain', '/login')
  })
})

describe('Logout', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/login')

    cy.get('input[placeholder="Username"]').type('cleaner')
    cy.get('input[placeholder="Password"]').type('cleaner')

    cy.get('.login_button').click()
    cy.url().should('include', '/cleaner-dashboard')
  })
  it('TC2.1 Cancel Logout stays on current page', () => {
    cy.get('#logout_button').click()
    cy.get('.cancel-btn').click()

    cy.url().should('include', '/cleaner-dashboard')

  })
  it('TC2.2 Logout returns user to login page', () => {
    cy.get('#logout_button').click()
    cy.get('.confirm-btn').click()

    cy.url().should('include', '/login')
  })
})

describe('Create User Account', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/login')

    cy.get('input[placeholder="Username"]').type('user admin')
    cy.get('input[placeholder="Password"]').type('user admin')

    cy.get('.login_button').click()
    cy.url().should('include', '/admin-dashboard')
    cy.get('button.create-btn').click()
    cy.url().should('include', '/create')
  })
  it('TC3.1 Cleaner Duplicate Username Returns Internal Server Error', () => {
    cy.get('select').select('cleaner')
    cy.get('input[placeholder="Username"]').type('cleaner')
    cy.get('input[placeholder="Password"]').type('cleaner')
    cy.get('input[placeholder="Confirm Password"]').type('cleaner')

    cy.get('button.create_btn').contains('Create Account').click()
    cy.on('window:alert', (text) => {
      expect(text).to.contains(`Creation failed: Username already exists`)
    })
  })
  it('TC3.2 Cleaner Username Field is empty', () => {
    cy.get('select').select('cleaner')
    cy.get('input[placeholder="Password"]').type('cleaner4')
    cy.get('input[placeholder="Confirm Password"]').type('cleaner4')

    cy.get('button.create_btn').contains('Create Account').click()
    cy.get('form').then(
      ($form) => expect(($form[0] as HTMLFormElement).checkValidity()).to.be.false,
    )
  })
  it('TC3.3 Cleaner Password Field is empty', () => {
    cy.get('select').select('cleaner')
    cy.get('input[placeholder="Username"]').type('cleaner4')

    cy.get('button.create_btn').contains('Create Account').click()
    cy.get('form').then(
      ($form) => expect(($form[0] as HTMLFormElement).checkValidity()).to.be.false,
    )
  })
  it('TC3.4 Cleaner Password/Confirm Password fields are mismatched', () => {
    cy.get('select').select('cleaner')
    cy.get('input[placeholder="Username"]').type('cleaner4')
    cy.get('input[placeholder="Password"]').type('cleaner5')
    cy.get('input[placeholder="Confirm Password"]').type('cleaner5')

    cy.get('button.create_btn').contains('Create Account').click()
    //Enter a check in here
  })
  it('TC3.5 Cleaner All fields are empty', () => {
    cy.get('select').select('cleaner')

    cy.get('button.create_btn').contains('Create Account').click()
    cy.get('form').then(
      ($form) => expect(($form[0] as HTMLFormElement).checkValidity()).to.be.false,
    )
  })
  it('TC3.6 Cleaner Successful Account Creation', () => {
    cy.get('select').select('cleaner')
    cy.get('input[placeholder="Username"]').type('Roh00t')
    cy.get('input[placeholder="Password"]').type('Roh00t')
    cy.get('input[placeholder="Confirm Password"]').type('Roh00t')

    cy.get('button.create_btn').contains('Create Account').click()
    cy.url().should('include', '/create')
  })
  it('TC3.7 Home Owner Duplicate Username', () => {
    cy.get('select').select('homeowner')
    cy.get('input[placeholder="Username"]').type('homeowner')
    cy.get('input[placeholder="Password"]').type('homeowner')
    cy.get('input[placeholder="Confirm Password"]').type('homeowner')

    cy.get('button.create_btn').contains('Create Account').click()
    cy.on('window:alert', (text) => {
      expect(text).to.contains(`Creation failed: Username already exists`)
    })
  })
  it('TC3.8 Home Owner Username Field is empty', () => {
    cy.get('select').select('homeowner')
    cy.get('input[placeholder="Password"]').type('homeowner4')
    cy.get('input[placeholder="Confirm Password"]').type('homeowner4')

    cy.get('button.create_btn').contains('Create Account').click()
    cy.get('form').then(
      ($form) => expect(($form[0] as HTMLFormElement).checkValidity()).to.be.false,
    )
  })
  it('TC3.9 Home Owner Password Field is empty', () => {
    cy.get('select').select('homeowner')
    cy.get('input[placeholder="Username"]').type('homeowner4')

    cy.get('button.create_btn').contains('Create Account').click()
    cy.get('form').then(
      ($form) => expect(($form[0] as HTMLFormElement).checkValidity()).to.be.false,
    )
  })
  it('TC3.10 Home Owner Password/ Confirm Password Fields are mismatched', () => {
    cy.get('select').select('homeowner')
    cy.get('input[placeholder="Username"]').type('homeowner4')
    cy.get('input[placeholder="Password"]').type('homeowner4')
    cy.get('input[placeholder="Confirm Password"]').type('homeowner5')

    cy.get('button.create_btn').contains('Create Account').click()
    //Enter a check in here
  })
  it('TC3.11 Home Owner All fields are empty', () => {
    cy.get('select').select('cleaner')

    cy.get('button.create_btn').contains('Create Account').click()
    cy.get('form').then(
      ($form) => expect(($form[0] as HTMLFormElement).checkValidity()).to.be.false,
    )
  })
  it('TC3.12 Home Owner Successful Account Creation', () => {
    cy.get('select').select('homeowner')
    cy.get('input[placeholder="Username"]').type('Roh00t1')
    cy.get('input[placeholder="Password"]').type('Roh00t1')
    cy.get('input[placeholder="Confirm Password"]').type('Roh00t1')

    cy.get('button.create_btn').contains('Create Account').click()
    cy.url().should('include', '/create')
  })
  it('TC3.13 Platform Manager Duplicate Username', () => {
    cy.get('select').select('platform manager')
    cy.get('input[placeholder="Username"]').type('platform manager')
    cy.get('input[placeholder="Password"]').type('platform manager')
    cy.get('input[placeholder="Confirm Password"]').type('platform manager')

    cy.get('button.create_btn').contains('Create Account').click()
    cy.on('window:alert', (text) => {
      expect(text).to.contains(`Creation failed: Username already exists`)
    })
  })
  it('TC3.14 Platform Manager Username Field is empty', () => {
    cy.get('select').select('platform manager')
    cy.get('input[placeholder="Password"]').type('platform manager2')
    cy.get('input[placeholder="Confirm Password"]').type('platform manager2')

    cy.get('button.create_btn').contains('Create Account').click()
    cy.get('form').then(
      ($form) => expect(($form[0] as HTMLFormElement).checkValidity()).to.be.false,
    )
  })
  it('TC3.15 Platform Manager Password Field is empty', () => {
    cy.get('select').select('platform manager')
    cy.get('input[placeholder="Username"]').type('platform manager2')

    cy.get('button.create_btn').contains('Create Account').click()
    cy.get('form').then(
      ($form) => expect(($form[0] as HTMLFormElement).checkValidity()).to.be.false,
    )
  })
  it('TC3.16 Platform Manager Password/ Confirm Password Fields are mismatched', () => {
    cy.get('select').select('platform manager')
    cy.get('input[placeholder="Username"]').type('platform manager5')
    cy.get('input[placeholder="Password"]').type('platform manager5')
    cy.get('input[placeholder="Confirm Password"]').type('platform manager6')

    cy.get('button.create_btn').contains('Create Account').click()
    //Enter a check in here
  })
  it('TC3.17 Platform Manager All fields are empty', () => {
    cy.get('select').select('platform manager')

    cy.get('button.create_btn').contains('Create Account').click()
    cy.get('form').then(
      ($form) => expect(($form[0] as HTMLFormElement).checkValidity()).to.be.false,
    )
  })
  it('TC3.18 Platform Manager Successful Account Creation', () => {
    cy.get('select').select('platform manager')
    cy.get('input[placeholder="Username"]').type('Roh00t2')
    cy.get('input[placeholder="Password"]').type('Roh00t2')
    cy.get('input[placeholder="Confirm Password"]').type('Roh00t2')

    cy.get('button.create_btn').contains('Create Account').click()
    cy.url().should('include', '/create')
  })
  it('TC3.19 User Admin Duplicate Username', () => {
    cy.get('select').select('user admin')
    cy.get('input[placeholder="Username"]').type('user admin')
    cy.get('input[placeholder="Password"]').type('user admin')
    cy.get('input[placeholder="Confirm Password"]').type('user admin')

    cy.get('button.create_btn').contains('Create Account').click()
    cy.on('window:alert', (text) => {
      expect(text).to.contains(`Creation failed: Username already exists`)
    })
  })
  it('TC3.20 User Admin Username Field is empty', () => {
    cy.get('select').select('user admin')
    cy.get('input[placeholder="Password"]').type('user admin2')
    cy.get('input[placeholder="Confirm Password"]').type('user admin2')

    cy.get('button.create_btn').contains('Create Account').click()
    cy.get('form').then(
      ($form) => expect(($form[0] as HTMLFormElement).checkValidity()).to.be.false,
    )
  })
  it('TC3.21 User Admin Password Field is empty', () => {
    cy.get('select').select('user admin')
    cy.get('input[placeholder="Username"]').type('platform manager2')

    cy.get('button.create_btn').contains('Create Account').click()
    cy.get('form').then(
      ($form) => expect(($form[0] as HTMLFormElement).checkValidity()).to.be.false,
    )
  })
  it('TC3.22 User Admin Password/ Confirm Password Fields are mismatched', () => {
    cy.get('select').select('user admin')
    cy.get('input[placeholder="Username"]').type('platform manager5')
    cy.get('input[placeholder="Password"]').type('platform manager5')
    cy.get('input[placeholder="Confirm Password"]').type('platform manager6')

    cy.get('button.create_btn').contains('Create Account').click()
    //Enter a check in here
  })
  it('TC3.23 User Admin All fields are empty', () => {
    cy.get('select').select('user admin')

    cy.get('button.create_btn').contains('Create Account').click()
    cy.get('form').then(
      ($form) => expect(($form[0] as HTMLFormElement).checkValidity()).to.be.false,
    )
  })
  it('TC3.24 User Admin Successful Account Creation', () => {
    cy.get('select').select('user admin')
    cy.get('input[placeholder="Username"]').type('Roh00t3')
    cy.get('input[placeholder="Password"]').type('Roh00t3')
    cy.get('input[placeholder="Confirm Password"]').type('Roh00t3')

    cy.get('button.create_btn').contains('Create Account').click()
    cy.url().should('include', '/create')
  })
  it('TC3.25 Account Creation Cancelled', () => {
    cy.get('select').select('cleaner')
    cy.get('input[placeholder="Username"]').type('Roh00t4')
    cy.get('input[placeholder="Password"]').type('Roh00t4')
    cy.get('input[placeholder="Confirm Password"]').type('Roh00t4')

    cy.get('button.cancel_btn').contains('Cancel').click()
    cy.url().should('include', '/admin-dashboard')
  })
  it('TC3.26 Account Creation Cancelled', () => {
    cy.get('select').select('homeowner')
    cy.get('input[placeholder="Username"]').type('Roh00t5')
    cy.get('input[placeholder="Password"]').type('Roh00t5')
    cy.get('input[placeholder="Confirm Password"]').type('Roh00t5')

    cy.get('button.cancel_btn').contains('Cancel').click()
    cy.url().should('include', '/admin-dashboard')
  })
  it('TC3.27 Account Creation Cancelled', () => {
    cy.get('select').select('platform manager')
    cy.get('input[placeholder="Username"]').type('Roh00t6')
    cy.get('input[placeholder="Password"]').type('Roh00t6')
    cy.get('input[placeholder="Confirm Password"]').type('Roh00t6')

    cy.get('button.cancel_btn').contains('Cancel').click()
    cy.url().should('include', '/admin-dashboard')
  })
  it('TC3.28 Account Creation Cancelled', () => {
    cy.get('select').select('user admin')
    cy.get('input[placeholder="Username"]').type('Roh00t7')
    cy.get('input[placeholder="Password"]').type('Roh00t7')
    cy.get('input[placeholder="Confirm Password"]').type('Roh00t7')

    cy.get('button.cancel_btn').contains('Cancel').click()
    cy.url().should('include', '/admin-dashboard')
  })
})

describe('Create User Profile', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/login')

    cy.get('input[placeholder="Username"]').type('user admin')
    cy.get('input[placeholder="Password"]').type('user admin')

    cy.get('.login_button').click()
    cy.url().should('include', '/admin-dashboard')
    cy.get('a').contains('User Profile').click()
    cy.url().should('include', '/ViewUserProfile')
    cy.get('button.create-btn').click()
  })
  it('TC4.1 Create Profile Empty Field', () => {
    cy.get('button.create_btn').click()
    cy.get('form').then(
      ($form) => expect(($form[0] as HTMLFormElement).checkValidity()).to.be.false,
    )

  })
  it('TC4.2 User Profile creation', () => {
    cy.get('input[placeholder="User Profile name"]').type('cleaner')
    cy.get('button.create_btn').click()

  })
  it('TC4.3 User Profile creation', () => {
    cy.get('input[placeholder="User Profile name"]').type('home owner')
    cy.get('button.create_btn').click()

  })
  it('TC4.4 User Profile creation', () => {
    cy.get('input[placeholder="User Profile name"]').type('platform manager')
    cy.get('button.create_btn').click()
  })
  it('TC4.5 User Profile cancellation', () => {
    cy.get('input[placeholder="User Profile name"]').type('cleaner')
    cy.get('button.cancel_btn').click()
  })
  it('TC4.6 User Profile cancellation', () => {
    cy.get('input[placeholder="User Profile name"]').type('home owner')
    cy.get('button.cancel_btn').click()
  })
  it('TC4.7 User Profile cancellation', () => {
    cy.get('input[placeholder="User Profile name"]').type('platform manager')
    cy.get('button.cancel_btn').click()
  })
  it('TC4.8 User Profile Already Exists', () => {
    cy.get('input[placeholder="User Profile name"]').type('cleaner')
    cy.get('button.create_btn').click()
        //Enter a check in here
  })
  it('TC4.9 User Profile Already Exists', () => {
    cy.get('input[placeholder="User Profile name"]').type('home owner')
    cy.get('button.create_btn').click()
      //Enter a check in here
  })
  it('TC4.10 User Profile Already Exists', () => {
    cy.get('input[placeholder="User Profile name"]').type('platform manager')
    cy.get('button.create_btn').click()
    //Enter a check in here
  })
})