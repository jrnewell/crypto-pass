# Crypto Pass

A utility to create, store and retrieve salted PBKDF2-genereated passwords on a local machine.  Works well in combination with 7-Zip's AES-256 password-protect/encrypt archive feature to encrypt senstive documents with a strong password.

## Install

```shell
npm install -g crypto-pass
```

## Usage
```shell

  Usage: crypto-pass [options] [command]

  Commands:

    get [entry]
       retrieve a password from entry

    new [entry]
       create a new entry

    list
       list entries

    meta [entry]
       output encryption metadata for an entry

    del [entry]
       delete an entry

    backup
       backup config file using sftp

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
(crypto-pass): Strip base64 padding (=) off end of key:  (yes)
Storing data in /Users/james/.crypto-pass

Generated Key
------------------
Key: Sqptl2ey3U9HewTGKNmyc8QHuupuiBOvHnDBB+Oqdp4

Entry Metadata
------------------
Salt: qUutq5G6TSqs7IxdmLtFEg==
Key Length: 32
Iterations: 100000

$ crypto-pass get taxes
Retrieving password for entry taxes
(crypto-pass): Type in your password:

Generated Key
------------------
Key: Sqptl2ey3U9HewTGKNmyc8QHuupuiBOvHnDBB+Oqdp4

```

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)