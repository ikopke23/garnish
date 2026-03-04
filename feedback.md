## Manual Verification Feedback and things to change 

- [ ] Light mode: "Add Ingredient / Equipment / Step" buttons are now orange outline, readable against sand background
  - The outline is orange and the text is orange but the readability isn't there, make the outline larger and have the css shadow slightly bigger, keeping in mind differences between mobile and desktop use cases

- [ ] RecipeForm create: "Include story" toggle is off by default; toggling on reveals the dropdown
  - Toggle is off by default and toggling reveals dropdown, true, but the toggle looks terrible, can you have it match the orange button styling like the other `add ingredient` button
- [ ] Dropdown shows `"Story Name — AuthorName"` for each story
  - the dropdown does not get the author's name, I think we should revise the plan of just adding the join and instead rename the `author_uid` field to `author_name` in the db and put make it TEXT in the db, and on story create which currently does not exist in the UI we will be able to submit custom author names and not just reference the individual user's  name
- [ ] Creating a recipe with a story selected navigates to the detail page and the story is shown
  - It navigates to the detail page upon recipe creation however the story is not shown, the body of the story does not display in the 
- [ x ] Creating a recipe with the toggle off: `disable_story = true`, no story shown on detail page
  - No story is shown this is properly implemented
- [ ] Edit mode: toggle and dropdown pre-populate from existing recipe data
  - Adding a story works however like before the story does not properly get shown on the screen
- [ ] `GET /stories` response includes `author_name` field
  - there is currently no way to test this as the author is not shown in the recipe page

