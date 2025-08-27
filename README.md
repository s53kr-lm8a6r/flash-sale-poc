# Flash Sale POC

this demonstrate flash sale system

## Architecture

![Architecture](./.doc/res/arch.png)

current demonstration are using in-memory db, and single-instance transaction handler for easier test

### Front End

front-end for ui, with realtime data update using ws

### Back End

main back-end service use ws to update info to FE, and consumes from kafka to update transaction

### Transaction

simulates single-instance ephemeral transaction handler, created once per sale and handles all transaction related requests to prevent back-end to be overwhelmed. updates transaction status via kafka.

in the real case, this service is managed by kubernetes and the backend to start and shutdown

this service will always sync to the backend to receive current data (according to the sale it handles)
source of truth are always the back end

### Payment (Dummy)

simulates payment gateway

additional implementation is needed to handle a throttled payment gw, for example using a time-based batching payment process in transaction
current not implemented

## Configuration

view from sample.env

run your own kafka instance

## Running

pnpm --filter frontend dev
pnpm --filter backend start:dev
pnpm --filter transaction start:dev
pnpm --filter payment start:dev

## Running Tests

load test
pnpm test:load
pnpm test:load:[scenario]

in large, error starting to show up with ~50% failure rate
which means a single sale should have multiple synchronized transaction handler to handle large surge
(implemented next time, since i don't have load balancer locally)
