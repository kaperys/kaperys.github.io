---
layout: post
title:  Parsing ISO8583:1987 messages with PHP
summary: Recently I needed a PHP library capable of packing and unpacking ISO8583:1987 formatted messages, but there seems to be very few around, so I created my own.
---

Recently I needed a PHP library capable of parsing ISO8583:1987 formatted messages and quickly found that there aren't many around. I needed something which could accept a hexadecimal ISO8583:1987 message, and give me back some kind of Transaction representation. I ended up releasing my own library called [financial](https://github.com/kaperys/financial).

## What is it?

Financial is an open source ISO8583:1987 parsing library for PHP capable of reading and writing transaction messages.

## What does it do?

Financial allows you to pack and unpack messages to and from 'schema' classes. A schema describes the fields present in the message, their data types, display, length and more. Using a schema is how you can interact with the transaction message.

### Unpacking
You can unpack the message to a schema class and then call methods on the schema to retrieve data from the message. You can easily discover which fields are set on the schema by calling `$schema->getSetFields()`. This will return an array of the fields set. Financial also returns a `MessageTypeIdentifier` class, which allows you to identify the MTI (message type identifier) of the message. The `MessageTypeIdentifier` class has helpful methods such as `getClass()` and `getVersion()`.

#### Example
```php
$cacheManager = new CacheManager();
$cacheManager->generateSchemaCache(new ISO8583());

/** @var ISO8583|SchemaManager $schemaManager */
$schemaManager = new SchemaManager(new ISO8583(), $cacheManager);

/** @var MessageUnpacker $message */
$message = (new Financial($cacheManager))->unpack($schemaManager);

$message->setHeaderLength(2);
$parsedMessage = $message->parse("012430323030f23e4491a8e08020000000000000002031362a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a303030303030303030303030303031303030313231323134353430383030303030393134353430383132313231373033313231333030303039303230304330303030303030303036303030303230303630303030323033372a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a504652333437303030303039323837353937353830303030303030303030333039333733303134373430342054657374204167656e74203220204861746669656c64202020202048654742383236303238303030303030323136317c303030307c504652333437303030303039303135353630313031323634303243313031");

/** @var ISO8583 $schema */
$schema = $parsedMessage->getParsedSchema();

echo $parsedMessage->getMti();
echo $schema->getCardAcceptorNameLocation();
```

### Packing
You can pack the message by creating a new instance of the schema class and setting methods on it using the `SchemaManager`. The `SchemaManager` can then be passed into the `MessagePacker` class and parsed to an ISO8583:1987 hexadecimal string.


#### Example
```php
$cacheManager = new CacheManager();
$cacheManager->generateSchemaCache(new ISO8583());

/** @var ISO8583|SchemaManager $schemaManager */
$schemaManager = new SchemaManager(new ISO8583(), $cacheManager);

$schemaManager->setCurrencyCodeCardholderBilling('GBP');
$schemaManager->setPrivateReserved6('Your topup was successful');

/** @var MessagePacker $message */
$message = (new Financial($cacheManager))->pack($schemaManager);

$message->setHeaderLength(2);
$message->setMti('0200');

echo $message->generate();
```
