import {validCustomer,type Customer} from "./customer-settings";
type CustomerStorage = Pick<Storage,"getItem"|"setItem">;
export function readCustomerSettings(storage:CustomerStorage):{customers:Customer[];selected:string}|null {
 const data=JSON.parse(storage.getItem("jin-customers")||"null");
 if(data===null)return null;
 if(!data||!Array.isArray(data.customers)||!data.customers.length||!data.customers.every(validCustomer))throw Error("고객 데이터 형식 오류");
 return data;
}
export function writeCustomerSettings(storage:CustomerStorage,customers:Customer[],selected:string){
 if(!customers.length||!customers.every(validCustomer)||!customers.some(c=>c.id===selected))throw Error("고객 설정을 확인해 주세요.");
 storage.setItem("jin-customers",JSON.stringify({customers,selected}));
}
