# Crypto Pass

A utility to create, store and retrieve PBKDF2-genereated passwords on a local machine.

## Install

```shell
npm install -g crypto-pass
```

## Usage
```shell

Usage: crypto-pass [options] [command]

  Commands:

    get [entry]
       retrieve password entry

    new [entry]
       create new password entry

    list
       list password entries

    meta [entry]
       output encryption metadata for password entry

    del [entry]
       delete password entry

    backup
       backup config file using sftp

    *
       output usage information


  Options:

    -h, --help           output usage information
    -V, --version        output the version number
    -c, --config <path>  configuration file path

```

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)