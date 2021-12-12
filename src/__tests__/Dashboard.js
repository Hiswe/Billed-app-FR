import { fireEvent, waitFor, screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import DashboardFormUI from '../views/DashboardFormUI.js'
import DashboardUI from '../views/DashboardUI.js'
import Dashboard, { filteredBills, cards } from '../containers/Dashboard.js'
import { ROUTES } from '../constants/routes'
import { localStorageMock } from '../__mocks__/localStorage.js'
import firebase from '../__mocks__/firebase'
import { bills } from '../fixtures/bills'

describe('Given I am connected as an Admin', () => {
  beforeAll(() => {
    jest.spyOn(Dashboard.prototype, `handleShowTickets`)
    jest.spyOn(Dashboard.prototype, `handleEditTicket`)
  })

  afterEach(() => jest.clearAllMocks())

  describe('When I am on Dashboard page, there are bills, and there is one pending', () => {
    test('Then, filteredBills by pending status should return 1 bill', () => {
      const filtered_bills = filteredBills(bills, 'pending')
      expect(filtered_bills.length).toBe(1)
    })
  })
  describe('When I am on Dashboard page, there are bills, and there is one accepted', () => {
    test('Then, filteredBills by accepted status should return 1 bill', () => {
      const filtered_bills = filteredBills(bills, 'accepted')
      expect(filtered_bills.length).toBe(1)
    })
  })
  describe('When I am on Dashboard page, there are bills, and there is two refused', () => {
    test('Then, filteredBills by accepted status should return 2 bills', () => {
      const filtered_bills = filteredBills(bills, 'refused')
      expect(filtered_bills.length).toBe(2)
    })
  })
  describe('When I am on Dashboard page but it is loading', () => {
    test('Then, Loading page should be rendered', () => {
      const html = DashboardUI({ loading: true })
      document.body.innerHTML = html
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })
  describe('When I am on Dashboard page but back-end send an error message', () => {
    test('Then, Error page should be rendered', () => {
      const html = DashboardUI({ error: 'some error message' })
      document.body.innerHTML = html
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })

  describe('When I am on Dashboard page and I click on arrow', () => {
    test('Then, tickets list should be unfolding, and cars should contain first and lastname', () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Admin',
        }),
      )

      const html = DashboardUI({ data: bills })
      document.body.innerHTML = html

      const dashboard = new Dashboard({
        document,
        onNavigate,
        firestore: null,
        bills,
        localStorage: window.localStorage,
      })

      const icon1 = screen.getByTestId('arrow-icon1')
      const icon2 = screen.getByTestId('arrow-icon2')
      const icon3 = screen.getByTestId('arrow-icon3')

      userEvent.click(icon1)
      expect(dashboard.handleShowTickets).toHaveBeenCalled()
      expect(dashboard.handleShowTickets).toHaveBeenCalledWith(bills, 1)
      userEvent.click(icon1)

      userEvent.click(icon2)
      expect(dashboard.handleShowTickets).toHaveBeenCalled()
      expect(dashboard.handleShowTickets).toHaveBeenCalledWith(bills, 2)

      userEvent.click(icon3)
      expect(dashboard.handleShowTickets).toHaveBeenCalled()
      expect(dashboard.handleShowTickets).toHaveBeenCalledWith(bills, 3)
    })
  })

  describe('When I am on Dashboard page and I click on edit icon of a card', () => {
    test('Then, right form should be filled', async () => {
      const html = cards(bills)
      document.body.innerHTML = `<div class="bills-feed">${html}<div>`

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const firestore = null

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      const dashboard = new Dashboard({
        document,
        onNavigate,
        firestore,
        bills,
        localStorage: window.localStorage,
      })

      const iconEdit = screen.getByTestId(`open-bill${bills[2].id}`)
      userEvent.click(iconEdit)
      expect(dashboard.handleEditTicket).toHaveBeenCalled()
      expect(dashboard.handleEditTicket).toHaveBeenCalledWith(bills[2], bills)
    })
  })

  describe('When I am on Dashboard and there are no bills', () => {
    test('Then, no cards should be shown', () => {
      const html = cards([])
      document.body.innerHTML = html

      const iconEdit = screen.queryByTestId('open-bill47qAXb6fIm2zOKkLzMro')
      expect(iconEdit).toBeNull()
    })
  })
})

describe('Given I am connected as Admin, and I am on Dashboard page, and I clicked on a pending bill', () => {
  describe('When I click on accept button', () => {
    test('I should be sent on Dashboard with big billed icon instead of form', () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Admin',
        }),
      )
      const html = DashboardFormUI(bills[0])
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const firestore = null
      const dashboard = new Dashboard({
        document,
        onNavigate,
        firestore,
        bills,
        localStorage: window.localStorage,
      })

      const acceptButton = screen.getByTestId('btn-accept-bill-d')
      const handleAcceptSubmit = jest.fn((e) => dashboard.handleAcceptSubmit(e, bills[0]))
      acceptButton.addEventListener('click', handleAcceptSubmit)
      fireEvent.click(acceptButton)
      expect(handleAcceptSubmit).toHaveBeenCalled()
      const bigBilledIcon = screen.queryByTestId('big-billed-icon')
      expect(bigBilledIcon).toBeTruthy()
    })
  })
  describe('When I click on refuse button', () => {
    test('I should be sent on Dashboard with big billed icon instead of form', () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Admin',
        }),
      )
      const html = DashboardFormUI(bills[0])
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const firestore = null
      const dashboard = new Dashboard({
        document,
        onNavigate,
        firestore,
        bills,
        localStorage: window.localStorage,
      })
      const refuseButton = screen.getByTestId('btn-refuse-bill-d')
      const handleRefuseSubmit = jest.fn((e) => dashboard.handleRefuseSubmit(e, bills[0]))
      refuseButton.addEventListener('click', handleRefuseSubmit)
      fireEvent.click(refuseButton)
      expect(handleRefuseSubmit).toHaveBeenCalled()
      const bigBilledIcon = screen.queryByTestId('big-billed-icon')
      expect(bigBilledIcon).toBeTruthy()
    })
  })
})

