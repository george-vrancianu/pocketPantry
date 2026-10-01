Pocket Pantry app:
    Description:
        This app is a followup of the retzetar mvp project (/home/giu/projects/retzetar), we will pick some things from this app and create a completely new app with a new design. We will need the scan logic from this app the be ported here (Scan receipt, scan ingredients, scan plate and scan product) which are already tested and working as expected.
    Main idea:
        - As a person or a family:
            - need a way to easily scan bought ingredients to add to the pantry (or add manually)
            - need a way to easily make a shopping list and to share it with the family
            - need a way to manage the pantry after cooking a recipe
            - need a way to browse through recipes, add (missing) ingredients to cart (shopping list)
            - wherever possible integrate with the scan functions fo
        - Ingredients:
            - will have ingredient name which will be idempotent in the database
            - the ingredient category must be more granular (eg. for Parmesan ingredient - instead of a general "Cheese" category, there will be a "Parmesan" category) - this is needed to correctly match the proper ingredients and not be too general about it (maybe have nested categories?)
            - we will try to match as best as possible the scans with the available ingredients (required)
            - where avaiable, they will have a expiry date (have a default expiry date for each ingredient category, editable in the settings)
            - where available they will have quantities
            - will have a description field where the actual name of the product resides (can be empty)
        - Recipes:
            - all recipe ingredients must match to the DB ingredients
            - can be favorited by user/family or added to "Want to cook"
            - ideally we want the recipes to be straightforward with cooking steps, timings, calorie count and pro tips
            - can add a user generated recipe based in the "Scan plate" scan - only the user itself and the family can see it
        - Shopping list:
            - ingredient list should show categories under how isles are organized in a shop
            - can be shared through the family and editable by other members of family
            - will contain the recipe names from which the ingredients where added
        - Alerts:
            - when shopping list has been changed
            - when pantry items are about to go stale - this can be added also as a widget
            - when new recipe was added to "Want to cook" list
    Implementation key notes:
        - coding standards for frontend:
            - each page will sit in a directory under "pages" - directory name will be the page name (without Page suffix)
            - main page component name will have the Page suffix
            - all page hooks will be in /hooks from that page
            - all page components will be in /components from that page
            - the reusable app components will be created in an atomic components fashion (atoms, molecules etc.) and will be properly organized in folders
            - will have an own UI library based on Material UI - and a storybook (dont bother creating stories yet)
    Design: Read pocket-pantry-handoff/HANDOFF.md and build the app following it, using the files in design-source/ as the visual reference.
