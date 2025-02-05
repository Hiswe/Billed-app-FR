import { jest } from '@jest/globals'

const BILLS = [
  {
    'id': '47qAXb6fIm2zOKkLzMro',
    'vat': '80',
    'fileUrl':
      'https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a',
    'status': 'pending',
    'type': 'Hôtel et logement',
    'commentary': 'séminaire billed',
    'name': 'encore',
    'fileName': 'preview-facture-free-201801-pdf-1.jpg',
    'date': '2004-04-04',
    'amount': 400,
    'commentAdmin': 'ok',
    'email': 'test@test.com',
    'pct': 20,
  },
  {
    'id': 'BeKy5Mo4jkmdfPGYpTxZ',
    'vat': '',
    'amount': 100,
    'name': 'test1',
    'fileName': '1592770761.jpeg',
    'commentary': 'plop',
    'pct': 20,
    'type': 'Transports',
    'email': 'test@test.com',
    'fileUrl':
      'https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…61.jpeg?alt=media&token=7685cd61-c112-42bc-9929-8a799bb82d8b',
    'date': '2001-01-01',
    'status': 'refused',
    'commentAdmin': 'en fait non',
  },
  {
    'id': 'UIUZtnPQvnbFnB0ozvJh',
    'name': 'test3',
    'email': 'not-test@not-test.com',
    'type': 'Services en ligne',
    'vat': '60',
    'pct': 20,
    'commentAdmin': "bon bah d'accord",
    'amount': 300,
    'status': 'accepted',
    'date': '2003-03-03',
    'commentary': '',
    'fileName': 'facture-client-php-exportee-dans-document-pdf-enregistre-sur-disque-dur.png',
    'fileUrl':
      'https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…dur.png?alt=media&token=571d34cb-9c8f-430a-af52-66221cae1da3',
  },
  {
    'id': 'qcCK3SzECmaZAGRrHjaC',
    'status': 'refused',
    'pct': 20,
    'amount': 200,
    'email': 'no-test@not-test.com',
    'name': 'test2',
    'vat': '40',
    'fileName': 'preview-facture-free-201801-pdf-1.jpg',
    'date': '2002-02-02',
    'commentAdmin': 'pas la bonne facture',
    'commentary': 'test2',
    'type': 'Restaurants et bars',
    'fileUrl':
      'https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=4df6ed2c-12c8-42a2-b013-346c1346f732',
  },
]

export const FIRESTORE_FILE_URL = `/firestore/chuckNorris.png`
export const getDownloadURL = jest.fn().mockResolvedValue(FIRESTORE_FILE_URL)
export const storagePut = jest.fn().mockResolvedValue({ ref: { getDownloadURL } })
export const storageRef = jest.fn().mockReturnValue({ put: storagePut })
export const addBill = jest.fn().mockResolvedValue(true)
export const getBills = jest.fn().mockResolvedValue({
  docs: BILLS.map((bill) => ({ data: () => bill })),
})
export const getUser = jest.fn().mockResolvedValue({ exists: true })
export const setUsers = jest.fn().mockResolvedValue({ name: `a user` })
export const docUsers = jest.fn().mockReturnValue({ set: setUsers })
export const bills = jest.fn().mockReturnValue({
  add: addBill,
  get: getBills,
})

export const firestore = {
  storage: { ref: storageRef },
  users: () => ({ doc: docUsers }),
  user: () => ({ get: getUser }),
  bills,
}
