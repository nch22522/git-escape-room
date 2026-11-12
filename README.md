# Git Escape Room

Crack the vault by recovering clues from Git history, exploring a hidden
branch, and merging the final clue. The interactive vault is a standalone
HTML/CSS/JavaScript app with no external dependencies.

## Start the escape room

Open `index.html` directly in your browser (double-click the file). Keep it
open while you work through the missions; after the final merge, the last
status light will automatically detect the new clue file.

## Your three Git missions

1. **Search the archive for digit one.** The clue was deleted, but its commit
   remains in history. Find it with
   `git log --all --oneline -- clue1.txt`, then inspect the earlier commit
   that added it with `git show <commit>:clue1.txt`.
2. **Explore `secret-room` for digit two.** Run `git branch -a`, then switch
   to the hidden branch with `git switch secret-room`. Open `secret-panel.html`
   (or inspect `hidden_note.txt`) to reveal its clue. If Git has not created a
   local branch, use `git switch --track origin/secret-room`.
3. **Merge `final-clue` for digit three.** Return to `main` with
   `git switch main`, then run `git merge final-clue`. If the branch is only
   listed as `origin/final-clue`, first run
   `git switch --track origin/final-clue`, then switch back to `main` and merge.
   The merge adds `clue3.js`; the vault detects it and lights the final LED.

Enter the three digits in order on the keypad. Keyboard digits, Backspace,
Enter, and Escape work too. Unlock the vault to earn your Git Master
Certificate. Happy sleuthing!
