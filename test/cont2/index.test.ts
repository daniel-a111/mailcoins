import { getOrLoadIndexer } from "../../src/contracts/indexer";
// import { Order } from "../../src/contracts/orders";

test('Contract Indexer', async () => {
    const indexer = await getOrLoadIndexer();
    expect(indexer.genId()).toBe("1");
    expect(indexer.genId()).toBe("2");
    expect(indexer.genId()).toBe("3");
    expect(indexer.genId()).toBe("4");
    expect(indexer.genId()).toBe("5");
    expect(indexer.genId()).toBe("6");


    // indexer.setDeployer("order", (id: string, calldata: any) => {
    //     return new Order(id, calldata);
    // });

    const order = indexer.deploy("order", { a: '123' });

});


// test('Contract Indexer ')