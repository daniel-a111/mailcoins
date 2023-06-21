// import { Agency, Client, Order, Project } from '../models';
// import { sendMail } from '../services/email';

// export const initContracts = async () => {

//     const vm = await getOrLoad();

//     // vm.registerContractInterface({
//     //     contract: CONTRACTS.AGENCIES_MANAGER,
//     //     deploy: contracts.agencies_manager.deploy,
//     //     methods: {
//     //         add: contracts.agencies_manager.add,
//     //         list: contracts.agencies_manager.list,
//     //     }
//     // });


//     vm.handleEvent(EVENTS.AGENCIES_MANAGER_DEPLOYED, async (vm: VM) => {
//         // await 
//     });

//     vm.handleEvent(EVENTS.AGENCY_ADDED, async (vm: VM, addr: string, name: string, data: any) => {

//         // await 
//         console.log({ data });
//         await Agency.bind(vm).create({ ...data, maxUsers: data.maxMembers, id: data.addr.substring(data.addr.indexOf('/') + 1) });
//     });


//     vm.handleEvent('Order Locked', async (vm: VM, addr: string, name: string, data: any) => {

//         console.log({ addr, data });

//         const order: any = await Order.bind(vm).findByPk(addr, { raw: true });
//         const client: any = await Client.bind(vm).findByPk(order.clientId, { raw: true });
//         console.log({ order, client });
//         try {
//             await sendMail(
//                 client.email,
//                 "Order processing",
//                 `go to <a href="http://165.22.75.3:8080/#/projects/${order.projectId}/orders/${addr}/view">order view</a>`
//             );
//             await EmailMessage.create({
//                 to: client.email,
//                 message: `go to [/projects/${order.projectId}/orders/${addr}/view]`
//             });
//         } catch (a: any) {
//             logger.error(a.message);
//         }
//     });


//     // vm.registerContractInterface({
//     //     contract: CONTRACTS.AGENCY,
//     //     deploy: contracts.agency.deploy,
//     //     methods: {
//     //         ['add_project']: contracts.agency.addProject,
//     //         ['list_projects']: contracts.agency.listProjects
//     //     }
//     // });

//     // vm.registerContractInterface({
//     //     contract: CONTRACTS.PROJECT,
//     //     deploy: contracts.project.deploy,
//     //     methods: {
//     //         ['import_rooms']: contracts.project.importRooms,
//     //         // ['list_projects']: contracts.agency.listProjects
//     //     }
//     // });


//     // vm.registerContractInterface({
//     //     contract: CONTRACTS.ROOM,
//     //     deploy: contracts.project.deploy,
//     //     methods: {
//     //         ['import_rooms']: contracts.project.importRooms,
//     //         // ['list_projects']: contracts.agency.listProjects
//     //     }
//     // });
//     //
//     vm.handleEvent(EVENTS.PROJECT_ADDED, async (vm: VM, addr: string, name: string, data: any) => {
//         console.log({ data });
//         await Project.bind(undefined).create({ ...data, id: data.addr.substring(data.addr.indexOf('/') + 1) });
//     });

//     // vm.registerContractInterface({
//     //     contract: CONTRACTS.USERS_MANAGER,
//     //     deploy: contracts.users_indexer.deploy,
//     //     methods: {
//     //         add: contracts.users_indexer.add
//     //     }
//     // });

//     vm.handleEvent(EVENTS.USER_INVITED, async (vm: VM, contract: string, event: string, { name, email }: any) => {

//         console.log('INVITE');
//         // const id = await (await getOrLoadIndexer()).genId();

//         // await Account.create({ id, name, email });
//         // console.log({ contract, event, data });
//         // sendMail();

//     });



// }