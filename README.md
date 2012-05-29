Multi-Git
=========

Command-line tools for working with directories of git repositories.

About/Why?
----------
I'm working with a bunch of git repositories on a daily basis (who isn't). I
would like to be able to check their status and pull down changes without
having to `cd` all over the place.  Thus the birth of mgit.

Installation
------------
```
$ (sudo) npm install mgit -g
```

Usage
-----
For now mgit's functionality is VERY basic, but I may add more over time.

### Status ###
Perform a `git status` in all git repositories within your current working
directory.

```
$ mgit status
```

Additions
---------
I would like this to be a useful tool for more than just myself.  Pull-requests
are welcome for new functionlity.
