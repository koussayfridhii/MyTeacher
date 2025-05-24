# Test Plan: Wallet History Feature

This document outlines the test plan for the "Wallet History" feature.

## I. Access Control (Sidebar Link Visibility)

1.  **Test Case: Student Role Visibility**
    *   **Setup:** Log in as a user with the "student" role.
    *   **Action:** Observe the sidebar navigation menu.
    *   **Expected Result:** The "Wallet History" link (with the coin icon) should be visible in the sidebar.

2.  **Test Case: Teacher Role Visibility**
    *   **Setup:** Log in as a user with the "teacher" role.
    *   **Action:** Observe the sidebar navigation menu.
    *   **Expected Result:** The "Wallet History" link (with the coin icon) should be visible in the sidebar.

3.  **Test Case: Admin Role No Visibility**
    *   **Setup:** Log in as a user with the "admin" role.
    *   **Action:** Observe the sidebar navigation menu.
    *   **Expected Result:** The "Wallet History" link should *not* be visible in the sidebar.

4.  **Test Case: Coordinator Role No Visibility**
    *   **Setup:** Log in as a user with the "coordinator" role.
    *   **Action:** Observe the sidebar navigation menu.
    *   **Expected Result:** The "Wallet History" link should *not* be visible in the sidebar.

## II. Page Content & Functionality (For Student & Teacher Roles)

*Pre-requisite for all tests in this section: Log in as either a Student or a Teacher.*

1.  **Test Case: Navigation to Page**
    *   **Action:** Click the "Wallet History" link in the sidebar.
    *   **Expected Result:** The browser should navigate to the `/dashboard/wallet-history` route, and the "Wallet History" page should be displayed with a heading "Wallet History".

2.  **Test Case: Loading State**
    *   **Action:** Navigate to the "Wallet History" page.
    *   **Observation:** Observe the page immediately after navigation.
    *   **Expected Result:** A loading spinner component should be visible while the data is being fetched from the API.

3.  **Test Case: Error State (API Failure)**
    *   **Setup (if possible to simulate):**
        *   Modify network conditions to cause the `/api/wallet/history` API call to fail (e.g., using browser developer tools to block the request or simulate a 500 error).
        *   Alternatively, temporarily modify the `apiClient.get("/wallet/history")` in `WalletHistory.jsx` to throw an error.
    *   **Action:** Navigate to the "Wallet History" page.
    *   **Expected Result:** An appropriate error message (e.g., "Failed to fetch wallet history.") should be displayed clearly on the page. The loading spinner should not be visible.

4.  **Test Case: Empty State (User with No Transactions)**
    *   **Setup:** Use a test account (Student or Teacher) that has no wallet transactions and no `monthlyStats` data.
    *   **Action:** Navigate to the "Wallet History" page.
    *   **Expected Results:**
        *   The loading spinner should disappear once the API call completes.
        *   **Chart Area:**
            *   The "Monthly Summary" heading should be visible.
            *   A message indicating no chart data is available (e.g., the chart component might render an empty state by default, or a custom message like "No wallet history or statistics available at the moment." if both chart and table are empty).
        *   **Table Area:**
            *   The "Transaction Details" heading should be visible.
            *   A message like "No transaction history found." should be displayed under the "Transaction Details" heading.
            *   If both chart and table data are empty, a general message like "No wallet history or statistics available at the moment." should be displayed.

5.  **Test Case: Data Display (User with Transactions)**
    *   **Setup:** Use a test account (Student or Teacher) that has a history of wallet transactions, including various types (income and expenditure) across different months.
    *   **Action:** Navigate to the "Wallet History" page.
    *   **Expected Results:**
        *   The loading spinner should disappear.
        *   No error messages should be visible.
        *   **Chart ("Monthly Summary"):**
            *   The chart should be visible under the "Monthly Summary" heading.
            *   **X-Axis:** Should display month names (e.g., "Jan", "Feb") corresponding to months with data.
            *   **Y-Axis:** Should display numerical values representing transaction amounts.
            *   **Bars:**
                *   Income bars should be present, correctly colored (e.g., green - `#48BB78`).
                *   Expenditure bars should be present, correctly colored (e.g., red - `#F56565`).
                *   The height of the bars should accurately reflect the total income and expenditure for each month based on the sum of relevant transaction reasons (`topup`, `bonus`, `freePoints`, `refund`, `adminCredit` for income; `addClass`, `adminDebit` for expenditure).
            *   **Legend:** A legend should be visible, correctly identifying "Income" and "Expenditure" bars and their colors.
            *   **Tooltips:** Hovering over a bar segment should display a tooltip showing the exact income or expenditure amount for that month.
        *   **Table ("Transaction Details"):**
            *   The table should be visible under the "Transaction Details" heading.
            *   **Columns:** The table must have the following columns: "Date", "Description", "Amount Changed", "Balance After".
            *   **Date Column:**
                *   Dates should be formatted as "yyyy-MM-dd HH:mm" (e.g., "2023-10-27 14:30").
                *   Entries should be sorted by date (typically most recent first, though this is not explicitly stated in the implementation, so verify current behavior).
            *   **Description Column:** Should display the `reason` for the transaction (e.g., "topup", "addClass").
            *   **Amount Changed Column:**
                *   Should correctly calculate `newBalance - oldBalance`.
                *   Positive amounts (income) should be colored green (e.g., `green.500`) and prefixed with a '+'.
                *   Negative amounts (expenditure) should be colored red (e.g., `red.500`).
                *   Values should be displayed to two decimal places.
            *   **Balance After Column:**
                *   Should display the `newBalance` after the transaction.
                *   Values should be displayed to two decimal places.
            *   **Data Accuracy:** All data in the table (dates, reasons, amounts, balances) should accurately match the transaction records for the test user in the database.

## III. Responsiveness

1.  **Test Case: Desktop View**
    *   **Action:** View the "Wallet History" page on a standard desktop screen resolution.
    *   **Expected Result:** Both the chart and the table should be well-aligned, readable, and fully visible without horizontal scrolling within their containers.

2.  **Test Case: Tablet View**
    *   **Action:** Using browser developer tools, simulate a tablet screen size (e.g., iPad width).
    *   **Expected Result:**
        *   The chart should resize appropriately and remain readable. Bars, axes, and legend should adjust.
        *   The table should adjust its layout. Text within cells should wrap if necessary, and columns should remain aligned and readable. No excessive horizontal scrolling for the page itself.

3.  **Test Case: Mobile View**
    *   **Action:** Using browser developer tools, simulate a mobile screen size (e.g., iPhone width). (Note: The main sidebar is typically hidden at this size by the application's layout).
    *   **Expected Result:**
        *   The chart should resize to fit the width, potentially simplifying some elements if designed to do so, but remaining functional and readable.
        *   The table content should be readable. Columns might stack or require horizontal scrolling *within the table container if absolutely necessary*, but the overall page layout should not be broken.

---
This test plan covers the main functionalities. Additional tests for edge cases (e.g., extremely large numbers, unusual transaction reasons if possible) could be considered.
