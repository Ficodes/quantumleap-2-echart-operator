# QuantumLeap2Echart operator

The QuantumLeap2Echart operator is a [WireCloud operator](http://wirecloud.readthedocs.org/en/latest/) usable for
transform historical information from QuantumLeap into EChart options JSON in a simple way. 

Historical Information provided by [QuantumLeap server](https://quantumleap.readthedocs.io/en/latest/)

## Build

Be sure to have installed [Node.js](http://node.js). For example, you can install it on Ubuntu and Debian running the
following commands:

```console
curl -sL https://deb.nodesource.com/setup | sudo bash -
sudo apt-get install nodejs
sudo apt-get install npm
```

Install other npm dependencies by running:

```console
npm install
```

For build the operator you need download grunt:

```console
sudo npm install -g grunt-cli
```

And now, you can use grunt:

```console
grunt
```

If everything goes well, you will find a wgt file in the `dist` folder.

## Documentation

Documentation about how to use this operator is available on the [User Guide](src/doc/userguide.md). Anyway, you can
find general information about how to use operators on the
[WireCloud's User Guide](https://wirecloud.readthedocs.io/en/stable/user_guide/) available on Read the Docs.

## Copyright and License

Copyright (c) 2019 Future Internet Consulting and Development Solutions.
