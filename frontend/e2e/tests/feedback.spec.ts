import { test, expect } from '../fixtures'

test.describe('Feedback', () => {
  test('submit feedback successfully', async ({ feedbackPage }) => {
    await feedbackPage.goto()
    await feedbackPage.setRating(4)
    await feedbackPage.fillMessage('E2E Test feedback - everything works great')
    await feedbackPage.fillName('E2E Tester')
    await feedbackPage.fillEmail('e2e@test.example.com')
    await feedbackPage.submit()

    await expect(feedbackPage.thankYouMessage).toBeVisible({ timeout: 5000 })
  })

  test('feedback form validates missing rating', async ({ feedbackPage, page }) => {
    await feedbackPage.goto()
    await feedbackPage.fillMessage('E2E message without rating')
    await feedbackPage.submit()

    // Should stay on the form (no thank-you message)
    await expect(feedbackPage.thankYouMessage).not.toBeVisible()
    // Toast error should appear with the specific validation message
    await expect(
      page.getByText('Please give a rating from 1 to 5 stars.')
    ).toBeVisible({ timeout: 3000 })
  })

  test('feedback form validates missing message', async ({ feedbackPage }) => {
    await feedbackPage.goto()
    await feedbackPage.setRating(3)
    // Skip message — HTML required attribute prevents submit
    await feedbackPage.submit()

    await expect(feedbackPage.thankYouMessage).not.toBeVisible()
  })
})
