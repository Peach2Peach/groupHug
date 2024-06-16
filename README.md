# GroupHug Server

Batching server that allows combining PSBT into a single batched transaction.

The PSBTs have to be payouts in full (ie no change). Otherwise, the change output can be stolen.
In other words, only PSBTs with 1 input and 1 output are accepted.
The PSBT inputs have to be signed with SINGLE|ANYONECANPAY sig hash.

The batching server collects all PSBTs and attemps a batch after at least 24 hours. Then all PSBTs are combined, an extra fee output is added and each input is signed by the server with the default ALL sig hash.

The additional output is the 2% service fee. A batch happens, when this service fee meets a mininmum amount threshold, but at most after 1 week.
The mining fee used by the batching server is the halfHourFee and is paid using the diff between input and output + service fee.
PSBTs are sorted by their density `serviceFees / ( 1 / feeRate )` and then are attempted to be batched in descending order. If a PSBT would cause the bucket to drop below the minimum mining fee rate, it is skipped.

PSBTs can always be revoked by the user, using the revocation token.

## API Docs:

https://docs.peachbitcoin.com/grouphug

## Prerequisites

### redis

Follow the [redis installation guide](https://redis.io/topics/quickstart) until set authentication via `requirepass`

## Installation

`npm install`

Copy `.env.dist` to `.env`
Fill in the missing values

### environment variables in `.env`

- `NODE_ENV`: `development` or `production`
- `NETWORK`: `testnet|regtest|bitcoin`
- `PORT`: port to listen to for incoming requests (default: `8080`)

- `PASSWORDPROTECTION`: whether to use server password to encrypt sensitive information

The following are used to connect to the database

- `DB_AUTH`: redis password you set earlier via `CONFIG SET requirepass "mypassword"` (recommend to use `PASSWORDPROTECTION=true`!)
- `DB_HOST`: ip, url to database (default: `localhost`)
- `DB_PORT`: port to database (default: `6379`)

- `BATCH_TIME_THRESHOLD`: minimum time in seconds before a batch is attempted (default `86400`)
- `BATCH_EXPIRATION_TIME`: maximum time in seconds before a batch will be completed (default `604800`)
- `FEE`: the fees we take for our service (default `0.02`)

Multisig related variables

- `PRIVKEY`: private key for co-signing transactions (recommend to use `PASSWORDPROTECTION=true`!)
- `OLD_PRIVKEY`: old private key for co-signing transactions (recommend to use `PASSWORDPROTECTION=true`!)
- `FEE_COLLECTOR_PUBKEY`: public key to derive addresses for fee collection (recommend to use `PASSWORDPROTECTION=true`!)

- `MAXREQUESTRATE`: how many requests per IP address per second (default: `1000`)

- `BLOCKEXPLORERURL`: the blockexplorer used in the background (default: `http://127.0.0.1:3002`)
- `MEMPOOL_URL`: used for getting fee estimates (default: `https://mempool.space/api`)

The following are used to set the loglevels of various log categories (see code for which categories exist)

- `LOGLEVEL_DEBUG`: comma separated list of debug log categories
- `LOGLEVEL_INFO`: comma separated list of info log categories
- `LOGLEVEL_HTTP`: comma separated list of http log categories
- `LOGLEVEL_WARN`: comma separated list of warn log categories
- `LOGLEVEL_ERROR`: comma separated list of error log categories

The following are used for regtest

- `BITCOINRPCURL`: url to bitcoin core rpc (default `127.0.0.1`)
- `BITCOINRPCPORT`: port to bitcoin core rpc (default `18443`)
- `BITCOINRPCUSER`: user for bitcoin core rpc (default `grouphugreg`)
- `BITCOINRPCPASS`: password for bitcoin core rpc (default `grouphugreg`)

### Multisig

Some transactions require the batching service to co-sign transactions. For this we need to keep private keys on the server. It's strongly recommend to use a server password to encrypt the master private key.

There are 2 configurations for the escrow:

- `PRIVKEY`: use the main xpriv from derivation path `m`
- `FEE_COLLECTOR_PUBKEY`: use the xpub from derivation path `m/84'/0'/0'`

## Starting development

`npm run start:dev`

## Testing

### Run unit tests

`npm run test`

### Run integration tests

Run regtest-server
`docker run -d -p 8082:8080 junderw/bitcoinjs-regtest-server`

Now you can run the integration tests
`npm run integration`

# Running bitcoin regtest + electrs

## Install and run Bitcoin Core

1. Get and install latest bitcoin core release from https://bitcoincore.org/en/download/

⚠️ Verify bitcoin core before installation, follow the verification guide on the download page.

2. configure bitcoin.conf to reflect your environment
   You can find an [example file for regtest here](prefs/bitcoin/regtest/bitcoin.conf).

3. Setup bitcoind as a service to ensure that bitcoin core is running automatically even after restarts

`sudo nano /etc/systemd/system/bitcoin.service`

and copy the contents you can find [here](prefs/bitcoin/bitcoin.service) and replace user and path to `bitcoind` and the `.bitcoin` folder as required

4. start and enable the service
   `sudo systemctl start bitcoin.service`

`sudo systemctl enable bitcoin.service`

## Install and run electrs

1. Get and install [blockstream electrs](https://github.com/Blockstream/electrs)

```
git clone https://github.com/blockstream/electrs && cd electrs
git checkout new-index
cargo install --bin electrs --path .
sudo mv target/release/electrs /usr/local/bin
```

2. Setup electrs as a service to ensure that electrs is running automatically even after restarts

`sudo nano /etc/systemd/system/electrs.service`

and copy the contents you can find [here](prefs/electrs/regtest/electrs.service) and replace user and path to `.bitcoin` folder as required

3. start and enable the service

`sudo systemctl start electrs.service`

`sudo systemctl enable electrs.service`

## Run server

1. build server

`npm run build`

2. Copy `.env.dist` to `dist/.env` and add the missing values

3. Setup GroupHug as a service to ensure that it is running automatically even after restarts

`sudo nano /etc/systemd/system/group-hug.service`

and copy the contents you can find [here](prefs/group-hug.service) and replace user and path to `dist/server.js` folder as required

4. start and enable the service

`sudo systemctl start group-hug.service`

`sudo systemctl enable group-hug.service`

## Run server via nginx

1. Make sure you have nginx running

2. `sudo cp prefs/nginx/group-hug.conf /etc/nginx/conf.d/`

3. `sudo nginx -s reload`

# Debugging

See logs of

#### bitcoin

`sudo journalctl -u bitcoin.service -f`

#### Electrs

`sudo journalctl -u electrs.service -f`

### Troubleshooting electrs

If you are running on regtest you might need to kickstart the process. This can be simply done by generating a few blocks

```
$ bitcoin-cli getnewaddress
bcrt1qndj6vyt9dqcj8y9c0mfsyg759pv4set4rfanjr

$ bitcoin-cli generatetoaddress 1 bcrt1qndj6vyt9dqcj8y9c0mfsyg759pv4set4rfanjr
[
  "3608f15fce28d244441ff389db49638a2d5e17358f3e3e37518e662dc31e0d9e"
]
```
