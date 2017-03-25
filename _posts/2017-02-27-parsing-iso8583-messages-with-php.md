---
layout: post
title:  Parsing ISO-8583 messages with PHP
summary: Recently I've needed a PHP library to pack and unpack ISO-8583 formatted messages, but there seems to be very few around. I got frustrated, and so created my own.
---

I recently released an open-source PHP ISO-8583 pack/unpack library called [financial](https://github.com/kaperys/financial). This post is an introduction to the library and covers the basics of usage and integration.

## What is it?
Financial is a simple PHP pack/unpack library for parsing ISO-8583 formatted hexadecimal messages.

## What does it do?
The library allows the user to simply pack and unpack messages to and from 'schema' classes. A schema describes the fields contained in the message, their data types, display, length and more.

### Unpack
The user can unpack the message to the schema class then call methods on the schema to retrieve data from the message. The user can easily find which fields are set on the schema by calling `$schema->getSetFields()` this will return an array of the fields set. The library also returns a `MessageTypeIdentifier` class, which allows the user to easily identify the MTI (message type identifier) of the message. The `MessageTypeIdentifier` class has helpful methods such as `getClass()` and `getVersion()`.

### Pack
The user can pack the message by creating a new instance of the schema class and setting methods on it using the `SchemaManager`. The `SchemaManager` is responsible for validating the data to be set on the schema, as well as keeping track of the fields set on it. The `SchemaManager` can then be passed into the `MessagePacker` to be parsed to a hexadecimal ISO-8583 string.

## How do I use it?
The full documentation can be found on [GitHub](https://github.com/kaperys/financial/tree/master/doc).

### Unpacking
```php
$cacheManager = new CacheManager();
$cacheManager->generateSchemaCache(new ISO8583());

/** @var ISO8583 $schemaManager */
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
```php
$cacheManager = new CacheManager();
$cacheManager->generateSchemaCache(new ISO8583());

/** @var ISO8583 $schemaManager */
$schemaManager = new SchemaManager(new ISO8583(), $cacheManager);

$schemaManager->setCurrencyCodeCardholderBilling('GBP');
$schemaManager->setPrivateReserved6('Your topup was successful');

/** @var MessagePacker $message */
$message = (new Financial($cacheManager))->pack($schemaManager);

$message->setHeaderLength(2);
$message->setMti('0200');

echo $message->generate();
```