describe('Given I am connected as Admin and I am on Dashboard page and I clicked on a bill', () => {
  describe('When I click on the icon eye', () => {
    test('A modal should open', () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Admin',
        }),
      )
      const html = DashboardFormUI(bills[0])
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const firestore = null
      const dashboard = new Dashboard({
        document,
        onNavigate,
        firestore,
        bills,
        localStorage: window.localStorage,
      })

      const handleClickIconEye = jest.fn(dashboard.handleClickIconEye)
      const eye = screen.getByTestId('icon-eye-d')
      eye.addEventListener('click', handleClickIconEye)
      userEvent.click(eye)
      expect(handleClickIconEye).toHaveBeenCalled()

      const modale = screen.getByTestId('modaleFileAdmin')
      expect(modale).toBeTruthy()
    })
  })
})

// test d'intégration GET
describe('Given I am a user connected as Admin', () => {
  describe('When I navigate to Dashboard', () => {
    test('fetches bills from mock API GET', async () => {
      const getSpy = jest.spyOn(firebase, 'get')
      const bills = await firebase.get()
      expect(getSpy).toHaveBeenCalledTimes(1)
      expect(bills.data.length).toBe(4)
    })
    test('fetches bills from an API and fails with 404 message error', async () => {
      firebase.get.mockImplementationOnce(() => Promise.reject(new Error('Erreur 404')))
      const html = DashboardUI({ error: 'Erreur 404' })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test('fetches messages from an API and fails with 500 message error', async () => {
      firebase.get.mockImplementationOnce(() => Promise.reject(new Error('Erreur 500')))
      const html = DashboardUI({ error: 'Erreur 500' })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})
