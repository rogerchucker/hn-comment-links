# Test Plan for 100% Coverage

## 1. Objective

The goal of this plan is to outline the steps required to achieve 100% test coverage for the HN Comment Links extension. This ensures code quality, prevents regressions, and improves maintainability.

## 2. Testing Framework

We will use the **Jest** testing framework with **jsdom** for mocking the DOM and browser APIs. Jest is a zero-configuration framework that is well-suited for testing JavaScript applications.

**Setup:**
1.  Install Jest and required dependencies:
    ```bash
    npm install --save-dev jest jest-environment-jsdom
    ```
2.  Configure Jest to work with browser APIs and mocks for the Chrome extension environment. A setup file (`jest.setup.js`) will be needed to mock `chrome.*` APIs.

---

## 3. Test Plan by File

### 3.1. `background.js`

This script acts as the extension's service worker. Testing will focus on its event listeners and interactions with the `chrome.tabs` and `chrome.action` APIs.

-   **`isHNItem(url)`**
    -   [ ] Test with a valid Hacker News item URL.
    -   [ ] Test with a non-item Hacker News URL (e.g., the homepage).
    -   [ ] Test with a non-Hacker News URL.
    -   [ ] Test with an invalid or malformed URL to ensure it doesn't throw an unhandled exception.
-   **`setIconColored(tabId, colored)`**
    -   [ ] Test that it calls `chrome.action.setIcon` with the correct color icon path (`icons/icon-color-*.png`).
    -   [ ] Test that it calls `chrome.action.setIcon` with the correct gray icon path (`icons/icon-gray-*.png`).
-   **`clearBadge(tabId)`**
    -   [ ] Test that it calls `chrome.action.setBadgeText` with an empty string.
-   **`updateForTab(tabId)`**
    -   [ ] Test on a valid HN item tab, ensuring it enables the icon and sets the badge text.
    -   [ ] Test on a non-HN item tab, ensuring it disables the icon and clears the badge.
    -   [ ] Test with a `tabId` that doesn't exist or has no URL to ensure graceful failure.
-   **`chrome.tabs.onUpdated` listener**
    -   [ ] Simulate a tab update with `status: 'complete'` and verify `updateForTab` is called.
    -   [ ] Simulate a tab update with a different status to ensure `updateForTab` is not called unnecessarily.
-   **`chrome.tabs.onActivated` listener**
    -   [ ] Simulate a tab activation and verify `updateForTab` is called.
-   **`chrome.runtime.onMessage` listener**
    -   [ ] Simulate a `link_count` message and verify it sets the badge text and icon color correctly.
    -   [ ] Simulate a message with a different type to ensure it's ignored.

### 3.2. `content.js`

This script is responsible for all DOM interaction and data extraction. Tests will use a mocked HTML structure representing a Hacker News comment thread.

-   **`getHostname(url)`**
    -   [ ] Test with a standard `https://` URL.
    -   [ ] Test with an `http://` URL.
    -   [ ] Test with a URL containing `www.`
    -   [ ] Test with a relative URL (e.g., `/item?id=123`).
    -   [ ] Test with an invalid URL string.
-   **`normalizeUrl(url)`**
    -   [ ] Test that it correctly resolves a relative URL to an absolute one.
    -   [ ] Test that it leaves an absolute URL unchanged.
    -   [ ] Test with an invalid URL string.
-   **`extractLinks()`**
    -   [ ] Test on a mock DOM with several comments containing links.
    -   [ ] Verify that `all`, `unique`, and `grouped` data structures are populated correctly.
    -   [ ] Test on a mock DOM with zero links.
    -   [ ] Test on a mock DOM where a single comment has multiple links.
    -   [ ] Test that it correctly extracts `author`, `commentId`, `permalink`, and `snippet`.
    -   [ ] Test a comment with no author.
    -   [ ] Test a link where the text content is very long to verify snippet truncation.
-   **`notifyBackground()`**
    -   [ ] Test that it correctly counts unique links and sends the right message via `chrome.runtime.sendMessage`.
    -   [ ] Test in a DOM with no links.
-   **`chrome.runtime.onMessage` listener**
    -   [ ] Simulate a `collect_links` message and verify that `sendResponse` is called with the data from `extractLinks`.

### 3.3. `popup.js`

This script handles the UI logic in the popup. Tests will involve mocking the DOM of `popup.html` and simulating user events.

-   **`collectFromTab()`**
    -   [ ] Test when the active tab is a valid HN item page.
    -   [ ] Test when the active tab is NOT an HN item page, and verify the correct error message is displayed.
    -   [ ] Test the case where no active tab is found.
-   **`toCsv(rows)`**
    -   [ ] Test with a list of link data objects and verify the CSV output is correct.
    -   [ ] Test with an empty list.
    -   [ ] Test with data containing characters that need escaping (e.g., commas, quotes).
-   **Rendering Logic (`renderList` and `renderItem`)**
    -   [ ] Test initial render with a set of mock data.
    -   [ ] Simulate checking "Show Unique" and verify the list re-renders with unique links.
    -   [ ] Simulate checking "Group by Domain" and verify the list re-renders with domain sections.
    -   [ ] Simulate typing in the search box and verify the list is filtered correctly.
    -   [ ] Test rendering an item with missing data (e.g., no author, no permalink).
-   **Event Listeners (`bootstrap`)**
    -   [ ] **Refresh Button:** Simulate a click and verify `collectFromTab` and `renderList` are called.
    -   [ ] **Copy URLs Button:** Simulate a click and verify `navigator.clipboard.writeText` is called with the correct URLs.
    -   [ ] **Export CSV Button:** Simulate a click and verify the CSV download is triggered.
-   **Error Handling**
    -   [ ] Test the `bootstrap().catch()` block by forcing `collectFromTab` to throw an error and verify the error message is displayed in the UI.

---

## 4. Execution and Coverage

-   **Run Tests:**
    ```bash
    npm test
    ```
-   **Generate Coverage Report:**
    ```bash
    npm test -- --coverage
    ```

The output of the coverage report will be used to track progress toward the 100% goal for statements, branches, functions, and lines for each file.
