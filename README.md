# Git Escape Room

The vault is locked behind a 3-digit code. Your clues are scattered through
Git history and across branches. Use Git commands to track them down—no
guessing required!

## Find the clues

1. **Recover the first clue from history.** The evidence was deleted, but Git
   remembers it. Inspect the history with `git log --all --oneline -- clue1.txt`
   and use `git show <commit>:clue1.txt` with the earlier commit that added the
   file.
2. **Explore the hidden branch.** List every branch with `git branch -a`, then
   switch to `secret-room` with `git switch secret-room`. Look for the note
   there. If Git has not created a local branch yet, use
   `git switch --track origin/secret-room`.
3. **Merge the final clue into main.** Switch back with `git switch main`, then
   run `git merge final-clue` and inspect the newly added file. If needed, first
   create a local tracking branch with
   `git switch --track origin/final-clue`, then switch back to `main`.

Put the three digits together in order to unlock the vault. Happy sleuthing!
