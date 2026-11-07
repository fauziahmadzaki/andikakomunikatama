"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useCustomerStore } from "@/features/customers/store/customer-store";

export function useCustomerDetail(id: string) {
  const customers = useCustomerStore((state) => state.customers);
  const invoices = useCustomerStore((state) => state.invoices);
  const tickets = useCustomerStore((state) => state.tickets);
  const services = useCustomerStore((state) => state.services);
  const updateCustomer = useCustomerStore((state) => state.updateCustomer);
  const setStatus = useCustomerStore((state) => state.setStatus);
  const customer = customers.find((item) => item.id === id);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [form, setForm] = useState({
    fullName: customer?.fullName ?? "",
    phone: customer?.phone ?? "",
    email: customer?.email ?? "",
    address: customer?.address ?? "",
    city: customer?.city ?? "",
    province: customer?.province ?? "",
    notes: customer?.notes ?? "",
  });

  const customerInvoices = invoices.filter(
    (invoice) => invoice.customerId === id
  );
  const customerTickets = tickets.filter((ticket) => ticket.customerId === id);
  const customerServices = services.filter(
    (service) => service.customerId === id
  );

  function saveEdit() {
    if (!customer) {
      return;
    }
    updateCustomer(customer.id, form);
    toast.success("Data pelanggan diperbarui.");
    setEditOpen(false);
  }

  function confirmToggle() {
    if (!customer) {
      return;
    }
    const next = customer.status === "active" ? "inactive" : "active";
    setStatus(customer.id, next);
    toast.success(
      next === "active" ? "Pelanggan diaktifkan." : "Pelanggan dinonaktifkan."
    );
    setConfirmOpen(false);
  }

  return {
    customer,
    customerInvoices,
    customerTickets,
    customerServices,
    editOpen,
    setEditOpen,
    confirmOpen,
    setConfirmOpen,
    form,
    setForm,
    saveEdit,
    confirmToggle,
  };
}
