"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useBranchStore } from "@/features/branches/store/branch-store";
import type {
  InventoryItem,
  InventoryStatus,
  MovementType,
} from "@/features/network/data/types";
import { useNetworkStore } from "@/features/network/store/network-store";
import { useUsersStore } from "@/features/users/store/users-store";

export function useInventoryPage() {
  const inventory = useNetworkStore((state) => state.inventory);
  const movements = useNetworkStore((state) => state.movements);
  const addInventoryItem = useNetworkStore((state) => state.addInventoryItem);
  const addMovement = useNetworkStore((state) => state.addMovement);
  const installItem = useNetworkStore((state) => state.installItem);
  const returnItem = useNetworkStore((state) => state.returnItem);
  const branches = useBranchStore((state) => state.branches);
  const employees = useUsersStore((state) => state.employees);
  const [query, setQuery] = useState("");
  const [itemOpen, setItemOpen] = useState(false);
  const [movementItem, setMovementItem] = useState<InventoryItem | null>(null);
  const [itemForm, setItemForm] = useState({
    sku: "",
    name: "",
    category: "ONU",
    serialNumber: "",
    mac: "",
    branchId: branches[0]?.id ?? "br-jkt",
    status: "in_stock" as InventoryStatus,
    purchasePrice: "0",
    purchasedAt: new Date().toISOString().slice(0, 10),
    notes: "",
  });
  const [movementForm, setMovementForm] = useState({
    type: "transfer" as MovementType,
    reference: "",
    fromBranchId: branches[0]?.id ?? "br-jkt",
    toBranchId: branches[0]?.id ?? "br-jkt",
    employeeId: employees[0]?.id ?? "",
    notes: "",
  });

  const filtered = inventory.filter((item) =>
    `${item.sku} ${item.name} ${item.serialNumber}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  function saveItem() {
    if (
      !itemForm.sku.trim() ||
      !itemForm.name.trim() ||
      !itemForm.serialNumber.trim()
    ) {
      toast.error("SKU, nama, dan serial number wajib diisi.");
      return;
    }
    addInventoryItem({
      sku: itemForm.sku,
      name: itemForm.name,
      category: itemForm.category,
      serialNumber: itemForm.serialNumber,
      mac: itemForm.mac || undefined,
      branchId: itemForm.branchId,
      status: itemForm.status,
      purchasePrice: Number(itemForm.purchasePrice),
      purchasedAt: itemForm.purchasedAt,
      notes: itemForm.notes || undefined,
    });
    toast.success("Inventaris ditambahkan.");
    setItemOpen(false);
  }

  function saveMovement() {
    if (!movementItem) {
      return;
    }
    addMovement({
      inventoryItemId: movementItem.id,
      type: movementForm.type,
      reference: movementForm.reference || "-",
      fromBranchId: movementForm.fromBranchId,
      toBranchId: movementForm.toBranchId,
      employeeId: movementForm.employeeId || undefined,
      notes: movementForm.notes,
    });
    toast.success("Movement inventaris dicatat.");
    setMovementItem(null);
  }

  function install(item: InventoryItem) {
    installItem(item.id, `SUB-${item.serialNumber}`);
    toast.success("Perangkat ditandai terpasang.");
  }

  function returnDevice(item: InventoryItem) {
    returnItem(item.id, `RET-${item.serialNumber}`);
    toast.success("Perangkat ditandai dikembalikan.");
  }

  return {
    inventory: filtered,
    movements,
    query,
    setQuery,
    branches,
    employees,
    itemOpen,
    setItemOpen,
    itemForm,
    setItemForm,
    movementItem,
    setMovementItem,
    movementForm,
    setMovementForm,
    saveItem,
    saveMovement,
    install,
    returnDevice,
  };
}
