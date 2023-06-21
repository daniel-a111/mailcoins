import { Order } from "../../src/contracts/order";
import { State } from "../../src/models";
import { storeState } from "../../src/models/states";

const sum = (a: number, b: number): number => {
    return a + b;
}

test('1123 1 + 2 to equal 3', async () => {

    const orderContract = new Order("1");
    console.log({ state: orderContract.state });
    await State.destroy({ where: {} });

    await storeState('project/123', {
        owner: 'test', test: 234
    });

    // describe("test", () => {
    expect(sum(1, 2)).toBe(3);
    // })
});