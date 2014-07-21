# Crypto Pass

A utility to create, store and retrieve PBKDF2-genereated/salted passwords on a local machine.

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

Default location for config file is $HOME/.crypto-pass

## Example

```shell

$ crypto-pass new taxes
Creating new password for entry taxes
(crypto-pass): Type in your password:
(crypto-pass): Retype in your password:
(crypto-pass): Length of generated key in bytes:  (32)
(crypto-pass): Number of iterations in PBKDF2:  (100000)
Storing data in /Users/james/.crypto-pass

Generated Key
------------------
Key: J75h758+ZO8eqjR5wyLCPMaf5TLAmJyGXrPP7dew16g=

Entry Metadata
------------------
Salt: jdg7z454u+QMhFzw5g8o9w==
Key Length: 32
Iterations: 100000

$ crypto-pass get taxes
Retrieving password for entry taxes
(crypto-pass): Type in your password:

Generated Key
------------------
Key: J75h758+ZO8eqjR5wyLCPMaf5TLAmJyGXrPP7dew16g=


```

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)