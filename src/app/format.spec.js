import { formatDate } from './format.js'

describe(`format helper`, () => {
  describe(`format date`, () => {
    test(`should format a date`, () => {
      const dateString = `2021-08-19`
      const formattedDate = formatDate(dateString)
      expect(formattedDate).toBe(`19 Aoû. 21`)
    })
    test(`should handle invalid dates`, () => {
      const dateString = `not-a-date`
      const formattedDate = formatDate(dateString)
      expect(formattedDate).toBe(`—`)
    })
  })
})
