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

```
$ mgit

Usage:
  mgit <command> [flags]

Commands:
  status  Shows the status of git repos in the CWD
  pull    Fetch and rebase each clean repo in the CWD

Flags:
      -v  Verbose.  Show detailed information.
      -b  Branch.  Show the currently checked out branch.
```

### Status ###
Perform a `git status` in all git repositories within your current working
directory.

```
$ mgit status [flags]
```

![Verbose status example](https://raw.github.com/cpsubrian/mgit/master/screenshots/status-v.png)


### Pull (rebase) ###
Perform a `git fetch` followed by at `git rebase` in all **clean** git
repositories within your current working directory.

```
$ mgit pull [flags]
```

![Verbose pull example](https://raw.github.com/cpsubrian/mgit/master/screenshots/pull-v.png)

### Checkout ###
Perform a `git checkout BRANCH_NAME` in all git repositories within your current
working directory.

```
$ mgit checkout BRANCH_NAME [flags]
```

Additions
---------
I would like this to be a useful tool for more than just myself.  Pull-requests
are welcome for new functionlity.

TODO
----
Tests.  Yeah, yeah ... I know.
