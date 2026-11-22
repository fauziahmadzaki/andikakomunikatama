import type { Branch } from "@/features/branches/data/branches";
import type { Customer } from "@/features/customers/data/types";
import type { Employee } from "@/features/users/data/employees";
import type {
  ServiceView,
  Subscription,
  SubscriptionService,
  SubscriptionView,
} from "./types";

export function buildSubscriptionView({
  subscription,
  customers,
  branches,
  plans,
  employees,
  outstanding,
}: {
  subscription: Subscription;
  customers: Customer[];
  branches: Branch[];
  plans: Array<{ id: string; name: string }>;
  employees: Employee[];
  outstanding: number;
}): SubscriptionView {
  return {
    ...subscription,
    customerName:
      customers.find((customer) => customer.id === subscription.customerId)
        ?.fullName ?? "Tanpa pelanggan",
    branchName:
      branches.find((branch) => branch.id === subscription.branchId)?.name ??
      "Tanpa cabang",
    planName:
      plans.find((plan) => plan.id === subscription.planId)?.name ?? "-",
    monthlyFee: subscription.priceSnapshot,
    salesName:
      employees.find((employee) => employee.id === subscription.salesEmployeeId)
        ?.fullName ?? "-",
    outstanding,
  };
}

export function buildServiceView({
  service,
  routers,
  olts,
  passiveDevices,
}: {
  service: SubscriptionService;
  routers: Array<{ id: string; name: string }>;
  olts: Array<{ id: string; name: string }>;
  passiveDevices: Array<{ id: string; code: string }>;
}): ServiceView {
  return {
    ...service,
    routerName:
      routers.find((router) => router.id === service.routerId)?.name ?? "-",
    oltName: olts.find((olt) => olt.id === service.oltId)?.name ?? "-",
    odpCode:
      passiveDevices.find((device) => device.id === service.passiveDeviceId)
        ?.code ?? "-",
  };
}
