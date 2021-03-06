import * as bodyParser from "body-parser";
import { expect } from "chai";
import * as express from "express";
import "mocha";
import * as sinon from "sinon";
import * as request from "supertest";
import * as _ from "lodash";

import { AssetAddress, H256 } from "codechain-primitives/lib";
import { MintAsset } from "codechain-sdk/lib/core/classes";

import { IndexerContext } from "../../src/context";
import { createServer } from "../../src/server";
import * as Helper from "../helper";

describe("transaction-api", function() {
    let aliceAddress: AssetAddress;
    let bobAddress: string;
    let mintRubyTx: MintAsset;
    let mintEmeraldTx: MintAsset;
    let transferTxHash: H256;

    let context: IndexerContext;
    let app: express.Express;

    before(async function() {
        await Helper.resetDb();
        await Helper.runExample("import-test-account");
        await Helper.worker.sync();

        const shardId = 0;
        aliceAddress = await Helper.sdk.key.createAssetAddress();
        bobAddress = "tcaqyqckq0zgdxgpck6tjdg4qmp52p2vx3qaexqnegylk";

        const rubyAssetScheme = await Helper.sdk.core.createAssetScheme({
            shardId,
            metadata: JSON.stringify({
                name: "RubyTx",
                description: "An asset example",
                icon_url: "https://www.w3schools.com/tags/smiley.gif"
            }),
            supply: 10000
        });
        const emeraldAssetScheme = await Helper.sdk.core.createAssetScheme({
            shardId,
            metadata: JSON.stringify({
                name: "EmeraldTx",
                description: "An asset example",
                icon_url: "https://www.w3schools.com/tags/smiley.gif"
            }),
            supply: 10000
        });

        mintRubyTx = await Helper.sdk.core.createMintAssetTransaction({
            scheme: rubyAssetScheme,
            recipient: aliceAddress
        });

        const firstRuby = mintRubyTx.getMintedAsset();
        const transferTx = await Helper.sdk.core
            .createTransferAssetTransaction()
            .addInputs(firstRuby)
            .addOutputs(
                {
                    recipient: bobAddress,
                    quantity: 1000,
                    assetType: firstRuby.assetType,
                    shardId
                },
                {
                    recipient: bobAddress,
                    quantity: 2000,
                    assetType: firstRuby.assetType,
                    shardId
                },
                {
                    recipient: aliceAddress,
                    quantity: 7000,
                    assetType: firstRuby.assetType,
                    shardId
                }
            );
        await Helper.sdk.key.signTransactionInput(transferTx, 0);
        await Helper.sdk.rpc.chain.sendTransaction(mintRubyTx, {
            account: Helper.ACCOUNT_ADDRESS,
            passphrase: Helper.ACCOUNT_PASSPHRASE
        });
        transferTxHash = await Helper.sdk.rpc.chain.sendTransaction(
            transferTx,
            {
                account: Helper.ACCOUNT_ADDRESS,
                passphrase: Helper.ACCOUNT_PASSPHRASE
            }
        );

        await Helper.sdk.rpc.devel.stopSealing();
        mintEmeraldTx = await Helper.sdk.core.createMintAssetTransaction({
            scheme: emeraldAssetScheme,
            recipient: aliceAddress
        });

        mintEmeraldTx.getMintedAsset();
        await Helper.sdk.rpc.chain.sendTransaction(mintEmeraldTx, {
            account: Helper.ACCOUNT_ADDRESS,
            passphrase: Helper.ACCOUNT_PASSPHRASE
        });

        await Helper.worker.sync();

        const config = require("config");
        context = IndexerContext.newInstance(config);
        app = express().use(bodyParser.json(), createServer(context));
    });

    after(async function() {
        await Helper.sdk.rpc.devel.startSealing();
    });

    it("api /tx", async function() {
        await request(app)
            .get("/api/tx")
            .expect(200);
    });

    it("api /tx rpc fail", async function() {
        const getBestBlockNumberStub = sinon.stub(
            context.sdk.rpc.chain,
            "getBestBlockNumber"
        );
        getBestBlockNumberStub.rejects(Error("ECONNREFUSED"));
        await request(app)
            .get("/api/tx?sync=true")
            .expect(503);
        await request(app)
            .get("/api/tx?sync=false")
            .expect(200);
        await request(app)
            .get("/api/tx?sync=true")
            .expect(503);
        getBestBlockNumberStub.restore();
    });

    it("api /tx with assetType filter", async function() {
        const assetType = mintRubyTx.getMintedAsset().assetType;
        await request(app)
            .get(`/api/tx?assetType=${assetType}`)
            .expect(200)
            .expect(res => {
                const txs = JSON.parse(res.text).data;
                expect(txs.length).equal(2);

                const mintTx: any = _.filter(txs, tx => tx.mintAsset)[0];
                expect(mintTx.mintAsset.assetType).equals(assetType.toString());

                const transferTx: any = _.filter(
                    txs,
                    tx => tx.transferAsset
                )[0];
                expect(transferTx.transferAsset.inputs[0].assetType).equals(
                    assetType.toString()
                );
                expect(transferTx.transferAsset.outputs[0].assetType).equals(
                    assetType.toString()
                );
                expect(transferTx.transferAsset.outputs[1].assetType).equals(
                    assetType.toString()
                );
                expect(transferTx.transferAsset.outputs[2].assetType).equals(
                    assetType.toString()
                );
            });
    });

    it("api /tx with address filter", async function() {
        await request(app)
            .get(`/api/tx?address=${aliceAddress.value}`)
            .expect(200)
            .expect(res => {
                expect(Object.keys(JSON.parse(res.text).data).length).gte(2);
                const txs = JSON.parse(res.text).data;

                expect(txs.length).equals(2);

                const mintTx: any = _.filter(txs, tx => tx.mintAsset)[0];
                expect(mintTx.mintAsset.recipient).equals(
                    aliceAddress.toString()
                );

                const transferTx: any = _.filter(
                    txs,
                    tx => tx.transferAsset
                )[0];
                expect(transferTx.transferAsset.inputs[0].owner).equals(
                    aliceAddress.toString()
                );
                expect(transferTx.transferAsset.outputs[2].owner).equals(
                    aliceAddress.toString()
                );
            });
    });

    it("api /tx with both assetType and address filters", async function() {
        const assetType = mintRubyTx.getMintedAsset().assetType;
        await request(app)
            .get(`/api/tx?address=${aliceAddress.value}&assetType=${assetType}`)
            .expect(200)
            .expect(res => {
                expect(Object.keys(JSON.parse(res.text).data).length).gte(2);
                const txs = JSON.parse(res.text).data;

                expect(txs.length).equals(2);

                const mintTx: any = _.filter(txs, tx => tx.mintAsset)[0];
                expect(mintTx.mintAsset.recipient).equals(
                    aliceAddress.toString()
                );
                expect(mintTx.mintAsset.assetType).equals(assetType.toString());

                const transferTx: any = _.filter(
                    txs,
                    tx => tx.transferAsset
                )[0];
                expect(transferTx.transferAsset.inputs[0].owner).equals(
                    aliceAddress.toString()
                );
                expect(transferTx.transferAsset.outputs[2].owner).equals(
                    aliceAddress.toString()
                );
                expect(transferTx.transferAsset.inputs[0].assetType).equals(
                    assetType.toString()
                );
                expect(transferTx.transferAsset.outputs[0].assetType).equals(
                    assetType.toString()
                );
                expect(transferTx.transferAsset.outputs[1].assetType).equals(
                    assetType.toString()
                );
                expect(transferTx.transferAsset.outputs[2].assetType).equals(
                    assetType.toString()
                );
            });
    });

    it("api /tx/{hash}", async function() {
        await request(app)
            .get(`/api/tx/${transferTxHash}`)
            .expect(200);
    });

    it("api /pending-tx", async function() {
        const assetType = mintEmeraldTx.getMintedAsset().assetType;
        await request(app)
            .get(`/api/pending-tx`)
            .expect(200)
            .expect(res => {
                const txs = JSON.parse(res.text).data;
                expect(txs.length).equals(1);

                const mintAsset = txs[0].mintAsset;
                expect(mintAsset.recipient).equals(aliceAddress.toString());
                expect(mintAsset.assetType).equals(assetType.toString());
            });
    });

    it("api /pending-tx with args", async function() {
        const address = Helper.ACCOUNT_ADDRESS;
        const assetType = mintEmeraldTx.getMintedAsset().assetType;
        await request(app)
            .get(`/api/pending-tx?address=${address}`)
            .expect(200)
            .expect(res => {
                const txs = JSON.parse(res.text).data;
                expect(txs.length).equals(1);

                const mintAsset = txs[0].mintAsset;
                expect(mintAsset.recipient).equals(aliceAddress.toString());
                expect(mintAsset.assetType).equals(assetType.toString());
            });
    });
});
