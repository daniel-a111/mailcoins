import { getOrLoad } from "../../src/contracts/vm";
// import { Order } from "../../src/contracts/orders";

test('Contract Indexer', async () => {
    const vm = await getOrLoad();

    // vm.registerContractInterface({
    //     contract: 'order', deploy: () => { }, methods: {}
    // })
    // expect(indexer.genId()).toBe("1");
    // expect(indexer.genId()).toBe("2");
    // expect(indexer.genId()).toBe("3");
    // expect(indexer.genId()).toBe("4");
    // expect(indexer.genId()).toBe("5");
    // expect(indexer.genId()).toBe("6");


    // indexer.setDeployer("order", (id: string, calldata: any) => {
    //     return new Order(id, calldata);
    // });

    // const state: OrderState = {

    // }
    const order = vm.call("order", "deploy", { a: '123' });
    // 
});


// test('Contract Indexer ')