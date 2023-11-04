
# Lit.dev Windows Guide
## Setup

### Patch
Windows comes without [patch][patch-manual] but is included in allot of tools and probably already on your system.<br>
If you already have patch available then make sure you have it added to your PATH (Environment Variables)<br>

#### Getting patch
The simpliest way to get patch on your system is to install one of the package-managers,terminals etc from below
- [cygwin][install-cygwin]
- [msys2][install-msys2]
- [cmder][install-cmder]
- [git][install-git]

### Symlinks
Symlinks require admin access so will fail and return a EPERM error.<br>
There are two options 
- [setting security policy](https://superuser.com/questions/104845/permission-to-make-symbolic-links-in-windows-7)
- [enable developer mode](https://learn.microsoft.com/en-us/windows/apps/get-started/enable-your-device-for-development)
- [run your terminal as admin](https://www.thewindowsclub.com/how-to-run-command-prompt-as-an-administrator)

***Notes***<br>
option two comes with security risks, read trough carefully and if you don't fully understand use option one!<br>
option three only applies when your an admin and option one can't be used unless you remove the account from the admin group.


[install-cygwin]: https://cygwin.com/install.html
[install-msys2]: https://www.msys2.org/
[install-cmder]: https://cmder.app/
[install-git]: https://git-scm.com/download/win
[patch-manual]: https://www.unix.com/man-page/minix/1/patch/