# My Port Forward
![Usage example](https://cdn.codetunnel.net/mpf/mpf-up.gif)

MPF allows you to create Kubernetes port-forward groups and start them with a single command like shown above.

## Usage
Create a port-forward group with:
```shell
mpf create <name>
```
You'll be prompted for the namespace, service and ports.

---

And start the port-forward group with:
```shell
mpf up <name>
```


## Installation

### On any system using NPM

If you have NodeJS installed on version 12 or higher, you can install MPF with:
```shell
npm i -g my-port-forward
```

Alternatively, **you might need `sudo` for Linux or MacOS**:
```shell
sudo npm i -g my-port-forward
```

Check the installation with the `--help` flag:
```shell
$ mpf --help
Usage: mpf [options] [command]

Options:
  -V, --version        output the version number
  -h, --help           display help for command

Commands:
  list                 Lists all port-forward groups
  get <name>           Lists all port-forwards of a group
  delete <name>        Deletes a port-forward group
  create <name>        Creates a port-forward group
  up [options] <name>  Runs a port-forward group
  help [command]       display help for command
```

### Linux and MacOS using installer

If you don't have NodeJS installed, you can install MPF with:

```shell
curl -sfL https://cdt.one/mpf.sh | sudo sh -
```

### On any system manually

You can also install MPF by copying it's binary to your PATH. There are the download links:

- **Linux**: [https://cdn.codetunnel.net/mpf/mpf-linux](https://cdn.codetunnel.net/mpf/mpf-linux)
- **MacOS**: [https://cdn.codetunnel.net/mpf/mpf-macos](https://cdn.codetunnel.net/mpf/mpf-macos)
- **Windows**: [https://cdn.codetunnel.net/mpf/mpf-win.exe](https://cdn.codetunnel.net/mpf/mpf-win.exe)
