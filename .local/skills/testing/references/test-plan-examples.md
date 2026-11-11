# Test plan examples

## Login invocation

```javascript
const loginTestTask = `
Test the user login flow:
1. [New Context] Create a new browser context
2. [Browser] Navigate to the login page (path: /login)
3. [Browser] Enter "test@example.com" in the email field
4. [Browser] Enter "password123" in the password field
5. [Browser] Click the "Sign In" button
6. [Verify]
- Assert redirect to the dashboard (path: /dashboard)
- Assert user name appears in the header

Technical context:
- Login endpoint: POST /api/auth/login
- Dashboard route: /dashboard
- User name displayed in #user-header element
- Relevant files: client/src/pages/Login.tsx, server/routes/auth.ts
`;
const testRun = await subagent({
    name: "auth-happy-path-test",
    config: { $kind: "testing" },
    task: loginTestTask
});

console.log(testRun.verdict);
console.log(testRun.text);
console.log(testRun.screenshots);
```

## Follow-ups

Because the tester keeps its conversation history, follow-ups can reference earlier work directly instead of restating the whole plan:

- "Re-run just the payment step from the checkout test, but with an expired card this time."
- "What did the cart page look like after step 4? Describe the layout."
- "Log out of the session you created earlier and verify the cart badge resets to zero."
- "Was there anything in the browser console or backend logs during the login flow?"

A follow-up that depends on an open page or a logged-in session should account for possible browser-state loss. Continuing the login-flow example:

```javascript
const followUp = await sendFollowup({
    name: "auth-happy-path-test",
    message: `
About the login flow you just tested: reload the dashboard and verify the
session survives the reload (user name still in the header, no redirect to
/login). If you are no longer logged in, log in again as test@example.com
first.
`
});

console.log(followUp);
```

## Shopping, API-seeded and TODO plans

Test plans can vary in their prescriptiveness and complexity. None has to arrive in one message: the last block is a follow-up that continues the TODO plan on the same tester.

```text
1. [New Context] Create a new browser context
2. [Browser] Navigate to the product page (path: /products)
3. [Browser] Click on the first product link (note its id as <product1_id>)
4. [Verify] Assert redirect to the product page (path: /product/<product1_id>)
5. [Verify]
   - Ensure the product title is not too big
   - Ensure the overall color scheme is consistent with the rest of the page
   - Assert there are more than one products
   - Make sure the add to cart button is not hidden behind another element
   - Assert the product name is "Product 1"
6. [Browser] For the next dialog, accept the dialog.
7. [Browser] Click add to cart
8. [Browser] Click on cart
9. [Verify] Assert redirect to the cart page (path: /cart)
10. [Verify] Assert cart has the product displayed
```

```text
1. [New Context] Create a new browser context
2. [API] Create a new product by POST to the /api/products endpoint with a randomly generated product name (remember it as <product_name>), and price 100. Note the name and the id of the created product.
3. [Browser] Navigate to the product page (path: /products)
4. [Verify]
   - Ensure there is at least one product displayed
   - Assert the product name is "<product_name>"
   - Assert the product price is 100
```

```text
1. [New Context] Create a new browser context
2. [Browser] Navigate to the homepage (path: /)
3. [Browser] Enter a TODO list item with a title from nanoid(6) (remember it as <todo_title>) for future use.
4. [Browser] Click the add todo button
5. [Verify] Assert that the TODO list item is displayed with the title <todo_title>
```


```text
Follow-up to the TODO plan, same tester:
1. [Browser] Mark the <todo_title> item as done
2. [Verify] Assert <todo_title> is shown as completed
```

